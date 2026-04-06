export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Document {
  id: number;
  filename: string;
  status: DocumentStatus;
  progress: number;
  result?: {
    analysis?: string;
    entities?: string[];
  };
  created_at: string;
  updated_at: string;
}
