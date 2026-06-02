/**
 * Realtime Adapter — Ably (Recommended for Vercel + Neon)
 *
 * Why Ably on this stack:
 * - Excellent Vercel integration (serverless-friendly)
 * - Presence, history, and channel-level auth
 * - No long-lived connections in your Next.js app
 * - Scales far beyond what you can achieve with ws/Socket.IO on Vercel
 *
 * Alternative considered:
 * - Pusher (very similar)
 * - Supabase Realtime (if you were already deep in Supabase)
 * - Raw ws + Redis adapter → high operational burden on Vercel
 *
 * Setup:
 * 1. npm install ably
 * 2. Set ABLY_API_KEY in Vercel + local .env
 */

import Ably from 'ably';

let ablyClient: Ably.Rest | null = null;

function getAblyClient() {
  if (ablyClient) return ablyClient;

  const key = process.env.ABLY_API_KEY;
  if (!key) {
    // Graceful degradation: realtime is best-effort when not configured
    console.warn('[realtime] ABLY_API_KEY not set — realtime publish will be a no-op. Configure for production multi-agent UX.');
    return null;
  }

  ablyClient = new Ably.Rest(key);
  return ablyClient;
}

/**
 * Publish a message to a collaboration room channel.
 * Call this after a successful sendMessage in the service.
 * No-op if Ably is not configured (webhooks + polling still work).
 */
export async function publishToRoom(
  roomId: string,
  event: 'message.created',
  data: unknown
) {
  const client = getAblyClient();
  if (!client) return;

  try {
    const channel = client.channels.get(`collab:room:${roomId}`);
    await channel.publish(event, data);
  } catch (err) {
    // Never throw from realtime — it is auxiliary to persistence + webhooks
    console.warn('[ably] publish error (non-fatal):', (err as Error)?.message);
  }
}

/**
 * For client-side (browser / agent):
 * Use Ably's JS SDK with token auth (recommended) or API key (dev only).
 *
 * Example client connection:
 * const ably = new Ably.Realtime({ key: '...' });
 * const channel = ably.channels.get(`collab:room:${roomId}`);
 * channel.subscribe('message.created', (msg) => { ... });
 */
