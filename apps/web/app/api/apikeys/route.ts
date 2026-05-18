import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

// GET /api/apikeys — list user's active keys
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: { id: true, name: true, keyPrefix: true, lastUsed: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(keys);
}

// POST /api/apikeys — create a new key, returns the raw key ONCE
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Generate: umx_ prefix + 32 random hex chars
  const raw = "umx_" + randomBytes(16).toString("hex");
  const keyHash = await bcrypt.hash(raw, 10);
  const keyPrefix = raw.slice(0, 12); // "umx_" + 8 chars

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      keyHash,
      keyPrefix,
    },
  });

  return NextResponse.json({
    id: apiKey.id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    createdAt: apiKey.createdAt,
    key: raw, // Only returned once — user must copy it now
  }, { status: 201 });
}
