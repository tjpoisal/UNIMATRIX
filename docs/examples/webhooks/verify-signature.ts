/**
 * Example: Verifying Unimatrix Webhook Signatures (Node.js / TypeScript)
 *
 * Use this in your webhook receiver (any language).
 */

import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.UNIMATRIX_WEBHOOK_SECRET!; // Store securely

export function verifyUnimatrixWebhook(
  signatureHeader: string,
  rawBody: string | Buffer,
  toleranceSeconds = 300
): boolean {
  const parts = signatureHeader.split(',');
  let timestamp: number | null = null;
  let signature: string | null = null;

  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k === 't') timestamp = parseInt(v, 10);
    if (k === 'v1') signature = v;
  }

  if (!timestamp || !signature) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) return false;

  const signedPayload = `${timestamp}.${rawBody.toString('utf8')}`;
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Usage in Next.js / Express / Fastify route:
// const rawBody = await request.text();
// const sig = request.headers.get('x-unimatrix-signature');
// if (!verifyUnimatrixWebhook(sig, rawBody)) {
//   return new Response('Invalid signature', { status: 401 });
// }
