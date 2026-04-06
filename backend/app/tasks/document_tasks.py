import time
import random
from celery import shared_task
from ..core.db import SessionLocal
from ..models.document import Document, TaskStatus
import redis
from ..core.config import settings

# Redis connection for Pub/Sub progress updates
r = redis.from_url(settings.REDIS_URL)

@shared_task(name="process_document_task")
def process_document_task(doc_id: int):
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return "Document not found"
        
        # Update Status to Processing
        doc.status = TaskStatus.PROCESSING
        db.commit()
        
        # Simulate Intensive Document Processing (OCR, Analysis, etc.)
        total_steps = 10
        for i in range(1, total_steps + 1):
            time.sleep(random.uniform(0.5, 1.5)) # Simulate work
            progress = int((i / total_steps) * 100)
            
            # Update Database
            doc.progress = progress
            db.commit()
            
            # Pub/Sub for Real-time Frontend Progress
            r.publish(f"doc_progress_{doc_id}", progress)
            print(f"Document {doc_id} Progress: {progress}%")
            
        # Complete
        doc.status = TaskStatus.COMPLETED
        doc.result = {"analysis": "Sample AI processed result", "entities": ["Entity A", "Entity B"]}
        db.commit()
        
        return f"Document {doc_id} processed successfully"
        
    except Exception as e:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if doc:
            doc.status = TaskStatus.FAILED
            db.commit()
        return f"Error: {str(e)}"
    finally:
        db.close()
