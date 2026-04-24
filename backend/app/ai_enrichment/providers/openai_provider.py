import json
import logging
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.ai_enrichment.schemas import TaskEnrichmentInput, TaskEnrichmentResult

logger = logging.getLogger("app")

_ENDPOINT = "https://api.openai.com/v1/chat/completions"
_RETRYABLE_STATUSES = {429, 500, 502, 503, 504}


class OpenAIProviderError(RuntimeError):
    pass


class OpenAITaskEnrichmentProvider:
    def __init__(
        self,
        api_key: str,
        model: str,
        timeout_seconds: int = 20,
        max_retries: int = 2,
        backoff_seconds: float = 1.5,
    ):
        self.api_key = api_key
        self.model = model
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries
        self.backoff_seconds = backoff_seconds

    def generate(self, task: TaskEnrichmentInput) -> TaskEnrichmentResult:
        category = task.suggestion_category.strip() or "general"
        system_prompt = (
            "You are an assistant that enriches personal tasks. "
            "Return strict JSON with keys: overview, suggestions, impact, skills_improvement. "
            "For suggestions, always include two clearly labeled sections exactly in this order: "
            "'Category Suggestions (70%) - <category>' and 'Extras (30%) - adjacent categories'. "
            "The first section must mostly focus on the requested category. "
            "The second section must contain nearby-category ideas."
        )
        user_prompt = (
            "Generate structured enrichment for this task input:\n"
            f"{task.model_dump_json(indent=2)}\n\n"
            f"Requested suggestion category: {category}"
        )

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"},
        }

        body = self._request_with_retries(payload)
        return self._parse_response(body)

    def _request_with_retries(self, payload: dict) -> dict:
        last_error: Exception | None = None
        for attempt in range(self.max_retries + 1):
            try:
                return self._request(payload)
            except HTTPError as exc:
                last_error = exc
                if exc.code not in _RETRYABLE_STATUSES or attempt == self.max_retries:
                    raise OpenAIProviderError(f"OpenAI HTTP {exc.code}: {exc.reason}") from exc
            except URLError as exc:
                last_error = exc
                if attempt == self.max_retries:
                    raise OpenAIProviderError(f"OpenAI network error: {exc.reason}") from exc
            except json.JSONDecodeError as exc:
                raise OpenAIProviderError("OpenAI returned non-JSON response") from exc

            time.sleep(self.backoff_seconds * (2 ** attempt))
        raise OpenAIProviderError("OpenAI retries exhausted") from last_error

    def _request(self, payload: dict) -> dict:
        req = Request(
            _ENDPOINT,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urlopen(req, timeout=self.timeout_seconds) as response:  # nosec B310
            return json.loads(response.read().decode("utf-8"))

    def _parse_response(self, body: dict) -> TaskEnrichmentResult:
        try:
            content = body["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            logger.warning("Unexpected OpenAI response shape: %s", body)
            raise OpenAIProviderError("Unexpected OpenAI response shape") from exc

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            raise OpenAIProviderError("OpenAI response content was not valid JSON") from exc

        return TaskEnrichmentResult.model_validate(parsed)
