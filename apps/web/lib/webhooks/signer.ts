/**
 * Webhook Signing Utilities (HMAC-SHA256)
 *
 * Used for outbound webhook security on Vercel + Neon deployments.
 *
 * Header format (inspired by Stripe):
 *   X-Unimatrix-Signature: t=<timestamp>,v1=<signature>
 *
 * Verification on the receiving end should:
 * 1. Check timestamp is within tolerance (e.g. 5 minutes)
 * 2. Compute HMAC-SHA256(secret, `${timestamp}.${JSON.stringify(payload)}`)
 * 3. Compare using timing-safe equal
 */

import crypto from 'crypto';

const VERSION = 'v1';
const TOLERANCE_SECONDS = 5 * 60; // 5 minutes

/**
 * Generate a cryptographically secure webhook secret.
 * Store this in the database (WebhookSubscription.webhookSecret).
 */
export function generateWebhookSecret(): string {
  return 'whsec_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Sign a payload for a specific webhook secret.
 * Returns the value for the X-Unimatrix-Signature header.
 */
export function signWebhookPayload(
  secret: string,
  payload: unknown,
  timestamp: Date = new Date()
): string {
  const timestampSeconds = Math.floor(timestamp.getTime() / 1000);
  const body = JSON.stringify(payload);
  const signedPayload = `${timestampSeconds}.${body}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return `t=${timestampSeconds},${VERSION}=${signature}`;
}

/**
 * Verify an incoming webhook signature.
 * Returns true if valid and within time tolerance.
 */
export function verifyWebhookSignature(
  secret: string,
  signatureHeader: string | null | undefined,
  rawBody: string | Buffer
): { valid: boolean; error?: string } {
  if (!signatureHeader) {
    return { valid: false, error: 'Missing X-Unimatrix-Signature header' };
  }

  const parts = signatureHeader.split(',');
  let timestamp: number | null = null;
  let signature: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = parseInt(value, 10);
    if (key === VERSION) signature = value;
  }

  if (!timestamp || !signature) {
    return { valid: false, error: 'Malformed signature header' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) {
    return { valid: false, error: 'Signature timestamp outside tolerance window' };
  }

  const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  // Timing-safe comparison
  const valid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  return valid
    ? { valid: true }
    : { valid: false, error: 'Signature mismatch' };
}
