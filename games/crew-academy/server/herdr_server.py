"""Tvijo game gateway for a staging VM. Launch from the project root.

    python -m uvicorn server.herdr_server:app --host 127.0.0.1 --port 8080
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import os
import sqlite3
import uuid
from contextlib import asynccontextmanager, closing
from pathlib import Path
from typing import Awaitable, Callable

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parents[1]
DEADLINE = 2.5
EVENTS = frozenset(
    "open_map mic_click command_sent task_done dependency_done crosscheck "
    "voice_command field_start capsule workshop_open world_created "
    "out_of_credits wallet_open buy_click demo_refill shift_hq shift_enter shift_bridge shift_capsule "
    "beacon_share_open beacon_invite_open beacon_pair_accept".split()
)
# The prototype accepts only one of these reviewed lines from an optional narrator.
NUDGES = {
    "verify": "Попроси второго агента подтвердить результат.",
    "parallel": "Посмотри на развилку: два независимых шага можно поручить разным героям.",
    "next": "Закрой доступный шаг и передай его результат следующему исполнителю.",
}
Narrator = Callable[[str], Awaitable[str]]


class Rules:
    """A single warm, fixed scene engine per application process."""

    def __init__(self):
        self.process = None
        self.lock = asyncio.Lock()

    async def close(self):
        proc, self.process = self.process, None
        if proc is not None and proc.returncode is None:
            try:
                proc.kill()
            except ProcessLookupError:
                pass
            await proc.wait()

    async def run(self, data):
        async with self.lock:
            if self.process is None or self.process.returncode is not None:
                self.process = await asyncio.create_subprocess_exec(
                    "node", str(ROOT / "server/rules-worker.mjs"),
                    stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE,
                )
            try:
                self.process.stdin.write(json.dumps(data, ensure_ascii=False).encode() + b"\n")
                await self.process.stdin.drain()
                response = await self.process.stdout.readline()
                result = json.loads(response)
            except BaseException:
                # A partial exchange must never be reused as the next player's answer.
                await self.close()
                raise
            if result.get("error"):
                raise HTTPException(422, "invalid_order")
            return result


class Records:
    def __init__(self, path: Path):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.path = path
        with closing(self.connect()) as c:
            c.execute("PRAGMA journal_mode = WAL")
            c.executescript("""
                CREATE TABLE IF NOT EXISTS reply_cache
                    (id TEXT PRIMARY KEY, reply TEXT NOT NULL, created INTEGER NOT NULL);
                CREATE INDEX IF NOT EXISTS cache_age ON reply_cache(created);
                CREATE TABLE IF NOT EXISTS crew_pilot_first
                    (session_id TEXT, event TEXT, seconds INTEGER, day TEXT,
                     PRIMARY KEY (session_id,event));
            """)
            c.commit()

    def connect(self):
        return sqlite3.connect(self.path, timeout=1)

    def get(self, key):
        with closing(self.connect()) as c:
            row = c.execute("SELECT reply FROM reply_cache WHERE id=?", (key,)).fetchone()
        return json.loads(row[0]) if row else None

    def put(self, key, reply):
        with closing(self.connect()) as c, c:
            c.execute("INSERT OR IGNORE INTO reply_cache VALUES (?,?,unixepoch())",
                      (key, json.dumps(reply, ensure_ascii=False)))
            c.execute("DELETE FROM reply_cache WHERE id IN (SELECT id FROM reply_cache "
                      "ORDER BY created DESC, rowid DESC LIMIT -1 OFFSET 1024)")

    def record(self, session, event, seconds):
        with closing(self.connect()) as c, c:
            c.execute("INSERT OR IGNORE INTO crew_pilot_first VALUES (?,?,?,date('now'))",
                      (session, event, seconds))

    def report(self, session):
        with closing(self.connect()) as c:
            rows = c.execute("SELECT event,seconds FROM crew_pilot_first WHERE session_id=? "
                             "ORDER BY seconds,event", (session,)).fetchall()
        return [{"event": key, "seconds": value} for key, value in rows]


async def body(req: Request):
    if req.headers.get("sec-fetch-site") == "cross-site":
        raise HTTPException(403, "origin")
    origin = req.headers.get("origin")
    if origin and origin != str(req.base_url).rstrip("/"):
        raise HTTPException(403, "origin")
    if req.headers.get("content-type", "").split(";")[0] != "application/json":
        raise HTTPException(415, "json_required")
    raw = bytearray()
    async for part in req.stream():
        raw.extend(part)
        if len(raw) > 4096:
            raise HTTPException(413, "too_large")
    try:
        data = json.loads(raw)
    except (ValueError, UnicodeDecodeError):
        raise HTTPException(400, "invalid_json")
    if not isinstance(data, dict):
        raise HTTPException(422, "object_required")
    return data


def session_id(req):
    try:
        return str(uuid.UUID(req.cookies.get("crew_pilot", "")))
    except ValueError:
        return None


def build_app(database: Path | None = None, narrator: Narrator | None = None):
    database = database or Path(os.environ.get("TVIJO_GAME_DB", "var/tvijo-game.sqlite3"))
    rules = Rules()
    @asynccontextmanager
    async def lifecycle(app):
        app.state.records = Records(database)
        try:
            yield
        finally:
            await rules.close()

    app = FastAPI(title="Бортовой компьютер Tvijo", lifespan=lifecycle, docs_url=None, redoc_url=None, openapi_url=None)

    @app.get("/api/herdr/health")
    async def health():
        return {"engine": "crew-demo-1", "billing": "demo", "analytics": True,
                "narrator_adapter": narrator is not None}

    @app.post("/api/herdr/turn")
    async def turn(req: Request):
        candidate = await body(req)
        # Store only validated scene semantics and curated replies, shared by equivalent intents.
        records = app.state.records
        try:
            async with asyncio.timeout(DEADLINE):
                result = await rules.run(candidate)
                reply = result["reply"]
                cache_context = {"version": 1, "adapter": narrator is not None, **candidate}
                key = hashlib.sha256(json.dumps(cache_context, sort_keys=True).encode()).hexdigest()
                cached = await asyncio.to_thread(records.get, key)
                if cached is not None:
                    return {"engine":"crew-demo-1","source":"cache","reply":cached,"real_charge":0}
                source = "rules"
                if narrator and candidate["tier"] != "standard" and reply["changes"]:
                    # No player text, voices, account IDs or client prompts enter the trusted context.
                    prompt = ("Ты — бортовой ИИ Tvijo. Выбери одну карточку: verify, parallel, next. "
                              "Учитывай подтверждённые зависимости и пять последних приказов.\n"
                              + json.dumps(result["digest"], ensure_ascii=False))
                    try:
                        key_name = await narrator(prompt)
                        if key_name not in NUDGES:
                            raise ValueError("unknown_nudge")
                        reply["lines"].append({"who":"tvijo","text":NUDGES[key_name]})
                        source = "narrator"
                    except Exception:
                        source = "fallback"
                if source != "fallback":
                    await asyncio.to_thread(records.put, key, reply)
                return {"engine":"crew-demo-1","source":source,"reply":reply,"real_charge":0}
        except TimeoutError:
            if "reply" in locals():
                return {"engine":"crew-demo-1","source":"fallback","reply":reply,"real_charge":0}
            raise HTTPException(503,"use_local_free_fallback")
        except (OSError, sqlite3.Error):
            raise HTTPException(503,"use_local_free_fallback")

    @app.post("/api/herdr/event")
    async def event(req: Request):
        data = await body(req)
        if (set(data) != {"event","seconds"} or not isinstance(data["event"],str)
                or data["event"] not in EVENTS or type(data["seconds"]) is not int
                or not 0 <= data["seconds"] <= 86400):
            raise HTTPException(422, "invalid_event")
        sid = session_id(req) or str(uuid.uuid4())
        await asyncio.to_thread(app.state.records.record, sid, data["event"], data["seconds"])
        response = JSONResponse({"recorded":True}, headers={"Cache-Control":"no-store"})
        response.set_cookie("crew_pilot", sid, secure=True, httponly=True, samesite="lax", path="/api/herdr")
        return response

    @app.get("/api/herdr/parent-report/me")
    async def report(req: Request):
        sid = session_id(req)
        data = await asyncio.to_thread(app.state.records.report, sid) if sid else []
        return JSONResponse({"first_events":data}, headers={"Cache-Control":"no-store"})

    app.mount("/", StaticFiles(directory=ROOT / "web", html=True), name="game")
    return app


app = build_app()
