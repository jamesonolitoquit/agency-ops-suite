# Backup System Implementation Guide

**Status:** Day 1-3 of Operational Readiness  
**Goal:** Automated daily database backups with restore testing  
**Time:** 1-2 hours to set up

---

## Why This Matters

Before accepting your first paying client, you MUST have backups. Without backups:
- Any database corruption = total data loss
- Any accidental deletion = unrecoverable
- Any breach = no recovery point
- This will END your business

---

## Backup Strategy: Choose One

### Option 1: Local File Backups (Easiest)
- **Pros:** Free, simple, no external dependencies
- **Cons:** Only if you have a reliable local machine
- **Cost:** $0
- **Setup time:** 30 minutes
- **Recommended for:** Solo founder starting out

### Option 2: S3-Compatible Cloud Storage (Better)
- **Pros:** Off-site, scalable, disaster-proof
- **Cons:** Small monthly cost
- **Cost:** $5-15/month (Backblaze B2)
- **Setup time:** 1 hour
- **Recommended for:** Once you have clients paying

### Option 3: Supabase Built-in Backups (If Available)
- **Pros:** Managed by Supabase
- **Cons:** Depends on your plan
- **Cost:** Included in paid plans
- **Setup time:** 5 minutes
- **Recommended for:** Later stage

---

## Implementation: Option 1 (Local Backups)

### Step 1: Create Backup Directory

```bash
mkdir -p ~/backups/agency-ops-suite
cd ~/backups/agency-ops-suite
```

### Step 2: Create Backup Script

Create file: `daily-backup.sh`

```bash
#!/bin/bash
#
# Daily Database Backup Script for Agency Ops Suite
# 
# Usage: ./daily-backup.sh
# Install cron: crontab -e → add: 0 2 * * * /path/to/daily-backup.sh
#

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

BACKUP_DIR="$HOME/backups/agency-ops-suite"
LOG_FILE="$BACKUP_DIR/backup.log"
RETENTION_DAYS=30

# Get from .env.local
DB_URL="${SUPABASE_URL:-}"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

# ============================================================================
# VALIDATION
# ============================================================================

if [ -z "$DB_URL" ] || [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "[$(date)] ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" | tee -a "$LOG_FILE"
  echo "Set these in your shell environment or .env file" | tee -a "$LOG_FILE"
  exit 1
fi

if [ ! -d "$BACKUP_DIR" ]; then
  echo "[$(date)] Creating backup directory: $BACKUP_DIR" | tee -a "$LOG_FILE"
  mkdir -p "$BACKUP_DIR"
fi

# ============================================================================
# BACKUP
# ============================================================================

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

echo "[$(date)] Starting backup to: $BACKUP_FILE" | tee -a "$LOG_FILE"

# Extract connection info from Supabase URL
# URL format: https://[project-ref].supabase.co
PROJECT_REF=$(echo "$DB_URL" | grep -oP '(?<=https://).*?(?=\.supabase)' || true)

if [ -z "$PROJECT_REF" ]; then
  echo "[$(date)] ERROR: Could not extract project ref from DB_URL" | tee -a "$LOG_FILE"
  exit 1
fi

# Dump the database
# Note: This uses pg_dump via environment variables
export PGPASSWORD="${SERVICE_ROLE_KEY}"

pg_dump \
  --host="${PROJECT_REF}.supabase.co" \
  --port=5432 \
  --username="postgres" \
  --database="postgres" \
  --verbose \
  --format=plain \
  > "$BACKUP_FILE" 2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "[$(date)] ✓ Backup successful. Size: $SIZE" | tee -a "$LOG_FILE"
else
  echo "[$(date)] ✗ Backup failed" | tee -a "$LOG_FILE"
  exit 1
fi

# ============================================================================
# RETENTION POLICY
# ============================================================================

echo "[$(date)] Cleaning up backups older than $RETENTION_DAYS days" | tee -a "$LOG_FILE"

find "$BACKUP_DIR" -name "backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete

# Show current backups
echo "[$(date)] Current backups:" | tee -a "$LOG_FILE"
ls -lh "$BACKUP_DIR"/backup_*.sql | tail -5 | tee -a "$LOG_FILE"

# ============================================================================
# VERIFICATION
# ============================================================================

echo "[$(date)] Backup verification:" | tee -a "$LOG_FILE"
echo "[$(date)] - File exists: $([ -f "$BACKUP_FILE" ] && echo 'YES' || echo 'NO')" | tee -a "$LOG_FILE"
echo "[$(date)] - File size > 1MB: $([ $(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE") -gt 1048576 ] && echo 'YES' || echo 'NO')" | tee -a "$LOG_FILE"

echo "[$(date)] ========================================" | tee -a "$LOG_FILE"
```

### Step 3: Make Script Executable

```bash
chmod +x daily-backup.sh
```

### Step 4: Test the Script

```bash
# Set environment variables (if not in ~/.bashrc already)
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run manually to test
./daily-backup.sh
```

**Expected output:**
```
[2026-04-27 14:32:01] Starting backup to: /home/user/backups/agency-ops-suite/backup_20260427_143201.sql
[2026-04-27 14:32:15] ✓ Backup successful. Size: 125M
[2026-04-27 14:32:15] Cleaning up backups older than 30 days
[2026-04-27 14:32:15] Current backups:
-rw-r--r-- 1 user staff 125M Apr 27 14:32 backup_20260427_143201.sql
```

### Step 5: Set Up Cron Job

Schedule the backup to run daily at 2 AM:

```bash
crontab -e
```

Add this line:
```
0 2 * * * /home/user/backups/agency-ops-suite/daily-backup.sh
```

Verify it was added:
```bash
crontab -l
```

### Step 6: Create Restore Test Script

Create file: `test-restore.sh`

```bash
#!/bin/bash
#
# Restore backup to staging database for testing
#

set -e

if [ -z "$1" ]; then
  echo "Usage: ./test-restore.sh [backup_file]"
  echo "Example: ./test-restore.sh backup_20260427_143201.sql"
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

export PGPASSWORD="${STAGING_SERVICE_ROLE}"

# Extract host from URL
STAGING_HOST=$(echo "$STAGING_DB_URL" | grep -oP '(?<=https://).*?(?=\.supabase)' || true).supabase.co

psql \
  --host="$STAGING_HOST" \
  --port=5432 \
  --username="postgres" \
  --database="postgres" \
  < "$BACKUP_FILE"

echo "✓ Restore complete"
echo "Verify the data in staging database now"
```

```bash
chmod +x test-restore.sh
```

---

## Verification Checklist

- [ ] Backup script created and executable
- [ ] First manual backup ran successfully
- [ ] Backup file exists and is > 1MB
- [ ] Cron job scheduled (verify with `crontab -l`)
- [ ] Backup log shows successful runs
- [ ] At least 3 backups exist (run manually 3 times)

---

## Monitoring & Alerting (Optional)

### Add Backup Failure Alert

Create file: `check-backup-health.sh`

```bash
#!/bin/bash
#
# Check if backup ran today
# Send alert if it failed
#

BACKUP_DIR="$HOME/backups/agency-ops-suite"
TODAY=$(date +%Y%m%d)
LATEST=$(ls -t "$BACKUP_DIR"/backup_*.sql | head -1 | grep -o "backup_[0-9]*" | cut -d_ -f2)

if [ "$LATEST" != "$TODAY" ]; then
  # Send alert (email, Slack, etc.)
  echo "ALERT: No backup created today" | mail -s "Backup Failed" ops@youragency.com
fi
```

Add to crontab to run at 8 AM:
```
0 8 * * * /path/to/check-backup-health.sh
```

---

## Disaster Recovery Procedure

**IF YOUR DATABASE IS CORRUPTED:**

### Step 1: Locate Latest Good Backup
```bash
ls -lh ~/backups/agency-ops-suite/backup_*.sql | tail -5
```

### Step 2: Restore to Staging First (NEVER directly to production!)
```bash
./test-restore.sh ~/backups/agency-ops-suite/backup_[date].sql
```

### Step 3: Verify Data in Staging
- Connect to staging database
- Check leads, clients, billing tables
- Verify data looks correct

### Step 4: If Good, Restore to Production
```bash
# This assumes you have a production restore script
# BACKUP CURRENT PROD FIRST!
./restore-production.sh ~/backups/agency-ops-suite/backup_[date].sql
```

### Step 5: Verify Production
- Check dashboard
- Verify recent data
- Check no data is missing

---

## Schedule: When to Do This

**By Day 3 of Week 1:**
- ✅ Backup script created
- ✅ First manual backup done
- ✅ Cron job scheduled
- ✅ 3+ backups exist
- ✅ Restore test procedure documented

**Weekly:**
- Test restore procedure (restore to staging, verify data)

**Quarterly:**
- Rotate backup retention policies if needed
- Review backup logs for errors

---

## Cost Analysis

| Option | Setup | Monthly | Notes |
|--------|-------|---------|-------|
| Local files | Free | $0 | Only if reliable machine |
| Backblaze B2 | 15min | $6 | 100GB included |
| AWS S3 | 30min | $0.023/GB | If < 30GB/month |
| Supabase Pro | N/A | $25 | Includes built-in backups |

**Recommendation for first clients:** Start with local backups, migrate to B2 after client #5.

---

**Next step:** After lead bridge is working, implement this backup system to be "client-ready."
