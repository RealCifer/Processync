import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Processync | Document Intelligence",
  description: "Enterprise-grade asynchronous document analysis and metadata extraction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black antialiased selection:bg-blue-500/30 selection:text-blue-200`}>
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between bg-slate-900/40 backdrop-blur-3xl border border-slate-800/50 px-8 py-5 rounded-[2.5rem] shadow-2xl">
            <Link href="/" className="group">
              <span className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-blue-500 transition-colors">
                Proces<span className="text-blue-600">sync</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-10">
              <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/upload">
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                  Analyze
                </button>
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
