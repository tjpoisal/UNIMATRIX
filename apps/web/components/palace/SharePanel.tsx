'use client';

import { useState, useEffect, useCallback } from 'react';

interface ShareEntry {
  shareId: string;
  user: { id: string; name: string | null; email: string; image: string | null };
  permission: 'view' | 'edit';
  sharedAt: string;
}

interface Friend {
  friendshipId: string;
  user: { id: string; name: string | null; email: string; image: string | null };
}

interface SharePanelProps {
  palaceId: string;
  onClose: () => void;
}

export default function SharePanel({ palaceId, onClose }: SharePanelProps) {
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  // Start in loading state — avoids synchronous setLoading(true) inside the effect.
  const [loading, setLoading] = useState(true);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [sharesRes, friendsRes] = await Promise.all([
        fetch(`/api/palaces/${palaceId}/share`),
        fetch('/api/friends'),
      ]);
      if (sharesRes.ok) setShares(await sharesRes.json());
      if (friendsRes.ok) {
        const fd = await friendsRes.json();
        setFriends(fd.friends ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [palaceId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Friends not yet shared with
  const sharedIds = new Set(shares.map((s) => s.user.id));
  const unsharedFriends = friends.filter((f) => !sharedIds.has(f.user.id));

  const handleShare = async () => {
    if (!selectedFriendId) return;
    setSharing(true);
    setError('');
    try {
      const res = await fetch(`/api/palaces/${palaceId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedFriendId, permission }),
      });
      if (res.ok) {
        setSelectedFriendId('');
        fetchData();
      } else {
        const body = await res.json();
        setError(body.error ?? 'Failed to share');
      }
    } finally {
      setSharing(false);
    }
  };

  const handleChangePermission = async (userId: string, newPermission: 'view' | 'edit') => {
    setActionLoading(userId);
    try {
      await fetch(`/api/palaces/${palaceId}/share/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission: newPermission }),
      });
      fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (userId: string) => {
    setActionLoading(userId);
    try {
      await fetch(`/api/palaces/${palaceId}/share/${userId}`, { method: 'DELETE' });
      fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#111827] border border-[#334155]/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155]/30">
          <h2 className="text-lg font-semibold text-[#F1F5F9]">Share Palace</h2>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#F1F5F9] transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Share with a friend */}
          {friends.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-[#64748B]">
                You need friends to share with.{' '}
                <a href="/friends" className="text-[#00F5FF] hover:underline">Add friends →</a>
              </p>
            </div>
          ) : unsharedFriends.length === 0 ? (
            <p className="text-sm text-[#64748B]">All your friends already have access.</p>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#94A3B8]">Share with a friend</label>
              <div className="flex gap-2">
                <select
                  value={selectedFriendId}
                  onChange={(e) => setSelectedFriendId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#0A0F1C]/60 border border-[#334155]/50 rounded-lg text-[#F1F5F9] text-sm focus:outline-none focus:border-[#00F5FF]/50"
                >
                  <option value="">Select a friend…</option>
                  {unsharedFriends.map((f) => (
                    <option key={f.user.id} value={f.user.id}>
                      {f.user.name ?? f.user.email}
                    </option>
                  ))}
                </select>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                  className="px-3 py-2 bg-[#0A0F1C]/60 border border-[#334155]/50 rounded-lg text-[#F1F5F9] text-sm focus:outline-none focus:border-[#00F5FF]/50"
                >
                  <option value="view">View</option>
                  <option value="edit">Edit</option>
                </select>
              </div>
              {error && <p className="text-xs text-[#EF4444]">{error}</p>}
              <button
                onClick={handleShare}
                disabled={sharing || !selectedFriendId}
                className="w-full py-2 bg-[#00F5FF] hover:bg-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1C] font-semibold rounded-lg text-sm transition-all"
              >
                {sharing ? 'Sharing…' : 'Share'}
              </button>
            </div>
          )}

          {/* Current shares */}
          {!loading && shares.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#94A3B8]">Shared with</p>
              {shares.map((s) => (
                <div key={s.shareId} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#0A0F1C]/40 border border-[#334155]/30 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#F1F5F9] truncate">
                      {s.user.name ?? s.user.email}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">{s.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={s.permission}
                      onChange={(e) => handleChangePermission(s.user.id, e.target.value as 'view' | 'edit')}
                      disabled={actionLoading === s.user.id}
                      className="text-xs bg-[#1F2937] border border-[#334155]/30 text-[#94A3B8] rounded-md px-2 py-1 focus:outline-none"
                    >
                      <option value="view">View</option>
                      <option value="edit">Edit</option>
                    </select>
                    <button
                      onClick={() => handleRevoke(s.user.id)}
                      disabled={actionLoading === s.user.id}
                      className="text-xs text-[#64748B] hover:text-[#EF4444] transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
