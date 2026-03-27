from sqlalchemy.orm import Session

from app.crud.task_log import create_task_log, get_task_logs
from app.schemas.task_log import TaskLogCreate
from app.services.task_service import get_task_or_404


def create_task_log_service(db: Session, task_id: int, log: TaskLogCreate):
    get_task_or_404(db, task_id)
    return create_task_log(db, task_id, log)


def get_task_logs_service(db: Session, task_id: int):
    get_task_or_404(db, task_id)
    return get_task_logs(db, task_id)
