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
from ..models.document import Document
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
        
        # Fetch the source document
        document = db.query(Document).filter(Document.id == job.document_id).first()
        if not document:
            logger.error(f"Document for job {job_id} not found")
            publish_progress(job_id, "failed", "failed", "Source document not found")
            return "Document not found"

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
            "size": document.file_size
        }
        
        publish_progress(job_id, "processing", "parsing_completed", "Metadata extraction complete")
        
        # --- PHASE 2: EXTRACTION ---
        publish_progress(job_id, "processing", "extraction", "Running AI content extraction...")
        
        # Simulate realistic multi-step analysis
        analysis_steps = [
            "Analyzing document layout and structure",
            "Extracting contextual text blocks",
            "Identifying key entities and metadata",
            "Generating automated summary"
        ]
        
        for i, step in enumerate(analysis_steps):
            time.sleep(random.uniform(1.0, 2.0))
            publish_progress(job_id, "processing", "extraction", f"{step}...")

        # Generate realistic simulated content
        clean_name = document.original_filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
        
        # Infer category from filename if possible
        fn_lower = document.original_filename.lower()
        if "invoice" in fn_lower or "bill" in fn_lower:
            category = "Invoice"
        elif "report" in fn_lower:
            category = "Report"
        elif "legal" in fn_lower or "contract" in fn_lower:
            category = "Legal"
        else:
            category = random.choice(["Financial", "Technical Documentation", "Medical Record", "General Correspondence"])
        
        content = {
            "title": f"Processync analysis: {clean_name}",
            "category": category,
            "summary": f"Automated analysis of {document.original_filename}. This {category.lower()} document has been processed for structural data extraction and indexed for search readiness.",
            "keywords": [clean_name.split()[0].lower(), category.lower(), "processync", "automated-extraction"]
        }
        
        publish_progress(job_id, "processing", "extraction_completed", "Content extraction and analysis finished")
        
        # --- PHASE 3: STORAGE ---
        publish_progress(job_id, "processing", "storage", "Persisting structured analysis to database...")
        
        final_output = {
            "metadata": metadata,
            "content": content
        }

        # Create or update Result record
        result = db.query(Result).filter(Result.job_id == job.id).first()
        if not result:
            result = Result(
                document_id=job.document_id,
                job_id=job.id,
                extracted_data=final_output
            )
            db.add(result)
        else:
            result.extracted_data = final_output
        
        # Mark job as completed
        job.status = JobStatus.completed
        job.completed_at = datetime.utcnow()
        job.progress_percentage = 100
        db.commit()
        
        publish_progress(job_id, "completed", "completed", "Document processing completed successfully")
        
        return f"Job {job_id} processed successfully with structured JSON output"
        
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
