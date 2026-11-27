"""tvijor, a local game-development pipeline. Standard library, no model credentials."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timezone

from report import render_report

HERE = Path(__file__).resolve().parent
GAME = HERE.parent
REGISTRY = json.loads((HERE / "studio.json").read_text())
BASE = json.loads((HERE / "baseline.json").read_text())["files"]
SRC_DIRS = ("web", "server", "drizzle", "tools", "tests")
SRC_FILES = ("package.json", ".openai/hosting.json")
DEVICES = {"iphone-safari", "android-chrome", "desktop", "mobile-emulator"}
INPUTS = {"touch", "keyboard", "voice"}
SKIP_DIRS = {"node_modules", "__pycache__", ".venv", "dist", ".git", "var"}
MODES = {"local", "agent", "human"}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def timestamp():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def save_json(path, value):
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def snapshot(directory=GAME):
    """Hash the game actually played, equally in a Git worktree or a RemDesk copy."""
    paths = [directory / p for p in SRC_FILES]
    paths += [directory / p for p in ("package-lock.json", "pnpm-lock.yaml", "yarn.lock", "requirements.txt")
              if (directory / p).is_file()]
    for group in SRC_DIRS:
        for base, folders, names in os.walk(directory / group):
            folders[:] = [d for d in folders if d not in SKIP_DIRS and not d.startswith(".")]
            paths.extend(Path(base) / name for name in names
                         if not name.startswith(".") and not name.endswith((".pyc", ".sqlite3")))
    files = {}
    for path in sorted(paths):
        if path.is_symlink():
            raise ValueError(f"Expected a game file, found a symlink: {path.name}")
        files[path.relative_to(directory).as_posix()] = digest(path.read_bytes())
    serial = json.dumps(files, sort_keys=True, separators=(",", ":")).encode()
    return digest(serial), files


def studio_fingerprint():
    controls = ["studio.json", "baseline.json", "run.py", "report.py", "check-game.mjs"]
    controls += sorted(p.relative_to(HERE).as_posix() for p in (HERE / "skills").glob("*.md"))
    lock = {name: digest((HERE / name).read_bytes()) for name in controls}
    return digest(json.dumps(lock, sort_keys=True).encode())


def ordered(registry, pipeline):
    selected = registry["pipelines"][pipeline]
    if len(selected) != len(set(selected)):
        raise ValueError("Duplicate pipeline step")
    pending = list(selected)
    result = []
    for key in selected:
        step = registry["steps"][key]
        if step["role"] not in registry["roles"] or step["mode"] not in MODES:
            raise ValueError(f"Unknown role or mode for {key}")
        if set(step["needs"]) - set(selected):
            raise ValueError(f"Missing dependency for {key}")
        if not (HERE / "skills" / (step["skill"] + ".md")).is_file():
            raise ValueError(f"Missing skill for {key}")
    while pending:
        ready = [key for key in pending if all(dep in result for dep in registry["steps"][key]["needs"])]
        if not ready:
            raise ValueError("Cyclic pipeline dependency")
        for key in ready:
            pending.remove(key)
            result.append(key)
    return result


def execute(args, log, timeout=120):
    try:
        process = subprocess.run(args, cwd=GAME, text=True, stdout=subprocess.PIPE,
                                 stderr=subprocess.STDOUT, timeout=timeout, check=False)
    except subprocess.TimeoutExpired as exc:
        raise ValueError(f"Timed out after {timeout}s: {args[0]}") from exc
    with log.open("a", encoding="utf-8") as handle:
        handle.write(process.stdout)
    if process.returncode:
        raise ValueError(f"{args[0]} exited {process.returncode}. See {log.name}")
    return process.stdout


def candidate_evidence(data, fingerprint, files):
    candidate = data.get("candidate")
    if candidate is None:
        return None
    if data.get("source") != fingerprint:
        raise ValueError("Candidate evidence belongs to different game source")
    if not isinstance(candidate, dict) or set(candidate) != {"summary", "paths"}:
        raise ValueError("Expected a candidate summary and paths")
    summary, paths = candidate["summary"], candidate["paths"]
    if not isinstance(summary, str) or not 1 <= len(summary.strip()) <= 500:
        raise ValueError("Expected a short candidate summary")
    if not isinstance(paths, list) or not paths or not all(isinstance(p, str) for p in paths):
        raise ValueError("Expected changed source paths")
    for path in paths:
        # Look up pre-enumerated paths, never open a supplied path.
        if path not in files or files[path] == BASE.get(path, {}).get("sha256"):
            raise ValueError(f"Expected a changed or new game file: {path}")
    if not any(p.startswith(("web/", "server/")) for p in paths):
        raise ValueError("A candidate needs a change in the playable client or server")
    return {"summary": summary.strip(), "paths": sorted(set(paths))}


def pilot_metrics(data, fingerprint):
    sessions = data.get("sessions")
    if sessions in (None, []):
        return None
    if data.get("source") != fingerprint:
        raise ValueError("Playtest evidence belongs to different game source")
    if not isinstance(sessions, list):
        raise ValueError("Expected an array of first attempts")
    valid = []
    for row in sessions:
        if not isinstance(row, dict) or set(row) != {"device", "input", "seconds", "captured", "helped"}:
            raise ValueError("Use the anonymous playtest fields in the form")
        if row["device"] not in DEVICES or row["input"] not in INPUTS:
            raise ValueError("Unknown device or input")
        if type(row["seconds"]) is not int or not 1 <= row["seconds"] <= 3600:
            raise ValueError("Expected seconds in 1..3600")
        if type(row["captured"]) is not bool or type(row["helped"]) is not bool:
            raise ValueError("captured and helped must be true or false")
        if row["device"] != "mobile-emulator":
            valid.append(row)
    success = sum(r["captured"] and not r["helped"] and r["seconds"] <= 180 for r in valid)
    phones = sum(r["device"] in {"iphone-safari", "android-chrome"} for r in valid)
    return {"attempts": len(valid), "mobile": phones, "emulated": len(sessions) - len(valid),
            "selfFinishIn180s": success, "minimumAttempts": 5, "targetPercent": 80}


def template(fingerprint):
    return {"source": fingerprint, "studio": studio_fingerprint(), "candidate": None, "sessions": []}


def perform(key, run_dir, source, files, evidence, previous):
    log = run_dir / (key + ".log")
    if key == "brief":
        (run_dir / "TASK.md").write_bytes((HERE / "skills/pilot.md").read_bytes())
        save_json(run_dir / "evidence-template.json", template(source))
        job = {"schema": 1, "pipeline": "pilot", "step": "candidate", "executor": "Codex",
               "role": "engineer", "gameSource": source, "brief": "TASK.md",
               "workspace": "games/crew-academy",
               "readFirst": ["tvijor/START-HERE.md", "tvijor/skills/pilot.md", "SERVER.md"],
               "acceptance": {"pipeline": "verify", "evidence": "evidence-template.json",
                              "candidateFields": ["summary", "paths"]},
               "next": "playtest"}
        save_json(run_dir / "job.json", job)
        return "passed", {"brief": "TASK.md", "job": "job.json", "form": "evidence-template.json"}
    if key == "candidate":
        result = candidate_evidence(evidence, source, files)
        return ("passed", result) if result else ("waiting", {"needs": "Изменение клиента или сервера и заполненный candidate"})
    if key == "playtest":
        metrics = pilot_metrics(evidence, source)
        if metrics and metrics["attempts"] >= 5 and metrics["mobile"] > 0:
            return "passed", metrics
        return "waiting", {**(metrics or {}), "needs": "5 попыток игроков, включая реальный телефон"}
    if key == "verdict":
        metrics = previous["playtest"]["result"]
        ok = metrics["selfFinishIn180s"] * 100 >= metrics["targetPercent"] * metrics["attempts"]
        return ("passed" if ok else "iterate"), {"selfFinishIn180s": metrics["selfFinishIn180s"],
                                                 "attempts": metrics["attempts"]}
    if key in {"art", "routes", "build"}:
        if key == "build":
            execute(["node", "tools/build.mjs"], log)
        result = execute(["node", "tvijor/check-game.mjs", key], log)
        return "passed", json.loads(result)
    if key == "client":
        suites = sorted((GAME / "tests").glob("*.test.mjs"))
        suites += sorted((GAME / "server/portal/frontend/scripts").glob("*.test.mjs"))
        if not suites:
            raise ValueError("No game test suites found")
        output = execute(["node", "--test", "--test-reporter=tap",
                          *[str(p.relative_to(GAME)) for p in suites]], log)
        counts = {k: int(v) for k, v in re.findall(r"^# (tests|pass|fail|skipped|cancelled|todo) (\d+)$", output, re.M)}
        if not counts.get("tests") or counts["pass"] != counts["tests"]:
            raise ValueError(f"Incomplete Node test result: {counts}")
        return "passed", counts
    if key == "api":
        output = execute([sys.executable, "-m", "unittest", "discover", "-s", "tests",
                          "-p", "test_*.py"], log)
        count = re.search(r"^Ran (\d+) tests? in ", output, re.M)
        if not count or int(count[1]) == 0 or re.search(r"skipped=[1-9]", output):
            raise ValueError("No Python tests ran")
        return "passed", {"tests": int(count[1])}
    raise ValueError(f"Unknown stage: {key}")


def write_receipt(folder, receipt):
    save_json(folder / "run.json", receipt)
    render_report(folder / "index.html", receipt, REGISTRY)


def run_pipeline(pipeline, out, evidence):
    ordering = ordered(REGISTRY, pipeline)
    source, files = snapshot()
    if not isinstance(evidence, dict) or set(evidence) - {"source", "studio", "candidate", "sessions"}:
        raise ValueError("Unexpected evidence format")
    if evidence and evidence.get("studio") != studio_fingerprint():
        raise ValueError("Evidence belongs to another studio contract")
    if evidence and evidence.get("source") != source:
        raise ValueError("Evidence fingerprint differs from the current game")
    if any(out.is_relative_to(GAME / p) for p in (*SRC_DIRS, ".openai", ".git", "dist", "tvijor")):
        raise ValueError("Run output would mix with project inputs or build files")
    out.mkdir(parents=True, exist_ok=True)
    folder = Path(tempfile.mkdtemp(prefix=pipeline + "-", dir=out))
    receipt = {"tvijor": REGISTRY["version"], "pipeline": pipeline, "started": timestamp(),
               "source": source, "studioSource": studio_fingerprint(), "files": len(files), "status": "running", "steps": {}}
    steps = receipt["steps"]
    write_receipt(folder, receipt)
    for key in ordering:
        blocked_by = [dep for dep in REGISTRY["steps"][key]["needs"] if steps[dep]["status"] != "passed"]
        if blocked_by:
            status, result = "blocked", {"dependencies": blocked_by}
        else:
            try:
                status, result = perform(key, folder, source, files, evidence, steps)
            except (OSError, ValueError, KeyError, TypeError) as exc:
                status, result = "failed", {"error": str(exc)}
        steps[key] = {"status": status, "result": result}
        if (folder / (key + ".log")).exists():
            steps[key]["log"] = key + ".log"
        write_receipt(folder, receipt)
    if snapshot()[0] != source or studio_fingerprint() != receipt["studioSource"]:
        receipt["error"] = "Game source changed during the run. Repeat on a stable revision."
    statuses = {step["status"] for step in steps.values()}
    if "failed" in statuses or "error" in receipt:
        result = "failed"
    elif "iterate" in statuses:
        result = "iterate"
    elif "waiting" in statuses:
        result = "waiting"
    else:
        result = "passed"
    receipt.update(status=result, finished=timestamp())
    write_receipt(folder, receipt)
    return result, folder


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    sub = cli.add_subparsers(dest="action", required=True)
    for action in ("plan", "run"):
        cmd = sub.add_parser(action)
        cmd.add_argument("pipeline", choices=REGISTRY["pipelines"])
        if action == "run":
            cmd.add_argument("--out", type=Path, default=GAME / "var/tvijor")
            cmd.add_argument("--evidence", type=Path, help="JSON observation form for pilot")
    args = cli.parse_args()
    if args.action == "plan":
        for key in ordered(REGISTRY, args.pipeline):
            step = REGISTRY["steps"][key]
            print(f'{key:10} {step["mode"]:5} {step["role"]:10} {step["name"]}   ← {", ".join(step["needs"]) or "старт"}')
        return 0
    try:
        if args.evidence and args.pipeline != "pilot":
            cli.error("--evidence belongs to pilot")
        evidence = json.loads(args.evidence.read_text()) if args.evidence else {}
        status, folder = run_pipeline(args.pipeline, args.out.resolve(), evidence)
    except (OSError, ValueError) as exc:
        cli.exit(1, f"tvijor: {exc}\n")
    print(f"{status.upper()}  {folder / 'run.json'}")
    return {"passed": 0, "failed": 1, "waiting": 2, "iterate": 3}[status]


if __name__ == "__main__":
    sys.exit(main())
