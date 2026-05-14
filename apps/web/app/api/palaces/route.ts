import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const palaces = await prisma.palace.findMany({
      where: { userId: session.user.id, deletedAt: null },
      include: {
        locations: {
          where: { deletedAt: null },
          select: { id: true, name: true, _count: { select: { memories: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(palaces);
  } catch (error) {
    console.error("Palaces GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch palaces" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Palace name is required" },
        { status: 400 }
      );
    }

    // Check tier limit (free tier = 3 palaces)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true },
    });

    if (user?.tier === "free") {
      const palaceCount = await prisma.palace.count({
        where: { userId: session.user.id, deletedAt: null },
      });

      if (palaceCount >= 3) {
        return NextResponse.json(
          { error: "Free tier limited to 3 palaces. Upgrade to pro." },
          { status: 403 }
        );
      }
    }

    const palace = await prisma.palace.create({
      data: {
        userId: session.user.id,
        name,
        description,
      },
    });

    return NextResponse.json(palace, { status: 201 });
  } catch (error) {
    console.error("Palaces POST error:", error);
    return NextResponse.json(
      { error: "Failed to create palace" },
      { status: 500 }
    );
  }
}
