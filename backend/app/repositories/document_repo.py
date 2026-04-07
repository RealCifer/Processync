from sqlalchemy.orm import Session
import json
from ..models.document import Document
from ..models.job import Job
from ..models.result import Result
from typing import List, Optional
import uuid

class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, doc_data: dict) -> Document:
        db_doc = Document(**doc_data)
        self.db.add(db_doc)
        self.db.flush()
        
        db_job = Job(
            document_id=db_doc.id,
            job_type="extraction"
        )
        self.db.add(db_job)
        self.db.commit()
        self.db.refresh(db_doc)
        return db_doc
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Document]:
        return self.db.query(Document).filter(Document.is_deleted == False).order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
        
    def get_by_id(self, doc_id: str) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == doc_id, Document.is_deleted == False).first()

    def get_job_by_id(self, job_id: str) -> Optional[Job]:
        return self.db.query(Job).filter(Job.id == job_id).first()

    def get_job_by_doc_id(self, doc_id: str) -> Optional[Job]:
        return self.db.query(Job).filter(Job.document_id == doc_id, Job.job_type == "extraction").order_by(Job.created_at.desc()).first()

    def create_job(self, doc_id: str, job_type: str) -> Job:
        new_job = Job(
            document_id=doc_id,
            job_type=job_type
        )
        self.db.add(new_job)
        self.db.commit()
        self.db.refresh(new_job)
        return new_job

    def get_result_by_doc_id(self, doc_id: str) -> Optional[Result]:
        return self.db.query(Result).filter(Result.document_id == doc_id).first()

    def update_result_data(self, result: Result, edited_data: dict) -> Result:
        print(f"DEBUG: saving edited_data type: {type(edited_data)}")
        if not isinstance(edited_data, (dict, list)):
            raise ValueError(f"Invalid edited_data type: {type(edited_data)}")
        result.edited_data = json.dumps(edited_data)
        self.db.commit()
        self.db.refresh(result)
        return result

    def finalize_result(self, result: Result) -> Result:
        result.is_finalized = True
        self.db.commit()
        self.db.refresh(result)
        return result
