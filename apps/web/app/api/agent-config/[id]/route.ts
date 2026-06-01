import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthContext(req);
  if (!auth?.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Only allow safe fields
  const allowed = ['daily_spend_limit', 'requires_hitl', 'context_window_max', 'hitl_tool_rules'];
  const data: any = {};

  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const updated = await prisma.agentConfig.update({
    where: {
      id: params.id,
      organizationId: auth.organizationId, // enforce ownership
    },
    data,
  });

  return NextResponse.json(updated);
}
