'use client';

import { useState, useEffect, useRef } from 'react';

interface LLMProvider {
  id: string;
  provider: string;
  model: string;
  label: string | null;
  keyPrefix: string;
}

interface Palace {
  id: string;
  name: string;
  description: string | null;
}

interface AgentResponse {
  provider: string;
  model: string;
  response: string;
  error?: string;
}

interface RunResult {
  runId: string;
  task: string;
  mode: string;
  synthesis: string;
  responses: AgentResponse[];
  memoryId?: string;
}

const PROVIDER_COLORS: Record<string, string> = {
  claude:  'border-[#CC785C] bg-[#CC785C]/10 text-[#CC785C]',
  openai:  'border-[#10A37F] bg-[#10A37F]/10 text-[#10A37F]',
  gemini:  'border-[#4285F4] bg-[#4285F4]/10 text-[#4285F4]',
  groq:    'border-[#F55036] bg-[#F55036]/10 text-[#F55036]',
  ollama:  'border-[#7C3AED] bg-[#7C3AED]/10 text-[#7C3AED]',
};

const PROVIDER_ICONS: Record<string, string> = {
  claude: '◆',
  openai: '⬡',
  gemini: '✦',
  groq:   '⚡',
  ollama: '🦙',
};

const MODE_DESCRIPTIONS: Record<string, string> = {
  parallel:   'All agents answer simultaneously — fastest, broadest coverage',
  sequential: 'Agents build on each other in a chain — deepest refinement',
  debate:     'Agents argue different angles, then find consensus — most balanced',
};

export default function AgentPage() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [palaces, setPalaces] = useState<Palace[]>([]);
  const [task, setTask] = useState('');
  const [mode, setMode] = useState<'parallel' | 'sequential' | 'debate'>('parallel');
  const [palaceId, setPalaceId] = useState<string>('');
  const [saveToMemory, setSaveToMemory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load providers + palaces on mount — no manual selection needed
  useEffect(() => {
    async function load() {
      try {
        const [provRes, palRes] = await Promise.all([
          fetch('/api/llm-providers'),
          fetch('/api/palaces'),
        ]);
        const provData = await provRes.json();
        const palData = await palRes.json();
        setProviders(Array.isArray(provData) ? provData : []);
        const palList = Array.isArray(palData) ? palData : (palData.palaces ?? []);
        setPalaces(palList);
        if (palList.length > 0) setPalaceId(palList[0].id);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, []);

  const handleRun = async () => {
    if (!task.trim()) {
      setError('Enter a task or question first.');
      return;
    }
    if (providers.length === 0) {
      setError('No LLM providers connected. Go to Settings → AI Providers to add one.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task.trim(),
          mode,
          providerIds: providers.map(p => p.id),
          palaceId: palaceId || undefined,
          saveToMemory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Run failed');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#94A3B8]">
          <div className="w-5 h-5 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
          Loading your agents…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#F1F5F9]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Agent Collaboration</h1>
          <p className="text-[#94A3B8] text-sm">
            Your connected AIs work together on a task — cross-referencing your memories and storing what they learn.
          </p>
        </div>

        {/* Connected agents — auto-populated, no picking */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[#475569] mb-3 font-medium">
            Active agents ({providers.length})
          </p>
          {providers.length === 0 ? (
            <div className="border border-dashed border-[#334155] rounded-xl p-6 text-center text-[#94A3B8] text-sm">
              No AI providers connected yet.{' '}
              <a href="/settings/providers" className="text-[#00F5FF] hover:underline">
                Add one in Settings →
              </a>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {providers.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${PROVIDER_COLORS[p.provider] ?? 'border-[#334155] text-[#94A3B8]'}`}
                >
                  <span>{PROVIDER_ICONS[p.provider] ?? '●'}</span>
                  <span>{p.label ?? `${p.provider} / ${p.model}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task input */}
        <div className="mb-6">
          <textarea
            ref={textareaRef}
            value={task}
            onChange={e => setTask(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRun();
            }}
            placeholder="What do you want your agents to work on?  (⌘↵ to run)"
            rows={4}
            className="w-full bg-[#111827] border border-[#334155] rounded-xl px-5 py-4 text-white placeholder-[#475569] text-base focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/40 resize-none transition-all"
          />
        </div>

        {/* Mode selector */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-[#475569] mb-3 font-medium">
            Collaboration mode
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(['parallel', 'sequential', 'debate'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  mode === m
                    ? 'border-[#00F5FF] bg-[#00F5FF]/10 text-white'
                    : 'border-[#334155] bg-[#111827] text-[#94A3B8] hover:border-[#475569]'
                }`}
              >
                <div className="font-semibold capitalize mb-1 text-sm">{m}</div>
                <div className="text-xs leading-relaxed opacity-75">{MODE_DESCRIPTIONS[m]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Memory options — auto-populated from user's palaces */}
        <div className="mb-8 flex items-center gap-6 flex-wrap">
          {palaces.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#94A3B8]">Memory palace:</span>
              <select
                value={palaceId}
                onChange={e => setPalaceId(e.target.value)}
                className="bg-[#111827] border border-[#334155] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00F5FF]/40"
              >
                <option value="">None</option>
                {palaces.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setSaveToMemory(v => !v)}
              className={`w-9 h-5 rounded-full transition-colors relative ${saveToMemory ? 'bg-[#00F5FF]' : 'bg-[#334155]'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${saveToMemory ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-[#94A3B8]">Save results to memory</span>
          </label>
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={loading || providers.length === 0}
          className="w-full py-4 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-bold text-lg rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#0A0F1C]/30 border-t-[#0A0F1C] rounded-full animate-spin" />
              Agents collaborating…
            </>
          ) : (
            `Run ${providers.length} Agent${providers.length !== 1 ? 's' : ''}`
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444] text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-10 space-y-6">

            {/* Synthesis */}
            <div className="bg-[#111827] border border-[#00F5FF]/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#00F5FF]" />
                <span className="text-[#00F5FF] text-sm font-semibold uppercase tracking-widest">
                  Synthesis
                </span>
                {result.memoryId && (
                  <span className="ml-auto text-xs text-[#475569] bg-[#1E293B] px-2 py-1 rounded-full">
                    ✓ saved to palace
                  </span>
                )}
              </div>
              <p className="text-[#F1F5F9] leading-relaxed whitespace-pre-wrap">{result.synthesis}</p>
            </div>

            {/* Individual agent responses */}
            <div>
              <p className="text-xs uppercase tracking-widest text-[#475569] mb-4 font-medium">
                Individual responses
              </p>
              <div className="space-y-4">
                {result.responses
                  .filter(r => !r.error && r.response)
                  .map((r, i) => (
                    <div
                      key={i}
                      className={`border rounded-xl p-5 ${PROVIDER_COLORS[r.provider] ?? 'border-[#334155]'}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{PROVIDER_ICONS[r.provider] ?? '●'}</span>
                        <span className="font-semibold capitalize">{r.provider}</span>
                        <span className="text-xs opacity-60">{r.model}</span>
                      </div>
                      <p className="text-[#E2E8F0] text-sm leading-relaxed whitespace-pre-wrap">
                        {r.response}
                      </p>
                    </div>
                  ))}

                {result.responses.filter(r => r.error).map((r, i) => (
                  <div key={`err-${i}`} className="border border-[#EF4444]/30 bg-[#EF4444]/5 rounded-xl p-4">
                    <span className="text-[#EF4444] text-sm font-medium capitalize">{r.provider}</span>
                    <span className="text-[#EF4444]/70 text-xs ml-2">{r.error}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
