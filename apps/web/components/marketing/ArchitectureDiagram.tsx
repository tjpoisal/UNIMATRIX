'use client';

import React from 'react';

interface ArchitectureDiagramProps {
  className?: string;
  showSelfHost?: boolean;
}

/**
 * Production-grade, Figma-style clean architecture diagram using SVG for visual clarity.
 * Matches the site's dark theme and accent colors.
 */
export function ArchitectureDiagram({ className = '', showSelfHost = true }: ArchitectureDiagramProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="bg-[#0D1117] border border-border/40 rounded-2xl p-4 overflow-hidden">
        <svg viewBox="0 0 900 420" className="w-full h-auto" aria-label="Unimatrix Architecture Diagram">
          <defs>
            <linearGradient id="clientGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <linearGradient id="apiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0A0F1C" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>

          {/* Background layers */}
          <rect x="20" y="20" width="860" height="380" rx="12" fill="#0A0F1C" stroke="#334155" strokeWidth="1" />

          {/* Section labels */}
          <text x="40" y="45" fill="#64748B" fontSize="11" fontWeight="600" letterSpacing="1">MCP CLIENTS</text>
          <text x="40" y="145" fill="#64748B" fontSize="11" fontWeight="600" letterSpacing="1">TRANSPORT LAYER</text>
          <text x="40" y="225" fill="#64748B" fontSize="11" fontWeight="600" letterSpacing="1">UNIMATRIX API</text>
          <text x="40" y="315" fill="#64748B" fontSize="11" fontWeight="600" letterSpacing="1">STORAGE &amp; PROCESSING</text>

          {/* Clients row */}
          {/* Claude */}
          <g>
            <rect x="40" y="55" width="190" height="70" rx="8" fill="url(#clientGrad)" stroke="#475569" strokeWidth="1" />
            <text x="55" y="80" fill="#F1F5F9" fontSize="13" fontWeight="600">Claude Desktop</text>
            <text x="55" y="97" fill="#94A3B8" fontSize="10">stdio bridge (local npx/tsx)</text>
            <text x="55" y="110" fill="#64748B" fontSize="9">No local persistence</text>
          </g>

          {/* Cursor */}
          <g>
            <rect x="250" y="55" width="190" height="70" rx="8" fill="url(#clientGrad)" stroke="#475569" strokeWidth="1" />
            <text x="265" y="80" fill="#F1F5F9" fontSize="13" fontWeight="600">Cursor</text>
            <text x="265" y="97" fill="#94A3B8" fontSize="10">streamable-http direct</text>
            <text x="265" y="110" fill="#64748B" fontSize="9">Authorization: Bearer</text>
          </g>

          {/* Windsurf */}
          <g>
            <rect x="460" y="55" width="190" height="70" rx="8" fill="url(#clientGrad)" stroke="#475569" strokeWidth="1" />
            <text x="475" y="80" fill="#F1F5F9" fontSize="13" fontWeight="600">Windsurf</text>
            <text x="475" y="97" fill="#94A3B8" fontSize="10">streamable-http direct</text>
            <text x="475" y="110" fill="#64748B" fontSize="9">Same MCP surface</text>
          </g>

          {/* Custom */}
          <g>
            <rect x="670" y="55" width="190" height="70" rx="8" fill="url(#clientGrad)" stroke="#475569" strokeWidth="1" />
            <text x="685" y="80" fill="#F1F5F9" fontSize="13" fontWeight="600">Custom Agents</text>
            <text x="685" y="97" fill="#94A3B8" fontSize="10">HTTP / REST / MCP</text>
            <text x="685" y="110" fill="#64748B" fontSize="9">/api/tools or full MCP</text>
          </g>

          {/* Arrows down to transport */}
          <g stroke="#64748B" strokeWidth="1.5" fill="none">
            <path d="M135 125 L135 140" />
            <path d="M345 125 L345 140" />
            <path d="M555 125 L555 140" />
            <path d="M765 125 L765 140" />
          </g>

          {/* Transport boxes */}
          <g>
            <rect x="40" y="150" width="400" height="55" rx="8" fill="#111827" stroke="#475569" strokeWidth="1" />
            <text x="55" y="170" fill="#F1F5F9" fontSize="12" fontWeight="600">Local Stdio Bridge (for Claude etc.)</text>
            <text x="55" y="187" fill="#94A3B8" fontSize="10">Current: npx tsx github:...  |  Future: npx @unimatrix/mcp-server</text>
          </g>

          <g>
            <rect x="460" y="150" width="400" height="55" rx="8" fill="#111827" stroke="#475569" strokeWidth="1" />
            <text x="475" y="170" fill="#F1F5F9" fontSize="12" fontWeight="600">Direct Streamable HTTP</text>
            <text x="475" y="187" fill="#94A3B8" fontSize="10">https://deployunimatrix.com/api/mcp   •   Bearer token</text>
          </g>

          {/* Arrow to API */}
          <g stroke="#64748B" strokeWidth="1.5" fill="none">
            <path d="M450 205 L450 220" />
          </g>

          {/* API Layer */}
          <g>
            <rect x="40" y="230" width="820" height="70" rx="10" fill="url(#apiGrad)" stroke="#00F5FF" strokeWidth="1.5" />
            <text x="55" y="252" fill="#00F5FF" fontSize="12" fontWeight="700">UNIMATRIX API — Fastify + Clerk Auth + Full Audit</text>
            
            <text x="55" y="272" fill="#CBD5E1" fontSize="10">MCP: tools/list + tools/call (unimatrix_list_palaces, store_memory, get_palace, search_memories...)</text>
            <text x="55" y="287" fill="#94A3B8" fontSize="10">REST fallback: /palaces • /memories • /search • /tools • Injection guard • PII redaction • Rate limit</text>
          </g>

          {/* Arrow to storage */}
          <g stroke="#64748B" strokeWidth="1.5" fill="none">
            <path d="M450 300 L450 315" />
          </g>

          {/* Storage + Processing */}
          <g>
            <rect x="40" y="320" width="390" height="70" rx="8" fill="#111827" stroke="#475569" strokeWidth="1" />
            <text x="55" y="340" fill="#F1F5F9" fontSize="11" fontWeight="600">STORAGE (encrypted)</text>
            <text x="55" y="355" fill="#94A3B8" fontSize="9">Neon Postgres + pgvector • AES-256-GCM (per-ciphertext scrypt salt)</text>
            <text x="55" y="368" fill="#64748B" fontSize="9">Palaces → nested Locations → Memories • Full per-account audit log</text>
          </g>

          <g>
            <rect x="450" y="320" width="390" height="70" rx="8" fill="#111827" stroke="#475569" strokeWidth="1" />
            <text x="465" y="340" fill="#F1F5F9" fontSize="11" fontWeight="600">PROCESSING (sanitized path only)</text>
            <text x="465" y="355" fill="#94A3B8" fontSize="9">Voyage embeddings on redacted content only</text>
            <text x="465" y="368" fill="#64748B" fontSize="9">Optional Librarian (small LLM) for tags • Verbatim never sent to classification</text>
          </g>
        </svg>

        {showSelfHost && (
          <div className="mt-3 px-2 text-xs text-text-muted border-t border-border/30 pt-3">
            <span className="font-medium text-text">Self-host:</span> Full stack available in the repo (Fastify + Postgres 15+ + pgvector). You control the MASTER_ENCRYPTION_KEY. Supply Clerk + Voyage for parity.
          </div>
        )}
      </div>
    </div>
  );
}
