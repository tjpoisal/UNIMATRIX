import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { locationId, content, tags, sourceLlm } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    let finalTags = tags || [];
    if (sourceLlm && typeof sourceLlm === "string") {
      const t = `llm-source:${sourceLlm}`;
      if (!finalTags.includes(t)) finalTags = [...finalTags, t];
    }

    let finalLocationId = locationId;

    // Auto-resolve like the tools path: if sourceLlm but no explicit locationId, use per-LLM history
    if (!finalLocationId && sourceLlm && typeof sourceLlm === "string") {
      try {
        const cap = sourceLlm.charAt(0).toUpperCase() + sourceLlm.slice(1);
        const locName = `${cap} History`;
        const hp = await prisma.palace.findFirst({ where: { userId, name: "LLM Histories", deletedAt: null } });
        if (hp) {
          const hl = await prisma.location.findFirst({ where: { palaceId: hp.id, name: locName, deletedAt: null } });
          if (hl) finalLocationId = hl.id;
        }
        if (!finalLocationId) {
          const mp = await prisma.palace.findFirst({ where: { userId, name: "Mobile", deletedAt: null } });
          if (mp) {
            const ml = await prisma.location.findFirst({ where: { palaceId: mp.id, name: locName, deletedAt: null } });
            if (ml) finalLocationId = ml.id;
          }
        }
      } catch {}
    }

    if (!finalLocationId) {
      return NextResponse.json({ error: "locationId is required (or provide sourceLlm for auto-resolve to per-LLM history)" }, { status: 400 });
    }

    // Verify location belongs to user's palace
    const location = await prisma.location.findUnique({
      where: { id: finalLocationId },
      include: { palace: { select: { userId: true } } },
    });

    if (!location || location.palace.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const memory = await prisma.memory.create({
      data: {
        locationId: finalLocationId,
        content,
        tags: finalTags,
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
