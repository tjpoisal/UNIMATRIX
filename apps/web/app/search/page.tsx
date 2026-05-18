'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import AppShell from '@/components/layout/AppShell';

interface SearchResult {
  id: string;
  content: string;
  tags: string[];
  lastAccessed: string;
  location: {
    id: string;
    name: string;
    palace: { id: string; name: string };
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Search failed');
        setResults([]);
        return;
      }

      setResults(data.results || []);
    } catch {
      setError('Search request failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
  }, [initialQuery, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    runSearch(query);
  };

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase()
        ? <mark key={i} className="bg-[#00F5FF]/20 text-[#00F5FF] rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <AppShell>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-2">Search</h1>
          <p className="text-[#94A3B8]">Find memories across all your palaces</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] text-lg">🔍</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search memories, tags, locations…"
                autoFocus
                className="w-full pl-12 pr-4 py-3.5 bg-[#111827]/60 border border-[#334155]/50 rounded-xl text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#00F5FF]/50 focus:ring-1 focus:ring-[#00F5FF]/20 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3.5 bg-[#00F5FF] hover:bg-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1C] font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/20"
            >
              {loading ? '…' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4 mb-6">
            <p className="text-[#EF4444] text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-40">
            <div className="text-[#94A3B8]">Searching…</div>
          </div>
        )}

        {/* Results */}
        {!loading && searched && !error && (
          <div>
            <p className="text-sm text-[#64748B] mb-4">
              {results.length === 0
                ? `No results for "${query}"`
                : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
            </p>

            {results.length === 0 ? (
              <div className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-10 text-center">
                <p className="text-[#64748B] text-lg mb-2">No memories found</p>
                <p className="text-[#475569] text-sm">Try different keywords or check your palaces</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/palaces/${result.location.palace.id}`}
                    className="group block backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-xl p-5 hover:border-[#00F5FF]/40 transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/5"
                  >
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mb-3">
                      <span className="hover:text-[#94A3B8]">{result.location.palace.name}</span>
                      <span>›</span>
                      <span>{result.location.name}</span>
                    </div>

                    {/* Content preview */}
                    <p className="text-[#F1F5F9] text-sm leading-relaxed line-clamp-3">
                      {highlight(result.content, query)}
                    </p>

                    {/* Tags */}
                    {result.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {result.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs bg-[#00F5FF]/10 border border-[#00F5FF]/20 text-[#00F5FF] rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Initial empty state */}
        {!loading && !searched && (
          <div className="text-center pt-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-[#64748B] text-lg">Enter a query to search your memories</p>
            <p className="text-[#475569] text-sm mt-2">Searches across content and tags in all your palaces</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
