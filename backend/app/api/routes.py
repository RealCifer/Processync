from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..services.document_service import DocumentService
from ..schemas.document import DocumentResponse, ResultResponse, ResultUpdate
from typing import List, Dict, Any
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])

def get_service(db: Session = Depends(get_db)):
    return DocumentService(db)

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...), 
    service: DocumentService = Depends(get_service)
):
    try:
        return await service.process_upload(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    skip: int = 0, 
    limit: int = 100, 
    service: DocumentService = Depends(get_service)
):
    return service.get_all_documents(skip=skip, limit=limit)

@router.get("/{id}", response_model=DocumentResponse)
def get_document(
    id: str, 
    service: DocumentService = Depends(get_service)
):
    return service.get_document_details(id)

@router.post("/{id}/retry")
def retry_job(
    id: str, 
    service: DocumentService = Depends(get_service)
):
    return service.retry_job(id)

@router.put("/{id}/update", response_model=ResultResponse)
def update_result(
    id: str, 
    update_data: ResultUpdate,
    service: DocumentService = Depends(get_service)
):
    return service.update_result(id, update_data.edited_data)

@router.post("/{id}/finalize", response_model=ResultResponse)
def finalize_result(
    id: str, 
    service: DocumentService = Depends(get_service)
):
    return service.finalize_result(id)

@router.get("/{id}/export")
def export_data(
    id: str, 
    service: DocumentService = Depends(get_service)
):
    return service.export_data(id)
