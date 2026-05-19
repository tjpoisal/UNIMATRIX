import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/llm-providers/[id] — disconnect a provider
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const record = await prisma.lLMProvider.findUnique({ where: { id } });
  if (!record || record.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.lLMProvider.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
