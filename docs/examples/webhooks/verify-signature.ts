/**
 * Example: Verifying Unimatrix Webhook Signatures (Node.js / TypeScript)
 *
 * Unimatrix signs every outbound webhook with HMAC-SHA256 using a per-subscription secret.
 *
 * Header format (inspired by Stripe):
 *   X-Unimatrix-Signature: t=1716400000,v1=hexsignature...
 *
 * Security properties:
 * - Timestamp prevents replay outside tolerance window.
 * - Secret is unique per subscription and never returned after creation.
 * - Use constant-time comparison.
 *
 * Recommended: also verify the event type header and room context.
 */

import crypto from 'crypto';

const TOLERANCE_SECONDS = 5 * 60; // 5 minutes

/**
 * Verify an incoming webhook from Unimatrix.
 * Returns true only if signature is valid and recent.
 */
export function verifyUnimatrixWebhook(
  signatureHeader: string | null | undefined,
  rawBody: string | Buffer,
  secret: string,
  toleranceSeconds = TOLERANCE_SECONDS
): { valid: boolean; error?: string } {
  if (!signatureHeader) {
    return { valid: false, error: 'Missing X-Unimatrix-Signature header' };
  }
  if (!secret) {
    return { valid: false, error: 'Webhook secret not configured on receiver' };
  }

  const parts = signatureHeader.split(',');
  let timestamp: number | null = null;
  let signature: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = parseInt(value, 10);
    if (key === 'v1') signature = value;
  }

  if (!timestamp || !signature) {
    return { valid: false, error: 'Malformed X-Unimatrix-Signature header' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return { valid: false, error: 'Signature timestamp outside tolerance window (replay risk)' };
  }

  const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  // CRITICAL: constant-time comparison
  const valid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  return valid
    ? { valid: true }
    : { valid: false, error: 'Signature mismatch' };
}

// ---------------------------------------------------------------------------
// Example usage (Next.js App Router route handler)
// ---------------------------------------------------------------------------
/*
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const rawBody = await req.text(); // Must use raw body for signature
  const sig = req.headers.get('x-unimatrix-signature');
  const event = req.headers.get('x-unimatrix-event');

  const secret = process.env.UNIMATRIX_WEBHOOK_SECRET!; // per-subscription; store securely

  const verification = verifyUnimatrixWebhook(sig, rawBody, secret);
  if (!verification.valid) {
    console.warn('Webhook verification failed:', verification.error);
    return new Response('Invalid signature', { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  if (payload.event !== 'message.created') {
    return new Response('Ignored', { status: 200 });
  }

  // Process payload.room_id + payload.message ...
  await handleCollabMessage(payload);

  return new Response('OK', { status: 200 });
}
*/

// ---------------------------------------------------------------------------
// Example usage (Express)
// ---------------------------------------------------------------------------
/*
app.post('/webhooks/unimatrix', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.header('x-unimatrix-signature');
  const verification = verifyUnimatrixWebhook(sig, req.body, process.env.UNIMATRIX_WEBHOOK_SECRET!);
  if (!verification.valid) return res.status(401).send(verification.error);

  const payload = JSON.parse(req.body.toString());
  // ...
  res.status(200).send('OK');
});
*/

