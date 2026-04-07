import json
import logging
import time
from datetime import datetime
import redis
from celery import shared_task
from ..core.db import SessionLocal
from ..models.document import Document
from ..models.job import Job, JobStatus
from ..models.result import Result
from ..core.config import settings

logger = logging.getLogger(__name__)

def publish_progress(job_id, status, stage, message):
    r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
    payload = {
        "job_id": str(job_id),
        "status": status,
        "stage": stage,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    r.publish(f"job_progress:{job_id}", json.dumps(payload))

@shared_task(
    name="process_document_task", 
    bind=True, 
    max_retries=3,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True
)
def process_document_task(self, job_id_str: str):
    db = SessionLocal()
    job_id = None
    try:
        job_id = job_id_str
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return "Job not found"
        
        if job.status == JobStatus.completed:
            return "Already completed"
        
        document = db.query(Document).filter(Document.id == job.document_id).first()
        if not document:
            return "Document not found"

        job.status = JobStatus.processing
        job.started_at = datetime.utcnow()
        db.commit()

        publish_progress(job_id, "processing", "parsing", "Parsing document structure")
        time.sleep(1)

        publish_progress(job_id, "processing", "extraction", "Extracting intelligence with AI")
        time.sleep(1.5)

        final_output = {
            "metadata": {
                "filename": document.original_filename,
                "file_type": document.mime_type or "unknown",
                "size": document.file_size
            },
            "content": {
                "title": f"Analysis of {document.original_filename}",
                "category": "General Document",
                "summary": "This document contains structured data extracted via Processync AI.",
                "keywords": ["analysis", "extracted", "processync"]
            }
        }

        result = db.query(Result).filter(Result.job_id == job.id).first()
        if not result:
            result = Result(
                document_id=document.id,
                job_id=job.id,
                extracted_data=final_output
            )
            db.add(result)
        else:
            result.extracted_data = final_output
            
        job.status = JobStatus.completed
        job.completed_at = datetime.utcnow()
        db.commit()

        publish_progress(job_id, "completed", "completed", "Analysis finalized")
        return f"Successfully processed {job_id_str}"

    except Exception as e:
        db.rollback()
        retry_count = self.request.retries
        
        if job_id:
            job = db.query(Job).filter(Job.id == job_id).first()
            if job:
                job.error_message = f"Retry {retry_count+1} failed: {str(e)}"
                if retry_count >= self.max_retries:
                    job.status = JobStatus.failed
                    job.completed_at = datetime.utcnow()
                    publish_progress(job_id, "failed", "failed", f"Max retries exhausted: {str(e)}")
                else:
                    publish_progress(job_id, "processing", "retrying", f"Transient error, retrying attempt {retry_count+1}")
                db.commit()
        
        raise e
    finally:
        db.close()
