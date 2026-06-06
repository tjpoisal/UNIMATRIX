/**
 * lib/encryption.ts
 *
 * Client-side E2E encryption for memories using TweetNaCl.js
 *
 * Flow:
 * 1. User derives a key from their password (PBKDF2 via SubtleCrypto)
 * 2. Each memory is encrypted with AES-256-GCM before sending to server
 * 3. Server stores ciphertext only; never sees plaintext
 * 4. On retrieval, browser decrypts using user's key
 *
 * For Unimatrix SBIR: "Zero-knowledge memory" — server cannot read memories
 */

// For browser-safe crypto, we'll use SubtleCrypto (Web Crypto API)
// For Node.js compatibility, we can use tweetnacl or libsodium

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const NONCE_LENGTH = 12; // bytes (96 bits for AES-GCM)
// const AUTH_TAG_LENGTH = 128; // bits (16 bytes) - AES-GCM uses 128-bit tag automatically

interface EncryptedMemory {
  ciphertext: string; // Base64-encoded
  nonce: string; // Base64-encoded IV
  timestamp: number;
}

/**
 * Derive a stable encryption key from the user's password + salt
 * Uses PBKDF2 (1M iterations for security)
 */
export async function deriveKey(
  password: string,
  salt: string = 'unimatrix-e2e',
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      iterations: 1_000_000,
    },
    baseKey,
    KEY_LENGTH,
  );

  return crypto.subtle.importKey('raw', derivedBits, ALGORITHM, false, [
    'encrypt',
    'decrypt',
  ]);
}

/**
 * Encrypt a memory's content before sending to server
 */
export async function encryptMemory(
  plaintext: string,
  key: CryptoKey,
): Promise<EncryptedMemory> {
  const encoder = new TextEncoder();
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: nonce,
    },
    key,
    encoder.encode(plaintext),
  );

  return {
    ciphertext: Buffer.from(ciphertext).toString('base64'),
    nonce: Buffer.from(nonce).toString('base64'),
    timestamp: Date.now(),
  };
}

/**
 * Decrypt a memory retrieved from server
 */
export async function decryptMemory(
  encrypted: EncryptedMemory,
  key: CryptoKey,
): Promise<string> {
  const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
  const nonce = Buffer.from(encrypted.nonce, 'base64');

  const plaintext = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: nonce,
    },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plaintext);
}

/**
 * Generate a search token for encrypted keyword search
 * (Deterministic HMAC-based; not true ZKP but acceptable for Phase 1)
 */
export async function generateSearchToken(
  keyword: string,
  key: CryptoKey,
): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.exportKey('raw', key);

  const hmacKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    encoder.encode(keyword.toLowerCase()),
  );

  return Buffer.from(signature).toString('hex').slice(0, 32);
}

/**
 * Sign a memory to prove it wasn't tampered
 * (Simple Ed25519-style signature; upgrade to proper signatures later)
 */
export async function signMemory(
  content: string,
  key: CryptoKey,
): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.exportKey('raw', key);

  const signKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', signKey, encoder.encode(content));
  return Buffer.from(signature).toString('hex');
}
