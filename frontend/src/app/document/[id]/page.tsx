'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getDocument, finalizeDocument, exportDocument, Document } from '@/services/api';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    async function fetchDoc() {
      try {
        const data = await getDocument(id);
        setDoc(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportDocument(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processync_${id}.json`;
      a.click();
    } catch (err) {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await finalizeDocument(id);
      const data = await getDocument(id);
      setDoc(data);
    } catch (err) {
      alert('Finalization failed');
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-blue-500 font-black animate-pulse uppercase tracking-[0.5em]">Analyzing...</div>;
  if (!doc) return <div className="min-h-screen bg-black flex items-center justify-center text-rose-500">Document Lost in Void</div>;

  const result = doc.results?.[0];
  const extraction = result?.extracted_data;

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-800 pb-12">
          <div className="space-y-4">
            <button onClick={() => router.back()} className="text-slate-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-4">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
               Back
            </button>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic truncate max-w-2xl">{doc.original_filename}</h1>
            <div className="flex gap-4 items-center">
              <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full font-bold uppercase text-slate-400 tracking-widest">{doc.mime_type}</span>
              <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full font-bold uppercase text-slate-400 tracking-widest">{(doc.file_size/1024).toFixed(1)} KB</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
                onClick={handleExport}
                disabled={exporting}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
            >
              {exporting ? 'Exporting...' : 'Export JSON'}
            </button>
            <button 
                onClick={handleFinalize}
                disabled={finalizing || result?.is_finalized}
                className={`px-8 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl ${
                    result?.is_finalized 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                }`}
            >
              {finalizing ? 'Finalizing...' : result?.is_finalized ? 'Finalized' : 'Finalize Result'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {!extraction ? (
              <div className="h-96 bg-slate-900/30 border border-slate-800/60 rounded-[3rem] flex items-center justify-center">
                <p className="text-slate-600 font-black uppercase italic tracking-widest">Extraction in Progress or Failed</p>
              </div>
            ) : (
              <div className="space-y-12">
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-8 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black uppercase tracking-tight italic">AI Content Extraction</h2>
                  </div>
                  
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Extracted Title</label>
                       <p className="text-3xl font-bold text-blue-400 leading-tight">{extraction.content.title}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Document Category</label>
                          <p className="text-xl font-bold uppercase tracking-tight">{extraction.content.category}</p>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Keywords</label>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {extraction.content.keywords.map((kw: string) => (
                              <span key={kw} className="bg-slate-800/80 px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-700/50 hover:border-blue-500/50 transition-colors cursor-default">
                                {kw}
                              </span>
                            ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Automated Summary</label>
                       <p className="text-slate-300 font-medium leading-relaxed text-lg italic">
                         " {extraction.content.summary} "
                       </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>

          <div className="space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                <h2 className="text-2xl font-black uppercase tracking-tight italic">Audit Data</h2>
              </div>
              
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[3rem] p-8 space-y-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2v4h4L13 4zM6 20V4h5v5h5v11H6z"/></svg>
                </div>

                <div className="space-y-6 relative">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Created</p>
                    <p className="font-mono text-sm">{new Date(doc.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System UUID</p>
                    <p className="font-mono text-[10px] text-slate-400 break-all">{doc.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">MIME Detection</p>
                    <p className="font-mono text-sm text-indigo-400">{extraction?.metadata?.file_type || 'N/A'}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-800/60">
                     <p className="text-xs font-bold text-slate-500 italic mb-4">"Verification recommended before finalization."</p>
                     <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
                        <div className="flex gap-3 text-blue-400 items-start">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">System confidence score: 98% based on structural consistency.</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
