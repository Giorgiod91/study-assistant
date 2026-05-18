import json
from pathlib import Path
from datetime import datetime

STATS_FILE = Path("stats.json")


def _load() -> dict:
    if STATS_FILE.exists():
        return json.loads(STATS_FILE.read_text(encoding="utf-8"))
    return {"total_questions": 0, "total_uploads": 0, "daily": {}}


def _save(data: dict):
    STATS_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def record_question():
    data = _load()
    data["total_questions"] = data.get("total_questions", 0) + 1
    today = datetime.now().strftime("%Y-%m-%d")
    data.setdefault("daily", {})
    data["daily"][today] = data["daily"].get(today, 0) + 1
    _save(data)


def record_upload():
    data = _load()
    data["total_uploads"] = data.get("total_uploads", 0) + 1
    _save(data)


def get_stats(doc_count: int) -> dict:
    data = _load()
    daily = data.get("daily", {})

    # Study streak — consecutive days with at least 1 question
    streak = 0
    day = datetime.now().date()
    for _ in range(365):
        key = day.strftime("%Y-%m-%d")
        if daily.get(key, 0) > 0:
            streak += 1
            from datetime import timedelta
            day -= timedelta(days=1)
        else:
            break

    # Last 7 days activity for chart
    week = []
    from datetime import timedelta
    for i in range(6, -1, -1):
        d = (datetime.now().date() - timedelta(days=i)).strftime("%Y-%m-%d")
        week.append({"date": d, "questions": daily.get(d, 0)})

    return {
        "total_questions": data.get("total_questions", 0),
        "total_uploads": data.get("total_uploads", 0),
        "documents": doc_count,
        "streak": streak,
        "weekly_activity": week,
    }
