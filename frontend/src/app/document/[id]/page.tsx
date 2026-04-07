'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getDocument, finalizeDocument, updateResult, getExportUrl, Document } from '@/services/api';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  
  const [editData, setEditData] = useState({
    title: '',
    category: '',
    summary: '',
    keywords: [] as string[]
  });

  useEffect(() => {
    async function fetchDoc() {
      try {
        const data = await getDocument(id);
        setDoc(data);
        const result = data.results?.[0];
        const content = result?.edited_data?.content || result?.extracted_data?.content;
        if (content) {
            setEditData({
                title: content.title || '',
                category: content.category || '',
                summary: content.summary || '',
                keywords: content.keywords || []
            });
        }
      } catch (err) {
        console.error('Fetch Document Error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoc();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateResult(id, { content: editData });
      const data = await getDocument(id);
      setDoc(data);
    } catch (err) {
      console.error('Save Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await finalizeDocument(id);
      const data = await getDocument(id);
      setDoc(data);
    } catch (err) {
      console.error('Finalize Error:', err);
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 animate-pulse">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest leading-none">Loading Intelligence</span>
    </div>
  );

  if (!doc) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-6">
        <h3 className="text-xl font-bold text-neutral-200">Intelligence Token Not Found</h3>
        <button onClick={() => router.push('/dashboard')} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-md transition-all active:scale-95 text-sm">Return to Dashboard</button>
    </div>
  );

  const result = doc.results?.[0];
  const isFinalized = result?.is_finalized;
  const fileSizeKB = doc.file_size ? (doc.file_size / 1024).toFixed(1) : '0.0';
  const fileType = doc.mime_type ? doc.mime_type.split('/')[1]?.toUpperCase() : 'UNKNOWN';

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-neutral-800">
        <div className="space-y-4">
          <button onClick={() => router.back()} className="text-neutral-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-2">
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
             Previous
          </button>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{doc.original_filename}</h1>
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border border-neutral-800 px-2 py-0.5 rounded bg-neutral-900">{fileType}</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest border border-neutral-800 px-2 py-0.5 rounded bg-neutral-900">{fileSizeKB} KB</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a download href={getExportUrl(id, 'json')} className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold rounded-md transition-colors selection:bg-none">Export JSON</a>
          <a download href={getExportUrl(id, 'csv')} className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold rounded-md transition-colors selection:bg-none">Export CSV</a>
          <button 
              onClick={handleSave}
              disabled={saving || isFinalized}
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-20 text-xs font-bold rounded-md transition-colors"
          >
            {saving ? 'Processing...' : 'Save Draft'}
          </button>
          <button 
              onClick={handleFinalize}
              disabled={finalizing || isFinalized}
              className={`px-6 py-2 rounded-md text-xs font-bold transition-all shadow-md active:scale-95 ${
                  isFinalized 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default shadow-none'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
          >
            {finalizing ? 'Finalizing...' : isFinalized ? 'Verified' : 'Verify Result'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          {!result ? (
            <div className="h-64 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center">
              <p className="text-neutral-600 text-xs font-bold uppercase tracking-[0.4em]">Pending Intelligence Sequence</p>
            </div>
          ) : (
            <section className="space-y-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-tight">Interactive Findings</h2>
                <div className="h-0.5 flex-1 bg-neutral-800" />
              </div>
              
              <div className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Document Title</label>
                   <input 
                     type="text" 
                     value={editData.title}
                     disabled={isFinalized}
                     onChange={(e) => setEditData({...editData, title: e.target.value})}
                     className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-lg font-bold text-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all disabled:opacity-50"
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Document Category</label>
                      <input 
                         type="text" 
                         value={editData.category}
                         disabled={isFinalized}
                         onChange={(e) => setEditData({...editData, category: e.target.value})}
                         className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all disabled:opacity-50"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Key Indices</label>
                      <input 
                         type="text" 
                         value={editData.keywords.join(', ')}
                         disabled={isFinalized}
                         onChange={(e) => setEditData({...editData, keywords: e.target.value.split(',').map(k => k.trim())})}
                         className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all disabled:opacity-50"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Summarized Context</label>
                   <textarea 
                     rows={6}
                     value={editData.summary}
                     disabled={isFinalized}
                     onChange={(e) => setEditData({...editData, summary: e.target.value})}
                     className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-6 py-4 text-neutral-400 font-medium leading-relaxed text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all resize-none disabled:opacity-50"
                   />
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-12 sticky top-28">
          <section className="space-y-6">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-widest flex items-center gap-4">
               Audit Governance
               <div className="h-px flex-1 bg-neutral-800" />
            </h2>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-sm overflow-hidden relative">
              <div className="space-y-6 relative z-10">
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Process State</p>
                  <div className={`self-start px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${isFinalized ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                      {isFinalized ? 'VERIFIED' : 'PENDING REVIEW'}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Chronology</p>
                    <p className="text-xs font-semibold text-neutral-400">{new Date(doc.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Internal Reference</p>
                    <p className="text-[10px] font-mono text-neutral-600 leading-tight bg-neutral-950 p-2 rounded-md border border-neutral-800 break-all">{doc.id}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-800 font-bold text-neutral-700 text-[10px] text-center uppercase tracking-widest">
                  {isFinalized 
                    ? "Archives Finalized" 
                    : "Verification Active"}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
