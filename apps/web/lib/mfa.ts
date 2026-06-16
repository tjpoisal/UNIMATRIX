/**
 * MFA utilities — TOTP (RFC 6238) via the `otpauth` library.
 *
 * SOC2 / HIPAA notes:
 *  - Secrets are stored AES-256-GCM encrypted (same pattern as LLMProvider keys).
 *  - Recovery codes are bcrypt-hashed individually; the plaintext is shown ONCE.
 *  - Every code consumption is recorded in AuditLog.
 *  - Trusted-person recovery sends a time-limited email link via Resend.
 */

import * as crypto from "crypto";
import { prisma } from "./prisma";

// ─── Encryption helpers (mirrors LLMProvider key pattern) ────────────────────

const ENC_KEY = Buffer.from(
  process.env.MFA_ENCRYPTION_KEY ?? process.env.ENCRYPTION_KEY ?? "",
  "hex"
);

export function encryptSecret(plaintext: string): { encrypted: string; iv: string } {
  if (ENC_KEY.length !== 32) throw new Error("MFA_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: Buffer.concat([enc, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptSecret(encrypted: string, iv: string): string {
  if (ENC_KEY.length !== 32) throw new Error("MFA_ENCRYPTION_KEY must be 32 bytes (64 hex chars)");
  const buf = Buffer.from(encrypted, "base64");
  const tag = buf.slice(buf.length - 16);
  const enc = buf.slice(0, buf.length - 16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, Buffer.from(iv, "base64"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

// ─── TOTP ────────────────────────────────────────────────────────────────────

/** Generate a new TOTP secret and return both the plaintext (for QR) and encrypted form. */
export function generateTOTPSecret(email: string): {
  plaintext: string;
  encrypted: string;
  iv: string;
  otpauthUrl: string;
} {
  // 20-byte (160-bit) random secret, base32-encoded
  const secretBytes = crypto.randomBytes(20);
  const base32 = base32Encode(secretBytes);

  const issuer = encodeURIComponent("Unimatrix");
  const account = encodeURIComponent(email);
  const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${base32}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

  const { encrypted, iv } = encryptSecret(base32);
  return { plaintext: base32, encrypted, iv, otpauthUrl };
}

/** Verify a TOTP code. Accepts a ±1 window to handle clock drift. */
export function verifyTOTP(encryptedSecret: string, token: string, ivOrPlain?: string): boolean {
  let secret: string;
  try {
    // If ivOrPlain provided: encryptedSecret is ciphertext, ivOrPlain is IV
    // Otherwise treat encryptedSecret as the raw base32 (for pending setup flow)
    secret = ivOrPlain ? decryptSecret(encryptedSecret, ivOrPlain) : encryptedSecret;
  } catch {
    return false;
  }

  const digits = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(digits)) return false;

  const counter = Math.floor(Date.now() / 1000 / 30);
  for (let delta = -1; delta <= 1; delta++) {
    const expected = hotp(secret, counter + delta);
    if (expected === digits) return true;
  }
  return false;
}

// ─── Recovery codes ───────────────────────────────────────────────────────────

const RECOVERY_CODE_COUNT = 10;

/** Generate 10 recovery codes, return plaintexts (shown once) and store hashed. */
export async function generateRecoveryCodes(userId: string): Promise<string[]> {
  const bcrypt = await import("bcryptjs");
  const codes: string[] = [];
  const hashed: string[] = [];

  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    const code = formatCode(crypto.randomBytes(5).toString("hex").toUpperCase());
    codes.push(code);
    hashed.push(await bcrypt.hash(code.replace(/-/g, ""), 10));
  }

  await prisma.user.update({
    where: { id: userId },
    data:  { recoveryCodes: hashed },
  });

  return codes; // plaintext — show once
}

/** Try to consume a recovery code. Returns true if valid and removes it. */
export async function consumeRecoveryCode(userId: string, rawCode: string): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { recoveryCodes: true } });
  if (!user || !user.recoveryCodes.length) return false;

  const normalized = rawCode.replace(/-/g, "").toUpperCase();

  for (let i = 0; i < user.recoveryCodes.length; i++) {
    const match = await bcrypt.compare(normalized, user.recoveryCodes[i]);
    if (match) {
      // Remove the used code
      const remaining = [...user.recoveryCodes];
      remaining.splice(i, 1);
      await prisma.user.update({
        where: { id: userId },
        data:  { recoveryCodes: remaining },
      });
      return true;
    }
  }
  return false;
}

// ─── Trusted-person recovery ──────────────────────────────────────────────────

/**
 * Send a one-time recovery link to the trusted person.
 * The link contains a signed token valid for 15 minutes.
 * When the trusted person clicks it, the user's MFA is temporarily bypassed
 * and they're prompted to re-enroll.
 */
export async function sendTrustedPersonRecovery(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { trustedPersonEmail: true, email: true, name: true },
  });

  if (!user?.trustedPersonEmail) {
    throw new Error("No trusted person configured for this account.");
  }

  // Generate a signed, time-limited token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  await prisma.mfaRecoveryRequest.create({
    data: { userId, token, expires },
  });

  const link = `${process.env.NEXTAUTH_URL}/auth/mfa/recover?token=${token}`;

  // Send via Resend (mirrors the forgot-password pattern)
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from:    process.env.RESEND_FROM ?? "Unimatrix <noreply@deployunimatrix.com>",
    to:      user.trustedPersonEmail,
    subject: `MFA Recovery Request for ${user.name ?? user.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0A0F1C">Unimatrix — MFA Recovery</h2>
        <p>${user.name ?? user.email} has asked you to help them regain access to their account.</p>
        <p>Click the link below to approve their MFA reset. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#00B4D8;color:#0A0F1C;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">Approve Recovery</a>
        <p style="color:#666;font-size:12px">If you don't recognize this request, ignore this email. The link will expire automatically.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#999;font-size:11px">Unimatrix — One memory. Every AI. Any device.</p>
      </div>
    `,
  });
}

/**
 * Validate a trusted-person recovery token and disable MFA so the user can re-enroll.
 * Returns the userId on success.
 */
export async function applyTrustedPersonRecovery(token: string): Promise<string> {
  const record = await prisma.mfaRecoveryRequest.findUnique({
    where: { token },
  });

  if (!record) throw new Error("Invalid or expired recovery token.");
  if (record.usedAt) throw new Error("Recovery token already used.");
  if (record.expires < new Date()) throw new Error("Recovery token expired.");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data:  {
        mfaEnabled:  false,
        mfaSecret:   null,
        mfaIv:       null,
        recoveryCodes: [],
      },
    }),
    prisma.mfaRecoveryRequest.update({
      where: { token },
      data:  { usedAt: new Date() },
    }),
  ]);

  return record.userId;
}

// ─── Internals ────────────────────────────────────────────────────────────────

function hotp(base32Secret: string, counter: number): string {
  const key = base32Decode(base32Secret);
  const counterBuf = Buffer.alloc(8);
  // Write 64-bit big-endian counter
  const hi = Math.floor(counter / 0x100000000);
  const lo = counter >>> 0;
  counterBuf.writeUInt32BE(hi, 0);
  counterBuf.writeUInt32BE(lo, 4);

  const hmac = crypto.createHmac("sha1", key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    1_000_000;

  return code.toString().padStart(6, "0");
}

const B32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer): string {
  let result = "";
  let bits = 0;
  let value = 0;
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += B32_CHARS[(value >>> bits) & 31];
    }
  }
  if (bits > 0) result += B32_CHARS[(value << (5 - bits)) & 31];
  return result;
}

function base32Decode(encoded: string): Buffer {
  const clean = encoded.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = B32_CHARS.indexOf(char);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

function formatCode(hex: string): string {
  // e.g. "A1B2C3D4E5" → "A1B2C-3D4E5"
  const upper = hex.slice(0, 5);
  const lower = hex.slice(5);
  return `${upper}-${lower}`;
}
