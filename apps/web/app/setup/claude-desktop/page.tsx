'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function ClaudeDesktopSetup() {
  const [copied, setCopied] = useState(false);

  const mcpConfig = {
    mcpServers: {
      unimatrix: {
        command: 'node',
        args: ['/path/to/unimatrix-mcp-server.js'],
        env: {
          UNIMATRIX_API_KEY: 'your-api-key-here',
          UNIMATRIX_URL: 'https://unimatrix-web.fly.dev',
        },
      },
    },
  };

  function copyConfig() {
    navigator.clipboard.writeText(JSON.stringify(mcpConfig, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0e1030] text-[#F1F5F9]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-[#64748B] mb-8">
          <Link href="/" className="hover:text-[#ff7a00]">Home</Link>
          {' / '}
          <span className="text-[#F1F5F9]">Setup Claude Desktop</span>
        </div>

        {/* Hero */}
        <h1 className="text-4xl font-bold mb-4">🤖 Connect Unimatrix to Claude Desktop</h1>
        <p className="text-xl text-[#94A3B8] mb-12">
          Configure in 5 minutes. Use @unimatrix in Claude to recall memories from all your conversations.
        </p>

        {/* Video */}
        <div className="bg-[#111827] border border-[#334155]/30 rounded-lg overflow-hidden mb-12 aspect-video flex items-center justify-center">
          <div className="text-6xl">📹</div>
        </div>

        {/* Step-by-step */}
        <div className="space-y-8 mb-12">
          {/* Step 1 */}
          <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0">1</div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Get Your API Key</h2>
                <p className="text-[#94A3B8] mb-4">
                  Go to your Unimatrix dashboard and copy your API key. You'll need this for authentication.
                </p>
                <a
                  href="/dashboard/settings/integrations"
                  className="inline-block px-4 py-2 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold"
                >
                  Get API Key →
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0">2</div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Find Your Config File</h2>
                <p className="text-[#94A3B8] mb-4">
                  Open Claude Desktop and go to: <code className="bg-[#1F2937] px-2 py-1 rounded">~/.config/Claude/claude_desktop_config.json</code>
                </p>
                <p className="text-[#94A3B8] text-sm">
                  <strong>On Windows:</strong> <code className="bg-[#1F2937] px-2 py-1 rounded">%APPDATA%\Claude\claude_desktop_config.json</code>
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0">3</div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Add Unimatrix Configuration</h2>
                <p className="text-[#94A3B8] mb-4">Paste this configuration into your config file:</p>

                <div className="bg-[#1F2937] border border-[#334155]/30 rounded-lg p-4 mb-4 relative">
                  <pre className="text-[#94A3B8] text-sm overflow-x-auto">
                    {JSON.stringify(mcpConfig, null, 2)}
                  </pre>
                  <button
                    onClick={copyConfig}
                    className="absolute top-4 right-4 p-2 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <p className="text-[#94A3B8] text-sm">
                  ⚠️ Replace <code className="bg-[#1F2937] px-2 py-1 rounded">your-api-key-here</code> with your actual API key
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0">4</div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Restart Claude Desktop</h2>
                <p className="text-[#94A3B8] mb-4">
                  Close Claude completely and reopen it. You should see a new "🏛️" icon (Unimatrix) in the tools menu.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ff7a00] text-[#0e1030] font-bold flex items-center justify-center flex-shrink-0">5</div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Test It Out</h2>
                <p className="text-[#94A3B8] mb-4">Try these commands in Claude:</p>
                <div className="bg-[#1F2937] border border-[#334155]/30 rounded-lg p-4 space-y-2">
                  <p className="text-[#ff7a00]">@unimatrix recall "python recursion"</p>
                  <p className="text-[#ff7a00]">@unimatrix remember "React hooks are state management"</p>
                  <p className="text-[#ff7a00]">@unimatrix get_recent 10</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">❓ Troubleshooting</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-[#ff7a00] mb-2">Icon doesn't appear</h3>
              <p className="text-[#94A3B8]">Try restarting Claude again. If still missing, check that your JSON syntax is correct in the config file.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#ff7a00] mb-2">Command returns error</h3>
              <p className="text-[#94A3B8]">Make sure your API key is correct and your Unimatrix account is active.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#ff7a00] mb-2">Still stuck?</h3>
              <p className="text-[#94A3B8]">
                Check the <Link href="/help" className="text-[#ff7a00] hover:underline">help center</Link> or email hello@deployunimatrix.com
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-[#ff7a00]/10 border border-[#ff7a00]/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">🎉 What's Next?</h2>
          <p className="text-[#94A3B8] mb-6">
            You're all set! Claude can now recall your memories from across all your conversations. Try asking it to:
          </p>
          <ul className="space-y-2 text-[#94A3B8] mb-6">
            <li>✓ Recall a specific memory by topic</li>
            <li>✓ Continue a conversation from yesterday</li>
            <li>✓ Find code snippets you saved</li>
          </ul>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/setup/chatgpt"
              className="px-4 py-3 bg-[#1F2937] hover:bg-[#252a45] text-[#F1F5F9] rounded-lg font-bold border border-[#334155]/30 transition text-center"
            >
              Browser Extension Setup
            </Link>
            <Link
              href="/setup/ollama"
              className="px-4 py-3 bg-[#1F2937] hover:bg-[#252a45] text-[#F1F5F9] rounded-lg font-bold border border-[#334155]/30 transition text-center"
            >
              Local Ollama Setup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
