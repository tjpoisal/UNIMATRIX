'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import OAuthButtons from './OAuthButtons';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) { setError('Invalid email or password'); return; }
      router.push('/dashboard');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-[#111827]/80 border border-[#334155]/30 rounded-2xl p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={100} height={110} priority />
            <p className="text-[#94A3B8] text-sm text-center">One memory. Every AI. Any device.</p>
          </div>

          {/* OAuth Buttons */}
          <OAuthButtons />

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3">
                <p className="text-sm text-[#EF4444]">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-bg border border-[#334155] rounded-lg text-text placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[accent]/50 transition-all"
                placeholder="you@example.com" required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text">Password</label>
                <a href="/auth/forgot-password" className="text-xs text-accent hover:text-[#00D9FF] transition-colors">Forgot password?</a>
              </div>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-bg border border-[#334155] rounded-lg text-text placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[accent]/50 transition-all"
                placeholder="••••••••" required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-2 px-4 bg-[accent] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[accent]/20 transform hover:scale-105"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#334155]/30">
            <p className="text-[#94A3B8]">
              Don&apos;t have an account?{' '}
              <a href="/auth/register" className="text-accent hover:text-[#00D9FF] font-medium transition-colors">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
