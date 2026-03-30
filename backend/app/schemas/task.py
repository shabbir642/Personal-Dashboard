from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.task_ai_insight import TaskAIInsightResponse


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in-progress"
    DONE = "done"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TaskCreate(TaskBase):
    tags: list[str] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    ai_insight: Optional[TaskAIInsightResponse] = None

    model_config = ConfigDict(from_attributes=True)
