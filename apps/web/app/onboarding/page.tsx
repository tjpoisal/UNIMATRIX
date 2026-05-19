'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsed: string | null;
  createdAt: string;
}

const AI_SYSTEMS = [
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    icon: '🤖',
    description: 'Connect via MCP server',
    color: '#CC785C',
    instructions: (key: string) => `Add this to your Claude Desktop config file:

macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
Windows: %APPDATA%\\Claude\\claude_desktop_config.json

{
  "mcpServers": {
    "unimatrix": {
      "command": "npx",
      "args": ["-y", "@unimatrix/mcp-server"],
      "env": {
        "UNIMATRIX_API_KEY": "${key}",
        "UNIMATRIX_API_URL": "${typeof window !== 'undefined' ? window.location.origin : 'https://unimatrix-flax.vercel.app'}/api"
      }
    }
  }
}`,
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: '💻',
    description: 'Connect via CLI',
    color: '#CC785C',
    instructions: (key: string) => `Run this command in your terminal:

claude mcp add unimatrix \\
  --command "npx -y @unimatrix/mcp-server" \\
  --env UNIMATRIX_API_KEY="${key}" \\
  --env UNIMATRIX_API_URL="${typeof window !== 'undefined' ? window.location.origin : 'https://unimatrix-flax.vercel.app'}/api"

Then restart Claude Code and your memories will be available.`,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🟢',
    description: 'Connect via REST API',
    color: '#10A37F',
    instructions: (key: string) => `Use the Unimatrix REST API directly in your ChatGPT actions or custom GPTs.

Base URL: ${typeof window !== 'undefined' ? window.location.origin : 'https://unimatrix-flax.vercel.app'}/api
Authorization: Bearer ${key}

Endpoints:
  GET  /palaces           — list your memory palaces
  GET  /memories          — search memories
  POST /memories          — store a new memory
  GET  /search?q=...      — full-text search

Add the OpenAPI spec to your GPT Actions:
${typeof window !== 'undefined' ? window.location.origin : 'https://unimatrix-flax.vercel.app'}/api/openapi.json`,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    description: 'Connect via REST API',
    color: '#4285F4',
    instructions: (key: string) => `Use the Unimatrix REST API with Gemini function calling.

Base URL: ${typeof window !== 'undefined' ? window.location.origin : 'https://unimatrix-flax.vercel.app'}/api
Authorization Header: Bearer ${key}

Example function declaration for Gemini:
{
  "name": "search_memories",
  "description": "Search the user's Unimatrix memory palace",
  "parameters": {
    "type": "object",
    "properties": {
      "query": { "type": "string", "description": "Search query" }
    },
    "required": ["query"]
  }
}

Make requests to: GET /api/search?q={query}`,
  },
  {
    id: 'grok',
    name: 'Grok',
    icon: '𝕏',
    description: 'Connect via REST API',
    color: '#E7E9EA',
    instructions: (key: string) => `Use the Unimatrix REST API with xAI / Grok tool calling.

Base URL: ${typeof window !== 'undefined' ? window.location.origin : 'https://unimatrix-flax.vercel.app'}/api
Authorization: Bearer ${key}

Add as a tool in your Grok system prompt:
{
  "type": "function",
  "function": {
    "name": "query_memory",
    "description": "Query the user's personal memory palace stored in Unimatrix",
    "parameters": {
      "type": "object",
      "properties": {
        "query": { "type": "string" }
      },
      "required": ["query"]
    }
  }
}`,
  },
  {
    id: 'ollama',
    name: 'Ollama',
    icon: '🦙',
    description: 'Local LLM via MCP',
    color: '#A855F7',
    instructions: (key: string) => `For local models via Ollama + Open WebUI:

1. Install the MCP server:
   npm install -g @unimatrix/mcp-server

2. Add to your Open WebUI MCP config:
   UNIMATRIX_API_KEY=${key}
   UNIMATRIX_API_URL=${typeof window !== 'undefined' ? window.location.origin : 'https://unimatrix-flax.vercel.app'}/api

3. Or call the REST API directly from your Ollama system prompt context using the endpoints above.`,
  },
];

export default function OnboardingPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [selectedAI, setSelectedAI] = useState('claude-desktop');
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/apikeys');
      if (res.ok) setKeys(await res.json());
    } finally {
      // fetch complete
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewlyCreatedKey(data.key);
        setNewKeyName('');
        fetchKeys();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await fetch(`/api/apikeys/${id}`, { method: 'DELETE' });
      setKeys(keys.filter((k) => k.id !== id));
    } finally {
      setRevoking(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedAISystem = AI_SYSTEMS.find((a) => a.id === selectedAI)!;
  const activeKey = keys[0];
  const instructionText = activeKey
    ? selectedAISystem.instructions(activeKey.keyPrefix + '...')
    : selectedAISystem.instructions('YOUR_API_KEY_HERE');

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]">Connect Your AIs</h1>
          <p className="text-[#94A3B8] mt-1">
            Generate an API key and follow the setup guide for your AI of choice.
          </p>
        </div>

        {/* Step 1: API Keys */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-full bg-[#00F5FF] flex items-center justify-center text-[#0A0F1C] text-sm font-bold">1</div>
            <h2 className="text-lg font-semibold text-[#F1F5F9]">Generate an API Key</h2>
          </div>

          {/* New key shown once */}
          {newlyCreatedKey && (
            <div className="mb-4 p-4 bg-[#00F5FF]/5 border border-[#00F5FF]/30 rounded-xl">
              <p className="text-sm text-[#00F5FF] font-medium mb-2">
                ✅ Key created — copy it now, it won&apos;t be shown again
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-[#F1F5F9] bg-[#0A0F1C] px-3 py-2 rounded-lg break-all">
                  {newlyCreatedKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="px-3 py-2 bg-[#00F5FF]/10 hover:bg-[#00F5FF]/20 border border-[#00F5FF]/30 text-[#00F5FF] text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="mt-3 text-xs text-[#64748B] hover:text-[#94A3B8]"
              >
                I&apos;ve saved it — dismiss
              </button>
            </div>
          )}

          {/* Create form */}
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Claude Desktop, My ChatGPT"
              className="flex-1 px-4 py-2.5 bg-[#0A0F1C]/60 border border-[#334155]/50 rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#00F5FF]/50 focus:ring-1 focus:ring-[#00F5FF]/20 transition-colors text-sm"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newKeyName.trim()}
              className="px-5 py-2.5 bg-[#00F5FF] hover:bg-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1C] font-semibold rounded-lg text-sm transition-all"
            >
              {creating ? 'Creating…' : 'Create Key'}
            </button>
          </div>

          {/* Key list */}
          {keys.length > 0 ? (
            <div className="space-y-2">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between px-4 py-3 bg-[#0A0F1C]/40 border border-[#334155]/30 rounded-lg"
                >
                  <div>
                    <span className="text-sm font-medium text-[#F1F5F9]">{key.name}</span>
                    <span className="ml-3 text-xs font-mono text-[#64748B]">{key.keyPrefix}••••••••</span>
                    {key.lastUsed && (
                      <span className="ml-3 text-xs text-[#64748B]">
                        last used {new Date(key.lastUsed).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRevoke(key.id)}
                    disabled={revoking === key.id}
                    className="text-xs text-[#EF4444]/70 hover:text-[#EF4444] transition-colors disabled:opacity-50"
                  >
                    {revoking === key.id ? 'Revoking…' : 'Revoke'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#64748B]">No API keys yet — create one above.</p>
          )}
        </section>

        {/* Step 2: Choose AI */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-full bg-[#00F5FF] flex items-center justify-center text-[#0A0F1C] text-sm font-bold">2</div>
            <h2 className="text-lg font-semibold text-[#F1F5F9]">Choose Your AI</h2>
          </div>

          {/* AI selector tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {AI_SYSTEMS.map((ai) => (
              <button
                key={ai.id}
                onClick={() => setSelectedAI(ai.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  selectedAI === ai.id
                    ? 'bg-[#00F5FF]/10 border-[#00F5FF]/40 text-[#00F5FF]'
                    : 'bg-[#0A0F1C]/40 border-[#334155]/30 text-[#94A3B8] hover:border-[#334155]/60 hover:text-[#F1F5F9]'
                }`}
              >
                <span>{ai.icon}</span>
                <span>{ai.name}</span>
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F1F5F9]">{selectedAISystem.description}</p>
                {!activeKey && (
                  <p className="text-xs text-[#F59E0B] mt-1">
                    ⚠ Create an API key above to see your personalised config
                  </p>
                )}
              </div>
              <button
                onClick={() => copyToClipboard(instructionText)}
                className="px-3 py-1.5 text-xs bg-[#1F2937] hover:bg-[#2D3748] text-[#94A3B8] hover:text-[#F1F5F9] rounded-lg transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy all'}
              </button>
            </div>
            <pre className="p-4 bg-[#0A0F1C] border border-[#334155]/30 rounded-xl text-xs font-mono text-[#94A3B8] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {instructionText}
            </pre>
          </div>
        </section>

        {/* Step 3: Test */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#00F5FF] flex items-center justify-center text-[#0A0F1C] text-sm font-bold">3</div>
            <h2 className="text-lg font-semibold text-[#F1F5F9]">Test the Connection</h2>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4">
            After configuring your AI, ask it: <span className="text-[#F1F5F9] font-medium">&quot;What&apos;s in my Unimatrix memory palace?&quot;</span>
          </p>
          <div className="p-4 bg-[#0A0F1C]/40 border border-[#334155]/30 rounded-xl">
            <p className="text-xs text-[#64748B] font-mono">
              curl -H &quot;Authorization: Bearer {activeKey ? `${activeKey.keyPrefix}...` : 'YOUR_KEY'}&quot; \<br />
              &nbsp;&nbsp;{typeof window !== 'undefined' ? window.location.origin : 'https://unimatrix-flax.vercel.app'}/api/palaces
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
