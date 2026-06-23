import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/friends — list accepted friends + pending requests
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [friends, pendingReceived, pendingSent] = await Promise.all([
    // Accepted friendships (either direction)
    prisma.friendship.findMany({
      where: {
        status: "accepted",
        OR: [
          { requesterId: session.user.id },
          { addresseeId: session.user.id },
        ],
      },
      include: {
        requester: { select: { id: true, name: true, email: true, image: true } },
        addressee: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
    // Pending requests sent TO me
    prisma.friendship.findMany({
      where: { addresseeId: session.user.id, status: "pending" },
      include: {
        requester: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
    // Pending requests sent BY me
    prisma.friendship.findMany({
      where: { requesterId: session.user.id, status: "pending" },
      include: {
        addressee: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
  ]);

  // Normalize: return the "other person" in each friendship
  const friendList = friends.map((f: any) => ({
    friendshipId: f.id,
    user:
      f.requesterId === session.user!.id ? f.addressee : f.requester,
    since: f.updatedAt,
  }));

  return NextResponse.json({
    friends: friendList,
    pendingReceived: pendingReceived.map((f: any) => ({
      friendshipId: f.id,
      user: f.requester,
      sentAt: f.createdAt,
    })),
    pendingSent: pendingSent.map((f: any) => ({
      friendshipId: f.id,
      user: f.addressee,
      sentAt: f.createdAt,
    })),
  });
}

// POST /api/friends — send a friend request by email
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await request.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (email.toLowerCase() === session.user.email?.toLowerCase()) {
    return NextResponse.json({ error: "You can't friend yourself" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, name: true, email: true },
  });

  if (!target) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }

  // Check if friendship already exists (either direction)
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: session.user.id, addresseeId: target.id },
        { requesterId: target.id, addresseeId: session.user.id },
      ],
    },
  });

  if (existing) {
    if (existing.status === "accepted") {
      return NextResponse.json({ error: "Already friends" }, { status: 409 });
    }
    if (existing.status === "pending") {
      return NextResponse.json({ error: "Request already pending" }, { status: 409 });
    }
  }

  const friendship = await prisma.friendship.create({
    data: {
      requesterId: session.user.id,
      addresseeId: target.id,
      status: "pending",
    },
    include: {
      addressee: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(
    { message: "Friend request sent", friendship },
    { status: 201 }
  );
}
