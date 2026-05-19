'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';

interface FriendUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Friend {
  friendshipId: string;
  user: FriendUser;
  since?: string;
  sentAt?: string;
}

interface FriendsData {
  friends: Friend[];
  pendingReceived: Friend[];
  pendingSent: Friend[];
}

function Avatar({ user, size = 'md' }: { user: FriendUser; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${dim} rounded-lg bg-[#A855F7] flex items-center justify-center text-[#F1F5F9] font-bold flex-shrink-0`}>
      {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
    </div>
  );
}

export default function FriendsPage() {
  const [data, setData] = useState<FriendsData>({ friends: [], pendingReceived: [], pendingSent: [] });
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends');
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-compiler/react-compiler
  useEffect(() => { fetchFriends(); }, [fetchFriends]);

  const sendRequest = async () => {
    if (!email.trim()) return;
    setSending(true);
    setSendError('');
    setSendSuccess('');
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await res.json();
      if (res.ok) {
        setSendSuccess(`Friend request sent to ${email.trim()}`);
        setEmail('');
        fetchFriends();
      } else {
        setSendError(body.error ?? 'Failed to send request');
      }
    } finally {
      setSending(false);
    }
  };

  const handleAction = async (friendshipId: string, action: 'accept' | 'reject' | 'remove') => {
    setActionLoading(friendshipId);
    try {
      if (action === 'remove') {
        await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/friends/${friendshipId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
      }
      fetchFriends();
    } finally {
      setActionLoading(null);
    }
  };

  const totalPending = data.pendingReceived.length + data.pendingSent.length;

  return (
    <AppShell>
      <div className="p-8 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]">Friends</h1>
          <p className="text-[#94A3B8] mt-1">
            Connect with others to share memory palaces.
          </p>
        </div>

        {/* Add Friend */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Add a Friend</h2>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSendError(''); setSendSuccess(''); }}
              onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
              placeholder="Enter their email address"
              className="flex-1 px-4 py-2.5 bg-[#0A0F1C]/60 border border-[#334155]/50 rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#00F5FF]/50 focus:ring-1 focus:ring-[#00F5FF]/20 transition-colors text-sm"
            />
            <button
              onClick={sendRequest}
              disabled={sending || !email.trim()}
              className="px-5 py-2.5 bg-[#00F5FF] hover:bg-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1C] font-semibold rounded-lg text-sm transition-all"
            >
              {sending ? 'Sending…' : 'Send Request'}
            </button>
          </div>
          {sendError && <p className="mt-2 text-sm text-[#EF4444]">{sendError}</p>}
          {sendSuccess && <p className="mt-2 text-sm text-[#22C55E]">✓ {sendSuccess}</p>}
        </section>

        {/* Pending requests received */}
        {data.pendingReceived.length > 0 && (
          <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#00F5FF]/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#F1F5F9] mb-1">
              Friend Requests
              <span className="ml-2 px-2 py-0.5 text-xs bg-[#00F5FF]/20 text-[#00F5FF] rounded-full">
                {data.pendingReceived.length}
              </span>
            </h2>
            <p className="text-sm text-[#64748B] mb-4">People who want to connect with you</p>
            <div className="space-y-3">
              {data.pendingReceived.map((f) => (
                <div key={f.friendshipId} className="flex items-center justify-between gap-4 px-4 py-3 bg-[#0A0F1C]/40 border border-[#334155]/30 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={f.user} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#F1F5F9] truncate">{f.user.name ?? f.user.email}</p>
                      <p className="text-xs text-[#64748B] truncate">{f.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(f.friendshipId, 'accept')}
                      disabled={actionLoading === f.friendshipId}
                      className="px-3 py-1.5 text-xs bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 text-[#22C55E] rounded-lg transition-colors disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(f.friendshipId, 'reject')}
                      disabled={actionLoading === f.friendshipId}
                      className="px-3 py-1.5 text-xs bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] rounded-lg transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Friends list */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">
            Your Friends
            {data.friends.length > 0 && (
              <span className="ml-2 text-sm font-normal text-[#64748B]">({data.friends.length})</span>
            )}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
            </div>
          ) : data.friends.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-[#94A3B8] text-sm">No friends yet — send a request above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.friends.map((f) => (
                <div key={f.friendshipId} className="flex items-center justify-between gap-4 px-4 py-3 bg-[#0A0F1C]/40 border border-[#334155]/30 rounded-xl hover:border-[#334155]/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={f.user} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#F1F5F9] truncate">{f.user.name ?? f.user.email}</p>
                      <p className="text-xs text-[#64748B] truncate">{f.user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction(f.friendshipId, 'remove')}
                    disabled={actionLoading === f.friendshipId}
                    className="text-xs text-[#64748B] hover:text-[#EF4444] transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {actionLoading === f.friendshipId ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending sent */}
        {data.pendingSent.length > 0 && (
          <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-[#94A3B8] mb-3">Requests Sent</h2>
            <div className="space-y-2">
              {data.pendingSent.map((f) => (
                <div key={f.friendshipId} className="flex items-center justify-between gap-4 px-4 py-3 bg-[#0A0F1C]/40 border border-[#334155]/30 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={f.user} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#F1F5F9] truncate">{f.user.name ?? f.user.email}</p>
                      <p className="text-xs text-[#64748B] truncate">Pending acceptance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAction(f.friendshipId, 'remove')}
                    disabled={actionLoading === f.friendshipId}
                    className="text-xs text-[#64748B] hover:text-[#EF4444] transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state when truly nothing pending */}
        {!loading && totalPending === 0 && data.friends.length > 0 && (
          <p className="text-center text-xs text-[#475569] pb-4">No pending requests</p>
        )}
      </div>
    </AppShell>
  );
}
