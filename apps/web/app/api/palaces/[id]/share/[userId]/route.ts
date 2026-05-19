import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/palaces/[id]/share/[userId] — update permission level
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: palaceId, userId } = await params;
  const { permission } = await request.json();

  if (!["view", "edit"].includes(permission)) {
    return NextResponse.json({ error: "permission must be 'view' or 'edit'" }, { status: 400 });
  }

  // Verify caller owns the palace
  const palace = await prisma.palace.findFirst({
    where: { id: palaceId, userId: session.user.id, deletedAt: null },
  });

  if (!palace) {
    return NextResponse.json({ error: "Palace not found" }, { status: 404 });
  }

  const share = await prisma.palaceShare.findUnique({
    where: { palaceId_sharedWithId: { palaceId, sharedWithId: userId } },
  });

  if (!share) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  const updated = await prisma.palaceShare.update({
    where: { palaceId_sharedWithId: { palaceId, sharedWithId: userId } },
    data: { permission },
    include: {
      sharedWith: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json({
    shareId: updated.id,
    user: updated.sharedWith,
    permission: updated.permission,
  });
}

// DELETE /api/palaces/[id]/share/[userId] — revoke a share
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: palaceId, userId } = await params;

  // Verify caller owns the palace
  const palace = await prisma.palace.findFirst({
    where: { id: palaceId, userId: session.user.id, deletedAt: null },
  });

  if (!palace) {
    return NextResponse.json({ error: "Palace not found" }, { status: 404 });
  }

  const share = await prisma.palaceShare.findUnique({
    where: { palaceId_sharedWithId: { palaceId, sharedWithId: userId } },
  });

  if (!share) {
    return NextResponse.json({ error: "Share not found" }, { status: 404 });
  }

  await prisma.palaceShare.delete({
    where: { palaceId_sharedWithId: { palaceId, sharedWithId: userId } },
  });

  return NextResponse.json({ message: "Share revoked" });
}
