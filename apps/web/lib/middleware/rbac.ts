/**
 * RBAC Middleware for API Routes
 * 
 * Protects API routes based on user roles and permissions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, type Permission, type UserRole } from '@/lib/rbac';

export interface RBACOptions {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // if true, requires all permissions; if false, requires any
  requireRole?: UserRole;
  requireRoles?: UserRole[];
}

/**
 * Middleware to check if the current user has the required permissions
 */
export async function withRBAC(
  handler: (req: NextRequest, context: { user: any }) => Promise<NextResponse>,
  options: RBACOptions = {}
) {
  return async (req: NextRequest) => {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as { id: string; email: string; role?: string };

    // Check role requirements
    if (options.requireRole && user.role !== options.requireRole) {
      return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 });
    }

    if (options.requireRoles && !options.requireRoles.includes(user.role as UserRole)) {
      return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 });
    }

    // Check permission requirements
    const role = (user.role || 'user') as UserRole;
    
    if (options.permission && !hasPermission(role, options.permission)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    if (options.permissions) {
      const hasPerms = options.requireAll
        ? options.permissions.every(p => hasPermission(role, p))
        : options.permissions.some(p => hasPermission(role, p));
      
      if (!hasPerms) {
        return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
      }
    }

    // Pass user context to handler
    return handler(req, { user });
  };
}

/**
 * Helper to check if user is admin or superadmin
 */
export function isAdmin(user: { role?: string }): boolean {
  return user.role === 'admin' || user.role === 'superadmin';
}

/**
 * Helper to check if user is superadmin
 */
export function isSuperAdmin(user: { role?: string }): boolean {
  return user.role === 'superadmin';
}
