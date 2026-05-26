'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import LocationTree from '@/components/palace/LocationTree';
import SharePanel from '@/components/palace/SharePanel';

interface Memory {
  id: string;
  content: string;
  tags: string[];
}

interface Location {
  id: string;
  name: string;
  description: string;
  memories: Memory[];
  children: Location[];
}

interface Palace {
  id: string;
  name: string;
  description: string;
  locations: Location[];
}

export default function PalaceViewPage() {
  const params = useParams();
  const palaceId = params.id as string;

  const [palace, setPalace] = useState<Palace | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const fetchPalace = async () => {
      try {
        const response = await fetch(`/api/palaces/${palaceId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch palace');
          return;
        }

        setPalace(data);
      } catch {
        setError('Failed to load palace');
      } finally {
        setLoading(false);
      }
    };

    fetchPalace();
  }, [palaceId]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <div className="text-[#94A3B8]">Loading palace...</div>
        </div>
      </AppShell>
    );
  }

  if (error || !palace) {
    return (
      <AppShell>
        <div className="p-8">
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4">
            <p className="text-[#EF4444]">{error || 'Palace not found'}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {showShare && (
        <SharePanel palaceId={palaceId} onClose={() => setShowShare(false)} />
      )}
      <div className="flex h-full overflow-hidden">
        {/* Left Sidebar - Location Tree */}
        <div className="w-80 bg-[#111827]/60 border-r border-[#334155]/30 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#F1F5F9] truncate">{palace.name}</h2>
            <button
              onClick={() => setShowShare(true)}
              title="Share palace"
              className="flex-shrink-0 px-3 py-1.5 text-xs bg-[#1F2937] hover:bg-[#2D3748] text-[#94A3B8] hover:text-[#F1F5F9] rounded-lg transition-colors"
            >
              Share
            </button>
          </div>
          <LocationTree locations={palace.locations} onSelectMemory={setSelectedMemory} />
        </div>

        {/* Right Content - Memory Editor */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedMemory ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-[#F1F5F9] mb-4">Memory</h2>
                <div className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-[#F1F5F9] whitespace-pre-wrap">
                      {selectedMemory.content}
                    </p>
                  </div>

                  {selectedMemory.tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {selectedMemory.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-full text-xs text-[#00F5FF]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-[#94A3B8]">
                <p className="text-lg mb-2">Select a memory to view</p>
                <p className="text-sm">or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
