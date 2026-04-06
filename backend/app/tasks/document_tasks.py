import time
import random
from celery import shared_task
from ..core.db import SessionLocal
from ..models.job import Job, JobStatus
from ..models.result import Result
import redis
import uuid
from datetime import datetime
from ..core.config import settings

r = redis.from_url(settings.REDIS_URL)

@shared_task(name="process_document_task", bind=True, max_retries=3)
def process_document_task(self, job_id_str: str):
    db = SessionLocal()
    try:
        job_id = uuid.UUID(job_id_str)
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return "Job not found"
        
        job.status = JobStatus.processing
        job.started_at = datetime.utcnow()
        db.commit()
        
        total_steps = 10
        for i in range(1, total_steps + 1):
            time.sleep(random.uniform(0.5, 1.5))
            progress = int((i / total_steps) * 100)
            
            job.progress_percentage = progress
            db.commit()
            
            r.publish(f"doc_progress_{job.document_id}", progress)
            print(f"Job {job_id} Progress: {progress}%")
            
        # Create Result
        result = Result(
            document_id=job.document_id,
            job_id=job.id,
            extracted_data={"analysis": "Sample AI processed result", "entities": ["Entity A", "Entity B"]}
        )
        db.add(result)
        
        job.status = JobStatus.completed
        job.completed_at = datetime.utcnow()
        db.commit()
        
        return f"Job {job_id} processed successfully"
        
    except Exception as e:
        db.rollback()
        job = db.query(Job).filter(Job.id == uuid.UUID(job_id_str)).first()
        if job:
            job.retry_count += 1
            if job.retry_count >= job.max_retries:
                job.status = JobStatus.failed
                job.error_message = f"Max retries reached. Last error: {str(e)}"
                job.completed_at = datetime.utcnow()
            db.commit()
            
        try:
            self.retry(exc=e, countdown=10)
        except self.MaxRetriesExceededError:
            return f"Error: max retries reached. Final error: {str(e)}"
            
        return f"Job queued for retry due to: {str(e)}"
    finally:
        db.close()
