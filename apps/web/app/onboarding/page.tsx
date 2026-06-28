'use client';

import { useMemo, useState } from 'react';
import { deriveKey, encryptMemory, signMemory } from '@/lib/encryption';

const SNIPPETS: Record<string, string> = {
  'claude-desktop': `{\n  "mcpServers": {\n    "unimatrix": {\n      "url": "https://unimatrix-mcp.fly.dev/mcp",\n      "apiKey": "YOUR_API_KEY"\n    }\n  }\n}`,
  cursor: 'Cursor → Settings → MCP → Add server URL: https://unimatrix-mcp.fly.dev/mcp',
  chatgpt: 'Install the Unimatrix browser extension, then click “Save to Unimatrix” on responses.',
  other: 'Use the Unimatrix SDK or POST /api/memories with your API key.',
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [tool, setTool] = useState<'claude-desktop' | 'cursor' | 'chatgpt' | 'other'>('claude-desktop');
  const [memory, setMemory] = useState('My first Unimatrix memory');
  const [saved, setSaved] = useState<string>('');
  const [recallResult, setRecallResult] = useState<string>('');
  const [query, setQuery] = useState('first Unimatrix memory');

  const snippet = useMemo(() => SNIPPETS[tool], [tool]);

  async function saveMemory() {
    const key = await deriveKey('onboarding-demo-password');
    const encrypted = await encryptMemory(memory, key);
    const signature = await signMemory(memory, key);
    const res = await fetch('/api/memories/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        signature,
        context: 'onboarding',
        importance: 'medium',
      }),
    });
    if (!res.ok) return;
    setSaved('Saved! ✅');
  }

  async function recallMemory() {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();
    setRecallResult(data?.results?.[0]?.content ?? 'No memory found');
  }

  return (
    <main className="min-h-screen bg-[#0A0F1C] text-[#F1F5F9] p-8">
      <h1 className="text-3xl font-bold mb-6">Get your first memory in under 60 seconds</h1>
      <div className="bg-[#111827] border border-[#334155]/30 rounded p-6 space-y-6">
        {step === 1 && (
          <section>
            <h2 className="font-semibold mb-3">Step 1: Choose your primary AI tool</h2>
            <select value={tool} onChange={(e) => setTool(e.target.value as typeof tool)} className="bg-[#1F2937] p-2 rounded">
              <option value="claude-desktop">Claude Desktop</option>
              <option value="cursor">Cursor</option>
              <option value="chatgpt">ChatGPT</option>
              <option value="other">Other</option>
            </select>
            <button onClick={() => setStep(2)} className="ml-3 bg-[#00F5FF] text-[#0A0F1C] px-3 py-2 rounded">Next</button>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="font-semibold mb-3">Step 2: Install</h2>
            <pre className="bg-[#1F2937] p-3 rounded overflow-auto text-xs">{snippet}</pre>
            <button onClick={() => setStep(3)} className="mt-3 bg-[#00F5FF] text-[#0A0F1C] px-3 py-2 rounded">Next</button>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="font-semibold mb-3">Step 3: Save your first memory</h2>
            <textarea value={memory} onChange={(e) => setMemory(e.target.value)} className="w-full bg-[#1F2937] p-3 rounded min-h-24" />
            <button onClick={saveMemory} className="mt-3 bg-[#00F5FF] text-[#0A0F1C] px-3 py-2 rounded">Save Memory</button>
            <p className="mt-2 text-[#00F5FF]">{saved}</p>
            <button onClick={() => setStep(4)} className="mt-2 underline">Continue</button>
          </section>
        )}

        {step === 4 && (
          <section>
            <h2 className="font-semibold mb-3">Step 4: Recall it</h2>
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-[#1F2937] p-2 rounded" />
            <button onClick={recallMemory} className="mt-3 bg-[#00F5FF] text-[#0A0F1C] px-3 py-2 rounded">Recall Memory</button>
            <p className="mt-3 text-[#94A3B8]">{recallResult}</p>
          </section>
        )}
      </div>
    </main>
  );
}
