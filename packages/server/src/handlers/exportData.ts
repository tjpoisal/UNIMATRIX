import { Request, Response } from 'express';
import { prisma } from '@unimatrix/db';
import { DualWriteStorage } from '../storage/dualWriteStorage';

/**
 * Minimal export format used by the handler.
 */
export type ExportFormat = 'json' | 'ndjson' | 'csv';

/**
 * Minimal writer interface used by the export route/handler.
 * Matches common streaming writers used in the repo (res.writable.getWriter()/Node streams adapter).
 */
export type ExportWriter = {
  write(chunk: string | Uint8Array): Promise<void> | void;
};

/**
 * Stable handler signature so callers in the codebase that pass (ctx, params, storage, format, writer)
 * continue to work. Keep everything typed as lightweight locals to avoid Prisma client typing mismatches.
 *
 * ctx: { userId: string }
 * params: { palaceId?: string; locationId?: string; [k: string]: any }
 * storage: DualWriteStorage (passed through by callers)
 * format: ExportFormat
 * writer: ExportWriter
 */
export async function exportData(
  ctx: { userId: string },
  params: { palaceId?: string; locationId?: string; [k: string]: any } = {},
  storage?: DualWriteStorage,
  format: ExportFormat = 'ndjson',
  writer?: ExportWriter,
) {
  if (!ctx || !ctx.userId) {
    throw new Error('missing ctx.userId');
  }
  if (!writer) {
    throw new Error('missing writer');
  }

  // Build a runtime-safe where filter; avoid nested `location:` objects or strict typed selects.
  const where: Record<string, any> = { userId: ctx.userId };
  if (params.palaceId) where.palaceId = params.palaceId;
  if (params.locationId) where.locationId = params.locationId;

  // Use (prisma as any) to decouple from generated Prisma client typings.
  const rows = await (prisma as any).memory.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  }) as any[];

  // Stream results according to requested format.
  for (const row of rows) {
    if (format === 'ndjson') {
      await writer.write(JSON.stringify(row) + '\n');
    } else if (format === 'json') {
      // Stream newline-delimited JSON as a safe default for large exports.
      await writer.write(JSON.stringify(row) + '\n');
    } else if (format === 'csv') {
      const vals = [
        row.id ?? '',
        row.userId ?? '',
        row.palaceId ?? '',
        row.locationId ?? '',
        row.createdAt ? String(row.createdAt) : '',
        row.content ? String(row.content) : '',
      ];
      await writer.write(vals.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n');
    } else {
      // Fallback: newline-delimited JSON
      await writer.write(JSON.stringify(row) + '\n');
    }
  }

  // Optionally notify storage that export completed (no-op if storage is undefined).
  try {
    if (storage && typeof (storage as any).emit === 'function') {
      (storage as any).emit('export-complete', { userId: ctx.userId, count: rows.length });
    }
  } catch {
    // ignore emitter errors during build/runtime difference
  }

  return { exported: rows.length };
}