'use client';

import { useState } from 'react';

interface PendingAction {
  id: string;
  agent_name: string;
  tool_name: string;
  status: string;
  createdAt: string;
  requested_by?: string;
  args: Record<string, unknown>;
}

export default function PendingActionsPage() {
  const [actions, setActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState('');

  const fetchActions = async (rid: string) => {
    if (!rid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pending-actions?room_id=${rid}&status=pending`);
      const data = await res.json();
      setActions(data.actions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    await fetch(`/api/pending-actions/${id}/${action}`, { method: 'POST' });
    if (roomId) fetchActions(roomId);
  };

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">Pending Actions (HITL Queue)</h1>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="bg-[#111827] border border-[#334155] px-4 py-2 rounded flex-1"
        />
        <button
          onClick={() => fetchActions(roomId)}
          className="bg-[#00F5FF] text-[#0A0F1C] px-6 rounded font-medium"
        >
          Load
        </button>
      </div>

      {loading && <div>Loading...</div>}

      <div className="space-y-4">
        {actions.length === 0 && roomId && !loading && (
          <div className="text-[#64748B]">No pending actions for this room.</div>
        )}

        {actions.map((action) => (
          <div key={action.id} className="border border-[#334155] rounded-lg p-5 bg-[#111827]">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{action.agent_name} → <span className="text-[#00F5FF]">{action.tool_name}</span></div>
                <div className="text-xs text-[#64748B] mt-1">Requested by: {action.requested_by || 'system'}</div>
              </div>
              <div className="text-xs text-[#64748B]">{new Date(action.createdAt).toLocaleString()}</div>
            </div>

            <pre className="text-xs bg-[#0A0F1C] p-3 rounded mt-3 overflow-auto max-h-32">
              {JSON.stringify(action.args, null, 2)}
            </pre>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleAction(action.id, 'approve')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(action.id, 'reject')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
