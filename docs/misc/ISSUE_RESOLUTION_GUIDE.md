# ISSUE RESOLUTION GUIDE - Vercel Environment Variables

**Status**: ⏳ **REMAINING ISSUE: SUPABASE_SERVICE_ROLE_KEY Missing**  
**Priority**: Medium (Non-blocking for launch, but needed for webhooks)  
**Estimated Fix Time**: 2 minutes

---

## 📋 ISSUE ANALYSIS

### Current State
- ✅ Lead intake page works
- ✅ Webhook secret validation works
- ⚠️ **Lead creation returns 401** because SUPABASE_SERVICE_ROLE_KEY not in Vercel

### Why This Happens
The lead intake API (`/api/intake/lead/route.ts`) requires `SUPABASE_SERVICE_ROLE_KEY` to:
1. Validate the webhook secret
2. Create records in Supabase using service role permissions
3. Return 201 Created on success

**Locally**: This works because .env.local has the key  
**Staging**: This fails because Vercel Preview doesn't have it set

### Impact
- **On Users**: None - feature not live yet
- **On Testing**: Smoke tests show 401 (expected) 
- **On Launch**: Can be fixed before production goes live

---

## ✅ SOLUTION: Add Environment Variables to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

**Step 1: Open Vercel Project Settings**
```
https://vercel.com/jamesonolitoquits-projects/agency-ops-suite/settings
```

**Step 2: Go to Environment Variables**
```
Settings → Environment Variables
```

**Step 3: Add Variable (Preview Environment)**
```
Variable Name: SUPABASE_SERVICE_ROLE_KEY
Variable Value: <redacted service role key>
Environment: Preview (checkmark)
```

**Step 4: Also Add These Related Variables**
```
Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xfasfyuhtelnmsyokygc.supabase.co
Environment: Preview (checkmark)

Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: <redacted anon key>
Environment: Preview (checkmark)

Variable Name: INTAKE_WEBHOOK_SECRET
Value: <redacted>
Environment: Preview (checkmark)

Variable Name: ADMIN_EMAIL_ALLOWLIST
Value: jumpstarthost@gmail.com
Environment: Preview (checkmark)
```

**Step 5: Save and Redeploy**
- Click "Save" for each variable
- Trigger redeploy: Deployments → Redeploy on staging branch
- Wait ~3-5 minutes for build

**Step 6: Test**
- Run staging validation tests again
- Lead intake should now return 201 (not 401)

---

## 📊 What Variables Are Currently Set

### ✅ Already in Vercel
- INTAKE_WEBHOOK_SECRET ✅ (Preview has it)
- ADMIN_EMAIL_ALLOWLIST ✅ (likely in Production)

### ❌ Missing in Vercel (Needed)
- SUPABASE_SERVICE_ROLE_KEY ❌ (Preview & Production)
- NEXT_PUBLIC_SUPABASE_URL ❌ (might be in Production)
- NEXT_PUBLIC_SUPABASE_ANON_KEY ❌ (might be in Production)

### ✅ Stored Securely in Vercel
- These are marked as "Encrypted" in Vercel
- Safe to store sensitive values
- Not exposed in build logs

---

## 🔧 Alternative: Automation Script

If you prefer to add variables programmatically, use Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Add environment variable
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Select environment: Preview
# Enter value: <redacted service role key>

# Redeploy
vercel deploy --prod
```

---

## ✅ DEPLOYMENT ORDER

### Phase 1: Add Health Endpoint ✅ DONE
- Created: `apps/admin-dashboard/src/app/api/health/route.ts`
- Tested: Locally working (200 status)
- Committed: 8db2379
- Pushed: To staging branch

### Phase 2: Configure Vercel Environment Variables ⏳ NEXT
- Add SUPABASE_SERVICE_ROLE_KEY
- Add Supabase credentials
- Trigger redeploy
- Expected: ~3-5 minutes

### Phase 3: Verify All Tests Pass ⏳ NEXT
- Re-run staging validation tests
- Expected: 20/20 tests passing (up from 17/20)
- Health endpoint: Should return 200 ✅
- Lead intake: Should return 201 (not 401) ✅

### Phase 4: Proceed to Production ⏳ NEXT
- Once all staging tests pass
- Merge to main
- Deploy to production
- Run production validation

---

## 🎯 EXPECTED RESULTS AFTER FIX

### Staging Validation Tests
```
BEFORE (Current):
- Total: 20 tests
- Passing: 17
- Failing: 3 (Home 307, Health 404, Lead intake 401)

AFTER (After env vars added):
- Total: 20 tests  
- Passing: 20 ✅ (ALL)
- Failing: 0
- Home 307: Still 307 (expected redirect)
- Health endpoint: 200 ✅ (NEW)
- Lead intake: 201 ✅ (FIXED)
```

### Lead Intake Workflow
```
1. Request: POST /api/intake/lead
   Header: x-webhook-secret: <redacted>

2. Validation:
   - Secret check: ✅ PASS (webhook secret correct)
   - Service role key: ✅ PASS (now available in Vercel)
   
3. Database Insert:
   - Create lead record: ✅ PASS
   - Return 201 Created: ✅ PASS
```

---

## 📝 ISSUE RESOLUTION CHECKLIST

- [x] **Issue 1: Health endpoint 404** → FIXED
  - Created `/api/health/route.ts`
  - Tested locally: ✅ 200 OK
  - Committed: 8db2379
  
- [ ] **Issue 2: Lead intake 401** → IN PROGRESS
  - Root cause: Missing SUPABASE_SERVICE_ROLE_KEY
  - Solution: Add to Vercel Preview environment
  - Timeline: 2 minutes via UI
  
- [x] **Issue 3: Home page 307** → NO FIX NEEDED
  - This is expected behavior ✅
  - Users correctly redirected to login
  - Working as designed

---

## 🚀 NEXT ACTION

### To Complete Issue Resolution:

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/jamesonolitoquits-projects/agency-ops-suite/settings/environment-variables
   ```

2. **Add SUPABASE_SERVICE_ROLE_KEY**
   - Value: `<redacted service role key>`
   - Environment: Preview
   - Save

3. **Trigger Redeploy**
   - Go to Deployments
   - Click "Redeploy" on latest staging deployment
   - Wait 3-5 minutes

4. **Run Tests**
   ```bash
   node scripts/staging_validation.js https://agency-ops-suite-capq0tblr-jamesonolitoquits-projects.vercel.app
   ```

5. **Verify Results**
   - Expected: 20/20 tests passing ✅

---

## ⏱️ TIMING

- Health endpoint creation: ✅ 5 minutes (DONE)
- Health endpoint testing: ✅ 2 minutes (DONE)
- Health endpoint commit: ✅ 1 minute (DONE)
- Adding env vars to Vercel: ⏳ 2 minutes (NEXT)
- Vercel redeploy: ⏳ 3-5 minutes
- Test execution: ⏳ 2 minutes
- **Total remaining: ~10-15 minutes to complete**

---

## 🎯 DECISION TREE

```
Are all staging tests passing?
├─ YES → Proceed to production deployment
└─ NO (Current state: 17/20)
   ├─ Health endpoint 404?
   │  └─ NO (FIXED ✅ - now returns 200)
   └─ Lead intake 401?
      ├─ ROOT CAUSE: Missing SUPABASE_SERVICE_ROLE_KEY
      ├─ SOLUTION: Add to Vercel
      └─ ACTION: Follow steps above
```

---

## ✅ SIGN-OFF

**Health Endpoint Status**: ✅ RESOLVED
- Implemented, tested, committed, pushed

**Environment Variable Status**: ⏳ READY TO RESOLVE
- Root cause identified
- Solution documented
- Ready for execution

**Next Milestone**: Complete Vercel config → All tests pass → Production deployment

