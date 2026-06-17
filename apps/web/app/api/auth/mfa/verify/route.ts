/**
 * POST /api/auth/mfa/verify
 *
 * Step 2 — Confirm a TOTP code to activate MFA.
 * Also generates and returns the one-time recovery codes.
 *
 * SOC2 CC6.1 / HIPAA §164.312(d)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyTOTP, generateRecoveryCodes } from "@/lib/mfa";
import { prisma } from "@/lib/prisma";
import { logAuthEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json() as { token: string };
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { mfaSecret: true, mfaIv: true, mfaEnabled: true },
  });

  if (!user?.mfaSecret || !user?.mfaIv) {
    return NextResponse.json(
      { error: "MFA setup not initiated. Call /api/auth/mfa/enable first." },
      { status: 400 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  const valid = verifyTOTP(user.mfaSecret, token, user.mfaIv);
  if (!valid) {
    await logAuthEvent({
      userId:   session.user.id,
      action:   "mfa.setup_verify_failed",
      ip,
      metadata: {},
    });
    return NextResponse.json({ error: "Invalid code" }, { status: 422 });
  }

  // Activate MFA and generate fresh recovery codes
  const plainCodes = await generateRecoveryCodes(session.user.id);
  await prisma.user.update({
    where: { id: session.user.id },
    data:  { mfaEnabled: true },
  });

  await logAuthEvent({
    userId:   session.user.id,
    action:   "mfa.enabled",
    ip,
    metadata: {},
  });

  return NextResponse.json({
    success: true,
    // Sent exactly once — the client must display these to the user
    recoveryCodes: plainCodes,
  });
}
