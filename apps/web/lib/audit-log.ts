/**
 * Audit Logging System
 * 
 * Records all important actions for security, compliance, and debugging.
 * Supports both organization-level and user-level audit logs.
 */

import { prisma } from './prisma';

export interface AuditLogEntry {
  action: string;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  userId?: string;
  organizationId?: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        actorId: entry.actorId,
        actorName: entry.actorName,
        actorEmail: entry.actorEmail,
        userId: entry.userId,
        organizationId: entry.organizationId,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata || {},
      },
    });
  } catch (error) {
    // Never throw from audit logging - it's auxiliary to the main operation
    console.error('[audit] Failed to create audit log:', error);
  }
}

/**
 * Common audit log actions
 */
export const AuditActions = {
  // User actions
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_ROLE_CHANGED: 'user.role_changed',
  USER_TIER_CHANGED: 'user.tier_changed',
  
  // Palace actions
  PALACE_CREATED: 'palace.created',
  PALACE_UPDATED: 'palace.updated',
  PALACE_DELETED: 'palace.deleted',
  PALACE_SHARED: 'palace.shared',
  PALACE_UNSHARED: 'palace.unshared',
  
  // Memory actions
  MEMORY_CREATED: 'memory.created',
  MEMORY_UPDATED: 'memory.updated',
  MEMORY_DELETED: 'memory.deleted',
  
  // API key actions
  APIKEY_CREATED: 'apikey.created',
  APIKEY_UPDATED: 'apikey.updated',
  APIKEY_DELETED: 'apikey.deleted',
  APIKEY_REVOKED: 'apikey.revoked',
  
  // LLM provider actions
  LLM_PROVIDER_ADDED: 'llm_provider.added',
  LLM_PROVIDER_UPDATED: 'llm_provider.updated',
  LLM_PROVIDER_DELETED: 'llm_provider.deleted',
  
  // Admin actions
  ADMIN_LOGIN: 'admin.login',
  ADMIN_LOGOUT: 'admin.logout',
  ADMIN_EXPORT: 'admin.export',
  
  // Organization actions
  ORG_CREATED: 'org.created',
  ORG_UPDATED: 'org.updated',
  ORG_DELETED: 'org.deleted',
  ORG_MEMBER_ADDED: 'org.member_added',
  ORG_MEMBER_REMOVED: 'org.member_removed',
  ORG_MEMBER_ROLE_CHANGED: 'org.member_role_changed',
  
  // Collaboration actions
  COLLAB_ROOM_CREATED: 'collab_room.created',
  COLLAB_ROOM_DELETED: 'collab_room.deleted',
  PENDING_ACTION_APPROVED: 'pending_action.approved',
  PENDING_ACTION_REJECTED: 'pending_action.rejected',
  
  // Security actions
  MFA_ENABLED: 'mfa.enabled',
  MFA_DISABLED: 'mfa.disabled',
  MFA_RECOVERY_REQUESTED: 'mfa.recovery_requested',
  PASSWORD_CHANGED: 'password.changed',
  PASSWORD_RESET: 'password.reset',
  
  // Billing actions
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  
  // MCP actions
  MCP_TOKEN_CREATED: 'mcp_token.created',
  MCP_TOKEN_REVOKED: 'mcp_token.revoked',
} as const;
