/**
 * src/security/encryption.ts
 *
 * AES-256-GCM application-layer encryption for Unimatrix memories.
 *
 * Ciphertext blob layout stored in the BYTEA column:
 *   [ 32 bytes scrypt salt ][ 12 bytes IV ][ 16 bytes GCM auth tag ][ N bytes payload ]
 *
 * Key derivation: scrypt(masterKey, salt=randomBytes(32), N=16384, r=8, p=1) → 32-byte AES key
 *   - Each encrypt call generates a fresh salt → unique key per ciphertext
 *   - SHA-256(master+userId) replaced: that was not key stretching, just hashing
 *   - Phase 2: move to per-user keys in AWS Secrets Manager / Vault (BYOK)
 *
 * Why scrypt vs PBKDF2?
 *   scrypt is memory-hard (N=16384 → ~16 MB RAM per derivation), making
 *   GPU brute-force of the master key 1000× more expensive than PBKDF2.
 */

import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  scryptSync,
} from 'node:crypto';

import { sanitizeForIndexing } from './sanitize.js';

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const SALT_LEN    = 32;  // scrypt salt
const IV_LEN      = 12;  // AES-GCM nonce
const AUTHTAG_LEN = 16;  // GCM auth tag
const HEADER_LEN  = SALT_LEN + IV_LEN + AUTHTAG_LEN; // 60 bytes total

// scrypt params — N must be a power of 2; 16384 balances security vs. latency (~15ms)
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN  = 32;  // 256-bit AES key

// ---------------------------------------------------------------------------
// Key derivation
// ---------------------------------------------------------------------------

function deriveKey(masterKey: string, salt: Buffer): Buffer {
  // scryptSync is intentionally blocking here — it's fast enough at N=16384
  // and avoids the complexity of async key derivation inside cipher setup.
  return scryptSync(masterKey, salt, KEY_LEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
}

function getMasterKey(): string {
  const key = process.env.MASTER_ENCRYPTION_KEY;
  if (!key) throw new Error('MASTER_ENCRYPTION_KEY environment variable is required');
  return key;
}

// ---------------------------------------------------------------------------
// Encrypt
// ---------------------------------------------------------------------------

export interface EncryptedContent {
  /** Full blob: [ salt(32) ][ IV(12) ][ authTag(16) ][ payload(N) ] */
  ciphertext: Buffer;
  /** IV convenience copy — stored in content_iv column */
  iv: Buffer;
}

export async function encryptContent(
  plaintext: string,
  _userId:   string,   // reserved for per-user key rotation (Phase 2)
): Promise<EncryptedContent> {
  const masterKey = getMasterKey();
  const salt      = randomBytes(SALT_LEN);
  const iv        = randomBytes(IV_LEN);
  const key       = deriveKey(masterKey, salt);

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encryptedPayload = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag    = cipher.getAuthTag();
  const ciphertext = Buffer.concat([salt, iv, authTag, encryptedPayload]);

  return { ciphertext, iv };
}

// ---------------------------------------------------------------------------
// Decrypt
// ---------------------------------------------------------------------------

/**
 * Decrypts a ciphertext blob produced by encryptContent().
 * Unpacks salt → derives key → verifies GCM auth tag → returns plaintext.
 * Throws if the blob is tampered, truncated, or the master key is wrong.
 */
export async function decryptContent(
  ciphertext: Buffer,
  _userId:    string,  // reserved for per-user key rotation (Phase 2)
): Promise<string> {
  if (ciphertext.length < HEADER_LEN) {
    throw new Error(`decryptContent: ciphertext too short (${ciphertext.length} bytes)`);
  }

  const masterKey        = getMasterKey();
  const salt             = ciphertext.subarray(0, SALT_LEN);
  const iv               = ciphertext.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const authTag          = ciphertext.subarray(SALT_LEN + IV_LEN, HEADER_LEN);
  const encryptedPayload = ciphertext.subarray(HEADER_LEN);

  const key     = deriveKey(masterKey, salt);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  try {
    return Buffer.concat([
      decipher.update(encryptedPayload),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error('decryptContent: authentication failed — data may be tampered or key is wrong');
  }
}

// ---------------------------------------------------------------------------
// Pre-embedding preparation
// ---------------------------------------------------------------------------

/**
 * Returns sanitized plaintext ready for the Librarian and embedding pipeline.
 * Always call BEFORE encryptContent() — embeddings must come from plaintext.
 */
export function prepareForEmbedding(plaintext: string): string {
  const { redacted } = sanitizeForIndexing(plaintext);
  return redacted;
}
