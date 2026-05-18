import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/friends/[id] — accept or reject a friend request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await request.json(); // "accept" | "reject"

  if (!["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "Action must be 'accept' or 'reject'" }, { status: 400 });
  }

  // Only the addressee can accept/reject
  const friendship = await prisma.friendship.findFirst({
    where: { id, addresseeId: session.user.id, status: "pending" },
  });

  if (!friendship) {
    return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
  }

  if (action === "reject") {
    await prisma.friendship.delete({ where: { id } });
    return NextResponse.json({ message: "Friend request rejected" });
  }

  const updated = await prisma.friendship.update({
    where: { id },
    data: { status: "accepted" },
    include: {
      requester: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json({ message: "Friend request accepted", friendship: updated });
}

// DELETE /api/friends/[id] — remove a friend (either party can unfriend)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Must be one of the two parties in the friendship
  const friendship = await prisma.friendship.findFirst({
    where: {
      id,
      OR: [
        { requesterId: session.user.id },
        { addresseeId: session.user.id },
      ],
    },
  });

  if (!friendship) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  await prisma.friendship.delete({ where: { id } });

  return NextResponse.json({ message: "Friendship removed" });
}
