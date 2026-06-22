/**
 * POST /api/auth/mfa/disable
 *
 * Disable MFA for the authenticated user after re-confirming their password.
 *
 * SOC2 CC6.1 / HIPAA §164.312(d)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuthEvent } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { password } = await req.json() as { password: string };
  if (!password) {
    return NextResponse.json({ error: "password is required" }, { status: 400 });
  }

  // Read only the legacy password field if it exists in this database version.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true as unknown as string | null },
  });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  const storedPassword = (user && (user as { password?: string | null }).password) ?? null;
  if (!storedPassword || !(await bcrypt.compare(password, storedPassword))) {
    await logAuthEvent({
      userId:   session.user.id,
      action:   "mfa.disable_failed",
      ip,
      metadata: { reason: "invalid_password" },
    });
    return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      mfaEnabled:    false,
      mfaSecret:     null,
      mfaIv:         null,
      recoveryCodes: [],
    },
  });

  await logAuthEvent({
    userId:   session.user.id,
    action:   "mfa.disabled",
    ip,
    metadata: {},
  });

  return NextResponse.json({ success: true });
}
