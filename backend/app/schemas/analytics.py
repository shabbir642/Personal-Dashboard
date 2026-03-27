from datetime import date

from pydantic import BaseModel


class CountByLabel(BaseModel):
    label: str
    count: int


class CompletionOverTimePoint(BaseModel):
    date: date
    count: int
