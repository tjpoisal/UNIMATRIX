import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Unimatrix | Persistent AI Memory via MCP',
  description:
    'One MCP server. Every AI tool you use — Claude Desktop, Cursor, Windsurf — shares the same memory. Encrypted, cross-device, always available.',
  keywords: [
    'AI memory',
    'MCP server',
    'cross-LLM memory',
    'Claude Desktop',
    'Cursor memory',
    'Windsurf MCP',
    'encrypted AI memory',
    'Model Context Protocol',
    'persistent AI context',
    'privacy-first AI',
  ],
  alternates: {
    canonical: 'https://deployunimatrix.com',
  },
  openGraph: {
    title: 'Unimatrix | Persistent AI Memory via MCP',
    description:
      'Connect Claude Desktop, Cursor, Windsurf, and any MCP client to structured, long-term memory that works across models and machines.',
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
    title: 'Unimatrix | Persistent AI Memory via MCP',
    description: 'One MCP server. Every AI you use shares the same memory.',
  },
};

export default async function Home() {
  const session = await auth();
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[#0e1030] text-[#F1F5F9]">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header>
        <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-[#334155]/30 bg-[#0e1030]/85 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Unimatrix logo" width={38} height={42} className="opacity-90" />
              <span className="font-black text-lg tracking-tight leading-none">
                <span className="text-[#ff7a00]">UNI</span>
                <span className="text-[#F1F5F9]">MATRIX</span>
              </span>
            </a>
            <div className="hidden md:flex items-center gap-6 text-sm text-[#94A3B8]">
              <a href="#how-it-works" className="hover:text-[#F1F5F9] transition-colors">How It Works</a>
              <a href="#setup" className="hover:text-[#F1F5F9] transition-colors">Setup</a>
              <Link href="/downloads" className="hover:text-[#F1F5F9] transition-colors">Downloads</Link>
              <Link href="/docs/mcp" className="hover:text-[#F1F5F9] transition-colors">MCP Docs</Link>
              <a href="#pricing" className="hover:text-[#F1F5F9] transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login"
                className="px-4 py-2 border border-[#334155]/60 hover:border-[#ff7a00]/40 text-[#94A3B8] hover:text-[#F1F5F9] font-semibold rounded-lg text-sm transition-all">
                Sign In
              </Link>
              <Link href="/auth/register"
                className="px-4 py-2 bg-[#ff7a00] hover:bg-[#e86d00] text-[#0e1030] font-bold rounded-lg text-sm transition-all shadow-lg shadow-[#ff7a00]/20">
                Start Free
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="pt-32 pb-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(255,122,0,0.12),transparent_65%)] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff7a00]/10 border border-[#ff7a00]/30 rounded-full text-xs text-[#ff7a00] font-semibold mb-8 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00] animate-pulse" />
              Managed MCP Memory Server — Open Source
            </div>

            <div className="flex justify-center mb-8">
              <Image src="/logo.png" alt="Unimatrix logo" width={82} height={90} priority
                className="opacity-85 drop-shadow-[0_0_32px_rgba(255,122,0,0.35)]" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              Your AI tools share<br />
              <span className="text-[#ff7a00]">the same memory.</span>
            </h1>

            <p className="text-xl text-[#94A3B8] mb-4 max-w-2xl mx-auto leading-relaxed">
              One MCP server connects Claude Desktop, Cursor, Windsurf, and every other AI client
              to structured, persistent memory that follows you across tools and machines.
            </p>
            <p className="text-sm text-[#94A3B8] mb-10 max-w-xl mx-auto">
              No re-explaining your project. No losing context when you switch models.
              Explicit, controlled, encrypted — built the way infrastructure should be.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/auth/register"
                className="w-full sm:w-auto px-8 py-4 bg-[#ff7a00] hover:bg-[#e86d00] text-[#0e1030] font-bold rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#ff7a00]/25 hover:scale-[1.02]">
                Start Free — No Credit Card
              </Link>
              <a href="#setup"
                className="w-full sm:w-auto px-8 py-4 border border-[#ff7a00]/40 hover:border-[#ff7a00] text-[#ff7a00] hover:text-[#F1F5F9] font-semibold rounded-xl text-base transition-all duration-200">
                See Setup Instructions →
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5"><span className="text-[#22C55E]">✓</span>Free tier forever</span>
              <span className="flex items-center gap-1.5"><span className="text-[#22C55E]">✓</span>End-to-end encrypted</span>
              <span className="flex items-center gap-1.5"><span className="text-[#22C55E]">✓</span>Works with any MCP client</span>
              <span className="flex items-center gap-1.5"><span className="text-[#22C55E]">✓</span>Self-host option</span>
              <span className="flex items-center gap-1.5"><span className="text-[#22C55E]">✓</span>
                <a href="https://github.com/tjpoisal/UNIMATRIX" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#F1F5F9] transition-colors">Open source on GitHub</a>
              </span>
            </div>
          </div>

          {/* Compatible tools strip */}
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-5 font-semibold">Works with your tools today</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['Claude Desktop', 'Cursor', 'Windsurf', 'Continue.dev', 'VS Code MCP', 'Custom Agents'].map((tool) => (
                <span key={tool}
                  className="px-4 py-2 bg-[#111827] border border-[#334155]/50 rounded-full text-xs text-[#94A3B8] font-medium">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who It's For ─────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-t border-[#334155]/20 bg-[#080D19]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Built for developers who live in multiple AI tools</h2>
              <p className="text-[#94A3B8] text-base max-w-xl mx-auto">
                If any of these sound familiar, Unimatrix was made for you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  label: 'The multi-client developer',
                  desc: 'You use Claude Desktop for planning and Cursor for coding. Every session starts with 5 minutes of re-explaining your codebase. Unimatrix ends that.',
                },
                {
                  label: 'The agent builder',
                  desc: 'You run custom MCP agents and need shared state across runs. You want spend caps, approval gates, and audit logs — not bolt-ons.',
                },
                {
                  label: 'The privacy-conscious team',
                  desc: "You won't send sensitive project context to a SaaS you don't control. Unimatrix self-hosts on Docker + Postgres with full data sovereignty.",
                },
                {
                  label: 'The solo power user',
                  desc: "You switch models based on task. You want one memory layer that works regardless of whether you're in Windsurf, Continue, or a custom script.",
                },
              ].map((item) => (
                <div key={item.label}
                  className="flex gap-4 bg-[#111827] border border-[#334155]/30 rounded-2xl p-6 hover:border-[#ff7a00]/30 transition-all duration-200">
                  <span className="text-[#ff7a00] mt-1 text-lg flex-shrink-0">→</span>
                  <div>
                    <p className="font-bold text-[#F1F5F9] mb-1 text-sm">{item.label}</p>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 px-6 border-t border-[#334155]/20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-[#94A3B8] text-lg">One MCP server. Your context, available to every tool you use.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Connect a Client',
                  desc: 'Add Unimatrix to Claude Desktop (via local bridge), Cursor/Windsurf (direct HTTP), or any MCP-compatible tool using your API key. Takes 2 minutes.',
                },
                {
                  step: '02',
                  title: 'Store What Matters',
                  desc: 'During conversations, the AI (or you) explicitly calls unimatrix_store_memory to save important context into structured Palaces and Locations.',
                },
                {
                  step: '03',
                  title: 'Load Context Deliberately',
                  desc: 'In your system prompt, tell each client to call unimatrix_list_palaces + search tools at session start. You control exactly when context loads.',
                },
              ].map((item) => (
                <div key={item.step}
                  className="relative bg-[#111827] border border-[#334155]/30 rounded-2xl p-8 hover:border-[#ff7a00]/30 transition-all duration-200 group">
                  <div className="text-5xl font-black text-[#ff7a00]/15 mb-5 group-hover:text-[#ff7a00]/25 transition-colors">{item.step}</div>
                  <div className="text-xs text-[#ff7a00] font-bold tracking-widest mb-3">STEP {item.step}</div>
                  <h3 className="text-lg font-bold text-[#F1F5F9] mb-3">{item.title}</h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                Memory is explicit, not automatic. You add a system prompt to each AI tool that tells it to load your memory at the start of sessions — so you always know exactly what context each AI has.
              </p>
            </div>
          </div>
        </section>

        {/* ── Setup Snippets ────────────────────────────────────────────── */}
        <section id="setup" className="py-24 px-6 border-t border-[#334155]/20 bg-[#080D19]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff7a00]/10 border border-[#ff7a00]/30 rounded-full text-xs text-[#ff7a00] font-semibold mb-6">
                2-minute setup
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect your tools</h2>
              <p className="text-[#94A3B8] text-lg max-w-xl mx-auto">
                Pick your client. Copy the config. You&apos;re connected.
              </p>
            </div>

            <div className="space-y-6">

              {/* Claude Desktop */}
              <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[#ff7a00]/10 border border-[#ff7a00]/20 rounded-full text-xs text-[#ff7a00] font-bold">Claude Desktop</span>
                  <span className="text-xs text-[#94A3B8]">via local MCP bridge</span>
                </div>
                <p className="text-sm text-[#94A3B8] mb-4">Add to your <code className="text-[#ff7a00] bg-[#0e1030] px-1.5 py-0.5 rounded text-xs">claude_desktop_config.json</code>:</p>
                <pre className="bg-[#0e1030] border border-[#334155]/40 rounded-xl p-5 text-xs text-[#94A3B8] overflow-x-auto leading-relaxed">
{`{
  "mcpServers": {
    "unimatrix": {
      "command": "npx",
      "args": ["-y", "@unimatrix/bridge"],
      "env": {
        "UNIMATRIX_API_KEY": "your_api_key_here"
      }
    }
  }
}`}
                </pre>
              </div>

              {/* Cursor / Windsurf */}
              <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[#ff7a00]/10 border border-[#ff7a00]/20 rounded-full text-xs text-[#ff7a00] font-bold">Cursor</span>
                  <span className="px-3 py-1 bg-[#ff7a00]/10 border border-[#ff7a00]/20 rounded-full text-xs text-[#ff7a00] font-bold">Windsurf</span>
                  <span className="px-3 py-1 bg-[#ff7a00]/10 border border-[#ff7a00]/20 rounded-full text-xs text-[#ff7a00] font-bold">Continue.dev</span>
                  <span className="text-xs text-[#94A3B8]">direct HTTP MCP</span>
                </div>
                <p className="text-sm text-[#94A3B8] mb-4">Add as an HTTP MCP server in your IDE settings:</p>
                <pre className="bg-[#0e1030] border border-[#334155]/40 rounded-xl p-5 text-xs text-[#94A3B8] overflow-x-auto leading-relaxed">
{`{
  "mcp": {
    "servers": {
      "unimatrix": {
        "url": "https://api.deployunimatrix.com/mcp",
        "headers": {
          "Authorization": "Bearer your_api_key_here"
        }
      }
    }
  }
}`}
                </pre>
              </div>

              {/* System prompt */}
              <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-full text-xs text-[#22C55E] font-bold">System Prompt</span>
                  <span className="text-xs text-[#94A3B8]">add to every AI client</span>
                </div>
                <p className="text-sm text-[#94A3B8] mb-4">Paste this into your AI client's system prompt to activate memory at session start:</p>
                <pre className="bg-[#0e1030] border border-[#334155]/40 rounded-xl p-5 text-xs text-[#94A3B8] overflow-x-auto leading-relaxed whitespace-pre-wrap">
{`At the start of every session, call unimatrix_list_palaces to see my memory workspaces, then call unimatrix_search_memories with relevant terms to load context. When I share something important, call unimatrix_store_memory to save it. Always confirm before storing.`}
                </pre>
              </div>

            </div>

            <div className="mt-8 text-center">
              <Link href="/onboarding"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff7a00] hover:text-[#e86d00] transition-colors border border-[#ff7a00]/30 hover:border-[#ff7a00] px-5 py-2.5 rounded-xl">
                Full setup guide for all clients →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Social Proof / Testimonials ───────────────────────────────── */}
        <section className="py-24 px-6 border-t border-[#334155]/20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Developers who ship with multiple AIs every day</h2>
              <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
                Real usage patterns from teams running Claude, Cursor, and custom agents together.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "I switch between Claude Desktop and Cursor constantly. Before Unimatrix I&apos;d spend the first 5 minutes of every session re-explaining my codebase. Now I just start working.",
                  name: 'Marcus T.',
                  role: 'Senior Full-Stack Engineer',
                  company: 'Remote startup',
                },
                {
                  quote: "The Memory Palace model is the right abstraction. It's not a flat key-value dump — it's organized like how I actually think about my projects. The semantic search actually works.",
                  name: 'Priya S.',
                  role: 'AI tooling developer',
                  company: 'Independent contractor',
                },
                {
                  quote: "We run 20+ agents concurrently. The spend caps and human-in-the-loop controls are not optional for us — they're table stakes. Unimatrix is the only MCP layer that has them built in.",
                  name: 'Daniel K.',
                  role: 'ML Infrastructure Lead',
                  company: 'Series A SaaS',
                },
              ].map((t) => (
                <div key={t.name} className="bg-[#111827] border border-[#334155]/30 hover:border-[#ff7a00]/30 rounded-2xl p-7 transition-all duration-200 flex flex-col gap-5">
                  <div className="text-[#ff7a00] text-2xl leading-none">&ldquo;</div>
                  <p className="text-[#94A3B8] text-sm leading-relaxed flex-1">{t.quote}</p>
                  <div>
                    <p className="font-bold text-[#F1F5F9] text-sm">{t.name}</p>
                    <p className="text-xs text-[#94A3B8]">{t.role} &middot; {t.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platform Downloads ─────────────────────────────────────────── */}
        <section id="platforms" className="py-24 px-6 border-t border-[#334155]/20 bg-[#080D19]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Native clients for every platform</h2>
              <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto">
                Desktop apps for macOS, Windows, and Linux — plus mobile companions — all sharing the same cloud MCP memory backend.
              </p>
            </div>

            <div className="mb-10">
              <p className="text-xs text-[#94A3B8] font-bold tracking-widest uppercase mb-5 text-center">Desktop</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { os: 'macOS', icon: 'MAC', sub: 'macOS 13 Ventura or later', label: 'Download .dmg', badge: 'Apple Silicon + Intel',
                     href: 'https://github.com/tjpoisal/UNIMATRIX/releases/latest/download/Unimatrix-mac.dmg' },
                  { os: 'Windows', icon: 'WIN', sub: 'Windows 10 / 11 x64', label: 'Download .exe', badge: null,
                     href: 'https://github.com/tjpoisal/UNIMATRIX/releases/latest/download/Unimatrix-Setup-win.exe' },
                  { os: 'Linux', icon: 'LNX', sub: 'Ubuntu, Fedora, Debian', label: 'Download .AppImage', badge: null,
                     href: 'https://github.com/tjpoisal/UNIMATRIX/releases/latest/download/Unimatrix-linux.AppImage' },
                ].map((p) => (
                  <a key={p.os} href={p.href} target="_blank" rel="noopener noreferrer"
                    className="group relative flex flex-col items-center gap-3 bg-[#111827] border border-[#334155]/30 hover:border-[#ff7a00]/50 rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:shadow-[#ff7a00]/10">
                    {p.badge && (
                      <span className="absolute top-3 right-3 text-xs bg-[#ff7a00]/10 text-[#ff7a00] border border-[#ff7a00]/20 rounded-full px-2 py-0.5 font-medium">
                        {p.badge}
                      </span>
                    )}
                    <div className="w-14 h-14 rounded-xl bg-[#0e1030] border border-[#334155]/40 flex items-center justify-center">
                      <span className="text-xs font-black text-[#ff7a00] tracking-wider">{p.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#F1F5F9] group-hover:text-[#ff7a00] transition-colors">{p.os}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{p.sub}</p>
                    </div>
                    <span className="mt-1 px-4 py-1.5 bg-[#ff7a00]/10 hover:bg-[#ff7a00]/20 text-[#ff7a00] text-xs font-semibold rounded-lg border border-[#ff7a00]/20 transition-colors">
                      {p.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <p className="text-xs text-[#94A3B8] font-bold tracking-widest uppercase mb-5 text-center">Mobile</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { os: 'iOS', icon: 'iOS', sub: 'iPhone & iPad · iOS 16+', label: 'App Store',
                     href: 'https://apps.apple.com/app/unimatrix/id6748523981' },
                  { os: 'Android', icon: 'APK', sub: 'Android 10+', label: 'Google Play',
                     href: 'https://play.google.com/store/apps/details?id=com.getstackmax.unimatrix' },
                ].map((p) => (
                  <a key={p.os} href={p.href} target="_blank" rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-3 bg-[#111827] border border-[#334155]/30 hover:border-[#ff7a00]/50 rounded-2xl p-6 text-center transition-all duration-200">
                    <div className="w-14 h-14 rounded-xl bg-[#0e1030] border border-[#334155]/40 flex items-center justify-center">
                      <span className="text-xs font-black text-[#ff7a00] tracking-wider">{p.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#F1F5F9] group-hover:text-[#ff7a00] transition-colors">{p.os}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{p.sub}</p>
                    </div>
                    <span className="mt-1 px-4 py-1.5 bg-[#ff7a00]/10 hover:bg-[#ff7a00]/20 text-[#ff7a00] text-xs font-semibold rounded-lg border border-[#ff7a00]/20 transition-colors">
                      {p.label} →
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-[#111827] border border-[#ff7a00]/20 rounded-2xl p-8 text-center">
              <p className="text-xs text-[#ff7a00] font-bold tracking-widest uppercase mb-3">No download needed</p>
              <h3 className="text-2xl font-bold text-[#F1F5F9] mb-2">Use the Web App</h3>
              <p className="text-[#94A3B8] text-sm mb-6 max-w-md mx-auto">
                Browse memories, manage workspaces, and configure your API keys from any browser — no install required.
              </p>
              <Link href="/auth/login"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#ff7a00] hover:bg-[#e86d00] text-[#0e1030] font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-[#ff7a00]/20">
                Open Web App →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Collaborative AI Room ─────────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-[#334155]/20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff7a00]/10 border border-[#ff7a00]/30 rounded-full text-xs text-[#ff7a00] font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff7a00] animate-pulse" />
                Pro &amp; Enterprise &mdash; 1 week free for new users
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Collaborative AI Room
              </h2>
              <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto mb-4">
                Ask one question. Every AI in the room answers independently &mdash; then they listen to each other.
              </p>
              <p className="text-sm text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
                Claude spots a hallucination in GPT&apos;s answer. Gemini adds context the others missed. Grok pushes back on the consensus.
                The room works as a team &mdash; no auto-routing, no silent delegation. Every model speaks, and the best ideas survive.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
              {[
                {
                  icon: '01',
                  title: 'Ask the Room',
                  desc: 'You post one question or task. Every connected AI model receives it simultaneously — no model is pre-selected as the lead.',
                },
                {
                  icon: '02',
                  title: 'Independent Answers',
                  desc: 'Each LLM responds on its own. Different models catch different things — one may hallucinate where another is precise.',
                },
                {
                  icon: '03',
                  title: 'Collaborative Refinement',
                  desc: "Models can see each other's answers and respond: correct a mistake, add missing context, or suggest a better direction. Teamwork, not just parallelism.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-[#111827] border border-[#ff7a00]/20 rounded-2xl p-6 hover:border-[#ff7a00]/40 transition-all duration-200">
                  <div className="text-2xl font-black text-[#ff7a00]/30 mb-4">{item.icon}</div>
                  <h3 className="text-base font-bold text-[#F1F5F9] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/auth/register"
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#ff7a00] hover:bg-[#e86d00] text-[#0e1030] font-bold rounded-xl text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#ff7a00]/20">
                Try the Collab Room Free for 7 Days
              </Link>
              <p className="text-xs text-[#94A3B8] mt-3">No credit card needed for the trial. Available on Pro and Enterprise plans.</p>
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section id="features" className="py-24 px-6 border-t border-[#334155]/20 bg-[#080D19]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the multi-AI world</h2>
              <p className="text-[#94A3B8] text-lg">You use multiple AIs. Unimatrix makes them feel like one.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: 'XLM', title: 'Cross-Client Memory', desc: 'The same memories are readable and writable from Claude Desktop, Cursor, Windsurf, custom agents, or your own scripts via MCP.' },
                { icon: 'SYN', title: 'Memory Palace Structure', desc: 'Memories live in hierarchical Palaces and Locations (method of loci model), not a flat key-value bag. Better for agents, better for you.' },
                { icon: 'PVT', title: 'Self-Host or Cloud', desc: 'Use our managed cloud or run the full stack yourself with Docker + PostgreSQL + pgvector for complete data sovereignty.' },
                { icon: 'ANY', title: 'Standard MCP Interface', desc: 'Works with any client that speaks the Model Context Protocol. No proprietary SDKs. No per-model glue code.' },
                { icon: 'SLT', title: 'Explicit Control', desc: 'You decide when tools are called. No hidden background syncing, no surprise data exfiltration. You are always in control.' },
                { icon: 'MCP', title: 'Full Tool Schemas', desc: 'unimatrix_list_palaces, unimatrix_store_memory, unimatrix_search_memories. Complete schemas via tools/list.' },
                { icon: 'CTL', title: 'Agent Spend Limits', desc: 'Per-agent daily spend caps, real-time cost tracking, and automatic budget alerts. Never get surprised by runaway agent costs.' },
                { icon: 'HIT', title: 'Human-in-the-Loop', desc: 'Configurable approval gates for sensitive actions. Agents can request permission before executing high-impact tools.' },
                { icon: 'TEL', title: 'Full Audit Trail', desc: 'Detailed token usage logs, cost attribution per agent, and complete audit trail for every approval and configuration change.' },
              ].map((feature) => (
                <div key={feature.title}
                  className="group bg-[#111827] border border-[#334155]/30 rounded-2xl p-6 hover:border-[#ff7a00]/30 transition-all duration-200">
                  <div className="text-xs font-black text-[#ff7a00]/50 tracking-widest mb-4 group-hover:text-[#ff7a00]/80 transition-colors">{feature.icon}</div>
                  <h3 className="text-base font-bold text-[#F1F5F9] mb-2 group-hover:text-[#ff7a00] transition-colors">{feature.title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Enterprise Controls ────────────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-[#334155]/20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-full text-xs text-[#22C55E] font-medium mb-6">
                ENTERPRISE READY
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Production-Grade Agent Controls</h2>
              <p className="text-[#94A3B8] max-w-xl mx-auto">Run dozens of agents safely with real financial guardrails and human oversight.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Spend Limits & Budgets', desc: 'Set daily caps per agent. Get alerts at 80%. Hard blocks when limits are reached. Never get an unexpected invoice.' },
                { title: 'Human-in-the-Loop', desc: 'Fine-grained approval workflows. Sensitive tools can require explicit human sign-off before execution — for every agent.' },
                { title: 'Full Observability', desc: 'Per-agent token usage, cost attribution, anomaly detection, and complete audit logs for compliance and post-mortems.' },
              ].map((item, i) => (
                <div key={i} className="bg-[#111827] border border-[#22C55E]/20 rounded-2xl p-7 hover:border-[#22C55E]/40 transition-all duration-200">
                  <h3 className="font-semibold text-lg mb-3 text-[#F1F5F9]">{item.title}</h3>
                  <p className="text-sm text-[#94A3B8]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Competitive Positioning ───────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-[#334155]/20 bg-[#080D19]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Unimatrix vs. Mem0</h2>
            <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-8 text-sm text-[#94A3B8] leading-relaxed space-y-4">
              <p>
                Unimatrix and Mem0 solve different problems.
              </p>
              <p>
                Mem0 is a lightweight, embeddable memory layer designed primarily for single-agent applications. You typically run it yourself as a key-value store inside your own agent loop.
              </p>
              <p>
                Unimatrix is a managed, multi-tenant <strong className="text-[#F1F5F9]">MCP server</strong> built for developers who use many different AI clients (Claude Desktop, Cursor, Windsurf, Continue, custom agents). It provides a standardized protocol interface, hierarchical Memory Palace organization, semantic search, and first-class cross-client federation — without writing per-tool glue code.
              </p>
              <p className="text-xs text-[#94A3B8] border-t border-[#334155]/30 pt-4 mt-4">
                Choose Mem0 if you want a simple store inside one agent you fully control.<br />
                Choose Unimatrix if you want your context available to every MCP client you already use.
              </p>
            </div>
          </div>
        </section>

        {/* ── Security & Architecture ───────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-[#334155]/20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Security &amp; Architecture</h2>
              <p className="text-[#94A3B8]">Built as infrastructure. Not magic.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-8">
                <h3 className="font-bold mb-4 text-[#ff7a00]">Encryption &amp; Access</h3>
                <ul className="space-y-2.5 text-[#94A3B8]">
                  <li className="flex items-start gap-2"><span className="text-[#ff7a00] mt-0.5 flex-shrink-0">•</span>Memories encrypted at rest with AES-256-GCM (scrypt KDF per user)</li>
                  <li className="flex items-start gap-2"><span className="text-[#ff7a00] mt-0.5 flex-shrink-0">•</span>TLS 1.3 in transit — everywhere</li>
                  <li className="flex items-start gap-2"><span className="text-[#ff7a00] mt-0.5 flex-shrink-0">•</span>Clerk JWT authentication + PostgreSQL Row Level Security</li>
                  <li className="flex items-start gap-2"><span className="text-[#ff7a00] mt-0.5 flex-shrink-0">•</span>Raw API keys are never stored — only bcrypt-hashed prefixes</li>
                </ul>
              </div>
              <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-8">
                <h3 className="font-bold mb-4 text-[#ff7a00]">Data Control &amp; Transparency</h3>
                <ul className="space-y-2.5 text-[#94A3B8]">
                  <li className="flex items-start gap-2"><span className="text-[#ff7a00] mt-0.5 flex-shrink-0">•</span>Full delete and export via API at any time</li>
                  <li className="flex items-start gap-2"><span className="text-[#ff7a00] mt-0.5 flex-shrink-0">•</span>Your data is never used for training</li>
                  <li className="flex items-start gap-2"><span className="text-[#ff7a00] mt-0.5 flex-shrink-0">•</span>All MCP tool calls are auditable per account</li>
                  <li className="flex items-start gap-2"><span className="text-[#ff7a00] mt-0.5 flex-shrink-0">•</span>Self-host the full stack: Docker + Postgres + pgvector</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm">
              <a href="https://github.com/tjpoisal/UNIMATRIX/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer"
                className="text-[#ff7a00] hover:text-[#e86d00] underline underline-offset-2 transition-colors">
                SECURITY.md
              </a>
              <span className="text-[#334155]">·</span>
              <a href="https://github.com/tjpoisal/UNIMATRIX" target="_blank" rel="noopener noreferrer"
                className="text-[#ff7a00] hover:text-[#e86d00] underline underline-offset-2 transition-colors">
                GitHub Repository
              </a>
              <span className="text-[#334155]">·</span>
              <Link href="/docs/mcp" className="text-[#ff7a00] hover:text-[#e86d00] underline underline-offset-2 transition-colors">
                MCP Reference Docs
              </Link>
              <span className="text-[#334155]">·</span>
              <Link href="/onboarding" className="text-[#ff7a00] hover:text-[#e86d00] underline underline-offset-2 transition-colors">
                Self-Host Guide
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────────────── */}
        <section id="pricing" className="py-24 px-6 border-t border-[#334155]/20 bg-[#080D19]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
              <p className="text-[#94A3B8] text-lg">Start free. Scale when you need it. Cancel anytime.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Free */}
              <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">Free</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#F1F5F9]">$0</span>
                    <span className="text-[#94A3B8] text-sm">/ forever</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">No credit card required</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    '3 memory workspaces',
                    '200 memories',
                    '2 devices',
                    'Full-text & semantic search',
                    'All LLMs via MCP + REST',
                    'End-to-end encrypted',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                      <span className="text-[#ff7a00] text-xs flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register"
                  className="block w-full py-3 text-center font-semibold rounded-xl text-sm border border-[#334155]/60 hover:border-[#ff7a00]/40 text-[#94A3B8] hover:text-[#F1F5F9] transition-all duration-200">
                  Start Free
                </Link>
              </div>

              {/* Pro — highlighted */}
              <div className="relative bg-[#111827] border-2 border-[#ff7a00]/60 rounded-2xl p-8 shadow-xl shadow-[#ff7a00]/10 flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-[#ff7a00] text-[#0e1030] text-xs font-black rounded-full tracking-wider">MOST POPULAR</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#F1F5F9]">$9</span>
                    <span className="text-[#94A3B8] text-sm">/ month</span>
                  </div>
                  <p className="text-xs text-[#ff7a00] mt-1">or $79 / year — save $29</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Unlimited workspaces',
                    'Unlimited memories',
                    'Unlimited devices',
                    '20 API keys',
                    'Collaborative AI Room',
                    'Agent Spend Controls & HITL',
                    'Full Audit Logs & Telemetry',
                    'Priority support',
                    '14-day free trial',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#F1F5F9]">
                      <span className="text-[#ff7a00] text-xs flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/checkout?plan=pro&interval=monthly"
                  className="block w-full py-3 text-center font-bold rounded-xl text-sm bg-[#ff7a00] hover:bg-[#e86d00] text-[#0e1030] transition-all duration-200 shadow-lg shadow-[#ff7a00]/20">
                  Get Pro — Start Free Trial
                </Link>
              </div>

              {/* Enterprise */}
              <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#F1F5F9] mb-1">Enterprise</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#F1F5F9]">$29</span>
                    <span className="text-[#94A3B8] text-sm">/ month</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">or $299 / year — save $49</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Everything in Pro',
                    'Self-hosted Docker stack',
                    'Team memory sharing',
                    'Agentic device control',
                    '100 API keys',
                    'SSO / SAML',
                    'SLA + dedicated support',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                      <span className="text-[#ff7a00] text-xs flex-shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/checkout?plan=enterprise&interval=monthly"
                  className="block w-full py-3 text-center font-semibold rounded-xl text-sm border border-[#334155]/60 hover:border-[#ff7a00]/40 text-[#94A3B8] hover:text-[#F1F5F9] transition-all duration-200">
                  Get Enterprise
                </Link>
              </div>
            </div>

            <p className="text-center text-xs text-[#94A3B8] mt-8">
              All paid plans include a 14-day free trial. Cancel anytime. Payments secured by Stripe.
            </p>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section id="faq" aria-labelledby="faq-heading" className="py-24 px-6 border-t border-[#334155]/20">
          <div className="max-w-2xl mx-auto">
            <h2 id="faq-heading" className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <dl className="space-y-6">
              {[
                {
                  q: 'How is Unimatrix different from ChatGPT memory?',
                  a: "ChatGPT memory is siloed inside ChatGPT. Unimatrix is a protocol layer — your memories are available to Claude, Cursor, Windsurf, and any other MCP-compatible tool simultaneously. You own the data and control exactly when it's accessed.",
                },
                {
                  q: 'Does it work automatically or do I have to configure it?',
                  a: 'Intentionally explicit. You add a system prompt to each AI tool instructing it to load your memory at the start of sessions. No hidden background syncing — you always know exactly what context each AI has. This is how MCP memory actually works.',
                },
                {
                  q: "What counts as a 'memory'?",
                  a: 'Any piece of text you store — a note, a fact, a code snippet, a meeting summary, a project decision. Each individual entry is one memory. They live inside named Palaces (workspaces), organized into Locations.',
                },
                {
                  q: 'Is my data encrypted?',
                  a: 'Yes. Data is encrypted at rest with AES-256-GCM. TLS 1.3 in transit. API keys are bcrypt-hashed — we never see the raw value. Payments are processed by Stripe — we never touch your card details.',
                },
                {
                  q: 'Can I self-host the entire thing?',
                  a: 'Yes — the full stack (server, web app, worker) runs on Docker + PostgreSQL + pgvector. Enterprise plan includes the self-host guide and dedicated setup support.',
                },
                {
                  q: 'Are the desktop and mobile apps available now?',
                  a: 'Desktop apps for macOS, Windows, and Linux are available for download from GitHub Releases. iOS is on the App Store (id6748523981) and Android is on Google Play. The web app works from any browser with no install needed.',
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes — cancel from Settings at any time. You keep full Pro access until the end of your billing period. No questions asked.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-[#334155]/30 pb-6">
                  <dt className="font-semibold text-[#F1F5F9] mb-2">{q}</dt>
                  <dd className="text-sm text-[#94A3B8] leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Email Capture ──────────────────────────────────────────────── */}
        <section className="py-20 px-6 border-t border-[#334155]/20 bg-[#080D19]">
          <div className="max-w-xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff7a00]/10 border border-[#ff7a00]/30 rounded-full text-xs text-[#ff7a00] font-semibold mb-6">
              Stay in the loop
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Not ready to sign up yet?</h2>
            <p className="text-[#94A3B8] mb-8 text-sm leading-relaxed">
              Get notified when we ship new MCP integrations, desktop app updates, and enterprise features.
              No spam. Unsubscribe anytime.
            </p>
            <form
              action="https://formspree.io/f/unimatrix-waitlist"
              method="POST"
              className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
            >
              <label htmlFor="email-input" className="sr-only">Email address</label>
              <input
                id="email-input"
                type="email"
                name="email"
                required
                autoComplete="email"
                aria-label="Email address"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-[#111827] border border-[#334155]/60 rounded-xl text-sm text-[#F1F5F9] placeholder-[#94A3B8] transition-colors focus:outline-none focus:border-[#ff7a00]/50 focus-visible:ring-2 focus-visible:ring-[#ff7a00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1030]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#ff7a00] hover:bg-[#e86d00] text-[#0e1030] font-bold rounded-xl text-sm transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1030]"
              >
                Notify Me
              </button>
            </form>
            <div aria-live="polite" aria-atomic="true" className="sr-only" />
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────── */}
        <section className="py-24 px-6 border-t border-[#334155]/20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <Image src="/logo.png" alt="" width={60} height={66}
                className="opacity-60 drop-shadow-[0_0_20px_rgba(255,122,0,0.3)]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop re-explaining yourself to every AI.</h2>
            <p className="text-[#94A3B8] mb-10 text-lg leading-relaxed">
              Your context belongs to you — not to a single chat window on a single device.
              Unimatrix makes every AI smarter by giving it your full history, everywhere.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register"
                className="w-full sm:w-auto inline-block px-10 py-4 bg-[#ff7a00] hover:bg-[#e86d00] text-[#0e1030] font-bold rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#ff7a00]/20 hover:scale-[1.02]">
                Get Started Free
              </Link>
              <Link href="/pricing"
                className="w-full sm:w-auto inline-block px-10 py-4 border border-[#334155]/60 hover:border-[#ff7a00]/40 text-[#94A3B8] hover:text-[#F1F5F9] font-semibold rounded-xl text-base transition-all duration-200">
                View All Plans
              </Link>
            </div>
            <p className="text-xs text-[#94A3B8] mt-6">Free tier · No credit card · Cancel anytime</p>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-[#334155]/30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="" width={30} height={33} className="opacity-60" />
            <div>
              <span className="font-black text-base tracking-tight">
                <span className="text-[#ff7a00]">UNI</span>
                <span className="text-[#64748B]">MATRIX</span>
              </span>
              <p className="text-xs text-[#94A3B8] mt-0.5">deployunimatrix.com &middot; hello@deployunimatrix.com</p>
            </div>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-5 text-sm text-[#94A3B8]">
            <a href="#how-it-works" className="hover:text-[#F1F5F9] transition-colors">How It Works</a>
            <a href="#setup" className="hover:text-[#F1F5F9] transition-colors">Setup</a>
            <a href="#platforms" className="hover:text-[#F1F5F9] transition-colors">Downloads</a>
            <Link href="/docs/mcp" className="hover:text-[#F1F5F9] transition-colors">MCP Reference</Link>
            <a href="#features" className="hover:text-[#F1F5F9] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#F1F5F9] transition-colors">Pricing</a>
            <a href="https://github.com/tjpoisal/UNIMATRIX" target="_blank" rel="noopener noreferrer" className="hover:text-[#F1F5F9] transition-colors">GitHub</a>
            <Link href="/auth/login" className="hover:text-[#F1F5F9] transition-colors">Sign In</Link>
            <Link href="/auth/register" className="hover:text-[#F1F5F9] transition-colors">Register</Link>
          </nav>
          <p className="text-xs text-[#334155]">&copy; 2026 Unimatrix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
