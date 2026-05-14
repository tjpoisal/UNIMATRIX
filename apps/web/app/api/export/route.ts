import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function formatAsMarkdown(palace: any): string {
  let markdown = `# ${palace.name}\n\n`;

  if (palace.description) {
    markdown += `${palace.description}\n\n`;
  }

  markdown += `*Exported: ${new Date().toISOString()}*\n\n`;

  function renderLocation(location: any, depth: number = 1): string {
    const heading = "#".repeat(depth + 1);
    let content = `${heading} ${location.name}\n\n`;

    if (location.description) {
      content += `${location.description}\n\n`;
    }

    // Add memories in this location
    if (location.memories && location.memories.length > 0) {
      for (const memory of location.memories) {
        content += `- ${memory.content}\n`;
      }
      content += "\n";
    }

    // Recursively render children
    if (location.children && location.children.length > 0) {
      for (const child of location.children) {
        content += renderLocation(child, depth + 1);
      }
    }

    return content;
  }

  // Render all root locations
  if (palace.locations && palace.locations.length > 0) {
    for (const location of palace.locations) {
      markdown += renderLocation(location, 1);
    }
  }

  return markdown;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { palaceId, format = "json" } = await request.json();

    if (!palaceId) {
      return NextResponse.json(
        { error: "Palace ID is required" },
        { status: 400 }
      );
    }

    // Fetch full palace with hierarchy
    const palace = await prisma.palace.findUnique({
      where: { id: palaceId },
      include: {
        locations: {
          where: { deletedAt: null, parentId: null },
          include: {
            memories: { where: { deletedAt: null } },
            children: {
              where: { deletedAt: null },
              include: {
                memories: { where: { deletedAt: null } },
                children: {
                  where: { deletedAt: null },
                  include: {
                    memories: { where: { deletedAt: null } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!palace) {
      return NextResponse.json({ error: "Palace not found" }, { status: 404 });
    }

    // Check authorization
    if (palace.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (format === "markdown") {
      const markdown = formatAsMarkdown(palace);
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="${palace.name}.md"`,
        },
      });
    } else {
      // JSON format
      const json = JSON.stringify(palace, null, 2);
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${palace.name}.json"`,
        },
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 }
    );
  }
}
