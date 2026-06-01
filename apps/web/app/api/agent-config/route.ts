import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await getAuthContext(req);
  if (!auth?.organizationId) {
    return NextResponse.json({ error: 'Organization context required' }, { status: 401 });
  }

  const configs = await prisma.agentConfig.findMany({
    where: { organizationId: auth.organizationId },
    orderBy: { agent_name: 'asc' },
  });

  return NextResponse.json({ configs });
}
