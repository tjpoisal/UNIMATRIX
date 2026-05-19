import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper: verify memory ownership
async function getOwnedMemory(memoryId: string, userId: string) {
  return prisma.memory.findFirst({
    where: {
      id: memoryId,
      deletedAt: null,
      location: {
        deletedAt: null,
        palace: { userId, deletedAt: null },
      },
    },
    include: {
      location: { include: { palace: { select: { userId: true } } } },
    },
  });
}

// PATCH /api/memories/[id] — update content and/or tags
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memory = await getOwnedMemory(id, session.user.id);
    if (!memory) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json() as { content?: string; tags?: string[] };
    const { content, tags } = body;

    if (!content && !tags) {
      return NextResponse.json(
        { error: "Provide at least content or tags to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.memory.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        lastAccessed: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Memory PATCH error:", error);
    return NextResponse.json({ error: "Failed to update memory" }, { status: 500 });
  }
}

// DELETE /api/memories/[id] — soft delete
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memory = await getOwnedMemory(id, session.user.id);
    if (!memory) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.memory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Memory DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
