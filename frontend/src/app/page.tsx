'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResponse(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          {!response ? (
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
                {loading ? 'Processing...' : 'Upload Document'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-blue-400">{response.filename}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                  UPLOADED
                </span>
              </div>
              
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-3 border border-slate-700/50">
                <h4 className="font-bold text-slate-300">File Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block">Content Type</span>
                    <span className="text-slate-300">{response.content_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Size</span>
                    <span className="text-slate-300 text-emerald-400 font-mono">
                      {(response.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setResponse(null); setFile(null); }}
                className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold transition-colors"
              >
                Upload Another Document
              </button>
            </div>
          )}

          {error && <p className="text-rose-400 text-center font-medium bg-rose-500/10 py-2 rounded-lg">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
            <h4 className="font-bold mb-1 text-slate-200">Async workers</h4>
            <p className="text-xs text-slate-500 leading-tight">Distributed processing via Celery.</p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
            <h4 className="font-bold mb-1 text-slate-200">Redis pub/sub</h4>
            <p className="text-xs text-slate-500 leading-tight">Zero-latency status indicators.</p>
          </div>
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
            <h4 className="font-bold mb-1 text-slate-200">Stateless architecture</h4>
            <p className="text-xs text-slate-500 leading-tight">Scale horizontally with ease.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
