'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadDocument, Document } from '@/services/api';

const STAGES = ['initializing', 'parsing', 'extraction', 'completed'];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [progress, setProgress] = useState<{
    status: string;
    stage: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const wsUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws') 
      : 'ws://localhost:8000';
    const ws = new WebSocket(`${wsUrl}/ws/progress/${jobId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WS Progress:', data.stage, data.status);
      setProgress(data);
    };

    ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
      // We don't necessarily set Error here to avoid interrupting the UI if it's almost done
      // but if status is not completed, we might want to tell the user
    };

    return () => ws.close();
  }, [jobId]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const doc = await uploadDocument(file);
      setDocument(doc);
      if (doc.jobs && doc.jobs.length > 0) {
        setJobId(doc.jobs[0].id);
      } else {
        // If no jobs returned, it might be already processed or backend error
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError('Upload failed. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setJobId(null);
    setDocument(null);
    setProgress(null);
    setLoading(false);
  };

  const getDisplayStage = (rawStage: string) => {
    if (!rawStage) return 'initializing';
    if (rawStage.startsWith('parsing')) return 'parsing';
    if (rawStage.startsWith('extraction')) return 'extraction';
    return rawStage; // 'initializing', 'completed', 'failed'
  };

  const currentDisplayStage = getDisplayStage(progress?.stage || '');
  const stageIndex = STAGES.indexOf(currentDisplayStage);
  const isCompleted = progress?.status === 'completed' || currentDisplayStage === 'completed';

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white leading-tight">Analyze Document</h1>
          <p className="text-neutral-400 text-sm">Upload a PDF or Image to extract structured data.</p>
        </div>

        <div className="space-y-6 bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-sm">
          {!jobId && !isCompleted ? (
            /* UPLOAD SECTION */
            <div className="space-y-6">
              <div className="group relative border-2 border-dashed border-neutral-800 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl p-10 text-center transition-all cursor-pointer">
                <input 
                  type="file" 
                  id="file-input" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleFileChange}
                />
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-neutral-800 rounded-lg mx-auto flex items-center justify-center text-neutral-400 group-hover:text-blue-500 transition-colors">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{file ? file.name : 'Select document'}</p>
                    <p className="text-xs text-neutral-500 mt-1">Maximum size: 10MB (PDF, PNG, JPG)</p>
                  </div>
                </div>
              </div>

              <button
                disabled={!file || loading}
                onClick={handleUpload}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 py-3 rounded-lg font-bold text-sm transition-all active:scale-[0.98] shadow-md shadow-blue-900/10"
              >
                {loading ? (
                    <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Initializing...
                    </div>
                ) : 'Analyze Document'}
              </button>
            </div>
          ) : !isCompleted ? (
            /* PROGRESS SECTION */
            <div className="space-y-8 py-2 text-center">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                   <p className="text-sm font-bold text-blue-500 uppercase tracking-widest">{progress?.status || 'Processing'}</p>
                   <p className="text-xs text-neutral-500 font-mono opacity-50">{jobId}</p>
                </div>

                <div className="space-y-6">
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-700 ease-in-out"
                      style={{ 
                          width: Math.max(5, (stageIndex + 1) * 25) + '%' 
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                     {STAGES.map((stage) => {
                         const stageIdx = STAGES.indexOf(stage);
                         const isActive = stageIdx <= stageIndex;
                         const isCurrent = stageIdx === stageIndex;

                         return (
                             <div key={stage} className="flex flex-col items-center gap-2">
                                <div className={`w-2 h-2 rounded-full transition-all ${isActive ? (progress?.status === 'failed' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]') : 'bg-neutral-800'}`} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isCurrent ? 'text-blue-500' : 'text-neutral-600'}`}>{stage}</span>
                             </div>
                         );
                     })}
                  </div>
                </div>
              </div>

              <div className="bg-neutral-800/20 rounded-lg p-5 border border-neutral-800/50">
                 <p className="text-sm text-neutral-300 font-medium">
                    {progress?.message || 'Connecting to process cluster...'}
                 </p>
              </div>
            </div>
          ) : (
            /* RESULT SECTION */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
               <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full mx-auto flex items-center justify-center border border-emerald-500/20">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                     </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Analysis Complete</h2>
                  <p className="text-neutral-400 text-sm font-medium">Successfully extracted structured data.</p>
               </div>

               <div className="bg-neutral-800/30 rounded-xl p-6 border border-neutral-800 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
                     <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest leading-none">Document Snapshot</span>
                     <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                        Verified
                     </span>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                     <div className="flex justify-between items-center gap-4">
                        <span className="text-sm text-neutral-400 font-medium">Filename</span>
                        <span className="text-sm text-white font-semibold truncate max-w-[240px]">{document?.original_filename || 'Unknown Document'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-400 font-medium">File Size</span>
                        <span className="text-sm text-white font-semibold">
                            {typeof document?.file_size === 'number' ? `${(document.file_size / 1024).toFixed(1)} KB` : '0.0 KB'}
                        </span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-400 font-medium">Format</span>
                        <span className="text-sm text-white font-semibold uppercase">{document?.mime_type?.split('/')[1] || 'PDF'}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                  >
                    View in Dashboard
                  </button>
                  <button 
                    onClick={() => {
                        setJobId(null);
                        setDocument(null);
                        setProgress(null);
                        setFile(null);
                    }}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-3 rounded-lg text-sm transition-all active:scale-[0.98] border border-neutral-700/50"
                  >
                    Analyze Another
                  </button>
               </div>
            </div>
          )}

          {error && (
            <div className="text-xs font-semibold text-rose-500 bg-rose-500/5 border border-rose-500/10 rounded-lg p-4 text-center animate-in shake-200">
               {error}
               <button 
                onClick={() => setError(null)}
                className="block mx-auto mt-2 text-rose-400 hover:underline opacity-80 hover:opacity-100 transition-opacity"
               >
                Try again
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
