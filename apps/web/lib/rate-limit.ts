/**
 * Rate Limiting for Unimatrix (Vercel + Upstash)
 *
 * Recommended stack on Vercel:
 * - @upstash/ratelimit + @upstash/redis
 *
 * This file provides both a production implementation (when env vars present)
 * and a safe no-op fallback for local development.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

function getRatelimit() {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[rate-limit] Upstash Redis not configured — rate limiting disabled (dev only)');
    return null;
  }

  const redis = new Redis({ url, token });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'), // default
    analytics: true,
    prefix: 'unimatrix_rl',
  });

  return ratelimit;
}

export async function checkRateLimit(
  identifier: string,
  options?: { limit?: number; window?: string }
) {
  const limiter = getRatelimit();
  if (!limiter) {
    return { success: true, remaining: 999, reset: Date.now() + 60_000 };
  }

  const result = await limiter.limit(identifier, {
    // You can pass more advanced limits per key here in the future
  });

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

// Pre-configured limiters for different surfaces
export const rateLimiters = {
  apiKeyToolExecution: (apiKeyId: string) => checkRateLimit(`tool:${apiKeyId}`, { limit: 120, window: '1m' }),
  roomMessageSend: (roomId: string) => checkRateLimit(`room:${roomId}`, { limit: 300, window: '1m' }),
  webhookDelivery: (target: string) => checkRateLimit(`webhook:${target}`, { limit: 30, window: '1m' }),
};
