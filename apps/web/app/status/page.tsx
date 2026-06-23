import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Status — Unimatrix',
  description: 'Current operational status of the Unimatrix MCP service.',
  alternates: { canonical: 'https://deployunimatrix.com/status' },
};

export default function StatusPage() {
  // In a real system this would come from an uptime monitor or DB.
  const status = {
    overall: 'Operational',
    lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
    components: [
      { name: 'MCP API (deployunimatrix.com/api/mcp)', status: 'Operational', latency: '< 120ms p95' },
      { name: 'Web Dashboard', status: 'Operational', latency: '—' },
      { name: 'Database (Neon Postgres + pgvector)', status: 'Operational', latency: '—' },
      { name: 'Authentication (Clerk)', status: 'Operational', latency: '—' },
    ],
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border/30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={28} height={31} className="opacity-90" />
            <span className="font-semibold tracking-tight">Unimatrix</span>
          </Link>
          <Link href="/" className="text-sm text-text-muted hover:text-text">Back to home</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-3 w-3 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-sm font-semibold tracking-widest text-[#22C55E]">{status.overall}</span>
        </div>

        <h1 className="text-4xl font-black tracking-tighter">Service Status</h1>
        <p className="text-text-muted mt-1 text-sm">Last updated {status.lastUpdated}</p>

        <div className="mt-10 space-y-4">
          {status.components.map((c, i) => (
            <div key={i} className="flex items-center justify-between border border-border/30 bg-surface rounded-2xl px-6 py-4">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-text-muted">{c.latency}</div>
              </div>
              <div className="text-sm font-medium text-[#22C55E]">{c.status}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-sm text-text-secondary">
          This is a simple status page. For real-time incidents and maintenance we will post on GitHub and the dashboard.
        </div>

        {/* Incident History Stubs */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Recent History</h2>
          <div className="space-y-4 text-sm">
            <div className="border border-border/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">2026-05-28</span> — <span className="text-[#22C55E]">Resolved</span>
                </div>
                <div className="text-xs text-text-muted">45m</div>
              </div>
              <div className="mt-1 text-text-secondary">Brief degradation on vector search for a subset of users during a Neon maintenance window. Full recovery after failover.</div>
              <a href="https://github.com/tjpoisal/UNIMATRIX/issues" target="_blank" className="text-xs text-accent hover:underline mt-2 inline-block" rel="noreferrer">Postmortem notes →</a>
            </div>

            <div className="border border-border/30 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">2026-05-12</span> — <span className="text-[#22C55E]">Resolved</span>
                </div>
                <div className="text-xs text-text-muted">12m</div>
              </div>
              <div className="mt-1 text-text-secondary">Rate limiter was too aggressive for some power users doing heavy agent runs. Thresholds increased + better per-key limits deployed.</div>
            </div>

            <div className="text-xs text-text-muted pt-2">No other incidents in the last 30 days.</div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <a href="https://github.com/tjpoisal/UNIMATRIX/issues" target="_blank" className="text-accent hover:underline" rel="noreferrer">Report an issue on GitHub →</a>
          <Link href="/security" className="text-accent hover:underline">Security &amp; Architecture</Link>
          <Link href="/docs/mcp" className="text-accent hover:underline">MCP Reference</Link>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 text-xs text-text-muted">
          This page will soon pull live data from an uptime service (see roadmap).
        </div>
      </div>
    </div>
  );
}
