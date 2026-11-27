"""Wire payloads for a future server-only Tvijo family or sponsor grant.

Importing this module has no network effects. Prices are integer micro_tvijo
from an approved platform budget, never the display prices of the game.
"""
from dataclasses import dataclass
from urllib.parse import quote

API = "/api/dshrem/v1"
MICRO_TVIJO_PER_TT = 1_000_000


@dataclass(frozen=True)
class SponsoredTurn:
    project_id: str
    operation_id: str
    max_micro_tvijo: int
    system_digest: str

    def __post_init__(self):
        if not self.project_id or not 1 <= len(self.operation_id) <= 85:
            raise ValueError("project and stable operation ID required")
        if type(self.max_micro_tvijo) is not int or self.max_micro_tvijo <= 0:
            raise ValueError("approved budget in integer micro_tvijo required")

    def messages(self):
        return [
            {"role":"system","content":self.system_digest},
            {"role":"user","content":"Выбери одну из карточек verify, parallel или next."},
        ]

    def quote_request(self):
        return API + "/services/quote", {
            "service_id":"standard", "project_id":self.project_id, "title":"Экипаж Tvijo",
            "messages":self.messages(), "max_tokens":48, "max_micro_tvijo":self.max_micro_tvijo,
            "idempotency_key":"crew-q-" + self.operation_id,
        }

    def task_request(self, platform_quote):
        ceiling = platform_quote.get("ceiling_micro_tvijo")
        quote_id = platform_quote.get("quote_id")
        if (platform_quote.get("unit") != "micro_tvijo"
                or platform_quote.get("project_id") != self.project_id
                or platform_quote.get("service_id") != "standard"
                or type(ceiling) is not int or not 0 < ceiling <= self.max_micro_tvijo
                or not isinstance(quote_id,str) or not quote_id):
            raise ValueError("quote is outside this grant")
        return API + "/tasks", {"quote_id":quote_id,"service_id":"standard",
                                "idempotency_key":"crew-t-" + self.operation_id}

    def chat_request(self, task_id):
        return API + "/tasks/" + quote(task_id, safe="") + "/chat", {
            "messages": self.messages(), "max_tokens": 48,
        }

    def reconcile_path(self):
        return API + "/tasks/by-idempotency/" + quote("crew-t-" + self.operation_id, safe="")

    @staticmethod
    def receipt_path(task_id):
        return API + "/tasks/" + quote(task_id, safe="")
