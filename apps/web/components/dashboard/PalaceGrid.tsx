'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Palace {
  id: string;
  name: string;
  description: string;
  locationCount: number;
}

export default function PalaceGrid() {
  const { data: session } = useSession();
  const [palaces, setPalaces] = useState<Palace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPalaces = async () => {
      try {
        const response = await fetch('/api/palaces');
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch palaces');
          return;
        }

        setPalaces(data);
      } catch (err) {
        setError('Failed to load palaces');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchPalaces();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#94A3B8]">Loading your AI memories…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4">
        <p className="text-[#EF4444]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="text-[#94A3B8]">
          You have {palaces.length} workspace{palaces.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Palaces Grid */}
      {palaces.length === 0 ? (
        <div className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-12 text-center">
          <h2 className="text-xl font-semibold text-[#F1F5F9] mb-2">No workspaces yet</h2>
          <p className="text-[#94A3B8] mb-6">Connect an AI via MCP and it will start storing context here automatically.</p>
          <Link
            href="/palaces/new"
            className="inline-block px-6 py-3 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/20 transform hover:scale-105"
          >
            Create Your First Workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {palaces.map((palace) => (
            <Link
              key={palace.id}
              href={`/palaces/${palace.id}`}
              className="group relative backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6 hover:border-[#00F5FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#00F5FF]/10"
            >
              {/* Background gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F5FF]/5 to-[#A855F7]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-[#F1F5F9] group-hover:text-[#00F5FF] transition-colors">
                    {palace.name}
                  </h3>
                  <p className="text-sm text-[#94A3B8] mt-1">
                    {palace.description || 'No description'}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-[#334155]/30">
                  <span className="text-sm text-[#64748B]">
                    {palace.locationCount} location{palace.locationCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[#00F5FF] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
