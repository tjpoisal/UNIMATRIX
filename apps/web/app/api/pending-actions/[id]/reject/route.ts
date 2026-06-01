/**
 * POST /api/pending-actions/:id/reject
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { rejectPendingAction } from '@/lib/telemetry/agent-usage';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthContext(req);
  if (!auth?.userId || !auth.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: auth.organizationId,
        userId: auth.userId,
      },
    },
  });

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Only organization owners and admins can reject actions' }, { status: 403 });
  }

  try {
    const updated = await rejectPendingAction(id, auth.userId);

    await prisma.auditLog.create({
      data: {
        organizationId: auth.organizationId,
        actorId: auth.userId,
        action: 'pending_action.rejected',
        targetType: 'PendingAction',
        targetId: id,
      },
    });

    return NextResponse.json({ success: true, action: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reject action' }, { status: 500 });
  }
}
