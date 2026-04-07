import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Processync AI | Next-Gen Document Analysis",
  description: "Enterprise-grade asynchronous document processing with real-time AI extraction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased selection:bg-blue-500/30`}>
        {/* Global Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 rounded-3xl px-8 py-4 flex items-center justify-between shadow-2xl shadow-black/20">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-black tracking-tighter text-white uppercase italic">Processync</span>
              </Link>
              
              <div className="flex items-center gap-8">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <Link href="/upload">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-900/20 active:scale-95 text-sm uppercase tracking-widest">
                        Upload
                    </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        {children}
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
        href={href} 
        className="text-slate-400 hover:text-white font-bold text-sm uppercase tracking-widest transition-colors duration-300"
    >
      {children}
    </Link>
  );
}
