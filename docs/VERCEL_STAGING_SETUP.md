# Vercel Staging Deployment Setup
## Agency Ops Suite - Branch-Based Deployments
**Date:** May 11, 2026  
**Status:** Ready to configure

---

## BRANCH DEPLOYMENT STRATEGY

```
GitHub Branches → Vercel Projects
├── main branch → Production (agency-ops-suite.vercel.app)
├── staging branch → Staging (agency-ops-suite-staging.vercel.app)
└── feature/* branches → Preview (auto)
```

---

## PRODUCTION SETUP (Already Done)

**URL:** https://agency-ops-suite.vercel.app  
**Branch:** `main`  
**Environment:** Production  
**Current Status:** ✅ Live

---

## STAGING SETUP (Do This Now)

### Step 1: Create Staging Vercel Project

```
1. Go: https://vercel.com/dashboard
2. Click: "Add New"
3. Select: "Project"
4. Search for: "agency-ops-suite"
5. Select the GitHub repository
6. Configure:
   - Project Name: agency-ops-suite-staging
   - Framework: Next.js
   - Root Directory: .
   - Build Command: npm run build:dashboard
   - Output Directory: apps/admin-dashboard/.next
```

### Step 2: Configure Environment Variables (Staging)

In Vercel dashboard → Settings → Environment Variables

```
# Staging environment variables
NEXT_PUBLIC_SUPABASE_URL = https://[staging-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [staging-anon-key]
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = [staging-service-key]
NEXT_PUBLIC_USE_SEED_DATA = false

# Admin access
ADMIN_EMAIL_ALLOWLIST = your-staging-email@example.com

# Integrations (Staging)
STRIPE_SECRET_KEY = sk_test_[staging-test-key]
STRIPE_PUBLISHABLE_KEY = pk_test_[staging-test-key]
RESEND_API_KEY = re_[staging-key]

# Webhooks
INTAKE_WEBHOOK_SECRET = staging-intake-secret-12345
STRIPE_WEBHOOK_SECRET = whsec_test_[staging-webhook-secret]
```

**IMPORTANT:** 
- Use STAGING secrets, not production
- All keys should be test/staging variants
- Never use production secrets in staging

### Step 3: Configure Branch Deployment

In Vercel dashboard → Settings → Git → Connected Git Repository

```
Branch: staging
Auto-deploy: Yes
Environment: Staging (recommended)
```

### Step 4: Verify Staging Deployment

```
1. Push to staging branch: git push agency-ops-suite staging
2. Wait for Vercel build to complete (2-3 minutes)
3. Check: https://agency-ops-suite-staging.vercel.app
4. Verify: Dashboard loads, can login
```

---

## BRANCH MANAGEMENT

### Production Branch (main)
```bash
# Production is protected
# Changes only via:
# 1. Develop locally
# 2. Test in staging
# 3. Merge PR to main
# 4. Vercel auto-deploys

# Never commit directly to main
# Always use: git checkout -b feature/... from staging
```

### Staging Branch
```bash
# Staging is for testing before production

# Workflow:
git checkout staging                    # Start from staging
git pull agency-ops-suite staging       # Get latest
git checkout -b feature/my-feature      # Create feature branch
# ... make changes, test locally ...
git push origin feature/my-feature      # Push feature branch
# Create PR from feature/my-feature → staging
# Review, test in Vercel preview
# Merge PR
# Vercel auto-deploys to agency-ops-suite-staging.vercel.app
```

### Local Development
```bash
# For local testing before staging

# Setup:
git checkout develop                    # or create if doesn't exist
npm install
npm run dev:dashboard                   # Uses local .env.local
```

---

## DEPLOYMENT WORKFLOW

### Development → Staging → Production

```
1. LOCAL DEVELOPMENT
   ├─ npm run dev:dashboard
   ├─ .env.local (development secrets)
   └─ http://localhost:3000

2. STAGING VALIDATION
   ├─ git push origin feature/my-feature
   ├─ Create PR to staging branch
   ├─ Vercel builds and deploys to preview
   ├─ Test at: https://[project]-[branch].vercel.app
   ├─ Merge to staging if approved
   └─ Auto-deploys to: agency-ops-suite-staging.vercel.app

3. PRODUCTION DEPLOYMENT
   ├─ Create PR from staging → main
   ├─ Code review (if multiple team members)
   ├─ Merge to main
   ├─ Vercel builds and deploys
   └─ Live at: https://agency-ops-suite.vercel.app
```

### Safety Checks Before Merging to Main

```bash
# Before merging staging → main, verify:

# 1. Build succeeds
npm run build:dashboard

# 2. No lint errors
npm run lint

# 3. Tests pass
npm run test:smoke

# 4. Staging deployment working
# Go to: https://agency-ops-suite-staging.vercel.app
# Verify: Login works, basic workflow functions

# 5. Secrets rotation if needed
# Check: SECRETS_INVENTORY.md for rotation dates
```

---

## ENVIRONMENT VARIABLES REFERENCE

### Supabase (Database)

```
NEXT_PUBLIC_SUPABASE_URL
  → Production Supabase project URL
  → Staging: Different project
  → Local: Can be staging project

NEXT_PUBLIC_SUPABASE_ANON_KEY
  → Public anon key for client-side
  → Different key per environment

SUPABASE_SERVICE_ROLE_KEY
  → Private server key (never expose)
  → Only in .env.local or Vercel (not in browser)
  → Different key per environment
```

### Stripe (Payments)

```
STRIPE_SECRET_KEY
  → sk_live_* in production (REAL money)
  → sk_test_* in staging/local (TEST mode)
  → NEVER mix them up

STRIPE_PUBLISHABLE_KEY
  → pk_live_* in production
  → pk_test_* in staging/local

STRIPE_WEBHOOK_SECRET
  → Different webhook endpoint per environment
  → Configure in Stripe dashboard
```

### Resend (Email)

```
RESEND_API_KEY
  → Live key for production
  → Test key for staging
  → Never commit key, always use Vercel secrets
```

### Application

```
NEXT_PUBLIC_USE_SEED_DATA
  → true: Use mock data (development)
  → false: Use real data (staging/production)

ADMIN_EMAIL_ALLOWLIST
  → Comma-separated emails allowed as admin
  → Different per environment
```

### Security

```
INTAKE_WEBHOOK_SECRET
  → Shared secret for lead intake API
  → Different per environment
  → Rotate monthly

DEV_AUTH_BYPASS
  → true: Skip auth in development
  → false: Real auth required
  → NEVER true in staging/production
```

---

## VERCEL CONFIGURATION FILE

**File:** `vercel.json` (already created)

```json
{
  "buildCommand": "npm run build:dashboard",
  "outputDirectory": "apps/admin-dashboard/.next",
  "framework": "nextjs",
  "nodeVersion": "20.x",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

---

## CHECKLIST: Staging Deployment Setup

- [ ] **Staging branch created and pushed**
  ```bash
  git branch staging
  git push agency-ops-suite staging
  ```

- [ ] **Vercel staging project created**
  - [ ] Project name: agency-ops-suite-staging
  - [ ] Linked to GitHub: agency-ops-suite repo
  - [ ] Build command: npm run build:dashboard
  - [ ] Output directory: apps/admin-dashboard/.next

- [ ] **Staging environment variables configured**
  - [ ] Supabase staging credentials
  - [ ] Stripe test keys
  - [ ] Resend staging API key
  - [ ] All staging secrets in place

- [ ] **Branch deployment configured**
  - [ ] Staging branch: agency-ops-suite/staging
  - [ ] Auto-deploy: enabled
  - [ ] Preview deployments: enabled

- [ ] **Staging deployment verified**
  - [ ] Push to staging branch
  - [ ] Vercel builds successfully
  - [ ] App loads at: agency-ops-suite-staging.vercel.app
  - [ ] Can login with staging admin email
  - [ ] Dashboard displays correctly

- [ ] **Production protection**
  - [ ] Main branch protected
  - [ ] Requires PR review (optional)
  - [ ] Auto-deploys from main

- [ ] **Documentation updated**
  - [ ] Team knows staging URL
  - [ ] Team knows branch workflow
  - [ ] Runbook created for deployments

---

## TROUBLESHOOTING

### Staging Build Fails

**Check:**
```bash
# 1. Build locally succeeds
npm run build:dashboard

# 2. vercel.json correct
cat vercel.json

# 3. Environment variables in Vercel
# Go: Vercel dashboard → Settings → Environment Variables
# Verify: All required vars present for staging
```

### Can't Login to Staging

**Check:**
```
1. Supabase staging project is active
2. NEXT_PUBLIC_SUPABASE_URL correct
3. ADMIN_EMAIL_ALLOWLIST includes your email
4. No RLS policy blocking access
```

### Staging URL Not Working

**Check:**
```
1. Deployment completed in Vercel
2. No build errors in logs
3. Correct branch deployed (staging, not main)
4. DNS propagated (usually immediate)
```

---

## NEXT STEPS

1. ✅ Staging branch created (just did this)
2. ⏳ Create Supabase staging project (15 min)
3. ⏳ Create Vercel staging project (10 min)
4. ⏳ Configure environment variables (5 min)
5. ⏳ Verify staging deployment (5 min)
6. ✅ Verify production still works (sanity check)

**Total time:** ~35 minutes

---

## PRODUCTION URLs (REFERENCE)

| Environment | URL | Branch | Secrets |
|------------|-----|--------|---------|
| Production | agency-ops-suite.vercel.app | main | Production |
| Staging | agency-ops-suite-staging.vercel.app | staging | Staging |
| Local | http://localhost:3000 | any | .env.local |
| Preview | [branch].vercel.app | feature/* | Inherited from staging |

---

**Prepared by:** Infrastructure Lead  
**Date:** May 11, 2026  
**Next:** Begin Phase 1.2 - Lock Down Secrets
