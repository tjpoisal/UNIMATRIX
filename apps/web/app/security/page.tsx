import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArchitectureDiagram } from '@/components/marketing/ArchitectureDiagram';

export const metadata = {
  title: 'Security & Architecture — Unimatrix',
  description: 'How Unimatrix protects your data. Encryption details, access controls, retention policy, and architecture.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://deployunimatrix.com/security' },
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Simple header matching docs style */}
      <header className="border-b border-border/30 bg-bg/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={28} height={31} className="opacity-90" />
              <span className="font-semibold tracking-tight">Unimatrix</span>
            </Link>
            <span className="text-text-muted text-sm">/ Security</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-text-muted hover:text-text transition-colors">Home</Link>
            <Link href="/docs/mcp" className="hover:text-accent transition-colors">MCP Reference</Link>
            <Link href="/auth/login" className="text-accent hover:text-accent/80 font-medium">Sign In</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10">
          <Link href="/" className="text-sm text-accent hover:text-accent/80">← Back to Unimatrix</Link>
          <h1 className="text-5xl font-black tracking-tighter mt-4">Security &amp; Architecture</h1>
          <p className="text-xl text-text-secondary mt-3 max-w-2xl">
            We treat your memory as infrastructure. Here is exactly how the system is built, what we can see, and what we cannot.
          </p>
        </div>

        {/* Quick Trust Bar */}
        <div className="flex flex-wrap gap-2 mb-12">
          {['AES-256-GCM at rest', 'TLS 1.3 in transit', 'Per-ciphertext keys (scrypt)', 'Full audit logging', 'Self-host available', 'No training on your data'].map((t) => (
            <div key={t} className="text-xs px-3 py-1 rounded-full border border-border/40 bg-surface text-text-secondary">{t}</div>
          ))}
        </div>

        {/* Architecture Diagram */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Current Architecture</h2>
          <ArchitectureDiagram showSelfHost />
        </section>

        {/* Encryption */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Encryption</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border/30 rounded-2xl p-8">
              <h3 className="font-semibold mb-3">In Transit</h3>
              <p className="text-text-secondary">All traffic between clients and the API, and between the API and the database, is protected by TLS 1.3.</p>
            </div>
            <div className="bg-surface border border-border/30 rounded-2xl p-8">
              <h3 className="font-semibold mb-3">At Rest</h3>
              <p className="text-text-secondary mb-4">Application-layer AES-256-GCM. Every stored memory is encrypted with a unique key derived via scrypt (N=16384, memory-hard) from a server master key + a fresh per-ciphertext 32-byte salt.</p>
              <p className="text-xs text-text-muted">Layout: [salt 32][IV 12][auth tag 16][ciphertext]. The master key lives only in the server environment. Self-hosting gives you full control of it.</p>
            </div>
          </div>
        </section>

        {/* Access & Privacy */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Access &amp; Privacy</h2>
          <div className="prose prose-invert text-text-secondary max-w-none">
            <ul className="space-y-3 text-[15px]">
              <li><strong>Only you</strong> can read or write your memories through authenticated MCP or REST calls using your API keys.</li>
              <li>Unimatrix operators can access ciphertext at rest and, using the master encryption key, plaintext — but only in support or security investigations. All such access is logged in the per-account audit trail.</li>
              <li>We never train on your data. We never sell it. Obvious secrets and PII are redacted before any embedding or classification step.</li>
              <li>Raw API keys are never stored — only bcrypt-hashed prefixes for lookup.</li>
            </ul>
          </div>
        </section>

        {/* Retention & Deletion */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Retention &amp; Deletion</h2>
          <div className="bg-surface border border-border/30 rounded-2xl p-8 text-sm text-text-secondary space-y-4">
            <p>Memories, locations, palaces, and their vector embeddings are retained until you delete them (via dashboard, API, or full account deletion).</p>
            <p>On deletion we purge the primary rows and vector index entries. Backups follow the retention window of the underlying provider (Neon) and are then removed.</p>
            <p>Audit logs are kept for a limited security and incident-response window, then deleted. You can always export your complete hierarchy first.</p>
            <p className="text-xs text-text-muted pt-2 border-t border-border/30">Full export + delete is available to every account at any time.</p>
          </div>
        </section>

        {/* Self-host */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Self-Hosting</h2>
          <p className="text-text-secondary mb-4">The entire stack (API, Postgres schema, encryption, MCP server, audit) is open and runnable with Docker + your own PostgreSQL 15+ instance with pgvector.</p>
          <p className="text-sm">You supply the <code>MASTER_ENCRYPTION_KEY</code>, Clerk (or equivalent), and Voyage AI key. This gives you complete control over the master key and data location.</p>
          <Link href="https://github.com/tjpoisal/UNIMATRIX" target="_blank" className="inline-block mt-4 text-sm text-accent hover:underline">See self-host instructions in the repo →</Link>
        </section>

        {/* Reporting */}
        <section className="border-t border-border/30 pt-10 text-sm text-text-secondary">
          <h3 className="font-semibold text-text mb-2">Reporting a vulnerability</h3>
          <p>Please report security issues privately via GitHub Security Advisories or to security@unimatrix.app. We aim to acknowledge reports within 48 hours.</p>
          <div className="mt-4 text-xs text-text-muted">
            Full policy: <a href="https://github.com/tjpoisal/UNIMATRIX/blob/main/SECURITY.md" target="_blank" className="underline hover:text-text" rel="noreferrer">SECURITY.md</a>
          </div>
        </section>
      </div>

      <footer className="border-t border-border/30 py-10 text-center text-xs text-text-muted">
        Unimatrix • <Link href="/" className="hover:text-text">Home</Link> • <Link href="/docs/mcp" className="hover:text-text">Docs</Link>
      </footer>
    </div>
  );
}
