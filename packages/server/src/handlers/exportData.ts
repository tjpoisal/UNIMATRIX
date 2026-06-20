import { Request, Response } from 'express';
import { getDb } from '../db';
import { DualWriteStorage } from '../storage/dualWriteStorage';
import type { ExportFormat } from '@unimatrix/types';

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
  const db = getDb();

  // Setup cleanup handlers
  const cleanup = () => {
    try {
      stmt.free();
    } catch {}
  };

  req.on('close', cleanup);
  res.on('finish', cleanup);

  try {
    const stmt = db.prepare(
      `SELECT id, location_id, content, tags, importance, semantic_cat, created_at
       FROM memory
       WHERE location_id IN (
         SELECT id FROM location WHERE space_id = ?
       )
       AND deleted_at IS NULL
       ORDER BY created_at DESC`
    );

    let count = 0;
    for (const row of stmt.iterate(spaceId)) {
      if (req.destroyed) break; // Client disconnected

      res.write(JSON.stringify(row) + '\n');
      count++;

      // Yield to event loop every 100 rows
      if (count % 100 === 0) {
        await new Promise(resolve => setImmediate(resolve));
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
  const db = getDb();

  const cleanup = () => {};
  req.on('close', cleanup);
  res.on('finish', cleanup);

  try {
    const rows = db
      .prepare(
        `SELECT id, location_id, content, tags, importance, semantic_cat, created_at
         FROM memory
         WHERE location_id IN (
           SELECT id FROM location WHERE space_id = ?
         )
         AND deleted_at IS NULL
         ORDER BY created_at DESC`
      )
      .all(spaceId);

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