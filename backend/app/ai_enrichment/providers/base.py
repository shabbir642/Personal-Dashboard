from typing import Protocol

from app.ai_enrichment.schemas import TaskEnrichmentInput, TaskEnrichmentResult


class TaskEnrichmentProvider(Protocol):
    def generate(self, task: TaskEnrichmentInput) -> TaskEnrichmentResult:
        ...
