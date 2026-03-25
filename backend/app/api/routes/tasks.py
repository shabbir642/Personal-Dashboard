from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.task_detail import create_task_detail, get_task_detail_by_task_id, update_task_detail
from app.crud.task_log import create_task_log, get_task_logs
from app.crud.task import create_task, delete_task, get_task_by_id, get_tasks, update_task
from app.schemas.task_detail import TaskDetailCreate, TaskDetailResponse, TaskDetailUpdate
from app.schemas.task_log import TaskLogCreate, TaskLogResponse
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task_endpoint(task: TaskCreate, db: Session = Depends(get_db)):
    return create_task(db, task)


@router.get("", response_model=list[TaskResponse])
def get_tasks_endpoint(db: Session = Depends(get_db)):
    return get_tasks(db)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task_endpoint(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return update_task(db, task, task_update)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    delete_task(db, task)
    return None


@router.post("/{task_id}/details", response_model=TaskDetailResponse, status_code=status.HTTP_201_CREATED)
def create_task_detail_endpoint(task_id: int, detail: TaskDetailCreate, db: Session = Depends(get_db)):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    existing_detail = get_task_detail_by_task_id(db, task_id)
    if existing_detail:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Task details already exist")

    return create_task_detail(db, task_id, detail)


@router.get("/{task_id}/details", response_model=TaskDetailResponse)
def get_task_detail_endpoint(task_id: int, db: Session = Depends(get_db)):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    detail = get_task_detail_by_task_id(db, task_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task details not found")
    return detail


@router.put("/{task_id}/details", response_model=TaskDetailResponse)
def update_task_detail_endpoint(task_id: int, detail_update: TaskDetailUpdate, db: Session = Depends(get_db)):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    detail = get_task_detail_by_task_id(db, task_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task details not found")
    return update_task_detail(db, detail, detail_update)


@router.post("/{task_id}/logs", response_model=TaskLogResponse, status_code=status.HTTP_201_CREATED)
def create_task_log_endpoint(task_id: int, log: TaskLogCreate, db: Session = Depends(get_db)):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return create_task_log(db, task_id, log)


@router.get("/{task_id}/logs", response_model=list[TaskLogResponse])
def get_task_logs_endpoint(task_id: int, db: Session = Depends(get_db)):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return get_task_logs(db, task_id)
