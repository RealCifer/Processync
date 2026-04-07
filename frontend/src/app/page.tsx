'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 text-center">
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Intelligent <span className="text-blue-500">Document Analysis</span>
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          The high-performance asynchronous pipeline for extracting structured insights from any document with enterprise-grade precision.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/upload">
            <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-lg text-lg transition-all shadow-lg active:scale-95">
              Start Analysis
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-8 py-3 rounded-lg text-lg border border-neutral-800 transition-all active:scale-95">
              View Dashboard
            </button>
          </Link>
        </div>

        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
           <StatItem label="Performance" value="Minimal Latency" />
           <StatItem label="Reliability" value="99.9% Uptime" />
           <StatItem label="Security" value="Fully Encrypted" />
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 border border-neutral-800 bg-neutral-900/50 rounded-xl backdrop-blur-sm">
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-semibold text-neutral-200">{value}</p>
    </div>
  );
}
