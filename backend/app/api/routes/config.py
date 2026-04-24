from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import (
    TASK_AI_ENRICHMENT_ENABLED,
    TASK_DESCRIPTION_MAX_LENGTH,
    TASK_DESCRIPTION_MIN_LENGTH,
)

router = APIRouter(prefix="/config", tags=["config"])


class AppConfig(BaseModel):
    task_description_min_length: int
    task_description_max_length: int
    ai_enrichment_enabled: bool


@router.get("", response_model=AppConfig)
def get_config():
    return AppConfig(
        task_description_min_length=TASK_DESCRIPTION_MIN_LENGTH,
        task_description_max_length=TASK_DESCRIPTION_MAX_LENGTH,
        ai_enrichment_enabled=TASK_AI_ENRICHMENT_ENABLED,
    )
