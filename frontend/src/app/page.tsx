'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-4xl w-full space-y-12 text-center z-10">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            Stability Release
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter italic uppercase leading-none">
            Proces<span className="text-blue-600">sync</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto tracking-tight">
            Enterprise-grade asynchronous document analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <Link href="/upload">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-5 rounded-[2rem] text-lg uppercase tracking-widest transition-all transform hover:-translate-y-2 active:scale-95 shadow-2xl shadow-blue-900/40">
              Start Analysis
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:bg-slate-800 text-white font-black px-12 py-5 rounded-[2rem] text-lg uppercase tracking-widest transition-all transform hover:-translate-y-2 active:scale-95 shadow-xl">
              Go to Dashboard
            </button>
          </Link>
        </div>

        <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
           <Stat label="Latency" value="Optimal" />
           <Stat label="Model" value="Processync Engine" />
           <Stat label="Uptime" value="Verified" />
        </div>
      </div>

      <footer className="absolute bottom-10 text-slate-700 font-bold uppercase tracking-[0.5em] text-[10px]">
        Encrypted Infrastructure
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-8 rounded-[2rem] bg-slate-900/20 border border-slate-800/40 backdrop-blur-sm">
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-black tracking-tighter text-slate-300">{value}</p>
    </div>
  )
}
