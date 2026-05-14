#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 [backup_file.sql]"
  echo "Example: $0 backups/backup-2026-05-11.sql"
  exit 1
fi

BACKUP_FILE="$1"
STAGING_DB_URL="${STAGING_SUPABASE_URL:-}"
STAGING_SERVICE_ROLE="${STAGING_SUPABASE_SERVICE_ROLE_KEY:-}"

if [ -z "$STAGING_DB_URL" ] || [ -z "$STAGING_SERVICE_ROLE" ]; then
  echo "ERROR: STAGING_SUPABASE_URL or STAGING_SUPABASE_SERVICE_ROLE_KEY not set"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring from: $BACKUP_FILE"
echo "To staging database..."

export PGPASSWORD="$STAGING_SERVICE_ROLE"

# extract project host like <project>.supabase.co -> host
STAGING_HOST="$(echo "$STAGING_DB_URL" | sed -E 's#https?://([^/]+).*#\1#')"

psql \
  --host="$STAGING_HOST" \
  --port=5432 \
  --username="postgres" \
  --dbname="postgres" \
  -f "$BACKUP_FILE"

echo "✓ Restore complete"
echo "Verify the data in staging database now"
