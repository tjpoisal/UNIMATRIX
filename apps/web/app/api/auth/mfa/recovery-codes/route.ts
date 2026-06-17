/**
 * POST /api/auth/mfa/recovery-codes
 *
 * Regenerate recovery codes (invalidates old ones).
 * Requires the user to confirm their TOTP token to prove they still have their authenticator.
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
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { mfaSecret: true, mfaIv: true, mfaEnabled: true },
  });

  if (!user?.mfaEnabled || !user.mfaSecret || !user.mfaIv) {
    return NextResponse.json({ error: "MFA is not enabled" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  const valid = verifyTOTP(user.mfaSecret, token, user.mfaIv);
  if (!valid) {
    await logAuthEvent({
      userId:   session.user.id,
      action:   "mfa.recovery_codes_regenerate_failed",
      ip,
      metadata: { reason: "invalid_totp" },
    });
    return NextResponse.json({ error: "Invalid code" }, { status: 422 });
  }

  const plainCodes = await generateRecoveryCodes(session.user.id);

  await logAuthEvent({
    userId:   session.user.id,
    action:   "mfa.recovery_codes_regenerated",
    ip,
    metadata: {},
  });

  return NextResponse.json({ recoveryCodes: plainCodes });
}
