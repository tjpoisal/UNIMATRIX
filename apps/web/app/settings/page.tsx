'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';

interface Palace {
  id: string;
  name: string;
}

// ── Inner component (uses useSearchParams — must be inside <Suspense>) ─────────
function SettingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get('upgraded') === '1';

  const [palaces, setPalaces] = useState<Palace[]>([]);
  const [selectedPalaceId, setSelectedPalaceId] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown'>('json');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');

  const tier = session?.user?.tier ?? 'free';
  const isPro = tier === 'pro';

  useEffect(() => {
    fetch('/api/palaces')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPalaces(data);
          if (data.length > 0) setSelectedPalaceId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleExport = async () => {
    if (!selectedPalaceId) return;
    setExporting(true);
    setExportError('');

    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palaceId: selectedPalaceId, format: exportFormat }),
      });

      if (!res.ok) {
        const data = await res.json();
        setExportError(data.error || 'Export failed');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const palace = palaces.find((p) => p.id === selectedPalaceId);
      a.href = url;
      a.download = `${palace?.name || 'palace'}.${exportFormat === 'markdown' ? 'md' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleManageBilling = async () => {
    setBillingLoading(true);
    setBillingError('');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setBillingError(data.error ?? 'Could not open billing portal.');
      }
    } catch {
      setBillingError('Network error. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Upgrade success banner */}
      {upgraded && (
        <div className="flex items-center gap-3 px-5 py-4 bg-accent/10 border border-[#00F5FF]/30 rounded-2xl">
          <span className="text-accent text-lg">✓</span>
          <div>
            <p className="text-accent font-semibold">You&apos;re now on Pro!</p>
            <p className="text-sm text-text-muted mt-0.5">
              All limits have been lifted. Enjoy unlimited palaces, memories, and sharing.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <section className="backdrop-blur-xl bg-surface/60 border border-border/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-text mb-5">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-secondary flex items-center justify-center text-text text-xl font-bold flex-shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-text font-medium">{session?.user?.name || '—'}</p>
            <p className="text-sm text-text-muted">{session?.user?.email || '—'}</p>
          </div>
        </div>
      </section>

      {/* Billing Section */}
      <section className="backdrop-blur-xl bg-surface/60 border border-border/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-text mb-1">Plan &amp; Billing</h2>
        <p className="text-sm text-text-secondary mb-5">
          {isPro
            ? "You're on the Pro plan. Manage or cancel your subscription any time."
            : "You're on the Free plan. Upgrade to unlock unlimited palaces, memories, and sharing."}
        </p>

        <div className="flex items-center gap-3 mb-5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isPro
                ? 'bg-accent/10 text-accent border border-[#00F5FF]/30'
                : 'bg-[#334155]/40 text-text-secondary border border-border/40'
            }`}
          >
            {isPro ? 'Pro' : 'Free'}
          </span>
          {isPro && (
            <span className="text-xs text-text-muted">
              Unlimited palaces · Unlimited memories · 20 API keys
            </span>
          )}
        </div>

        {billingError && (
          <p className="text-sm text-error mb-3">{billingError}</p>
        )}

        {isPro ? (
          <button
            onClick={handleManageBilling}
            disabled={billingLoading}
            className="px-5 py-2.5 bg-surface-elevated hover:bg-[#2D3748] disabled:opacity-50 disabled:cursor-not-allowed text-text text-sm font-medium rounded-lg transition-colors"
          >
            {billingLoading ? 'Opening portal…' : 'Manage Subscription'}
          </button>
        ) : (
          <Link
            href="/pricing"
            className="inline-block px-5 py-2.5 bg-accent hover:bg-accent/90 text-[#0A0F1C] text-sm font-bold rounded-lg transition-colors shadow-lg shadow-[#00F5FF]/20"
          >
            Upgrade to Pro →
          </Link>
        )}
      </section>

      {/* Export Section */}
      <section className="backdrop-blur-xl bg-surface/60 border border-border/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-text mb-1">Export Data</h2>
        <p className="text-sm text-text-secondary mb-5">Download a palace as JSON or Markdown</p>

        {palaces.length === 0 ? (
          <p className="text-sm text-text-muted">No palaces to export yet.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Palace</label>
              <select
                value={selectedPalaceId}
                onChange={(e) => setSelectedPalaceId(e.target.value)}
                className="w-full px-4 py-3 bg-bg/60 border border-border/50 rounded-lg text-text focus:outline-none focus:border-[#00F5FF]/50 focus:ring-1 focus:ring-[#00F5FF]/20 transition-colors"
              >
                {palaces.map((p) => (
                  <option key={p.id} value={p.id} className="bg-surface">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Format</label>
              <div className="flex gap-3">
                {(['json', 'markdown'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      exportFormat === fmt
                        ? 'bg-accent/10 border-[#00F5FF]/40 text-accent'
                        : 'bg-bg/40 border-border/40 text-text-secondary hover:border-border/60 hover:text-text'
                    }`}
                  >
                    {fmt === 'json' ? 'JSON' : 'Markdown'}
                  </button>
                ))}
              </div>
            </div>

            {exportError && (
              <p className="text-sm text-error">{exportError}</p>
            )}

            <button
              onClick={handleExport}
              disabled={exporting || !selectedPalaceId}
              className="w-full py-3 px-6 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/20"
            >
              {exporting ? 'Exporting…' : 'Download Export'}
            </button>
          </div>
        )}
      </section>

      {/* Account */}
      <section className="backdrop-blur-xl bg-surface/60 border border-border/30 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-text mb-1">Account</h2>
        <p className="text-sm text-text-secondary mb-5">Sign out of Unimatrix</p>
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: '/auth/login' })}
          className="px-5 py-2.5 bg-surface-elevated hover:bg-[#2D3748] text-text text-sm font-medium rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </section>
    </div>
  );
}

// ── Page wrapper — Suspense required for useSearchParams in Next.js 15 ─────────
export default function SettingsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-text-muted">Loading…</div>}>
        <SettingsContent />
      </Suspense>
    </AppShell>
  );
}
