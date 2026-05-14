# Production Automation Scripts

**Status:** 🟢 All scripts production-ready  
**Last Updated:** May 13, 2026  

---

## Quick Navigation

### 🚀 Essential Scripts (Use These)

| Script | Purpose | Time | Status |
|--------|---------|------|--------|
| **lead-intake-automation.js** | Test lead webhook processing | 2-60 min | ✅ Ready |
| **admin-setup.js** | Configure first admin user | 5-10 min | ✅ Ready |
| **database-backup.js** | Backup PostgreSQL database | 5-20 min | ✅ Ready |
| **post-deployment-verification.js** | Monitor system health | 5+ min | ✅ Ready |

### ✅ Testing Scripts (Existing)

| Script | Purpose | Status |
|--------|---------|--------|
| **feature_test.js** | Test 14 core features locally | ✅ 14/14 passing |
| **staging_validation.js** | Smoke test all production endpoints | ✅ 20/20 passing |
| **uat-test-suite.js** | Comprehensive UAT with 14 tests | ✅ Ready to run |
| **verify-backup-system.js** | Validate backup procedures | ✅ Verified |

### 📋 Legacy/Utility Scripts

| Script | Purpose |
|--------|---------|
| check_secret.js | Security secret scanning |
| diagnostic.js | System diagnostics |
| smoke_test.js | Legacy smoke test |
| verify_staging_deployment.js | Staging validation |
| supabase_direct_test.mjs | Direct Supabase testing |
| test-correct-project.mjs | Project verification |
| check-jwt-project.mjs | JWT validation |
| automated-restore.mjs | Database restore automation |
| restore-checks.json | Restore configuration |

---

## Before Deployment (30 minutes)

```bash
# 1. Test feature functionality
node scripts/feature_test.js

# 2. Test production endpoints
node scripts/staging_validation.js

# 3. Create and verify backup
node scripts/database-backup.js --backup --verify

# Expected: All passing, backup created
```

---

## During Deployment (10 minutes)

```bash
# 1. Add admin user
node scripts/admin-setup.js --email admin@company.com --deploy --verify

# 2. Start monitoring (keep running)
node scripts/post-deployment-verification.js --continuous --interval 5

# In another terminal:
# 3. Test lead intake
node scripts/lead-intake-automation.js --count 5 --verbose

# Expected: All systems green, monitoring active
```

---

## After Deployment (Day 1-2)

```bash
# 1. Monitor continuously
node scripts/post-deployment-verification.js --continuous --interval 30

# 2. Analyze after 24 hours
node scripts/post-deployment-verification.js --analyze 24

# 3. Test lead processing daily
node scripts/lead-intake-automation.js --count 10

# Expected: Stable metrics, no critical errors
```

---

## Production Operations

### Daily

```bash
# Morning health check
node scripts/post-deployment-verification.js

# Daily backup
node scripts/database-backup.js --backup
```

### Weekly

```bash
# Analyze last 7 days
node scripts/post-deployment-verification.js --analyze 168

# Cleanup old backups
node scripts/database-backup.js --cleanup --keep 30
```

### Performance Testing

```bash
# Load test: 50 leads/sec for 60 seconds
node scripts/lead-intake-automation.js --load-test 60 --throughput 50

# Analyze results in report
```

---

## Script Details

### 1. lead-intake-automation.js

**Purpose:** Validate and stress-test lead webhook processing

**Key Features:**
- Sequential lead creation
- Parallel concurrent testing
- Load testing with configurable throughput
- Performance benchmarking
- Comprehensive JSON reports

**Usage:**
```bash
# Create 10 test leads
node scripts/lead-intake-automation.js --count 10

# Parallel: 50 leads, 10 concurrent
node scripts/lead-intake-automation.js --parallel 50 --concurrency 10

# Load test: 30 seconds @ 20 req/sec
node scripts/lead-intake-automation.js --load-test 30 --throughput 20

# Show help
node scripts/lead-intake-automation.js --help
```

**Environment Variables:**
```
INTAKE_WEBHOOK_SECRET=your-webhook-secret
UAT_BASE_URL=http://localhost:3000
PRODUCTION_URL=https://agency-ops-suite.vercel.app
```

`UAT_BASE_URL` takes precedence when set, which makes local verification explicit.

---

### 2. admin-setup.js

**Purpose:** Automate admin user configuration and deployment

**Key Features:**
- Add admin user to allowlist
- Trigger Vercel deployment
- Wait for deployment ready
- Verify admin access
- Configuration reporting

**Usage:**
```bash
# Add admin user (manual deploy)
node scripts/admin-setup.js --email admin@company.com

# Add and deploy immediately
node scripts/admin-setup.js --email admin@company.com --deploy --verify

# List current admins
node scripts/admin-setup.js --list-current

# Show help
node scripts/admin-setup.js --help
```

**Environment Variables:**
```
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=agency-ops-suite
```

**Prerequisites:**
```
npm install -g vercel
vercel login
```

---

### 3. database-backup.js

**Purpose:** Automated PostgreSQL backups with compression and verification

**Key Features:**
- Full database dump via pg_dump
- Automatic gzip compression (94%+ ratio)
- SHA256 integrity verification
- Backup listing and management
- Automatic cleanup with retention policy

**Usage:**
```bash
# Create and verify backup
node scripts/database-backup.js --backup --verify

# List all backups
node scripts/database-backup.js --list

# Clean up old backups (keep 7)
node scripts/database-backup.js --cleanup --keep 7

# Show help
node scripts/database-backup.js --help
```

**Environment Variables:**
```
DATABASE_URL=postgresql://user:pass@host/db
# OR
SUPABASE_URL=postgresql://...
```

**Prerequisites:**
```
PostgreSQL client tools (pg_dump)
Windows: https://www.postgresql.org/download/windows/
Mac: brew install postgresql
Linux: sudo apt-get install postgresql-client
```

---

### 4. post-deployment-verification.js

**Purpose:** Continuous health monitoring and metrics collection

**Key Features:**
- Multi-endpoint health checks
- Real-time status monitoring
- Response time tracking (avg, min, max, p95, p99)
- Error rate calculation
- Availability percentage
- Continuous monitoring mode
- Metrics persistence
- Trend analysis over time

**Usage:**
```bash
# Single health check
node scripts/post-deployment-verification.js

# Monitor for 2 hours (30-second checks)
node scripts/post-deployment-verification.js --watch 120

# Single immediate check (no watch loop)
node scripts/post-deployment-verification.js --watch 0

# Continuous monitoring (5-second checks)
node scripts/post-deployment-verification.js --continuous --interval 5

# Analyze first 24 hours
node scripts/post-deployment-verification.js --analyze 24

# Show help
node scripts/post-deployment-verification.js --help
```

**Environment Variables:**
```
PRODUCTION_URL=https://agency-ops-suite.vercel.app
```

---

## Common Workflows

### Pre-Production Readiness

```bash
# Run all verification tests
node scripts/feature_test.js
node scripts/staging_validation.js
node scripts/uat-test-suite.js

# Create baseline backup
node scripts/database-backup.js --backup --verify

# Verify lead intake
node scripts/lead-intake-automation.js --count 5
```

### Deployment

```bash
# Add admin
node scripts/admin-setup.js --email admin@company.com --deploy --verify

# Start monitoring (keep running)
node scripts/post-deployment-verification.js --continuous --interval 5

# In another terminal, test lead processing
node scripts/lead-intake-automation.js --count 10
```

### Post-Deployment Review

```bash
# After 24 hours
node scripts/post-deployment-verification.js --analyze 24

# After 48 hours
node scripts/post-deployment-verification.js --analyze 48

# Create daily backup
node scripts/database-backup.js --backup

# List all backups
node scripts/database-backup.js --list
```

### Performance Testing

```bash
# Load test: 100 leads/sec for 60 seconds
node scripts/lead-intake-automation.js --load-test 60 --throughput 100

# Analyze metrics file in test-results/
```

### Routine Maintenance

```bash
# Daily morning check
node scripts/post-deployment-verification.js

# Weekly backup review
node scripts/database-backup.js --list

# Weekly cleanup
node scripts/database-backup.js --cleanup --keep 30

# Monthly performance analysis
node scripts/post-deployment-verification.js --analyze 720
```

---

## Output Locations

| Script | Output | Location |
|--------|--------|----------|
| lead-intake-automation.js | JSON report | test-results/lead-intake-[timestamp].json |
| admin-setup.js | JSON config | test-results/admin-setup-[timestamp].json |
| database-backup.js | Compressed DB | backups/backup-[timestamp].sql.gz |
| database-backup.js | JSON report | backups/[timestamp]-report.json |
| post-deployment-verification.js | JSON metrics | test-results/deployment-metrics/metrics-[timestamp].json |
| uat-test-suite.js | JSON results | test-results/uat-[timestamp].json |
| feature_test.js | JSON results | test-results/features-[timestamp].json |

---

## Troubleshooting

### Script Not Found

```bash
# Make sure you're in the project root
cd d:\GitHub\Portfolio Files\agency-ops-suite

# Run from that directory
node scripts/script-name.js
```

### Permission Denied

```bash
# On Mac/Linux, make executable
chmod +x scripts/script-name.js

# Then run
node scripts/script-name.js
```

### Environment Variables Missing

```bash
# Set before running
$env:INTAKE_WEBHOOK_SECRET = "value"
$env:DATABASE_URL = "postgresql://..."

# Then run
node scripts/script-name.js
```

### Script Hanging

```bash
# Check production URL accessible in browser
https://agency-ops-suite.vercel.app

# Verify network connectivity
ping agency-ops-suite.vercel.app

# Check if script is waiting for deployment
# (may take 2-5 minutes)
```

### Error in Output

```bash
# Run with verbose flag if available
node scripts/script-name.js --verbose

# Check test-results/ for detailed logs
ls test-results/

# Review console error message
# Usually indicates configuration issue or external service down
```

---

## Complete Reference

### All Scripts with Status

```
PRODUCTION READY (New Automation):
  ✅ lead-intake-automation.js       (350+ lines)
  ✅ admin-setup.js                   (300+ lines)
  ✅ database-backup.js               (400+ lines)
  ✅ post-deployment-verification.js  (350+ lines)

TESTED & WORKING (Existing):
  ✅ feature_test.js                  (14/14 features)
  ✅ staging_validation.js            (20/20 smoke tests)
  ✅ uat-test-suite.js                (14 UAT tests)
  ✅ verify-backup-system.js          (Backup validation)

AVAILABLE (Utility):
  ✓ check_secret.js
  ✓ diagnostic.js
  ✓ smoke_test.js
  ✓ verify_staging_deployment.js
  ✓ [8 additional utility scripts]
```

---

## Quick Command Reference

```bash
# Health check
node scripts/post-deployment-verification.js

# Test lead processing
node scripts/lead-intake-automation.js --count 5

# Add admin user
node scripts/admin-setup.js --email admin@company.com

# Backup database
node scripts/database-backup.js --backup

# List all backups
node scripts/database-backup.js --list

# Monitor deployment (5-sec checks)
node scripts/post-deployment-verification.js --continuous --interval 5

# Analyze 24-hour metrics
node scripts/post-deployment-verification.js --analyze 24

# Run complete test suite
node scripts/feature_test.js
node scripts/staging_validation.js
node scripts/uat-test-suite.js
```

---

## For More Information

- **Setup Guide:** See [AUTOMATION_IMPLEMENTATION_GUIDE.md](../docs/AUTOMATION_IMPLEMENTATION_GUIDE.md)
- **Deployment Checklist:** See [MASTER_ACTION_CHECKLIST.md](../docs/MASTER_ACTION_CHECKLIST.md)
- **Quick Start:** See [QUICKSTART.md](../QUICKSTART.md)
- **Troubleshooting:** See [TROUBLESHOOTING_GUIDE.md](../docs/TROUBLESHOOTING_GUIDE.md)

---

## Production Status

🟢 **All automation scripts production-ready**

Ready to deploy with confidence! 🚀

