"""Serve the game's D1 statement interface on one durable SQLite connection."""
import hashlib
import json
import sqlite3
import sys
from pathlib import Path


def migrate(db):
    directory = Path(__file__).resolve().parents[1] / "drizzle"
    db.execute("BEGIN IMMEDIATE")
    try:
        db.execute("CREATE TABLE IF NOT EXISTS academy_migrations (name TEXT PRIMARY KEY, digest TEXT NOT NULL)")
        applied = dict(db.execute("SELECT name, digest FROM academy_migrations"))
        files = {p.name: p for p in sorted(directory.glob("*.sql"))}
        if not files or applied.keys() - files.keys():
            raise RuntimeError("Incompatible Academy migration history")
        for name, path in files.items():
            data = path.read_bytes()
            digest = hashlib.sha256(data).hexdigest()
            if name in applied:
                if applied[name] != digest:
                    raise RuntimeError("Modified Academy migration: " + name)
                continue
            for statement in data.decode().split("--> statement-breakpoint"):
                if statement.strip():
                    db.execute(statement)
            db.execute("INSERT INTO academy_migrations VALUES (?, ?)", (name, digest))
        db.commit()
    except Exception:
        db.rollback()
        raise


def execute(db, packet):
    # A D1 batch commits all its statements together, including conditional seat claims.
    if packet["batch"]:
        db.execute("BEGIN IMMEDIATE")
    try:
        results = []
        for sql, args in packet["statements"]:
            cursor = db.execute(sql, args)
            results.append({"results": [dict(row) for row in cursor]})
        if packet["batch"]:
            db.commit()
        return results
    except Exception:
        if db.in_transaction:
            db.rollback()
        raise


def main():
    with sqlite3.connect(sys.argv[1], isolation_level=None, timeout=5) as db:
        db.execute("PRAGMA journal_mode=WAL")
        db.execute("PRAGMA foreign_keys=ON")
        migrate(db)
        db.row_factory = sqlite3.Row
        print(json.dumps({"ready": True}), flush=True)
        for line in sys.stdin:
            packet = json.loads(line)
            try:
                response = {"id": packet["id"], "results": execute(db, packet)}
            except sqlite3.Error as error:
                response = {"id": packet["id"], "error": error.sqlite_errorname}
            print(json.dumps(response, separators=(",", ":")), flush=True)


if __name__ == "__main__":
    main()
