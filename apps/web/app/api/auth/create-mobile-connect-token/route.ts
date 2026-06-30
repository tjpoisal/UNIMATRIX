import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Generate short-lived connect token (15 minutes)
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  // Use VerificationToken table for simplicity (reusing existing pattern)
  // Store with identifier to scope to this user
  await prisma.verificationToken.create({
    data: {
      identifier: `mobile_connect:${userId}`,
      token,
      expires,
    },
  });

  return NextResponse.json({ connectToken: token }, { status: 201 });
}
