import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.ai_enrichment import TaskEnrichmentInput, get_task_enrichment_provider
from app.core.config import (
    TASK_AI_ENRICHMENT_ENABLED,
    TASK_AI_MODEL,
    TASK_AI_PROVIDER,
    TASK_DESCRIPTION_MIN_LENGTH,
)
from app.core.database import SessionLocal
from app.crud.task import get_task_by_id
from app.crud.task_ai_insight import create_or_update_task_ai_insight, get_task_ai_insight_by_task_id
from app.models.task import Task
from app.schemas.task_ai_insight import TaskAIInsightCreate

logger = logging.getLogger("app")


def _enrich(db: Session, task: Task, tags: list[str], category: str) -> None:
    provider = get_task_enrichment_provider()
    enrichment_input = TaskEnrichmentInput(
        title=task.title,
        description=task.description,
        priority=task.priority.value if task.priority else None,
        due_date=task.end_date,
        tags=tags,
        suggestion_category=category,
    )
    result = provider.generate(enrichment_input)

    create_or_update_task_ai_insight(
        db,
        task.id,
        TaskAIInsightCreate(
            overview=result.overview,
            suggestions=result.suggestions,
            impact=result.impact,
            skills_improvement=result.skills_improvement,
            provider=TASK_AI_PROVIDER,
            model_name=TASK_AI_MODEL,
        ),
    )


def enrich_task_in_background(task_id: int, tags: list[str]) -> None:
    # Runs after the HTTP response is sent. Own session; own error isolation.
    if not TASK_AI_ENRICHMENT_ENABLED:
        return
    db = SessionLocal()
    try:
        task = get_task_by_id(db, task_id)
        if not task:
            return
        description = (task.description or "").strip()
        if len(description) < TASK_DESCRIPTION_MIN_LENGTH:
            return
        _enrich(db, task, tags, "general")
    except Exception as exc:
        logger.warning("Background AI enrichment failed for task_id=%s error=%s", task_id, str(exc))
    finally:
        db.close()


def get_task_ai_insight_or_404(db: Session, task_id: int):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    insight = get_task_ai_insight_by_task_id(db, task_id)
    if not insight:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task AI insight not found")
    return insight


def generate_task_ai_insight_for_task(db: Session, task_id: int, category: str):
    task = get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    description = (task.description or "").strip()
    if len(description) < TASK_DESCRIPTION_MIN_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Task description must be at least {TASK_DESCRIPTION_MIN_LENGTH} characters "
                "to generate deep insight."
            ),
        )

    try:
        if not TASK_AI_ENRICHMENT_ENABLED:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="AI enrichment is disabled")

        _enrich(db, task, [], category.strip().lower() or "general")
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Task AI generation failed for task_id=%s", task_id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI insight generation failed: {str(exc)}",
        ) from exc

    insight = get_task_ai_insight_by_task_id(db, task_id)
    if not insight:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save AI insight")
    return insight
