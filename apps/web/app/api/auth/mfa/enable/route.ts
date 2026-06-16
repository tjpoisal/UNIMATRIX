/**
 * POST /api/auth/mfa/enable
 *
 * Step 1 — Generate a TOTP secret and return the otpauth:// URL for QR rendering.
 * The secret is stored in a pending state; MFA is not activated until /verify confirms it.
 *
 * SOC2 CC6.1 / HIPAA §164.312(d)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateTOTPSecret } from "@/lib/mfa";
import { prisma } from "@/lib/prisma";
import { logAuthEvent } from "@/lib/audit";

export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plaintext, encrypted, iv, otpauthUrl } = generateTOTPSecret(
    session.user.email
  );

  // Store the *pending* secret — not activated until verify succeeds
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      mfaSecret: encrypted,
      mfaIv:     iv,
      mfaEnabled: false, // stays false until /verify confirms
    },
  });

  await logAuthEvent({
    userId:   session.user.id,
    action:   "mfa.setup_initiated",
    ip:       _req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown",
    metadata: {},
  });

  return NextResponse.json({
    otpauthUrl,
    // Return the plaintext secret so the user can manually enter it into their authenticator
    // (this is the only time it's ever sent in plaintext).
    secret: plaintext,
  });
}
