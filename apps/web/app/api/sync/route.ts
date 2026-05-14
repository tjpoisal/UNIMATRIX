import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface SyncChange {
  type: "palace" | "location" | "memory";
  operation: "create" | "update" | "delete";
  id?: string;
  palaceId?: string;
  locationId?: string;
  data?: Record<string, any>;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deviceId, deviceName, changes } = await request.json();

    if (!deviceId || !Array.isArray(changes)) {
      return NextResponse.json(
        { error: "Device ID and changes array are required" },
        { status: 400 }
      );
    }

    // Update or create sync state
    await prisma.syncState.upsert({
      where: { userId_deviceId: { userId: session.user.id, deviceId } },
      update: {
        lastSync: new Date(),
        deviceName: deviceName || undefined,
      },
      create: {
        userId: session.user.id,
        deviceId,
        deviceName: deviceName || "Mobile Device",
        lastSync: new Date(),
      },
    });

    const results: any[] = [];
    const errors: any[] = [];

    // Process each change in order (respects timestamp order)
    for (const change of changes.sort((a, b) => a.timestamp - b.timestamp)) {
      try {
        switch (change.type) {
          case "palace":
            if (change.operation === "create") {
              const palace = await prisma.palace.create({
                data: {
                  userId: session.user.id,
                  name: change.data?.name,
                  description: change.data?.description,
                },
              });
              results.push({ id: change.id || palace.id, cloudId: palace.id, type: "palace" });
            } else if (change.operation === "update") {
              await prisma.palace.update({
                where: { id: change.id },
                data: change.data,
              });
              results.push({ id: change.id, type: "palace" });
            } else if (change.operation === "delete") {
              await prisma.palace.update({
                where: { id: change.id },
                data: { deletedAt: new Date() },
              });
              results.push({ id: change.id, type: "palace" });
            }
            break;

          case "location":
            if (change.operation === "create") {
              const location = await prisma.location.create({
                data: {
                  palaceId: change.palaceId!,
                  parentId: change.data?.parentId || null,
                  name: change.data?.name,
                  description: change.data?.description,
                  position: change.data?.position || 0,
                },
              });
              results.push({ id: change.id || location.id, cloudId: location.id, type: "location" });
            } else if (change.operation === "update") {
              await prisma.location.update({
                where: { id: change.id },
                data: change.data,
              });
              results.push({ id: change.id, type: "location" });
            } else if (change.operation === "delete") {
              await prisma.location.update({
                where: { id: change.id },
                data: { deletedAt: new Date() },
              });
              results.push({ id: change.id, type: "location" });
            }
            break;

          case "memory":
            if (change.operation === "create") {
              const memory = await prisma.memory.create({
                data: {
                  locationId: change.locationId!,
                  content: change.data?.content,
                  tags: change.data?.tags || [],
                },
              });
              results.push({ id: change.id || memory.id, cloudId: memory.id, type: "memory" });
            } else if (change.operation === "update") {
              await prisma.memory.update({
                where: { id: change.id },
                data: change.data,
              });
              results.push({ id: change.id, type: "memory" });
            } else if (change.operation === "delete") {
              await prisma.memory.update({
                where: { id: change.id },
                data: { deletedAt: new Date() },
              });
              results.push({ id: change.id, type: "memory" });
            }
            break;
        }
      } catch (error) {
        errors.push({
          change,
          error: (error as Error).message,
        });
      }
    }

    return NextResponse.json(
      {
        synced: results.length,
        errors: errors.length,
        results,
        errors,
      },
      { status: errors.length === 0 ? 200 : 207 }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
