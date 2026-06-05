'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
    icon: 'CD',
    description: 'Connect via MCP server',
    color: '#CC785C',
    instructions: (key: string) => `Claude Desktop requires a local stdio bridge (it cannot connect directly to remote URLs).

Add this to your config file:

macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
Windows: %APPDATA%\\Claude\\claude_desktop_config.json

Preferred (recommended):
{
  "mcpServers": {
    "unimatrix": {
      "command": "npx",
      "args": ["-y", "@unimatrix/mcp-server"],
      "env": {
        "UNIMATRIX_API_KEY": "${key}",
        "UNIMATRIX_API_URL": "${typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com'}/api"
      }
    }
  }
}

Fallback (always works if the package is not yet published):
{
  "mcpServers": {
    "unimatrix": {
      "command": "npx",
      "args": ["-y", "tsx", "github:tjpoisal/UNIMATRIX#packages/mcp-server/src/index.ts"],
      "env": {
        "UNIMATRIX_API_KEY": "${key}",
        "UNIMATRIX_API_URL": "${typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com'}/api"
      }
    }
  }
}

The dashboard always shows the current best command for you. The @unimatrix/mcp-server package will be the default once published.

Important: Add instructions in Claude's settings telling it to call unimatrix_list_palaces + search tools at the start of every new conversation. LLMs do not load memory automatically.`,
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: 'CC',
    description: 'Connect via CLI',
    color: '#CC785C',
    instructions: (key: string) => `Run this command in your terminal:

claude mcp add unimatrix \\
  --command "npx" \\
  --args "-y,@unimatrix/mcp-server" \\
  --env UNIMATRIX_API_KEY="${key}" \\
  --env UNIMATRIX_API_URL="${typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com'}/api"

Fallback (if package not yet published):
  --command "npx"
  --args "-y,tsx,github:tjpoisal/UNIMATRIX#packages/mcp-server/src/index.ts"

Then restart Claude Code and your memories will be available.`,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: 'GP',
    description: 'Connect via REST API',
    color: '#10A37F',
    instructions: (key: string) => `ChatGPT and Gemini do not support MCP natively.

Use the REST API instead:

Base URL: ${typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com'}/api
Authorization: Bearer ${key}

Key endpoints:
  GET  /palaces           — list workspaces
  GET  /memories          — list/search memories
  POST /memories          — store memory
  GET  /search?q=...      — full-text + semantic search

OpenAPI spec: ${typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com'}/api/openapi.json`,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: 'GM',
    description: 'Connect via REST API',
    color: '#4285F4',
    instructions: (key: string) => `Use the Unimatrix REST API with Gemini function calling.

Base URL: ${typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com'}/api
Authorization Header: Bearer ${key}

Example function declaration for Gemini:
{
  "name": "search_memories",
  "description": "Search the user's Unimatrix memory — returns relevant context from all AI sessions",
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

Base URL: ${typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com'}/api
Authorization: Bearer ${key}

Add as a tool in your Grok system prompt:
{
  "type": "function",
  "function": {
    "name": "query_memory",
    "description": "Query the user's persistent AI memory stored in Unimatrix",
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
    icon: 'OL',
    description: 'Local LLM via MCP',
    color: '#A855F7',
    instructions: (key: string) => `For local models via Ollama + Open WebUI:

1. Preferred:
   command: npx
   args: -y, @unimatrix/mcp-server

2. Fallback (package not published yet):
   command: npx
   args: -y, tsx, github:tjpoisal/UNIMATRIX#packages/mcp-server/src/index.ts

3. Set in your Open WebUI MCP config:
   UNIMATRIX_API_KEY=${key}
   UNIMATRIX_API_URL=${typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com'}/api

We will switch to the published package as soon as it is on npm.

Or call the REST API directly from your Ollama system prompt context using the endpoints above.`,
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

  // LLM Providers (for Unimatrix backend + agents)
  interface LLMProv { id: string; provider: string; model: string; label?: string | null; keyPrefix: string; createdAt: string; }
  const [llmProviders, setLlmProviders] = useState<LLMProv[]>([]);
  const [llmLoading, setLlmLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [llmForm, setLlmForm] = useState({ provider: '', model: '', apiKey: '' });

  // QR for mobile handoff (using one-time connect token for security)
  const [mobileQrDataUrl, setMobileQrDataUrl] = useState<string | null>(null);
  const [mobileDeepLink, setMobileDeepLink] = useState<string>('');
  const [mobileConnectToken, setMobileConnectToken] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/apikeys');
      if (res.ok) setKeys(await res.json());
    } finally {
      // fetch complete
    }
  }, []);

  const fetchLlmProviders = useCallback(async () => {
    setLlmLoading(true);
    try {
      const res = await fetch('/api/llm-providers');
      if (res.ok) {
        const data = await res.json();
        setLlmProviders(Array.isArray(data) ? data : []);
      }
    } finally {
      setLlmLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); fetchLlmProviders(); }, [fetchKeys, fetchLlmProviders]);

  // Desktop-only: fetch client config status for better UX in the installer
  const [desktopStatus, setDesktopStatus] = useState<any>(null);
  useEffect(() => {
    const bridge = (typeof window !== 'undefined' ? (window as any).electronBridge : null);
    if (bridge && bridge.getClientConfigStatus) {
      bridge.getClientConfigStatus().then(setDesktopStatus).catch(() => {});
    }
  }, []);

  // Generate one-time mobile connect token + QR (using connectToken instead of full key for security)
  useEffect(() => {
    const fullKey = newlyCreatedKey || (typeof window !== 'undefined' ? sessionStorage.getItem('lastFullUnimatrixKey') : null);
    if (fullKey) {
      const apiBase = (typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com') + '/api';

      // Fetch one-time connect token from backend (requires web session)
      fetch(`${apiBase}/auth/create-mobile-connect-token`, {
        method: 'POST',
        credentials: 'include',
      })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to create connect token'))
        .then(data => {
          const connectToken = data.connectToken;
          setMobileConnectToken(connectToken);
          const deepLink = `unimatrix://login?connectToken=${encodeURIComponent(connectToken)}`;
          setMobileDeepLink(deepLink);

          import('qrcode').then(({ default: QRCode }) => {
            QRCode.toDataURL(deepLink, {
              width: 200,
              margin: 1,
              color: {
                dark: '#00F5FF',
                light: '#0A0F1C'
              }
            }).then(setMobileQrDataUrl).catch(() => setMobileQrDataUrl(null));
          }).catch(() => setMobileQrDataUrl(null));
        })
        .catch(() => {
          // Fallback to key if token fetch fails (dev)
          const deepLink = `unimatrix://login?key=${encodeURIComponent(fullKey)}`;
          setMobileDeepLink(deepLink);
          import('qrcode').then(({ default: QRCode }) => {
            QRCode.toDataURL(deepLink, { width: 200 }).then(setMobileQrDataUrl).catch(() => {});
          });
        });
    }
  }, [newlyCreatedKey]);

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
        // Store full key temporarily in sessionStorage so the auto-install buttons in this session can use it (client-side only, cleared on tab close)
        if (typeof window !== 'undefined') {
          try { sessionStorage.setItem('lastFullUnimatrixKey', data.key); } catch {}
        }
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

  // Connect an LLM provider during onboarding (saves encrypted key server-side)
  const connectLlmProvider = async (providerId: string, model: string, apiKey: string) => {
    setConnectingProvider(providerId);
    try {
      const res = await fetch('/api/llm-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          model: model.trim(),
          apiKey: apiKey.trim() || (providerId === 'ollama' ? 'local' : ''),
          label: `Onboarding ${providerId}`,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to connect provider');
      }
      await fetchLlmProviders();
      setLlmForm({ provider: '', model: '', apiKey: '' });
      setConnectingProvider(null);
      return true;
    } catch (e: any) {
      alert(e.message || 'Failed to save LLM key');
      setConnectingProvider(null);
      return false;
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
          <div className="mt-3">
            <Link 
              href="/docs/mcp" 
              className="text-sm font-medium text-accent hover:text-accent/80 inline-flex items-center gap-1"
            >
              Full MCP tool reference &amp; schemas →
            </Link>
          </div>
          <div className="mt-2 text-xs text-amber-400/90">
            The exact current bridge installation command and config for Claude Desktop (and other clients) is shown below using your key. The public npx package may not yet be published — always use the instructions generated here.
          </div>
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
                Key created — copy it now, it won&apos;t be shown again
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

        {/* NEW: Collect LLM login info during onboarding so the installer can auto-config everything */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-full bg-[#00F5FF] flex items-center justify-center text-[#0A0F1C] text-sm font-bold">1.5</div>
            <h2 className="text-lg font-semibold text-[#F1F5F9]">Connect your LLMs (for Unimatrix intelligence + agents)</h2>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4">
            Paste your API keys for the models you actually use. Unimatrix will use them for smart features (Librarian, multi-agent collaboration, routing). Keys are AES-256 encrypted and never exposed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'claude', name: 'Claude (Anthropic)', placeholder: 'sk-ant-...', model: 'claude-sonnet-4-6' },
              { id: 'openai', name: 'OpenAI / GPT-4o', placeholder: 'sk-...', model: 'gpt-4o' },
              { id: 'gemini', name: 'Gemini', placeholder: 'AIza...', model: 'gemini-2.0-flash' },
              { id: 'groq', name: 'Groq (fast Llama/Mixtral)', placeholder: 'gsk_...', model: 'llama-3.3-70b-versatile' },
              { id: 'ollama', name: 'Ollama (local)', placeholder: 'No key — runs locally', model: 'llama3.2' },
            ].map((p) => {
              const isConnected = llmProviders.some((lp) => lp.provider === p.id);
              const isConnecting = connectingProvider === p.id;
              return (
                <div key={p.id} className="border border-[#334155]/30 rounded-xl p-4 bg-[#0A0F1C]/40">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-sm">{p.name}</div>
                    {isConnected && <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Connected</span>}
                  </div>

                  {!isConnected && (
                    <>
                      <input
                        type={p.id === 'ollama' ? 'text' : 'password'}
                        placeholder={p.placeholder}
                        value={llmForm.provider === p.id ? llmForm.apiKey : ''}
                        onChange={(e) => setLlmForm({ provider: p.id, model: p.model, apiKey: e.target.value })}
                        className="w-full mb-2 px-3 py-1.5 text-xs font-mono bg-[#0A0F1C] border border-[#334155] rounded text-[#F1F5F9]"
                      />
                      <button
                        onClick={() => connectLlmProvider(p.id, p.model, llmForm.apiKey)}
                        disabled={isConnecting || (p.id !== 'ollama' && !llmForm.apiKey)}
                        className="w-full text-xs py-1.5 rounded bg-[#00F5FF]/90 hover:bg-[#00F5FF] text-[#0A0F1C] font-semibold disabled:opacity-50"
                      >
                        {isConnecting ? 'Saving…' : `Connect ${p.name.split(' ')[0]}`}
                      </button>
                    </>
                  )}
                  {isConnected && <div className="text-[10px] text-[#64748B]">Saved securely. You can manage in Settings → Providers later.</div>}
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-[10px] text-[#64748B]">
            These keys power Unimatrix server features (smart auto-tagging, future agent collaboration using your own models). Separate from the client API keys above.
          </p>
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

        {/* NEW: One-click automatic setup using the installer (especially powerful in the Unimatrix Desktop app) */}
        <section className="backdrop-blur-xl bg-[#00F5FF]/5 border border-[#00F5FF]/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-[#00F5FF] flex items-center justify-center text-[#0A0F1C] text-sm font-bold">3</div>
            <h2 className="text-lg font-semibold text-[#F1F5F9]">One-click automatic setup (the easy installer)</h2>
          </div>

          <p className="text-sm text-[#94A3B8] mb-4">
            We collected your Unimatrix key + LLM logins above. Now let the installer do the boring work.
          </p>

          {/* Desktop status (only visible / functional when running the real desktop installer) */}
          {desktopStatus && (
            <div className="mb-4 text-xs p-2 bg-[#0A0F1C] border border-[#334155]/30 rounded">
              Desktop installer detected. Claude Desktop: <span className="font-mono">{desktopStatus.claudeDesktop?.status}</span> at {desktopStatus.claudeDesktop?.path?.split('/').slice(-3).join('/')}
            </div>
          )}
          {typeof window !== 'undefined' && (window as any).electronBridge?.getClientConfigStatus && !desktopStatus && (
            <div className="mb-4 text-xs p-2 bg-[#0A0F1C] border border-[#334155]/30 rounded">
              Running in Unimatrix Desktop — auto config enabled. The buttons below will actually write files on your machine.
            </div>
          )}

          <div className="space-y-3">
            {/* Auto Claude Desktop - the star feature */}
            <button
              onClick={async () => {
                const active = keys[0];
                if (!active && !newlyCreatedKey) {
                  alert('Create an Unimatrix API key first (Step 1).');
                  return;
                }
                const fullKey = newlyCreatedKey || (typeof window !== 'undefined' ? sessionStorage.getItem('lastFullUnimatrixKey') : null) || '';
                const keyForConfig = fullKey || (active ? active.keyPrefix + '...' : '');

                // If running inside the Unimatrix Desktop app (Electron)
                if (typeof window !== 'undefined' && (window as any).electronBridge?.configureClaudeDesktop) {
                  const apiUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com') + '/api';
                  const result = await (window as any).electronBridge.configureClaudeDesktop(
                    fullKey || 'YOUR_FULL_KEY_HERE',
                    apiUrl
                  );
                  if (result.success) {
                    alert('✅ Success! Claude Desktop has been automatically configured.\n\n' + (result.message || '') + '\nPath: ' + result.path);
                  } else {
                    alert('Auto-config failed: ' + result.error + '\n\n' + (result.hint || 'Use the manual instructions below.'));
                  }
                } else {
                  // Fallback: copy the best instructions (desktop app not detected)
                  const apiUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com') + '/api';
                  const cfg = `{
  "mcpServers": {
    "unimatrix": {
      "command": "npx",
      "args": ["-y", "@unimatrix/mcp-server"],
      "env": {
        "UNIMATRIX_API_KEY": "${fullKey || newlyCreatedKey || 'YOUR_KEY_HERE'}",
        "UNIMATRIX_API_URL": "${apiUrl}"
      }
    }
  }
}`;
                  navigator.clipboard.writeText(cfg);
                  alert('Config copied to clipboard. Paste it into your Claude Desktop config file (path shown in the instructions below). For true one-click magic, download and run the Unimatrix Desktop installer.');
                }
              }}
              className="w-full py-3 rounded-xl bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold text-sm flex items-center justify-center gap-2"
            >
              🚀 Auto-configure Claude Desktop now
              <span className="text-[10px] opacity-75">(best in the Unimatrix Desktop app)</span>
            </button>

            <div className="text-xs text-[#64748B]">
              When you run the official Unimatrix Desktop installer (built from apps/desktop), this button will silently update your Claude Desktop config, install the MCP bridge if needed, and wire up the LLM keys you provided for server-side smarts. Same flow works for Cursor, Windsurf, etc. in future versions.
            </div>

            {/* Mobile handoff - the "installer" for phones/tablets */}
            <div className="pt-4 border-t border-[#00F5FF]/20 mt-4">
              <div className="font-medium text-sm mb-2 text-[#F1F5F9]">For mobile devices (iOS / Android)</div>
              <ol className="text-xs text-[#94A3B8] space-y-1 list-decimal pl-4">
                <li>Install "Unimatrix" from the App Store or Google Play (or use Expo Go for testing with the scheme "unimatrix").</li>
                <li>Scan the QR below with your phone camera, or tap the deep link from a mobile browser. The app will auto-open.</li>
                <li>The mobile app will automatically exchange the one-time connect token (no full key exposed) for a secure device API key and log you in instantly.</li>
                <li><strong>Auto-magic (full installer mode):</strong> On first mobile connect it automatically creates:
  • "Mobile" palace + "This Mobile Device" location
  • Smart sub-locations: Quick Capture, Synced Context, Resilience & Alerts, ⭐ Pinned/Favorites
  • Per-LLM history locations (e.g. "Claude History") inside both the Mobile palace AND the top-level "LLM Histories" palace (provisioned on web connect)
  • Personalized welcome + LLM prompt example memories (using *your* actual connected providers like Claude/OpenAI)
  • Weather/resilience themed example content with real prompts
  Zero manual setup — the palace is productive the second you open the app.</li>
                <li>Your mobile app now has full access to all memories + the LLM providers (Claude etc.) you connected in this onboarding. Context flows everywhere.</li>
                <li><strong>Non-MCP LLMs too:</strong> Any LLM (Gemini, ChatGPT web/custom, Grok, agents) that you connected a key for during onboarding will participate in auto-organized history. When they (or your wrapper host) call the memory tools via the universal REST surface <code>POST /api/tools/call</code>, pass top-level <code>"sourceLlm": "gemini"</code> (see the live tool description from <code>GET /api/tools</code> for the exact system-prompt text to give the LLM). The server auto-tags + auto-files into the correct History location even if you omit location_id. The @unimatrix/llm package provides <code>prepareUnimatrixToolCall</code> for hosts.</li>
              </ol>
              <div className="mt-2 text-[10px] text-[#64748B]">
                No re-entering LLM keys on the phone — they are account-level and already saved. One-time connect token is used in the deep link/QR (more secure than exposing the full key).
              </div>

              {mobileQrDataUrl && (
                <div className="mt-4 p-4 bg-[#0A0F1C] border border-[#00F5FF]/20 rounded-xl text-center">
                  <p className="text-xs text-[#94A3B8] mb-2">Scan this QR with your phone's camera (or tap from mobile browser) — secure one-time token. The app will exchange it, log you in, and run **full auto-magic**: create "Mobile" palace + device-specific + smart locations + per-LLM History buckets (for MCP and non-MCP LLMs via sourceLlm) + personalized LLM prompt examples + welcome memories using your connected providers.</p>
                  <img src={mobileQrDataUrl} alt="Mobile deep link QR" className="mx-auto border border-[#00F5FF]/30 rounded" />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(mobileDeepLink);
                      alert('Deep link copied! On mobile, open it or scan the QR.');
                    }}
                    className="mt-3 text-xs px-3 py-1 bg-[#00F5FF]/10 text-[#00F5FF] rounded border border-[#00F5FF]/30"
                  >
                    Copy deep link instead
                  </button>
                  <p className="text-[10px] text-[#64748B] mt-1">Install the app first, then scan or tap the link from mobile browser.</p>
                </div>
              )}
            </div>

            {/* Self-host / full local installer — real when in desktop app */}
            <button
              onClick={async () => {
                const bridge = (typeof window !== 'undefined' ? (window as any).electronBridge : null);
                if (bridge && bridge.writeSelfhostEnv) {
                  // Pull the keys the user just connected in this onboarding flow
                  const llmMap: any = {};
                  llmProviders.forEach((p: any) => {
                    if (p.provider === 'claude') llmMap.anthropicKey = 'from-db'; // the bridge will fetch real encrypted values or we prompt user to paste again for local .env
                    // For full self-host we recommend the user re-enters or we expose a "download env with keys" endpoint that decrypts for the owner
                  });

                  // Simpler: for now ask for the critical ones or use what we have. In a real flow the desktop can call a secure "export my llm keys for selfhost" endpoint.
                  const result = await bridge.writeSelfhostEnv({
                    anthropicKey: prompt('Paste your Anthropic key for local server (or leave blank)') || '',
                    openaiKey: prompt('OpenAI key (optional)') || '',
                    googleKey: prompt('Google/Gemini key (optional)') || '',
                    groqKey: prompt('Groq key (optional)') || '',
                    voyageKey: prompt('Voyage AI key for embeddings (recommended)') || '',
                    masterKey: prompt('Master encryption key (openssl rand -hex 32) or leave for dev') || '',
                    unimatrixApiKey: newlyCreatedKey || (keys[0] ? 'create-fresh-in-dashboard' : ''),
                    apiUrl: (window.location.origin || 'http://localhost:3001') + '/api',
                    databaseUrl: 'postgresql://unimatrix:unimatrix@localhost:5432/unimatrix',
                  });
                  if (result.success) {
                    alert('✅ Self-host .env written to ' + result.path + '\n\n' + result.instructions);
                    if (bridge.showItemInFolder) bridge.showItemInFolder(result.path);
                  }
                } else {
                  alert('For the best self-host experience with all your LLM keys pre-filled into the .env, please use the official Unimatrix Desktop app (it has full local file system access). See LOCAL_SETUP.md for manual steps.');
                }
              }}
              className="w-full py-2.5 text-sm rounded-xl border border-[#00F5FF]/40 text-[#00F5FF] hover:bg-[#00F5FF]/10"
            >
              Install & run everything locally (self-host, LLM keys pre-filled in .env)
            </button>
          </div>
        </section>

        {/* Step 4: Test */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#00F5FF] flex items-center justify-center text-[#0A0F1C] text-sm font-bold">4</div>
            <h2 className="text-lg font-semibold text-[#F1F5F9]">Test the Connection</h2>
          </div>
          <p className="text-sm text-[#94A3B8] mb-4">
            After configuring your AI, ask it: <span className="text-[#F1F5F9] font-medium">&quot;What do you remember from my previous conversations?&quot;</span>
          </p>
          <div className="p-4 bg-[#0A0F1C]/40 border border-[#334155]/30 rounded-xl">
            <p className="text-xs text-[#64748B] font-mono">
              curl -H &quot;Authorization: Bearer {activeKey ? `${activeKey.keyPrefix}...` : 'YOUR_KEY'}&quot; \<br />
              &nbsp;&nbsp;{typeof window !== 'undefined' ? window.location.origin : 'https://deployunimatrix.com'}/api/palaces
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
