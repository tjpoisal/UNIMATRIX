/**
 * REST fallback for collaboration messages
 * GET  /api/collab/rooms/:roomId/messages
 * POST /api/collab/rooms/:roomId/messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
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
  { params }: { params: { roomId: string } }
) {
  const auth = await getAuthContext(req);
  if (!auth?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const since_id = searchParams.get('since_id') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const messages = await getMessages(
      { room_id: params.roomId, since_id, limit },
      auth.organizationId || ''
    );
    return NextResponse.json({ messages });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const auth = await getAuthContext(req);
  if (!auth?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const input = PostMessageSchema.parse(body);

    const result = await sendMessage(
      {
        room_id: params.roomId,
        sender_id: auth.userId,
        sender_name: input.sender_name,
        sender_type: input.sender_type,
        message: input.message,
        metadata: input.metadata ?? {},
      },
      auth.organizationId || ''
    );

    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
