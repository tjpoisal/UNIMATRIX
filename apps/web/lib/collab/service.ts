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
  SendMessageResult,
  SubscribeWebhookResult,
  CollabMessageDTO,
  SenderType,
} from './types';
import { generateWebhookSecret, signWebhookPayload } from '@/lib/webhooks/signer';
import { z } from 'zod';

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

// ============================================================================
// AUTHORIZATION HELPERS (Organization-scoped)
// ============================================================================

async function assertRoomAccess(roomId: string, organizationId: string | null) {
  if (!organizationId) {
    throw new CollabError('Organization context required', 'FORBIDDEN', 403);
  }

  const room = await prisma.collabRoom.findFirst({
    where: {
      id: roomId,
      organizationId,
    },
    select: { id: true },
  });

  if (!room) {
    throw new CollabError('Room not found or access denied', 'NOT_FOUND', 404);
  }
}

// ============================================================================
// CORE OPERATIONS
// ============================================================================

/**
 * Send a message to a collaboration room.
 * Triggers webhook dispatch (via QStash in production).
 */
export async function sendMessage(
  input: SendMessageInput,
  organizationId: string
): Promise<SendMessageResult> {
  const validated = SendMessageInput.parse(input);

  await assertRoomAccess(validated.room_id, organizationId);

  const message = await prisma.collabMessage.create({
    data: {
      roomId: validated.room_id,
      senderId: validated.sender_id ?? null,
      senderName: validated.sender_name,
      senderType: validated.sender_type,
      message: validated.message,
      metadata: validated.metadata as any,
    },
  });

  // Fire-and-forget webhook dispatch (in production this should go through Upstash QStash)
  // We call a non-blocking dispatcher
  dispatchMessageWebhooks(validated.room_id, message, organizationId).catch((err) => {
    console.error('[collab] Webhook dispatch failed (non-fatal):', err);
  });

  return {
    message_id: message.id,
    timestamp: message.createdAt.toISOString(),
  };
}

/**
 * Retrieve messages from a room with cursor-based pagination.
 */
export async function getMessages(
  input: GetMessagesInput,
  organizationId: string
): Promise<CollabMessageDTO[]> {
  const validated = GetMessagesInput.parse(input);

  await assertRoomAccess(validated.room_id, organizationId);

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

  return messages.map((m) => ({
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
 * Returns the secret **only once**.
 */
export async function subscribeWebhook(
  input: SubscribeWebhookInput,
  organizationId: string
): Promise<SubscribeWebhookResult> {
  const validated = SubscribeWebhookInput.parse(input);

  await assertRoomAccess(validated.room_id, organizationId);

  const secret = generateWebhookSecret();

  const subscription = await prisma.webhookSubscription.create({
    data: {
      roomId: validated.room_id,
      targetUrl: validated.target_url,
      webhookSecret: secret,
    },
  });

  return {
    subscription_id: subscription.id,
    webhook_secret: secret,
  };
}

// ============================================================================
// WEBHOOK DISPATCH (Vercel + Upstash QStash recommended)
// ============================================================================

async function dispatchMessageWebhooks(
  roomId: string,
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

  // In production on Vercel: use Upstash QStash for reliable delivery + retries
  // For now we do best-effort (acceptable for early stage)
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        const signature = signWebhookPayload(sub.webhookSecret, payload);

        await fetch(sub.targetUrl, {
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

        // Update last triggered (fire and forget)
        prisma.webhookSubscription
          .update({
            where: { id: sub.id },
            data: { lastTriggeredAt: new Date() },
          })
          .catch(() => {});
      } catch (err) {
        console.error(`[webhook] Failed to deliver to ${sub.targetUrl}:`, err);
        // TODO: Send to dead-letter queue / QStash failure topic in production
      }
    })
  );
}
