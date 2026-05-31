'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

const FEATURES_FREE = [
  '3 memory workspaces',
  '200 memories',
  'Full-text search',
  '1 API key for AI connections',
  'Google & GitHub login',
];

const FEATURES_PRO = [
  'Unlimited memory workspaces',
  'Unlimited memories',
  'Friends & palace sharing',
  '20 API keys',
  'Connect all AIs via MCP',
  'Priority support',
  'Early access to new features',
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly');

  const price = interval === 'monthly' ? '$9' : '$79';
  const perLabel = interval === 'monthly' ? '/month' : '/year';
  const savings = interval === 'yearly' ? 'Save $29 vs monthly' : '';

  const handleUpgrade = () => {
    if (!session) {
      window.location.href = `/auth/login?callbackUrl=/checkout?interval=${interval}`;
      return;
    }
    window.location.href = `/checkout?interval=${interval}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#F1F5F9]">
      {/* Nav */}
      <nav className="border-b border-[#334155]/30 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-icon.png" alt="Unimatrix" width={32} height={32} />
          <span className="font-black text-lg tracking-tight">
            <span className="text-[#00F5FF]">UNI</span>
            <span className="text-[#8892A4]">MATRIX</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-[#94A3B8] hover:text-[#F1F5F9]">
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm bg-[#00F5FF] text-[#0A0F1C] font-semibold rounded-lg hover:bg-[#00D9FF] transition-colors"
              >
                Get started free
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black mb-4">
            Simple,{' '}
            <span className="text-[#00F5FF]">transparent</span> pricing
          </h1>
          <p className="text-xl text-[#94A3B8] max-w-xl mx-auto">
            Start free. Upgrade when you need more palaces, more power, and
            the ability to share with friends.
          </p>

          {/* Interval toggle */}
          <div className="inline-flex items-center gap-1 mt-8 p-1 bg-[#111827] border border-[#334155]/40 rounded-xl">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                interval === 'monthly'
                  ? 'bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[#00F5FF]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('yearly')}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                interval === 'yearly'
                  ? 'bg-[#00F5FF]/10 border border-[#00F5FF]/30 text-[#00F5FF]'
                  : 'text-[#64748B] hover:text-[#94A3B8]'
              }`}
            >
              Yearly
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#A855F7]/20 text-[#A855F7] rounded-md">
                Save 27%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free */}
          <div className="bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-sm font-medium text-[#64748B] uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-[#F1F5F9]">$0</span>
                <span className="text-[#64748B] mb-1">/forever</span>
              </div>
              <p className="text-sm text-[#64748B] mt-1">No credit card required</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[#94A3B8]">
                  <span className="text-[#22C55E] mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={session ? '/dashboard' : '/auth/register'}
              className="block text-center py-3 border border-[#334155]/50 text-[#94A3B8] hover:border-[#334155] hover:text-[#F1F5F9] rounded-xl text-sm font-medium transition-all"
            >
              {session ? 'Current plan' : 'Get started free'}
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-[#111827]/60 border border-[#00F5FF]/30 rounded-2xl p-8 flex flex-col overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00F5FF]/5 to-transparent pointer-events-none" />

            <div className="relative mb-6">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-[#00F5FF] uppercase tracking-widest">Pro</p>
                <span className="px-2 py-0.5 text-xs bg-[#00F5FF]/10 border border-[#00F5FF]/20 text-[#00F5FF] rounded-full">
                  Most popular
                </span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-[#F1F5F9]">{price}</span>
                <span className="text-[#64748B] mb-1">{perLabel}</span>
              </div>
              {savings && (
                <p className="text-xs text-[#A855F7] mt-1">{savings}</p>
              )}
            </div>

            <ul className="relative space-y-3 mb-8 flex-1">
              {FEATURES_PRO.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[#F1F5F9]">
                  <span className="text-[#00F5FF] mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              className="relative py-3 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-bold rounded-xl text-sm transition-all shadow-lg shadow-[#00F5FF]/20"
            >
              {session ? 'Upgrade to Pro →' : 'Start Pro — free 7-day trial →'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes — cancel from Settings at any time. You keep Pro access until the end of your billing period.',
              },
              {
                q: 'What counts as a "memory"?',
                a: 'Any piece of text you store — a note, a fact, a code snippet, a meeting summary. Each individual entry is one memory.',
              },
              {
                q: 'What AIs can connect via MCP?',
                a: 'Claude Desktop, Claude Code, Ollama (via Open WebUI), and any AI with REST API support. ChatGPT and Gemini connect via the OpenAPI spec.',
              },
              {
                q: 'Is my data secure?',
                a: 'All data is stored in a private Neon PostgreSQL database. API keys are bcrypt-hashed. Payments are processed entirely by Stripe — we never touch your card details.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-[#334155]/30 pb-6">
                <p className="font-semibold text-[#F1F5F9] mb-2">{q}</p>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
