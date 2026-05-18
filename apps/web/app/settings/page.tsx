'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';

interface Palace {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [palaces, setPalaces] = useState<Palace[]>([]);
  const [selectedPalaceId, setSelectedPalaceId] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown'>('json');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');

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

  return (
    <AppShell>
      <div className="p-8 max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9]">Settings</h1>
          <p className="text-[#94A3B8] mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-5">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#A855F7] flex items-center justify-center text-[#F1F5F9] text-xl font-bold flex-shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-[#F1F5F9] font-medium">{session?.user?.name || '—'}</p>
              <p className="text-sm text-[#64748B]">{session?.user?.email || '—'}</p>
            </div>
          </div>
        </section>

        {/* Export Section */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-1">Export Data</h2>
          <p className="text-sm text-[#94A3B8] mb-5">Download a palace as JSON or Markdown</p>

          {palaces.length === 0 ? (
            <p className="text-sm text-[#64748B]">No palaces to export yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Palace selector */}
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Palace</label>
                <select
                  value={selectedPalaceId}
                  onChange={(e) => setSelectedPalaceId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0F1C]/60 border border-[#334155]/50 rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#00F5FF]/50 focus:ring-1 focus:ring-[#00F5FF]/20 transition-colors"
                >
                  {palaces.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#111827]">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Format</label>
                <div className="flex gap-3">
                  {(['json', 'markdown'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        exportFormat === fmt
                          ? 'bg-[#00F5FF]/10 border-[#00F5FF]/40 text-[#00F5FF]'
                          : 'bg-[#0A0F1C]/40 border-[#334155]/40 text-[#94A3B8] hover:border-[#334155]/60 hover:text-[#F1F5F9]'
                      }`}
                    >
                      {fmt === 'json' ? 'JSON' : 'Markdown'}
                    </button>
                  ))}
                </div>
              </div>

              {exportError && (
                <p className="text-sm text-[#EF4444]">{exportError}</p>
              )}

              <button
                onClick={handleExport}
                disabled={exporting || !selectedPalaceId}
                className="w-full py-3 px-6 bg-[#00F5FF] hover:bg-[#00D9FF] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#00F5FF]/20"
              >
                {exporting ? 'Exporting…' : 'Download Export'}
              </button>
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="backdrop-blur-xl bg-[#111827]/60 border border-[#334155]/30 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-1">Account</h2>
          <p className="text-sm text-[#94A3B8] mb-5">Sign out of Unimatrix</p>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/auth/login' })}
            className="px-5 py-2.5 bg-[#1F2937] hover:bg-[#2D3748] text-[#F1F5F9] text-sm font-medium rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </section>
      </div>
    </AppShell>
  );
}
