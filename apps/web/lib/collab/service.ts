/**
 * Unimatrix Collaboration Service
 *
 * Core business logic for multi-agent collaboration rooms.
 * All operations are organization-scoped.
 *
 * Designed for Vercel + Neon Postgres.
 */

import { prisma } from '@/lib/prisma';
import {
  SendMessageInput,
  GetMessagesInput,
  SubscribeWebhookInput,
  CreateRoomInput,
  ListRoomsInput,
  SendMessageResult,
  SubscribeWebhookResult,
  CreateRoomResult,
  CollabMessageDTO,
  CollabRoomDTO,
  SenderType,
} from './types';
import { generateWebhookSecret, signWebhookPayload } from '@/lib/webhooks/signer';
import { rateLimiters } from '@/lib/rate-limit';
import { publishToRoom } from '@/lib/realtime/ably'; // Preferred managed realtime (see architecture review)

// ============================================================================
// ERRORS
// ============================================================================

export class CollabError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_ERROR' | 'INTERNAL',
    public status: number = 400
  ) {
    super(message);
    this.name = 'CollabError';
  }
}

// Lightweight audit hook. Replace with real impl writing to AuditLog table.
async function logCollabAudit(entry: {
  organizationId: string;
  action: string;
  actorId?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  // In production: await prisma.auditLog.create({ data: { organizationId: ..., action, actorId, targetId, metadata: entry.metadata ?? {} } })
  if (process.env.NODE_ENV !== 'production') {
    console.log('[audit:collab]', entry);
  }
}

// ============================================================================
// AUTHORIZATION HELPERS (Organization-scoped)
// ============================================================================

async function assertRoomAccess(roomId: string, organizationId: string) {
  if (!organizationId) {
    throw new CollabError('Organization context required for room access', 'FORBIDDEN', 403);
  }

  const room = await prisma.collabRoom.findFirst({
    where: {
      id: roomId,
      organizationId,
    },
    select: { id: true, organizationId: true },
  });

  if (!room) {
    throw new CollabError('Room not found or access denied', 'NOT_FOUND', 404);
  }
}

async function assertRoomOwnershipForWebhook(roomId: string, organizationId: string) {
  await assertRoomAccess(roomId, organizationId);
}

// ============================================================================
// CORE OPERATIONS
// ============================================================================

/**
 * Send a message to a collaboration room.
 * - Organization-scoped
 * - Persists with Prisma
 * - Publishes to realtime (Ably preferred)
 * - Triggers webhook fan-out (best-effort; use QStash in prod)
 * - Applies per-room rate limit protection (defense in depth)
 */
export async function sendMessage(
  input: SendMessageInput,
  organizationId: string
): Promise<SendMessageResult> {
  const validated = SendMessageInput.parse(input);

  await assertRoomAccess(validated.room_id, organizationId);

  // Defense-in-depth room burst protection (routes also check)
  const roomRl = await rateLimiters.roomMessageSend(validated.room_id);
  if (!roomRl.success) {
    throw new CollabError('Rate limit exceeded for this room', 'VALIDATION_ERROR', 429);
  }

  // Use transaction for message + side effects consistency where possible
  const message = await prisma.collabMessage.create({
    data: {
      roomId: validated.room_id,
      senderId: validated.sender_id ?? null,
      senderName: validated.sender_name,
      senderType: validated.sender_type,
      message: validated.message,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: validated.metadata as any,
    },
  });

  // Realtime broadcast (non-blocking, managed provider)
  const realtimePayload = {
    id: message.id,
    room_id: message.roomId,
    sender_id: message.senderId,
    sender_name: message.senderName,
    sender_type: message.senderType,
    message: message.message,
    metadata: message.metadata,
    created_at: message.createdAt.toISOString(),
  };

  publishToRoom(validated.room_id, 'message.created', realtimePayload).catch((err) => {
    console.warn('[collab] Realtime publish failed (non-fatal):', err?.message || err);
  });

  // Webhook fan-out (fire-and-forget; production must use reliable queue)
  dispatchMessageWebhooks(validated.room_id, message, organizationId).catch((err) => {
    console.error('[collab] Webhook dispatch failed (non-fatal):', err);
  });

  // Audit hook (fire and forget; implement real writer in lib/audit)
  logCollabAudit({
    organizationId,
    action: 'collab.message.created',
    actorId: validated.sender_id ?? undefined,
    targetId: message.id,
    metadata: { roomId: validated.room_id, senderType: validated.sender_type },
  }).catch(() => {});

  return {
    message_id: message.id,
    timestamp: message.createdAt.toISOString(),
  };
}

/**
 * Retrieve messages from a room with cursor-based pagination.
 * Cursor uses message id for stable ordering (avoids timestamp skew).
 */
export async function getMessages(
  input: GetMessagesInput,
  organizationId: string
): Promise<CollabMessageDTO[]> {
  const validated = GetMessagesInput.parse(input);

  await assertRoomAccess(validated.room_id, organizationId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    roomId: validated.room_id,
  };

  if (validated.since_id) {
    where.id = { gt: validated.since_id };
  }

  const messages = await prisma.collabMessage.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    take: validated.limit,
  });

  return messages.map((m: any) => ({
    id: m.id,
    room_id: m.roomId,
    sender_id: m.senderId,
    sender_name: m.senderName,
    sender_type: m.senderType as SenderType,
    message: m.message,
    metadata: m.metadata as Record<string, unknown>,
    created_at: m.createdAt.toISOString(),
  }));
}

/**
 * Subscribe a webhook to a room.
 * Returns the secret **only once** (never stored in logs or returned again).
 * Webhook ownership is enforced via room organization scoping.
 */
export async function subscribeWebhook(
  input: SubscribeWebhookInput,
  organizationId: string
): Promise<SubscribeWebhookResult> {
  const validated = SubscribeWebhookInput.parse(input);

  await assertRoomOwnershipForWebhook(validated.room_id, organizationId);

  // Per-target protection (prevents subscription bombing a victim endpoint)
  const targetRl = await rateLimiters.webhookDelivery(validated.target_url);
  if (!targetRl.success) {
    throw new CollabError('Too many webhook subscriptions for this target recently', 'VALIDATION_ERROR', 429);
  }

  const secret = generateWebhookSecret();

  const subscription = await prisma.webhookSubscription.create({
    data: {
      roomId: validated.room_id,
      targetUrl: validated.target_url,
      webhookSecret: secret,
    },
  });

  logCollabAudit({
    organizationId,
    action: 'collab.webhook.subscribed',
    targetId: subscription.id,
    metadata: { roomId: validated.room_id, target: validated.target_url.replace(/https?:\/\/[^/]+/, 'REDACTED') },
  }).catch(() => {});

  return {
    subscription_id: subscription.id,
    webhook_secret: secret,
  };
}

// ============================================================================
// WEBHOOK DISPATCH (Vercel + Upstash QStash recommended)
// ============================================================================

// ============================================================================
// ROOM MANAGEMENT (required for usable collab system)
// ============================================================================

/**
 * Create a new collaboration room within the organization.
 */
export async function createRoom(
  input: CreateRoomInput,
  organizationId: string
): Promise<CreateRoomResult> {
  const validated = CreateRoomInput.parse(input);

  if (!organizationId) {
    throw new CollabError('Organization context required', 'FORBIDDEN', 403);
  }

  const room = await prisma.collabRoom.create({
    data: {
      organizationId,
      name: validated.name,
      description: validated.description ?? null,
      isPrivate: validated.isPrivate,
    },
  });

  logCollabAudit({
    organizationId,
    action: 'collab.room.created',
    targetId: room.id,
    metadata: { name: validated.name },
  }).catch(() => {});

  return {
    room_id: room.id,
    name: room.name,
  };
}

/**
 * List rooms for the given organization (lightweight, no message counts for perf).
 */
export async function listRooms(
  input: ListRoomsInput = {},
  organizationId: string
): Promise<CollabRoomDTO[]> {
  const validated = ListRoomsInput.parse(input);

  if (!organizationId) {
    throw new CollabError('Organization context required', 'FORBIDDEN', 403);
  }

  const rooms = await prisma.collabRoom.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: validated.limit,
    select: {
      id: true,
      name: true,
      description: true,
      isPrivate: true,
      createdAt: true,
    },
  });

  return rooms.map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    is_private: r.isPrivate,
    created_at: r.createdAt.toISOString(),
  }));
}

// ============================================================================
// WEBHOOK DISPATCH (Production: Enqueue via Upstash QStash / Inngest / Bull)
// ============================================================================

async function dispatchMessageWebhooks(
  roomId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any,
  organizationId: string
) {
  const subscriptions = await prisma.webhookSubscription.findMany({
    where: {
      roomId,
      isActive: true,
    },
  });

  if (subscriptions.length === 0) return;

  const payload = {
    event: 'message.created',
    room_id: roomId,
    message: {
      id: message.id,
      sender_name: message.senderName,
      sender_type: message.senderType,
      message: message.message,
      metadata: message.metadata,
      created_at: message.createdAt.toISOString(),
    },
    organization_id: organizationId,
  };

  // Production recommendation: instead of in-process fan-out,
  // await qstashClient.publishJSON({ url: '/api/internal/deliver-webhooks', body: { roomId, messageId: message.id } })
  // This gives you retries, DLQ, visibility, and avoids tying up the MCP/REST handler.

  await Promise.allSettled(
    subscriptions.map(async (sub: any) => {
      // Per-target delivery protection
      const deliveryRl = await rateLimiters.webhookDelivery(sub.targetUrl);
      if (!deliveryRl.success) {
        console.warn(`[webhook] Skipping delivery to ${sub.targetUrl} (rate limited)`);
        return;
      }

      try {
        const signature = signWebhookPayload(sub.webhookSecret, payload);

        const res = await fetch(sub.targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Unimatrix-Signature': signature,
            'X-Unimatrix-Event': 'message.created',
            'User-Agent': 'Unimatrix-Webhooks/1.0',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        // Update last triggered (fire and forget)
        prisma.webhookSubscription
          .update({
            where: { id: sub.id },
            data: { lastTriggeredAt: new Date() },
          })
          .catch(() => {});
      } catch (err) {
        console.error(`[webhook] Failed to deliver to ${sub.targetUrl}:`, err);
        // In production: write to a WebhookDeliveryAttempts table or send to QStash DLQ topic.
        // Consider marking subscription inactive after N consecutive failures.
      }
    })
  );
}
