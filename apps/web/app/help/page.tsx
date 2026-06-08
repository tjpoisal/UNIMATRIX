'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const helpCategories = [
  {
    title: 'Getting Started',
    icon: '🚀',
    articles: [
      { title: 'What is Unimatrix?', slug: 'what-is-unimatrix', views: 1200 },
      { title: 'Set up your encryption password', slug: 'encryption-password', views: 850 },
      { title: 'Save your first memory', slug: 'first-memory', views: 920 },
      { title: 'Understand contexts', slug: 'contexts', views: 650 },
    ],
  },
  {
    title: 'Integrations',
    icon: '🔗',
    articles: [
      { title: 'Install browser extension', slug: 'browser-extension', views: 2100 },
      { title: 'Configure Claude Desktop (MCP)', slug: 'claude-desktop', views: 1800 },
      { title: 'Set up Ollama locally', slug: 'ollama', views: 450 },
      { title: 'All supported LLMs', slug: 'llm-list', views: 760 },
    ],
  },
  {
    title: 'Privacy & Security',
    icon: '🔐',
    articles: [
      { title: 'How encryption works', slug: 'encryption-explained', views: 1100 },
      { title: 'Is my data safe?', slug: 'data-safety', views: 980 },
      { title: 'Can you read my memories?', slug: 'server-blind', views: 750 },
      { title: 'Password recovery', slug: 'password-recovery', views: 320 },
    ],
  },
  {
    title: 'Features',
    icon: '✨',
    articles: [
      { title: 'Cross-LLM continuity explained', slug: 'cross-llm', views: 890 },
      { title: 'Searching your memories', slug: 'search', views: 680 },
      { title: 'Organizing with contexts', slug: 'context-management', views: 540 },
      { title: 'Importance levels', slug: 'importance', views: 310 },
    ],
  },
  {
    title: 'Troubleshooting',
    icon: '🔧',
    articles: [
      { title: 'Extension button not appearing', slug: 'extension-not-showing', views: 620 },
      { title: 'MCP not working in Claude', slug: 'mcp-issues', views: 480 },
      { title: 'Memory not saving', slug: 'save-issues', views: 390 },
      { title: 'Sync not working', slug: 'sync-issues', views: 270 },
    ],
  },
];

const faqItems = [
  {
    q: "Can I decrypt my memories if I forget my password?",
    a: "No. Your password is not stored anywhere—not even encrypted. If you forget it, your memories remain encrypted forever. Always save your password in a password manager.",
  },
  {
    q: "Does Unimatrix collect my memory data?",
    a: "No. Your server stores ciphertext only. We cannot read your memories even if we wanted to. Everything is encrypted client-side before transmission.",
  },
  {
    q: "Can I use Unimatrix with local LLMs like Ollama?",
    a: "Yes! Ollama integration is available. Set it up in your dashboard settings. Memories are stored locally and synced to the cloud when online.",
  },
  {
    q: "What happens if I want to switch LLMs?",
    a: "All your memories follow you. Switch from ChatGPT to Claude to Gemini anytime. Every AI has access to the same memory vault.",
  },
  {
    q: "How many memories can I store?",
    a: "Free: 1,000. Pro: unlimited. Enterprise: custom limits. Each memory can be up to 50KB of encrypted text.",
  },
  {
    q: "Is there a mobile app?",
    a: "Yes! Available on iOS and Android. You can save and access memories on the go, with full encryption.",
  },
  {
    q: "Can I export my memories?",
    a: "Yes. Go to Settings > Data Export and download your memories as encrypted JSON. You can re-import them anytime.",
  },
  {
    q: "What if I have more than one device?",
    a: "Perfect. Memories sync instantly across all your devices via the cloud. Start on iPhone, continue on desktop.",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredCategories = helpCategories.map(cat => ({
    ...cat,
    articles: cat.articles.filter(
      article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.slug.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.articles.length > 0);

  const filteredFAQ = faqItems.filter(
    item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0e1030] text-[#F1F5F9]">
      {/* Header */}
      <div className="bg-[#111827] border-b border-[#334155]/30 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">🏛️ Help Center</h1>
          <p className="text-[#94A3B8] text-lg mb-8">
            Find answers, tutorials, and guides for everything Unimatrix
          </p>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-4 top-3 text-[#64748B]">🔍</span>
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#1F2937] border border-[#334155]/30 rounded-lg text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#ff7a00]"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Categories */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-12 mb-16">
            {filteredCategories.map((category) => (
              <div key={category.title}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  {category.title}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {category.articles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/help/${article.slug}`}
                      className="bg-[#111827] border border-[#334155]/30 rounded-lg p-4 hover:border-[#ff7a00]/50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold mb-2">{article.title}</h3>
                          <p className="text-xs text-[#64748B]">{article.views.toLocaleString()} views</p>
                        </div>
                        <span className="text-[#ff7a00] flex-shrink-0 mt-1">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <p className="text-[#94A3B8] mb-4">No articles found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#ff7a00] hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : null}

        {/* FAQ */}
        {filteredFAQ.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="text-3xl">❓</span>
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {filteredFAQ.map((item, i) => (
                <div
                  key={i}
                  className="bg-[#111827] border border-[#334155]/30 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === item.q ? null : item.q)}
                    className="w-full px-6 py-4 text-left hover:bg-[#1F2937] transition flex items-center justify-between"
                  >
                    <span className="font-bold">{item.q}</span>
                    <span className={`transform transition ${expandedFAQ === item.q ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {expandedFAQ === item.q && (
                    <div className="px-6 py-4 bg-[#1F2937] border-t border-[#334155]/30 text-[#94A3B8]">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Still need help */}
        <div className="mt-16 bg-[#ff7a00]/10 border border-[#ff7a00]/30 rounded-lg p-8 text-center">
          <div className="text-4xl text-[#ff7a00] mx-auto mb-4">💬</div>
          <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
          <p className="text-[#94A3B8] mb-6">Our support team is here to help</p>
          <a
            href="mailto:hello@deployunimatrix.com"
            className="inline-block px-6 py-3 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
}
