'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdmin, isSuperAdmin } from '@/lib/middleware/rbac';
import { createAuditLog, AuditActions } from '@/lib/audit-log';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const currentIsSuperAdmin = isSuperAdmin(session.user);
  
  // Only superadmin can manage admin/superadmin roles
  if (!currentIsSuperAdmin && (newRole === 'admin' || newRole === 'superadmin')) {
    return { error: 'Forbidden: Superadmin required for this action' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'User not found' };

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  await createAuditLog({
    action: AuditActions.USER_ROLE_CHANGED,
    actorId: session.user.id,
    actorName: session.user.name,
    actorEmail: session.user.email,
    userId: userId,
    targetType: 'User',
    targetId: userId,
    metadata: {
      oldRole: user.role,
      newRole,
    },
  });

  revalidatePath('/settings/roles');
  return { success: true };
}
