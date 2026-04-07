from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime
import uuid

class JobStatus(BaseModel):
    id: str
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class ResultBase(BaseModel):
    id: str
    extracted_data: Any
    edited_data: Optional[Any] = None
    is_finalized: bool
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size: int
    mime_type: Optional[str]
    created_at: datetime
    jobs: List[JobStatus] = []
    results: List[ResultBase] = []

    class Config:
        from_attributes = True

class ResultUpdate(BaseModel):
    edited_data: Any

class ResultResponse(ResultBase):
    pass
