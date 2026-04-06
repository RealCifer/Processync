import uuid
from sqlalchemy import Column, String, BigInteger, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..core.db import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(2048), nullable=False)
    file_size = Column(BigInteger, nullable=False, default=0)
    mime_type = Column(String(100), nullable=True)
    is_deleted = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    jobs = relationship("Job", back_populates="document", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="document", cascade="all, delete-orphan")
