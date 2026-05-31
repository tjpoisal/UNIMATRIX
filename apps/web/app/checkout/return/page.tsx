'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function ReturnContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Initialise to 'error' immediately if there's no session_id — avoids calling
  // setState synchronously inside a useEffect (React Compiler lint rule).
  const [status, setStatus] = useState<'loading' | 'complete' | 'open' | 'error'>(
    sessionId ? 'loading' : 'error'
  );
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/stripe/checkout-status?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.status === 'complete' ? 'complete' : data.status === 'open' ? 'open' : 'error');
        if (data.customer_email) setEmail(data.customer_email);
      })
      .catch(() => setStatus('error'));
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo-icon.png"
          alt="Unimatrix"
          width={56}
          height={56}
          className="animate-pulse drop-shadow-[0_0_20px_rgba(0,245,255,0.6)]"
        />
        <p className="text-[#64748B] text-sm">Verifying your payment…</p>
      </div>
    );
  }

  if (status === 'open') {
    return (
      <div className="text-center max-w-md">
        <p className="text-[#F1F5F9] text-lg font-semibold mb-3">Payment incomplete</p>
        <p className="text-[#64748B] text-sm mb-6">
          Your checkout session is still open. Please complete your payment.
        </p>
        <Link
          href="/pricing"
          className="inline-block px-6 py-3 bg-[#00F5FF] text-[#0A0F1C] font-bold rounded-xl hover:bg-[#00D9FF] transition-colors"
        >
          Return to pricing
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center mx-auto mb-6 text-2xl">
          ✕
        </div>
        <p className="text-[#F1F5F9] text-lg font-semibold mb-3">Something went wrong</p>
        <p className="text-[#64748B] text-sm mb-6">
          We couldn&apos;t verify your payment. If you were charged, please contact support.
        </p>
        <Link
          href="/pricing"
          className="inline-block px-6 py-3 border border-[#334155]/50 text-[#94A3B8] rounded-xl hover:border-[#334155] hover:text-[#F1F5F9] transition-all text-sm font-medium"
        >
          Back to pricing
        </Link>
      </div>
    );
  }

  // complete
  return (
    <div className="text-center max-w-md">
      {/* Animated success ring around logo */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <div className="absolute w-28 h-28 rounded-full border-2 border-[#00F5FF]/30 animate-ping" />
        <div className="absolute w-24 h-24 rounded-full border border-[#00F5FF]/20" />
        <div className="w-20 h-20 rounded-2xl bg-[#0A0F1C] border border-[#00F5FF]/30 flex items-center justify-center shadow-lg shadow-[#00F5FF]/20">
          <Image
            src="/logo-icon.png"
            alt="Unimatrix"
            width={44}
            height={44}
            className="drop-shadow-[0_0_16px_rgba(0,245,255,0.7)]"
          />
        </div>
      </div>

      <h1 className="text-3xl font-black mb-3 text-[#F1F5F9]">
        Welcome to{' '}
        <span className="text-[#00F5FF]">Pro</span>
      </h1>

      {email && (
        <p className="text-sm text-[#64748B] mb-1">
          Confirmation sent to <span className="text-[#94A3B8]">{email}</span>
        </p>
      )}

      <p className="text-[#94A3B8] mb-10 leading-relaxed">
        Your subscription is active. Unlimited palaces, unlimited memories,
        and all 20 API key slots are now unlocked.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard"
          className="px-7 py-3 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-bold rounded-xl transition-colors shadow-lg shadow-[#00F5FF]/20 text-sm"
        >
          Go to dashboard →
        </Link>
        <Link
          href="/settings"
          className="px-7 py-3 bg-[#1F2937] hover:bg-[#2D3748] text-[#F1F5F9] rounded-xl transition-colors text-sm font-medium"
        >
          Manage subscription
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#334155]/20 px-6 py-4 flex items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-icon.png" alt="Unimatrix" width={32} height={32} className="drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]" />
          <span className="font-black text-lg tracking-tight">
            <span className="text-[#00F5FF]">UNI</span>
            <span className="text-[#8892A4]">MATRIX</span>
          </span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4">
            <Image src="/logo-icon.png" alt="" width={48} height={48} className="animate-pulse drop-shadow-[0_0_16px_rgba(0,245,255,0.5)]" />
            <p className="text-[#64748B] text-sm">Loading…</p>
          </div>
        }>
          <ReturnContent />
        </Suspense>
      </div>
    </div>
  );
}
