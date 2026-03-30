import os
from pathlib import Path


def _load_dotenv_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'").strip('"')
        os.environ.setdefault(key, value)


BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_DIR.parent
_load_dotenv_file(BACKEND_DIR / ".env")
_load_dotenv_file(PROJECT_ROOT / ".env")


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./task_dashboard.db")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


def _get_bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


TASK_AI_ENRICHMENT_ENABLED = _get_bool_env("TASK_AI_ENRICHMENT_ENABLED", default=True)
TASK_AI_PROVIDER = os.getenv("TASK_AI_PROVIDER", "mock")
TASK_AI_MODEL = os.getenv("TASK_AI_MODEL", "gpt-4.1-mini")
TASK_AI_OPENAI_API_KEY = os.getenv("TASK_AI_OPENAI_API_KEY")
