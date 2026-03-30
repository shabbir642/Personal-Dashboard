from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.task_ai_insight import TaskAIInsightGenerateRequest, TaskAIInsightResponse
from app.services.task_ai_insight_service import generate_task_ai_insight_for_task, get_task_ai_insight_or_404

router = APIRouter(prefix="/tasks/{task_id}/ai-insight", tags=["task-ai-insight"])


@router.get("", response_model=TaskAIInsightResponse)
def get_task_ai_insight_endpoint(task_id: int, db: Session = Depends(get_db)):
    return get_task_ai_insight_or_404(db, task_id)


@router.post("/generate", response_model=TaskAIInsightResponse)
def generate_task_ai_insight_endpoint(
    task_id: int,
    payload: TaskAIInsightGenerateRequest,
    db: Session = Depends(get_db),
):
    return generate_task_ai_insight_for_task(db, task_id, payload.category)
