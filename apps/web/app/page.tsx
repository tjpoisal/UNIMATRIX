import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export const metadata = {
  title: 'Unimatrix — Your AI Remembers Everything. Everywhere.',
  description:
    'Universal AI memory persistence via MCP. Start with ChatGPT on iPhone, continue with Claude on iPad. Full context, every time, on every device.',
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-black text-lg tracking-tight leading-none">
            <span className="text-[#00F5FF]">UNI</span>
            <span className="text-[#8892A4]">MATRIX</span>
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg text-sm transition-colors"
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
            Universal AI Memory · MCP Protocol · Cross-LLM
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6">
            Your AI Remembers{' '}
            <span className="text-[#00F5FF]">Everything.</span>
            <br />
            Everywhere.
          </h1>

          <p className="text-xl text-[#94A3B8] mb-10 max-w-2xl mx-auto leading-relaxed">
            Start a conversation with ChatGPT on your phone. Pick up with Claude on your iPad.
            Get home and let multiple AIs collaborate — all with full context, automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-4 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-bold rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#00F5FF]/20 hover:scale-[1.02]"
            >
              Start Free — No Credit Card
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 border border-[#334155]/60 hover:border-[#00F5FF]/40 text-[#94A3B8] hover:text-[#F1F5F9] font-semibold rounded-xl text-base transition-all duration-200"
            >
              How It Works →
            </a>
          </div>
        </div>

        {/* Hero visual — terminal-style demo */}
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
            <p className="text-[#94A3B8] text-lg">Three steps to never lose context again.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Unimatrix to Your AI',
                desc: 'Add a single MCP config to Claude Desktop, Cursor, or any MCP-compatible LLM client. Takes 60 seconds.',
                icon: '🔌',
              },
              {
                step: '02',
                title: 'Have Conversations',
                desc: 'Every AI you use automatically saves context to Unimatrix in the background. You do nothing differently.',
                icon: '💬',
              },
              {
                step: '03',
                title: 'Continue Anywhere',
                desc: 'Open any AI on any device and it calls get_recent() at session start — picking up exactly where you left off.',
                icon: '⚡',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-[#111827] border border-[#334155]/30 rounded-2xl p-8 hover:border-[#00F5FF]/30 transition-all duration-200"
              >
                <div className="text-5xl mb-5">{item.icon}</div>
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

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#080D19] border-t border-[#334155]/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Multi-AI World</h2>
            <p className="text-[#94A3B8] text-lg">You use multiple AIs. Unimatrix makes them feel like one.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🔄',
                title: 'Cross-LLM Memory',
                desc: 'Start with ChatGPT. Continue with Claude. Switch to Gemini. Same context, always. No re-explaining.',
              },
              {
                icon: '📱',
                title: 'Cross-Device Sync',
                desc: 'iPhone → iPad → desktop → home server. The conversation thread never breaks, no matter what device.',
              },
              {
                icon: '🔒',
                title: 'Private Cloud',
                desc: 'Run Unimatrix on your own hardware for complete data sovereignty. Or use our secure cloud — your choice.',
              },
              {
                icon: '🤖',
                title: 'Works with Any AI',
                desc: 'Claude, ChatGPT, Gemini, Groq, Ollama. If it supports MCP or REST, it works with Unimatrix.',
              },
              {
                icon: '🫥',
                title: 'Always in the Background',
                desc: 'No new app to open. No copy-paste. No manual summaries. Unimatrix runs silently and remembers for you.',
              },
              {
                icon: '🧑‍💻',
                title: 'Collaborative AI Room',
                desc: 'Multiple AIs in one conversation. Each chimes in when relevant. A room full of expert AIs, live. Coming soon.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-[#111827] border border-[#334155]/30 rounded-2xl p-6 hover:border-[#00F5FF]/30 transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/5"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-base font-bold text-[#F1F5F9] mb-2 group-hover:text-[#00F5FF] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-[#334155]/20">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stop re-explaining yourself to every AI.
          </h2>
          <p className="text-[#94A3B8] mb-8 text-lg leading-relaxed">
            Your context belongs to you — not to a single chat window on a single device.
            Unimatrix makes every AI smarter by giving it your full history, everywhere.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-10 py-4 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-bold rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#00F5FF]/20 hover:scale-[1.02]"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-[#334155]/30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-black text-base tracking-tight">
              <span className="text-[#00F5FF]">UNI</span>
              <span className="text-[#8892A4]">MATRIX</span>
            </span>
            <p className="text-xs text-[#475569] mt-1">
              deployunimatrix.com · hello@deployunimatrix.com
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#64748B]">
            <Link href="/auth/login" className="hover:text-[#94A3B8] transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="hover:text-[#94A3B8] transition-colors">
              Register
            </Link>
            <Link href="/pricing" className="hover:text-[#94A3B8] transition-colors">
              Pricing
            </Link>
          </div>
          <p className="text-xs text-[#334155]">
            © 2026 Unimatrix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
