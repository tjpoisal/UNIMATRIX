/**
 * POST /api/pending-actions/:id/approve
 * Approves a pending action so it can be executed by the agent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/api-auth';
import { approvePendingAction } from '@/lib/telemetry/agent-usage';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthContext(req);
  if (!auth?.userId || !auth.organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RBAC: Only owners and admins can approve
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: auth.organizationId,
        userId: auth.userId,
      },
    },
  });

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Only organization owners and admins can approve actions' }, { status: 403 });
  }

  try {
    const updated = await approvePendingAction(params.id, auth.userId);

    // Log to audit
    await prisma.auditLog.create({
      data: {
        organizationId: auth.organizationId,
        actorId: auth.userId,
        action: 'pending_action.approved',
        targetType: 'PendingAction',
        targetId: params.id,
        metadata: { previousStatus: 'pending' },
      },
    });

    return NextResponse.json({ success: true, action: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to approve action' }, { status: 500 });
  }
}
