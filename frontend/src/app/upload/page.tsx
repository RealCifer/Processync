'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadDocument } from '@/services/api';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    status: string;
    stage: string;
    message: string;
  } | null>(null);

  // WebSocket for real-time progress
  useEffect(() => {
    if (!jobId) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/progress/${jobId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
      if (data.status === 'completed') {
        // Automatically redirect to dashboard or detail after success
        setTimeout(() => {
            router.push('/dashboard');
        }, 1500);
      }
    };

    return () => ws.close();
  }, [jobId, router]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const doc = await uploadDocument(file);
      if (doc.jobs && doc.jobs.length > 0) {
        setJobId(doc.jobs[0].id);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-black tracking-tighter">ANALYZE NEW DOCUMENT</h1>
          <p className="text-slate-500 font-medium">Extract structured insights with AI-powered async pipelines.</p>
        </header>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800/80 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
          {!jobId ? (
            <div className="space-y-8">
              <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-16 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                <input 
                  type="file" 
                  id="file-input" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-input" className="cursor-pointer block space-y-4">
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{file ? file.name : 'Choose a document'}</p>
                    <p className="text-sm text-slate-500">PDF, DOCX, or Images up to 10MB</p>
                  </div>
                </label>
              </div>

              <button
                disabled={!file || loading}
                onClick={handleUpload}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-blue-900/10"
              >
                {loading ? 'Processing...' : 'Start Extraction'}
              </button>
            </div>
          ) : (
            <div className="space-y-10 py-4">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold uppercase tracking-tight">Processing your file</h3>
                <p className="text-blue-400 font-mono text-xs">{jobId}</p>
              </div>

              <div className="space-y-4">
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700"
                    style={{ 
                        width: progress?.stage === 'completed' ? '100%' : 
                               progress?.stage === 'extraction' ? '70%' : 
                               progress?.stage === 'parsing' ? '30%' : '10%' 
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span className={progress?.stage === 'initializing' ? 'text-blue-400' : ''}>Initialize</span>
                  <span className={progress?.stage === 'parsing' ? 'text-blue-400' : ''}>Parse</span>
                  <span className={progress?.stage === 'extraction' ? 'text-blue-400' : ''}>Extract</span>
                  <span className={progress?.status === 'completed' ? 'text-emerald-400' : ''}>Complete</span>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center animate-spin">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</p>
                    <p className="font-bold text-slate-200">{progress?.message || 'Queuing job...'}</p>
                 </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-center font-bold">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
