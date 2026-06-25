import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/palaces/[id]/share — list who this palace is shared with
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: palaceId } = await params;

  // Verify caller owns the palace
  const palace = await prisma.palace.findFirst({
    where: { id: palaceId, userId: session.user.id, deletedAt: null },
  });

  if (!palace) {
    return NextResponse.json({ error: "Palace not found" }, { status: 404 });
  }

  const shares = await prisma.palaceShare.findMany({
    where: { palaceId },
    include: {
      sharedWith: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  type ShareRow = { id: string; sharedWith: { id: string; name?: string | null; email?: string | null; image?: string | null }; permission: string; createdAt: Date };
  return NextResponse.json(
    (shares as ShareRow[]).map((s) => ({
      shareId: s.id,
      user: s.sharedWith,
      permission: s.permission,
      sharedAt: s.createdAt,
    }))
  );
}

// POST /api/palaces/[id]/share — share a palace with a friend
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: palaceId } = await params;
  const { userId, permission = "view" } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (!["view", "edit"].includes(permission)) {
    return NextResponse.json({ error: "permission must be 'view' or 'edit'" }, { status: 400 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "You cannot share with yourself" }, { status: 400 });
  }

  // Verify caller owns the palace
  const palace = await prisma.palace.findFirst({
    where: { id: palaceId, userId: session.user.id, deletedAt: null },
  });

  if (!palace) {
    return NextResponse.json({ error: "Palace not found" }, { status: 404 });
  }

  // Verify they are friends (either direction, accepted)
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { requesterId: session.user.id, addresseeId: userId },
        { requesterId: userId, addresseeId: session.user.id },
      ],
    },
  });

  if (!friendship) {
    return NextResponse.json({ error: "You can only share with friends" }, { status: 403 });
  }

  // Upsert: if already shared, update permission
  const share = await prisma.palaceShare.upsert({
    where: { palaceId_sharedWithId: { palaceId, sharedWithId: userId } },
    create: {
      palaceId,
      sharedById: session.user.id,
      sharedWithId: userId,
      permission,
    },
    update: { permission },
    include: {
      sharedWith: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json(
    {
      shareId: share.id,
      user: share.sharedWith,
      permission: share.permission,
      sharedAt: share.createdAt,
    },
    { status: 201 }
  );
}
