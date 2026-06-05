import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Simple Docs Header */}
      <header className="border-b border-border/30 bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/60 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/LOGO_DARK_BACKGROUND.png" 
                alt="Unimatrix" 
                width={28} 
                height={31} 
                className="opacity-90" 
              />
              <span className="font-semibold tracking-tight">Unimatrix</span>
            </Link>
            <span className="text-text-muted text-sm">/ Docs</span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/quickstart" className="hover:text-accent transition-colors">Quickstart</Link>
            <Link href="/docs/mcp" className="hover:text-accent transition-colors">MCP Reference</Link>
            <Link href="/status" className="text-text-muted hover:text-text transition-colors">Status</Link>
            <Link href="/" className="text-text-muted hover:text-text transition-colors">Home</Link>
            <Link 
              href="/auth/login" 
              className="text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-border/30 py-8 text-center text-xs text-text-muted">
        Unimatrix MCP Server • <Link href="https://github.com/tjpoisal/UNIMATRIX" className="hover:text-text">GitHub</Link>
      </footer>
    </div>
  );
}
