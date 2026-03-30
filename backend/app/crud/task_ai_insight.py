from typing import Optional

from sqlalchemy.orm import Session

from app.models.task_ai_insight import TaskAIInsight
from app.schemas.task_ai_insight import TaskAIInsightCreate


def get_task_ai_insight_by_task_id(db: Session, task_id: int) -> Optional[TaskAIInsight]:
    return db.query(TaskAIInsight).filter(TaskAIInsight.task_id == task_id).first()


def create_or_update_task_ai_insight(
    db: Session,
    task_id: int,
    insight_data: TaskAIInsightCreate,
) -> TaskAIInsight:
    db_insight = get_task_ai_insight_by_task_id(db, task_id)
    payload = insight_data.model_dump()

    if db_insight:
        for field, value in payload.items():
            setattr(db_insight, field, value)
    else:
        db_insight = TaskAIInsight(task_id=task_id, **payload)
        db.add(db_insight)

    db.commit()
    db.refresh(db_insight)
    return db_insight
