# Production Automation Implementation Guide

**Date:** May 13, 2026  
**Status:** 🟢 READY TO IMPLEMENT  
**Time Estimate:** 30 minutes to get all 4 scripts running  

---

## Overview

Four powerful automation scripts have been created to support production deployment and operations. This guide shows you how to use each one.

### Quick Start

```bash
# List all available automation
node scripts/lead-intake-automation.js --help
node scripts/admin-setup.js --help
node scripts/database-backup.js --help
node scripts/post-deployment-verification.js --help
```

---

## Script 1: Lead Intake Automation

**Purpose:** Test and validate lead webhook processing under various conditions

**File:** `scripts/lead-intake-automation.js`

### When to Use

- ✅ Before UAT - verify webhook working
- ✅ Before launch - test throughput capacity
- ✅ After deployment - verify integration still working
- ✅ Load testing - ensure system handles volume

### Examples

**Create 10 test leads sequentially:**
```bash
node scripts/lead-intake-automation.js --count 10
```

**Create 50 leads in parallel (10 at a time):**
```bash
node scripts/lead-intake-automation.js --parallel 50 --concurrency 10
```

**Load test for 30 seconds at 20 requests/second:**
```bash
node scripts/lead-intake-automation.js --load-test 30 --throughput 20
```

**Verbose output (see each request):**
```bash
node scripts/lead-intake-automation.js --count 5 --verbose
```

### Output

```
Lead Intake Automation Script
Production URL: https://agency-ops-suite.vercel.app
Test Mode: NO

Starting sequential lead intake test (10 leads)
✅ Lead 1: 200 (145ms)
✅ Lead 2: 200 (132ms)
...
═══════════════════════════════════════
LEAD INTAKE TEST REPORT
═══════════════════════════════════════

✅ Successful: 10
❌ Failed: 0
⏱️  Rate Limited: 0
📊 Total: 10
📈 Success Rate: 100.00%

Timing Statistics (ms):
  Min:  120ms
  Avg:  145.30ms
  P95:  180ms
  P99:  190ms
  Max:  200ms

═══════════════════════════════════════
Report saved to: test-results/lead-intake-[timestamp].json
```

### Expected Results

| Test Type | Expected Success | Response Time |
|-----------|-----------------|---------------|
| Sequential (10) | 100% | < 250ms avg |
| Parallel (50) | 100% | < 300ms avg |
| Load test (20/sec) | > 99% | < 500ms p95 |

---

## Script 2: Admin User Setup

**Purpose:** Automate first admin user configuration and verification

**File:** `scripts/admin-setup.js`

### When to Use

- ✅ **FIRST PRIORITY** - blocks UAT testing
- ✅ Before deploying to production
- ✅ Adding additional admin users
- ✅ Configuring new team members

### Prerequisites

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Set Vercel token
$env:VERCEL_TOKEN = "your-vercel-token"
```

### Examples

**Add first admin user (manual verification):**
```bash
node scripts/admin-setup.js --email admin@company.com
```

**Add admin and immediately deploy:**
```bash
node scripts/admin-setup.js --email admin@company.com --deploy
```

**Add admin, deploy, and verify:**
```bash
node scripts/admin-setup.js --email admin@company.com --deploy --verify
```

**List current admins:**
```bash
node scripts/admin-setup.js --list-current
```

### Output

```
Admin User Setup Automation

→ Fetching current Vercel environment...
✅ Current admins: 1
  • existing-admin@company.com:admin

→ Adding admin to configuration
✅ Added admin: admin@company.com:admin

→ Applying configuration to Vercel...
✅ Environment variable updated

→ Triggering Vercel deployment...
✅ Deployment triggered

⏳ Waiting for deployment (max 120s)...
✅ Deployment ready

═══════════════════════════════════════
ADMIN SETUP COMPLETE
═══════════════════════════════════════

✅ New Admin Configured
   Email: admin@company.com
   Role: admin

📋 Next Steps:

1. Wait for deployment
   - Check: https://vercel.com/dashboard
   - Status should show "Ready"

2. Test admin login
   - Go to: https://agency-ops-suite.vercel.app
   - Click "Login"
   - Enter email: admin@company.com
   - Check inbox for magic link

3. Verify admin access
   - You should see the dashboard
   - Try accessing: /audit-logs

4. Run UAT tests
   - node scripts/uat-test-suite.js
```

### Verification Checklist

After running the script:

- [ ] Script completes without errors
- [ ] Check Vercel dashboard shows "Ready"
- [ ] Try logging in with the new admin email
- [ ] Verify magic link received in email
- [ ] Dashboard loads after login
- [ ] No 401 Unauthorized errors
- [ ] Run UAT tests to verify access

---

## Script 3: Database Backup

**Purpose:** Automated PostgreSQL backups with compression and verification

**File:** `scripts/database-backup.js`

### When to Use

- ✅ Before production launch (create baseline backup)
- ✅ Daily backup schedule (set in cron)
- ✅ Before major deployments
- ✅ Disaster recovery testing
- ✅ Backup verification and cleanup

### Prerequisites

```bash
# Install PostgreSQL client tools
# Windows: Download from https://www.postgresql.org/download/windows/
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql-client

# Set database URL
$env:DATABASE_URL = "postgresql://user:password@host:5432/database"
# OR
$env:SUPABASE_URL = "postgresql://..." # Supabase connection string
```

### Examples

**Create immediate backup:**
```bash
node scripts/database-backup.js --backup
```

**Backup and verify integrity:**
```bash
node scripts/database-backup.js --backup --verify
```

**List all existing backups:**
```bash
node scripts/database-backup.js --list
```

**Clean up old backups (keep only 7):**
```bash
node scripts/database-backup.js --cleanup --keep 7
```

**Full production workflow:**
```bash
# Create backup
node scripts/database-backup.js --backup --verify

# List to confirm
node scripts/database-backup.js --list

# Later: cleanup old backups
node scripts/database-backup.js --cleanup --keep 30
```

### Output

```
Database Backup Automation

→ Creating SQL dump...
✅ SQL dump created: 245.3 MB (8234ms)

→ Compressing backup...
✅ Compressed: 12.5 MB (3456ms)

✅ Backup complete

═══════════════════════════════════════
DATABASE BACKUP REPORT
═══════════════════════════════════════

✅ Backup Created
   Timestamp: 2026-05-13T15-30-45
   Filename:  backup-2026-05-13T15-30-45.sql.gz
   Size:      12.5 MB
   Hash:      a1b2c3d4e5f6g7h8...

📦 Compression
   Original Size:    245.3 MB
   Compressed Size:  12.5 MB
   Ratio:            94.90%

⏱️  Performance
   Duration: 8234ms (8.23s)

📍 Location
   Path: d:\GitHub\Portfolio Files\agency-ops-suite\backups\backup-2026-05-13T15-30-45.sql.gz

📋 Recovery Information
   Database: Supabase PostgreSQL
   Restore Time: ~8s
   RPO: < 24 hours (recommended daily backups)

═══════════════════════════════════════
Report saved to: test-results/[timestamp]-report.json
```

### Backup Schedule (Windows Task Scheduler)

```powershell
# Create daily backup task
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-Command `"cd 'd:\GitHub\Portfolio Files\agency-ops-suite'; node scripts/database-backup.js --backup --verify`""
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM
$task = Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "DailyDatabaseBackup" -Description "Automated daily database backup"
```

---

## Script 4: Post-Deployment Verification

**Purpose:** Monitor system health and collect metrics after production deployment

**File:** `scripts/post-deployment-verification.js`

### When to Use

- ✅ **IMMEDIATELY AFTER DEPLOYMENT** - first 30 minutes
- ✅ First 24 hours monitoring
- ✅ First 48 hours health check
- ✅ Continuous monitoring
- ✅ Troubleshooting issues

### Examples

**Single health check:**
```bash
node scripts/post-deployment-verification.js
```

**Monitor for 2 hours (30-second checks):**
```bash
node scripts/post-deployment-verification.js --watch 120
```

**Continuous monitoring (5-minute intervals):**
```bash
node scripts/post-deployment-verification.js --continuous --interval 300
```

**Analyze collected metrics:**
```bash
node scripts/post-deployment-verification.js --analyze 24
```

**Generate report from saved metrics:**
```bash
node scripts/post-deployment-verification.js --report
```

### Output

```
═══════════════════════════════════════
POST-DEPLOYMENT VERIFICATION CHECK
═══════════════════════════════════════

🏥 Health Check

✅ Health Endpoint          200 145ms
✅ Dashboard (Public)       200 234ms
✅ API Contracts             401 156ms
✅ API Audit Logs            401 167ms

📡 Availability Check

✅ Status: AVAILABLE
Response Time: 145ms

⚡ Performance Check

Health endpoint: 145ms
Average response time: 147ms
Min/Max: 142ms / 150ms

📊 Error Rate Check

Error Rate: 0.00% (0/20)

📋 Summary
Total checks: 12
✅ Successful: 12
❌ Failed: 0

═══════════════════════════════════════

ℹ️ Metrics saved to: test-results/deployment-metrics/metrics-2026-05-13T15-30-45.json
```

### Monitoring Schedule

**Deployment Day (Hour 0-1):**
```bash
# Run continuously with 5-second checks
node scripts/post-deployment-verification.js --continuous --interval 5
```

**Deployment Day (Hour 1-8):**
```bash
# Run every 30 seconds
node scripts/post-deployment-verification.js --continuous --interval 30
```

**Deployment Day (Hour 8+):**
```bash
# Run every 5 minutes
node scripts/post-deployment-verification.js --continuous --interval 300
```

**Day 2 Review:**
```bash
# Analyze metrics from first 24 hours
node scripts/post-deployment-verification.js --analyze 24
```

---

## Complete Implementation Timeline

### 30 Minutes Before Deployment

```bash
# 1. Verify all systems ready
node scripts/uat-test-suite.js

# 2. Create backup
node scripts/database-backup.js --backup --verify

# 3. List backups
node scripts/database-backup.js --list
```

### 0 Minutes - Deployment

```bash
# 4. Add first admin user
node scripts/admin-setup.js --email admin@company.com --deploy --verify

# 5. Wait for deployment to complete
# (Script will wait up to 2 minutes)
```

### 0-5 Minutes After Deployment

```bash
# 6. Start continuous monitoring (5-second intervals)
node scripts/post-deployment-verification.js --continuous --interval 5
# Keep this running in a terminal window
```

### 5-30 Minutes After Deployment

```bash
# In another terminal window:
# 7. Create test leads to verify integration
node scripts/lead-intake-automation.js --count 5 --verbose

# 8. Check results in monitoring window (should see activity)
```

### 30 Minutes - 8 Hours After Deployment

```bash
# 9. Switch monitoring to 30-second intervals
# (Stop and restart the monitoring script)
node scripts/post-deployment-verification.js --continuous --interval 30
```

### 24 Hours After Deployment

```bash
# 10. Analyze first 24 hours
node scripts/post-deployment-verification.js --analyze 24

# 11. Review results and document baseline metrics
# 12. Create second backup
node scripts/database-backup.js --backup --verify
```

### 48 Hours After Deployment

```bash
# 13. Analyze first 48 hours
node scripts/post-deployment-verification.js --analyze 48

# 14. Generate final report
# 15. Sign off on deployment success
```

---

## Production Operations

### Daily Operations

```bash
# Morning: Check overnight metrics
node scripts/post-deployment-verification.js --analyze 24

# Create daily backup (ideally automated via cron/scheduler)
node scripts/database-backup.js --backup --verify

# Verify no critical errors
# Review Vercel dashboard
```

### Weekly Operations

```bash
# Analyze last 7 days
node scripts/post-deployment-verification.js --analyze 168

# Clean up old backups
node scripts/database-backup.js --cleanup --keep 30

# Test backup recovery (optional but recommended)
```

### Monthly Operations

```bash
# Analyze last 30 days
node scripts/post-deployment-verification.js --analyze 720

# Full health check
node scripts/post-deployment-verification.js

# Review performance trends
# Document any anomalies
```

---

## Environment Variables Required

```bash
# For lead-intake-automation.js
$env:INTAKE_WEBHOOK_SECRET = "your-webhook-secret"
$env:PRODUCTION_URL = "https://agency-ops-suite.vercel.app"

# For admin-setup.js
$env:VERCEL_TOKEN = "your-vercel-token"
$env:VERCEL_PROJECT_ID = "agency-ops-suite"

# For database-backup.js
$env:DATABASE_URL = "postgresql://..." # from Supabase
# OR
$env:SUPABASE_URL = "postgresql://..."

# For post-deployment-verification.js
$env:PRODUCTION_URL = "https://agency-ops-suite.vercel.app"
```

### How to Set Environment Variables

**PowerShell (Windows):**
```powershell
$env:INTAKE_WEBHOOK_SECRET = "value"
$env:DATABASE_URL = "postgresql://..."
```

**Bash/Shell (Mac/Linux):**
```bash
export INTAKE_WEBHOOK_SECRET="value"
export DATABASE_URL="postgresql://..."
```

**Permanent (add to profile):**
```bash
# Add to ~/.bashrc or ~/.zshrc
export INTAKE_WEBHOOK_SECRET="your-secret"
export DATABASE_URL="postgresql://user:pass@host/db"
```

---

## Troubleshooting

### Lead Intake Automation - Connection Refused

**Problem:** Cannot connect to production endpoint

**Solutions:**
1. Verify production URL is correct
2. Check Vercel deployment is active
3. Confirm network connectivity
4. Try accessing URL in browser first

### Admin Setup - CLI Not Available

**Problem:** "Could not update via CLI"

**Solutions:**
1. Install Vercel CLI: `npm install -g vercel`
2. Set token: `vercel login`
3. Or update manually in Vercel dashboard
   - Settings → Environment Variables
   - Add to ADMIN_ROLE_ALLOWLIST

### Database Backup - pg_dump Not Found

**Problem:** "pg_dump not available"

**Solutions:**
1. Install PostgreSQL client tools
2. Add to PATH if already installed
3. Use full path: `"C:\Program Files\PostgreSQL\15\bin\pg_dump.exe"`

### Post-Deployment - Timeout Errors

**Problem:** Verification checks timing out

**Solutions:**
1. Check internet connectivity
2. Verify production URL accessible in browser
3. Check if Vercel deployment still in progress
4. Wait 5 minutes and retry

---

## Success Criteria

### Lead Intake Automation ✅
- [ ] Can create test leads
- [ ] All leads successfully stored
- [ ] Success rate > 95%
- [ ] Response time < 500ms

### Admin Setup ✅
- [ ] Admin user added to allowlist
- [ ] Deployment triggered
- [ ] Can log in with new email
- [ ] Dashboard accessible

### Database Backup ✅
- [ ] Backup file created
- [ ] Compression working (>50% reduction)
- [ ] Hash verified
- [ ] Restore procedure documented

### Post-Deployment Verification ✅
- [ ] All health checks passing
- [ ] Error rate < 0.1%
- [ ] Response time < 500ms
- [ ] Availability > 99%

---

## Next Steps

1. **Before Deployment:**
   - [ ] Run lead intake automation test
   - [ ] Create baseline backup
   - [ ] Verify admin setup script ready

2. **During Deployment:**
   - [ ] Add admin user
   - [ ] Monitor with verification script
   - [ ] Check deployment status

3. **After Deployment:**
   - [ ] Run test lead creation
   - [ ] Monitor first 24-48 hours
   - [ ] Analyze metrics
   - [ ] Create daily backup schedule

4. **Ongoing:**
   - [ ] Daily: Review metrics
   - [ ] Weekly: Backup cleanup
   - [ ] Monthly: Trend analysis

---

## Support

**For issues with scripts:**
- Check `--help` flag for each script
- Review console output and error messages
- Check `test-results/` directory for detailed reports
- See [TROUBLESHOOTING_GUIDE.md](docs/TROUBLESHOOTING_GUIDE.md)

**For Vercel issues:**
- Visit: https://vercel.com/dashboard
- Check deployment logs
- Review environment variables

**For database issues:**
- Check Supabase dashboard
- Verify connection string
- Test connectivity independently

---

## Quick Reference

```bash
# Health check
node scripts/post-deployment-verification.js

# Test lead intake (5 leads)
node scripts/lead-intake-automation.js --count 5

# Add admin user
node scripts/admin-setup.js --email admin@company.com

# Create backup
node scripts/database-backup.js --backup

# List backups
node scripts/database-backup.js --list

# Monitor (5-second checks)
node scripts/post-deployment-verification.js --continuous --interval 5

# Analyze metrics (24 hours)
node scripts/post-deployment-verification.js --analyze 24
```

---

**All 4 automation scripts are production-ready and fully documented.**

**Ready to deploy! 🚀**

