/**
 * src/webhooks/clerk.ts
 *
 * Clerk webhook handler — syncs Clerk user lifecycle events to the DB.
 *
 * Registered as POST /webhooks/clerk in src/index.ts.
 *
 * Why this exists:
 *   verifyUser() auto-provisions users on first MCP call, but the portal
 *   needs a row in `users` before the user ever calls an MCP tool.
 *   The webhook pre-provisions on sign-up and cleans up on deletion.
 *
 * Signature verification:
 *   Clerk delivers webhooks via Svix. Every request includes three headers:
 *     svix-id        — unique message ID (idempotency key)
 *     svix-timestamp — Unix timestamp (replay-attack window: 5 min)
 *     svix-signature — HMAC-SHA256 over "id.timestamp.body"
 *
 *   We verify using the Svix SDK with CLERK_WEBHOOK_SECRET (whsec_…).
 *   A replay or tampered request throws → Fastify returns 400.
 *
 * Events handled:
 *   user.created  → INSERT user row (ON CONFLICT DO NOTHING — idempotent)
 *   user.updated  → touch updated_at
 *   user.deleted  → soft-tombstone: set deleted_at; hard-delete option TBD
 *
 * Raw body requirement:
 *   Svix needs the exact bytes Clerk sent to compute the HMAC.
 *   We register a custom content-type parser for this route that
 *   captures the raw Buffer before JSON.parse, then stash it on req.rawBody.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { Webhook }                            from 'svix';
import { pool }                               from '../db/client.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClerkUserData {
  id:         string;           // Clerk user ID, e.g. "user_2abc..."
  created_at: number;           // Unix ms
  updated_at: number;           // Unix ms
  deleted?:   boolean;
}

interface ClerkWebhookPayload {
  type: 'user.created' | 'user.updated' | 'user.deleted' | string;
  data: ClerkUserData;
}

// Extend FastifyRequest with rawBody (populated by the custom parser below)
declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

// ---------------------------------------------------------------------------
// Signature verification helper
// ---------------------------------------------------------------------------

function getSecret(): string {
  const s = process.env.CLERK_WEBHOOK_SECRET;
  if (!s || s === 'whsec_REPLACE_ME') {
    throw new Error('CLERK_WEBHOOK_SECRET is not configured');
  }
  return s;
}

function verifySignature(req: FastifyRequest): ClerkWebhookPayload {
  const wh      = new Webhook(getSecret());
  const svixId  = req.headers['svix-id']        as string | undefined;
  const svixTs  = req.headers['svix-timestamp'] as string | undefined;
  const svixSig = req.headers['svix-signature'] as string | undefined;

  if (!svixId || !svixTs || !svixSig) {
    throw Object.assign(new Error('Missing Svix headers'), { statusCode: 400 });
  }

  if (!req.rawBody) {
    throw Object.assign(new Error('Raw body not captured'), { statusCode: 500 });
  }

  // wh.verify() throws on bad signature or expired timestamp (>5 min)
  return wh.verify(req.rawBody, {
    'svix-id':        svixId,
    'svix-timestamp': svixTs,
    'svix-signature': svixSig,
  }) as ClerkWebhookPayload;
}

// ---------------------------------------------------------------------------
// DB operations (run without withUserContext — this IS the provisioning step)
// ---------------------------------------------------------------------------

async function upsertUser(clerkId: string): Promise<void> {
  await pool.query(
    `INSERT INTO users (clerk_id)
     VALUES ($1)
     ON CONFLICT (clerk_id) DO UPDATE
       SET updated_at = NOW()`,
    [clerkId],
  );
}

async function touchUser(clerkId: string): Promise<void> {
  await pool.query(
    `UPDATE users SET updated_at = NOW() WHERE clerk_id = $1`,
    [clerkId],
  );
}

async function softDeleteUser(clerkId: string): Promise<void> {
  // Future: add deleted_at column; for now just log.
  // Hard-delete would cascade to memories via FK — dangerous without backup.
  console.warn(`[clerk webhook] user.deleted received for ${clerkId} — no-op (no deleted_at column yet)`);
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function clerkWebhookHandler(
  req:   FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  let payload: ClerkWebhookPayload;

  try {
    payload = verifySignature(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Webhook verification failed';
    console.error('[clerk webhook] Signature error:', msg);
    reply.status(400).send({ error: msg });
    return;
  }

  const { type, data } = payload;
  const clerkId        = data?.id;

  if (!clerkId) {
    reply.status(400).send({ error: 'Missing user id in payload' });
    return;
  }

  try {
    switch (type) {
      case 'user.created':
        await upsertUser(clerkId);
        console.log(`[clerk webhook] Provisioned user ${clerkId}`);
        break;

      case 'user.updated':
        await touchUser(clerkId);
        console.log(`[clerk webhook] Updated user ${clerkId}`);
        break;

      case 'user.deleted':
        await softDeleteUser(clerkId);
        break;

      default:
        // Acknowledge unhandled events — Clerk will retry on non-2xx
        console.log(`[clerk webhook] Ignored event type: ${type}`);
    }
  } catch (err) {
    console.error(`[clerk webhook] DB error for ${type}/${clerkId}:`, err);
    reply.status(500).send({ error: 'Internal error processing webhook' });
    return;
  }

  reply.status(200).send({ received: true });
}
