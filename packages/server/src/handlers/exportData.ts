import { Request, Response } from 'express';
import { prisma } from '@unimatrix/db';
// Local lightweight ExportFormat (types package may differ across versions)
type ExportFormat = 'json' | 'ndjson' | 'csv';

// Use a stable base directory name (do not redeclare __dirname).
const baseDir = process.cwd();

export async function exportData(
  req: Request,
  res: Response,
  storage: DualWriteStorage
) {
  const { spaceId } = req.params;
  const format = (req.query.format as ExportFormat) || 'ndjson';

  if (!spaceId) {
    return res.status(400).json({ error: 'spaceId required' });
  }

  // Optimization 2: Prevent keep-alive from holding WAL open
  res.setHeader('Connection', 'close');
  res.setHeader('Transfer-Encoding', 'chunked');

  if (format === 'ndjson') {
    res.setHeader('Content-Type', 'application/x-ndjson');
    await exportNDJSON(req, res, spaceId, storage);
  } else if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    await exportJSON(req, res, spaceId, storage);
  } else {
    return res.status(400).json({ error: 'Unsupported format' });
  }
}

async function exportNDJSON(
  req: Request,
  res: Response,
  spaceId: string,
  storage: DualWriteStorage
) {
  // Setup cleanup handlers
  const cleanup = () => {
    // Prepared statement (some environments set up sqlite/wasm stmt). Clean up safely.
    let stmt: any = null;
    if (stmt && typeof stmt.free === 'function') {
      try { stmt.free(); } catch {} 
    }
  };

  req.on('close', cleanup);
  res.on('finish', cleanup);

  try {
    // Build a minimal, runtime-safe where filter. Keep it plain JS so differing Prisma
    // client typings won't break the build. We cast prisma to any for the query.
    const where: Record<string, any> = { userId: ctx.userId };
    if (params?.palaceId) where.palaceId = params.palaceId;
    if (params?.locationId) where.locationId = params.locationId;

    // Fetch rows with a simple findMany. Use (prisma as any) to avoid compile-time coupling
    // to a specific generated client shape.
    const rows = await (prisma as any).memory.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    }) as any[];

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
      }
    }

    // Optimization 4: Synchronous checkpoint after export completes
    // This trades one 20–100 ms stall for eliminating unpredictable stalls on next write
    await storage.checkpointWAL();

    res.end();
  } catch (error) {
    console.error('[export] NDJSON export error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Export failed' });
    } else {
      res.end();
    }
  } finally {
    cleanup();
  }
}

async function exportJSON(
  req: Request,
  res: Response,
  spaceId: string,
  storage: DualWriteStorage
) {
  const cleanup = () => {};
  req.on('close', cleanup);
  res.on('finish', cleanup);

  try {
    const rows = await prisma.memory.findMany({
      where: {
        location: {
          spaceId: spaceId,
        },
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        locationId: true,
        content: true,
        tags: true,
        importance: true,
        semanticCat: true,
        createdAt: true,
      },
    });

    // Optimization 4: Checkpoint before responding
    await storage.checkpointWAL();

    res.json({
      spaceId,
      exportedAt: new Date().toISOString(),
      count: rows.length,
      memories: rows
    });
  } catch (error) {
    console.error('[export] JSON export error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Export failed' });
    }
  } finally {
    cleanup();
  }
}