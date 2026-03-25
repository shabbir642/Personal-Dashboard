from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class TaskDetail(Base):
    __tablename__ = "task_details"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, unique=True)
    assigned_by = Column(String(255), nullable=True)
    approach = Column(Text, nullable=True)
    key_learnings = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    task = relationship("Task", back_populates="detail")
