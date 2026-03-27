from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.task_detail import TaskDetailCreate, TaskDetailResponse, TaskDetailUpdate
from app.services.task_detail_service import (
    create_task_detail_service,
    get_task_detail_service,
    update_task_detail_service,
)

router = APIRouter(prefix="/tasks/{task_id}/details", tags=["task-details"])


@router.post("", response_model=TaskDetailResponse, status_code=status.HTTP_201_CREATED)
def create_task_detail_endpoint(task_id: int, detail: TaskDetailCreate, db: Session = Depends(get_db)):
    return create_task_detail_service(db, task_id, detail)


@router.get("", response_model=TaskDetailResponse)
def get_task_detail_endpoint(task_id: int, db: Session = Depends(get_db)):
    return get_task_detail_service(db, task_id)


@router.put("", response_model=TaskDetailResponse)
def update_task_detail_endpoint(task_id: int, detail_update: TaskDetailUpdate, db: Session = Depends(get_db)):
    return update_task_detail_service(db, task_id, detail_update)
