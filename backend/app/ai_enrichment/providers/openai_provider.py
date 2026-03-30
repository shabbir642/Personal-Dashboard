import json
from urllib.request import Request, urlopen

from app.ai_enrichment.schemas import TaskEnrichmentInput, TaskEnrichmentResult


class OpenAITaskEnrichmentProvider:
    def __init__(self, api_key: str, model: str, timeout_seconds: int = 20):
        self.api_key = api_key
        self.model = model
        self.timeout_seconds = timeout_seconds

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

        req = Request(
            "https://api.openai.com/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        with urlopen(req, timeout=self.timeout_seconds) as response:  # nosec B310
            body = json.loads(response.read().decode("utf-8"))

        content = body["choices"][0]["message"]["content"]
        parsed = json.loads(content)
        return TaskEnrichmentResult.model_validate(parsed)
