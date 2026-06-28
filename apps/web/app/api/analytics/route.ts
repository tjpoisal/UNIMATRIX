import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const memories = await prisma.memory.findMany({
    where: {
      deletedAt: null,
      location: { palace: { userId: session.user.id, deletedAt: null } },
    },
    select: {
      id: true,
      tags: true,
      content: true,
      createdAt: true,
      lastAccessed: true,
    },
  });

  const byTier = { hot: 0, warm: 0, cold: 0, archive: 0 };
  const bySource: Record<string, number> = {};
  const tagCounts = new Map<string, number>();
  const createdByDayMap = new Map<string, number>();

  for (let i = 0; i < 30; i += 1) {
    const d = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
    createdByDayMap.set(dayKey(d), 0);
  }

  let totalRecalls = 0;
  let injectedTokens = 0;
  let baselineTokens = 0;
  const topRecalled: Array<{ id: string; recalls: number }> = [];

  memories.forEach((memory) => {
    const tags = memory.tags ?? [];
    const lowered = tags.map((tag) => tag.toLowerCase());
    if (lowered.includes('tier:hot')) byTier.hot += 1;
    else if (lowered.includes('tier:cold')) byTier.cold += 1;
    else if (lowered.includes('tier:archive')) byTier.archive += 1;
    else byTier.warm += 1;

    const sourceTag = tags.find((tag) => tag.startsWith('llm-source:'));
    const source = sourceTag ? sourceTag.replace('llm-source:', '') : 'unknown';
    bySource[source] = (bySource[source] ?? 0) + 1;

    tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));

    const day = dayKey(memory.createdAt);
    if (createdByDayMap.has(day)) {
      createdByDayMap.set(day, (createdByDayMap.get(day) ?? 0) + 1);
    }

    const recalls = memory.lastAccessed > memory.createdAt ? 1 : 0;
    totalRecalls += recalls;
    topRecalled.push({ id: memory.id, recalls });

    const tokenEstimate = Math.ceil(memory.content.length / 4);
    injectedTokens += Math.min(tokenEstimate, 200);
    baselineTokens += tokenEstimate;
  });

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
    orderBy: { createdAt: 'asc' },
  });
  const auditLog = membership
    ? await prisma.auditLog.findMany({
        where: { organizationId: membership.organizationId },
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: { id: true, action: true, actorName: true, createdAt: true, metadata: true },
      })
    : [];

  return NextResponse.json({
    totalMemories: memories.length,
    byTier,
    bySource,
    createdByDay: Array.from(createdByDayMap.entries()).map(([date, count]) => ({ date, count })),
    topTags: Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    totalRecalls,
    estimatedTokensSaved: Math.max(0, baselineTokens - injectedTokens),
    topRecalled: topRecalled.sort((a, b) => b.recalls - a.recalls).slice(0, 20),
    auditLog,
  });
}
