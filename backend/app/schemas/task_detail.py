from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskDetailBase(BaseModel):
    assigned_by: Optional[str] = Field(None, max_length=255)
    approach: Optional[str] = None
    key_learnings: Optional[str] = None
    notes: Optional[str] = None


class TaskDetailCreate(TaskDetailBase):
    pass


class TaskDetailUpdate(TaskDetailBase):
    pass


class TaskDetailResponse(TaskDetailBase):
    id: int
    task_id: int

    model_config = ConfigDict(from_attributes=True)
