/**
 * Role-Based Access Control (RBAC) System
 * 
 * Defines roles, permissions, and middleware for protecting API routes.
 */

export type UserRole = 'user' | 'admin' | 'superadmin';

export type Permission =
  // User permissions
  | 'user:read'
  | 'user:write'
  | 'user:delete'
  // Palace permissions
  | 'palace:read'
  | 'palace:write'
  | 'palace:delete'
  | 'palace:share'
  // Memory permissions
  | 'memory:read'
  | 'memory:write'
  | 'memory:delete'
  // API key permissions
  | 'apikey:read'
  | 'apikey:write'
  | 'apikey:delete'
  // LLM provider permissions
  | 'llm:read'
  | 'llm:write'
  | 'llm:delete'
  // Admin permissions
  | 'admin:read'
  | 'admin:write'
  | 'admin:delete'
  | 'admin:audit'
  // Superadmin permissions
  | 'superadmin:all';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    'user:read',
    'user:write',
    'palace:read',
    'palace:write',
    'palace:delete',
    'palace:share',
    'memory:read',
    'memory:write',
    'memory:delete',
    'apikey:read',
    'apikey:write',
    'apikey:delete',
    'llm:read',
    'llm:write',
    'llm:delete',
  ],
  admin: [
    'user:read',
    'user:write',
    'user:delete',
    'palace:read',
    'palace:write',
    'palace:delete',
    'palace:share',
    'memory:read',
    'memory:write',
    'memory:delete',
    'apikey:read',
    'apikey:write',
    'apikey:delete',
    'llm:read',
    'llm:write',
    'llm:delete',
    'admin:read',
    'admin:write',
    'admin:delete',
    'admin:audit',
  ],
  superadmin: ['superadmin:all'],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  if (role === 'superadmin') return true;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  if (role === 'superadmin') return true;
  return permissions.some(permission => ROLE_PERMISSIONS[role].includes(permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  if (role === 'superadmin') return true;
  return permissions.every(permission => ROLE_PERMISSIONS[role].includes(permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
  if (role === 'superadmin') return ['superadmin:all'];
  return ROLE_PERMISSIONS[role];
}
