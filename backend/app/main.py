from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .core.db import engine, Base, get_db
from .models.document import Document, TaskStatus
from .schemas.document import DocumentResponse
from .core.config import settings
from .tasks.document_tasks import process_document_task
import shutil
import os

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS Middleware for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to Processync AI API"}

@app.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    
    # Save the file locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Create DB Entry
    db_doc = Document(filename=file.filename, file_path=file_path, status=TaskStatus.PENDING)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # Dispatch Celery Task
    # Note: Use delay() to send to workers
    from ..workers.celery_app import celery_app
    celery_app.send_task("process_document_task", args=[db_doc.id])
    
    return db_doc

@app.get("/status/{doc_id}", response_model=DocumentResponse)
async def get_task_status(doc_id: int, db: Session = Depends(get_db)):
    db_doc = db.query(Document).filter(Document.id == doc_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return db_doc
