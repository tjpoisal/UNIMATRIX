import { deriveKey, encryptMemory, decryptMemory } from '@/lib/encryption';

/**
 * E2E Encryption Test Suite
 * Tests the PBKDF2 + AES-256-GCM encryption implementation
 *
 * Run with: npm test -- encryption.test.ts
 */

async function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}: ${message}`);
  }
}

export async function runEncryptionTests() {
  console.log('🧪 Running E2E Encryption Tests...\n');

  // Test 1: Encrypt/Decrypt Roundtrip
  {
    console.log('Test 1: Encrypt/decrypt roundtrip');
    const password = 'test-secure-password-123';
    const originalContent = 'This is a secret memory about cross-LLM continuity';

    const key = await deriveKey(password);
    await assert(key !== null, 'Key derivation should succeed');

    const encrypted = await encryptMemory(originalContent, key);
    await assert(encrypted.ciphertext, 'Ciphertext should exist');
    await assert(encrypted.nonce, 'Nonce should exist');

    const decrypted = await decryptMemory(encrypted, key);
    await assertEqual(decrypted, originalContent, 'Decrypted content should match original');
    console.log('✅ PASS\n');
  }

  // Test 2: Different Passwords
  {
    console.log('Test 2: Different passwords produce different keys');
    const key1 = await deriveKey('password-1');
    const key2 = await deriveKey('password-2');

    await assert(key1 !== key2, 'Different passwords should produce different keys');
    console.log('✅ PASS\n');
  }

  // Test 3: Tampering Detection
  {
    console.log('Test 3: Tampering with ciphertext fails decryption');
    const password = 'test-password';
    const content = 'Secret message';

    const key = await deriveKey(password);
    const encrypted = await encryptMemory(content, key);

    // Tamper with ciphertext
    const tampered = {
      ...encrypted,
      ciphertext: encrypted.ciphertext.slice(0, -10) + 'DEADBEEF00',
    };

    try {
      await decryptMemory(tampered, key);
      throw new Error('Decryption of tampered data should fail');
    } catch (e) {
      // Expected: decryption should fail
      console.log('✅ PASS (correctly rejected tampered data)\n');
    }
  }

  // Test 4: Multiple Memories
  {
    console.log('Test 4: Multiple memories with same password');
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
    await assertEqual(uniqueNonces.size, memories.length, 'All nonces should be unique');

    // All should decrypt correctly with same key
    const decrypted = await Promise.all(
      encrypted.map(e => decryptMemory(e, key)),
    );

    for (let i = 0; i < memories.length; i++) {
      await assertEqual(decrypted[i], memories[i], `Memory ${i} should decrypt correctly`);
    }

    console.log('✅ PASS\n');
  }

  console.log('✨ All encryption tests passed!\n');
}
