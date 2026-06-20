# SQLite → Neon Migration Checklist

## Pre-Migration (Phase A: Dual-Write Bridge)

- [ ] Update `entrypoint.sh` with WAL optimizations (Optimizations 1, 3)
- [ ] Deploy updated entrypoint to Fly.io: `fly deploy --app unimatrix-dashboard`
- [ ] Verify WAL optimizations in logs: `fly logs -a unimatrix-dashboard | grep "SQLite optimizations"`
- [ ] Update `exportData.ts` with Connection: close header (Optimization 2)
- [ ] Add DualWriteStorage class to `storage.ts`
- [ ] Implement WAL checkpoint in export handler (Optimization 4)
- [ ] Set feature flag: `fly secrets set ENABLE_DUAL_WRITE=true`
- [ ] Deploy: `fly deploy --app unimatrix-dashboard`
- [ ] Verify shadow writes in logs: `fly logs -a unimatrix-dashboard | grep "shadow-write"`
- [ ] Monitor for 7 days: 0% shadow write errors
- [ ] Confirm Neon project `long-bird-25172855` has audit_log table created

## Migration Window (Phase B: Live Cutover)

**Scheduled downtime: ~5 minutes**

### Day Before
- [ ] Test migration script with `--dry-run`: `DATABASE_URL_DIRECT=... npx tsx scripts/migrate-sqlite-to-neon.ts --dry-run`
- [ ] Verify all row counts match in dry run output
- [ ] Document current audit_log row count from SQLite: `sqlite3 /app/data/data.db "SELECT COUNT(*) FROM audit_log;"`
- [ ] Take backup: `sqlite3 /app/data/data.db ".dump" > ~/unimatrix-backup-$(date +%Y%m%d).sql`

### Cutover Day (Evening, low-traffic window)
- [ ] Announce maintenance window (15 min)
- [ ] Disable automated MCP agents (if applicable): pause cron jobs
- [ ] Run live migration: `DATABASE_URL_DIRECT=... npx tsx scripts/migrate-sqlite-to-neon.ts`
- [ ] Verify all row counts match: check final output
- [ ] Get Neon pooled connection string:
  ```bash
  # From console.neon.tech → Project: Unimatrix → Connection Details
  # Copy: postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb
  ```
- [ ] Set environment variable: `fly secrets set DATABASE_URL="<neon-pooled-url>"`
- [ ] Deploy: `fly deploy --app unimatrix-dashboard`
- [ ] Wait for deployment to complete
- [ ] Smoke test: `curl https://unimatrix-dashboard.fly.dev/health`
- [ ] Test memory store: Create a test memory via UI
- [ ] Test audit log: Check `/audit` page shows new entry
- [ ] Monitor error rate for 30 minutes: `fly logs -a unimatrix-dashboard`

### Rollback (if issues)
- [ ] Disable dual-write: `fly secrets unset ENABLE_DUAL_WRITE`
- [ ] Clear Neon connection: `fly secrets unset DATABASE_URL`
- [ ] Deploy: `fly deploy --app unimatrix-dashboard` (reverts to SQLite)
- [ ] Verify app is healthy again

## Post-Migration (Phase C: 2-week Stabilization)

- [ ] Monitor for 48 hours: watch error logs, response times
- [ ] Verify audit_log integrity: Run HMAC spot checks
- [ ] Re-enable MCP agents if paused
- [ ] Prepare SQLite backup for archival
- [ ] Create S3 backup: `sqlite3 /app/data/data.db ".dump" | aws s3 cp - s3://unimatrix-backups/sqlite-archive-$(date +%Y%m%d).sql`
- [ ] Mark SQLite for decommission (after 2 weeks)
- [ ] Remove Fly volume: `fly volumes destroy <volume-id>`
- [ ] Update this checklist with completion timestamp

## Quick Reference: Decision Tree

```
Write latency p95 > 200 ms sustained?
  → YES: Trigger migration NOW

Any SQLITE_BUSY errors in prod logs?
  → YES: Trigger migration THIS WEEK

Running >1 Fly machine desired?
  → YES: Migrate before scaling

Phase 2 semantic search (pgvector) needed?
  → YES: Migrate immediately

Else: STAY ON SQLITE
```

## Monitoring Dashboards (Post-Migration)

Monitor Neon metrics in `console.neon.tech`:
- CPU: Should be <30% at baseline
- Memory: Should be <2 GB
- Connections: Should be <20 from Fly app
- IOPS: Should be <500/sec at baseline

Monitor Fly app metrics in `fly.io`:
- Status: Should be green
- Response times: Should be ±10% of pre-migration baseline
- Error rate: Should be <0.1%