'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import OAuthButtons from './OAuthButtons';

type Step = 'credentials' | 'mfa';

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');

  // credentials step
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // MFA step
  const [mfaToken, setMfaToken] = useState('');

  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // ── Step 1: email + password ────────────────────────────────────────────────
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error === 'MFA_REQUIRED') {
        // Server signals that MFA is needed — advance to MFA step
        setStep('mfa');
        return;
      }

      if (result?.error) {
        setError('Invalid email or password');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: MFA token ────────────────────────────────────────────────────────
  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        mfaToken,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid or expired code. Check your authenticator or use a recovery code.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared helpers ───────────────────────────────────────────────────────────
  const inputClass =
    'w-full px-4 py-2 bg-bg border border-[#334155] rounded-lg text-text placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[accent]/50 transition-all';

  const btnClass =
    'w-full py-2 px-4 bg-[accent] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[accent]/20 transform hover:scale-105';

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-[#111827]/80 border border-[#334155]/30 rounded-2xl p-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={100} height={110} priority />
            <p className="text-[#94A3B8] text-sm text-center">One memory. Every AI. Any device.</p>
          </div>

          {/* ── Credentials step ─────────────────────────────────────────── */}
          {step === 'credentials' && (
            <>
              <OAuthButtons />

              <form onSubmit={handleCredentials} className="space-y-4">
                {error && (
                  <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3">
                    <p className="text-sm text-[#EF4444]">{error}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputClass} placeholder="you@example.com" required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-text">Password</label>
                    <a href="/auth/forgot-password" className="text-xs text-accent hover:text-[#00D9FF] transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputClass} placeholder="••••••••" required
                  />
                </div>
                <button type="submit" disabled={loading} className={btnClass}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            </>
          )}

          {/* ── MFA step ─────────────────────────────────────────────────── */}
          {step === 'mfa' && (
            <form onSubmit={handleMFA} className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[accent]/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-text">Two-factor authentication</h2>
                <p className="text-sm text-[#94A3B8] mt-1">
                  Enter the 6-digit code from your authenticator app,<br /> or paste a recovery code.
                </p>
              </div>

              {error && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3">
                  <p className="text-sm text-[#EF4444]">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text mb-2">Code</label>
                <input
                  type="text"
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.trim())}
                  className={`${inputClass} text-center tracking-[0.4em] text-lg font-mono`}
                  placeholder="000000"
                  maxLength={11} // 6-digit TOTP or xxxxx-xxxxx recovery
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? 'Verifying…' : 'Verify'}
              </button>

              <div className="text-center space-y-2">
                <a
                  href="/auth/mfa/recover"
                  className="block text-xs text-[#64748B] hover:text-accent transition-colors"
                >
                  Lost access to your authenticator? Use trusted-person recovery →
                </a>
                <button
                  type="button"
                  onClick={() => { setStep('credentials'); setError(''); setMfaToken(''); }}
                  className="text-xs text-[#64748B] hover:text-accent transition-colors"
                >
                  ← Back to sign in
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-4 border-t border-[#334155]/30">
            <p className="text-[#94A3B8]">
              Don&apos;t have an account?{' '}
              <a href="/auth/register" className="text-accent hover:text-[#00D9FF] font-medium transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
