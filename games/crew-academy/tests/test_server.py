import asyncio
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient
from server.herdr_server import build_app
from server.platform_contract import SponsoredTurn


def order(tier="standard", goal=True):
    return {"hero":"captain","level":"dock","done":[],"tier":tier,
            "parsed":{"orders":["bridge"],"who":"robot","kind":"order",
                      "criteria":[True,True,goal],"chain":False}}


class GatewayTest(unittest.TestCase):
    def test_same_game_and_cache_and_pilot(self):
        with tempfile.TemporaryDirectory() as folder, TestClient(
            build_app(Path(folder)/"test.sqlite"), base_url="https://testserver"
        ) as c:
            self.assertIn("Ночной штаб",c.get("/").text)
            self.assertEqual(c.post("/api/herdr/turn", json=order()).json()["reply"]["changes"],["bridge"])
            self.assertEqual(c.post("/api/herdr/turn", json=order()).json()["source"],"cache")
            self.assertEqual(c.post("/api/herdr/turn", json={**order(),"user_id":"invented"}).status_code,422)
            self.assertEqual(c.post("/api/herdr/event",json={"event":"mic_click","seconds":12}).status_code,200)
            self.assertEqual(c.post("/api/herdr/event",json={"event":"mic_click","seconds":16}).status_code,200)
            self.assertEqual(c.get("/api/herdr/parent-report/me").json()["first_events"],[{"event":"mic_click","seconds":12}])
            c.cookies.clear()
            self.assertEqual(c.get("/api/herdr/parent-report/me").json()["first_events"],[])

    def test_late_failed_and_unknown_narrator_replies_are_free(self):
        calls=[]
        async def narrator(prompt):
            calls.append(prompt)
            if len(calls)==1:
                await asyncio.sleep(6)
            if len(calls)==2:
                raise OSError("temporarily offline")
            if len(calls)==3:
                return "unreviewed text"
            return "verify"
        with tempfile.TemporaryDirectory() as folder, TestClient(build_app(Path(folder)/"test.sqlite",narrator)) as c:
            for _ in range(3):
                res=c.post("/api/herdr/turn",json=order("turbo")).json()
                self.assertEqual(res["source"],"fallback")
                self.assertEqual(res["real_charge"],0)
                self.assertEqual(res["reply"]["changes"],["bridge"])
            self.assertEqual(c.post("/api/herdr/turn",json=order("turbo")).json()["source"],"narrator")
            self.assertEqual(c.post("/api/herdr/turn",json=order("turbo")).json()["source"],"cache")
            self.assertIn("recent_clarifications",calls[0])

    def test_platform_fixtures(self):
        op=SponsoredTurn("pilot","stable-1",30000,"Разведка подтверждена")
        path,q=op.quote_request()
        self.assertEqual(path,"/api/dshrem/v1/services/quote")
        self.assertEqual(q["max_micro_tvijo"],30000)
        receipt={"quote_id":"q1","service_id":"standard","unit":"micro_tvijo",
                 "project_id":"pilot","ceiling_micro_tvijo":24000}
        _,task=op.task_request(receipt)
        self.assertIn(task["idempotency_key"],op.reconcile_path())
        self.assertEqual(op.chat_request("t1")[1]["messages"],q["messages"])
        with self.assertRaises(ValueError):
            op.task_request({**receipt,"ceiling_micro_tvijo":40000})
