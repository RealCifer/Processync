import uuid
from sqlalchemy import Column, Boolean, DateTime, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from ..core.db import Base

class Result(Base):
    __tablename__ = "results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True, index=True)
    
    extracted_data = Column(JSONB, nullable=False, default={})
    edited_data = Column(JSONB, nullable=True)
    is_finalized = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    document = relationship("Document", back_populates="results")
    job = relationship("Job", back_populates="result")

    __table_args__ = (
        Index("idx_results_extracted_data", "extracted_data", postgresql_using="gin"),
        Index("idx_results_edited_data", "edited_data", postgresql_using="gin"),
    )
