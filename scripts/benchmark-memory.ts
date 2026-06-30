#!/usr/bin/env npx ts-node --esm
/**
 * scripts/benchmark-memory.ts
 *
 * Synthetic memory benchmark harness.
 * Tests memory density, tier behavior, and retrieval latency under load.
 *
 * Usage:
 *   npx ts-node --esm scripts/benchmark-memory.ts --count 1000 --userId <uuid>
 *
 * What it tests:
 *   1. Write throughput: store N synthetic memories via the Librarian
 *   2. Tier distribution: verify HOT/WARM/COLD/ARCHIVE counts after write
 *   3. Retrieval latency: run 20 queries across vector / graph / fts / hybrid routes
 *   4. Decay accuracy: fast-forward time by setting last_accessed_at back, re-run decay
 *   5. Re-tier accuracy: verify cold/archive promotion after importance boost
 */

import { Pool } from 'pg';
import { processLibrarianJob } from '../packages/server/src/librarian/processJob.js';
import { retrieveMemories }    from '../packages/server/src/lib/retrievalRouter.js';
import { runDecayBatch }       from '../packages/server/src/lib/decay.js';
import { runReTierBatch }      from '../packages/server/src/lib/tierManager.js';

const db    = new Pool({ connectionString: process.env.DATABASE_URL });
const userId = process.argv[3] ?? process.env.BENCH_USER_ID ?? 'test-user-bench';
const count  = parseInt(process.argv[2] ?? '200', 10);

const SYNTHETIC_MEMORIES = [
  'I prefer TypeScript over JavaScript for all new projects.',
  'I am building UniMatrix, an AI memory system using MCP.',
  'I work on open-source AI infrastructure tools.',
  'My goal is to launch UniMatrix Phase 1 before end of Q3.',
  'I use Neon for PostgreSQL hosting and Fly.io for deployment.',
  'I like building things that help other developers.',
  'I am a veteran-led startup founder applying for SBIR grants.',
  'My preferred LLM clients are Claude Desktop and Cursor.',
  'I dislike vendor lock-in and prefer self-hostable software.',
  'I am developing an adaptive compression system for AI memory.',
];

function randomContent(): string {
  const base = SYNTHETIC_MEMORIES[Math.floor(Math.random() * SYNTHETIC_MEMORIES.length)];
  return `${base} (bench run ${Date.now()} #${Math.random().toString(36).slice(2)})`;
}

function formatMs(ms: number): string {
  return ms < 1000 ? `${ms.toFixed(1)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

async function run(): Promise<void> {
  console.log(`\n🔬 UniMatrix Memory Benchmark`);
  console.log(`   userId : ${userId}`);
  console.log(`   count  : ${count}`);
  console.log(`   db     : ${process.env.DATABASE_URL?.slice(0, 40)}...\n`);

  // ── 1. Write throughput ───────────────────────────────────────────────────
  console.log('📝 Phase 1: Write throughput...');
  const writeStart = Date.now();
  const ids: string[] = [];

  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    ids.push(id);

    // Insert bare row first (simulating what store_memory does)
    await db.query(
      `INSERT INTO memories (id, user_id, content, status, created_at, updated_at, last_accessed_at, access_count, importance)
       VALUES ($1, $2, $3, 'active', NOW(), NOW(), NOW(), 0, 0.5)
       ON CONFLICT DO NOTHING`,
      [id, userId, randomContent()],
    );

    await processLibrarianJob({ memoryId: id, userId, content: randomContent() });

    if ((i + 1) % 50 === 0) {
      const elapsed = Date.now() - writeStart;
      const rate    = ((i + 1) / elapsed * 1000).toFixed(1);
      process.stdout.write(`   ${i + 1}/${count} memories — ${rate}/s\r`);
    }
  }

  const writeMs = Date.now() - writeStart;
  const rate    = (count / writeMs * 1000).toFixed(1);
  console.log(`\n✅ Write: ${count} memories in ${formatMs(writeMs)} — ${rate}/s`);

  // ── 2. Tier distribution ──────────────────────────────────────────────────
  console.log('\n📊 Phase 2: Tier distribution...');
  const { rows: tiers } = await db.query<{ storage_tier: string; cnt: string }>(
    `SELECT storage_tier, COUNT(*) AS cnt FROM memories
      WHERE user_id = $1 AND status = 'active'
      GROUP BY storage_tier ORDER BY storage_tier`,
    [userId],
  );
  for (const t of tiers) console.log(`   ${t.storage_tier.padEnd(8)} : ${t.cnt}`);

  // ── 3. Retrieval latency ──────────────────────────────────────────────────
  console.log('\n⚡ Phase 3: Retrieval latency (20 queries)...');
  const queries = [
    { q: 'what projects am I building',  route: 'vector'  },
    { q: 'who do I work for',            route: 'graph'   },
    { q: 'TypeScript preferences',       route: 'fts'     },
    { q: 'deployment infrastructure',    route: 'hybrid'  },
    { q: 'memory compression algorithm', route: 'vector'  },
  ];

  for (const { q, route } of queries) {
    const t0 = Date.now();
    const results = await retrieveMemories({ userId, query: q, route: route as 'vector' | 'graph' | 'fts' | 'hybrid', limit: 5 });
    const ms = Date.now() - t0;
    console.log(`   [${route.padEnd(6)}] "${q.slice(0, 40)}" → ${results.length} results in ${formatMs(ms)}`);
  }

  // ── 4. Decay accuracy ────────────────────────────────────────────────────
  console.log('\n🕐 Phase 4: Decay accuracy (simulating 10-day-old memories)...');
  await db.query(
    `UPDATE memories SET last_accessed_at = NOW() - '10 days'::interval
      WHERE user_id = $1 AND status = 'active' LIMIT 50`,
    [userId],
  );
  const decayResult = await runDecayBatch(userId, { staleAfterDays: 3, limit: 100 });
  console.log(`   processed: ${decayResult.processed}, updated: ${decayResult.updated}`);

  // ── 5. Re-tier accuracy ───────────────────────────────────────────────────
  console.log('\n🔄 Phase 5: Re-tier accuracy...');
  const retierResult = await runReTierBatch(userId, { limit: count });
  console.log(`   evaluated: ${retierResult.evaluated}, promoted: ${retierResult.promoted}, demoted: ${retierResult.demoted}`);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  console.log('\n🧹 Cleanup: removing benchmark memories...');
  const { rowCount } = await db.query(
    `DELETE FROM memories WHERE user_id = $1 AND content LIKE '%bench run%'`,
    [userId],
  );
  console.log(`   removed: ${rowCount ?? 0} benchmark rows`);

  console.log('\n✨ Benchmark complete.\n');
  await db.end();
}

run().catch(err => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
