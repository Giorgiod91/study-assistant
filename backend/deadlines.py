import json
import uuid
from pathlib import Path
from datetime import datetime

DEADLINES_FILE = Path("deadlines.json")


def _load() -> list:
    if DEADLINES_FILE.exists():
        return json.loads(DEADLINES_FILE.read_text(encoding="utf-8"))
    return []


def _save(data: list):
    DEADLINES_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def add_deadline(title: str, subject: str, due_date: str, priority: str) -> dict:
    item = {
        "id": str(uuid.uuid4())[:8],
        "title": title,
        "subject": subject,
        "due_date": due_date,
        "priority": priority,
        "created_at": datetime.now().isoformat(),
    }
    data = _load()
    data.append(item)
    _save(data)
    return item


def get_deadlines() -> list:
    now = datetime.now().date()
    result = []
    for d in _load():
        try:
            due = datetime.fromisoformat(d["due_date"]).date()
            days_left = (due - now).days
        except Exception:
            days_left = 999
        result.append({**d, "days_left": days_left})
    return sorted(result, key=lambda x: x["days_left"])


def delete_deadline(deadline_id: str) -> bool:
    data = _load()
    new = [d for d in data if d["id"] != deadline_id]
    if len(new) == len(data):
        return False
    _save(new)
    return True
