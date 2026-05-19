'use client';

import { useState, useEffect } from 'react';

interface LLMProvider {
  id: string;
  provider: string;
  model: string;
  label: string | null;
  keyPrefix: string;
  createdAt: string;
}

const PROVIDERS = [
  {
    id: 'claude',
    name: 'Claude',
    icon: '◆',
    color: '#CC785C',
    bg: 'bg-[#CC785C]/10 border-[#CC785C]/40',
    badge: 'bg-[#CC785C]/20 text-[#CC785C]',
    models: [
      { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 (most capable)' },
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (fast + smart)' },
      { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (fastest)' },
    ],
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-api03-…',
    keyLink: 'https://console.anthropic.com/settings/keys',
    keyLinkLabel: 'console.anthropic.com',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '⬡',
    color: '#10A37F',
    bg: 'bg-[#10A37F]/10 border-[#10A37F]/40',
    badge: 'bg-[#10A37F]/20 text-[#10A37F]',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o (recommended)' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (fast)' },
      { value: 'o1', label: 'o1 (reasoning)' },
    ],
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-…',
    keyLink: 'https://platform.openai.com/api-keys',
    keyLinkLabel: 'platform.openai.com',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '✦',
    color: '#4285F4',
    bg: 'bg-[#4285F4]/10 border-[#4285F4]/40',
    badge: 'bg-[#4285F4]/20 text-[#4285F4]',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (recommended)' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (fast)' },
    ],
    keyLabel: 'Google AI API Key',
    keyPlaceholder: 'AIzaSy…',
    keyLink: 'https://aistudio.google.com/app/apikey',
    keyLinkLabel: 'aistudio.google.com',
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: '⚡',
    color: '#F55036',
    bg: 'bg-[#F55036]/10 border-[#F55036]/40',
    badge: 'bg-[#F55036]/20 text-[#F55036]',
    models: [
      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (recommended)' },
      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
      { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (fastest)' },
    ],
    keyLabel: 'Groq API Key',
    keyPlaceholder: 'gsk_…',
    keyLink: 'https://console.groq.com/keys',
    keyLinkLabel: 'console.groq.com',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    icon: '🦙',
    color: '#7C3AED',
    bg: 'bg-[#7C3AED]/10 border-[#7C3AED]/40',
    badge: 'bg-[#7C3AED]/20 text-[#7C3AED]',
    models: [
      { value: 'llama3.2', label: 'Llama 3.2 (recommended)' },
      { value: 'mistral', label: 'Mistral' },
      { value: 'phi3', label: 'Phi-3' },
      { value: 'gemma2', label: 'Gemma 2' },
    ],
    keyLabel: null, // no key needed
    keyPlaceholder: '',
    keyLink: 'https://ollama.com',
    keyLinkLabel: 'ollama.com (runs locally)',
  },
];

export default function ProvidersPage() {
  const [connected, setConnected] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null); // which provider panel is open
  const [form, setForm] = useState({ model: '', apiKey: '', label: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => { loadProviders(); }, []);

  async function loadProviders() {
    setLoading(true);
    try {
      const res = await fetch('/api/llm-providers');
      const data = await res.json();
      setConnected(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  function openAdd(providerId: string) {
    const def = PROVIDERS.find(p => p.id === providerId);
    setForm({ model: def?.models[0]?.value ?? '', apiKey: '', label: '' });
    setError('');
    setSuccess('');
    setAdding(providerId);
  }

  async function handleAdd() {
    if (!adding) return;
    const def = PROVIDERS.find(p => p.id === adding)!;
    if (!form.model) { setError('Select a model.'); return; }
    if (def.keyLabel && !form.apiKey.trim()) { setError('API key is required.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/llm-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: adding,
          model: form.model,
          apiKey: form.apiKey.trim() || 'local',
          label: form.label.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect');
      setSuccess(`${def.name} connected!`);
      setAdding(null);
      await loadProviders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    try {
      await fetch(`/api/llm-providers/${id}`, { method: 'DELETE' });
      await loadProviders();
    } finally {
      setRemoving(null);
    }
  }

  const connectedIds = new Set(connected.map(c => c.provider));

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#F1F5F9]">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">AI Providers</h1>
          <p className="text-[#94A3B8] text-sm">
            Connect your AI accounts. Keys are encrypted and stored securely — never shared.
          </p>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-6 p-4 bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-xl text-[#00F5FF] text-sm flex items-center justify-between">
            <span>✓ {success}</span>
            <button onClick={() => setSuccess('')} className="text-[#00F5FF]/60 hover:text-[#00F5FF]">✕</button>
          </div>
        )}

        {/* Connected providers */}
        {!loading && connected.length > 0 && (
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-[#475569] mb-4 font-medium">
              Connected ({connected.length})
            </p>
            <div className="space-y-3">
              {connected.map(c => {
                const def = PROVIDERS.find(p => p.id === c.provider);
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${def?.bg ?? 'border-[#334155] bg-[#111827]'}`}
                  >
                    <span className="text-2xl">{def?.icon ?? '●'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white capitalize">{c.provider}</span>
                        {c.label && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${def?.badge ?? 'bg-[#334155] text-[#94A3B8]'}`}>
                            {c.label}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[#94A3B8] mt-0.5">
                        {c.model} · <span className="font-mono text-xs">{c.keyPrefix}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(c.id)}
                      disabled={removing === c.id}
                      className="text-[#475569] hover:text-[#EF4444] text-sm transition-colors disabled:opacity-40 px-3 py-1 rounded-lg hover:bg-[#EF4444]/10"
                    >
                      {removing === c.id ? '…' : 'Remove'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Provider cards */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[#475569] mb-4 font-medium">
            Available providers
          </p>
          <div className="space-y-3">
            {PROVIDERS.map(def => {
              const isConnected = connectedIds.has(def.id);
              const isOpen = adding === def.id;

              return (
                <div key={def.id} className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden transition-all">

                  {/* Provider row */}
                  <div className="flex items-center gap-4 p-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${def.bg}`}>
                      {def.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{def.name}</span>
                        {isConnected && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${def.badge}`}>
                            Connected
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#475569] mt-0.5">
                        {def.models.length} models available ·{' '}
                        <a href={def.keyLink} target="_blank" rel="noopener noreferrer"
                          className="text-[#00F5FF]/60 hover:text-[#00F5FF] transition-colors">
                          {def.keyLinkLabel}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => isOpen ? setAdding(null) : openAdd(def.id)}
                      style={{ color: isOpen ? '#EF4444' : def.color }}
                      className="text-sm font-medium px-4 py-2 rounded-lg border transition-all"
                      style={{
                        color: isOpen ? '#EF4444' : def.color,
                        borderColor: isOpen ? '#EF4444' + '40' : def.color + '40',
                        background: isOpen ? '#EF444410' : def.color + '10',
                      }}
                    >
                      {isOpen ? 'Cancel' : isConnected ? '+ Add another' : 'Connect'}
                    </button>
                  </div>

                  {/* Expand form */}
                  {isOpen && (
                    <div className="border-t border-[#1E293B] px-5 pb-5 pt-4 space-y-4">

                      {/* Model select */}
                      <div>
                        <label className="block text-sm text-[#94A3B8] mb-1.5">Model</label>
                        <select
                          value={form.model}
                          onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                          className="w-full bg-[#0A0F1C] border border-[#334155] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/30"
                        >
                          {def.models.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* API key (not for Ollama) */}
                      {def.keyLabel && (
                        <div>
                          <label className="block text-sm text-[#94A3B8] mb-1.5">
                            {def.keyLabel} ·{' '}
                            <a href={def.keyLink} target="_blank" rel="noopener noreferrer"
                              className="text-[#00F5FF]/60 hover:text-[#00F5FF]">
                              Get key →
                            </a>
                          </label>
                          <input
                            type="password"
                            value={form.apiKey}
                            onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))}
                            placeholder={def.keyPlaceholder}
                            autoComplete="off"
                            className="w-full bg-[#0A0F1C] border border-[#334155] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/30 font-mono"
                          />
                          <p className="text-xs text-[#475569] mt-1.5">
                            Encrypted with AES-256 before storage. Never visible again after saving.
                          </p>
                        </div>
                      )}

                      {/* Ollama info */}
                      {!def.keyLabel && (
                        <div className="text-sm text-[#94A3B8] bg-[#0A0F1C] border border-[#334155] rounded-lg p-3">
                          Ollama runs locally. Make sure{' '}
                          <code className="text-[#7C3AED] font-mono text-xs">ollama serve</code>{' '}
                          is running and the model is pulled. No API key needed.
                        </div>
                      )}

                      {/* Optional label */}
                      <div>
                        <label className="block text-sm text-[#94A3B8] mb-1.5">
                          Label <span className="text-[#475569]">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={form.label}
                          onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                          placeholder={`e.g. "My ${def.name} key"`}
                          className="w-full bg-[#0A0F1C] border border-[#334155] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/30"
                        />
                      </div>

                      {error && (
                        <p className="text-[#EF4444] text-sm">{error}</p>
                      )}

                      <button
                        onClick={handleAdd}
                        disabled={saving}
                        className="w-full py-3 rounded-xl font-semibold text-[#0A0F1C] transition-all disabled:opacity-50"
                        style={{ background: saving ? '#94A3B8' : def.color }}
                      >
                        {saving ? 'Connecting…' : `Connect ${def.name}`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Link to agent page */}
        {connected.length > 0 && (
          <div className="mt-10 p-5 bg-[#111827] border border-[#00F5FF]/20 rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-semibold text-white">
                {connected.length} provider{connected.length !== 1 ? 's' : ''} ready
              </div>
              <div className="text-sm text-[#94A3B8] mt-0.5">
                Your agents will collaborate on every task using all connected AIs.
              </div>
            </div>
            <a
              href="/agent"
              className="px-5 py-2.5 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-xl text-sm transition-all whitespace-nowrap"
            >
              Run agents →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
