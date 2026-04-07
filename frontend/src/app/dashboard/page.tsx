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
        console.error('Fetch Documents Error:', err);
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
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-neutral-800">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Resources Dashboard</h1>
            <p className="text-neutral-500 font-medium text-sm">Monitor and manage analyzed document assets.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative group w-full sm:w-64">
               <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
               <input 
                 type="text" 
                 placeholder="Find document..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="bg-neutral-900 border border-neutral-800 rounded-md pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-neutral-800 transition-all w-full"
               />
            </div>
            
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer text-neutral-400 w-full sm:w-40 appearance-none bg-no-repeat bg-right bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22rgba(115,115,115,1)%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] pr-8"
            >
              <option value="all">Every status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-44 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl py-24 text-center space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 bg-neutral-800/50 rounded-full flex items-center justify-center text-neutral-600 border border-neutral-800">
               <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
               </svg>
            </div>
            <p className="text-sm font-semibold text-neutral-500 uppercase tracking-widest leading-none">No Data Available</p>
            <Link href="/upload">
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-lg text-sm transition-all shadow-lg active:scale-95">Go to Upload</button>
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
  const status = latestJob?.status || 'queued';
  
  const statusColors = {
    completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
    processing: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
    failed: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    queued: 'text-neutral-400 bg-neutral-400/10 border-neutral-500/20',
  };

  return (
    <Link href={`/document/${doc.id}`}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:bg-neutral-800/80 hover:border-neutral-700 transition-all group h-full flex flex-col justify-between shadow-sm duration-300">
        <div className="space-y-5">
          <div className="flex justify-between items-start">
            <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColors[status]}`}>
              {status}
            </div>
            <span className="text-neutral-600 font-bold text-[10px] tracking-tight">{(doc.file_size / 1024).toFixed(1)} KB</span>
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold truncate group-hover:text-blue-500 transition-colors tracking-tight text-neutral-100">{doc.original_filename}</h3>
            <p className="text-xs text-neutral-600 font-semibold uppercase tracking-widest">{new Date(doc.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-neutral-800 group-hover:border-neutral-700 flex items-center justify-between text-neutral-700 transition-colors">
           <span className="text-[10px] font-bold uppercase tracking-widest leading-none">View Insights</span>
           <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
           </svg>
        </div>
      </div>
    </Link>
  );
}
