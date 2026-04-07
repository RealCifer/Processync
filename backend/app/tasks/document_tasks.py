import time
import random
import json
import uuid
import logging
from datetime import datetime
from celery import shared_task
from ..core.db import SessionLocal
from ..models.job import Job, JobStatus
from ..models.result import Result
from ..core.redis import get_redis_client

logger = logging.getLogger(__name__)
r = get_redis_client()

def publish_progress(job_id, status, stage, message):
    """Utility to publish progress events to Redis Pub/Sub."""
    payload = {
        "job_id": str(job_id),
        "status": status,
        "stage": stage,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    }
    r.publish(f"job_progress:{job_id}", json.dumps(payload))

@shared_task(name="process_document_task", bind=True, max_retries=3)
def process_document_task(self, job_id_str: str):
    db = SessionLocal()
    job_id = None
    try:
        job_id = uuid.UUID(job_id_str)
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            logger.error(f"Job {job_id_str} not found")
            return "Job not found"
        
        # job_started
        job.status = JobStatus.processing
        job.started_at = datetime.utcnow()
        db.commit()
        publish_progress(job_id, "processing", "job_started", "Job execution started")
        
        # --- PHASE 1: PARSING ---
        publish_progress(job_id, "processing", "parsing", f"Parsing metadata for {document.original_filename}...")
        time.sleep(1.5)
        
        metadata = {
            "filename": document.original_filename,
            "file_type": document.mime_type or "application/octet-stream",
            "size_bytes": document.file_size
        }
        
        publish_progress(job_id, "processing", "parsing_completed", "Metadata extraction complete")
        
        # --- PHASE 2: EXTRACTION ---
        publish_progress(job_id, "processing", "extraction", "Running AI content extraction...")
        
        # Simulate heavy processing
        stages = ["Analyzing layout", "Extracting text blocks", "Identifying entities", "Summarizing content"]
        for i, stage in enumerate(stages):
            time.sleep(random.uniform(1.0, 2.0))
            progress = 45 + ((i + 1) * 10) # 55, 65, 75, 85
            publish_progress(job_id, "processing", "extraction", f"{stage}...")

        # Generate realistic simulated data
        clean_name = document.original_filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
        categories = ["Financial", "Legal", "Invoice", "Technical Documentation", "Medical Report", "General Correspondence"]
        category = random.choice(categories)
        
        content = {
            "title": f"Analyzed: {clean_name}",
            "category": category,
            "summary": f"This document appears to be a {category.lower()} record. It mentions several key entities and has been processed for structural integrity. The file size is {document.file_size} bytes.",
            "keywords": [clean_name.split()[0].lower(), category.lower(), "processync", "ai-extracted"]
        }
        
        publish_progress(job_id, "processing", "extraction_completed", "Content analysis finished")
        
        # --- PHASE 3: STORAGE ---
        publish_progress(job_id, "processing", "storage", "Saving results to database...")
        
        final_data = {
            "metadata": metadata,
            "content": content
        }

        # Create or update Result
        result = db.query(Result).filter(Result.job_id == job.id).first()
        if not result:
            result = Result(
                document_id=job.document_id,
                job_id=job.id,
                extracted_data=final_data
            )
            db.add(result)
        else:
            result.extracted_data = final_data
        
        # Finalize job
        job.status = JobStatus.completed
        job.completed_at = datetime.utcnow()
        job.progress_percentage = 100
        db.commit()
        
        publish_progress(job_id, "completed", "completed", "All stages completed successfully")
        
        return f"Job {job_id} processed successfully with structured output"
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing job {job_id_str}: {str(e)}")
        
        if job_id:
            publish_progress(job_id, "failed", "failed", f"Processing failed: {str(e)}")
            job = db.query(Job).filter(Job.id == job_id).first()
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
