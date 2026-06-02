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
    select: { id: true, name: true, keyPrefix: true, organizationId: true, lastUsed: true, createdAt: true },
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

  const body = await request.json();
  const { name, organizationId } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Validate organization belongs to user if provided (multi-tenant key scoping)
  let resolvedOrgId: string | null = null;
  if (organizationId) {
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
      },
      select: { organizationId: true },
    });
    if (!membership) {
      return NextResponse.json({ error: "Organization not found or access denied" }, { status: 403 });
    }
    resolvedOrgId = membership.organizationId;
  } else {
    // Default to primary (oldest) personal org for backward compat during migration
    const orgs = await prisma.organization.findMany({
      where: { members: { some: { userId: session.user.id } } },
      orderBy: { createdAt: 'asc' },
      take: 1,
    });
    resolvedOrgId = orgs[0]?.id ?? null;
  }

  // Generate: umx_ prefix + 32 random hex chars
  const raw = "umx_" + randomBytes(16).toString("hex");
  const keyHash = await bcrypt.hash(raw, 10);
  const keyPrefix = raw.slice(0, 12); // "umx_" + 8 chars

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      organizationId: resolvedOrgId,
      name: name.trim(),
      keyHash,
      keyPrefix,
    },
  });

  return NextResponse.json({
    id: apiKey.id,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    organizationId: apiKey.organizationId,
    createdAt: apiKey.createdAt,
    key: raw, // Only returned once — user must copy it now
  }, { status: 201 });
}
