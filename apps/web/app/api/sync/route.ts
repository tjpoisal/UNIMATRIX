import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publishMemoryUpdate, publishPalaceUpdate } from "@/lib/realtime/ably";

interface SyncChange {
  type: "palace" | "location" | "memory";
  operation: "create" | "update" | "delete";
  id?: string;
  palaceId?: string;
  locationId?: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

interface SyncResult {
  id: string;
  cloudId?: string;
  type: string;
}

interface SyncError {
  change: SyncChange;
  error: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deviceId, deviceName, changes } = await request.json() as {
      deviceId: string;
      deviceName?: string;
      changes: SyncChange[];
    };

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

    const results: SyncResult[] = [];
    const errors: SyncError[] = [];

    // Helper to extract typed primitives from the unstructured client payload
    const str = (v: unknown): string => String(v ?? '');
    const strOrNull = (v: unknown): string | null => (v == null ? null : String(v));
    const num = (v: unknown): number => Number(v ?? 0);

    // Process each change in order (respects timestamp order)
    for (const change of changes.sort((a, b) => a.timestamp - b.timestamp)) {
      const d = change.data ?? {};
      try {
        switch (change.type) {
          case "palace":
            if (change.operation === "create") {
              const palace = await prisma.palace.create({
                data: {
                  userId: session.user.id,
                  name: str(d.name),
                  description: strOrNull(d.description),
                },
              });
              results.push({ id: change.id ?? palace.id, cloudId: palace.id, type: "palace" });
              
              // Publish real-time update
              await publishPalaceUpdate(session.user.id, 'palace.created', {
                palaceId: palace.id,
                name: palace.name,
                description: palace.description,
                timestamp: new Date().toISOString(),
              });
            } else if (change.operation === "update") {
              await prisma.palace.update({
                where: { id: change.id! },
                data: { name: str(d.name), description: strOrNull(d.description) },
              });
              results.push({ id: change.id!, type: "palace" });
              
              // Publish real-time update
              await publishPalaceUpdate(session.user.id, 'palace.updated', {
                palaceId: change.id!,
                name: str(d.name),
                description: strOrNull(d.description),
                timestamp: new Date().toISOString(),
              });
            } else if (change.operation === "delete") {
              await prisma.palace.update({
                where: { id: change.id! },
                data: { deletedAt: new Date() },
              });
              results.push({ id: change.id!, type: "palace" });
              
              // Publish real-time update
              await publishPalaceUpdate(session.user.id, 'palace.deleted', {
                palaceId: change.id!,
                name: str(d.name),
                timestamp: new Date().toISOString(),
              });
            }
            break;

          case "location":
            if (change.operation === "create") {
              const location = await prisma.location.create({
                data: {
                  palaceId: change.palaceId!,
                  parentId: strOrNull(d.parentId),
                  name: str(d.name),
                  description: strOrNull(d.description),
                  position: num(d.position),
                },
              });
              results.push({ id: change.id ?? location.id, cloudId: location.id, type: "location" });
            } else if (change.operation === "update") {
              await prisma.location.update({
                where: { id: change.id! },
                data: { name: str(d.name), description: strOrNull(d.description), position: num(d.position) },
              });
              results.push({ id: change.id!, type: "location" });
            } else if (change.operation === "delete") {
              await prisma.location.update({
                where: { id: change.id! },
                data: { deletedAt: new Date() },
              });
              results.push({ id: change.id!, type: "location" });
            }
            break;

          case "memory":
            if (change.operation === "create") {
              const contentBytes = new Uint8Array(Buffer.from(str(d.content), 'utf8'));
              const memory = await prisma.memory.create({
                data: {
                  locationId: change.locationId!,
                  content: contentBytes,
                  contentIv: new Uint8Array(16),
                  source: 'sync',
                  status: 'active',
                },
              });

              if (Array.isArray(d.tags) && d.tags.length > 0) {
                await prisma.memoryTag.createMany({
                  data: d.tags.map((t: unknown) => ({ memoryId: memory.id, tag: String(t) })),
                  skipDuplicates: true,
                });
              }

              results.push({ id: change.id ?? memory.id, cloudId: memory.id, type: "memory" });
              
              // Publish real-time update
              await publishMemoryUpdate(session.user.id, 'memory.created', {
                memoryId: memory.id,
                content: str(d.content),
                hint: strOrNull(d.hint),
                source: 'sync',
                tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
                spaceId: change.locationId,
                timestamp: new Date().toISOString(),
              });
            } else if (change.operation === "update") {
              const updatePayload: Record<string, unknown> = {};
              if (d.content != null) updatePayload.content = new Uint8Array(Buffer.from(str(d.content), 'utf8'));
              await prisma.memory.update({ where: { id: change.id! }, data: updatePayload });
              if (Array.isArray(d.tags) && d.tags.length > 0) {
                await prisma.memoryTag.createMany({
                  data: d.tags.map((t: unknown) => ({ memoryId: change.id!, tag: String(t) })),
                  skipDuplicates: true,
                });
              }
              results.push({ id: change.id!, type: "memory" });
              
              // Publish real-time update
              await publishMemoryUpdate(session.user.id, 'memory.updated', {
                memoryId: change.id!,
                content: d.content != null ? str(d.content) : undefined,
                hint: strOrNull(d.hint),
                tags: Array.isArray(d.tags) ? d.tags.map(String) : undefined,
                timestamp: new Date().toISOString(),
              });
            } else if (change.operation === "delete") {
              await prisma.memory.update({
                where: { id: change.id! },
                data: { deletedAt: new Date() },
              });
              results.push({ id: change.id!, type: "memory" });
              
              // Publish real-time update
              await publishMemoryUpdate(session.user.id, 'memory.deleted', {
                memoryId: change.id!,
                timestamp: new Date().toISOString(),
              });
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
        errorCount: errors.length,
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
