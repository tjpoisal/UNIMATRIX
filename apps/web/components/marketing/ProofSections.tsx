'use client';

import React from 'react';
import Link from 'next/link';

/* eslint-disable react/no-unescaped-entities -- illustrative terminal/code examples and marketing copy contain quotes/apostrophes for realism and readability */

interface ProofSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ProofCard = ({ title, description, children }: ProofSectionProps) => (
  <div className="bg-surface border border-border/40 rounded-2xl p-8 mb-8">
    <div className="mb-6">
      <h3 className="text-2xl font-bold text-text mb-2">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
    {children}
  </div>
);

export function CrossClientMemoryDemo() {
  return (
    <ProofCard
      title="Cross-Client Memory in Action"
      description="The same memory is readable and writable from different MCP clients without any per-client code."
    >
      <div className="space-y-6">
        {/* Step 1 - Cursor */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <div className="bg-[#111827] px-4 py-2 flex items-center gap-2 border-b border-border/50">
            <div className="text-xs font-medium">Cursor</div>
            <div className="text-[10px] text-text-muted">10:14 AM</div>
          </div>
          <div className="p-5 font-mono text-sm bg-[#0D1117]">
            <div className="text-text-secondary">
              User: &quot;Remember that we&apos;re using a custom auth middleware that validates JWTs against our internal service.&quot;<br /><br />
              <span className="text-[#22C55E]">→ Cursor called: unimatrix_store_memory</span><br />
              location_id: &quot;loc_proj_auth_7842&quot;<br />
              content: &quot;Custom JWT validation middleware against internal auth service...&quot;<br />
              tags: [&quot;auth&quot;, &quot;middleware&quot;, &quot;security&quot;]
            </div>
          </div>
          <div className="bg-[#111827] px-4 py-1.5 text-[10px] text-text-muted border-t border-border/50">
            Screenshot placeholder — Real Cursor session storing context
          </div>
        </div>

        {/* Step 2 - Claude Desktop */}
        <div className="border border-border/50 rounded-xl overflow-hidden">
          <div className="bg-[#111827] px-4 py-2 flex items-center gap-2 border-b border-border/50">
            <div className="text-xs font-medium">Claude Desktop</div>
            <div className="text-[10px] text-text-muted">2:47 PM (same day)</div>
          </div>
          <div className="p-5 font-mono text-sm bg-[#0D1117]">
            <div className="text-text-secondary">
              User: &quot;What&apos;s our current approach to authentication?&quot;<br /><br />
              <span className="text-[#22C55E]">→ Context auto-loaded from Unimatrix via custom instructions</span><br /><br />
              Claude: &quot;You&apos;re using a custom JWT validation middleware... (pulled from Palace &apos;Project Phoenix&apos;)&quot;
            </div>
          </div>
          <div className="bg-[#111827] px-4 py-1.5 text-[10px] text-text-muted border-t border-border/50">
            Screenshot placeholder — Claude Desktop loading cross-client memory
          </div>
        </div>

        <div className="text-xs text-text-muted pt-2 border-t border-border/30">
          No copy-paste. No per-client sync. One source of truth.
        </div>
      </div>
    </ProofCard>
  );
}

export function MCPArchitectureDiagram() {
  return (
    <ProofCard
      title="MCP Architecture"
      description="Unimatrix acts as a standard MCP server. Clients connect either directly (HTTP) or via a lightweight local bridge (for stdio-only clients like Claude Desktop)."
    >
      <div className="border border-border/40 rounded-xl overflow-hidden">
        <div className="bg-[#0D1117] p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* Clients */}
            <div>
              <div className="text-accent font-semibold mb-3 tracking-wider text-xs">MCP CLIENTS</div>
              <div className="space-y-2 text-text-secondary">
                <div>• Claude Desktop (via local stdio bridge)</div>
                <div>• Cursor / Windsurf (direct streamable-http)</div>
                <div>• Zed (experimental)</div>
                <div>• Custom agents (HTTP + REST)</div>
              </div>
            </div>

            {/* Transport Layer */}
            <div>
              <div className="text-accent font-semibold mb-3 tracking-wider text-xs">TRANSPORT</div>
              <div className="space-y-3 text-text-secondary">
                <div>
                  <span className="font-medium text-text">Local Bridge</span><br />
                  <span className="text-xs">npx @unimatrix/mcp-server</span>
                </div>
                <div>
                  <span className="font-medium text-text">Direct HTTP</span><br />
                  <span className="text-xs">https://deployunimatrix.com/api/mcp</span>
                </div>
              </div>
            </div>

            {/* Backend */}
            <div>
              <div className="text-accent font-semibold mb-3 tracking-wider text-xs">BACKEND</div>
              <div className="space-y-2 text-text-secondary text-sm">
                <div>• Hierarchical (Palaces → Locations)</div>
                <div>• AES-256-GCM at rest</div>
                <div>• Postgres + pgvector</div>
                <div>• Full per-account audit logs</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#111827] px-4 py-2 text-[10px] text-text-muted border-t border-border/50">
          Diagram placeholder — Replace with clean architecture illustration in Figma / screenshots
        </div>
      </div>

      <div className="mt-6 text-xs text-text-muted">
        Self-host option: Run the entire stack with Docker + PostgreSQL.
      </div>
    </ProofCard>
  );
}

export function RealWorldWorkflowExample() {
  return (
    <ProofCard
      title="Real-World Workflow Example"
      description="How a developer actually uses Unimatrix across a full day."
    >
      <div className="space-y-5 text-sm">
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
          <div>
            <div className="font-medium text-text">9:30 AM — Cursor</div>
            <div className="text-text-secondary mt-1">
              Exploring legacy service. Ask Cursor to store key invariants in &quot;Legacy Migration&quot; Palace.
            </div>
            <div className="mt-2 text-[10px] bg-[#111827] border border-border/50 px-2 py-1 rounded text-text-muted inline-block">
              Screenshot placeholder: Cursor storing context
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
          <div>
            <div className="font-medium text-text">2:15 PM — Claude Desktop</div>
            <div className="text-text-secondary mt-1">
              New chat. Custom instructions trigger <code>unimatrix_list_palaces</code> + <code>unimatrix_get_palace</code>. Full context loads automatically.
            </div>
            <div className="mt-2 text-[10px] bg-[#111827] border border-border/50 px-2 py-1 rounded text-text-muted inline-block">
              Screenshot placeholder: Claude Desktop with loaded memory
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
          <div>
            <div className="font-medium text-text">Evening — Custom Agent</div>
            <div className="text-text-secondary mt-1">
              Overnight agent writes findings via REST API into the same Palace. Next morning both tools see the updates.
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30 text-xs text-text-muted">
          All clients share the same structured memory.
        </div>
      </div>
    </ProofCard>
  );
}

// Convenience wrapper for the landing page
export function ProofOfReality() {
  return (
    <section id="proof" className="py-16 px-6 border-t border-border/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full text-xs text-accent font-medium mb-4 tracking-wide">
            PROOF IT WORKS
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">See how it actually behaves</h2>
          <p className="text-text-secondary mt-3 max-w-md mx-auto">
            Real usage patterns from developers who ship with multiple AI tools every day.
          </p>
        </div>

        <CrossClientMemoryDemo />
        <MCPArchitectureDiagram />
        <RealWorldWorkflowExample />

        <div className="text-center mt-8">
          <Link 
            href="/onboarding" 
            className="inline-flex items-center text-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            Start with the correct setup for your tools →
          </Link>
        </div>
      </div>
    </section>
  );
}
