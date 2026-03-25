from sqlalchemy.orm import Session

from app.models.task_log import TaskLog
from app.schemas.task_log import TaskLogCreate


def create_task_log(db: Session, task_id: int, log: TaskLogCreate) -> TaskLog:
    db_log = TaskLog(task_id=task_id, **log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def get_task_logs(db: Session, task_id: int) -> list[TaskLog]:
    return db.query(TaskLog).filter(TaskLog.task_id == task_id).order_by(TaskLog.created_at.desc()).all()
