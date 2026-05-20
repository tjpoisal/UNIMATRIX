'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface PalaceLocation {
  id: string;
  name: string;
  _count: { memories: number };
}

interface Palace {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  locations: PalaceLocation[];
}

const WORKSPACE_EMOJIS = ['🏛️', '🏰', '🗼', '🌌', '🏯', '🕌', '🗽', '🌆', '🏟️', '🛕'];

function getWorkspaceEmoji(name: string): string {
  const idx = name.charCodeAt(0) % WORKSPACE_EMOJIS.length;
  return PALACE_EMOJIS[idx];
}

interface CreateModalProps {
  onClose: () => void;
  onCreate: (palace: Palace) => void;
}

function CreateModal({ onClose, onCreate }: CreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Palace name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/palaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create workspace');
      onCreate({ ...data, locations: [] });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] border border-[#334155]/50 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#F1F5F9]">Create New Workspace</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1F2937] transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Project Research, Work Context, Personal Notes…"
              autoFocus
              className="w-full bg-[#0A0F1C] border border-[#334155] rounded-lg px-4 py-2.5 text-[#F1F5F9] placeholder-[#475569] text-sm focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">
              Description <span className="text-[#475569]">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What will this AI memory workspace be used for?"
              rows={3}
              className="w-full bg-[#0A0F1C] border border-[#334155] rounded-lg px-4 py-2.5 text-[#F1F5F9] placeholder-[#475569] text-sm focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/40 transition-all resize-none"
            />
          </div>
          {error && (
            <p className="text-[#EF4444] text-sm">{error}</p>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#334155]/50 text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating…' : 'Create Palace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PalaceListPage() {
  const router = useRouter();
  const [palaces, setPalaces] = useState<Palace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadPalaces = useCallback(async () => {
    try {
      const res = await fetch('/api/palaces');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch palaces');
        return;
      }
      setPalaces(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load palaces');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPalaces(); }, [loadPalaces]);

  const handleCreate = (palace: Palace) => {
    setPalaces(prev => [palace, ...prev]);
    setShowCreate(false);
    router.push(`/palace/${palace.id}`);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/palaces/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPalaces(prev => prev.filter(p => p.id !== id));
      }
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const totalMemories = palaces.reduce(
    (sum, p) => sum + p.locations.reduce((s, l) => s + l._count.memories, 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#94A3B8]">
          <div className="w-5 h-5 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
          Loading workspaces…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#F1F5F9]">
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">AI Memory Workspaces</h1>
            {!loading && (
              <p className="text-[#94A3B8] text-sm">
                {palaces.length} workspace{palaces.length !== 1 ? 's' : ''} · {totalMemories} memor{totalMemories !== 1 ? 'ies' : 'y'}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-xl transition-colors flex items-center gap-2 text-sm"
          >
            <span className="text-base leading-none">+</span> New Workspace
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
            <p className="text-[#EF4444] text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && palaces.length === 0 && (
          <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-[#1F2937] rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">🏛️</span>
            </div>
            <h2 className="text-xl font-semibold text-[#F1F5F9] mb-2">No workspaces yet</h2>
            <p className="text-[#94A3B8] mb-8 text-sm max-w-sm mx-auto">
              Create your first AI memory workspace. Any AI you connect will automatically store context here.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-8 py-3 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-xl transition-colors text-sm"
            >
              Create Your First Workspace
            </button>
          </div>
        )}

        {/* Palace Grid */}
        {palaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {palaces.map(palace => {
              const memoryCount = palace.locations.reduce((s, l) => s + l._count.memories, 0);
              const emoji = getWorkspaceEmoji(palace.name);
              const isConfirmingDelete = confirmDelete === palace.id;

              return (
                <div
                  key={palace.id}
                  className="group relative bg-[#111827] border border-[#334155]/30 hover:border-[#00F5FF]/40 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/5 flex flex-col"
                >
                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00F5FF]/3 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                  <div className="relative flex-1">
                    {/* Icon + badge row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F5FF]/15 to-[#A855F7]/10 border border-[#334155]/30 flex items-center justify-center text-2xl">
                        {emoji}
                      </div>
                      <div className="flex items-center gap-2">
                        {palace.isPublic && (
                          <span className="px-2 py-0.5 text-xs bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7] rounded-full">
                            Public
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name + description */}
                    <h3 className="text-lg font-bold text-[#F1F5F9] group-hover:text-[#00F5FF] transition-colors mb-1 leading-tight">
                      {palace.name}
                    </h3>
                    {palace.description && (
                      <p className="text-sm text-[#94A3B8] line-clamp-2 mb-4">
                        {palace.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-[#64748B] pt-4 border-t border-[#334155]/30 mt-auto">
                      <span className="flex items-center gap-1">
                        <span>📍</span>
                        {palace.locations.length} location{palace.locations.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💡</span>
                        {memoryCount} memor{memoryCount !== 1 ? 'ies' : 'y'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative flex gap-2 mt-5">
                    <button
                      onClick={() => router.push(`/palace/${palace.id}`)}
                      className="flex-1 py-2 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg text-sm transition-colors"
                    >
                      Open
                    </button>

                    {isConfirmingDelete ? (
                      <>
                        <button
                          onClick={() => handleDelete(palace.id)}
                          disabled={deleting === palace.id}
                          className="px-3 py-2 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {deleting === palace.id ? '…' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-2 border border-[#334155]/50 text-[#94A3B8] hover:text-[#F1F5F9] rounded-lg text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(palace.id)}
                        className="px-3 py-2 border border-[#334155]/50 text-[#94A3B8] hover:text-[#EF4444] hover:border-[#EF4444]/40 rounded-lg text-xs transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add new palace card */}
            <button
              onClick={() => setShowCreate(true)}
              className="group bg-[#111827]/50 border border-[#334155]/20 border-dashed rounded-2xl p-6 hover:border-[#00F5FF]/40 hover:bg-[#111827] transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[240px]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1F2937] group-hover:bg-[#00F5FF]/10 border border-[#334155]/30 group-hover:border-[#00F5FF]/30 flex items-center justify-center transition-all duration-200">
                <span className="text-[#64748B] group-hover:text-[#00F5FF] text-2xl transition-colors">+</span>
              </div>
              <span className="text-sm text-[#64748B] group-hover:text-[#94A3B8] transition-colors">New Workspace</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
