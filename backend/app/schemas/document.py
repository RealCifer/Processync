from pydantic import BaseModel, UUID4, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any, List
from ..models.job import JobStatus

class JobResponse(BaseModel):
    id: UUID4
    job_type: str
    status: JobStatus
    progress_percentage: int
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ResultResponse(BaseModel):
    id: UUID4
    extracted_data: Dict[str, Any]
    edited_data: Optional[Dict[str, Any]] = None
    is_finalized: bool

    model_config = ConfigDict(from_attributes=True)

class DocumentBase(BaseModel):
    filename: str

class DocumentCreate(DocumentBase):
    file_path: str
    original_filename: str
    file_size: int
    mime_type: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: UUID4
    original_filename: str
    file_size: int
    mime_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    jobs: List[JobResponse] = []
    results: List[ResultResponse] = []

    model_config = ConfigDict(from_attributes=True)
