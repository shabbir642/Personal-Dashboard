from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskLogCreate(BaseModel):
    issue: str = Field(..., min_length=1)
    resolution: Optional[str] = None


class TaskLogResponse(BaseModel):
    id: int
    task_id: int
    issue: str
    resolution: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
