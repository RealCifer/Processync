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
        console.error(err);
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
      console.error(err);
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
      console.error(err);
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-blue-600 font-black uppercase tracking-[0.5em] text-[10px]">Processing</div>;
  if (!doc) return <div className="min-h-screen bg-black flex items-center justify-center text-rose-600 uppercase tracking-widest text-xs">Record Not Found</div>;

  const result = doc.results?.[0];
  const isFinalized = result?.is_finalized;

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-900 pb-12">
          <div className="space-y-4">
            <button onClick={() => router.back()} className="text-slate-600 hover:text-white flex items-center gap-2 text-[8px] font-black uppercase tracking-widest transition-colors mb-4">
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
               Back
            </button>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic truncate max-w-2xl">{doc.original_filename}</h1>
            <div className="flex gap-4 items-center">
              <span className="text-[8px] bg-slate-900 px-3 py-1 rounded-full font-black uppercase text-slate-500 tracking-[0.2em] border border-slate-800">{doc.mime_type}</span>
              <span className="text-[8px] bg-slate-900 px-3 py-1 rounded-full font-black uppercase text-slate-500 tracking-[0.2em] border border-slate-800">{(doc.file_size/1024).toFixed(1)} KB</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a 
                href={getExportUrl(id, 'json')}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 px-6 py-3 rounded-2xl font-black text-[8px] uppercase tracking-widest transition-all"
            >
              Export JSON
            </a>
            <a 
                href={getExportUrl(id, 'csv')}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 px-6 py-3 rounded-2xl font-black text-[8px] uppercase tracking-widest transition-all"
            >
              Export CSV
            </a>
            <button 
                onClick={handleSave}
                disabled={saving || isFinalized}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-20 px-6 py-3 rounded-2xl font-black text-[8px] uppercase tracking-widest transition-all border border-slate-800"
            >
              {saving ? 'Saving' : 'Save'}
            </button>
            <button 
                onClick={handleFinalize}
                disabled={finalizing || isFinalized}
                className={`px-8 py-3 rounded-2xl font-black text-[8px] uppercase tracking-widest transition-all shadow-xl ${
                    isFinalized 
                    ? 'bg-emerald-600/5 text-emerald-600 border border-emerald-600/10 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                }`}
            >
              {finalizing ? 'Finalizing' : isFinalized ? 'Verified' : 'Finalize'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {!result ? (
              <div className="h-64 bg-slate-900/10 border border-slate-900 rounded-[3rem] flex items-center justify-center">
                <p className="text-slate-800 font-black uppercase italic tracking-[0.5em] text-[8px]">Pending Sequence</p>
              </div>
            ) : (
              <div className="space-y-12">
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-8 bg-blue-600 rounded-full" />
                    <h2 className="text-2xl font-black uppercase tracking-tight italic">Interactive Analysis</h2>
                  </div>
                  
                  <div className="bg-slate-900/20 backdrop-blur-3xl border border-slate-900 rounded-[3rem] p-10 space-y-10 shadow-2xl">
                    <div className="space-y-4">
                       <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Analysis Title</label>
                       <input 
                         type="text" 
                         value={editData.title}
                         disabled={isFinalized}
                         onChange={(e) => setEditData({...editData, title: e.target.value})}
                         className="w-full bg-slate-900 border border-slate-800/80 rounded-2xl px-6 py-4 text-2xl font-black text-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all disabled:opacity-50"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Document Category</label>
                          <input 
                             type="text" 
                             value={editData.category}
                             disabled={isFinalized}
                             onChange={(e) => setEditData({...editData, category: e.target.value})}
                             className="w-full bg-slate-900 border border-slate-800/80 rounded-2xl px-6 py-3 text-lg font-bold uppercase tracking-tight focus:ring-1 focus:ring-blue-600 outline-none transition-all disabled:opacity-50"
                          />
                       </div>
                       <div className="space-y-4">
                          <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Keywords</label>
                          <input 
                             type="text" 
                             value={editData.keywords.join(', ')}
                             disabled={isFinalized}
                             onChange={(e) => setEditData({...editData, keywords: e.target.value.split(',').map(k => k.trim())})}
                             className="w-full bg-slate-900 border border-slate-800/80 rounded-2xl px-6 py-3 text-xs font-bold focus:ring-1 focus:ring-blue-600 outline-none transition-all disabled:opacity-50"
                          />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Extraction Summary</label>
                       <textarea 
                         rows={5}
                         value={editData.summary}
                         disabled={isFinalized}
                         onChange={(e) => setEditData({...editData, summary: e.target.value})}
                         className="w-full bg-slate-900 border border-slate-800/80 rounded-3xl px-8 py-6 text-slate-400 font-medium leading-relaxed text-sm focus:ring-1 focus:ring-blue-600 outline-none transition-all resize-none disabled:opacity-50"
                       />
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
                <h2 className="text-2xl font-black uppercase tracking-tight italic">Governance</h2>
              </div>
              
              <div className="bg-slate-900/20 backdrop-blur-3xl border border-slate-900 rounded-[3rem] p-8 space-y-8 shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">State</p>
                    <div className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isFinalized ? 'bg-emerald-600/5 text-emerald-600 border border-emerald-600/10' : 'bg-amber-600/5 text-amber-600 border border-amber-600/10'}`}>
                        {isFinalized ? 'VERIFIED' : 'PENDING'}
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Chronology</p>
                    <p className="font-mono text-[10px] uppercase">{new Date(doc.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Reference ID</p>
                    <p className="font-mono text-[8px] text-slate-600 break-all">{doc.id}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-900 font-black italic text-slate-700 text-[8px] text-center uppercase tracking-widest">
                    {isFinalized 
                      ? "Records are archived." 
                      : "Verification required."}
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
