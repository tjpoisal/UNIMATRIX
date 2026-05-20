'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamically import the Stripe component (client-only, no SSR)
const EmbeddedCheckoutForm = dynamic(
  () => import('@/components/stripe/EmbeddedCheckoutForm'),
  { ssr: false, loading: () => <CheckoutSkeleton /> }
);

const PRO_FEATURES = [
  'Unlimited memory workspaces',
  'Unlimited memories',
  'Friends & palace sharing',
  '20 API keys for all your AIs',
  'MCP server for Claude, Ollama & more',
  'Priority support',
  'Early access to new features',
];

function CheckoutSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-[#1F2937]/60" />
      ))}
      <div className="h-14 rounded-xl bg-[#1F2937]/60 mt-4" />
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const interval = (searchParams.get('interval') ?? 'monthly') as 'monthly' | 'yearly';

  const price = interval === 'yearly' ? '$79' : '$9';
  const period = interval === 'yearly' ? '/year' : '/month';
  const subtext = interval === 'yearly' ? 'Billed annually — save $29 vs monthly' : 'Cancel anytime';

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col">

      {/* ── Top nav bar ──────────────────────────────────────────────── */}
      <nav className="border-b border-[#334155]/20 px-6 py-4 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          {/* Logo icon with glow on hover */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#00F5FF]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Image
              src="/logo-icon.svg"
              alt="Unimatrix"
              width={34}
              height={34}
              className="relative drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]"
            />
          </div>
          <span className="font-black text-xl tracking-tight">
            <span className="text-[#00F5FF]">UNI</span>
            <span className="text-[#8892A4]">MATRIX</span>
          </span>
        </Link>

        <Link
          href="/pricing"
          className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors flex items-center gap-1"
        >
          ← Back to pricing
        </Link>
      </nav>

      {/* ── Main checkout grid ───────────────────────────────────────── */}
      <div className="flex-1 grid lg:grid-cols-[480px_1fr] xl:grid-cols-[520px_1fr]">

        {/* Left panel — order summary */}
        <div className="relative flex flex-col border-r border-[#334155]/20 px-10 py-12 overflow-hidden">
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#00F5FF 1px, transparent 1px), linear-gradient(90deg, #00F5FF 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Radial glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#00F5FF]/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col h-full">

            {/* Big logo mark */}
            <div className="flex items-center gap-4 mb-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-[#00F5FF]/20 blur-xl" />
                <div className="relative w-16 h-16 rounded-2xl bg-[#0A0F1C] border border-[#00F5FF]/30 flex items-center justify-center shadow-lg shadow-[#00F5FF]/10">
                  <Image
                    src="/logo-icon.svg"
                    alt="Unimatrix"
                    width={36}
                    height={36}
                    className="drop-shadow-[0_0_12px_rgba(0,245,255,0.6)]"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-widest mb-0.5">Upgrading to</p>
                <p className="text-2xl font-black tracking-tight">
                  <span className="text-[#00F5FF]">UNI</span>
                  <span className="text-[#8892A4]">MATRIX</span>
                  <span className="ml-2 text-[#00F5FF]">Pro</span>
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-[#334155]/30">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black text-[#F1F5F9]">{price}</span>
                <span className="text-[#64748B] mb-1.5 text-lg">{period}</span>
              </div>
              <p className="text-sm text-[#64748B]">{subtext}</p>

              {/* Toggle hint */}
              {interval === 'monthly' && (
                <Link
                  href="/checkout?interval=yearly"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs text-[#A855F7] hover:text-[#C084FC] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
                  Switch to yearly and save $29
                </Link>
              )}
            </div>

            {/* Feature list */}
            <div className="mb-8 flex-1">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-widest mb-4">
                Everything in Pro
              </p>
              <ul className="space-y-3">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[#00F5FF]/10 border border-[#00F5FF]/30 flex items-center justify-center text-[10px] text-[#00F5FF]">
                      ✓
                    </span>
                    <span className="text-sm text-[#94A3B8]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust badges */}
            <div className="mt-auto pt-6 border-t border-[#334155]/30">
              <div className="flex flex-wrap gap-4 text-xs text-[#475569]">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#22C55E]" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM6.5 10.5l-2-2 1-1 1 1 3-3 1 1-4 4z"/>
                  </svg>
                  SSL encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#22C55E]" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM6.5 10.5l-2-2 1-1 1 1 3-3 1 1-4 4z"/>
                  </svg>
                  Cancel anytime
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#22C55E]" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM6.5 10.5l-2-2 1-1 1 1 3-3 1 1-4 4z"/>
                  </svg>
                  Powered by Stripe
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — Stripe Elements form */}
        <div className="flex items-start justify-center px-6 py-12 bg-[#060B14]">
          <div className="w-full max-w-lg">
            <EmbeddedCheckoutForm interval={interval} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Image src="/logo-icon.svg" alt="Unimatrix" width={48} height={48} className="animate-pulse drop-shadow-[0_0_16px_rgba(0,245,255,0.5)]" />
          <p className="text-sm text-[#64748B]">Loading checkout…</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
