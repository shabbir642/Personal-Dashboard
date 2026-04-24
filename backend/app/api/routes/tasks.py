from fastapi import APIRouter, BackgroundTasks, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.task import TaskCreate, TaskListResponse, TaskResponse, TaskUpdate
from app.services.task_ai_insight_service import enrich_task_in_background
from app.services.task_service import (
    create_task_service,
    delete_task_service,
    get_task_or_404,
    get_tasks_service,
    update_task_service,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task_endpoint(
    task: TaskCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    db_task = create_task_service(db, task)
    background_tasks.add_task(enrich_task_in_background, db_task.id, task.tags)
    return db_task


@router.get("", response_model=TaskListResponse)
def get_tasks_endpoint(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    items, total = get_tasks_service(db, skip=skip, limit=limit)
    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.get("/{task_id}", response_model=TaskResponse)
def get_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    return get_task_or_404(db, task_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task_endpoint(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    return update_task_service(db, task_id, task_update)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    delete_task_service(db, task_id)
    return None
