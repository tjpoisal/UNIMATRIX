import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const palace = await prisma.palace.findUnique({
      where: { id: params.id },
      include: {
        locations: {
          where: { deletedAt: null },
          include: {
            memories: {
              where: { deletedAt: null },
              select: { id: true, content: true, tags: true, createdAt: true },
            },
          },
        },
      },
    });

    if (!palace) {
      return NextResponse.json({ error: "Palace not found" }, { status: 404 });
    }

    // Check authorization
    if (palace.userId !== session.user.id && !palace.isPublic) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(palace);
  } catch (error) {
    console.error("Palace GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch palace" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, isPublic } = await request.json();

    // Check ownership
    const palace = await prisma.palace.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!palace || palace.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.palace.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Palace PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update palace" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const palace = await prisma.palace.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!palace || palace.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.palace.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Palace DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete palace" },
      { status: 500 }
    );
  }
}
