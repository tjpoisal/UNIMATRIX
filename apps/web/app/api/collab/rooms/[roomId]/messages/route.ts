/**
 * REST fallback for collaboration messages
 * GET  /api/collab/rooms/:roomId/messages
 * POST /api/collab/rooms/:roomId/messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api-auth';
import { rateLimiters } from '@/lib/rate-limit';
import { getMessages, sendMessage } from '@/lib/collab/service';
import { z } from 'zod';

const PostMessageSchema = z.object({
  sender_name: z.string().min(1),
  sender_type: z.enum(['human', 'agent', 'system']),
  message: z.string().min(1).max(8000),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  let ctx: Awaited<ReturnType<typeof requireAuthContext>>;
  try {
    ctx = await requireAuthContext(req);
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message || 'Unauthorized' }, { status });
  }

  const { searchParams } = req.nextUrl;
  const since_id = searchParams.get('since_id') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const messages = await getMessages(
      { room_id: roomId, since_id, limit },
      ctx.organizationId
    );
    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  let ctx: Awaited<ReturnType<typeof requireAuthContext>>;
  try {
    ctx = await requireAuthContext(req);
  } catch (e: any) {
    const status = e?.status ?? 401;
    return NextResponse.json({ error: e?.message || 'Unauthorized' }, { status });
  }

  // Per-room burst protection (in addition to per-key limits)
  const roomRl = await rateLimiters.roomMessageSend(roomId);
  if (!roomRl.success) {
    return NextResponse.json(
      { error: 'Room rate limit exceeded. Too many messages in short window.' },
      { status: 429, headers: { 'Retry-After': Math.ceil((roomRl.reset - Date.now()) / 1000).toString() } }
    );
  }

  try {
    const body = await req.json();
    const input = PostMessageSchema.parse(body);

    const result = await sendMessage(
      {
        room_id: roomId,
        sender_id: ctx.userId,
        sender_name: input.sender_name,
        sender_type: input.sender_type,
        message: input.message,
        metadata: input.metadata ?? {},
      },
      ctx.organizationId
    );

    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
