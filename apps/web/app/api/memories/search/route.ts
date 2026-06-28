import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get('q');
  const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? 5)));
  if (!q) {
    return NextResponse.json({ error: 'Missing q query parameter' }, { status: 400 });
  }

  const memories = await prisma.memory.findMany({
    where: {
      deletedAt: null,
      location: {
        palace: { userId, deletedAt: null },
      },
      OR: [
        { content: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q] } },
      ],
    },
    orderBy: { lastAccessed: 'desc' },
    take: limit,
    select: {
      id: true,
      content: true,
      tags: true,
      createdAt: true,
    },
  });

  return NextResponse.json(memories);
}
