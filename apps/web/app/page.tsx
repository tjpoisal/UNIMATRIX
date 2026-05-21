import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Unimatrix — Your AI Remembers Everything. Everywhere.',
  description:
    'Universal AI memory persistence via MCP. Start with ChatGPT on iPhone, continue with Claude on iPad. Cross-LLM, cross-device context continuity — automatically.',
  keywords: [
    'cross-LLM AI memory',
    'AI context continuity',
    'MCP memory server',
    'persistent AI memory',
    'cross-device AI',
    'ChatGPT Claude memory sync',
    'AI memory persistence',
    'MCP server',
  ],
  openGraph: {
    title: 'Unimatrix — Your AI Remembers Everything. Everywhere.',
    description:
      'Universal AI memory persistence via MCP. Start with ChatGPT on iPhone, continue with Claude on iPad. Full context, every time.',
    url: 'https://deployunimatrix.com',
    siteName: 'Unimatrix',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unimatrix — Your AI Remembers Everything. Everywhere.',
    description: 'Cross-LLM, cross-device AI memory persistence via MCP.',
  },
};

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#F1F5F9]">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#334155]/30 bg-[#0A0F1C]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-icon-light.svg"
              alt="Unimatrix"
              width={36}
              height={27}
              className="opacity-90"
            />
            <span className="font-black text-lg tracking-tight leading-none">
              <span className="text-[#00F5FF]">UNI</span>
              <span className="text-[#F1F5F9]">MATRIX</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-[#64748B]">
            <a href="#how-it-works" className="hover:text-[#94A3B8] transition-colors">How It Works</a>
            <a href="#platforms" className="hover:text-[#94A3B8] transition-colors">Platforms</a>
            <a href="#features" className="hover:text-[#94A3B8] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#94A3B8] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 border border-[#334155]/60 hover:border-[#00F5FF]/40 text-[#94A3B8] hover:text-[#F1F5F9] font-semibold rounded-lg text-sm transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-bold rounded-lg text-sm transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-full text-xs text-[#00F5FF] font-medium mb-8 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5FF] animate-pulse" />
            Universal AI Memory · MCP Protocol · Cross-LLM · All Platforms
          </div>

          {/* Logo mark in hero */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-icon-cyan.svg"
              alt="Unimatrix"
              width={80}
              height={60}
              className="opacity-80 drop-shadow-[0_0_24px_rgba(0,245,255,0.4)]"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
            Your AI Remembers{' '}
            <span className="text-[#00F5FF]">Everything.</span>
            <br />
            Everywhere.
          </h1>

          <p className="text-xl text-[#94A3B8] mb-10 max-w-2xl mx-auto leading-relaxed">
            Start a conversation with ChatGPT on your phone. Pick up with Claude on your iPad.
            Get home and let multiple AIs collaborate together — all with full context, automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-bold rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#00F5FF]/20 hover:scale-[1.02]"
            >
              Start Free — No Credit Card
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-8 py-4 border border-[#00F5FF]/40 hover:border-[#00F5FF] text-[#00F5FF] hover:text-[#F1F5F9] font-semibold rounded-xl text-base transition-all duration-200"
            >
              Sign In to Web Portal →
            </Link>
          </div>

          <p className="text-xs text-[#475569]">
            Available on macOS · Windows · Linux · iOS · Android
          </p>
        </div>

        {/* Terminal MCP config demo */}
        <div className="max-w-3xl mx-auto mt-20">
          <div className="bg-[#111827] border border-[#334155]/50 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#334155]/40 bg-[#0D1117]">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
              <div className="w-3 h-3 rounded-full bg-[#22C55E]/80" />
              <span className="ml-2 text-xs text-[#475569] font-mono">claude_desktop_config.json</span>
            </div>
            <pre className="p-6 text-sm font-mono text-[#94A3B8] leading-relaxed overflow-x-auto">
{`{
  "mcpServers": {
    `}<span className="text-[#00F5FF]">"unimatrix"</span>{`: {
      "url": `}<span className="text-[#86EFAC]">"https://unimatrix.vercel.app/api/mcp"</span>{`,
      "apiKey": `}<span className="text-[#FCD34D]">"YOUR_API_KEY"</span>{`
    }
  }
}`}
            </pre>
            <div className="px-6 pb-5 pt-2 border-t border-[#334155]/30">
              <p className="text-xs text-[#475569] font-mono">
                <span className="text-[#22C55E]">✓</span> Claude will now pick up where ChatGPT left off — automatically
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-[#334155]/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-[#94A3B8] text-lg">One config. Every AI. Every device. Forever.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect to Your AI',
                desc: 'Add a single MCP config to Claude Desktop, Cursor, or any MCP-compatible LLM client. Takes 60 seconds.',
                icon: '01',
              },
              {
                step: '02',
                title: 'Have Conversations Normally',
                desc: 'Every AI automatically saves context to Unimatrix in the background. You do nothing differently.',
                icon: '02',
              },
              {
                step: '03',
                title: 'Continue Anywhere, Any AI',
                desc: 'Open any AI on any device and it calls get_recent() at session start — picking up exactly where you left off.',
                icon: '03',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-[#111827] border border-[#334155]/30 rounded-2xl p-8 hover:border-[#00F5FF]/30 transition-all duration-200"
              >
                <div className="text-5xl font-black text-[#00F5FF]/20 mb-5">{item.icon}</div>
                <div className="text-xs text-[#00F5FF] font-bold tracking-widest mb-3">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#F1F5F9] mb-3">{item.title}</h3>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Downloads ───────────────────────────────────────────── */}
      <section id="platforms" className="py-24 px-6 bg-[#080D19] border-t border-[#334155]/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Every Platform. One Memory.</h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              Download Unimatrix for your device. Every platform connects to the same MCP memory
              layer — your context follows you everywhere.
            </p>
          </div>

          {/* Desktop platforms */}
          <div className="mb-10">
            <p className="text-xs text-[#475569] font-bold tracking-widest uppercase mb-5 text-center">Desktop</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  os: 'macOS',
                  icon: 'MAC',
                  sub: 'macOS 13 Ventura or later',
                  ext: '.dmg',
                  href: '#download-macos',
                  badge: 'Apple Silicon + Intel',
                },
                {
                  os: 'Windows',
                  icon: 'WIN',
                  sub: 'Windows 10/11 x64',
                  ext: '.exe',
                  href: '#download-windows',
                  badge: null,
                },
                {
                  os: 'Linux',
                  icon: 'LNX',
                  sub: 'Ubuntu, Fedora, Debian',
                  ext: '.AppImage / .deb',
                  href: '#download-linux',
                  badge: null,
                },
              ].map((p) => (
                <a
                  key={p.os}
                  href={p.href}
                  className="group relative flex flex-col items-center gap-3 bg-[#111827] border border-[#334155]/30 hover:border-[#00F5FF]/50 rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/10 hover:bg-[#111827]/80"
                >
                  {p.badge && (
                    <span className="absolute top-3 right-3 text-xs bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/20 rounded-full px-2 py-0.5 font-medium">
                      {p.badge}
                    </span>
                  )}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00F5FF]/15 to-[#334155]/20 border border-[#334155]/30 flex items-center justify-center">
                    <span className="text-xs font-black text-[#00F5FF] tracking-wider">{p.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#F1F5F9] group-hover:text-[#00F5FF] transition-colors">{p.os}</p>
                    <p className="text-xs text-[#475569] mt-0.5">{p.sub}</p>
                  </div>
                  <span className="mt-1 px-4 py-1.5 bg-[#00F5FF]/10 hover:bg-[#00F5FF]/20 text-[#00F5FF] text-xs font-semibold rounded-lg border border-[#00F5FF]/20 transition-colors">
                    Download {p.ext}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Mobile platforms */}
          <div className="mb-12">
            <p className="text-xs text-[#475569] font-bold tracking-widest uppercase mb-5 text-center">Mobile</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                {
                  os: 'iOS',
                  icon: 'iOS',
                  sub: 'iPhone & iPad · iOS 16+',
                  label: 'App Store',
                  href: '#download-ios',
                },
                {
                  os: 'Android',
                  icon: 'APK',
                  sub: 'Android 10+',
                  label: 'Google Play',
                  href: '#download-android',
                },
              ].map((p) => (
                <a
                  key={p.os}
                  href={p.href}
                  className="group flex flex-col items-center gap-3 bg-[#111827] border border-[#334155]/30 hover:border-[#00F5FF]/50 rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/10"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00F5FF]/15 to-[#334155]/20 border border-[#334155]/30 flex items-center justify-center">
                    <span className="text-xs font-black text-[#00F5FF] tracking-wider">{p.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#F1F5F9] group-hover:text-[#00F5FF] transition-colors">{p.os}</p>
                    <p className="text-xs text-[#475569] mt-0.5">{p.sub}</p>
                  </div>
                  <span className="mt-1 px-4 py-1.5 bg-[#00F5FF]/10 hover:bg-[#00F5FF]/20 text-[#00F5FF] text-xs font-semibold rounded-lg border border-[#00F5FF]/20 transition-colors">
                    {p.label} →
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Web portal CTA */}
          <div className="bg-gradient-to-r from-[#111827] via-[#0F1A2E] to-[#111827] border border-[#00F5FF]/20 rounded-2xl p-8 text-center">
            <p className="text-xs text-[#00F5FF] font-bold tracking-widest uppercase mb-3">Already have an account?</p>
            <h3 className="text-2xl font-bold text-[#F1F5F9] mb-2">Access the Web Portal</h3>
            <p className="text-[#94A3B8] text-sm mb-6 max-w-md mx-auto">
              Browse your memories, manage workspaces, and configure your API key from any browser.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-[#00F5FF]/20"
            >
              Sign In to Web Portal →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Collaborative AI Room ────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-[#334155]/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#A855F7]/10 border border-[#A855F7]/30 rounded-full text-xs text-[#A855F7] font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
              Desktop App — In Development
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Collaborative{' '}
              <span className="text-[#A855F7]">AI Room</span>
            </h2>
            <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
              We&apos;re building a desktop app where multiple AIs participate in your conversation
              simultaneously — each one with full context from Unimatrix. Claude, GPT-4, Gemini,
              and others in the same room, each chiming in when they have something useful to add.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: 'MEM',
                title: 'Shared Memory',
                desc: 'Every AI in the room reads from the same Unimatrix context. No one starts cold.',
              },
              {
                icon: 'AI',
                title: 'Async Contributions',
                desc: 'Each LLM chimes in when it has a relevant point — you get the best answer, not just the first one.',
              },
              {
                icon: 'SLF',
                title: 'Self-Hosted Option',
                desc: 'Run the room on your own hardware. Your data stays on your server. Total privacy.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#111827] border border-[#A855F7]/20 rounded-2xl p-6 text-center"
              >
                <div className="text-xs font-black text-[#A855F7] tracking-widest mb-4">{item.icon}</div>
                <h3 className="text-base font-bold text-[#F1F5F9] mb-2">{item.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-[#475569]">
              The MCP memory layer is live today.{' '}
              <Link href="/auth/register" className="text-[#A855F7] hover:text-[#C084FC] transition-colors">
                Sign up to get early access to the desktop app →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── AI Agents ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#080D19] border-t border-[#334155]/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-full text-xs text-[#F59E0B] font-medium mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                Enterprise Tier — Roadmap
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                AIs That Work{' '}
                <span className="text-[#F59E0B]">For You</span>
              </h2>
              <p className="text-[#94A3B8] leading-relaxed mb-6">
                The Enterprise tier will let Unimatrix agents operate your devices on your behalf,
                with your explicit permission for every class of action. Because Unimatrix already
                holds full context of your work, the agents have everything they need to act —
                not just respond.
              </p>
              <ul className="space-y-3">
                {[
                  'Operate apps and desktop workflows on your behalf',
                  'Browse and synthesize the web in the background',
                  'Draft and queue communications for your review',
                  'Manage files, calendars, and task lists',
                  'Every action gated by explicit user permission',
                  'Full tamper-proof audit log of every action taken',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#94A3B8]">
                    <span className="text-[#F59E0B] mt-0.5 text-xs">▶</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What's real today */}
            <div>
              <p className="text-xs text-[#475569] font-bold tracking-widest uppercase mb-4">Live Today via MCP</p>
              <div className="space-y-3">
                {[
                  {
                    tool: 'unimatrix.remember()',
                    desc: 'Store a memory from any LLM conversation',
                    live: true,
                  },
                  {
                    tool: 'unimatrix.recall(query)',
                    desc: 'Semantic search across all your memories from every LLM',
                    live: true,
                  },
                  {
                    tool: 'unimatrix.get_recent()',
                    desc: 'Fetch last N memories across all devices and LLMs',
                    live: true,
                  },
                  {
                    tool: 'unimatrix.continue_from()',
                    desc: 'Load full context of a prior session into a new one',
                    live: true,
                  },
                  {
                    tool: 'unimatrix.list_contexts()',
                    desc: 'List all active workspaces',
                    live: true,
                  },
                ].map((t) => (
                  <div
                    key={t.tool}
                    className="bg-[#111827] border border-[#334155]/30 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#22C55E] font-bold">✓ LIVE</span>
                      <code className="text-xs text-[#00F5FF] font-mono">{t.tool}</code>
                    </div>
                    <p className="text-xs text-[#64748B]">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 border-t border-[#334155]/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Multi-AI World</h2>
            <p className="text-[#94A3B8] text-lg">You use multiple AIs. Unimatrix makes them feel like one.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: 'XLM',
                title: 'Cross-LLM Memory',
                desc: 'Start with ChatGPT. Continue with Claude. Switch to Gemini. Same context, always. No re-explaining.',
              },
              {
                icon: 'SYN',
                title: 'Cross-Device Sync',
                desc: 'iPhone → iPad → desktop → home server. The conversation thread never breaks, no matter what device.',
              },
              {
                icon: 'PVT',
                title: 'Private Cloud',
                desc: 'Run Unimatrix on your own hardware for complete data sovereignty. Or use our secure cloud.',
              },
              {
                icon: 'ANY',
                title: 'Works with Any AI',
                desc: 'Claude, ChatGPT, Gemini, Groq, Ollama. If it supports MCP, it works with Unimatrix.',
              },
              {
                icon: 'SLT',
                title: 'Invisible by Design',
                desc: 'No new app to open. No copy-paste. No manual summaries. Unimatrix runs silently in the background.',
              },
              {
                icon: 'MCP',
                title: 'MCP Native',
                desc: 'Remember, recall, continue_from, get_recent — standard MCP tools that any LLM can call.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-[#111827] border border-[#334155]/30 rounded-2xl p-6 hover:border-[#00F5FF]/30 transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/5"
              >
                <div className="text-xs font-black text-[#00F5FF]/60 tracking-widest mb-4">{feature.icon}</div>
                <h3 className="text-base font-bold text-[#F1F5F9] mb-2 group-hover:text-[#00F5FF] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Competitive moat ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#080D19] border-t border-[#334155]/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#F1F5F9] mb-10">Why Not Just Use Mem0 or MemGPT?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Per-LLM memory only', competitor: true },
              { label: 'ChatGPT → Claude continuity', competitor: false },
              { label: 'Cross-device context sync', competitor: false },
              { label: 'Self-hosted + cloud hybrid', competitor: false },
              { label: 'Multi-LLM collaborative room', competitor: false },
              { label: 'Agentic device control', competitor: false },
              { label: 'MCP-native (any LLM, zero integration)', competitor: false },
              { label: 'Mobile + desktop + web', competitor: false },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 bg-[#111827] rounded-xl px-4 py-3 border border-[#334155]/20"
              >
                {item.competitor ? (
                  <span className="text-[#EF4444] text-sm">✗ Others</span>
                ) : (
                  <span className="text-[#00F5FF] text-sm font-bold">✓ Unimatrix</span>
                )}
                <span className="text-sm text-[#94A3B8]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 border-t border-[#334155]/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-[#94A3B8] text-lg">Start free. Scale when you need it.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: [
                  '3 memory workspaces',
                  '1,000 memories',
                  '2 devices',
                  'All LLMs supported',
                  'MCP + REST API',
                ],
                cta: 'Start Free',
                href: '/auth/register',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$9.99',
                period: '/month',
                features: [
                  'Unlimited workspaces',
                  'Unlimited memories',
                  'Unlimited devices',
                  'All LLMs supported',
                  'Collaborative AI room',
                  'Priority support',
                ],
                cta: 'Start Pro',
                href: '/auth/register',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: '$29.99',
                period: '/month',
                features: [
                  'Everything in Pro',
                  'Self-hosted Docker',
                  'Team memory sharing',
                  'Agentic device control',
                  'SSO / SAML',
                  'SLA + dedicated support',
                ],
                cta: 'Get Enterprise',
                href: '/auth/register',
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 border transition-all duration-200 ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-[#00F5FF]/10 to-[#111827] border-[#00F5FF]/50 shadow-xl shadow-[#00F5FF]/10'
                    : 'bg-[#111827] border-[#334155]/30'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-[#00F5FF] text-[#0A0F1C] text-xs font-bold rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#F1F5F9]">{tier.price}</span>
                    <span className="text-[#94A3B8] text-sm">{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                      <span className="text-[#00F5FF] text-xs">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`block w-full py-3 text-center font-semibold rounded-xl text-sm transition-all duration-200 ${
                    tier.highlight
                      ? 'bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C]'
                      : 'border border-[#334155]/60 hover:border-[#00F5FF]/40 text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#00F5FF]/5 via-[#0A0F1C] to-[#A855F7]/5 border-t border-[#334155]/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo-icon-cyan.svg"
              alt="Unimatrix"
              width={56}
              height={42}
              className="opacity-60 drop-shadow-[0_0_16px_rgba(0,245,255,0.3)]"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop re-explaining yourself to every AI.
          </h2>
          <p className="text-[#94A3B8] mb-8 text-lg leading-relaxed">
            Your context belongs to you — not to a single chat window on a single device.
            Unimatrix makes every AI smarter by giving it your full history, everywhere.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto inline-block px-10 py-4 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-bold rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#00F5FF]/20 hover:scale-[1.02]"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto inline-block px-10 py-4 border border-[#334155]/60 hover:border-[#00F5FF]/40 text-[#94A3B8] hover:text-[#F1F5F9] font-semibold rounded-xl text-base transition-all duration-200"
            >
              Sign In to Web Portal
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-[#334155]/30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-icon-light.svg"
              alt="Unimatrix"
              width={28}
              height={21}
              className="opacity-60"
            />
            <div>
              <span className="font-black text-base tracking-tight">
                <span className="text-[#00F5FF]">UNI</span>
                <span className="text-[#8892A4]">MATRIX</span>
              </span>
              <p className="text-xs text-[#475569] mt-0.5">
                deployunimatrix.com · hello@deployunimatrix.com
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-[#64748B]">
            <a href="#how-it-works" className="hover:text-[#94A3B8] transition-colors">How It Works</a>
            <a href="#platforms" className="hover:text-[#94A3B8] transition-colors">Downloads</a>
            <a href="#features" className="hover:text-[#94A3B8] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#94A3B8] transition-colors">Pricing</a>
            <Link href="/auth/login" className="hover:text-[#94A3B8] transition-colors">Sign In</Link>
            <Link href="/auth/register" className="hover:text-[#94A3B8] transition-colors">Register</Link>
          </div>

          <p className="text-xs text-[#334155]">© 2026 Unimatrix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
