import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from ..core.db import Base

class JobStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    job_type = Column(String, nullable=False)
    status = Column(SqlEnum(JobStatus), default=JobStatus.pending)
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="jobs")
