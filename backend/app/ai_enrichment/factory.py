import logging

from app.ai_enrichment.providers.base import TaskEnrichmentProvider
from app.ai_enrichment.providers.mock_provider import MockTaskEnrichmentProvider
from app.ai_enrichment.providers.openai_provider import OpenAITaskEnrichmentProvider
from app.core.config import (
    TASK_AI_MODEL,
    TASK_AI_OPENAI_API_KEY,
    TASK_AI_PROVIDER,
)

logger = logging.getLogger("app")


def get_task_enrichment_provider() -> TaskEnrichmentProvider:
    provider = TASK_AI_PROVIDER.lower()

    if provider == "openai":
        if not TASK_AI_OPENAI_API_KEY:
            logger.warning("TASK_AI_PROVIDER=openai but TASK_AI_OPENAI_API_KEY is missing; using mock provider")
            return MockTaskEnrichmentProvider()
        return OpenAITaskEnrichmentProvider(api_key=TASK_AI_OPENAI_API_KEY, model=TASK_AI_MODEL)

    return MockTaskEnrichmentProvider()
