from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class TaskAIInsight(Base):
    __tablename__ = "task_ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, unique=True)
    overview = Column(Text, nullable=False)
    suggestions = Column(Text, nullable=False)
    impact = Column(Text, nullable=False)
    skills_improvement = Column(Text, nullable=False)
    provider = Column(String(50), nullable=True)
    model_name = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    task = relationship("Task", back_populates="ai_insight")
