from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import CompletionOverTimePoint, CountByLabel
from app.services.analytics_service import (
    get_task_completion_over_time,
    get_task_count_by_priority,
    get_task_count_by_status,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/count-by-status", response_model=list[CountByLabel])
def count_by_status_endpoint(db: Session = Depends(get_db)):
    return get_task_count_by_status(db)


@router.get("/count-by-priority", response_model=list[CountByLabel])
def count_by_priority_endpoint(db: Session = Depends(get_db)):
    return get_task_count_by_priority(db)


@router.get("/completion-over-time", response_model=list[CompletionOverTimePoint])
def completion_over_time_endpoint(db: Session = Depends(get_db)):
    return get_task_completion_over_time(db)
