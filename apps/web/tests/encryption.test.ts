import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { deriveKey, encryptMemory, decryptMemory } from '../lib/encryption';

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
}

test('encrypt/decrypt roundtrip with Web Crypto API', async () => {
  const key = await deriveKey('correct horse battery staple');
  const encrypted = await encryptMemory('Unimatrix remembers everything.', key);
  const decrypted = await decryptMemory(encrypted, key);
  assert.equal(decrypted, 'Unimatrix remembers everything.');
});
