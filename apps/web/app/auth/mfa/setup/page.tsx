'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';

type SetupState = 'loading' | 'scan' | 'verify' | 'codes' | 'done';

export default function MFASetupPage() {
  const router = useRouter();
  const [state, setState] = useState<SetupState>('loading');

  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [secret, setSecret]         = useState('');
  const [qrDataUrl, setQrDataUrl]   = useState('');
  const [token, setToken]           = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [trustedEmail, setTrustedEmail]   = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [copied, setCopied]         = useState(false);

  // Step 1: generate a TOTP secret from the server
  useEffect(() => {
    fetch('/api/auth/mfa/enable', { method: 'POST' })
      .then((r) => r.json())
      .then(async (data) => {
        setOtpauthUrl(data.otpauthUrl);
        setSecret(data.secret);
        const url = await QRCode.toDataURL(data.otpauthUrl, { width: 220, margin: 2 });
        setQrDataUrl(url);
        setState('scan');
      })
      .catch(() => setError('Failed to start MFA setup. Please try again.'));
  }, []);

  // Step 2: confirm TOTP code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Invalid code'); return; }
      setRecoveryCodes(data.recoveryCodes);
      setState('codes');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: optionally set trusted person, then finish
  const handleFinish = async () => {
    setLoading(true);
    try {
      if (trustedEmail) {
        await fetch('/api/auth/mfa/trusted-person', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trustedEmail }),
        });
      }
      setState('done');
      setTimeout(() => router.push('/dashboard/settings'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const copyCodes = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    'w-full px-4 py-2 bg-bg border border-[#334155] rounded-lg text-text placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[accent]/50 transition-all';
  const btnPrimary =
    'w-full py-2 px-4 bg-[accent] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-[#111827]/80 border border-[#334155]/30 rounded-2xl p-8 space-y-6">

          <div className="flex flex-col items-center gap-2">
            <Image src="/LOGO_DARK_BACKGROUND.png" alt="Unimatrix" width={72} height={80} priority />
            <h1 className="text-lg font-semibold text-text mt-1">Set up two-factor authentication</h1>
          </div>

          {/* Loading */}
          {state === 'loading' && (
            <div className="flex justify-center py-8">
              <svg className="w-8 h-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          )}

          {/* Scan QR */}
          {state === 'scan' && (
            <form onSubmit={handleVerify} className="space-y-5">
              <p className="text-sm text-[#94A3B8]">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.).
              </p>
              {qrDataUrl && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="TOTP QR Code" className="rounded-xl border border-[#334155]/40 bg-white p-2" width={220} height={220} />
                </div>
              )}
              <div className="text-center">
                <p className="text-xs text-[#64748B] mb-1">Can&apos;t scan? Enter this code manually:</p>
                <code className="text-xs text-accent font-mono bg-[#0A0F1C] px-3 py-1 rounded-lg break-all select-all">
                  {secret}
                </code>
              </div>
              {error && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3">
                  <p className="text-sm text-[#EF4444]">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text mb-2">Enter the 6-digit code to confirm</label>
                <input
                  type="text" value={token} onChange={(e) => setToken(e.target.value.trim())}
                  className={`${inputClass} text-center tracking-[0.4em] font-mono text-lg`}
                  placeholder="000000" maxLength={6} inputMode="numeric" autoComplete="one-time-code" required
                />
              </div>
              <button type="submit" disabled={loading} className={btnPrimary}>
                {loading ? 'Verifying…' : 'Confirm & Enable 2FA'}
              </button>
            </form>
          )}

          {/* Recovery codes */}
          {state === 'codes' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-sm text-amber-300 font-medium">Save these recovery codes now.</p>
                <p className="text-xs text-amber-300/80 mt-1">
                  Each code works once. Store them in a safe place — you won&apos;t see them again.
                </p>
              </div>

              <div className="bg-[#0A0F1C] rounded-xl p-4 grid grid-cols-2 gap-2">
                {recoveryCodes.map((code) => (
                  <code key={code} className="text-sm font-mono text-accent text-center tracking-widest">
                    {code}
                  </code>
                ))}
              </div>

              <button onClick={copyCodes} className="w-full py-2 px-4 border border-[#334155] text-[#94A3B8] hover:text-text rounded-lg text-sm transition-all">
                {copied ? '✓ Copied!' : 'Copy all codes'}
              </button>

              {/* Optional: trusted person */}
              <div className="border-t border-[#334155]/30 pt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Trusted person (optional)
                  </label>
                  <p className="text-xs text-[#64748B] mb-2">
                    If you lose your authenticator and recovery codes, this person can approve a reset.
                  </p>
                  <input
                    type="email" value={trustedEmail}
                    onChange={(e) => setTrustedEmail(e.target.value)}
                    className={inputClass} placeholder="trusted@example.com"
                  />
                </div>
              </div>

              <button onClick={handleFinish} disabled={loading} className={btnPrimary}>
                {loading ? 'Saving…' : 'Done — I\'ve saved my codes'}
              </button>
            </div>
          )}

          {/* Done */}
          {state === 'done' && (
            <div className="text-center py-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-text font-medium">Two-factor authentication enabled</p>
              <p className="text-sm text-[#94A3B8]">Redirecting to settings…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
