import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

// eslint-disable react/no-unescaped-entities

export const metadata = {
  title: 'Unimatrix | AI Memory That Works Everywhere',
  description:
    'Cross-LLM memory continuity. Start with ChatGPT, continue with Claude. Encrypted, private, vendor-independent. Free tier includes 3 workspaces.',
  keywords: [
    'AI memory',
    'cross-LLM',
    'Claude Desktop',
    'ChatGPT continuity',
    'encrypted memory',
    'MCP server',
    'privacy-first AI',
    'AI context management',
  ],
  openGraph: {
    title: 'Unimatrix | Your AI Remembers Everything',
    description:
      'Cross-LLM memory continuity with end-to-end encryption. Works with any AI model. Free account. No credit card required.',
    url: 'https://deployunimatrix.com',
    siteName: 'Unimatrix',
    type: 'website',
    images: [
      {
        url: 'https://deployunimatrix.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unimatrix | AI Memory That Works Everywhere',
    description: 'Start with ChatGPT. Continue with Claude. Same full context.',
  },
};

export default async function Home() {
  const session = await auth();
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-bg text-text">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-bg/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={40} height={44} className="opacity-90" />
            <span className="font-black text-lg tracking-tight leading-none">
              <span className="text-accent">UNI</span>
              <span className="text-text">MATRIX</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-text-muted">
            <a href="#how-it-works" className="hover:text-text-secondary transition-colors">How It Works</a>
            <Link href="/downloads" className="hover:text-text-secondary transition-colors">Downloads</Link>
            <Link href="/docs/mcp" className="hover:text-text-secondary transition-colors">MCP Docs</Link>
            <a href="#features" className="hover:text-text-secondary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-text-secondary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"
              className="px-4 py-2 border border-border/60 hover:border-accent/40 text-text-secondary hover:text-text font-semibold rounded-lg text-sm transition-all">
              Sign In
            </Link>
            <Link href="/auth/register"
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-bg font-bold rounded-lg text-sm transition-all">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full text-xs text-accent font-medium mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            MCP Server for AI Tools
          </div>
          <div className="flex justify-center mb-8">
            <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={88} height={97}
              className="opacity-80 drop-shadow-[0_0_24px_rgba(0,245,255,0.4)]" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
            Persistent memory for your<br />AI tools via MCP.
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
            A managed Model Context Protocol server. Connect Claude Desktop, Cursor, Windsurf,
            and other MCP clients to structured, long-term memory that works across models and machines.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-accent/20 hover:scale-[1.02]">
              Start Free — No Credit Card
            </Link>
            <Link href="/auth/login"
              className="w-full sm:w-auto px-8 py-4 border border-accent/40 hover:border-accent text-accent hover:text-text font-semibold rounded-xl text-base transition-all duration-200">
              Sign In to Web App &rarr;
            </Link>
          </div>
          <p className="text-xs text-text-muted">Available on macOS &middot; Windows &middot; Linux &middot; iOS &middot; Android &middot; Web</p>
        </div>

        {/* Honest setup callout */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <p className="text-sm text-text-muted mb-3">Works with Claude Desktop, Cursor, Windsurf, and any MCP client.</p>
          <Link 
            href="/onboarding" 
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            View correct setup instructions for your tools →
          </Link>
          <p className="mt-4 text-xs text-text-muted">
            Note: You must add explicit instructions in your LLM settings so it loads memory at the start of sessions.
            There is no automatic background behavior.
          </p>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-text-secondary text-lg">One MCP server. Your context, available to every tool you use.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect a Client', desc: 'Add Unimatrix to Claude Desktop (via local bridge), Cursor/Windsurf (direct HTTP), or any MCP-compatible tool using your API key.' },
              { step: '02', title: 'Store What Matters', desc: 'During conversations, the AI (or you) explicitly calls tools like unimatrix_store_memory to save important context into structured Palaces and Locations.' },
              { step: '03', title: 'Load Context Deliberately', desc: 'In your system prompt or custom instructions, tell each client to call unimatrix_list_palaces + search/get tools at the start of new sessions. No automatic magic — you control when context is loaded.' },
            ].map((item) => (
              <div key={item.step}
                className="relative bg-surface border border-border/30 rounded-2xl p-8 hover:border-accent/30 transition-all duration-200">
                <div className="text-5xl font-black text-accent/20 mb-5">{item.step}</div>
                <div className="text-xs text-accent font-bold tracking-widest mb-3">STEP {item.step}</div>
                <h3 className="text-lg font-bold text-text mb-3">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-text-muted mt-8 max-w-md mx-auto">
            This is how real MCP memory works today. Explicit tool calls, not background telepathy.
          </p>
        </div>
      </section>

      {/* ── Proof of Reality (New Trust Sections) ─────────────────────── */}
      <ProofOfReality />

      {/* ── Platform Downloads ─────────────────────────────────────────── */}
      <section id="platforms" className="py-24 px-6 bg-[#080D19] border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Clients for the Platforms You Actually Use</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Native desktop apps for macOS, Windows, and Linux (plus mobile companions) that connect to the same
              cloud MCP memory backend as your IDEs and agents.
            </p>
          </div>

          {/* Desktop */}
          <div className="mb-10">
            <p className="text-xs text-text-muted font-bold tracking-widest uppercase mb-5 text-center">Desktop</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { os: 'macOS', icon: 'MAC', sub: 'macOS 13 Ventura or later', ext: '.dmg', label: 'Download .dmg', badge: 'Apple Silicon + Intel',
                   href: 'https://github.com/tjpoisal/UNIMATRIX/releases/latest/download/Unimatrix-mac.dmg' },
                { os: 'Windows', icon: 'WIN', sub: 'Windows 10 / 11 x64', ext: '.exe', label: 'Download .exe', badge: null,
                   href: 'https://github.com/tjpoisal/UNIMATRIX/releases/latest/download/Unimatrix-Setup-win.exe' },
                { os: 'Linux', icon: 'LNX', sub: 'Ubuntu, Fedora, Debian', ext: '.AppImage / .deb', label: 'Download .AppImage', badge: null,
                   href: 'https://github.com/tjpoisal/UNIMATRIX/releases/latest/download/Unimatrix-linux.AppImage' },
              ].map((p) => (
                <a key={p.os} href={p.href} target="_blank" rel="noopener noreferrer"
                  className="group relative flex flex-col items-center gap-3 bg-surface border border-border/30 hover:border-accent/50 rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-accent/10">
                  {p.badge && (
                    <span className="absolute top-3 right-3 text-xs bg-accent/10 text-accent border border-accent/20 rounded-full px-2 py-0.5 font-medium">
                      {p.badge}
                    </span>
                  )}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/15 to-[#334155]/20 border border-border/30 flex items-center justify-center">
                    <span className="text-xs font-black text-accent tracking-wider">{p.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-text group-hover:text-accent transition-colors">{p.os}</p>
                    <p className="text-xs text-text-muted mt-0.5">{p.sub}</p>
                  </div>
                  <span className="mt-1 px-4 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold rounded-lg border border-accent/20 transition-colors">
                    {p.label}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Mobile */}
          <div className="mb-12">
            <p className="text-xs text-text-muted font-bold tracking-widest uppercase mb-5 text-center">Mobile</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                { os: 'iOS', icon: 'iOS', sub: 'iPhone & iPad · iOS 16+', label: 'App Store',
                   href: 'https://apps.apple.com/app/unimatrix/id6748523981' },
                { os: 'Android', icon: 'APK', sub: 'Android 10+', label: 'Google Play',
                   href: 'https://play.google.com/store/apps/details?id=com.getstackmax.unimatrix' },
              ].map((p) => (
                <a key={p.os} href={p.href} target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 bg-surface border border-border/30 hover:border-accent/50 rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-accent/10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/15 to-[#334155]/20 border border-border/30 flex items-center justify-center">
                    <span className="text-xs font-black text-accent tracking-wider">{p.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-text group-hover:text-accent transition-colors">{p.os}</p>
                    <p className="text-xs text-text-muted mt-0.5">{p.sub}</p>
                  </div>
                  <span className="mt-1 px-4 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-semibold rounded-lg border border-accent/20 transition-colors">
                    {p.label} &rarr;
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Web portal CTA */}
          <div className="bg-gradient-to-r from-[#111827] via-[#0F1A2E] to-[#111827] border border-accent/20 rounded-2xl p-8 text-center">
            <p className="text-xs text-accent font-bold tracking-widest uppercase mb-3">No download needed</p>
            <h3 className="text-2xl font-bold text-text mb-2">Use the Web App</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
              Browse memories, manage workspaces, and configure your API keys from any browser — no install required.
            </p>
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-accent/20">
              Open Web App &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Collaborative AI Room ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-secondary/10 border border-[#A855F7]/30 rounded-full text-xs text-accent-secondary font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
              Desktop App — Pro &amp; Enterprise
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Collaborative <span className="text-accent-secondary">AI Room</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Multiple AI clients can read from and write to the same Unimatrix memory layer at the same time.
              Useful for complex workflows where different models contribute.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: 'MEM', title: 'Shared Memory', desc: "Every AI reads from the same Unimatrix context. No one starts cold." },
              { icon: 'AI', title: 'Async Contributions', desc: "Each LLM chimes in when it has a relevant point — best answer, not just first." },
              { icon: 'SLF', title: 'Self-Hosted Option', desc: "Run the room on your own hardware. Your data stays on your server." },
            ].map((item) => (
              <div key={item.title} className="bg-surface border border-[#A855F7]/20 rounded-2xl p-6 text-center">
                <div className="text-xs font-black text-accent-secondary tracking-widest mb-4">{item.icon}</div>
                <h3 className="text-base font-bold text-text mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-[#080D19] border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Multi-AI World</h2>
            <p className="text-text-secondary text-lg">You use multiple AIs. Unimatrix makes them feel like one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: 'XLM', title: 'Cross-Client Memory', desc: 'The same memories are readable and writable from Claude Desktop, Cursor, Windsurf, custom agents, or your own scripts via the MCP protocol.' },
              { icon: 'SYN', title: 'Structured Organization', desc: 'Memories live in hierarchical Palaces and Locations (method of loci model), not a flat key-value bag. Better navigation and context for agents.' },
              { icon: 'PVT', title: 'Self-Host or Cloud', desc: 'Use our managed cloud or run the full stack yourself with Docker + PostgreSQL + pgvector for complete data sovereignty.' },
              { icon: 'ANY', title: 'Standard MCP Interface', desc: 'Works with any client that speaks the Model Context Protocol. No proprietary SDKs or per-model integrations.' },
              { icon: 'SLT', title: 'Explicit Control', desc: 'You (and your prompts) decide when tools are called. No hidden background syncing or surprise data exfiltration.' },
              { icon: 'MCP', title: 'Real Tool Schemas', desc: 'unimatrix_list_palaces, unimatrix_store_memory, unimatrix_search_memories, etc. Full schemas available via tools/list.' },
              { icon: 'CTL', title: 'Agent Governance & Limits', desc: 'Per-agent daily spend caps, real-time cost tracking, and automatic budget alerts. Never get surprised by runaway agent costs.' },
              { icon: 'HIT', title: 'Human-in-the-Loop Controls', desc: 'Configurable approval gates for sensitive actions. Agents can request permission before executing high-impact tools.' },
              { icon: 'TEL', title: 'Full Telemetry & Audit', desc: 'Detailed token usage logs, cost attribution per agent, and complete audit trail for every approval and configuration change.' },
            ].map((feature) => (
              <div key={feature.title}
                className="group bg-surface border border-border/30 rounded-2xl p-6 hover:border-accent/30 transition-all duration-200">
                <div className="text-xs font-black text-accent/60 tracking-widest mb-4">{feature.icon}</div>
                <h3 className="text-base font-bold text-text mb-2 group-hover:text-accent transition-colors">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise Controls ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-border/20 bg-[#080D19]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-xs text-[#22C55E] font-medium mb-6">
              ENTERPRISE READY
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Production-Grade Agent Controls</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Run dozens of agents safely with real financial guardrails and human oversight.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Spend Limits & Budgets", desc: "Set daily caps per agent. Get alerts at 80%. Hard blocks when limits are reached." },
              { title: "Human-in-the-Loop", desc: "Fine-grained approval workflows. Sensitive tools can require explicit human sign-off before execution." },
              { title: "Full Observability", desc: "Per-agent token usage, cost attribution, anomaly detection, and complete audit logs for compliance." },
            ].map((item, i) => (
              <div key={i} className="bg-surface border border-[#22C55E]/20 rounded-2xl p-7">
                <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Competitive Positioning ──────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-border/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-text mb-6">Unimatrix vs. Mem0 / MemGPT</h2>
          <div className="text-left text-text-secondary text-sm leading-relaxed bg-surface border border-border/30 rounded-2xl p-8">
            <p className="mb-4">
              Unimatrix and Mem0 solve different problems.
            </p>
            <p className="mb-4">
              Mem0 is a lightweight, embeddable memory layer designed primarily for single-agent applications. You typically run it yourself as a key-value store inside your own agent loop.
            </p>
            <p>
              Unimatrix is a managed, multi-tenant <strong>MCP server</strong> built for developers who use many different AI clients (Claude Desktop, Cursor, Windsurf, Continue, custom agents). It provides a standardized protocol interface, hierarchical &quot;Memory Palace&quot; organization, semantic search, and first-class support for cross-client federation without writing per-tool glue code.
            </p>
            <p className="mt-4 text-xs text-text-muted">
              Choose Mem0 if you want a simple store inside one agent you fully control.<br />
              Choose Unimatrix if you want your context available to every MCP client you already use.
            </p>
          </div>
        </div>
      </section>

      {/* ── Security & Architecture (new trust section) ───────────────── */}
      <section className="py-20 px-6 border-t border-border/20 bg-[#080D19]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Security &amp; Architecture</h2>
            <p className="text-text-secondary">Built as infrastructure. Not magic.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-surface border border-border/30 rounded-2xl p-8">
              <h3 className="font-bold mb-3 text-accent">Encryption &amp; Access</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>• Memories encrypted at rest with AES-256-GCM (scrypt KDF per user)</li>
                <li>• TLS 1.3 in transit</li>
                <li>• Clerk JWT authentication + PostgreSQL Row Level Security</li>
                <li>• Raw API keys are never stored (only bcrypt-hashed prefixes)</li>
              </ul>
            </div>
            <div className="bg-surface border border-border/30 rounded-2xl p-8">
              <h3 className="font-bold mb-3 text-accent">Data Control &amp; Transparency</h3>
              <ul className="space-y-2 text-text-secondary">
                <li>• Full delete and export via API at any time</li>
                <li>• No training on your data, ever</li>
                <li>• All MCP tool calls are auditable per account</li>
                <li>• Self-host the entire stack (Docker + Postgres + pgvector) if you prefer</li>
              </ul>
            </div>
          </div>

          <p className="text-center text-xs text-text-muted mt-8">
            Full details in <a href="https://github.com/tjpoisal/UNIMATRIX/blob/main/SECURITY.md" target="_blank" className="underline hover:text-text">SECURITY.md</a> and the self-host guide.
          </p>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-[#080D19] border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-text-secondary text-lg">Start free. Scale when you need it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free tier */}
            <div className="bg-surface border border-border/30 rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-text mb-1">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-text">$0</span>
                  <span className="text-text-secondary text-sm">forever</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {['3 memory workspaces', '200 memories', '2 devices', 'All LLMs supported', 'MCP + REST API'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <span className="text-accent text-xs">&#x2713;</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register"
                className="block w-full py-3 text-center font-semibold rounded-xl text-sm border border-border/60 hover:border-accent/40 text-text-secondary hover:text-text transition-all duration-200">
                Start Free
              </Link>
            </div>

            {/* Pro tier — highlighted */}
            <div className="relative bg-gradient-to-b from-accent/10 to-[#111827] border border-accent/50 rounded-2xl p-8 shadow-xl shadow-accent/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-accent text-bg text-xs font-bold rounded-full">MOST POPULAR</span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-text mb-1">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-text">$9</span>
                  <span className="text-text-secondary text-sm">/month</span>
                </div>
                <p className="text-xs text-text-muted mt-1">or $79/year — save $29</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited workspaces', 'Unlimited memories', 'Unlimited devices', 'All LLMs supported', 'Collaborative AI Room', 'Agent Spend Controls & HITL', 'Full Audit Logs & Telemetry', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <span className="text-accent text-xs">&#x2713;</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing"
                className="block w-full py-3 text-center font-semibold rounded-xl text-sm bg-accent hover:bg-accent/90 text-bg transition-all duration-200">
                Get Pro
              </Link>
            </div>

            {/* Enterprise tier */}
            <div className="bg-surface border border-border/30 rounded-2xl p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-text mb-1">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-text">$29</span>
                  <span className="text-text-secondary text-sm">/month</span>
                </div>
                <p className="text-xs text-text-muted mt-1">or $299/year — save $49</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Pro', 'Self-hosted Docker', 'Team memory sharing', 'Agentic device control', '100 API keys', 'SSO / SAML', 'SLA + dedicated support'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <span className="text-accent text-xs">&#x2713;</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/checkout?plan=enterprise&interval=monthly"
                className="block w-full py-3 text-center font-semibold rounded-xl text-sm border border-border/60 hover:border-accent/40 text-text-secondary hover:text-text transition-all duration-200">
                Get Enterprise
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-text-muted mt-8">
            All paid plans include a 14-day free trial. Cancel anytime. Powered by Stripe.
          </p>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-r from-accent/5 via-[#0A0F1C] to-accent-secondary/5 border-t border-border/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={62} height={68}
              className="opacity-60 drop-shadow-[0_0_16px_rgba(0,245,255,0.3)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop re-explaining yourself to every AI.</h2>
          <p className="text-text-secondary mb-8 text-lg leading-relaxed">
            Your context belongs to you — not to a single chat window on a single device.
            Unimatrix makes every AI smarter by giving it your full history, everywhere.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register"
              className="w-full sm:w-auto inline-block px-10 py-4 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-accent/20 hover:scale-[1.02]">
              Get Started Free
            </Link>
            <Link href="/auth/login"
              className="w-full sm:w-auto inline-block px-10 py-4 border border-border/60 hover:border-accent/40 text-text-secondary hover:text-text font-semibold rounded-xl text-base transition-all duration-200">
              Sign In to Web App
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={31} height={34} className="opacity-60" />
            <div>
              <span className="font-black text-base tracking-tight">
                <span className="text-accent">UNI</span>
                <span className="text-[#8892A4]">MATRIX</span>
              </span>
              <p className="text-xs text-text-muted mt-0.5">deployunimatrix.com &middot; hello@deployunimatrix.com</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-text-muted">
            <a href="#how-it-works" className="hover:text-text-secondary transition-colors">How It Works</a>
            <a href="#platforms" className="hover:text-text-secondary transition-colors">Downloads</a>
            <Link href="/docs/mcp" className="hover:text-text-secondary transition-colors">MCP Reference</Link>
            <a href="#features" className="hover:text-text-secondary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-text-secondary transition-colors">Pricing</a>
            <Link href="/auth/login" className="hover:text-text-secondary transition-colors">Sign In</Link>
            <Link href="/auth/register" className="hover:text-text-secondary transition-colors">Register</Link>
          </div>
          <p className="text-xs text-[#334155]">&copy; 2026 Unimatrix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
