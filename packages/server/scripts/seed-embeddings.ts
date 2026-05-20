/**
 * scripts/seed-embeddings.ts
 *
 * One-shot script: generate Voyage AI embeddings for all spaces that don't
 * have one yet. Run after seeding spaces via raw SQL.
 *
 *   npx tsx --env-file=.env scripts/seed-embeddings.ts
 */

import { reindexAllSpaces } from '../src/librarian/classifySpace.js';
import { closePool }        from '../src/db/client.js';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

console.log('[seed-embeddings] Generating Voyage embeddings for default Wings...');

try {
  const count = await reindexAllSpaces(DEV_USER_ID);
  console.log(`[seed-embeddings] Done — indexed ${count} space(s)`);
} catch (err) {
  console.error('[seed-embeddings] Error:', err);
  process.exitCode = 1;
} finally {
  await closePool();
}
