from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskAIInsightBase(BaseModel):
    overview: str
    suggestions: str
    impact: str
    skills_improvement: str
    provider: Optional[str] = None
    model_name: Optional[str] = None


class TaskAIInsightCreate(TaskAIInsightBase):
    pass


class TaskAIInsightGenerateRequest(BaseModel):
    category: str = Field(default="general", min_length=2, max_length=50)


class TaskAIInsightResponse(TaskAIInsightBase):
    id: int
    task_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
