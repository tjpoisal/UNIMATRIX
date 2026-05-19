/**
 * AES-256-GCM encryption for user LLM API keys.
 * Keys are encrypted at rest; decrypted only when making LLM calls.
 * Uses NEXTAUTH_SECRET as the master key (32 bytes via SHA-256 derivation).
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

function getMasterKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  // Derive a 32-byte key from the secret
  return createHash('sha256').update(secret).digest();
}

export function encryptApiKey(plaintext: string): { encrypted: string; iv: string } {
  const key = getMasterKey();
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
    cipher.getAuthTag(), // 16-byte auth tag appended
  ]);

  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
  };
}

export function decryptApiKey(encryptedB64: string, ivB64: string): string {
  const key = getMasterKey();
  const iv = Buffer.from(ivB64, 'base64');
  const encryptedWithTag = Buffer.from(encryptedB64, 'base64');

  // Last 16 bytes are the auth tag
  const authTag = encryptedWithTag.slice(-16);
  const encrypted = encryptedWithTag.slice(0, -16);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
}
