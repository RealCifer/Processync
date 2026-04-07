import os
import shutil
import uuid
import json
import io
import csv
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from ..repositories.document_repo import DocumentRepository
from ..core.config import settings
from ..core.redis import get_redis_client
from datetime import datetime

class DocumentService:
    def __init__(self, db: Session):
        self.repo = DocumentRepository(db)
        self.redis = get_redis_client()

    def _publish_queued_event(self, job_id: uuid.UUID):
        payload = {
            "job_id": str(job_id),
            "status": "queued",
            "stage": "initializing",
            "message": "Job added to queue"
        }
        self.redis.publish(f"job_progress:{job_id}", json.dumps(payload))

    async def process_upload(self, file: UploadFile):
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)

        doc_data = {
            "filename": file.filename,
            "original_filename": file.filename,
            "file_path": file_path,
            "file_size": file_size,
            "mime_type": file.content_type,
        }

        try:
            db_doc = self.repo.create(doc_data)
        except OperationalError:
            raise HTTPException(
                status_code=503,
                detail="File saved to disk but database is unavailable. Retry later."
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        try:
            from ..workers.celery_app import celery_app
            job = db_doc.jobs[0]
            celery_app.send_task("process_document_task", args=[str(job.id)])
            self._publish_queued_event(job.id)
        except Exception:
            pass

        return db_doc

    def get_all_documents(self, skip: int = 0, limit: int = 100):
        return self.repo.get_all(skip=skip, limit=limit)

    def get_document_details(self, doc_id: str):
        doc = self.repo.get_by_id(doc_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc

    def retry_job(self, doc_id: str):
        doc = self.repo.get_by_id(doc_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
            
        job = self.repo.get_job_by_doc_id(doc_id)
        
        if not job or job.status != "failed":
            job = self.repo.create_job(doc_id, "extraction")
            
        try:
            from ..workers.celery_app import celery_app
            celery_app.send_task("process_document_task", args=[str(job.id)])
            self._publish_queued_event(job.id)
        except ImportError:
            pass
            
        return {"message": "Job queued for retry", "job_id": str(job.id)}

    def update_result(self, doc_id: str, edited_data: dict):
        result = self.repo.get_result_by_doc_id(doc_id)
        if not result:
            raise HTTPException(status_code=404, detail="Result not found for document")
            
        if result.is_finalized:
            raise HTTPException(status_code=400, detail="Cannot edit finalized results")
            
        updated = self.repo.update_result_data(result, edited_data)
        return updated
        
    def finalize_result(self, doc_id: str):
        result = self.repo.get_result_by_doc_id(doc_id)
        if not result:
            raise HTTPException(status_code=404, detail="Result not found for document")
            
        finalized = self.repo.finalize_result(result)
        return finalized

    def export_data(self, doc_id: str):
        doc = self.repo.get_by_id(doc_id)
        result = self.repo.get_result_by_doc_id(doc_id)
        if not doc or not result:
            raise HTTPException(status_code=404, detail="Analysis results not found")
            
        return {
            "document_id": doc_id,
            "filename": doc.original_filename,
            "processed_at": result.created_at.isoformat(),
            "is_finalized": result.is_finalized,
            "data": result.edited_data if result.edited_data else result.extracted_data
        }

    def export_csv(self, doc_id: str):
        doc = self.repo.get_by_id(doc_id)
        result = self.repo.get_result_by_doc_id(doc_id)
        if not doc or not result:
            raise HTTPException(status_code=404, detail="Analysis results not found")

        content = result.edited_data.get("content", {}) if result.edited_data else result.extracted_data.get("content", {})
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Filename", "Title", "Category", "Summary", "Keywords"])
        writer.writerow([
            doc.original_filename,
            content.get("title", "N/A"),
            content.get("category", "N/A"),
            content.get("summary", "N/A"),
            ", ".join(content.get("keywords", []))
        ])
        
        return output.getvalue()
