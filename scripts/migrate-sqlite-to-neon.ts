import Database from 'better-sqlite3';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const SQLITE_PATH = process.env.SQLITE_PATH || '/app/data/data.db';
const DATABASE_URL_DIRECT = process.env.DATABASE_URL_DIRECT!;

if (!DATABASE_URL_DIRECT) {
  console.error('ERROR: DATABASE_URL_DIRECT env var not set');
  process.exit(1);
}

const sqlite = new Database(SQLITE_PATH);
const pg = new Pool({ connectionString: DATABASE_URL_DIRECT });

// Migration order respects FK constraints
const MIGRATION_ORDER = [
  'User',
  'Space', // formerly Palace
  'Location',
  'Memory',
  'AgentRun',
  'ApiKey',
  'audit_log'
];

const DRY_RUN = process.argv.includes('--dry-run');

function transformRow(table: string, row: any): any {
  const transformed = { ...row };

  // Timestamp conversions: SQLite INTEGER (epoch ms) → PG timestamptz
  for (const col of ['created_at', 'updated_at', 'deleted_at', 'revoked_at', 'rotated_at']) {
    if (transformed[col] && typeof transformed[col] === 'number') {
      transformed[col] = new Date(transformed[col]);
    }
  }

  // JSON conversions: SQLite TEXT (JSON string) → PG JSONB
  if (table === 'audit_log' && transformed.metadata && typeof transformed.metadata === 'string') {
    try {
      transformed.metadata = JSON.parse(transformed.metadata);
    } catch (e) {
      console.warn(`  ⚠ Failed to parse metadata for audit_log ${transformed.id}`);
    }
  }

  if (table === 'AgentRun' && transformed.result && typeof transformed.result === 'string') {
    try {
      transformed.result = JSON.parse(transformed.result);
    } catch (e) {
      console.warn(`  ⚠ Failed to parse result for AgentRun ${transformed.id}`);
    }
  }

  // Array conversions: SQLite TEXT (JSON string) → PG array
  if (table === 'memory' && transformed.tags && typeof transformed.tags === 'string') {
    try {
      transformed.tags = JSON.parse(transformed.tags);
    } catch (e) {
      transformed.tags = [];
    }
  }

  // Map renamed columns
  if (table === 'Space' && transformed.palace_id) {
    transformed.space_id = transformed.palace_id;
    delete transformed.palace_id;
  }

  if (transformed.palace_id && ['Location', 'AgentRun'].includes(table)) {
    transformed.space_id = transformed.palace_id;
    delete transformed.palace_id;
  }

  return transformed;
}

async function migrateTable(tableName: string): Promise<number> {
  console.log(`\nMigrating ${tableName}...`);

  try {
    // Get source data from SQLite
    const rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all();
    console.log(`  Found ${rows.length} rows in SQLite`);

    if (rows.length === 0) {
      console.log(`  ✓ No rows to migrate`);
      return 0;
    }

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would migrate ${rows.length} rows`);
      return rows.length;
    }

    // Batch insert in chunks of 500
    const CHUNK_SIZE = 500;
    let totalInserted = 0;

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);

      await pg.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
      try {
        for (const row of chunk) {
          const transformed = transformRow(tableName, row);
          const cols = Object.keys(transformed)
            .map(k => `"${k}"`)
            .join(', ');
          const vals = Object.values(transformed);
          const placeholders = vals.map((_, j) => `$${j + 1}`).join(', ');

          await pg.query(
            `INSERT INTO "${tableName}" (${cols}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
            vals
          );
        }
        await pg.query('COMMIT');
        totalInserted += chunk.length;
        console.log(`  ✓ Migrated rows ${i}–${Math.min(i + chunk.length, rows.length)}`);
      } catch (err) {
        await pg.query('ROLLBACK');
        throw err;
      }
    }

    return totalInserted;
  } catch (error: any) {
    console.error(`  ✗ Migration failed: ${error.message}`);
    throw error;
  }
}

async function verifyMigration(): Promise<boolean> {
  console.log('\n\nVerifying migration...');
  let allMatch = true;

  for (const table of MIGRATION_ORDER) {
    const sqliteCount = (sqlite.prepare(`SELECT COUNT(*) as c FROM "${table}"`).get() as any)
      .c;
    const pgResult = await pg.query(`SELECT COUNT(*) as count FROM "${table}"`);
    const pgCount = parseInt(pgResult.rows[0].count);

    const match = sqliteCount === pgCount;
    const status = match ? '✓' : '✗';
    console.log(`  ${status} ${table}: SQLite=${sqliteCount}, Neon=${pgCount}`);

    if (!match) allMatch = false;
  }

  return allMatch;
}

async function runMigration() {
  console.log('═'.repeat(60));
  console.log('UniMatrix: SQLite → Neon PostgreSQL Migration');
  console.log('═'.repeat(60));
  console.log(`SQLite: ${SQLITE_PATH}`);
  console.log(`Neon: ${DATABASE_URL_DIRECT}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log('═'.repeat(60));

  try {
    // Set SQLite to read-only
    if (!DRY_RUN) {
      console.log('\n1. Setting SQLite to read-only...');
      sqlite.exec('PRAGMA wal_checkpoint(TRUNCATE)');
      sqlite.exec('PRAGMA query_only = ON');
      console.log('  ✓ SQLite checkpoint complete');
    }

    // Migrate tables
    console.log('\n2. Migrating tables...');
    let totalMigrated = 0;
    for (const table of MIGRATION_ORDER) {
      totalMigrated += await migrateTable(table);
    }
    console.log(`\n  Total rows migrated: ${totalMigrated}`);

    // Verify
    if (!DRY_RUN) {
      const verified = await verifyMigration();
      if (!verified) {
        console.error('\n✗ Verification FAILED — row counts do not match');
        process.exit(1);
      }
    }

    console.log('\n═'.repeat(60));
    if (DRY_RUN) {
      console.log('✓ DRY RUN COMPLETE');
      console.log('Run without --dry-run to perform actual migration');
    } else {
      console.log('✓ MIGRATION SUCCESSFUL');
      console.log('\nNext steps:');
      console.log('  1. fly secrets set DATABASE_URL=<neon-pooled-url>');
      console.log('  2. fly deploy --app unimatrix-dashboard');
      console.log('  3. Monitor: fly logs -a unimatrix-dashboard');
      console.log('  4. If issues: fly secrets unset DATABASE_URL (rollback)');
    }
    console.log('═'.repeat(60));
  } catch (error) {
    console.error('\n✗ MIGRATION FAILED:', error);
    process.exit(1);
  } finally {
    sqlite.close();
    await pg.end();
  }
}

runMigration();