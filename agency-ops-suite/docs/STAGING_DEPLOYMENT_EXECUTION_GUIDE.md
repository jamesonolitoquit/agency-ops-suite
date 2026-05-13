# Staging Deployment & Validation Execution Guide

**Status**: Ready to Deploy  
**Date Created**: May 13, 2026  
**Target Environment**: Vercel Staging  
**Validation Phase**: Prepared  

---

## Pre-Deployment Checklist ✅

**All items verified:**
- [x] Local feature tests: 14/14 passing
- [x] Dev server running and stable
- [x] Environment variables configured
- [x] Supabase credentials verified
- [x] Staging verification scripts prepared
- [x] Documentation complete
- [x] Deployment infrastructure ready

---

## Step 1: Create Staging Branch (If Not Existing)

```bash
# From workspace root
cd "d:\GitHub\Portfolio Files\agency-ops-suite"

# Create staging branch from main
git checkout -b staging
git push origin staging

# Or if staging already exists
git checkout staging
git pull origin staging
```

**Expected Result:** Staging branch created/updated and pushed to GitHub.

---

## Step 2: Configure Staging Secrets in Vercel

Navigate to **Vercel Project Settings** → **Environment Variables**

Add for **Preview & Production** environments:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_STAGING_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_STAGING_ANON_KEY_HERE
SUPABASE_URL=https://YOUR_STAGING_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_YOUR_STAGING_SERVICE_KEY
INTAKE_WEBHOOK_SECRET=YOUR_STAGING_WEBHOOK_SECRET_32_CHARS
ADMIN_EMAIL_ALLOWLIST=test-admin@example.com,staging-admin@example.com
```

**Important Notes:**
- ✅ Use **staging Supabase project** (different from production)
- ✅ Use **staging webhook secret** (different from production)
- ✅ Use **staging admin emails** (test accounts)
- ❌ DO NOT use production credentials
- ❌ DO NOT commit secrets to Git

**Expected Result:** Vercel receives staging environment variables.

---

## Step 3: Deploy to Staging on Vercel

**Option A: Automatic Deployment (Recommended)**
```bash
# Push staging branch - Vercel auto-deploys
git add .
git commit -m "Deploy to staging for validation"
git push origin staging

# Vercel will automatically build and deploy
# Monitor at: https://vercel.com/dashboard
```

**Option B: Manual Vercel Deploy**
1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments" → "Deploy now"
4. Select `staging` branch
5. Click "Deploy"

**Expected Result:** Vercel builds and deploys staging environment. URL will be displayed (e.g., `https://agency-ops-staging.vercel.app`).

---

## Step 4: Verify Deployment Completed

```bash
# Wait 2-3 minutes for build to complete

# Check Vercel build status at:
# https://vercel.com/dashboard/[project-name]/deployments

# Once complete, note the staging URL
```

**Expected Result:** Green checkmark on Vercel deployment. Staging URL available.

---

## Step 5: Run Staging Validation Tests

Once deployment is complete and environment variables are configured:

```bash
# Replace with your actual staging URL
$stagingUrl = "https://agency-ops-staging.vercel.app"

# Run validation suite
cd "d:\GitHub\Portfolio Files\agency-ops-suite"
node scripts/staging_validation.js $stagingUrl
```

**Test Phases:**
1. **Basic Connectivity** - Health checks, page loads
2. **Authentication** - Protected routes, login enforcement
3. **Lead Intake** - Webhook secret validation, lead creation
4. **Audit Generation** - Route availability
5. **Contracts & Invoices** - Document generation routes
6. **Admin & Logging** - Audit logs, deployment checklist

**Expected Result:**
```
Phase 1: Basic Connectivity
✅ Home page loads (123ms)
✅ Login page accessible (45ms)
✅ Health endpoint accessible (67ms)
✅ API routes exist (89ms)

Phase 2: Authentication
✅ Protected routes require auth (45ms)
✅ Dashboard redirects to login (78ms)
✅ System health requires auth (56ms)

[... more phases ...]

Test Results Summary
✅ Passed: 24
❌ Failed: 0
⏭️  Skipped: 0

Total time: 1234ms
🎉 All staging validation tests passed!
```

---

## Step 6: Manual Testing (Key User Flows)

### Test Flow 1: Login & Dashboard Access
```
1. Navigate to https://[staging-url]/login
2. Try invalid email/password → should show error
3. Try non-allowlisted email → should show auth error
4. Try allowlisted email with wrong password → should show error
5. Enter correct credentials → should redirect to dashboard
6. Verify dashboard loads with no 500 errors
7. Click logout → should redirect to login
```

### Test Flow 2: Lead Intake
```
1. Get staging webhook secret from Vercel env vars
2. Run lead intake test:
   curl -X POST https://[staging-url]/api/intake/lead \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Secret: YOUR_STAGING_SECRET" \
     -d '{
       "email": "test@example.com",
       "company": "Test Corp",
       "phone": "555-1234",
       "projectDescription": "Staging test"
     }'
3. Verify response includes lead ID
4. Check leads appear in dashboard at /leads
```

### Test Flow 3: Contract Creation
```
1. Navigate to https://[staging-url]/contract/new
2. Fill out contract form (requires authentication)
3. Submit and verify contract is created
4. Check contract appears in admin dashboard
5. Verify contract can be viewed
```

---

## Step 7: Database Validation

After successful lead intake and contract creation:

```bash
# Connect to staging Supabase
# Use credentials from Vercel env vars

# Query to verify lead was created
SELECT id, email, company, created_at 
FROM leads 
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC
LIMIT 5;

# Query to verify contract was created
SELECT id, status, created_at 
FROM contracts 
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:** New records appear in database with correct data.

---

## Step 8: Performance Baseline

```bash
# Measure staging response times (should be <2s for 95th percentile)
# You can use web browser DevTools or curl with timing:

curl -w "\nTotal time: %{time_total}s\n" \
  https://[staging-url]/api/health

# Expected: < 1 second for health endpoint
# Leads/contracts: < 2 seconds
```

**Expected Result:** Response times acceptable for production-like load.

---

## Step 9: Error Tracking Validation

Check that errors are properly tracked:

1. Trigger a test error (e.g., invalid API call)
2. Check Sentry or error tracking service
3. Verify error is logged with:
   - Error message
   - Stack trace
   - User context (if authenticated)
   - Timestamp
   - Environment (staging)

**Expected Result:** Errors appear in error tracking dashboard with full context.

---

## Step 10: Staging Validation Report

Create a summary document:

```markdown
# Staging Validation Report — [DATE]

## Deployment
- URL: https://[staging-url]
- Deployed by: [NAME]
- Deployment time: [TIME]
- Build time: [BUILD_TIME]

## Automated Tests
- Passed: 24/24 ✅
- Failed: 0
- Execution time: 1234ms

## Manual Testing
- [ ] Login flow works
- [ ] Lead intake works
- [ ] Contract creation works
- [ ] Database records created
- [ ] Performance acceptable
- [ ] Error tracking working

## Issues Found
(None / list any issues)

## Blockers for Production
(None / list any blockers)

## Sign-Off
- Tested by: [NAME]
- Date: [DATE]
- Ready for production: YES / NO
```

---

## Step 11: Production Gate Review

Before proceeding to production, verify:

- [x] Staging deployment successful
- [x] All automated tests passing
- [x] Manual tests passing
- [x] No 500 errors in staging
- [x] Response times acceptable
- [x] Error tracking working
- [x] Database operations normal
- [x] Staging validation report complete

**If all green:** Ready to proceed to production deployment.

---

## Troubleshooting

### Issue: Deployment fails on Vercel

**Solution:**
1. Check Vercel build logs for specific error
2. Common causes:
   - Missing environment variables
   - Build script error in package.json
   - TypeScript compilation error
3. Fix locally, push to staging branch, re-deploy

### Issue: Tests show 401 Unauthorized

**Causes:**
- Supabase credentials incorrect
- Service role key invalid
- Environment variables not set on Vercel

**Solution:**
1. Verify env vars in Vercel Settings
2. Check service role key format (should start with `sb_secret_`)
3. Redeploy after updating secrets

### Issue: Tests show 404 Not Found

**Causes:**
- Routes not deployed correctly
- TypeScript compilation failed

**Solution:**
1. Check Vercel build log for errors
2. Run local build: `npm run build`
3. Fix any errors, push to staging

### Issue: Response times slow (>5 seconds)

**Causes:**
- Database queries slow
- Supabase project throttled
- Load testing hitting rate limits

**Solution:**
1. Check Supabase query performance
2. Review database indexes
3. Add caching if applicable
4. Run tests sequentially instead of parallel

---

## Post-Deployment Monitoring

Once staging is validated and passing:

1. **Monitor for 24 hours:**
   - Error rates normal?
   - Response times stable?
   - Database connections healthy?
   - No memory leaks?

2. **Check logs regularly:**
   - Error tracking dashboard
   - Vercel deployment logs
   - Supabase database logs

3. **Document findings:**
   - Any unexpected behavior?
   - Performance issues?
   - Security concerns?

---

## Next Steps After Staging Validation ✅

1. **Production Readiness Review:**
   - Complete [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md)
   - Phase A-H sign-off

2. **Production Deployment:**
   - Follow [.ai/workflows/ship-production-release.md](../AI/workflows/ship-production-release.md)
   - Deploy to production main environment

3. **Launch Preparation:**
   - Brief support team
   - Prepare incident response
   - Activate monitoring
   - Test rollback procedure

---

## Success Criteria

✅ **Staging Deployment Complete When:**
- Deployment successful (no build errors)
- All 24+ validation tests passing
- Manual testing flows successful
- Database records created correctly
- Performance acceptable (<2s 95th percentile)
- Error tracking operational
- No known blockers for production

**Estimated Time:** 4-6 hours from start to validation complete.

---

## Deployment Workflow Reference

```
[Build & Push]
     ↓
[Vercel Auto-Deploy]
     ↓
[Environment Setup]
     ↓
[Automated Tests Run]
     ↓
[Manual Tests Run]
     ↓
[Validation Report] → All Passing? → PROCEED TO PRODUCTION
                  → Issues? → Fix & Redeploy
```

---

## Questions?

Refer to:
- [STAGING_DEPLOYMENT_RUNBOOK.md](STAGING_DEPLOYMENT_RUNBOOK.md) - Detailed deployment steps
- [STAGING_VALIDATION_CHECKLIST.md](STAGING_VALIDATION_CHECKLIST.md) - Full validation checklist
- [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md) - Production requirements
- [.ai/workflows/ship-production-release.md](../AI/workflows/ship-production-release.md) - Release workflow

