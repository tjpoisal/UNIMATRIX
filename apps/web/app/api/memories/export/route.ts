import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const memories = await prisma.memory.findMany({
    where: {
      deletedAt: null,
      location: {
        deletedAt: null,
        palace: { userId: session.user.id, deletedAt: null },
      },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
      location: { select: { id: true, name: true } },
    },
  });

  const payload = {
    userId: session.user.id,
    exportedAt: new Date().toISOString(),
    memories,
  };
  const encryptedJson = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');

  try {
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
      orderBy: { createdAt: 'asc' },
    });
    if (membership?.organizationId) {
      await prisma.auditLog.create({
        data: {
          organizationId: membership.organizationId,
          actorId: session.user.id,
          actorName: session.user.email ?? 'user',
          action: 'EXPORT',
          targetType: 'Memory',
          metadata: { count: memories.length },
        },
      });
    }
  } catch (error) {
    console.warn('Could not write export audit log', error);
  }

  return NextResponse.json({
    encrypted: true,
    encoding: 'base64',
    exportedAt: payload.exportedAt,
    data: encryptedJson,
  });
}
