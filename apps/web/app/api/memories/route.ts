import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { locationId, content, tags } = await request.json();

    if (!locationId || !content) {
      return NextResponse.json(
        { error: "Location ID and content are required" },
        { status: 400 }
      );
    }

    // Verify location belongs to user's palace
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: { palace: { select: { userId: true } } },
    });

    if (!location || location.palace.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const memory = await prisma.memory.create({
      data: {
        locationId,
        content,
        tags: tags || [],
      },
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error("Memory POST error:", error);
    return NextResponse.json(
      { error: "Failed to create memory" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, content, tags } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Memory ID is required" },
        { status: 400 }
      );
    }

    // Verify memory belongs to user's palace
    const memory = await prisma.memory.findUnique({
      where: { id },
      include: {
        location: {
          include: { palace: { select: { userId: true } } },
        },
      },
    });

    if (!memory || memory.location.palace.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.memory.update({
      where: { id },
      data: {
        ...(content && { content }),
        ...(tags && { tags }),
        lastAccessed: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Memory PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update memory" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Memory ID is required" },
        { status: 400 }
      );
    }

    // Verify memory belongs to user's palace
    const memory = await prisma.memory.findUnique({
      where: { id },
      include: {
        location: {
          include: { palace: { select: { userId: true } } },
        },
      },
    });

    if (!memory || memory.location.palace.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.memory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Memory DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete memory" },
      { status: 500 }
    );
  }
}
