'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';

export default function NewPalacePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/palaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create palace');
        return;
      }

      router.push(`/palaces/${data.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-[#64748B] hover:text-[#94A3B8] text-sm flex items-center gap-2 mb-4 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-[#F1F5F9]">New Memory Palace</h1>
          <p className="text-[#94A3B8] mt-2">
            A memory workspace is where your AI stores context from your conversations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Palace Name <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ancient Library, Mountain Retreat…"
                required
                className="w-full px-4 py-3 bg-[#0A0F1C]/60 border border-[#334155]/50 rounded-lg text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#00F5FF]/50 focus:ring-1 focus:ring-[#00F5FF]/20 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                Description <span className="text-[#475569] font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will you store here?"
                rows={3}
                className="w-full px-4 py-3 bg-[#0A0F1C]/60 border border-[#334155]/50 rounded-lg text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#00F5FF]/50 focus:ring-1 focus:ring-[#00F5FF]/20 transition-colors resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg px-4 py-3">
                <p className="text-[#EF4444] text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-3 px-6 bg-[#00F5FF] hover:bg-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/20"
            >
              {loading ? 'Creating…' : 'Create Palace'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="py-3 px-6 bg-[#1F2937] hover:bg-[#2D3748] text-[#94A3B8] font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
