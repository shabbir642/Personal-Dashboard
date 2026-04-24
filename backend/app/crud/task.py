from typing import Optional

from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def create_task(db: Session, task: TaskCreate) -> Task:
    db_task = Task(**task.model_dump(exclude={"tags"}))
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_tasks(db: Session, skip: int = 0, limit: int = 50) -> tuple[list[Task], int]:
    base = db.query(Task)
    total = base.count()
    items = (
        base.options(selectinload(Task.ai_insight))
        .order_by(Task.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
    return db.query(Task).options(selectinload(Task.ai_insight)).filter(Task.id == task_id).first()


def update_task(db: Session, db_task: Task, task_update: TaskUpdate) -> Task:
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, db_task: Task) -> None:
    db.delete(db_task)
    db.commit()
