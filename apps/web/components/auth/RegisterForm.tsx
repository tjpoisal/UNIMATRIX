'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import OAuthButtons from './OAuthButtons';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Registration failed'); return; }
      router.push('/auth/login?registered=true');
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
              <label className="block text-sm font-medium text-text mb-2">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg border border-[#334155] rounded-lg text-text placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[accent]/50 transition-all"
                placeholder="Your name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg border border-[#334155] rounded-lg text-text placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[accent]/50 transition-all"
                placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg border border-[#334155] rounded-lg text-text placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[accent]/50 transition-all"
                placeholder="••••••••" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                className="w-full px-4 py-2 bg-bg border border-[#334155] rounded-lg text-text placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[accent]/50 transition-all"
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2 px-4 bg-[accent] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[accent]/20 transform hover:scale-105">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#334155]/30">
            <p className="text-[#94A3B8]">
              Already have an account?{' '}
              <a href="/auth/login" className="text-accent hover:text-[#00D9FF] font-medium transition-colors">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
