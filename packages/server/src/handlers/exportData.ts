import { Request, Response } from 'express';
import { prisma } from '@unimatrix/db';
// Local lightweight ExportFormat (types package may differ across versions)
type ExportFormat = 'json' | 'ndjson' | 'csv';

// use a safe base dir name that doesn't shadow runtime __dirname
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
    // Use an any-typed prisma query to avoid strict Prisma typing conflicts across generated clients.
    // This fetches all rows we need for export; filter by user/palace/location in `where`.
    const rows = await (prisma as any).memory.findMany({
      where: { userId: ctx.userId }, // adjust filter as needed
      orderBy: { createdAt: 'asc' },
    }) as any[];

    for (const row of rows) {
      // row is any — transform and stream according to `format`
      if (format === 'ndjson') {
        await writer.write(JSON.stringify(row) + '\n');
      } else if (format === 'json') {
        // collect later or write as array items (simple streaming omitted for brevity)
        await writer.write(JSON.stringify(row) + '\n');
      } else if (format === 'csv') {
        // minimal CSV: join values; replace with robust csv-stringify if needed
        const vals = [row.id, row.userId, String(row.createdAt || ''), String(row.content || '')];
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