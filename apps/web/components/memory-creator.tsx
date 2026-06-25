'use client';

import { useState } from 'react';
import { deriveKey, encryptMemory } from '@/lib/encryption';

interface EncryptedPayload {
  ciphertext: string;
  nonce: string;
  timestamp: number;
  context?: string;
  importance: 'low' | 'medium' | 'high';
}

export function MemoryCreator() {
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [context, setContext] = useState('');
  const [importance, setImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleCreateMemory(e: React.FormEvent) {
    e.preventDefault();
    setIsEncrypting(true);
    setMessage(null);

    try {
      if (!content.trim()) {
        throw new Error('Memory content is required');
      }
      if (!password.trim()) {
        throw new Error('Password is required for encryption');
      }

      // Step 1: Derive encryption key from password
      const key = await deriveKey(password);

      // Step 2: Encrypt memory content
      const encrypted = await encryptMemory(content, key);

      // Step 3: Prepare payload (server never sees plaintext)
      const payload: EncryptedPayload = {
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
        timestamp: encrypted.timestamp,
        context: context || undefined,
        importance,
      };

      // Step 4: Send encrypted memory to server
      const response = await fetch('/api/memories/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      setMessage({
        type: 'success',
        text: `✅ Memory encrypted and stored securely (${content.length} chars)`,
      });
      setContent('');
      setContext('');
      setImportance('medium');
    } catch (error) {
      setMessage({
        type: 'error',
        text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsEncrypting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg border border-cyan-500/30">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">Create Encrypted Memory</h2>

      <form onSubmit={handleCreateMemory} className="space-y-4">
        {/* Memory Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Memory Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What would you like to remember? This will be encrypted before sending to the server..."
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            rows={5}
          />
        </div>

        {/* Encryption Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Encryption Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password (used to derive encryption key)"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            🔐 Your password is never sent to the server. It&apos;s used only to derive your encryption key.
          </p>
        </div>

        {/* Context */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Context (Optional)
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., Development, Learning, Research"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Importance */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Importance
          </label>
          <select
            value={importance}
            onChange={(e) => setImportance(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.type === 'success'
                ? 'bg-green-900/30 text-green-300 border border-green-500/30'
                : 'bg-red-900/30 text-red-300 border border-red-500/30'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isEncrypting}
          className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-medium rounded transition-colors"
        >
          {isEncrypting ? '🔐 Encrypting...' : '💾 Save Encrypted Memory'}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded text-sm text-blue-300">
        <p className="font-semibold mb-2">How it works:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Your password derives a 256-bit encryption key using PBKDF2</li>
          <li>Content is encrypted with AES-256-GCM before leaving your device</li>
          <li>Server stores only ciphertext, never plaintext or password</li>
          <li>Tampering is detected via HMAC-SHA256 signature</li>
          <li>Only you can decrypt your memories (with your password)</li>
        </ul>
      </div>
    </div>
  );
}
