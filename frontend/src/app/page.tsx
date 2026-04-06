'use client';

import { useState, useEffect } from 'react';
import { uploadDocument, getDocumentStatus } from '@/services/api';
import { Document } from '@/types';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (doc && doc.jobs && doc.jobs.length > 0) {
      const activeJob = doc.jobs[0];
      if (activeJob.status === 'queued' || activeJob.status === 'processing') {
        interval = setInterval(async () => {
          try {
            const updatedDoc = await getDocumentStatus(doc.id);
            setDoc(updatedDoc);
            const newActiveJob = updatedDoc.jobs?.[0];
            if (newActiveJob && (newActiveJob.status === 'completed' || newActiveJob.status === 'failed')) {
              clearInterval(interval);
            }
          } catch (err) {
            console.error('Error fetching status:', err);
          }
        }, 2000);
      }
    }

    return () => clearInterval(interval);
  }, [doc]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const newDoc = await uploadDocument(file);
      setDoc(newDoc);
    } catch (err) {
      setError('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeJob = doc?.jobs?.[0];
  const activeStatus = activeJob?.status?.toUpperCase() || 'UNKNOWN';
  const progress = activeJob?.progress_percentage || 0;
  const resultData = doc?.results?.[0]?.extracted_data;

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="max-w-xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Processync AI
          </h1>
          <p className="text-slate-400 text-lg">Scale your document analysis with asynchronous precision.</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {!doc ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center transition-colors hover:border-blue-500/50 group">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload" className="cursor-pointer space-y-4 block">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold">Click to upload doc</p>
                    <p className="text-slate-500">PDF, DOCX, PNG (Max 10MB)</p>
                  </div>
                </label>
                {file && (
                  <p className="mt-4 text-sm bg-blue-500/10 text-blue-400 py-1 px-3 rounded-full inline-block">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <button
                disabled={!file || loading}
                onClick={handleUpload}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
              >
                {loading ? 'Starting Analysis...' : 'Process Document'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-blue-400">{doc.original_filename}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeStatus === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                  activeStatus === 'FAILED' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-amber-500/20 text-amber-400 animate-pulse'
                }`}>
                  {activeStatus}
                </span>
              </div>

              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Processing Progress</span>
                  <span>{progress}%</span>
                </div>
              </div>

              {activeStatus === 'COMPLETED' && resultData && (
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700/50">
                  <h4 className="font-bold text-slate-300">Analysis Results</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{resultData.analysis}</p>
                  <div className="flex flex-wrap gap-2">
                    {resultData.entities?.map((e: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setDoc(null); setFile(null); }}
                className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold transition-colors"
              >
                Process New Document
              </button>
            </div>
          )}

          {error && <p className="text-rose-400 text-center">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard title="Async workers" desc="Distributed processing via Celery." />
          <FeatureCard title="Redis pub/sub" desc="Zero-latency status indicators." />
          <FeatureCard title="Stateless architecture" desc="Scale horizontally with ease." />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
      <h4 className="font-bold mb-1 text-slate-200">{title}</h4>
      <p className="text-xs text-slate-500 leading-tight">{desc}</p>
    </div>
  );
}
