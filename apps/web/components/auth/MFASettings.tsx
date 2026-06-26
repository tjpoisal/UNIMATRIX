'use client';

/**
 * MFASettings — drop into any settings page.
 *
 * Lets users:
 *  - Enable / disable TOTP-based 2FA
 *  - Regenerate recovery codes
 *  - Set / update trusted person email
 *
 * SOC2 CC6.1 / HIPAA §164.312(d)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MFASettings() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [trustedEmail, setTrustedEmail] = useState('');
  const [maskedTrusted, setMaskedTrusted] = useState<string | null>(null);
  const [editingTrusted, setEditingTrusted] = useState(false);

  // Disable dialog
  const [showDisable, setShowDisable]   = useState(false);
  const [disablePass, setDisablePass]   = useState('');
  const [disableError, setDisableError] = useState('');

  // Regen codes dialog
  const [showRegen, setShowRegen]     = useState(false);
  const [regenToken, setRegenToken]   = useState('');
  const [regenCodes, setRegenCodes]   = useState<string[]>([]);
  const [regenError, setRegenError]   = useState('');
  const [regenCopied, setRegenCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (session?.user) {
      // Defer setState to avoid synchronous setState inside effect
      Promise.resolve().then(() => {
        if (!cancelled) setMfaEnabled(session.user.mfaEnabled ?? false);
      });
    }

    // Fetch trusted-person config in an async function with cancellation
    (async () => {
      try {
        const r = await fetch('/api/auth/mfa/trusted-person');
        const d = await r.json();
        if (!cancelled) setMaskedTrusted(d.maskedEmail);
      } catch (err) {
        // Non-fatal; record for debugging
        console.debug('Failed to fetch trusted-person config', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  // ── Enable MFA ──────────────────────────────────────────────────────────────
  const handleEnable = () => router.push('/auth/mfa/setup');

  // ── Disable MFA ─────────────────────────────────────────────────────────────
  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/mfa/disable', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password: disablePass }),
      });
      const data = await res.json();
      if (!res.ok) { setDisableError(data.error ?? 'Failed'); return; }
      setMfaEnabled(false);
      setShowDisable(false);
      setDisablePass('');
      await updateSession();
      setFeedback('Two-factor authentication disabled.');
    } finally {
      setLoading(false);
    }
  };

  // ── Regen codes ─────────────────────────────────────────────────────────────
  const handleRegen = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegenError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/mfa/recovery-codes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: regenToken }),
      });
      const data = await res.json();
      if (!res.ok) { setRegenError(data.error ?? 'Invalid code'); return; }
      setRegenCodes(data.recoveryCodes);
    } finally {
      setLoading(false);
    }
  };

  const copyRegenCodes = async () => {
    await navigator.clipboard.writeText(regenCodes.join('\n'));
    setRegenCopied(true);
    setTimeout(() => setRegenCopied(false), 2000);
  };

  // ── Save trusted person ─────────────────────────────────────────────────────
  const handleSaveTrusted = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/mfa/trusted-person', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: trustedEmail || null }),
      });
      const data = await res.json();
      if (!res.ok) { setFeedback(data.error ?? 'Failed'); return; }
      setMaskedTrusted(trustedEmail ? maskEmail(trustedEmail) : null);
      setEditingTrusted(false);
      setTrustedEmail('');
      setFeedback('Trusted person updated.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 bg-bg border border-[#334155] rounded-lg text-text placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[accent]/50 transition-all text-sm';

  return (
    <div className="space-y-5">
      {/* Feedback toast */}
      {feedback && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-sm text-green-400">{feedback}</p>
        </div>
      )}

      {/* 2FA status card */}
      <div className="bg-[#0A0F1C] border border-[#334155]/40 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mfaEnabled ? 'bg-green-500/10' : 'bg-[#334155]/30'}`}>
              <svg className={`w-5 h-5 ${mfaEnabled ? 'text-green-400' : 'text-[#64748B]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text">Two-factor authentication</p>
              <p className="text-xs text-[#64748B]">
                {mfaEnabled ? 'Enabled — your account is more secure.' : 'Disabled — strongly recommended.'}
              </p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${mfaEnabled ? 'bg-green-500/10 text-green-400' : 'bg-[#334155]/40 text-[#64748B]'}`}>
            {mfaEnabled ? 'ON' : 'OFF'}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {!mfaEnabled ? (
            <button onClick={handleEnable}
              className="px-4 py-1.5 bg-[accent] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg text-sm transition-all">
              Enable 2FA
            </button>
          ) : (
            <>
              <button onClick={() => setShowDisable(true)}
                className="px-4 py-1.5 border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg text-sm transition-all">
                Disable
              </button>
              <button onClick={() => { setShowRegen(true); setRegenCodes([]); setRegenToken(''); setRegenError(''); }}
                className="px-4 py-1.5 border border-[#334155] text-[#94A3B8] hover:text-text rounded-lg text-sm transition-all">
                Regenerate recovery codes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Trusted person */}
      {mfaEnabled && (
        <div className="bg-[#0A0F1C] border border-[#334155]/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium text-text">Trusted person</p>
          </div>
          <p className="text-xs text-[#64748B]">
            If you lose your authenticator and all recovery codes, this person can approve an account reset.
          </p>

          {!editingTrusted ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">
                {maskedTrusted ?? <em className="text-[#64748B]">Not configured</em>}
              </span>
              <button onClick={() => setEditingTrusted(true)}
                className="text-xs text-accent hover:text-[#00D9FF] transition-colors">
                {maskedTrusted ? 'Change' : 'Add'}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="email" value={trustedEmail}
                onChange={(e) => setTrustedEmail(e.target.value)}
                className={inputClass} placeholder="trusted@example.com"
              />
              <button onClick={handleSaveTrusted} disabled={loading}
                className="px-3 py-1.5 bg-[accent] text-[#0A0F1C] font-semibold rounded-lg text-sm disabled:opacity-50">
                Save
              </button>
              <button onClick={() => setEditingTrusted(false)}
                className="px-3 py-1.5 border border-[#334155] text-[#94A3B8] rounded-lg text-sm">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Disable dialog */}
      {showDisable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-semibold text-text">Disable two-factor authentication</h3>
            <p className="text-sm text-[#94A3B8]">Enter your password to confirm.</p>
            <form onSubmit={handleDisable} className="space-y-3">
              {disableError && <p className="text-sm text-[#EF4444]">{disableError}</p>}
              <input type="password" value={disablePass} onChange={(e) => setDisablePass(e.target.value)}
                className={inputClass} placeholder="••••••••" required />
              <div className="flex gap-2">
                <button type="submit" disabled={loading}
                  className="flex-1 py-2 bg-[#EF4444] hover:bg-red-500 text-white font-semibold rounded-lg text-sm disabled:opacity-50">
                  {loading ? 'Disabling…' : 'Disable 2FA'}
                </button>
                <button type="button" onClick={() => { setShowDisable(false); setDisablePass(''); setDisableError(''); }}
                  className="flex-1 py-2 border border-[#334155] text-[#94A3B8] rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regen codes dialog */}
      {showRegen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111827] border border-[#334155]/30 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-semibold text-text">Regenerate recovery codes</h3>

            {regenCodes.length === 0 ? (
              <form onSubmit={handleRegen} className="space-y-3">
                <p className="text-sm text-[#94A3B8]">Enter your authenticator code to regenerate codes. Old codes will be invalidated.</p>
                {regenError && <p className="text-sm text-[#EF4444]">{regenError}</p>}
                <input type="text" value={regenToken} onChange={(e) => setRegenToken(e.target.value.trim())}
                  className={`${inputClass} text-center tracking-[0.4em] font-mono`}
                  placeholder="000000" maxLength={6} inputMode="numeric" required />
                <div className="flex gap-2">
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2 bg-[accent] text-[#0A0F1C] font-semibold rounded-lg text-sm disabled:opacity-50">
                    {loading ? 'Generating…' : 'Generate'}
                  </button>
                  <button type="button" onClick={() => setShowRegen(false)}
                    className="flex-1 py-2 border border-[#334155] text-[#94A3B8] rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <p className="text-xs text-amber-300">Save these now — you won&apos;t see them again.</p>
                </div>
                <div className="bg-[#0A0F1C] rounded-xl p-4 grid grid-cols-2 gap-2">
                  {regenCodes.map((c) => (
                    <code key={c} className="text-sm font-mono text-accent text-center tracking-widest">{c}</code>
                  ))}
                </div>
                <button onClick={copyRegenCodes}
                  className="w-full py-2 border border-[#334155] text-[#94A3B8] hover:text-text rounded-lg text-sm transition-all">
                  {regenCopied ? '✓ Copied!' : 'Copy all codes'}
                </button>
                <button onClick={() => { setShowRegen(false); setRegenCodes([]); setRegenToken(''); }}
                  className="w-full py-2 bg-[accent] text-[#0A0F1C] font-semibold rounded-lg text-sm">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '****';
  return `${local[0]}${'*'.repeat(Math.max(local.length - 1, 3))}@${domain}`;
}
