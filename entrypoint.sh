#!/bin/bash
set -e

# Ensure data directory exists
mkdir -p /app/data

DB_PATH="/app/data/data.db"

echo "Initializing SQLite database..."

# Enable WAL mode for better concurrent read performance
sqlite3 "$DB_PATH" "PRAGMA journal_mode = WAL;"

# Optimization 1: Increase auto-checkpoint threshold from 1000 to 4000 pages
# This defers checkpoint events 4× longer, reducing checkpoint frequency during write bursts
sqlite3 "$DB_PATH" "PRAGMA wal_autocheckpoint = 4000;"

# Optimization 3: Increase busy_timeout to 10 seconds (10000 ms)
# Prevents SQLITE_BUSY errors from surfacing as 5xx errors during contention
sqlite3 "$DB_PATH" "PRAGMA busy_timeout = 10000;"

# Set reasonable cache size (20,000 pages = 80 MB)
sqlite3 "$DB_PATH" "PRAGMA cache_size = 20000;"

# Enable synchronous mode for durability
sqlite3 "$DB_PATH" "PRAGMA synchronous = NORMAL;"

# Perform initial checkpoint
sqlite3 "$DB_PATH" "PRAGMA wal_checkpoint(PASSIVE);"

echo "SQLite optimizations applied:"
echo "  ✓ WAL mode enabled"
echo "  ✓ auto-checkpoint threshold: 4000 pages (~16 MB)"
echo "  ✓ busy_timeout: 10000 ms"
echo "  ✓ cache_size: 20000 pages (80 MB)"
echo "  ✓ synchronous: NORMAL"

# Start application
exec "$@"