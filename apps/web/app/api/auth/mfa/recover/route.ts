/**
 * POST /api/auth/mfa/recover
 *
 * Two actions — selected by `action` in the request body:
 *
 * action = "request"
 *   Sends a recovery email to the configured trusted person.
 *
 * action = "apply"
 *   Validates the token from the trusted-person link and disables MFA
 *   so the user can re-enroll.
 *
 * SOC2 CC6.1 / HIPAA §164.312(d)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendTrustedPersonRecovery, applyTrustedPersonRecovery } from "@/lib/mfa";
import { logAuthEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json() as { action: string; token?: string; userId?: string };
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // ── action: request ────────────────────────────────────────────────────────
  if (body.action === "request") {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await sendTrustedPersonRecovery(session.user.id);
      await logAuthEvent({
        userId:   session.user.id,
        action:   "mfa.trusted_person_recovery_requested",
        ip,
        metadata: {},
      });
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 400 }
      );
    }
  }

  // ── action: apply ──────────────────────────────────────────────────────────
  if (body.action === "apply") {
    const { token } = body;
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "token is required" }, { status: 400 });
    }

    try {
      const userId = await applyTrustedPersonRecovery(token);
      await logAuthEvent({
        userId,
        action:   "mfa.trusted_person_recovery_applied",
        ip,
        metadata: {},
      });
      return NextResponse.json({ success: true, userId });
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
