import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { palaceId, parentId, name, description } = await request.json();

    if (!palaceId || !name) {
      return NextResponse.json(
        { error: "Palace ID and location name are required" },
        { status: 400 }
      );
    }

    // Verify user owns the palace
    const palace = await prisma.palace.findUnique({
      where: { id: palaceId },
      select: { userId: true },
    });

    if (!palace || palace.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If parentId provided, verify it exists and belongs to same palace
    if (parentId) {
      const parent = await prisma.location.findUnique({
        where: { id: parentId },
        select: { palaceId: true },
      });

      if (!parent || parent.palaceId !== palaceId) {
        return NextResponse.json(
          { error: "Invalid parent location" },
          { status: 400 }
        );
      }
    }

    const location = await prisma.location.create({
      data: {
        palaceId,
        parentId: parentId || null,
        name,
        description,
        position: 0,
      },
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("Location POST error:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, description, position } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    // Verify location belongs to user's palace
    const location = await prisma.location.findUnique({
      where: { id },
      include: { palace: { select: { userId: true } } },
    });

    if (!location || location.palace.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.location.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Location PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    // Verify location belongs to user's palace
    const location = await prisma.location.findUnique({
      where: { id },
      include: { palace: { select: { userId: true } } },
    });

    if (!location || location.palace.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Location DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
