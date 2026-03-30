from app.ai_enrichment.schemas import TaskEnrichmentInput, TaskEnrichmentResult


class MockTaskEnrichmentProvider:
    """Local fallback provider when external AI is disabled/unavailable."""

    def generate(self, task: TaskEnrichmentInput) -> TaskEnrichmentResult:
        due_hint = f" by {task.due_date.isoformat()}" if task.due_date else ""
        tags_hint = f" Tags to keep in mind: {', '.join(task.tags)}." if task.tags else ""
        description = task.description or "No extra description was provided."
        priority = task.priority or "medium"
        category = task.suggestion_category.strip().lower() or "general"

        return TaskEnrichmentResult(
            overview=(
                f"This task focuses on '{task.title}'. {description} "
                f"Current priority is {priority}{due_hint}."
            ),
            suggestions=(
                f"Category Suggestions (70%) - {category}\n"
                f"- Prioritize actions and language aligned with {category} outcomes.\n"
                f"- Define measurable milestones specific to {category} delivery.\n"
                f"- Run a short review loop with a {category}-focused checklist.\n\n"
                "Extras (30%) - adjacent categories\n"
                "- Add one collaboration step with a nearby function to reduce handoff risk.\n"
                "- Add one customer/user feedback check to keep execution grounded.\n"
                f"- Add one implementation-quality guardrail (tests, QA, or validation).{tags_hint}"
            ),
            impact=(
                "Completing this should reduce pending work, increase momentum, and improve "
                "delivery consistency for related commitments."
            ),
            skills_improvement=(
                "Planning, execution discipline, prioritization, and communication through "
                "clear progress updates."
            ),
        )
