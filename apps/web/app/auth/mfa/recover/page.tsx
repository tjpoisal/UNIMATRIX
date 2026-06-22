'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * /auth/mfa/recover
 *
 * Two modes:
 *  1. No ?token — shows "request trusted-person recovery" form (user must be logged in).
 *  2. ?token=xxx — trusted person clicked the link, applies the recovery and
 *     redirects the original user to re-enroll in MFA.
 */

function RecoverPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token');

  const [status, setStatus]   = useState<'idle' | 'loading' | 'sent' | 'applied' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Auto-apply when token is present (trusted person clicked the link)
  useEffect(() => {
    if (!token) return;
    // Defer setStatus to avoid synchronous setState inside effect (prevents cascading renders)
    const t = setTimeout(() => setStatus('loading'), 0);
    fetch('/api/auth/mfa/recover', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'apply', token }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStatus('applied');
          // Redirect to login so the user can sign in without MFA and then re-enroll
          setTimeout(() => router.push('/auth/login?mfaReset=1'), 3000);
        } else {
          setStatus('error');
          setMessage(d.error ?? 'Recovery failed. The link may have expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      })
      .finally(() => clearTimeout(t));
  }, [token, router]);

  const handleRequest = async () => {
    setStatus('loading');
    const res  = await fetch('/api/auth/mfa/recover', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'request' }),
    });
    const data = await res.json();
    if (data.success) {
      setStatus('sent');
    } else {
      setStatus('error');
      setMessage(data.error ?? 'Failed to send recovery email.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-[#111827]/80 border border-[#334155]/30 rounded-2xl p-8 space-y-6">

          <div className="flex flex-col items-center gap-2">
            <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={72} height={80} priority />
            <h1 className="text-lg font-semibold text-text mt-1">Account recovery</h1>
          </div>

          {/* Request mode — no token in URL */}
          {!token && status === 'idle' && (
            <div className="space-y-4">
              <p className="text-sm text-[#94A3B8]">
                If you&apos;ve lost access to your authenticator and all recovery codes,
                your trusted person can approve an MFA reset.
              </p>
              <button
                onClick={handleRequest}
                className="w-full py-2 px-4 bg-[accent] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all"
              >
                Send recovery request to trusted person
              </button>
              <a
                href="/auth/login"
                className="block text-center text-xs text-[#64748B] hover:text-accent transition-colors"
              >
                ← Back to sign in
              </a>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex justify-center py-8">
              <svg className="w-8 h-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          )}

          {status === 'sent' && (
            <div className="text-center space-y-2 py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text font-medium">Recovery email sent</p>
              <p className="text-sm text-[#94A3B8]">
                We&apos;ve emailed your trusted person. Once they approve the request, your MFA
                will be reset and you can sign in normally to re-enroll.
              </p>
            </div>
          )}

          {status === 'applied' && (
            <div className="text-center space-y-2 py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text font-medium">MFA has been reset</p>
              <p className="text-sm text-[#94A3B8]">
                The account&apos;s two-factor authentication has been disabled. Redirecting them to sign in…
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3">
                <p className="text-sm text-[#EF4444]">{message}</p>
              </div>
              <a
                href="/auth/login"
                className="block text-center text-xs text-[#64748B] hover:text-accent transition-colors"
              >
                ← Back to sign in
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecoverPage() {
  return (
    <Suspense>
      <RecoverPageContent />
    </Suspense>
  );
}
