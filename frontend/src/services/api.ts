import { Document } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}

export async function getDocumentStatus(docId: number): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/status/${docId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch status');
  }

  return response.json();
}
