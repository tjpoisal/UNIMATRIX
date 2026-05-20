'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';

interface Palace {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  locations: { id: string; name: string; _count: { memories: number } }[];
}

export default function PalacesPage() {
  const [palaces, setPalaces] = useState<Palace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPalaces = useCallback(async () => {
    try {
      const res = await fetch('/api/palaces');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch palaces');
        return;
      }
      setPalaces(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPalaces(); }, [loadPalaces]);

  const totalMemories = palaces.reduce(
    (sum, p) => sum + p.locations.reduce((s, l) => s + l._count.memories, 0),
    0
  );

  return (
    <AppShell>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#F1F5F9]">AI Memory Workspaces</h1>
            {!loading && (
              <p className="text-[#94A3B8] mt-1">
                {palaces.length} workspace{palaces.length !== 1 ? 's' : ''} · {totalMemories} memor{totalMemories !== 1 ? 'ies' : 'y'}
              </p>
            )}
          </div>
          <Link
            href="/palaces/new"
            className="px-5 py-2.5 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/20 flex items-center gap-2"
          >
            <span>+</span> New Workspace
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#94A3B8]">Loading palaces…</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4">
            <p className="text-[#EF4444]">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && palaces.length === 0 && (
          <div className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#1F2937] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏛️</span>
            </div>
            <h2 className="text-xl font-semibold text-[#F1F5F9] mb-2">No workspaces yet</h2>
            <p className="text-[#94A3B8] mb-6">Connect an AI via MCP and it will start storing context here automatically.</p>
            <Link
              href="/palaces/new"
              className="inline-block px-6 py-3 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/20"
            >
              Create Your First Workspace
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && palaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {palaces.map((palace) => {
              const memoryCount = palace.locations.reduce((s, l) => s + l._count.memories, 0);
              return (
                <Link
                  key={palace.id}
                  href={`/palaces/${palace.id}`}
                  className="group relative backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6 hover:border-[#00F5FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00F5FF]/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00F5FF]/5 to-[#A855F7]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F5FF]/20 to-[#A855F7]/20 border border-[#334155]/30 flex items-center justify-center">
                        <span className="text-lg">🏛️</span>
                      </div>
                      {palace.isPublic && (
                        <span className="px-2 py-0.5 text-xs bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7] rounded-full">
                          Public
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#F1F5F9] group-hover:text-[#00F5FF] transition-colors">
                        {palace.name}
                      </h3>
                      {palace.description && (
                        <p className="text-sm text-[#94A3B8] mt-1 line-clamp-2">
                          {palace.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#334155]/30 text-sm text-[#64748B]">
                      <span>{palace.locations.length} location{palace.locations.length !== 1 ? 's' : ''}</span>
                      <span>{memoryCount} memor{memoryCount !== 1 ? 'ies' : 'y'}</span>
                      <span className="text-[#00F5FF] group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Add new palace card */}
            <Link
              href="/palaces/new"
              className="group backdrop-blur-xl bg-[#111827]/30 border border-[#334155]/20 border-dashed rounded-2xl p-6 hover:border-[#00F5FF]/40 hover:bg-[#111827]/60 transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[180px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1F2937] group-hover:bg-[#00F5FF]/10 border border-[#334155]/30 group-hover:border-[#00F5FF]/30 flex items-center justify-center transition-all duration-200">
                <span className="text-[#64748B] group-hover:text-[#00F5FF] text-xl transition-colors">+</span>
              </div>
              <span className="text-sm text-[#64748B] group-hover:text-[#94A3B8] transition-colors">New Workspace</span>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}
