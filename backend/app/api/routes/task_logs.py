from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.task_log import TaskLogCreate, TaskLogResponse
from app.services.task_log_service import create_task_log_service, get_task_logs_service

router = APIRouter(prefix="/tasks/{task_id}/logs", tags=["task-logs"])


@router.post("", response_model=TaskLogResponse, status_code=status.HTTP_201_CREATED)
def create_task_log_endpoint(task_id: int, log: TaskLogCreate, db: Session = Depends(get_db)):
    return create_task_log_service(db, task_id, log)


@router.get("", response_model=list[TaskLogResponse])
def get_task_logs_endpoint(task_id: int, db: Session = Depends(get_db)):
    return get_task_logs_service(db, task_id)
