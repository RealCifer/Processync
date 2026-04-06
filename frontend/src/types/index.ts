export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  job_type: string;
  status: JobStatus;
  progress_percentage: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
}

export interface Result {
  id: string;
  extracted_data: {
    analysis?: string;
    entities?: string[];
    [key: string]: any;
  };
  edited_data?: any;
  is_finalized: boolean;
}

export interface Document {
  id: string;
  original_filename: string;
  file_size: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
  jobs: Job[];
  results: Result[];
}
