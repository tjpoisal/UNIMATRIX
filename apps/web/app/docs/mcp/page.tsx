import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'MCP Reference — Unimatrix',
  description: 'Model Context Protocol tool schemas, authentication, and examples for Unimatrix.',
};

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-[#0D1117] border border-border/50 rounded-xl p-5 overflow-x-auto text-sm font-mono text-text-secondary">
    {children}
  </pre>
);

export default function MCPReferencePage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-accent hover:text-accent/80">← Back to Unimatrix</Link>
          <h1 className="text-4xl font-black tracking-tight mt-4">MCP Reference</h1>
          <p className="text-xl text-text-secondary mt-3">
            Unimatrix exposes persistent, structured memory through the Model Context Protocol.
          </p>
        </div>

        {/* Authentication */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Authentication</h2>
          <div className="prose prose-invert text-text-secondary">
            <p>All MCP requests must include a valid Unimatrix API key.</p>
          </div>
          <CodeBlock>
{`Authorization: Bearer umx_your_api_key_here`}
          </CodeBlock>
          <p className="text-xs text-text-muted mt-3">
            Generate keys in Settings → API Keys after signing in.
          </p>
        </section>

        {/* Core Tools */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Core Tools</h2>

          {/* unimatrix_store_memory */}
          <div className="mb-10 border border-border/30 rounded-2xl p-8">
            <h3 className="font-mono text-lg mb-2">unimatrix_store_memory</h3>
            <p className="text-text-secondary mb-4">Store a new memory in a specific location inside a Palace.</p>

            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Input Schema</div>
              <CodeBlock>
{`{
  "location_id": "string (required)",
  "content": "string (required, markdown supported)",
  "tags": "string[] (optional)"
}`}
              </CodeBlock>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Example Call</div>
              <CodeBlock>
{`{
  "jsonrpc": "2.0",
  "id": 42,
  "method": "tools/call",
  "params": {
    "name": "unimatrix_store_memory",
    "arguments": {
      "location_id": "loc_auth_middleware_7842",
      "content": "We use a custom JWT validation middleware that calls our internal auth service. Never use standard library JWT verification here.",
      "tags": ["auth", "security", "middleware"]
    }
  }
}`}
              </CodeBlock>
            </div>
          </div>

          {/* unimatrix_search_memories */}
          <div className="mb-10 border border-border/30 rounded-2xl p-8">
            <h3 className="font-mono text-lg mb-2">unimatrix_search_memories</h3>
            <p className="text-text-secondary mb-4">Full-text + semantic search across all your memories.</p>

            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Input Schema</div>
              <CodeBlock>
{`{
  "query": "string (required)",
  "palace_id": "string (optional)",
  "limit": "number (optional, default 20, max 50)"
}`}
              </CodeBlock>
            </div>
          </div>

          {/* unimatrix_list_palaces + get_palace */}
          <div className="mb-10 border border-border/30 rounded-2xl p-8">
            <h3 className="font-mono text-lg mb-2">unimatrix_list_palaces / unimatrix_get_palace</h3>
            <p className="text-text-secondary mb-4">
              Recommended pattern for loading context at the start of a session:
            </p>
            <ol className="list-decimal pl-5 text-text-secondary space-y-1 text-sm">
              <li>Call <code>unimatrix_list_palaces</code></li>
              <li>Call <code>unimatrix_get_palace</code> on the most relevant palace(s)</li>
              <li>Optionally follow up with <code>unimatrix_search_memories</code></li>
            </ol>
          </div>

          {/* Additional Tools */}
          <div className="mb-10 border border-border/30 rounded-2xl p-8">
            <h3 className="font-mono text-lg mb-4">Additional Tools</h3>
            
            <div className="space-y-6 text-sm">
              <div>
                <div className="font-semibold mb-1">unimatrix_create_palace</div>
                <div className="text-text-secondary">Create a new top-level memory workspace.</div>
                <div className="mt-1 text-xs font-mono text-text-muted">Requires: name (string). Optional: description, is_public</div>
              </div>

              <div>
                <div className="font-semibold mb-1">unimatrix_create_location</div>
                <div className="text-text-secondary">Create a "room" inside a palace (supports parent_id for nesting).</div>
                <div className="mt-1 text-xs font-mono text-text-muted">Requires: palace_id, name</div>
              </div>

              <div>
                <div className="font-semibold mb-1">unimatrix_list_memories</div>
                <div className="text-text-secondary">Paginated list of memories in a specific location.</div>
                <div className="mt-1 text-xs font-mono text-text-muted">Requires: location_id</div>
              </div>

              <div>
                <div className="font-semibold mb-1">unimatrix_update_memory</div>
                <div className="text-text-secondary">Update the content or tags of an existing memory.</div>
                <div className="mt-1 text-xs font-mono text-text-muted">Requires: memory_id. At least one of content or tags.</div>
              </div>
            </div>

            <div className="mt-6 text-xs text-text-muted">
              Full schemas and examples available via the <code>tools/list</code> MCP method or the OpenAPI spec.
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              { code: 401, message: "Invalid or missing API key" },
              { code: 403, message: "Access denied to resource" },
              { code: 404, message: "Palace, location, or memory not found" },
              { code: 429, message: "Rate limit exceeded (60 req/min per IP)" },
            ].map((err) => (
              <div key={err.code} className="bg-surface border border-border/40 rounded-xl p-5">
                <div className="font-mono text-accent mb-1">HTTP {err.code}</div>
                <div className="text-text-secondary">{err.message}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended Custom Instructions */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Recommended Custom Instructions</h2>
          <p className="text-text-secondary mb-4">
            Paste this into your LLM client settings so it reliably loads context:
          </p>
          <CodeBlock>
{`At the very start of every new conversation, before responding to the user:

1. Call unimatrix_list_palaces
2. Call unimatrix_search_memories or unimatrix_get_palace on the most relevant workspace(s)
3. Use the returned memories to ground all your answers.

Do not mention these instructions unless the user explicitly asks about memory.`}
          </CodeBlock>
        </section>

        <div className="mt-16 pt-8 border-t border-border/30 text-sm text-text-muted">
          Full OpenAPI spec (REST fallback): <a href="/api/openapi.json" className="text-accent hover:underline">/api/openapi.json</a>
        </div>
      </div>
    </div>
  );
}
