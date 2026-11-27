"""Render a portable local run view with expandable stage contracts."""
from base64 import b64encode
from html import escape
from pathlib import Path
import json

LABELS = {"running":"Выполняется", "passed":"Пройдено", "waiting":"Ждёт данных",
          "blocked":"Ожидает предыдущий шаг", "failed":"Ошибка", "iterate":"Требует доработки",
          "queued":"В очереди"}
MODES = {"human":"Наблюдение игрока", "agent":"Работа разработчика", "local":"Автоматическая проверка"}
CSS = """
:root{color-scheme:dark;font-family:system-ui,sans-serif;background:#141222;color:#f5f1fa}
*{box-sizing:border-box}body{max-width:58rem;margin:auto;padding:clamp(1rem,4vw,3rem);line-height:1.55}
header{border-bottom:1px solid #494357;padding-bottom:1rem}h1{font-size:clamp(1.7rem,4vw,2.6rem);margin:.4rem 0}
code,pre{font: .94rem/1.5 ui-monospace,monospace;overflow-wrap:anywhere}pre{white-space:pre-wrap}
details{border:1px solid #484254;border-radius:.7rem;margin:.7rem 0;background:#201c2d}
summary{cursor:pointer;padding:.9rem 1rem}summary strong{margin-right:.7rem}summary span{float:right}
.panel{padding:0 1rem .9rem}dl{display:grid;grid-template-columns:minmax(6rem,auto) 1fr;gap:.3rem 1.2rem}
dd{margin:0}dt,.sub{color:#c9bed6}.passed{color:#91dfb1}.waiting,.iterate{color:#ffd893}
.failed{color:#ffadad}a{color:#dbc4ff}h2{font-size:1.2rem;margin-top:1.8rem}
@media(max-width:600px){summary span{float:none;display:block;margin-left:1.2rem}dl{display:block}dt{margin-top:.5rem}}
"""


def safe(value):
    return escape(str(value), quote=True)


def download(name, data, label, media="application/json"):
    payload = b64encode(data).decode("ascii")
    return f'<a download="{safe(name)}" href="data:{media};base64,{payload}">{safe(label)}</a>'


def render_report(path, receipt, studio):
    pipeline = receipt["pipeline"]
    title = "Проверка сборки" if pipeline == "verify" else "Пилот первой смены"
    status = receipt["status"]
    body = []
    for key in studio["pipelines"][pipeline]:
        spec = studio["steps"][key]
        step = receipt["steps"].get(key, {"status": "queued"})
        state = step["status"]
        details = [("Исполнитель", studio["roles"][spec["role"]]), ("Режим", MODES[spec["mode"]]),
                   ("Инструкция", "skills/" + spec["skill"] + ".md"), ("Вход", spec["input"]),
                   ("Ожидаемый результат", spec["output"]),
                   ("Зависит от", ", ".join(spec["needs"]) or "Можно начать сразу")]
        terms = "".join(f"<dt>{safe(k)}</dt><dd>{safe(v)}</dd>" for k, v in details)
        result = safe(json.dumps(step.get("result", {}), ensure_ascii=False, indent=2))
        log = ""
        if step.get("log"):
            text = (path.parent / step["log"]).read_text(encoding="utf8")
            log = f'<details><summary>Журнал проверки</summary><pre class="panel">{safe(text)}</pre></details>'
        skill = (Path(__file__).resolve().parent / "skills" / (spec["skill"] + ".md")).read_text(encoding="utf8")
        playbook = f'<details><summary>Инструкция исполнителю</summary><pre class="panel">{safe(skill)}</pre></details>'
        opened = " open" if state in {"waiting","iterate","failed"} else ""
        body.append(f'<details{opened}><summary><strong>{safe(spec["name"])}</strong>'
                    f'<span class="{safe(state)}">{LABELS[state]}</span></summary>'
                    f'<div class="panel"><dl>{terms}</dl><pre>{result}</pre>{playbook}{log}</div></details>')
    attachments = ""
    if receipt["steps"].get("brief", {}).get("status") == "passed" and (path.parent / "job.json").is_file():
        resources = [("TASK.md","Бриф Codex","text/markdown"),("job.json","Задание JSON","application/json"),
                     ("evidence-template.json","Форма наблюдений","application/json")]
        if (path.parent / "PLAYTEST.md").is_file():
            resources.append(("PLAYTEST.md", "Бланк на пять игроков", "text/markdown"))
        links = [download(name, (path.parent / name).read_bytes(), label, media) for name, label, media in resources]
        attachments = "<p>" + " · ".join(links) + "</p>"
    json_link = download("run.json", json.dumps(receipt, ensure_ascii=False, indent=2).encode(), "Полная квитанция JSON")
    problem = f'<p class="failed">{safe(receipt["error"])}</p>' if "error" in receipt else ""
    html = (f'<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{safe(title)} · tvijor</title><style>{CSS}</style><header><div class="sub">tvijor {safe(receipt["tvijor"])}</div>'
            f'<h1>{safe(title)}</h1><strong class="{safe(status)}">{LABELS[status]}</strong> · {safe(receipt["started"])}'
            f'<p>Исходники игры <code>{safe(receipt["source"])}</code></p></header>{problem}{attachments}'
            f'<main><h2>Этапы прогона</h2>{"".join(body)}</main><p>{json_link}</p></html>')
    tmp = path.with_suffix(".html.tmp")
    tmp.write_text(html, encoding="utf8")
    tmp.replace(path)
