import os
import shutil
import uuid
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from ..repositories.document_repo import DocumentRepository
from ..core.config import settings
from ..schemas.document import DocumentResponse
from ..core.redis import get_redis_client
import json
from datetime import datetime

class DocumentService:
    def __init__(self, db: Session):
        self.repo = DocumentRepository(db)
        self.redis = get_redis_client()

    def _publish_queued_event(self, job_id: uuid.UUID):
        payload = {
            "job_id": str(job_id),
            "status": "queued",
            "stage": "job_queued",
            "message": "Job added to queue",
            "timestamp": datetime.utcnow().isoformat()
        }
        self.redis.publish(f"job_progress:{job_id}", json.dumps(payload))

    async def process_upload(self, file: UploadFile):
        import logging
        from fastapi import HTTPException
        from sqlalchemy.exc import OperationalError
        logger = logging.getLogger(__name__)

        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, file.filename)

        # Step 1: always save the file — never fail here
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

        # Step 2: try to persist to DB — degrade gracefully if DB is down
        try:
            db_doc = self.repo.create(doc_data)
        except OperationalError as e:
            logger.error(f"DB unavailable during upload: {e}")
            raise HTTPException(
                status_code=503,
                detail="File saved to disk but database is unavailable. Retry later."
            )
        except Exception as e:
            logger.error(f"Unexpected DB error during upload: {e}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        # Step 3: try Celery — don't crash the request if Redis is down
        try:
            from ..workers.celery_app import celery_app
            job = db_doc.jobs[0]
            celery_app.send_task("process_document_task", args=[str(job.id)])
            self._publish_queued_event(job.id)
            logger.info(f"Celery task queued for job {job.id}")
        except Exception as e:
            logger.warning(f"Celery unavailable, task not queued: {e}")

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
        
        # Create a new job if the old one is failed, or reuse logic
        if not job or job.status != "failed":
            # Just create a new job to force retry for simplicity
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
        result = self.repo.get_result_by_doc_id(doc_id)
        if not result:
            raise HTTPException(status_code=404, detail="Result not found for document")
            
        data = result.edited_data if result.edited_data else result.extracted_data
        
        # Here we could generate CSV from the dict if requested, but for now we return JSON
        # CSV could be generated using dictto_csv techniques
        return {"document_id": doc_id, "data": data}
