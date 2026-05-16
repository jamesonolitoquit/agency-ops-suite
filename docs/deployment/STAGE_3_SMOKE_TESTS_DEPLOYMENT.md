# Staging Deployment - Stage 3: Smoke Tests

**Workflow**: ship-production-release.md (Staging Phase)  
**Current Stage**: Stage 3 - Smoke Tests  
**Status**: ⏳ WAITING FOR VERCEL DEPLOYMENT  
**Date**: May 13, 2026  

---

## ✅ Stage 1 & 2 Complete

### Stage 1: Build
- ✅ Feature tests: 14/14 passing
- ✅ Build succeeded: 18 seconds total
- ✅ Artifacts present in .next directory
- ✅ Gate: **PASSED** → Proceed to Stage 2

### Stage 2: Deploy to Staging
- ✅ Staging branch prepared
- ✅ Validation scripts committed
- ✅ Documentation committed
- ✅ Pushed to GitHub (commit: bf38b2f)
- ✅ Vercel auto-deploy triggered
- ✅ Gate: **PASSED** → Proceed to Stage 3

---

## 📊 Deployment Status

**Staging URL**: Vercel is now building...
- Monitor at: https://vercel.com/dashboard
- Expected build time: 3-5 minutes
- Auto-deploy enabled on staging branch push ✅

**Build Status**: 🔄 **IN PROGRESS**
- Commit: bf38b2fc7428fb359b0e77ba10b072276d653a4c
- Branch: agency-ops-suite/staging
- Trigger: Auto-deploy on push

---

## 🚀 What Happens Next

### Automatic (Vercel):
1. Build Next.js application
2. Run TypeScript compilation
3. Generate static assets
4. Deploy to Vercel staging environment
5. Assign staging URL

### Manual (After Deployment Complete):
1. Note the staging URL
2. Configure secrets in Vercel (if not already done)
3. Run Stage 3: Smoke Tests

---

## ⏳ Stage 3 Procedure (When Ready)

Once Vercel deployment completes (check dashboard), execute:

```bash
# First, verify the deployment is live
$stagingUrl = "https://YOUR_STAGING_URL.vercel.app"  # Replace with actual URL
curl -s "$stagingUrl" -o /dev/null -w "%{http_code}\n"
# Expected: 200

# Then run automated smoke tests
cd "d:\GitHub\Portfolio Files\agency-ops-suite"
node scripts/staging_validation.js "$stagingUrl"
```

**Expected Output**:
```
Phase 1: Basic Connectivity
✅ Home page loads
✅ Login page accessible
✅ Health endpoint accessible
✅ API routes exist

Phase 2: Authentication
✅ Protected routes require auth
✅ Dashboard redirects to login
✅ System health requires auth

Phase 3: Lead Intake
✅ Lead intake endpoint exists
✅ Webhook secret validation
✅ Create test lead with valid secret

Phase 4: Audit Generation
✅ Audit page loads
✅ Audit creation page loads
✅ Audit API endpoint exists

Phase 5: Contracts & Invoices
✅ Contract creation page loads
✅ Proposal page loads
✅ Billing page loads
✅ Invoice API exists

Phase 6: Admin & Logging
✅ Audit logs page accessible
✅ Deployment checklist page exists
✅ Reports page exists

Test Results Summary
✅ Passed: 24+
❌ Failed: 0
⏭️  Skipped: 0
```

### If Tests Fail:
Check Stage 3 Troubleshooting section below.

---

## 📋 Stage 3 Critical User Flows

After automated tests pass, manually verify:

### Flow 1: Login to Dashboard
```
1. Go to staging URL
2. Try wrong email → error shown
3. Use allowlisted email with correct password
4. Dashboard should load without 500 errors
5. Verify no console errors
```

### Flow 2: Lead Intake
```
1. Get INTAKE_WEBHOOK_SECRET from Vercel env vars
2. Run:
   curl -X POST https://[staging-url]/api/intake/lead \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Secret: [YOUR_SECRET]" \
     -d '{
       "email": "test-staging@example.com",
       "company": "Staging Test Corp",
       "phone": "555-1234",
       "projectDescription": "Staging validation"
     }'
3. Verify response includes lead ID
4. Check /leads dashboard - new lead should appear
```

### Flow 3: Create Contract
```
1. Login with test admin account
2. Go to /contract/new
3. Fill form, submit
4. Verify contract created (no 500 errors)
5. Check contract appears in dashboard
```

---

## 🔧 Environment Variables (Verify in Vercel)

Confirm these are set in Vercel Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://YOUR_STAGING_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = YOUR_STAGING_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY = sb_secret_YOUR_STAGING_KEY
INTAKE_WEBHOOK_SECRET = YOUR_STAGING_SECRET
ADMIN_EMAIL_ALLOWLIST = test-admin@example.com
```

**Note**: DO NOT use production credentials or keys.

---

## 🔍 Stage 3 Success Criteria

✅ **PASS if:**
- Automated tests: 24+ tests passing
- No 500 errors in responses
- Login flow working
- Lead intake creating records
- Response times < 2 seconds
- No timeouts on API calls
- Error tracking capturing issues

❌ **FAIL if:**
- Any automated test fails
- Home page returns 500
- Login returns 500
- Lead intake returns error
- Database not connected
- Response times > 5 seconds

---

## 🚨 Stage 3 Troubleshooting

### Issue: Tests show "Connection Refused"
**Cause**: Staging URL still building or deployment failed  
**Solution**:
1. Check Vercel dashboard for build status
2. Review build logs for errors
3. Fix any build issues, re-push to staging
4. Wait for new deployment to complete

### Issue: 401 "Unauthorized" on API calls
**Cause**: Supabase credentials not configured in Vercel  
**Solution**:
1. Go to Vercel Project Settings
2. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Add SUPABASE_SERVICE_ROLE_KEY
4. Redeploy (trigger: Re-run build)
5. Retry tests

### Issue: 404 "Not Found"
**Cause**: Routes not deployed or build failed  
**Solution**:
1. Check Vercel build logs
2. Run local build: `npm run build` in admin-dashboard
3. Fix any TypeScript errors
4. Commit, push, re-deploy

### Issue: Response times very slow (10+ seconds)
**Cause**: Supabase throttling or database issue  
**Solution**:
1. Check Supabase project status
2. Review database query performance
3. Check for N+1 queries in API
4. Review Vercel function logs

---

## ✋ Manual Gate: Stage 3 Sign-Off

Before proceeding to Stage 4 (Staging Gate), verify:

- [ ] Vercel deployment completed (check dashboard)
- [ ] Staging URL accessible and 200 OK
- [ ] Automated smoke tests: 24+ passing
- [ ] Login flow working
- [ ] Lead intake working
- [ ] No critical errors in logs
- [ ] Response times acceptable
- [ ] All manual flows successful

**When all items ✅**: Ready for Stage 4

---

## 📊 Metrics to Track

During smoke testing:

**Performance**:
- [ ] Home page: < 500ms
- [ ] Login: < 300ms
- [ ] API endpoints: < 1000ms
- [ ] Lead intake: < 2000ms

**Errors**:
- [ ] 500 errors: 0
- [ ] Timeouts: 0
- [ ] Connection failures: 0

**Functionality**:
- [ ] All routes responding
- [ ] Authentication enforced
- [ ] Database operations working
- [ ] Error tracking active

---

## 🎯 Next Step After Stage 3 Pass

Once all Stage 3 criteria met:

→ Proceed to **Stage 4: Staging Gate**

This stage verifies:
- [ ] All smoke tests passing
- [ ] No critical issues found
- [ ] Database integrity confirmed
- [ ] Monitoring and alerting working
- [ ] Rollback procedure tested
- [ ] Production readiness review complete

→ Then proceed to **Production Deployment** workflow

---

## 📞 To Resume Testing

**When Vercel deployment completes:**

1. Note the staging URL (from Vercel dashboard)
2. Run this command:
   ```bash
   cd "d:\GitHub\Portfolio Files\agency-ops-suite"
   $stagingUrl = "https://your-staging-url.vercel.app"
   node scripts/staging_validation.js $stagingUrl
   ```

3. Monitor output for pass/fail status
4. Execute manual flows if automated tests pass
5. Document results

---

## 📈 Deployment Timeline

```
NOW ✅ Stage 1: Build Complete
↓
✅ Stage 2: Deployed to Staging (commit pushed)
↓
⏳ Stage 3: Smoke Tests (WAITING FOR VERCEL)
   Expected: 3-5 minutes from now
↓
⏳ Stage 4: Staging Gate Review
↓
⏳ Production Deployment
```

**Estimated Completion**: 30-45 minutes from now (after Vercel builds)

---

## 🔗 Resources

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Console**: https://app.supabase.com
- **Staging Validation Script**: scripts/staging_validation.js
- **Execution Guide**: docs/STAGING_DEPLOYMENT_EXECUTION_GUIDE.md
- **Full Validation Checklist**: docs/STAGING_VALIDATION_CHECKLIST.md

---

## Status Summary

| Component | Status |
|-----------|--------|
| Local Build | ✅ PASS |
| Test Suite | ✅ PASS (14/14) |
| Git Commit | ✅ DONE |
| GitHub Push | ✅ DONE |
| Vercel Deploy | 🔄 IN PROGRESS |
| Smoke Tests | ⏳ WAITING |
| Gate Review | ⏳ PENDING |
| Production Ready | ⏳ NEXT |

---

## 🚀 You Are Here

```
[Build] ✅ → [Push] ✅ → [Staging Deploy] 🔄 → [Smoke Tests] ⏳ → [Gate] → [Prod]
```

---

**Workflow Status**: PROCEEDING AS EXPECTED  
**Next Action**: Wait for Vercel deployment, then run smoke tests  
**Help**: Refer to troubleshooting section if issues arise

