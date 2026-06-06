/**
 * encryption.test.ts
 *
 * E2E Encryption Test Suite
 * Validates PBKDF2 + AES-256-GCM implementation
 *
 * To run these tests:
 * 1. npm install --save-dev vitest (or jest)
 * 2. npm test -- encryption.test.ts
 */

import { describe, it, expect } from 'vitest';
import { deriveKey, encryptMemory, decryptMemory } from '@/lib/encryption';

describe('E2E Encryption (PBKDF2 + AES-256-GCM)', () => {
  it('should derive a key from password', async () => {
    const password = 'test-password-123';
    const key = await deriveKey(password);
    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
  });

  it('should encrypt and decrypt memory content', async () => {
    const password = 'test-password';
    const content = 'Secret memory about cross-LLM continuity';

    const key = await deriveKey(password);
    const encrypted = await encryptMemory(content, key);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.nonce).toBeDefined();

    const decrypted = await decryptMemory(encrypted, key);
    expect(decrypted).toBe(content);
  });

  it('should produce different ciphertexts for same content (random nonce)', async () => {
    const password = 'test-password';
    const content = 'Test message';

    const key = await deriveKey(password);
    const enc1 = await encryptMemory(content, key);
    const enc2 = await encryptMemory(content, key);

    // Nonces should be different (random)
    expect(enc1.nonce).not.toBe(enc2.nonce);
    // Ciphertexts should be different
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
    // But both should decrypt to same content
    expect(await decryptMemory(enc1, key)).toBe(content);
    expect(await decryptMemory(enc2, key)).toBe(content);
  });

  it('should reject tampering attempts', async () => {
    const password = 'test-password';
    const content = 'Secret message';

    const key = await deriveKey(password);
    const encrypted = await encryptMemory(content, key);

    // Tamper with the ciphertext
    const tampered = {
      ...encrypted,
      ciphertext: encrypted.ciphertext.slice(0, -5) + 'XXXXX',
    };

    // Decryption should fail
    await expect(decryptMemory(tampered, key)).rejects.toThrow();
  });

  it('should use different keys for different passwords', async () => {
    const key1 = await deriveKey('password-1');
    const key2 = await deriveKey('password-2');

    // Keys should be different objects (different key material)
    expect(key1).not.toBe(key2);
  });

  it('should fail to decrypt with wrong password', async () => {
    const password1 = 'password-1';
    const password2 = 'password-2';
    const content = 'Secret message';

    const key1 = await deriveKey(password1);
    const encrypted = await encryptMemory(content, key1);

    const key2 = await deriveKey(password2);
    await expect(decryptMemory(encrypted, key2)).rejects.toThrow();
  });
});
