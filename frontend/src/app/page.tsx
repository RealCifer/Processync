'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    
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
      console.log('Upload success:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('Upload error:', err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full space-y-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center">Upload Document</h1>
        
        <div className="space-y-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2"
          />
          
          <button
            onClick={handleUpload}
            disabled={!file}
            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold disabled:opacity-50 transition-colors"
          >
            Upload
          </button>
        </div>

        {response && (
          <div className="bg-emerald-900/30 border border-emerald-800 p-4 rounded mt-4">
            <h3 className="font-bold text-emerald-400">Success!</h3>
            <pre className="text-xs mt-2 overflow-auto text-slate-300">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-rose-900/30 border border-rose-800 p-4 rounded mt-4">
            <h3 className="font-bold text-rose-400">Error</h3>
            <p className="text-sm mt-1 text-slate-300">{error}</p>
          </div>
        )}
      </div>
    </main>
  );
}
