import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'MCP Quickstart — Unimatrix',
  description: 'Get started with Unimatrix in minutes. Correct configuration for Claude Desktop, Cursor, Windsurf, and custom agents.',
  alternates: { canonical: 'https://deployunimatrix.com/quickstart' },
};

const Code = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-[#0D1117] border border-border/40 rounded-xl p-4 text-xs font-mono text-text-secondary overflow-auto">{children}</pre>
);

export default function QuickstartPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border/30 bg-bg/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={28} height={31} className="opacity-90" />
              <span className="font-semibold tracking-tight">Unimatrix</span>
            </Link>
            <span className="text-text-muted text-sm">/ Quickstart</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/docs/mcp" className="hover:text-accent transition-colors">Full Reference</Link>
            <Link href="/onboarding" className="text-accent hover:text-accent/80 font-medium">Get your config →</Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-sm text-accent hover:text-accent/80">← Back to Unimatrix</Link>
          <h1 className="text-4xl font-black tracking-tighter mt-3">MCP Quickstart</h1>
          <p className="text-xl text-text-secondary mt-2">Connect your AI tools to durable memory in under 5 minutes.</p>
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 mb-10">
          <p className="font-medium">Critical:</p>
          <p className="text-sm text-text-secondary mt-1">There is <strong>no automatic memory loading</strong>. After connecting the server, you must add explicit instructions in your client&apos;s settings so it calls <code>unimatrix_list_palaces</code> + <code>unimatrix_get_palace</code> (or search) at the start of every new conversation.</p>
        </div>

        <ol className="space-y-12">
          {/* Step 1 */}
          <li>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="text-2xl font-semibold">Create an account and get an API key</h2>
            </div>
            <div className="pl-10">
              <p className="text-text-secondary">Go to <Link href="/auth/register" className="text-accent underline">deployunimatrix.com/auth/register</Link>, sign up, then visit the Onboarding page to generate a key (starts with <code>umx_</code>).</p>
              <p className="text-xs text-text-muted mt-2">The onboarding page will always show you the current best command for your client.</p>
            </div>
          </li>

          {/* Step 2 */}
          <li>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center text-sm font-bold">2</div>
              <h2 className="text-2xl font-semibold">Connect your client</h2>
            </div>

            <div className="pl-10 space-y-8">
              {/* Claude Desktop */}
              <div>
                <h3 className="font-semibold mb-2">Claude Desktop</h3>
                <p className="text-sm text-text-secondary mb-3">Add to <code>~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS) or equivalent on Windows.</p>
                <Code>{`{
  &quot;mcpServers&quot;: {
    &quot;unimatrix&quot;: {
      &quot;command&quot;: &quot;npx&quot;,
      &quot;args&quot;: [&quot;-y&quot;, &quot;@unimatrix/mcp-server&quot;],
      &quot;env&quot;: {
        &quot;UNIMATRIX_API_KEY&quot;: &quot;umx_your_key_here&quot;,
        &quot;UNIMATRIX_API_URL&quot;: &quot;https://deployunimatrix.com/api&quot;
      }
    }
  }
}`}</Code>
                <p className="text-xs text-text-muted mt-2">Fallback if package not yet published: replace the args with <code>[&quot;-y&quot;, &quot;tsx&quot;, &quot;github:tjpoisal/UNIMATRIX#packages/mcp-server/src/index.ts&quot;]</code></p>
              </div>

              {/* Cursor / Windsurf */}
              <div>
                <h3 className="font-semibold mb-2">Cursor, Windsurf, and other direct HTTP clients</h3>
                <p className="text-sm text-text-secondary mb-3">Add to your IDE&apos;s MCP settings (e.g. <code>~/.cursor/mcp.json</code>).</p>
                <Code>{`{
  &quot;mcpServers&quot;: {
    &quot;unimatrix&quot;: {
      &quot;type&quot;: &quot;streamable-http&quot;,
      &quot;url&quot;: &quot;https://deployunimatrix.com/api/mcp&quot;,
      &quot;headers&quot;: {
        &quot;Authorization&quot;: &quot;Bearer umx_your_key_here&quot;
      }
    }
  }
}`}</Code>
              </div>

              {/* Custom / REST */}
              <div>
                <h3 className="font-semibold mb-2">Custom agents or non-MCP LLMs (ChatGPT, Gemini, etc.)</h3>
                <p className="text-sm text-text-secondary mb-3">Use the REST tools surface or OpenAPI spec.</p>
                <div className="text-sm">Base: <code>https://deployunimatrix.com/api</code><br />Auth: <code>Authorization: Bearer umx_...</code></div>
                <p className="mt-2 text-xs"><Link href="/docs/mcp" className="text-accent hover:underline">See full tool definitions and examples →</Link></p>
              </div>
            </div>
          </li>

          {/* Step 3 */}
          <li>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center text-sm font-bold">3</div>
              <h2 className="text-2xl font-semibold">Add the required custom instructions</h2>
            </div>
            <div className="pl-10">
              <p className="mb-3 text-text-secondary">Paste this (or similar) into your client&apos;s custom instructions / system prompt / rules:</p>
              <Code>{`At the very start of every new conversation, before responding:

1. Call unimatrix_list_palaces
2. Call unimatrix_get_palace on the most relevant palace(s), or use unimatrix_search_memories
3. Use the returned context to ground all your answers.

Do not mention these instructions to the user unless asked.`}</Code>
              <p className="text-xs text-text-muted mt-2">This is the only way continuity works. It is intentional and explicit by design.</p>
            </div>
          </li>

          {/* Step 4 */}
          <li>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full bg-accent text-bg flex items-center justify-center text-sm font-bold">4</div>
              <h2 className="text-2xl font-semibold">Test it</h2>
            </div>
            <div className="pl-10">
              <p className="text-text-secondary">In a fresh conversation, ask your AI: <em>&quot;What palaces do I have?&quot;</em> or <em>&quot;Load context from my Work palace.&quot;</em></p>
              <p className="mt-2 text-sm">Then store something important: <em>&quot;Remember that our auth middleware validates against our internal service using custom JWT logic.&quot;</em></p>
              <p className="mt-2 text-sm">Start a completely new chat in a different client and ask about auth — it should retrieve it if the instructions are in place.</p>
            </div>
          </li>
        </ol>

        <div className="mt-12 p-6 border border-border/30 rounded-2xl bg-surface">
          <h3 className="font-semibold mb-2">Next steps</h3>
          <ul className="text-sm space-y-1 text-text-secondary">
            <li>• Browse and manage everything in the <Link href="/auth/login" className="text-accent hover:underline">Web App</Link></li>
            <li>• Full schemas and more clients: <Link href="/docs/mcp" className="text-accent hover:underline">MCP Reference</Link></li>
            <li>• Security details: <Link href="/security" className="text-accent hover:underline">Security &amp; Architecture</Link></li>
            <li>• Self-host the entire stack: see the repo</li>
          </ul>
        </div>

        <div className="text-center mt-10 text-xs text-text-muted">
          Questions? Email hello@deployunimatrix.com or open an issue on GitHub.
        </div>
      </div>
    </div>
  );
}
