from typing import Optional

from sqlalchemy.orm import Session

from app.models.task_detail import TaskDetail
from app.schemas.task_detail import TaskDetailCreate, TaskDetailUpdate


def get_task_detail_by_task_id(db: Session, task_id: int) -> Optional[TaskDetail]:
    return db.query(TaskDetail).filter(TaskDetail.task_id == task_id).first()


def create_task_detail(db: Session, task_id: int, detail: TaskDetailCreate) -> TaskDetail:
    db_detail = TaskDetail(task_id=task_id, **detail.model_dump())
    db.add(db_detail)
    db.commit()
    db.refresh(db_detail)
    return db_detail


def update_task_detail(db: Session, db_detail: TaskDetail, detail_update: TaskDetailUpdate) -> TaskDetail:
    update_data = detail_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_detail, field, value)

    db.commit()
    db.refresh(db_detail)
    return db_detail
