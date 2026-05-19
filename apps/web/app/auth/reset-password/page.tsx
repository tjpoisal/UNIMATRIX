'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-[#111827]/80 border border-[#334155]/30 rounded-2xl p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <Image src="/logo.svg" alt="Unimatrix" width={100} height={120} priority />
            <h1 className="text-[#F1F5F9] text-xl font-semibold">Choose a new password</h1>
            {email && (
              <p className="text-[#94A3B8] text-sm text-center">for <span className="text-[#F1F5F9]">{email}</span></p>
            )}
          </div>

          {success ? (
            <div className="bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-lg p-4 text-center space-y-2">
              <p className="text-[#00F5FF] font-medium">Password updated!</p>
              <p className="text-[#94A3B8] text-sm">Redirecting you to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3">
                  <p className="text-sm text-[#EF4444]">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0A0F1C] border border-[#334155] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/50 transition-all"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  disabled={!token || !email}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F1F5F9] mb-2">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0A0F1C] border border-[#334155] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/50 transition-all"
                  placeholder="••••••••"
                  required
                  disabled={!token || !email}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !token || !email}
                className="w-full py-2 px-4 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#00F5FF]/20 transform hover:scale-105"
              >
                {loading ? 'Updating…' : 'Set new password'}
              </button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-[#334155]/30">
            <Link href="/auth/login" className="text-[#00F5FF] hover:text-[#00D9FF] text-sm font-medium transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-[#94A3B8]">Loading…</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
