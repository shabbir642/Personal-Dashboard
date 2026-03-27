from datetime import date

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
    done_tasks = db.query(Task).filter(Task.status == TaskStatus.DONE).all()

    completion_counts = {}
    for task in done_tasks:
        completion_day = task.end_date or date(task.created_at.year, task.created_at.month, task.created_at.day)
        completion_counts[completion_day] = completion_counts.get(completion_day, 0) + 1

    points = [
        {"date": point_date, "count": completion_counts[point_date]}
        for point_date in sorted(completion_counts.keys())
    ]
    return points
