# STAGING DEPLOYMENT LOG — Agency Ops Suite

## Deployment Metadata

| Field | Value |
|---|---|
| **Deployment Date** | TBD (Phase H) |
| **Deployer** | TBD |
| **Environment** | Staging (Supabase + Vercel) |
| **Previous Env** | Local development (npm run dev) |
| **Target URL** | TBD (Vercel staging slot) |
| **Deployment Duration** | TBD |
| **Status** | ⏳ Pending |

---

## Pre-Deployment Checklist

### Infrastructure Requirements

- [ ] Supabase staging project provisioned
- [ ] Staging project has unique PostgreSQL instance
- [ ] Staging database separate from production
- [ ] Vercel staging deployment created
- [ ] Vercel environment variables configured
- [ ] GitHub Actions staging workflow ready
- [ ] Staging domain/URL assigned
- [ ] SSL certificate provisioned

### Schema & Database

- [ ] schema.sql executed in staging
- [ ] Migrations applied
- [ ] RLS policies enabled
- [ ] rls_hardening.sql applied
- [ ] All tables created with correct FKs
- [ ] Indexes created
- [ ] Audit tables ready
- [ ] system_events table ready

### Application Configuration

- [ ] Environment variables set in Vercel staging
- [ ] NEXT_PUBLIC_SUPABASE_URL configured
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY configured
- [ ] SUPABASE_SERVICE_ROLE_KEY configured (for logging)
- [ ] INTAKE_WEBHOOK_SECRET configured
- [ ] JWT_SECRET configured
- [ ] Session timeout configured (1 hour default)
- [ ] CORS configured for staging domain

### Auth & Security

- [ ] Supabase Auth enabled
- [ ] Auth settings (session duration, refresh interval)
- [ ] Admin user created in staging
- [ ] Test user created for smoke tests
- [ ] SMTP configured for password resets
- [ ] RLS enforcement verified
- [ ] Service role key secured in Vercel
- [ ] Anon key secured in Vercel

### Testing Ready

- [ ] Staging smoke tests ready
- [ ] test-delete-behavior.js configured for staging
- [ ] test-auth-enforcement.js ready
- [ ] test-duplicate-detection.js ready
- [ ] Database health checks ready
- [ ] Auth flow validation ready
- [ ] API endpoints testable
- [ ] Intake lead webhook testable

---

## Deployment Steps

### Step 1: Supabase Staging Project Setup

**Date/Time:** TBD  
**Duration Estimate:** 15 minutes  
**Status:** ⏳ Pending

**Actions:**
1. Create new Supabase project (staging environment)
2. Note project URL and keys:
   - **URL:** TBD
   - **ANON_KEY:** TBD
   - **SERVICE_ROLE_KEY:** TBD
   - **JWT_SECRET:** TBD (for sign/verify)
3. Configure Auth settings:
   - Session duration: 1 hour
   - Auto-refresh enabled
   - Password reset email template configured
4. Create admin user for testing

**Completion Checklist:**
- [ ] Project created in Supabase dashboard
- [ ] API keys secured
- [ ] Auth configured
- [ ] Admin user credentials stored securely

**Notes:**
---

### Step 2: Database Schema Deployment

**Date/Time:** TBD  
**Duration Estimate:** 10 minutes  
**Status:** ⏳ Pending

**Actions:**
1. Open Supabase SQL Editor
2. Paste and run `supabase/schema.sql`
3. Verify all tables created:
   - clients, billing, leads, requests
   - provisioning_runs, report_runs
   - audit_logs, system_events
4. Run `supabase/rls_hardening.sql`
5. Verify RLS policies applied

**Completion Checklist:**
- [ ] schema.sql executed without errors
- [ ] All tables present (SELECT COUNT(*) FROM information_schema.tables)
- [ ] rls_hardening.sql executed
- [ ] RLS enabled on all tables
- [ ] Foreign key constraints in place

**Notes:**
---

### Step 3: Vercel Staging Deployment

**Date/Time:** TBD  
**Duration Estimate:** 20 minutes  
**Status:** ⏳ Pending

**Actions:**
1. Create new Vercel project (or deployment from GitHub)
2. Select staging branch/environment
3. Configure environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[staging-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
   INTAKE_WEBHOOK_SECRET=[generated-webhook-secret]
   JWT_SECRET=[jwt-secret]
   ```
4. Configure project settings:
   - Node.js version: 20.x or 22.x
   - Build command: `npm run build`
   - Start command: `npm run start` (or next built-in)
5. Deploy
6. Note staging URL: TBD

**Completion Checklist:**
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Build successful
- [ ] Deployment successful
- [ ] Staging URL accessible
- [ ] Root URL returns 307 redirect to /login

**Deployment URL:** TBD

**Notes:**
---

### Step 4: DNS & SSL Configuration

**Date/Time:** TBD  
**Duration Estimate:** 5 minutes  
**Status:** ⏳ Pending

**Actions:**
1. (If using custom domain) Update DNS to point to Vercel
2. Verify SSL certificate auto-provisioned
3. Test HTTPS access

**Completion Checklist:**
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate active
- [ ] HTTPS works
- [ ] HTTP redirects to HTTPS

**Staging Domain:** TBD

**Notes:**
---

### Step 5: Initial Connectivity Verification

**Date/Time:** TBD  
**Duration Estimate:** 5 minutes  
**Status:** ⏳ Pending

**Actions:**
1. Access staging URL in browser
2. Should redirect to /login (unauthenticated)
3. Verify login page renders
4. Check browser network tab:
   - Supabase endpoints reachable
   - No CORS errors
   - No auth errors

**Completion Checklist:**
- [ ] Staging URL accessible
- [ ] Login page renders
- [ ] No console errors
- [ ] Supabase API responding
- [ ] Database connection working

**Notes:**
---

## Smoke Test Execution

### Test Suite 1: Local Smoke Tests

**Date/Time:** TBD  
**Duration Estimate:** 10 minutes  
**Status:** ⏳ Pending

**Setup:**
```bash
cd apps/admin-dashboard
export API_BASE_URL=https://[staging-url]
export INTAKE_WEBHOOK_SECRET=[webhook-secret]
npm run test:staging-smoke
```

**Expected Results:**
```
✔ staging login page is reachable
✔ staging root is protected
✔ staging report export endpoint responds safely
✔ staging lead intake rejects missing shared secret
✔ staging lead intake rejects invalid shared secret
✔ staging lead intake rejects malformed JSON payload
✔ staging live intake creates lead and audit row (NEW - was skipped)

Results: 7 pass, 0 fail, 0 skip
Duration: < 15 seconds
```

**Completion Checklist:**
- [ ] All 7 smoke tests passing
- [ ] No timeouts
- [ ] No CORS errors
- [ ] Lead intake working
- [ ] Audit logs created

**Notes:**
---

### Test Suite 2: Authentication Tests

**Date/Time:** TBD  
**Duration Estimate:** 15 minutes  
**Status:** ⏳ Pending

**Setup:**
```bash
export API_BASE_URL=https://[staging-url]
export AUTH_TOKEN=<admin-token-from-staging>
npm run test:auth-enforcement
```

**Tests:**
1. Create test client (POST)
2. List clients (GET)
3. Get specific client (GET with ID)
4. Update client (PATCH)
5. Delete client (DELETE)
6. Verify 401 without token
7. Verify 403 with invalid token

**Expected Results:**
```
✔ All endpoints protected
✔ 7/7 tests passing
✔ No unauthorized access
✔ Auth headers validated
```

**Completion Checklist:**
- [ ] All auth tests passing
- [ ] Unauthorized requests rejected
- [ ] Valid tokens accepted
- [ ] Audit logs created for all operations

**Notes:**
---

### Test Suite 3: Data Integrity Tests

**Date/Time:** TBD  
**Duration Estimate:** 20 minutes  
**Status:** ⏳ Pending

**Setup:**
```bash
export API_BASE_URL=https://[staging-url]
export AUTH_TOKEN=<admin-token-from-staging>
node test-delete-behavior.js
```

**Tests:**
1. Create client
2. Create billing record
3. Create request record
4. Create provisioning_run (NEW - Phase E)
5. Delete client
6. Verify CASCADE deletion of billing, requests
7. Verify SET NULL on provisioning_runs (NEW - Phase E)
8. Verify audit logs preserved

**Expected Results:**
```
✔ TEST 1: Create client - PASS
✔ TEST 2: Create billing - PASS
✔ TEST 3: Create request - PASS
✔ TEST 3.5: Create provisioning_run - PASS
✔ TEST 4: Query audit logs before - PASS
✔ TEST 5: Verify client exists - PASS
✔ TEST 6: Delete client - PASS
✔ TEST 7: Verify client deleted - PASS
✔ TEST 8: Billing CASCADE deleted - PASS
✔ TEST 9: Request CASCADE deleted - PASS
✔ TEST 10: Audit logs preserved - PASS
✔ TEST 11: Provisioning_runs SET NULL - PASS

RESULTS: 11 passed, 0 failed
PHASE E COMPLETE: All FK delete behaviors verified
```

**Completion Checklist:**
- [ ] All 11 tests passing
- [ ] CASCADE deletion verified
- [ ] SET NULL behavior verified (NEW)
- [ ] Audit logs preserved
- [ ] No orphaned records
- [ ] System events logged (if implemented)

**Notes:**
---

### Test Suite 4: Duplicate Detection Tests

**Date/Time:** TBD  
**Duration Estimate:** 10 minutes  
**Status:** ⏳ Pending

**Setup:**
```bash
export API_BASE_URL=https://[staging-url]
npm run test:duplicate-detection
```

**Tests:**
1. Create client with email
2. Attempt duplicate with same email (case-insensitive)
3. Verify duplicate detected
4. Verify single record created
5. Create lead with duplicate detection

**Expected Results:**
```
✔ Duplicate detection working
✔ 4/4 tests passing
✔ No duplicate records created
✔ Case-insensitive matching working
```

**Completion Checklist:**
- [ ] All duplicate tests passing
- [ ] Email normalization working
- [ ] No duplicate records created

**Notes:**
---

## Operational Lifecycle Tests

### Test Scenario 1: Lead to Client Workflow

**Date/Time:** TBD  
**Duration Estimate:** 30 minutes  
**Status:** ⏳ Pending

**Steps:**
1. Intake lead via webhook: POST /api/intake/lead
   ```json
   {
     "name": "Staging Test Business",
     "businessType": "consulting",
     "email": "staging@example.com",
     "source": "google",
     "sharedSecret": "[INTAKE_WEBHOOK_SECRET]"
   }
   ```
2. Verify lead created in leads table
3. Convert lead to client: POST /api/admin/clients
4. Verify client created
5. Verify audit_logs have entry for both
6. Verify system_events have entry (if Phase G logging implemented)

**Expected Outcomes:**
- [ ] Lead created successfully
- [ ] Lead appears in dashboard
- [ ] Lead converted to client
- [ ] Client appears in clients table
- [ ] Audit trail shows both events
- [ ] No errors

**Notes:**
---

### Test Scenario 2: Client Provisioning Workflow

**Date/Time:** TBD  
**Duration Estimate:** 30 minutes  
**Status:** ⏳ Pending

**Steps:**
1. Create client (from Test Scenario 1)
2. Create provisioning_run: POST /api/admin/provisioning
   ```json
   {
     "clientId": "<client-uuid>",
     "templateType": "nextjs_landing",
     "domain": "staging-test.example.com",
     "status": "pending"
   }
   ```
3. Verify provisioning_run created
4. Update provisioning status: PATCH /api/admin/provisioning
   ```json
   {
     "id": "<run-uuid>",
     "status": "success",
     "output_path": "s3://bucket/output"
   }
   ```
5. Verify status updated and completed_at set
6. Query provisioning history for client

**Expected Outcomes:**
- [ ] Provisioning run created
- [ ] Status updates working
- [ ] Completed_at timestamp set
- [ ] History queryable
- [ ] Audit logs show all operations

**Notes:**
---

### Test Scenario 3: Billing & Invoicing Workflow

**Date/Time:** TBD  
**Duration Estimate:** 20 minutes  
**Status:** ⏳ Pending

**Steps:**
1. Create client
2. Create billing record: POST /api/admin/billing
   ```json
   {
     "clientId": "<client-uuid>",
     "amount": 299.99,
     "dueDate": "2025-02-15",
     "paymentMethod": "bank",
     "notes": "Monthly invoice"
   }
   ```
3. Mark as paid: PATCH /api/admin/billing
4. Query billing history
5. Export report: GET /api/admin/reports?clientId=...

**Expected Outcomes:**
- [ ] Billing record created
- [ ] Payment status update working
- [ ] Billing history queryable
- [ ] Reports exportable
- [ ] No data loss

**Notes:**
---

### Test Scenario 4: Auth Session Lifecycle

**Date/Time:** TBD  
**Duration Estimate:** 15 minutes  
**Status:** ⏳ Pending

**Steps:**
1. Login as admin user
2. Navigate dashboard - verify loaded
3. Open dev tools - inspect session storage
4. Wait 5+ minutes - app should auto-refresh token (if Phase G implemented)
5. Verify still authenticated (check network for auth API calls)
6. Logout and verify redirect to login
7. Attempt to access dashboard without auth - should redirect

**Expected Outcomes:**
- [ ] Login successful
- [ ] Dashboard accessible
- [ ] Session maintained
- [ ] Token refresh working (if implemented)
- [ ] Logout working
- [ ] Protected routes enforced
- [ ] No auth errors in console

**Notes:**
---

### Test Scenario 5: Error Handling & Recovery

**Date/Time:** TBD  
**Duration Estimate:** 20 minutes  
**Status:** ⏳ Pending

**Steps:**
1. Database connection loss simulation (if possible in staging)
   - Observe error handling
   - Check system_events for error logging
2. Invalid input tests
   - POST client without required field → 400
   - POST with invalid JSON → 400
   - Verify audit logs NOT created for invalid requests
3. Authorization failures
   - Access endpoint without token → 401
   - Access endpoint with invalid token → 401
   - Verify logged to system_events as warning
4. Cascade deletion edge case
   - Create client → billing → request → provisioning
   - Delete client
   - Verify all related records handled correctly

**Expected Outcomes:**
- [ ] Errors handled gracefully
- [ ] User-friendly error messages
- [ ] Errors logged appropriately
- [ ] No unhandled exceptions
- [ ] Cascade deletion works as documented
- [ ] SET NULL behavior verified

**Notes:**
---

## System Events Monitoring (Phase G)

### Query Staging System Events

```sql
-- Last 24 hours of all events
SELECT event_type, severity, count(*) as count
FROM system_events
WHERE timestamp > now() - interval '24 hours'
GROUP BY event_type, severity
ORDER BY timestamp DESC;

-- Auth events
SELECT event_type, metadata->>'email', count(*) FROM system_events
WHERE event_type LIKE 'auth_%'
GROUP BY event_type, metadata->>'email';

-- API errors
SELECT metadata->>'endpoint' as endpoint, count(*) as error_count
FROM system_events
WHERE event_type = 'api_error_error'
GROUP BY endpoint
ORDER BY error_count DESC;

-- Request tracing (for debugging)
SELECT event_type, summary, timestamp
FROM system_events
WHERE metadata->>'requestId' = '[request-id]'
ORDER BY timestamp ASC;
```

**Status:** ⏳ Pending Phase G implementation verification

---

## Handoff Checklist

### Before Promoting to Production

- [ ] All smoke tests passing (7/7)
- [ ] All auth tests passing (7/7)
- [ ] All integrity tests passing (11/11)
- [ ] All duplicate detection tests passing (4/4)
- [ ] Lifecycle tests completed successfully (5/5 scenarios)
- [ ] No errors in system_events (or only expected warnings)
- [ ] No security issues found
- [ ] Performance acceptable (pages load < 2s)
- [ ] Backup strategy verified
- [ ] Rollback procedure documented

### Production Environment Ready When

- [✔] Phase E: FK + DELETE verification complete (all 11/11 tests passing)
- [✔] Phase F: Dashboard auth complete (provider, context, logging)
- [✔] Phase G: Monitoring complete (request IDs, system events, logging)
- [ ] Phase H: Staging deployment successful (all tests passing)
- [ ] Phase I: Production readiness checklist complete

---

## Deployment Rollback Plan

### If Staging Tests Fail

1. Identify failing test and root cause
2. Log issue with reproducible steps
3. Determine if infrastructure issue or code issue:
   - Infrastructure: Contact Supabase/Vercel support
   - Code: Fix in feature branch, re-deploy
4. Re-run affected test suite
5. Document resolution

### If Production Must Be Rolled Back

1. Revert Vercel deployment to previous version
2. Roll back Supabase schema if needed (manual SQL)
3. Verify rollback successful
4. Investigate root cause
5. Fix in staging first
6. Re-deploy to production

---

## Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Developer | TBD | TBD | TBD |
| QA/Tester | TBD | TBD | TBD |
| Project Lead | TBD | TBD | TBD |

---

## Summary

**Deployment Status:** ⏳ Pending Phase H execution

**Estimated Timeline:**
- Step 1-2 (Supabase): 30 minutes
- Step 3-4 (Vercel): 30 minutes
- Step 5 (Verification): 5 minutes
- Smoke Tests: 40 minutes
- Full Test Scenarios: 2 hours
- **Total: ~3-4 hours**

**Success Criteria:**
- ✅ All 29+ tests passing
- ✅ Lifecycle scenarios validated
- ✅ No production secrets leaked
- ✅ Audit logs operational
- ✅ System events logging (if Phase G implemented)
- ✅ Ready for first real client onboarding

---

**Next Phase:** Phase I — Production Readiness Validation
