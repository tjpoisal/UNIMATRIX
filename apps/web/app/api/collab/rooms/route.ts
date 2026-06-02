/**
 * REST fallback for collaboration rooms
 * GET  /api/collab/rooms          — list rooms for org
 * POST /api/collab/rooms          — create room
 *
 * These complement the MCP tools (collab.list_rooms / collab.create_room)
 * and the message sub-resource under /rooms/:roomId/messages
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/api-auth';
import { rateLimiters } from '@/lib/rate-limit';
import { listRooms, createRoom } from '@/lib/collab/service';
import { z } from 'zod';

const CreateRoomSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  is_private: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  let ctx: Awaited<ReturnType<typeof requireAuthContext>>;
  try {
    ctx = await requireAuthContext(req);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unauthorized' }, { status: e?.status ?? 401 });
  }

  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const rooms = await listRooms({ limit }, ctx.organizationId);
    return NextResponse.json({ rooms });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function POST(req: NextRequest) {
  let ctx: Awaited<ReturnType<typeof requireAuthContext>>;
  try {
    ctx = await requireAuthContext(req);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unauthorized' }, { status: e?.status ?? 401 });
  }

  // Light rate limit on room creation per org/key
  const key = ctx.organizationId;
  const rl = await rateLimiters.apiKeyToolExecution(`room-create:${key}`);
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limit exceeded creating rooms' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const input = CreateRoomSchema.parse(body);

    const result = await createRoom(
      {
        name: input.name,
        description: input.description,
        isPrivate: input.is_private,
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
