from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from ..models.document import TaskStatus

class DocumentBase(BaseModel):
    filename: str

class DocumentCreate(DocumentBase):
    file_path: str

class DocumentUpdate(BaseModel):
    status: Optional[TaskStatus]
    progress: Optional[int]
    result: Optional[Dict[str, Any]]

class DocumentResponse(DocumentBase):
    id: int
    status: str
    progress: int
    result: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
