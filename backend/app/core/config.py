import os


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./task_dashboard.db")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
