# PHASE 1 EXECUTION: Stabilization
## Agency Ops Suite - Week 1 (May 11-17, 2026)
**Goal:** Three isolated environments with validated integrations  
**Effort:** 3.5 hours  
**Status:** 🟢 READY TO START NOW

---

## QUICK START (Next 30 Minutes)

If you only have 30 minutes right now, do this:

```
☐ 1. Create Supabase staging project (10 min)
   Go: https://supabase.com → New Project
   Name: agency-ops-suite-staging
   Region: Same as production (check current settings)
   Save URL and anon key

☐ 2. Create Vercel staging deployment (15 min)
   Go: https://vercel.com/dashboard
   Add Project → Select agency-ops-suite repo
   Name: agency-ops-suite-staging
   Framework: Next.js
   Save URL

☐ 3. Bookmark these URLs (5 min)
   - Production: https://agency-ops-suite.vercel.app
   - Staging: https://agency-ops-suite-staging.vercel.app
   - Supabase: https://supabase.com/dashboard
   - Vercel: https://vercel.com/dashboard
```

**Next:** Complete full Phase 1 today or tomorrow

---

## FULL PHASE 1 CHECKLIST

### DAY 1: Infrastructure Setup (90 minutes)

#### ✅ DONE: Git Branch Created
```
[x] Staging branch created: git checkout -b staging
[x] Branch pushed to remote: git push agency-ops-suite staging
    
Status: Complete
```

#### ⏳ TODO: Supabase Staging Project (15 minutes)

```
[ ] Go: https://supabase.com
[ ] Click: New Project
[ ] Name: agency-ops-suite-staging
[ ] Region: [Same as production - get from current settings]
[ ] Org: Your organization
[ ] Database password: Generate strong password
[ ] Click: Create Project
[ ] Wait for project to initialize (2-3 minutes)

[ ] Once created, go to: Settings → API
[ ] Copy: Project URL (looks like https://xxx.supabase.co)
[ ] Copy: anon public key
[ ] Copy: service role key

[ ] Save these in SECRETS_INVENTORY.md (for now, we'll move to 1Password later)

Expected Result:
✓ Can access Supabase dashboard
✓ Project shows "Status: Ready"
✓ API keys visible
```

#### ⏳ TODO: Vercel Staging Project (15 minutes)

```
[ ] Go: https://vercel.com/dashboard
[ ] Click: Add → Project
[ ] Find: agency-ops-suite (GitHub repo)
[ ] Click: Import
[ ] Configure:
    [ ] Project Name: agency-ops-suite-staging
    [ ] Framework: Next.js
    [ ] Root Directory: .
    [ ] Build Command: npm run build:dashboard
    [ ] Output Directory: apps/admin-dashboard/.next

[ ] Environment Variables: Skip for now (will add next)
[ ] Click: Deploy

[ ] Wait for build to complete (3-5 minutes)
[ ] Verify: Deployment shows "Ready"
[ ] Copy: Staging URL (https://agency-ops-suite-staging-xxxxx.vercel.app)

Expected Result:
✓ Build succeeds without errors
✓ Staging URL accessible
✓ App loads (may show error about missing env vars - that's expected)
```

#### ⏳ TODO: Configure Staging Environment Variables (10 minutes)

```
In Vercel dashboard → agency-ops-suite-staging → Settings → Environment Variables

[ ] Add NEXT_PUBLIC_SUPABASE_URL
    Value: https://[staging-project-id].supabase.co
    Environments: Production, Preview, Development
    
[ ] Add NEXT_PUBLIC_SUPABASE_ANON_KEY
    Value: [staging-anon-key]
    Environments: Production, Preview, Development

[ ] Add NEXT_PUBLIC_USE_SEED_DATA
    Value: false
    
[ ] Add ADMIN_EMAIL_ALLOWLIST
    Value: your-email@example.com
    
[ ] Add STRIPE_SECRET_KEY
    Value: sk_test_[your-stripe-test-key]
    
[ ] Add STRIPE_PUBLISHABLE_KEY
    Value: pk_test_[your-stripe-test-key]
    
[ ] Add STRIPE_WEBHOOK_SECRET
    Value: whsec_test_[your-stripe-webhook-secret]
    
[ ] Add RESEND_API_KEY
    Value: re_[your-resend-staging-key]
    
[ ] Add INTAKE_WEBHOOK_SECRET
    Value: staging-intake-secret-12345

[ ] Click: Deploy

Expected Result:
✓ All environment variables added
✓ Staging redeployed
✓ App should now load without errors
```

#### ⏳ TODO: Verify Staging Works (5 minutes)

```
[ ] Go to: https://agency-ops-suite-staging.vercel.app
[ ] Check: Page loads (may see login screen)
[ ] Try: Login with admin email from ADMIN_EMAIL_ALLOWLIST
[ ] Expected: Dashboard loads or shows appropriate message
[ ] Verify: No 500 errors
[ ] Check: Console has no critical errors

Expected Result:
✓ App loads successfully
✓ Can access pages
✓ No database connection errors
```

**GATE:** All Day 1 items complete before proceeding to Day 2

---

### DAY 2: Environment Lockdown (60 minutes)

#### ⏳ TODO: Create Environment Documentation (15 minutes)

```
[ ] Open: docs/DEPLOYMENT_ENVIRONMENTS.md
    (Already created, just review)
    
[ ] Verify: Document describes:
    [ ] Local environment (http://localhost:3000)
    [ ] Staging environment (staging Vercel)
    [ ] Production environment (main Vercel)
    
[ ] Add to README.md (top of file):
    """
    ## Development Environments
    
    - **Local:** http://localhost:3000 (development)
    - **Staging:** https://agency-ops-suite-staging.vercel.app (testing)
    - **Production:** https://agency-ops-suite.vercel.app (live)
    
    See [DEPLOYMENT_ENVIRONMENTS.md](docs/DEPLOYMENT_ENVIRONMENTS.md) for details.
    """

Expected Result:
✓ Team knows about all three environments
✓ URLs documented and accessible
```

#### ⏳ TODO: Verify .env.example Clean (10 minutes)

```
[ ] Open: .env.example
[ ] Check: No actual secret values present
    ✓ Should have: NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
    ✗ Should NOT have: actual URLs or keys
    
[ ] Update if needed with placeholder values only

[ ] Verify: Can be safely committed to git
```

#### ⏳ TODO: Create .env.local for Local Development (10 minutes)

```
[ ] Create file: .env.local (in repo root)
[ ] Add: Local development secrets

Content:
```
# Local Development (.env.local)
# DO NOT COMMIT - add to .gitignore

NEXT_PUBLIC_SUPABASE_URL=https://[staging-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[staging-anon-key]
NEXT_PUBLIC_USE_SEED_DATA=false
ADMIN_EMAIL_ALLOWLIST=your-email@example.com
INTAKE_WEBHOOK_SECRET=local-intake-secret-12345
DEV_AUTH_BYPASS=false

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_[your-test-key]
STRIPE_PUBLISHABLE_KEY=pk_test_[your-test-key]
STRIPE_WEBHOOK_SECRET=whsec_test_[your-webhook-secret]

# Resend
RESEND_API_KEY=re_[your-staging-key]
```

[ ] Test locally: npm run dev:dashboard
[ ] Should start without errors

Expected Result:
✓ Local dev environment works
✓ Can login locally with staging data
✓ File not committed (.env.local in .gitignore)
```

#### ⏳ TODO: Verify .gitignore (10 minutes)

```
[ ] Open: .gitignore (in repo root)
[ ] Verify: Includes these patterns:

    .env.local
    .env.production.local
    .env.staging.local
    .env.development.local
    *.key
    *.pem
    .secrets
    .env
    
[ ] Run verification:
    git status
    
    Should NOT show any .env files
    
[ ] If .env files appear in git status:
    git rm --cached .env*
    git commit -m "chore: remove env files from tracking"
```

#### ⏳ TODO: Verify No Secrets in Git History (15 minutes)

```
[ ] Run these commands:

git log --all --full-history -S "sk_test" -- | head -20
git log --all --full-history -S "sk_live" -- | head -20
git log --all --full-history -S "SUPABASE_SERVICE_ROLE" -- | head -20

[ ] Expected: No results (or only recent changes being added)
[ ] If old secrets found: Document them for investigation later
    (Vercel secrets are safe, but good to know what's in history)

[ ] Verify current branch is clean:
    git status
    
    Should show:
    On branch staging
    nothing to commit, working tree clean
```

**GATE:** All Day 2 items complete before proceeding to Day 3

---

### DAY 3: Integration Testing (95 minutes)

#### ⏳ TODO: Stripe Payment Flow Test (30 minutes)

**Setup:**
```
[ ] Go to Stripe dashboard: https://dashboard.stripe.com
[ ] Settings → Test mode (toggle to ON)
[ ] Copy test keys:
    [ ] Publishable key (pk_test_...)
    [ ] Secret key (sk_test_...)
[ ] Verify both keys are in Vercel staging env vars
```

**Test:**
```
[ ] Go to staging: https://agency-ops-suite-staging.vercel.app/billing
[ ] Click: Create Invoice (or "Add billing record")
[ ] Fill in:
    [ ] Client: Coastline Resort Group (or test client)
    [ ] Amount: $99.00
    [ ] Date: Today
    [ ] Payment method: Stripe
    [ ] Click: Save

[ ] After creating invoice, find checkout button
    (May be "Create checkout" or "Generate payment link")
    
[ ] Click button to generate Stripe checkout
[ ] You should see: Stripe checkout URL created
[ ] Copy URL and open in new tab
[ ] You should see: Stripe payment form

[ ] Enter test card: 4242 4242 4242 4242
    Expiry: Any future date (e.g., 12/25)
    CVC: Any 3 digits (e.g., 123)
    
[ ] Click: Pay
[ ] Expected: "Payment succeeded" message
[ ] Check: Invoice in dashboard now shows "paid"
[ ] Check: Invoice status updated in Supabase

[ ] Verify webhook received:
    Go to Stripe dashboard → Developers → Webhooks
    Look for: payment_intent.succeeded event
    Status should be: Delivered ✓

Expected Result:
✓ Payment processed
✓ Invoice marked as paid
✓ Webhook received
✓ No errors in console
```

**Document:**
```
If successful, add to OPERATIONAL_PROCEDURES.md:

## Stripe Integration Status
- Payment processing: ✓ Working
- Webhook delivery: ✓ Working
- Invoice status sync: ✓ Working
- Test completed: May 11, 2026
```

#### ⏳ TODO: Email Delivery Test (20 minutes)

**Test via Resend Dashboard:**
```
[ ] Go: https://resend.com/dashboard
[ ] Click: Emails
[ ] Click: Send Email (or similar)
[ ] Fill in:
    [ ] To: your-real-email@example.com
    [ ] From: noreply@staging-emails.yourcompany.com
    [ ] Subject: Test Email from Agency Ops Suite Staging
    [ ] Body: This is a test email
    
[ ] Click: Send
[ ] Expected: Email delivered immediately (< 1 minute)
[ ] Check your inbox
[ ] Verify: Email arrives
[ ] Verify: Formatting looks good
```

**Test via Invoice:**
```
[ ] Go to: agency-ops-suite-staging.vercel.app/billing
[ ] Find invoice created in Stripe test
[ ] Click: Email Invoice (or similar button)
[ ] Verify Resend sends email
[ ] Check Resend dashboard → Recent emails
[ ] Check your inbox for invoice email
[ ] Expected: Email arrives < 1 minute
```

**Document:**
```
If successful, add to OPERATIONAL_PROCEDURES.md:

## Email Delivery Status
- Resend integration: ✓ Working
- Test email: ✓ Delivered
- Invoice emails: ✓ Working
- Average delivery: < 1 minute
- Test completed: May 11, 2026
```

#### ⏳ TODO: Backup and Restore Test (45 minutes)

**Create Backup:**
```
[ ] Go to: Supabase dashboard → agency-ops-suite-staging
[ ] Click: Settings → Backups
[ ] Click: "Create a manual backup" (or similar)
[ ] Backup name: 2026-05-11-pre-restore-test
[ ] Click: Create backup
[ ] Wait for completion (5-15 minutes)

[ ] Verification:
    [ ] Backup appears in backups list
    [ ] Status shows "Completed"
    [ ] File size > 100KB
    [ ] Download backup to local machine
```

**Test Restore:**
```
[ ] Go to Supabase → Create new project
    (We'll use this for restore test, then delete)
    
[ ] Project name: agency-ops-suite-restore-test
[ ] Click: Create project
[ ] Wait for project creation

[ ] Go to project settings → Restore from backup
[ ] Upload backup file downloaded earlier
[ ] Wait for restore completion (5-10 minutes)

[ ] Verify restored data:
    SELECT COUNT(*) FROM clients;
    SELECT COUNT(*) FROM leads;
    SELECT COUNT(*) FROM invoices;
    
    Numbers should match original database
```

**Test App Against Restored Data:**
```
[ ] Update .env.local temporarily:
    NEXT_PUBLIC_SUPABASE_URL=[restore-test-project-url]
    NEXT_PUBLIC_SUPABASE_ANON_KEY=[restore-test-anon-key]
    
[ ] npm run dev:dashboard
[ ] Go to: http://localhost:3000
[ ] Try to login: Should work
[ ] Check: /clients - should show same clients as before
[ ] Check: /leads - should show same leads
[ ] Check: /billing - should show same invoices

[ ] If everything works: Restore procedure is verified ✓
[ ] Revert .env.local to staging project
```

**Cleanup:**
```
[ ] Delete restore-test project (don't need it anymore)
[ ] Keep backup (save file locally as backup)
[ ] Document procedure
```

**Document:**
```
Create file: docs/BACKUP_RESTORE_PROCEDURE.md

Content:
---
# Backup & Restore Procedure
## Step-by-Step Guide

### Create Backup
1. Supabase dashboard → Settings → Backups
2. Create manual backup
3. Download backup file
4. Store in secure location

### Restore from Backup
1. Create new Supabase project
2. Go to Settings → Restore from backup
3. Upload backup file
4. Wait for restore completion
5. Verify: SELECT COUNT(*) FROM [table]
6. Test: Start app with restored DB

### Restore to Production
1. NEVER restore directly to production
2. Always test in staging first
3. Create backup of current production
4. Restore only if absolutely necessary
5. Verify all data intact

### Monthly Schedule
- First Monday of each month: Test restore
- Owner: [Your name]
- Time: 1 hour
- Purpose: Verify backup integrity
```

Expected Result:
✓ Backup created
✓ Restore successful
✓ Data integrity verified
✓ Procedure documented
```

#### ⏳ TODO: Document All Procedures (15 minutes)

```
[ ] Create/Update: docs/OPERATIONAL_PROCEDURES.md

Add sections:
[ ] Daily Checklist
[ ] Weekly Checklist  
[ ] Monthly Checklist
[ ] Incident Response
[ ] Backup Schedule
[ ] Deployment Process

Expected Result:
✓ All procedures documented
✓ Team has reference guide
✓ Repeatable processes defined
```

**GATE:** All Day 3 tests passing before marking Phase 1 complete

---

## PHASE 1 COMPLETION CHECKLIST

Before declaring Phase 1 done, verify ALL of these:

```
INFRASTRUCTURE
[ ] Three environments created and isolated
    [ ] Local (http://localhost:3000)
    [ ] Staging (agency-ops-suite-staging.vercel.app)
    [ ] Production (agency-ops-suite.vercel.app)
    
[ ] Staging branch pushed to GitHub
    [ ] Verified at: https://github.com/jamesonolitoquit/agency-ops-suite/branches

SECRETS & CONFIGURATION
[ ] Environment variables configured
    [ ] Staging Vercel: All vars present
    [ ] Local .env.local: Created and tested
    [ ] Production: Unchanged (already working)
    
[ ] Secrets protected
    [ ] No secrets in git history
    [ ] .env.example has no real values
    [ ] .gitignore properly configured
    [ ] SECRETS_INVENTORY.md created (confidential)
    
[ ] Documentation
    [ ] DEPLOYMENT_ENVIRONMENTS.md: Complete
    [ ] SECRETS_INVENTORY.md: Created
    [ ] VERCEL_STAGING_SETUP.md: Reference guide
    [ ] README.md: Links to environments

INTEGRATION VALIDATION
[ ] Stripe payment test: ✓ PASSED
    [ ] Payment completed successfully
    [ ] Invoice marked as paid
    [ ] Webhook received
    
[ ] Email delivery test: ✓ PASSED
    [ ] Test email delivered < 1 minute
    [ ] Invoice email working
    
[ ] Backup/restore test: ✓ PASSED
    [ ] Backup created and downloaded
    [ ] Data restored successfully
    [ ] Restore procedure documented
    
OPERATIONAL PROCEDURES
[ ] docs/OPERATIONAL_PROCEDURES.md: Created
    [ ] Daily checklist
    [ ] Weekly checklist
    [ ] Monthly checklist
    [ ] Incident procedures

TEAM COMMUNICATION
[ ] Team notified of new staging environment
[ ] Staging URL shared: https://agency-ops-suite-staging.vercel.app
[ ] Instructions documented for team access
[ ] Emergency contacts documented
```

---

## IF YOU GET STUCK

**Problem:** Staging build fails in Vercel
```
Solution:
1. Check local build: npm run build:dashboard
2. If local fails: Fix it first
3. If local works but Vercel fails: Check env vars
4. Verify vercel.json is correct (should be already)
```

**Problem:** Can't login to staging
```
Solution:
1. Check: Supabase project URL is staging, not production
2. Check: ADMIN_EMAIL_ALLOWLIST includes your email
3. Check: Database has data (did seed fail?)
4. Check: No RLS policy issues
```

**Problem:** Email not arriving
```
Solution:
1. Check: Resend API key is correct for staging
2. Check: Domain is configured in Resend
3. Check: Email didn't go to spam
4. Wait: Resend is usually < 1 min but sometimes slower
```

**Problem:** Stripe payment declined
```
Solution:
1. Verify: Using test card 4242 4242 4242 4242
2. Check: Using sk_test_* key, not sk_live_*
3. Check: STRIPE_WEBHOOK_SECRET is configured
4. Check: Webhook endpoint is registered in Stripe
```

---

## TIMELINE

```
❌ Before Today: Prototype phase complete
🟢 TODAY (May 11): Start Phase 1
   └─ Quick setup: 30 min (supabase + vercel)
   
📅 Today evening: Environment variables
   └─ Config: 20 min
   
📅 Tomorrow (May 12): Integration tests
   └─ Stripe: 30 min
   └─ Email: 20 min
   └─ Backup: 45 min
   
📅 May 13: Documentation
   └─ Procedures: 30 min

✅ May 14: Phase 1 COMPLETE
   → Ready for Phase 2 (Multi-user)
```

---

## SUCCESS CRITERIA

You'll know Phase 1 is done when:

1. ✅ You have three separate, isolated environments
2. ✅ You can deploy to staging without affecting production
3. ✅ Stripe payments work in staging (test mode)
4. ✅ Emails deliver from staging
5. ✅ Backups work and can be restored
6. ✅ Team knows about all three environments
7. ✅ Procedures are documented
8. ✅ You feel confident testing changes in staging before production

**When all criteria met:** Proceed to Phase 2 - Multi-User Readiness

---

**Prepared by:** Infrastructure Lead  
**Date:** May 11, 2026  
**Status:** 🟢 READY TO EXECUTE

**Next Step:** Start with "Quick Start" section above (30 minutes)
