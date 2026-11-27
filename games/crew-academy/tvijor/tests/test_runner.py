import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import run


def attempt(device="desktop", seconds=100, helped=False):
    return {"device": device, "input": "keyboard", "seconds": seconds, "captured": True, "helped": helped}


class StudioTests(unittest.TestCase):
    def test_pilot_handoff_has_playable_requirements_and_blank_observations(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            status, result = run.perform("brief", folder, "demo", {}, {}, {})
            self.assertEqual(status, "passed")
            job = json.loads((folder / result["job"]).read_text())
            for path in job["readFirst"]:
                self.assertTrue((run.GAME / path).is_file(), path)
            self.assertIn("tvijor/skills/game-feel.md", job["readFirst"])
            sheet = folder / job["acceptance"]["checklist"]
            self.assertEqual(sheet.name, result["checklist"])
            self.assertEqual(sheet.read_bytes(), (run.HERE / "playtest-m1.md").read_bytes())
            rows = [row.split("|")[1:-1] for row in sheet.read_text().splitlines()
                    if row.startswith("|") and row.split("|")[1].strip().isdigit()]
            self.assertEqual([row[0].strip() for row in rows], ["1", "2", "3", "4", "5"])
            self.assertTrue(all(not cell.strip() for row in rows for cell in row[1:]))
            form = json.loads((folder / job["acceptance"]["evidence"]).read_text())
            self.assertIsNone(form["candidate"])
            self.assertEqual(form["sessions"], [])

    def test_registry_and_cycle(self):
        order = run.ordered(run.REGISTRY, "pilot")
        self.assertLess(order.index("candidate"), order.index("playtest"))
        self.assertLess(order.index("build"), order.index("playtest"))
        invalid = copy.deepcopy(run.REGISTRY)
        invalid["steps"]["art"]["needs"] = ["build"]
        with self.assertRaisesRegex(ValueError, "Cyclic"):
            run.ordered(invalid, "verify")

    def test_candidate_bound_to_changed_gameplay(self):
        old = run.BASE["web/app.js"]["sha256"]
        body = {"source": "r", "candidate": {"summary": "Игрок открывает маяк после причала", "paths": ["web/app.js"]}}
        self.assertEqual(run.candidate_evidence(body, "r", {"web/app.js": "new"})["paths"], ["web/app.js"])
        with self.assertRaisesRegex(ValueError,"changed"):
            run.candidate_evidence(body, "r", {"web/app.js": old})
        with self.assertRaisesRegex(ValueError, "different"):
            run.candidate_evidence(body, "other", {"web/app.js": "new"})
        body["candidate"]["paths"] = ["../../outside"]
        with self.assertRaises(ValueError):
            run.candidate_evidence(body, "r", {})

    def test_no_score_for_emulation_and_late_or_helped_runs(self):
        rows = [attempt("mobile-emulator"), attempt("iphone-safari", 180), attempt(seconds=181),
                attempt(helped=True), attempt(), attempt()]
        metrics = run.pilot_metrics({"source": "r", "sessions": rows}, "r")
        self.assertEqual((metrics["attempts"],metrics["mobile"],metrics["emulated"],metrics["selfFinishIn180s"]),
                         (5,1,1,3))
        with tempfile.TemporaryDirectory() as tmp:
            result = run.perform("verdict",Path(tmp),"r",{}, {}, {"playtest":{"result":metrics}})
            self.assertEqual(result[0], "iterate")
            rows[2]["seconds"] = 180
            metrics = run.pilot_metrics({"source":"r","sessions":rows},"r")
            self.assertEqual(run.perform("verdict",Path(tmp),"r",{}, {}, {"playtest":{"result":metrics}})[0], "passed")
        with self.assertRaises(ValueError):
            run.pilot_metrics({"source":"r","sessions":[dict(attempt(), name="ignored")]}, "r")

    def test_partial_run_is_resumable_with_a_new_receipt_and_never_claims_a_playtest(self):
        def cheap_steps(key, *args):
            if key == "art":
                return "failed", {"error":"reference"}
            if key == "candidate":
                return "waiting", {}
            return "passed", {}
        with tempfile.TemporaryDirectory() as tmp, patch.object(run, "perform", cheap_steps):
            first, a = run.run_pipeline("pilot", Path(tmp), {})
            _, b = run.run_pipeline("pilot", Path(tmp), {})
            self.assertNotEqual(a,b)
            self.assertEqual(first, "failed")
            report = json.loads((a / "run.json").read_text())
            self.assertEqual(report["steps"]["build"]["status"], "blocked")
            self.assertEqual(report["steps"]["playtest"]["status"], "blocked")
            self.assertTrue((a / "index.html").is_file())

    def test_source_changes_during_checks_invalidate_the_receipt(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(run,"snapshot",side_effect=[("a",{}),("b",{})]), \
                patch.object(run,"perform",return_value=("passed",{})):
            status, folder = run.run_pipeline("verify", Path(tmp), {})
            self.assertEqual(status,"failed")
            self.assertIn("source changed",json.loads((folder/"run.json").read_text())["error"])


if __name__ == "__main__":
    unittest.main()
