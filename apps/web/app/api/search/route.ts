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

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const palaceId = searchParams.get("palaceId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      location: {
        palace: {
          userId: session.user.id,
        },
      },
      deletedAt: null,
    };

    if (palaceId) {
      where.location.palace.id = palaceId;
    }

    // Simple text search (PostgreSQL LIKE)
    // For full-text search, you'd use: to_tsvector('english', content) @@ plainto_tsquery(...)
    const results = await prisma.memory.findMany({
      where: {
        AND: [
          where,
          {
            OR: [
              { content: { contains: query, mode: "insensitive" } },
              { tags: { hasSome: [query] } },
            ],
          },
        ],
      },
      include: {
        location: {
          include: {
            palace: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { lastAccessed: "desc" },
      take: limit,
    });

    return NextResponse.json({
      query,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
