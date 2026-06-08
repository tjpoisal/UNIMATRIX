'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type Step = 'welcome' | 'encryption' | 'first-memory' | 'context' | 'next-steps' | 'complete';

export function OnboardingFlow() {
  const [step, setStep] = useState<Step>('welcome');
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [memoryContent, setMemoryContent] = useState('');
  const [contextName, setContextName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  const passwordStrength = getPasswordStrength(encryptionPassword);
  const passwordsMatch = encryptionPassword === confirmPassword && encryptionPassword.length >= 12;

  function getPasswordStrength(pwd: string): 'weak' | 'fair' | 'good' | 'strong' {
    if (pwd.length < 8) return 'weak';
    if (pwd.length < 12) return 'fair';
    if (pwd.length < 16 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return 'good';
    return 'strong';
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0e1030] text-[#F1F5F9]">
      {/* Progress Bar */}
      <div className="h-1 bg-[#1a1f3a]">
        <div
          className="h-full bg-[#ff7a00] transition-all duration-500"
          style={{
            width:
              step === 'welcome' ? '16%' :
              step === 'encryption' ? '33%' :
              step === 'first-memory' ? '50%' :
              step === 'context' ? '66%' :
              step === 'next-steps' ? '83%' : '100%',
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Step 1: Welcome */}
        {step === 'welcome' && (
          <div className="animate-in fade-in">
            <div className="text-center mb-12">
              <div className="text-7xl mb-6">🏛️</div>
              <h1 className="text-4xl font-bold mb-4">Welcome to Your Memory Palace</h1>
              <p className="text-[#94A3B8] text-lg leading-relaxed">
                Your AI will remember everything—across ChatGPT, Claude, Gemini, and beyond. All encrypted, fully private, always accessible.
              </p>
              <p className="text-[#64748B] text-sm mt-6">This takes ~5 minutes</p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { emoji: '✨', title: 'Encrypted by Default', desc: 'Your memories stay private—server never sees plaintext' },
                { emoji: '⚡', title: 'Works Everywhere', desc: 'Phone, tablet, desktop, Claude, ChatGPT, or custom LLM' },
                { emoji: '🔐', title: 'Cross-LLM Continuity', desc: 'Start on ChatGPT, continue on Claude—same full context' },
              ].map((item, i) => (
                <div key={i} className="bg-[#111827] border border-[#334155]/30 rounded-lg p-5 hover:border-[#ff7a00]/50 transition">
                  <div className="flex gap-4">
                    <div className="text-2xl flex-shrink-0">{item.emoji}</div>
                    <div>
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <p className="text-[#94A3B8] text-sm">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('encryption')}
              className="w-full py-3 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition"
            >
              Set Up Your Palace →
            </button>

            <p className="text-center text-[#64748B] text-sm mt-6">
              Already have an account? <Link href="/auth/login" className="text-[#ff7a00] hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 2: Encryption */}
        {step === 'encryption' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold mb-2">🔐 Create Your Encryption Password</h2>
            <p className="text-[#94A3B8] mb-8">
              This password encrypts ALL your memories. We can't recover it, so save it somewhere safe.
            </p>

            <div className="bg-[#ff7a00]/10 border border-[#ff7a00]/30 rounded-lg p-4 mb-8">
              <p className="text-sm text-[#ff7a00] font-bold flex gap-2 mb-3">
                <span>⚠️</span>
                IMPORTANT: This is DIFFERENT from your account password
              </p>
              <ul className="text-[#94A3B8] text-sm space-y-1">
                <li>✓ At least 12 characters</li>
                <li>✓ Mix of letters, numbers, symbols</li>
                <li>✓ Save in password manager (never forget it)</li>
              </ul>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (passwordsMatch) setStep('first-memory');
              }}
              className="space-y-4 mb-8"
            >
              <div>
                <label className="block text-sm font-bold text-[#94A3B8] mb-2">Encryption Password</label>
                <input
                  type="password"
                  value={encryptionPassword}
                  onChange={(e) => setEncryptionPassword(e.target.value)}
                  placeholder="At least 12 characters..."
                  className="w-full px-4 py-3 bg-[#1F2937] border border-[#334155]/30 rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#ff7a00]"
                />
                <div className="mt-2 flex gap-2">
                  {['weak', 'fair', 'good', 'strong'].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        (level === 'weak' && passwordStrength) ||
                        (level === 'fair' && ['fair', 'good', 'strong'].includes(passwordStrength)) ||
                        (level === 'good' && ['good', 'strong'].includes(passwordStrength)) ||
                        (level === 'strong' && passwordStrength === 'strong')
                          ? 'bg-[#ff7a00]'
                          : 'bg-[#334155]/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password..."
                  className="w-full px-4 py-3 bg-[#1F2937] border border-[#334155]/30 rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <button
                type="submit"
                disabled={!passwordsMatch}
                className="w-full py-3 bg-[#ff7a00] hover:bg-[#ff8a1a] disabled:bg-[#64748B] text-[#0e1030] rounded-lg font-bold transition"
              >
                Continue →
              </button>
            </form>

            <button
              onClick={() => setStep('welcome')}
              className="w-full py-2 text-[#94A3B8] hover:text-[#F1F5F9] transition"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: First Memory */}
        {step === 'first-memory' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold mb-2">💾 Save Your First Memory</h2>
            <p className="text-[#94A3B8] mb-8">
              A memory can be anything: code snippet, conversation excerpt, insight, or learning. What did you just learn?
            </p>

            <div className="bg-[#111827]/50 border border-[#334155]/30 rounded-lg p-4 mb-8">
              <p className="text-sm text-[#94A3B8]">
                <strong>Examples:</strong><br/>
                • "Python: list comprehension is faster than loops"<br/>
                • "React hooks: useCallback prevents re-renders"<br/>
                • "Conversation: Why AI agents fail without memory"
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (memoryContent.trim()) setStep('context');
              }}
              className="space-y-4 mb-8"
            >
              <div>
                <label className="block text-sm font-bold text-[#94A3B8] mb-2">What to remember?</label>
                <textarea
                  value={memoryContent}
                  onChange={(e) => setMemoryContent(e.target.value)}
                  placeholder="Paste a conversation excerpt, code snippet, or insight..."
                  className="w-full px-4 py-3 bg-[#1F2937] border border-[#334155]/30 rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#ff7a00] h-32 resize-none"
                />
                <p className="text-xs text-[#64748B] mt-2">{memoryContent.length} characters</p>
              </div>

              <button
                type="submit"
                disabled={!memoryContent.trim()}
                className="w-full py-3 bg-[#ff7a00] hover:bg-[#ff8a1a] disabled:bg-[#64748B] text-[#0e1030] rounded-lg font-bold transition"
              >
                Save Memory ✓
              </button>
            </form>

            <button
              onClick={() => setStep('encryption')}
              className="w-full py-2 text-[#94A3B8] hover:text-[#F1F5F9] transition"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 4: Context Setup */}
        {step === 'context' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold mb-2">📂 Organize Your Memories</h2>
            <p className="text-[#94A3B8] mb-8">
              Contexts are like rooms in your palace. Keep memories organized by project, topic, or device.
            </p>

            <div className="bg-[#111827]/50 border border-[#334155]/30 rounded-lg p-4 mb-8 space-y-3">
              <p className="text-sm font-bold text-[#ff7a00]">Popular contexts (click to select):</p>
              <div className="flex flex-wrap gap-2">
                {['Development', 'Learning', 'Research', 'Ideas', 'Code Snippets', 'Design', 'Writing'].map((ctx) => (
                  <button
                    key={ctx}
                    onClick={() => setContextName(ctx)}
                    type="button"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      contextName === ctx
                        ? 'bg-[#ff7a00] text-[#0e1030]'
                        : 'bg-[#1F2937] text-[#94A3B8] hover:border-[#ff7a00] border border-[#334155]/30'
                    }`}
                  >
                    {ctx}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep('next-steps');
              }}
              className="space-y-4 mb-8"
            >
              <div>
                <label className="block text-sm font-bold text-[#94A3B8] mb-2">Or create custom context</label>
                <input
                  type="text"
                  value={contextName}
                  onChange={(e) => setContextName(e.target.value)}
                  placeholder="e.g., Project X, Python, My Research"
                  className="w-full px-4 py-3 bg-[#1F2937] border border-[#334155]/30 rounded-lg text-[#F1F5F9] focus:outline-none focus:border-[#ff7a00]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition"
              >
                Create Context →
              </button>
            </form>

            <button
              onClick={() => setStep('first-memory')}
              className="w-full py-2 text-[#94A3B8] hover:text-[#F1F5F9] transition"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 5: Next Steps */}
        {step === 'next-steps' && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold mb-2">🚀 What's Next?</h2>
            <p className="text-[#94A3B8] mb-8">
              Your palace is set up. Now unlock its full power with these integrations.
            </p>

            <div className="space-y-4 mb-8">
              <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-3">🌐 Browser Extension</h3>
                <p className="text-[#94A3B8] text-sm mb-4">
                  Save memories from ChatGPT, Claude web, Gemini, or any web LLM with one click.
                </p>
                <a
                  href="https://chrome.google.com/webstore"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition"
                >
                  Add to Chrome →
                </a>
              </div>

              <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-3">🤖 Connect to Claude Desktop</h3>
                <p className="text-[#94A3B8] text-sm mb-4">
                  Add Unimatrix to Claude so you can recall memories directly in conversations.
                </p>
                <button
                  onClick={() => setStep('complete')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F2937] hover:bg-[#252a45] text-[#F1F5F9] rounded-lg font-bold border border-[#334155]/30 transition"
                >
                  Get Config →
                </button>
              </div>

              <div className="bg-[#111827] border border-[#334155]/30 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-3">💻 Run Locally with Ollama</h3>
                <p className="text-[#94A3B8] text-sm mb-4">
                  Use local LLMs and auto-save memories without sending data to the cloud.
                </p>
                <Link
                  href="/setup/ollama"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F2937] hover:bg-[#252a45] text-[#F1F5F9] rounded-lg font-bold border border-[#334155]/30 transition"
                >
                  Ollama Setup →
                </Link>
              </div>
            </div>

            <button
              onClick={() => setStep('complete')}
              className="w-full py-3 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition"
            >
              Continue to Dashboard →
            </button>

            <button
              onClick={() => setStep('context')}
              className="w-full py-2 text-[#94A3B8] hover:text-[#F1F5F9] transition mt-3"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 6: Complete */}
        {step === 'complete' && (
          <div className="animate-in fade-in text-center">
            <div className="text-7xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Your Palace is Ready!</h2>
            <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">
              You've set up encryption, saved your first memory, and organized your palace. Everything is encrypted and ready to sync across your devices.
            </p>

            <div className="bg-[#111827]/50 border border-[#334155]/30 rounded-lg p-6 mb-8 text-left">
              <p className="text-sm text-[#ff7a00] font-bold mb-3">📝 API Key (for MCP + integrations)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="flex-1 px-3 py-2 bg-[#1F2937] border border-[#334155]/30 rounded text-[#64748B] text-sm"
                />
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  className="px-3 py-2 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded font-bold transition"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
              <p className="text-xs text-[#64748B] mt-2">You'll need this to set up MCP and integrations</p>
            </div>

            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-[#ff7a00] hover:bg-[#ff8a1a] text-[#0e1030] rounded-lg font-bold transition mb-4"
            >
              Go to Dashboard
            </Link>

            <p className="text-[#64748B] text-sm">
              <Link href="/help" className="text-[#ff7a00] hover:underline">View help center</Link> •
              <Link href="/setup/chatgpt" className="text-[#ff7a00] hover:underline ml-2">Browser extension setup</Link>
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
