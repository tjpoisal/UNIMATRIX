/**
 * Unimatrix Collaboration Types & Zod Schemas
 * Production-grade validation for multi-tenant collab system (Vercel + Neon)
 */

import { z } from 'zod';

export const SenderType = z.enum(['human', 'agent', 'system']);
export type SenderType = z.infer<typeof SenderType>;

export const SendMessageInput = z.object({
  room_id: z.string().min(1, "room_id is required"),
  sender_id: z.string().optional(),
  sender_name: z.string().min(1).max(120),
  sender_type: SenderType,
  message: z.string().min(1).max(8000),
  metadata: z.record(z.unknown()).optional().default({}),
});

export type SendMessageInput = z.infer<typeof SendMessageInput>;

export const GetMessagesInput = z.object({
  room_id: z.string().min(1),
  since_id: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export type GetMessagesInput = z.infer<typeof GetMessagesInput>;

export const SubscribeWebhookInput = z.object({
  room_id: z.string().min(1),
  target_url: z.string().url("target_url must be a valid URL"),
});

export type SubscribeWebhookInput = z.infer<typeof SubscribeWebhookInput>;

// Response types
export interface CollabMessageDTO {
  id: string;
  room_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_type: SenderType;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SendMessageResult {
  message_id: string;
  timestamp: string;
}

export interface SubscribeWebhookResult {
  subscription_id: string;
  webhook_secret: string; // Only returned once on creation
}
