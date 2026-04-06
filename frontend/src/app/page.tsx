'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Theme state
  const [isDark, setIsDark] = useState(true);

  // Check system preference initially
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

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
    <main className={`min-h-[100dvh] flex flex-col items-center justify-center p-6 transition-colors duration-700 ease-in-out relative overflow-hidden ${
      isDark 
        ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100' 
        : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white text-slate-800'
    }`}>
      
      {/* Background ambient texture / glow meshes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse transition-all duration-1000 pointer-events-none"></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] ${isDark ? 'bg-indigo-500' : 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse transition-all duration-1000 pointer-events-none`} style={{ animationDelay: '2s' }}></div>

      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className={`fixed top-6 right-6 p-4 rounded-full backdrop-blur-2xl border shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 z-50 ${
          isDark 
            ? 'bg-slate-800/60 border-slate-700 text-amber-400 hover:bg-slate-700/80 hover:shadow-amber-900/20' 
            : 'bg-white/80 border-slate-200 text-blue-600 hover:bg-white hover:shadow-blue-900/10'
        }`}
        aria-label="Toggle Theme"
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.708a1 1 0 01-1.414 1.414l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM15.636 15.636a1 1 0 010 1.415l-.708.708a1 1 0 01-1.414-1.414l.708-.708a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 010 1.415l-.708.708a1 1 0 01-1.414-1.414l.708-.708a1 1 0 011.414 0zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zM4.364 4.364a1 1 0 011.415 0l.708.708A1 1 0 115.07 6.486l-.708-.708a1 1 0 010-1.415z" /><path fillRule="evenodd" d="M10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
        )}
      </button>

      <div className="max-w-2xl w-full space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10 relative">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-br from-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm pb-1">
            Processync
          </h1>
          <p className={`text-lg md:text-xl font-medium tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Next-gen asynchronous document processing.
          </p>
        </div>

        <div className={`rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl border shadow-2xl transition-all duration-500 space-y-8 relative overflow-hidden ${
          isDark 
            ? 'bg-slate-900/40 border-slate-800/60 shadow-black/50' 
            : 'bg-white/60 border-white/80 shadow-slate-300/50'
        }`}>
            {/* Subtle inner top highlight */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-blue-500/30' : 'via-blue-400/50'} to-transparent`}></div>

          {!response ? (
            <div className="space-y-8">
              <div className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 group ${
                isDark 
                  ? 'border-slate-700/60 hover:border-blue-500/60 hover:bg-blue-500/5' 
                  : 'border-slate-300 hover:border-blue-400/60 hover:bg-blue-50/50'
              }`}>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload" className="cursor-pointer space-y-6 flex flex-col items-center w-full h-full">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-2 shadow-xl ${
                    isDark ? 'bg-slate-800 shadow-black/50 text-blue-400' : 'bg-white shadow-slate-200/80 text-blue-600'
                  }`}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Select your file
                    </p>
                    <p className={`text-sm font-medium tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Support for PDF, DOCX, PNG (Max 10MB)
                    </p>
                  </div>
                </label>
                {file && (
                  <div className={`mt-8 inline-flex items-center gap-2 py-2 px-5 rounded-full font-semibold text-sm transition-all animate-in zoom-in-95 duration-300 ${
                    isDark ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-blue-50 tracking-tight text-blue-700 border border-blue-200'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {file.name}
                  </div>
                )}
              </div>

              <button
                disabled={!file || loading}
                onClick={handleUpload}
                className={`w-full py-5 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 relative overflow-hidden shadow-xl ${
                    !file || loading 
                        ? (isDark ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200')
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <div className="flex justify-center items-center gap-3">
                    <span>Processing</span>
                    <div className="flex space-x-1.5 mt-1 pointer-events-none">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '800ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '800ms' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '800ms' }} />
                    </div>
                  </div>
                ) : 'Analyze Document'}
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 fade-in duration-500">
              <div className={`flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-6 border-b ${isDark ? 'border-slate-800/60' : 'border-slate-200'}`}>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400' : 'text-slate-800'}`}>
                    {response.filename}
                </h3>
                <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-sm w-max ${
                    isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  <svg className="w-4 h-4 mr-1 mb-0.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  SUCCESS
                </span>
              </div>
              
              <div className={`rounded-3xl p-8 space-y-5 border ${
                isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50/80 border-slate-200'
              }`}>
                <h4 className={`font-semibold text-sm uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>File Properties</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className={`p-5 rounded-2xl transition-transform hover:scale-[1.02] ${isDark ? 'bg-slate-900/50' : 'bg-white shadow-sm'}`}>
                    <span className={`block text-xs mb-2 uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Format</span>
                    <span className={`font-semibold text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{response.content_type || 'Unknown'}</span>
                  </div>
                  <div className={`p-5 rounded-2xl transition-transform hover:scale-[1.02] ${isDark ? 'bg-slate-900/50' : 'bg-white shadow-sm'}`}>
                    <span className={`block text-xs mb-2 uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Size</span>
                    <span className={`font-semibold text-lg font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {(response.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setResponse(null); setFile(null); }}
                className={`w-full py-5 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] shadow-lg ${
                    isDark 
                        ? 'bg-slate-800 border border-slate-700/80 hover:bg-slate-700/80 text-white hover:shadow-black/20' 
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:shadow-slate-300/50'
                }`}
              >
                 Upload Another
              </button>
            </div>
          )}

          {error && (
            <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                <div className={`flex items-center justify-center p-4 rounded-2xl shadow-sm border ${
                    isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="font-semibold">{error}</p>
                </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard 
            title="Async Processing" 
            desc="Distributed workload via state-of-the-art Celery workers." 
            isDark={isDark} 
          />
          <FeatureCard 
            title="Real-time Events" 
            desc="Zero-latency status indicators via Redis Pub/Sub." 
            isDark={isDark} 
          />
          <FeatureCard 
            title="Scalable Native" 
            desc="Built horizontally for massive parallel execution." 
            isDark={isDark} 
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, desc, isDark }: { title: string; desc: string; isDark: boolean }) {
  return (
    <div className={`p-6 rounded-3xl transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl border ${
      isDark 
        ? 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700/80 hover:shadow-blue-900/10' 
        : 'bg-white/50 border-white hover:bg-white hover:border-blue-100 hover:shadow-blue-900/5 backdrop-blur-md'
    }`}>
      <div className={`w-10 h-10 rounded-2xl mb-4 flex items-center justify-center ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h4 className={`font-bold text-lg mb-2 tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{title}</h4>
      <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{desc}</p>
    </div>
  );
}
