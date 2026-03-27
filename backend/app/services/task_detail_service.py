from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.task_detail import create_task_detail, get_task_detail_by_task_id, update_task_detail
from app.schemas.task_detail import TaskDetailCreate, TaskDetailUpdate
from app.services.task_service import get_task_or_404


def create_task_detail_service(db: Session, task_id: int, detail: TaskDetailCreate):
    get_task_or_404(db, task_id)

    existing_detail = get_task_detail_by_task_id(db, task_id)
    if existing_detail:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Task details already exist")

    return create_task_detail(db, task_id, detail)


def get_task_detail_service(db: Session, task_id: int):
    get_task_or_404(db, task_id)

    detail = get_task_detail_by_task_id(db, task_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task details not found")
    return detail


def update_task_detail_service(db: Session, task_id: int, detail_update: TaskDetailUpdate):
    get_task_or_404(db, task_id)

    detail = get_task_detail_by_task_id(db, task_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task details not found")

    return update_task_detail(db, detail, detail_update)
