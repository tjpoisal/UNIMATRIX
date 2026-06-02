/**
 * Rate Limiting for Unimatrix (Vercel + Upstash Redis)
 *
 * Per-tenant, per-resource protection for a multi-LLM collaboration platform.
 *
 * Layers (defense in depth):
 * 1. Per API key (tool execution burst)
 * 2. Per room (message send protection against noisy agents)
 * 3. Per webhook target (protect downstream systems from subscription abuse)
 *
 * Storage: Upstash Redis (serverless, global, works on Vercel, Railway, Fly.io)
 * Fallback: permissive no-op when REDIS not configured (local dev only).
 *
 * Production: always configure UPSTASH_REDIS_REST_URL + TOKEN.
 * For even stronger guarantees on self-hosted, you can swap to ioredis + fixed-window or token-bucket.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

function getRatelimit() {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[rate-limit] Upstash Redis not configured — rate limiting is NO-OP (dev only). Do not run prod without this.');
    return null;
  }

  const redis = new Redis({ url, token });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'unimatrix_rl',
  });

  return ratelimit;
}

export async function checkRateLimit(
  identifier: string,
  _options?: { limit?: number; window?: string }
) {
  const limiter = getRatelimit();
  if (!limiter) {
    return { success: true, remaining: 999, reset: Date.now() + 60_000 };
  }

  // Allow per-caller override of the limiter config in future by creating named limiters
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

// Pre-configured named limiters (used by routes + services)
export const rateLimiters = {
  /** Per-API-key tool execution (covers MCP + /api/tools/call + memory ops) */
  apiKeyToolExecution: (identifier: string) =>
    checkRateLimit(`tool:${identifier}`, { limit: 120, window: '1m' }),

  /** Per-room message creation (protects against runaway agents / loops) */
  roomMessageSend: (roomId: string) =>
    checkRateLimit(`room:${roomId}`, { limit: 300, window: '1m' }),

  /** Per-webhook-target delivery + subscribe throttling */
  webhookDelivery: (targetUrl: string) =>
    checkRateLimit(`webhook:${targetUrl}`, { limit: 30, window: '1m' }),
};

/**
 * Helper to build a 429 response with proper Retry-After.
 * Usage in route handlers:
 *   const rl = await rateLimiters.xxx(key);
 *   if (!rl.success) return rateLimitResponse(rl);
 */
export function rateLimitResponse(rl: { reset: number }, message = 'Rate limit exceeded') {
  const retryAfter = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfter),
    },
  });
}
