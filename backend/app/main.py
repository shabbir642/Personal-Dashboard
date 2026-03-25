from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.tasks import router as tasks_router
from app.core.database import Base, engine
from app.models import task, task_detail, task_log  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"message": "Task Dashboard API is running"}


app.include_router(tasks_router, prefix="/api")
