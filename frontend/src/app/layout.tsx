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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-neutral-950 text-neutral-50 antialiased`}>
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold tracking-tight text-white">
                Proces<span className="text-blue-500">sync</span>
              </span>
            </Link>
            
            <nav className="flex items-center gap-8">
              <Link href="/dashboard" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/upload">
                <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-md transition-all active:scale-95 shadow-sm">
                  Analyze
                </button>
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-screen pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
