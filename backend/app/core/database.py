from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import DATABASE_URL

is_sqlite = DATABASE_URL.startswith("sqlite")
is_in_memory_sqlite = DATABASE_URL in {"sqlite://", "sqlite:///:memory:"}

engine_kwargs = {}
if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
if is_in_memory_sqlite:
    # Shared in-memory DB across connections while app process is alive.
    engine_kwargs["poolclass"] = StaticPool

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
