# User Action Checklist — Before First Client Onboarding

**Status:** 🟡 70% Complete  
**Current Date:** May 13, 2026  
**Target:** First client onboarding ready  

---

## Overview

This checklist lists all **manual actions you must complete** before accepting the first paying client. Automated infrastructure is already deployed and tested (20/20 production smoke tests passing).

**Division of Work:**
- ✅ **Already Done (Automated):** All 14 MVP features, role-based auth, health endpoint, operational documentation
- 🟡 **You Must Do (Manual):** Supabase backups, monitoring dashboards, security audit, UAT testing

**Estimated Time to Complete:** 4-6 hours total  
**Critical Path:** Backup verification → Monitoring setup → Security audit → UAT sign-off

---

## Section 1: Supabase Backup & Disaster Recovery (Est. 2-3 hours)

### Task 1.1: Enable Daily Backups

**Status:** ⏳ Pending  
**Estimated Time:** 15 minutes  

**Steps:**
1. Navigate to [Supabase Dashboard](https://app.supabase.com) → Select your production project
2. Go to **Settings** → **Backups**
3. Verify **Automatic backups** toggle is ON
4. Set **Backup Retention** to **30 days** (minimum recommended)
5. Verify **Point-in-Time Recovery** is enabled
6. Take a screenshot and save the settings page URL for reference

**Acceptance Criteria:**
- [ ] Backups enabled (toggle ON)
- [ ] Retention is 30+ days
- [ ] Point-in-time recovery enabled
- [ ] Settings URL saved in SUPPORT_CONTACTS.md

**Documentation:**
- Reference: [BACKUP_SYSTEM_GUIDE.md](BACKUP_SYSTEM_GUIDE.md)
- Emergency: See [RESTORE_RUNBOOK.md](RESTORE_RUNBOOK.md) if needed immediately

---

### Task 1.2: Execute & Test Restore Procedure

**Status:** ⏳ Pending  
**Estimated Time:** 1-2 hours  
**Criticality:** HIGHEST (enables disaster recovery)

**Prerequisite:**
- [ ] Task 1.1 complete (backups enabled)
- [ ] Local environment set up with `docker` and `node`
- [ ] Supabase Service Role Key available (in `.env.local` or Vercel)

**Steps:**

**Option A: Automated Restore with Docker (Recommended)**

1. Download a recent backup from Supabase:
   ```bash
   # From Supabase Dashboard → Settings → Backups
   # Click "Download" on any recent backup
   # Save as: backups/backup-latest.sql
   ```

2. Run the automated restore validation script:
   ```bash
   cd d:\GitHub\Portfolio\ Files\agency-ops-suite
   node scripts/automated-restore.mjs backups/backup-latest.sql --checks scripts/restore-checks.json
   ```

3. Verify output shows:
   - ✅ All tables restored
   - ✅ Expected row counts (from restore-checks.json)
   - ✅ Foreign key constraints intact
   - ✅ RLS policies restored

4. Review the validation report

**Option B: Manual Restore (If automated script fails)**

1. Set up local PostgreSQL or Docker container with Supabase preset
2. Import the backup SQL file
3. Query table counts manually:
   ```sql
   SELECT COUNT(*) as clients_count FROM clients;
   SELECT COUNT(*) as leads_count FROM leads;
   SELECT COUNT(*) as audit_logs_count FROM audit_logs;
   ```

4. Verify counts match production (or expected baseline)

**Expected Output:**
```
✅ Restore Validation Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
clients:         X rows (expected > 0)
leads:           Y rows (expected > 0)
billing:         Z rows (expected > 0)
audit_logs:      N rows (expected > 0)
system_events:   M rows (expected > 0)

All checks passed. Ready for production.
```

**Acceptance Criteria:**
- [ ] Restore script runs without errors
- [ ] All tables present in restored database
- [ ] Row counts match expectations
- [ ] No data corruption detected
- [ ] RLS policies intact
- [ ] Validation report saved (for auditing)

**Documentation:**
- See: [AUTOMATED_RESTORE.md](AUTOMATED_RESTORE.md) for advanced options
- Troubleshoot: [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) section "Backup Restoration Issues"

---

### Task 1.3: Document RTO & RPO

**Status:** ⏳ Pending  
**Estimated Time:** 15 minutes  

**Steps:**
1. Open [PRODUCTION_OPERATIONS_RUNBOOK.md](PRODUCTION_OPERATIONS_RUNBOOK.md)
2. Update the "Disaster Recovery" section with:
   - **RTO (Recovery Time Objective):** How long to restore from backup (typically 1-4 hours)
   - **RPO (Recovery Point Objective):** Maximum data loss acceptable (typically 24 hours if daily backups)
   - **Contact:** Who to notify if restore needed
3. Save and commit

**Acceptance Criteria:**
- [ ] RTO documented and realistic
- [ ] RPO documented and acceptable for business
- [ ] Escalation contact identified
- [ ] Changes committed to repo

---

## Section 2: Monitoring & Alerting Setup (Est. 1-2 hours)

### Task 2.1: Create Vercel Monitoring Dashboard

**Status:** ⏳ Pending  
**Estimated Time:** 30-45 minutes  

**Steps:**

1. **Log into Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select project: `agency-ops-suite`
   - Go to **Monitoring** tab

2. **Create Error Rate Dashboard:**
   - Click **+ New Chart**
   - Name: "Error Rate (5xx)"
   - Metric: Select "Status Code Distribution" or "5xx Errors"
   - Time range: Last 24 hours
   - Alert threshold: > 5% of requests
   - Save

3. **Create Response Time Dashboard:**
   - Click **+ New Chart**
   - Name: "Response Time (p95)"
   - Metric: Select "Response Time" → p95 percentile
   - Target: < 1000ms
   - Save

4. **Create Deployment Status Chart:**
   - Click **+ New Chart**
   - Name: "Deployment Status"
   - Show: Last 10 deployments
   - Highlight failures
   - Save

5. **Create Auth Failures Chart:**
   - Click **+ New Chart**
   - Name: "Auth Failures (401/403)"
   - Metric: Filter by status codes 401, 403
   - Alert if > 10/minute
   - Save

**Acceptance Criteria:**
- [ ] Error rate chart created and visible
- [ ] Response time chart shows p95 < 1000ms
- [ ] Deployment status tracked
- [ ] Auth failures visible
- [ ] Dashboard URL saved in SUPPORT_CONTACTS.md

**Documentation:**
- Reference: [MONITORING_DASHBOARD_SETUP.md](MONITORING_DASHBOARD_SETUP.md)

---

### Task 2.2: Create Supabase Monitoring Dashboard

**Status:** ⏳ Pending  
**Estimated Time:** 30-45 minutes  

**Steps:**

1. **Log into Supabase:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your production project
   - Go to **Reports** tab

2. **Create Query Performance Dashboard:**
   - View **Database Performance** → **Slow Queries**
   - Look for queries taking > 500ms
   - Document any slow queries in TROUBLESHOOTING_GUIDE.md

3. **Create Connection Pool Dashboard:**
   - Go to **Settings** → **Database** → **Connection Pooling**
   - Verify pool is enabled
   - Check current connection count (should be < max_connections)
   - Set alert if connections approach limit

4. **Create Auth Stats Dashboard:**
   - Go to **Auth** → **Users**
   - Monitor:
     - Total users (should remain stable until first client)
     - Failed login attempts
     - Recent sign-ins
   - Document baseline

5. **Create Activity Log Dashboard:**
   - Go to **Logs** tab
   - Filter for errors and warnings
   - Create saved view for last 24 hours
   - Monitor for patterns

**Acceptance Criteria:**
- [ ] Query performance visible
- [ ] Connection pool monitoring enabled
- [ ] Auth stats tracked
- [ ] Activity logs accessible
- [ ] Slow query list saved for reference

**Documentation:**
- Save dashboard screenshots in docs/ folder as SUPABASE_MONITORING_SCREENSHOTS.md

---

### Task 2.3: Configure Alert Notifications

**Status:** ⏳ Pending  
**Estimated Time:** 15-30 minutes  

**Steps:**

**Vercel Alerts:**
1. Go to Vercel → **Settings** → **Notifications**
2. Add notification email for:
   - Deployment failures
   - 5xx error rate spikes
   - High response time alerts
3. Test: Force a failed deployment, verify email arrives

**Supabase Alerts:**
1. Go to Supabase → **Settings** → **Auth Notifications** (if available)
2. Alternatively, use Vercel function logs to send alerts
3. Document alert contact in SUPPORT_CONTACTS.md

**Slack Integration (Optional but Recommended):**
1. Create a Slack channel: #agency-ops-alerts
2. Connect Vercel and Supabase to send alerts to Slack
3. Test with sample alert

**Acceptance Criteria:**
- [ ] Email alerts configured for both platforms
- [ ] Test alert received and verified
- [ ] Contact information in SUPPORT_CONTACTS.md
- [ ] Alert recipients known to team

---

## Section 3: Security Verification (Est. 1 hour)

### Task 3.1: Verify Row-Level Security (RLS) Policies

**Status:** ⏳ Pending  
**Estimated Time:** 30 minutes  

**Steps:**

1. **Log into Supabase:**
   - Go to Dashboard → Database → your production database
   - Click on **authentication** section

2. **Verify RLS Enabled on All Tables:**
   ```sql
   -- Run this query in Supabase SQL Editor
   SELECT table_name, row_level_security
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```
   Expected result: All tables should show `row_level_security = TRUE`

3. **Verify RLS Policies:**
   - Go to **Database** → each table
   - Check **RLS Policies** tab
   - Confirm policies restrict anon key appropriately
   - Service role key should have full access
   - Document findings in SECURITY.md

4. **Test Policy Enforcement:**
   ```bash
   # Try to query as anon key (should be restricted)
   curl -H "Authorization: Bearer YOUR_ANON_KEY" \
        https://xfasfyuhtelnmsyokygc.supabase.co/rest/v1/clients
   
   # Should return either:
   # - 403 Forbidden, or
   # - Empty result set (0 rows)
   ```

**Acceptance Criteria:**
- [ ] RLS enabled on all tables
- [ ] RLS policies reviewed and documented
- [ ] Anon key is properly restricted
- [ ] Service role key verified to have full access
- [ ] Test query confirms restrictions

**Documentation:**
- Update [SECURITY.md](../SECURITY.md) with RLS verification results

---

### Task 3.2: Verify Secrets Are Not Exposed

**Status:** ⏳ Pending  
**Estimated Time:** 15 minutes  

**Steps:**

1. **Check Git History for Secrets:**
   ```bash
   cd d:\GitHub\Portfolio\ Files\agency-ops-suite
   
   # Search for hardcoded URLs that look suspicious
   git log -p | grep -i "supabase" | head -20
   
   # Check for .env files (should not exist in repo)
   git ls-files | grep -E "\.env"
   
   # Check for secrets in current code
   grep -r "SUPABASE_SERVICE_ROLE_KEY" src/ || echo "✅ No hardcoded service role keys"
   ```

2. **Verify Environment Variables:**
   - [ ] NEXT_PUBLIC_SUPABASE_URL ✅ (public, OK)
   - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY ✅ (public, OK)
   - [ ] SUPABASE_SERVICE_ROLE_KEY ✅ (server-only, never exposed)
   - [ ] INTAKE_WEBHOOK_SECRET ✅ (server-only)
   - [ ] ADMIN_EMAIL_ALLOWLIST ✅ (public, OK)

3. **Check .gitignore:**
   - Verify `.env*` files are ignored
   - Verify `node_modules/` is ignored
   - Verify `.vercel/` is ignored

**Acceptance Criteria:**
- [ ] No hardcoded secrets found in git history
- [ ] No .env files committed
- [ ] Service role key never appears in logs
- [ ] All secrets properly scoped (public vs. server-only)
- [ ] .gitignore prevents future commits

**Documentation:**
- Reference: [SECURITY.md](../SECURITY.md)

---

### Task 3.3: Rotate Credentials (Preventive)

**Status:** ⏳ Pending (Preventive - do after first week of production)  
**Estimated Time:** 30 minutes (do this after 1 week of production operation)

**Steps:**

1. **Generate New Supabase Anon Key:**
   - Go to Supabase Dashboard → **Settings** → **API**
   - Copy the current anon key (save as backup)
   - Click regenerate anon key (or create new project key)
   - Update Vercel environment variables with new key
   - Deploy
   - Verify app still works

2. **Generate New Webhook Secret:**
   - Go to Vercel → Environment Variables
   - Edit INTAKE_WEBHOOK_SECRET
   - Generate random 32-character string (or use `openssl rand -base64 24`)
   - Update in Vercel
   - Deploy
   - Test lead intake endpoint with new secret

3. **Generate New Admin Allowlist Secret (if used):**
   - Generate random 32-character string
   - Update in Vercel
   - Redeploy
   - Test admin routes with new header value

**Acceptance Criteria:**
- [ ] Credential rotation procedure documented
- [ ] Old credentials saved in secure location
- [ ] New credentials tested before deleting old ones
- [ ] Rollback plan documented (keep old credentials for 7 days)

**Documentation:**
- Update [SECURITY.md](../SECURITY.md) with rotation schedule (monthly recommended)

---

## Section 4: User Acceptance Testing (Est. 1-2 hours)

### Task 4.1: Smoke Tests — Verify Production Environment

**Status:** ⏳ Pending  
**Estimated Time:** 30 minutes  

**Steps:**

1. **Access Production URL:**
   - Open https://agency-ops-suite.vercel.app
   - [ ] Page loads without errors
   - [ ] No 404s or 500s

2. **Test Login Flow:**
   - [ ] Login page appears
   - [ ] Can enter admin email (jumpstarthost@gmail.com)
   - [ ] Can enter password
   - [ ] Login succeeds and redirects to dashboard
   - [ ] Session persists across page reload

3. **Test Lead Intake (Public Endpoint):**
   - [ ] POST /api/intake/lead with valid webhook secret
   - [ ] Returns 201 Created
   - [ ] Lead appears in dashboard or database

4. **Test Admin Routes:**
   - [ ] Can access /admin/clients
   - [ ] Can access /admin/billing
   - [ ] Can access /admin/audit-logs
   - [ ] Can download/view reports

5. **Test Health Endpoint:**
   - [ ] GET /api/health returns 200 OK
   - [ ] Response includes uptime and version

6. **Review Audit Logs:**
   - [ ] Login events are logged
   - [ ] All admin actions are logged
   - [ ] Timestamps are correct (UTC)

**Acceptance Criteria:**
- [ ] All smoke tests pass
- [ ] No errors in browser console
- [ ] No 500 errors in Vercel logs
- [ ] Audit logs show all actions
- [ ] Performance acceptable (page load < 3s)

---

### Task 4.2: Test Cascading Delete Logic

**Status:** ⏳ Pending  
**Estimated Time:** 30 minutes  

**Steps:**

1. **Create Test Data (if not already present):**
   - [ ] Create test client via dashboard
   - [ ] Assign billing records to test client
   - [ ] Create requests/provisioning runs linked to client

2. **Test Cascade Delete:**
   - [ ] Delete test client from dashboard
   - [ ] Verify associated billing records are deleted
   - [ ] Verify requests are deleted
   - [ ] Verify provisioning_runs are set to NULL (preserved)
   - [ ] Check audit_logs still contains deletion record

3. **Verify Data Integrity:**
   - [ ] Query database confirms deletions
   - [ ] No orphaned records left behind
   - [ ] Cascade was atomic (all or nothing)

**Acceptance Criteria:**
- [ ] Cascading deletes work correctly
- [ ] Data integrity maintained
- [ ] Audit trail preserved
- [ ] No data corruption
- [ ] Null cascades (provisioning_runs) work as expected

**Documentation:**
- Reference: [FK_DELETE_MATRIX.md](FK_DELETE_MATRIX.md)

---

### Task 4.3: Test Session Lifecycle & Auth Expiry

**Status:** ⏳ Pending  
**Estimated Time:** 30 minutes  

**Steps:**

1. **Login to Dashboard:**
   - [ ] Login succeeds
   - [ ] Dashboard loads
   - [ ] User email displayed in sidebar

2. **Wait for Token Refresh (5 minutes):**
   - [ ] Monitor network tab in browser DevTools
   - [ ] Observe token refresh request at 5-minute mark
   - [ ] Verify new token received
   - [ ] Session remains active

3. **Test Session Expiry (after ~10 minutes of inactivity):**
   - [ ] Close all tabs/windows
   - [ ] Wait 15 minutes
   - [ ] Reopen dashboard
   - [ ] Should redirect to login (session expired)

4. **Test Sign Out:**
   - [ ] Click Sign Out button
   - [ ] Redirects to /login
   - [ ] Cannot access protected routes
   - [ ] Must login again to access dashboard

**Acceptance Criteria:**
- [ ] Token refresh works every 5 minutes
- [ ] Session persists while active
- [ ] Session expires after 10+ minutes of inactivity
- [ ] Sign out clears session
- [ ] Auth redirect works correctly
- [ ] No console errors during lifecycle

---

## Section 5: Final Go/No-Go Checklist

### Sign-Off Table

Complete this table before accepting first client:

| Component | Status | Verified By | Date |
|-----------|--------|-------------|------|
| Authentication | 🔵 Ready | ___________ | _____ |
| Data Integrity | 🔵 Ready | ___________ | _____ |
| Lead Intake | 🔵 Ready | ___________ | _____ |
| Dashboard | 🔵 Ready | ___________ | _____ |
| Health Endpoint | 🔵 Ready | ___________ | _____ |
| **Backup & Restore** | ⏳ **PENDING** | ___________ | _____ |
| **Monitoring Setup** | ⏳ **PENDING** | ___________ | _____ |
| **Security Audit** | ⏳ **PENDING** | ___________ | _____ |
| **UAT Sign-Off** | ⏳ **PENDING** | ___________ | _____ |
| **OVERALL** | **🟡 ON TRACK** | | |

---

### Final Sign-Off

**I confirm that all above tasks are complete and the system is ready for first client onboarding:**

- [ ] All checklist items completed
- [ ] All tests passing (20/20 production smoke tests)
- [ ] No critical issues or blockers
- [ ] Backup and restore verified
- [ ] Monitoring dashboards configured
- [ ] Security audit completed
- [ ] Team trained on operational procedures

**Authorized By:**

- **Product/Project Owner:** _________________ Date: _______
- **Tech Lead/DevOps:** _________________ Date: _______
- **QA Lead:** _________________ Date: _______

---

## Emergency Contacts

See [SUPPORT_CONTACTS.md](SUPPORT_CONTACTS.md) for escalation procedures and contact information.

---

## Related Documentation

- [CURRENT_PLAN.md](CURRENT_PLAN.md) — Overall roadmap
- [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md) — Detailed technical checklist
- [PRODUCTION_OPERATIONS_RUNBOOK.md](PRODUCTION_OPERATIONS_RUNBOOK.md) — Deploy/rollback/restore procedures
- [MONITORING_DASHBOARD_SETUP.md](MONITORING_DASHBOARD_SETUP.md) — Monitoring platform setup
- [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) — Common errors and solutions
- [SECURITY.md](../SECURITY.md) — Security policies and procedures
- [BACKUP_SYSTEM_GUIDE.md](BACKUP_SYSTEM_GUIDE.md) — Backup procedures
- [RESTORE_RUNBOOK.md](RESTORE_RUNBOOK.md) — Restore procedures
- [AUTOMATED_RESTORE.md](AUTOMATED_RESTORE.md) — Automated restore script

---

**Last Updated:** May 13, 2026  
**Next Review:** May 20, 2026 (after first client onboarding)
