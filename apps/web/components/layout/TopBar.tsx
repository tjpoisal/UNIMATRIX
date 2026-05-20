'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-[#111827]/60 backdrop-blur-xl border-b border-[#334155]/30 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-[#1F2937] rounded-lg transition-colors text-[#F1F5F9]"
          >
            ☰
          </button>

          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full px-4 py-2 bg-[#0A0F1C] border border-[#334155] rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/50 transition-all"
            />
          </form>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/palace')}
            className="px-4 py-2 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/20 transform hover:scale-105 text-sm"
          >
            + New Palace
          </button>
        </div>
      </div>
    </div>
  );
}
