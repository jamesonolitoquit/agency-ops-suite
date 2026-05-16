# 48-Hour Production Monitoring Guide

**Period:** Hours 0-48 after production deployment  
**Status:** Post-deployment phase - confirm production stability before scaling  
**Owner:** DevOps/Operations team  
**Alert Threshold:** Immediate escalation on critical errors

## Live Baseline

- `2026-05-14 03:29 UTC`: `/api/health` = 200, `/api/health/schema` = 200, `/` redirect = 307, `/api/intake/lead` = 405, `/api/admin/system-health` = 401
- `2026-05-14 03:30 UTC`: Rechecked baseline, same outcomes, no drift observed
- `feature_test.js`: 14/14 critical feature checks passed against production
- `scripts/post-deployment-validation.js`: 8/8 checks passed for email and backup infrastructure
- `scripts/backup-restoration-test.js`: 7/7 checks passed for backup readiness
- `2026-05-14 03:30 UTC`: Second monitoring pass confirmed stable health (`/api/health` = 200, `/api/health/schema` = 200) and 14/14 feature smoke checks passing
- `2026-05-14 03:31 UTC`: Third monitoring pass confirmed stability again, with 5/5 monitor checks passing and 14/14 feature smoke checks passing
- `2026-05-14 03:32 UTC`: Fourth monitoring pass confirmed continued stability, with 5/5 monitor checks, 8/8 email-backup checks, and 7/7 backup readiness checks passing
- `2026-05-14 03:35 UTC`: Backup-restore drill completed successfully using `apps/admin-dashboard/backups/backup-2026-05-14T03-34-54-939Z.json`; restore simulation and backup JSON validation passed
- `2026-05-14 03:35 UTC`: Fifth monitoring pass after the backup drill confirmed stability again, with 5/5 monitor checks passing
- `2026-05-14 03:38 UTC`: Sixth monitoring pass confirmed the cleanup work did not affect production, with 5/5 monitor checks passing and no drift observed
- `2026-05-14 03:43 UTC`: Seventh monitoring pass remained green after the empty-folder review, with 5/5 monitor checks passing and no drift observed
- `2026-05-14 03:45 UTC`: Eighth monitoring pass remained green after the lockfile cleanup, with 5/5 monitor checks passing and no drift observed
- `2026-05-14 03:46 UTC`: Ninth monitoring pass remained green after the hygiene-script validation, with 5/5 monitor checks passing and no drift observed
- `2026-05-14 03:48 UTC`: Tenth monitoring pass remained green while the stale-reference sweep found no actionable cleanup, with 5/5 monitor checks passing and no drift observed
- `2026-05-14 03:56 UTC`: Eleventh monitoring pass remained green after the docs-consistency sweep, with 5/5 monitor checks passing and no drift observed
- `2026-05-14 04:04 UTC`: Twelfth monitoring pass remained green after the readiness-gate fixes, with 5/5 monitor checks passing and no drift observed
- `2026-05-14 04:05 UTC`: Thirteenth monitoring pass remained green during the launch-readiness review, with 5/5 monitor checks passing and no drift observed
- `2026-05-14 04:07 UTC`: Fourteenth monitoring pass remained green after the browser accessibility spot-check, with 5/5 monitor checks passing and no drift observed

---

## Pre-Monitoring Checklist

- [x] UAT suite: 14/14 tests passing ✅ (May 14, 2026)
- [x] Email infrastructure: 8/8 validation tests passing ✅
- [x] Backup infrastructure: 7/7 tests passing ✅
- [ ] Admin dashboard access: Verify at least one admin user can login
- [ ] Supabase credentials: Verified in Vercel production environment
- [ ] Slack/PagerDuty alerts: Configured and tested (if applicable)
- [ ] Monitoring tools: Set up (application logs, error tracking, etc.)

---

## Phase 1: Hours 0-12 (Intensive Monitoring)

### Every 2 hours:

1. **Application Health**
   ```bash
   # Test main endpoints
   curl https://agency-ops-suite.vercel.app/ -I
   curl https://agency-ops-suite.vercel.app/api/intake/lead -X OPTIONS -I
   ```
   - Status: Should be 200 or 307 (redirect to login)
   - Response time: < 2 seconds
   - No 5xx errors

2. **Database Connectivity**
   - Check: Supabase dashboard for connection errors
   - Metrics: Active connections should be stable
   - Alerts: Any connection pool exhaustion?

3. **Lead Intake Webhook**
   - Test: Send sample lead via webhook with valid secret
   - Expected: 201 Created or 200 OK
   - Check: Lead appears in database within 2 seconds
   - Verify: Rate limiting is working (6th request within 1min blocked)

4. **Error Logs Review**
   - Check: Application error tracking (if configured)
   - Look for: Repeated errors, auth failures, data access issues
   - Action: Note any errors for later review

### Every 4 hours:

5. **Admin Dashboard Access Test**
   - Login attempt from different location/browser
   - Navigate through key pages: Clients, Leads, Billing
   - Expected: All pages load without errors
   - Check: Data displays correctly

6. **Data Integrity Check**
   - Query sample: "SELECT COUNT(*) FROM leads, clients, invoices"
   - Verify: Row counts are stable (not increasing unexpectedly)
   - Look for: Duplicate data, missing records

7. **Email System Check**
   - If available: Check Resend delivery logs
   - Expected: Any test emails should show "delivered" status
   - Alert: Any bounces or failures?

---

## Phase 2: Hours 12-24 (Standard Monitoring)

### Every 4 hours:

1. **Application Availability**
   - Run UAT suite again
   - Expected: Still 14/14 tests passing
   - Note: Any performance degradation?

2. **Performance Metrics**
   - Check: Response times for critical endpoints
   - Baseline: Should be < 500ms for data queries
   - Alert: If > 1 second consistently

3. **Database Performance**
   - Supabase dashboard: Check query performance
   - Look for: Slow queries (> 100ms)
   - Action: Note any queries for optimization review

4. **Error Rate Trending**
   - Compare: Hour 0-12 error rate vs Hour 12-24
   - Concern: If error rate is increasing
   - Action: Investigate root causes

### Once (Hour 18-20):

5. **Backup System Test**
   - Run backup endpoint (if automated)
   - Expected: Backup file created successfully
   - Verify: Backup JSON is valid and contains data
   - Check: File is stored in `/backups` directory

---

## Phase 3: Hours 24-48 (Stability Confirmation)

### Every 6 hours:

1. **Full System Health Check**
   - Run complete UAT suite
   - Expected: All 14 tests still passing
   - Check: No degradation from Hour 0

2. **Database Statistics**
   - Total records: Leads, Clients, Invoices, Contracts
   - Expected: Stable counts (only new intentional data added)
   - Alert: Unexpected deletions or growth?

3. **Performance Summary**
   - Average response time over 24-hour period
   - Expected: Consistent with baseline (< 500ms)
   - Trend: Improving, stable, or degrading?

### Final Check (Hour 48):

4. **48-Hour Status Report**
   - Total errors: Should be < 10 for entire period
   - Availability: Should be >= 99.5% uptime
   - Performance: All endpoints responsive
   - Data integrity: All tables consistent

---

## Critical Alerts (Stop and Investigate)

### 🚨 Immediate Escalation Required If:

1. **Authentication System Down**
   - Admin cannot login for > 5 minutes
   - Any 401/403 errors on valid credentials
   - Action: Check auth middleware, Supabase session table

2. **Database Unreachable**
   - Supabase connection pool exhausted
   - Any "connection refused" errors
   - Action: Check Supabase status, verify credentials

3. **Lead Intake Webhook Failures**
   - Webhook returns 5xx errors
   - Leads not appearing in database
   - Action: Check webhook handler logs, verify secret

4. **Data Corruption Detected**
   - Duplicate records appearing
   - Missing critical fields
   - Unexpected data deletions
   - Action: Verify backup integrity, consider restore

5. **Performance Degradation**
   - Response times > 5 seconds sustained
   - Timeouts on database queries
   - Action: Check database CPU/memory, review slow queries

6. **Error Rate Spike**
   - > 5% of requests returning 5xx errors
   - Error rate increasing over time
   - Action: Check application logs, recent deployments

---

## Monitoring Tools & Commands

### View Application Logs
```bash
# Vercel deployment logs
vercel logs --prod

# Or check Vercel dashboard
# https://vercel.com/jamesonolitoquit/agency-ops-suite
```

### Check Supabase Status
```bash
# Login to Supabase dashboard
# https://app.supabase.com/projects/xfasfyuhtelnmsyokygc

# Check:
# - Query Performance tab
# - Database Usage (connections, storage)
# - Realtime subscriptions (if any)
```

### Test Lead Intake
```bash
# From your local machine:
curl -X POST https://agency-ops-suite.vercel.app/api/intake/lead \
  -H "Content-Type: application/json" \
   -H "X-Intake-Secret: <redacted>" \
  -d '{
    "email": "monitor@test.example.com",
    "name": "Monitoring Test",
    "source": "monitoring-check",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'

# Expected response: 201 or 200
```

### Run UAT Suite
```bash
$env:UAT_BASE_URL='https://agency-ops-suite.vercel.app'
$env:INTAKE_WEBHOOK_SECRET='<redacted>'
node scripts/uat-test-suite.js
```

### Validation Suites
```bash
# Email & backup validation
node scripts/post-deployment-validation.js

# Backup restoration test
node scripts/backup-restoration-test.js
```

---

## Monitoring Log Template

```
╔══════════════════════════════════════════════════════════════════════════════╗
║ 48-Hour Production Monitoring Log - May 14-16, 2026                          ║
║ Application: Agency Ops Suite - https://agency-ops-suite.vercel.app         ║
╚══════════════════════════════════════════════════════════════════════════════╝

HOUR 0 (May 14, 2:00 PM UTC)
  ✅ Initial UAT: 14/14 passing
  ✅ Application: Responding normally
  ✅ Database: Connected, 4 clients in DB
  🔵 Baseline established

HOUR 2 (May 14, 4:00 PM UTC)
  ✅ UAT sample: Health check passing
  ✅ Response time: 280ms average
  ✅ No errors logged
  
HOUR 4 (May 14, 6:00 PM UTC)
  ✅ Full UAT: 14/14 passing
  ✅ Admin dashboard: Login works
  ✅ Lead intake: Webhook responding
  
[Continue for 48 hours...]

HOUR 48 (May 16, 2:00 PM UTC)
  ✅ Final UAT: 14/14 passing
  ✅ Uptime: 99.8% (only 1 brief spike)
  ✅ Data integrity: All verified
  ✅ Ready for: Normal operations + feature work
```

---

## Post-48-Hour Actions

### If All Checks Pass ✅
1. **Mark deployment as stable**
2. **Resume feature development** (Phase 1 schema migrations)
3. **Schedule performance baseline** (load test with 10 concurrent users)
4. **Plan security audit** (external review)

### If Issues Found ⚠️
1. **Document in incident report**
2. **Determine severity:**
   - **Critical:** Immediate fix required, consider rollback
   - **High:** Fix within 24 hours
   - **Medium:** Schedule for next sprint
3. **Implement fix** and retest
4. **Extend monitoring** to 72 hours if needed

---

## Contact & Escalation

- **On-Call:** [Your team name]
- **Slack Channel:** #production-incidents
- **PagerDuty:** [Service link, if configured]
- **Database:** Supabase support (support@supabase.com)
- **Hosting:** Vercel support (support@vercel.com)

---

**Document Version:** 1.0  
**Created:** May 14, 2026  
**Last Updated:** May 14, 2026  
**Status:** ⏳ Ready to begin monitoring
