from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.task import create_task, delete_task, get_task_by_id, get_tasks, update_task
from app.schemas.task import TaskCreate, TaskUpdate


def create_task_service(db: Session, task: TaskCreate):
    return create_task(db, task)


def get_tasks_service(db: Session):
    return get_tasks(db)


def get_task_or_404(db: Session, task_id: int):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def update_task_service(db: Session, task_id: int, task_update: TaskUpdate):
    task = get_task_or_404(db, task_id)
    return update_task(db, task, task_update)


def delete_task_service(db: Session, task_id: int):
    task = get_task_or_404(db, task_id)
    delete_task(db, task)
