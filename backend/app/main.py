import logging
import time
from uuid import uuid4

from fastapi import FastAPI
from fastapi import HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.analytics import router as analytics_router
from app.api.routes.task_ai_insights import router as task_ai_insights_router
from app.api.routes.task_details import router as task_details_router
from app.api.routes.task_logs import router as task_logs_router
from app.api.routes.tasks import router as tasks_router
from app.core.database import Base, engine
from app.core.logging import configure_logging
import app.models  # noqa: F401

configure_logging()
logger = logging.getLogger("app")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def error_logging_middleware(request: Request, call_next):
    request_id = str(uuid4())
    start_time = time.perf_counter()

    try:
        response = await call_next(request)
    except Exception:
        duration_ms = int((time.perf_counter() - start_time) * 1000)
        logger.exception(
            "Unhandled request error | request_id=%s method=%s path=%s duration_ms=%s",
            request_id,
            request.method,
            request.url.path,
            duration_ms,
        )
        raise

    duration_ms = int((time.perf_counter() - start_time) * 1000)
    response.headers["X-Request-ID"] = request_id

    if response.status_code >= 500:
        logger.error(
            "Server error response | request_id=%s method=%s path=%s status=%s duration_ms=%s",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
    elif response.status_code >= 400:
        logger.warning(
            "Client error response | request_id=%s method=%s path=%s status=%s duration_ms=%s",
            request_id,
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )

    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code >= 500:
        logger.error(
            "HTTPException | method=%s path=%s status=%s detail=%s",
            request.method,
            request.url.path,
            exc.status_code,
            exc.detail,
        )
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(
        "Unhandled exception | method=%s path=%s error=%s",
        request.method,
        request.url.path,
        str(exc),
    )
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@app.get("/")
def health_check():
    return {"message": "Task Dashboard API is running"}


app.include_router(tasks_router, prefix="/api")
app.include_router(task_ai_insights_router, prefix="/api")
app.include_router(task_details_router, prefix="/api")
app.include_router(task_logs_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
