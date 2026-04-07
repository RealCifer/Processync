const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
  jobs: Job[];
  results: ExtractionResult[];
}

export interface Job {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
}

export interface ExtractionResult {
  id: string;
  extracted_data: {
    metadata: {
      filename: string;
      file_type: string;
      size: number;
    };
    content: {
      title: string;
      category: string;
      summary: string;
      keywords: string[];
    };
  };
  edited_data: any;
  is_finalized: boolean;
  created_at: string;
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }
  return response.json();
}

export async function getDocuments(): Promise<Document[]> {
  const response = await fetch(`${API_BASE_URL}/documents/`);
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
}

export async function getDocument(id: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}`);
  if (!response.ok) throw new Error('Failed to fetch document details');
  return response.json();
}

export async function finalizeDocument(id: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/finalize`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to finalize document');
  return response.json();
}

export async function updateResult(id: string, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ edited_data: data }),
  });
  if (!response.ok) throw new Error('Failed to update result');
  return response.json();
}

export function getExportUrl(id: string, format: 'json' | 'csv'): string {
  return `${API_BASE_URL}/documents/${id}/export/${format}`;
}
