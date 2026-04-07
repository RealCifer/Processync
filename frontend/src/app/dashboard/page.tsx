'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDocuments, Document } from '@/services/api';

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchDocs() {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.original_filename.toLowerCase().includes(search.toLowerCase());
    const latestJob = doc.jobs?.[0];
    const matchesFilter = filter === 'all' || (latestJob && latestJob.status === filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">Control Center</h1>
            <p className="text-slate-500 font-medium">Manage your processed intelligence and file history.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input 
              type="text" 
              placeholder="Search filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 transition-all"
            />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-48 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 bg-slate-900/40 rounded-[2.5rem] animate-pulse border border-slate-800/60" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-[3rem] p-24 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center text-slate-600">
               <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
               </svg>
            </div>
            <p className="text-xl font-bold text-slate-500 italic uppercase">No documents discovered</p>
            <Link href="/upload">
                <button className="text-blue-500 font-bold hover:underline uppercase tracking-widest text-xs">Upload something now</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map(doc => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ doc }: { doc: Document }) {
  const latestJob = doc.jobs?.[0];
  const status = latestJob?.status || 'pending';
  
  const statusColors = {
    completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    processing: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    failed: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    pending: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  };

  return (
    <Link href={`/document/${doc.id}`}>
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2.5rem] p-8 hover:bg-slate-800/50 hover:border-blue-500/50 transition-all group h-full flex flex-col justify-between hover:-translate-y-2 duration-300 shadow-xl shadow-black/20">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[status]}`}>
              {status}
            </div>
            <span className="text-slate-700 font-mono text-[10px] uppercase">{(doc.file_size / 1024).toFixed(1)} KB</span>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{doc.original_filename}</h3>
            <p className="text-xs text-slate-500 font-medium">Processed {new Date(doc.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-between text-slate-500">
           <span className="text-[10px] font-bold uppercase tracking-widest">Metadata extraction</span>
           <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
           </svg>
        </div>
      </div>
    </Link>
  );
}
