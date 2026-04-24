from datetime import date, datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.task import Task, TaskPriority, TaskStatus


def get_task_count_by_status(db: Session):
    rows = db.query(Task.status, func.count(Task.id)).group_by(Task.status).all()

    counts = {status.value: 0 for status in TaskStatus}
    for status, count in rows:
        key = status.value if hasattr(status, "value") else str(status)
        counts[key] = int(count)

    return [{"label": key, "count": value} for key, value in counts.items()]


def get_task_count_by_priority(db: Session):
    rows = db.query(Task.priority, func.count(Task.id)).group_by(Task.priority).all()

    counts = {priority.value: 0 for priority in TaskPriority}
    for priority, count in rows:
        key = priority.value if hasattr(priority, "value") else str(priority)
        counts[key] = int(count)

    order = [TaskPriority.LOW.value, TaskPriority.MEDIUM.value, TaskPriority.HIGH.value]
    return [{"label": key, "count": counts[key]} for key in order]


def get_task_completion_over_time(db: Session):
    # end_date when set, else the date portion of created_at. Aggregated in SQL.
    day_expr = func.coalesce(Task.end_date, func.date(Task.created_at)).label("day")
    rows = (
        db.query(day_expr, func.count(Task.id))
        .filter(Task.status == TaskStatus.DONE)
        .group_by(day_expr)
        .order_by(day_expr)
        .all()
    )

    def _to_date(value):
        if isinstance(value, date):
            return value
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, str):
            return date.fromisoformat(value)
        return value

    return [{"date": _to_date(day), "count": int(count)} for day, count in rows if day is not None]
