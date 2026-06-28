'use client';

import { useState } from 'react';

export default function ContinueSessionButton() {
  const [status, setStatus] = useState('');

  async function handleContinue() {
    setStatus('');
    const res = await fetch('/api/memories/recent?limit=5');
    const memories = await res.json();
    const context = (Array.isArray(memories) ? memories : [])
      .slice(0, 5)
      .map((m: { content?: string; createdAt?: string }) => `- ${m.content ?? ''}`)
      .join('\n');
    await navigator.clipboard.writeText(context);
    setStatus('Context copied — paste into any AI chat');
  }

  return (
    <div className="mb-6">
      <button
        onClick={handleContinue}
        className="px-5 py-3 rounded bg-[#00F5FF] text-[#0A0F1C] font-semibold hover:opacity-90"
      >
        ▶ Continue from last session
      </button>
      {status && <p className="mt-2 text-sm text-[#00F5FF]">{status}</p>}
    </div>
  );
}
