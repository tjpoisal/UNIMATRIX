/**
 * GET  /api/auth/mfa/trusted-person  — return current trusted person (masked)
 * POST /api/auth/mfa/trusted-person  — set or update trusted person email
 *
 * SOC2 CC6.1 / HIPAA §164.312(d)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAuthEvent } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { trustedPersonEmail: true },
  });

  // Mask the email for display (e.g. "a****@example.com")
  const raw = user?.trustedPersonEmail ?? null;
  const masked = raw ? maskEmail(raw) : null;

  return NextResponse.json({ maskedEmail: masked, configured: !!raw });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await req.json() as { email: string | null };

  if (email !== null) {
    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (email.toLowerCase() === session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Trusted person must be a different email address" },
        { status: 400 }
      );
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { trustedPersonEmail: email },
  });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  await logAuthEvent({
    userId:   session.user.id,
    action:   email ? "mfa.trusted_person_set" : "mfa.trusted_person_removed",
    ip,
    metadata: { maskedEmail: email ? maskEmail(email) : null },
  });

  return NextResponse.json({ success: true });
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "****";
  const visible = local[0] ?? "*";
  return `${visible}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}
