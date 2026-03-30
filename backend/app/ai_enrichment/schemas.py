from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskEnrichmentInput(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    tags: list[str] = Field(default_factory=list)
    suggestion_category: str = "general"


class TaskEnrichmentResult(BaseModel):
    overview: str
    suggestions: str
    impact: str
    skills_improvement: str

    model_config = ConfigDict(extra="ignore")
