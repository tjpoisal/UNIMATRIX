/**
 * Centralised audit-logging helper.
 *
 * SOC2 CC6 / HIPAA §164.312(b):
 *  - Every authentication event, MFA event, and data-access event must be logged.
 *  - Logs are immutable (append-only) and retained for ≥ 1 year.
 *  - Each entry captures: actor, action, timestamp, source IP, outcome.
 */

import { prisma } from "./prisma";

export interface AuthEventParams {
  userId:   string;
  action:   string; // e.g. "login.success", "mfa.verified", "login.blocked"
  ip:       string;
  metadata?: Record<string, unknown>;
}

/**
 * Write an authentication or MFA event to the AuditLog table.
 * Silently no-ops if the write fails so it never breaks the auth flow.
 */
export async function logAuthEvent({
  userId,
  action,
  ip,
  metadata = {},
}: AuthEventParams): Promise<void> {
  try {
    // Derive the organizationId from the user's personal org (nullable — auth events are user-scoped)
    const personalOrg = await prisma.organizationMember.findFirst({
      where:  { userId, organization: { slug: { startsWith: "personal-" } } },
      select: { organizationId: true },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: personalOrg?.organizationId ?? "",
        actorId:        userId,
        actorName:      undefined,
        action,
        targetType:     "User",
        targetId:       userId,
        metadata: {
          ip,
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch {
    // Audit logging must never crash the auth flow
  }
}
