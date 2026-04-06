from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .core.db import engine, Base, get_db
from .models.document import Document
from .models.job import Job, JobStatus
from .schemas.document import DocumentResponse
from .core.config import settings
from .tasks.document_tasks import process_document_task
import shutil
import os
import uuid

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to Processync AI API"}

@app.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Get file size
    file_size = os.path.getsize(file_path)
        
    db_doc = Document(
        filename=file.filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type
    )
    db.add(db_doc)
    db.flush() # To get db_doc.id before committing

    db_job = Job(
        document_id=db_doc.id,
        job_type="extraction"
    )
    db.add(db_job)

    db.commit()
    db.refresh(db_doc)
    
    from ..workers.celery_app import celery_app
    celery_app.send_task("process_document_task", args=[str(db_job.id)])
    
    return db_doc

@app.get("/status/{doc_id}", response_model=DocumentResponse)
async def get_task_status(doc_id: uuid.UUID, db: Session = Depends(get_db)):
    db_doc = db.query(Document).filter(Document.id == doc_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_doc
