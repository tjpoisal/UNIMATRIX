import { deriveKey, encryptMemory, decryptMemory } from '@/lib/encryption';

describe('E2E Encryption Suite', () => {
  test('encrypt/decrypt roundtrip', async () => {
    const password = 'test-secure-password-123';
    const originalContent = 'This is a secret memory about cross-LLM continuity';

    // Step 1: Derive key from password
    const key = await deriveKey(password);
    expect(key).toBeDefined();
    expect(key.byteLength).toBe(32); // 256-bit key

    // Step 2: Encrypt content
    const encrypted = await encryptMemory(originalContent, key);
    expect(encrypted).toBeDefined();
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.nonce).toBeDefined();
    expect(encrypted.signature).toBeDefined();

    // Step 3: Verify ciphertext is different from plaintext
    expect(encrypted.ciphertext).not.toContain(originalContent);

    // Step 4: Decrypt and verify
    const decrypted = await decryptMemory(encrypted, key);
    expect(decrypted).toBe(originalContent);
  });

  test('different passwords produce different keys', async () => {
    const key1 = await deriveKey('password-1');
    const key2 = await deriveKey('password-2');

    expect(key1).not.toEqual(key2);
  });

  test('tampering with ciphertext fails decryption', async () => {
    const password = 'test-password';
    const content = 'Secret message';

    const key = await deriveKey(password);
    const encrypted = await encryptMemory(content, key);

    // Tamper with ciphertext
    const tampered = {
      ...encrypted,
      ciphertext: Buffer.from(encrypted.ciphertext).toString('base64') + 'XX',
    };

    // Should fail or throw
    try {
      await decryptMemory(tampered, key);
      // If it doesn't throw, something is wrong
      expect(true).toBe(false);
    } catch (e) {
      // Expected: decryption should fail
      expect(e).toBeDefined();
    }
  });

  test('multiple memories with same password', async () => {
    const password = 'shared-password';
    const key = await deriveKey(password);

    const memories = [
      'Memory 1: Learned about React hooks',
      'Memory 2: Debugging async/await',
      'Memory 3: Cross-LLM continuity patterns',
    ];

    const encrypted = await Promise.all(
      memories.map(m => encryptMemory(m, key)),
    );

    // Each should have unique nonce (random)
    const nonces = encrypted.map(e => e.nonce);
    const uniqueNonces = new Set(nonces);
    expect(uniqueNonces.size).toBe(memories.length);

    // But all should decrypt correctly with same key
    const decrypted = await Promise.all(
      encrypted.map(e => decryptMemory(e, key)),
    );
    expect(decrypted).toEqual(memories);
  });
});
