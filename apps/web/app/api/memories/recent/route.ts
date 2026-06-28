import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? 5)));
  const memories = await prisma.memory.findMany({
    where: {
      deletedAt: null,
      location: {
        deletedAt: null,
        palace: { userId: session.user.id, deletedAt: null },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      content: true,
      tags: true,
      createdAt: true,
      location: { select: { name: true } },
    },
  });

  return NextResponse.json(memories);
}
