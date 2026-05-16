# Week 1 Quick Start: Operational Readiness

**Your Goal:** Get system "client-ready" by end of week  
**Your Reality:** You're 80% there. This week fills the gaps.  
**Your Timeline:** 72 hours of focused work

---

## What You Have ✅

- Internal `/api/intake/lead` endpoint (complete)
- Admin dashboard (working)
- Provisioning CLI (standalone)
- Database schema (Supabase)
- Smoke tests (7 tests passing)
- Build system (production-ready)

## What's Missing ⚠️

- Lead bridge from public site
- Environment variable lockdown
- End-to-end validation test
- Backup system
- Operational visibility (logging)

---

## Your 3-Day Sprint

### 🗓️ DAY 1 (Monday) — Environment + Lead Bridge

**Goal:** Forms can reach internal database  
**Time:** 3-4 hours  
**Success:** Submit form → See lead in dashboard

#### 1. Get Supabase Credentials (15 min)
```
Go: https://supabase.com
→ Your project → Settings → API
→ Copy Project URL and anon key
```

#### 2. Update .env.local (10 min)
Edit: `apps/admin-dashboard/.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
NEXT_PUBLIC_USE_SEED_DATA=false
ADMIN_EMAIL_ALLOWLIST=your-email@example.com
DEV_AUTH_BYPASS=true
DEV_AUTH_BYPASS_EMAIL=your-email@example.com
INTAKE_WEBHOOK_SECRET=my-test-secret-12345
```

#### 3. Start Dev Server (5 min)
```bash
cd d:\GitHub\Portfolio\ Files\agency-ops-suite
npm run dev --workspace apps/admin-dashboard
```

#### 4. Test Internal Endpoint (10 min)
```bash
curl -X POST http://localhost:3000/api/intake/lead \
  -H "Content-Type: application/json" \
  -H "x-intake-secret: my-test-secret-12345" \
  -d '{"name":"Test","businessType":"e-commerce","email":"test@example.com"}'
```
Expected: `{"ok": true, "leadId": "..."}`

#### 5. Create Test Form Page (30 min)
Use the template provided: [ENVIRONMENT_SETUP_GUIDE.md](ENVIRONMENT_SETUP_GUIDE.md)

Path: `apps/admin-dashboard/src/app/admin/test-lead-form/page.tsx`

#### 6. Test Via Form (10 min)
```
Go: http://localhost:3000/admin/test-lead-form
→ Fill form → Submit
→ Should redirect to /leads
→ New lead should appear
```

#### 7. Document Public Site Integration (15 min)
- Copy template: [PUBLIC_API_LEAD_ROUTE_TEMPLATE.ts](PUBLIC_API_LEAD_ROUTE_TEMPLATE.ts)
- Place in your public site: `/app/api/lead/route.ts`
- Set env vars:
  ```
  NEXT_PUBLIC_INTAKE_ENDPOINT=http://localhost:3000
  INTAKE_WEBHOOK_SECRET=my-test-secret-12345
  ```

#### 8. Checkpoint
- [ ] Dev server running
- [ ] Curl test passes
- [ ] Form submits lead
- [ ] Lead appears in dashboard
- [ ] Public API route created (not deployed yet)

---

### 🗓️ DAY 2 (Tuesday) — End-to-End Test

**Goal:** Verify complete client journey works  
**Time:** 4-6 hours (includes debugging)  
**Success:** Lead→Client→Deploy→Bill→Report (0 critical errors)

Follow: [E2E_CLIENT_LIFECYCLE_TEST.md](E2E_CLIENT_LIFECYCLE_TEST.md)

**Scenario:** TechStartup Inc (fictional SaaS client)

#### Phases to Complete:
1. Lead Capture (15 min)
2. Lead Qualification (10 min)
3. Site Provisioning (30-45 min)
4. Deployment (20 min)
5. Monitoring Setup (10 min)
6. Billing Setup (10 min)
7. Request/Maintenance (10 min)
8. Report Generation (10 min)

#### Critical Path If Behind:
Must complete: 1, 2, 4, 6  
Can skip for now: 3, 5, 7, 8

#### Checkpoint
- [ ] Lead submitted and appears
- [ ] Converted to client
- [ ] Site deployed (even if manual)
- [ ] Invoice created
- [ ] Uptime monitor shows status
- [ ] Zero critical errors in logs

---

### 🗓️ DAY 3 (Wednesday) — Backup + Logging

**Goal:** Data protected + system visible  
**Time:** 2-3 hours  
**Success:** Backup runs daily, logs show everything

#### 1. Create Backup Script (45 min)
Follow: [BACKUP_SYSTEM_GUIDE.md](BACKUP_SYSTEM_GUIDE.md)

File: `~/backups/agency-ops-suite/daily-backup.sh`

#### 2. Test Backup (15 min)
```bash
export SUPABASE_URL="https://[your-project].supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="[your-key]"
./daily-backup.sh
```

Should create: `backup_20260427_143201.sql` (~100-200MB)

#### 3. Schedule Cron Job (5 min)
```bash
crontab -e
# Add: 0 2 * * * /path/to/daily-backup.sh
```

#### 4. Add Request Logging (45 min)

Add to: `apps/admin-dashboard/src/middleware.ts`

```typescript
import { NextResponse } from 'next/server'

export async function middleware(request: Request) {
  const start = Date.now()
  const response = NextResponse.next()
  const duration = Date.now() - start

  console.log({
    timestamp: new Date().toISOString(),
    method: request.method,
    path: new URL(request.url).pathname,
    status: response.status,
    duration: `${duration}ms`,
  })

  return response
}
```

#### 5. Add Error Boundary (15 min)

Add to: `apps/admin-dashboard/src/app/layout.tsx`

```typescript
'use client'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    window.addEventListener('error', (e) => {
      console.error('UNCAUGHT ERROR', e.error)
      setError(e.error?.message)
    })
  }, [])

  if (error) return <div>Application error. Check console.</div>
  return children
}
```

#### Checkpoint
- [ ] Backup script created
- [ ] First backup ran successfully
- [ ] Backup file exists and > 1MB
- [ ] Cron job scheduled
- [ ] Logging shows API calls
- [ ] Error handling works

---

## End of Week 1 Status

**If All Checkpoints Passed:**
```
✅ Lead bridge working
✅ E2E client flow validated
✅ Backup system active
✅ Logging visible
✅ 3+ backups created
✅ Restore procedure documented

→ YOU ARE CLIENT-READY
```

**If Some Checkpoints Failed:**
```
❌ Fix the blockers
→ Re-run E2E test
→ Verify fix works
→ Document what broke
```

---

## Documents You'll Need This Week

| Document | Purpose | When |
|----------|---------|------|
| [ENVIRONMENT_SETUP_GUIDE.md](ENVIRONMENT_SETUP_GUIDE.md) | Step-by-step env config | Day 1 |
| [PUBLIC_API_LEAD_ROUTE_TEMPLATE.ts](PUBLIC_API_LEAD_ROUTE_TEMPLATE.ts) | Public API proxy template | Day 1 |
| [E2E_CLIENT_LIFECYCLE_TEST.md](E2E_CLIENT_LIFECYCLE_TEST.md) | Full client journey test | Day 2 |
| [BACKUP_SYSTEM_GUIDE.md](BACKUP_SYSTEM_GUIDE.md) | Backup implementation | Day 3 |
| [ENV_LOCAL_TEMPLATE.txt](ENV_LOCAL_TEMPLATE.txt) | .env.local reference | Day 1 |
| [ENV_PRODUCTION_TEMPLATE.txt](ENV_PRODUCTION_TEMPLATE.txt) | .env.production reference | Later |

---

## Common Issues & Quick Fixes

### "Lead endpoint returns 401"
- Check: Is secret correct in curl AND .env.local?
- Check: Is secret the SAME string (case-sensitive)?

### "Lead submitted but doesn't appear in dashboard"
- Refresh the page
- Check: Are you logged in with correct email?
- Check: Is Supabase URL/key correct in .env.local?

### "Backup script fails with connection error"
- Check: Is SUPABASE_URL set?
- Check: Is SERVICE_ROLE_KEY correct?
- Check: Do you have pg_dump installed? (`which pg_dump`)

### "Form redirects but then shows 404"
- Check: Did you create the test-lead-form page?
- Check: Is the path correct: `/admin/test-lead-form`?

---

## Your Decision: Which Public Site?

You have options:

### A) Use portfolio-website (Simplest Now)
- Pros: Already exists, deployed
- Cons: Mixes portfolio with business landing
- Action: Add `/api/lead` route to portfolio-website

### B) Create separate business landing (Better)
- Pros: Clean separation, professional
- Cons: Requires setup
- Action: Create new Next.js project, deploy to Vercel

**Recommendation:** Do A for Week 1 (get working), then migrate to B before first client.

---

## Success Definition

**By End of Week 1, you will:**

✅ Form submissions reach your CRM  
✅ Can provision and deploy a site  
✅ Daily backups running  
✅ Can troubleshoot issues via logs  
✅ Ran full client scenario 3x without panic  
✅ Know recovery procedure if something breaks  
✅ Feel confident enough to take real clients

**You will NOT:**

❌ Have perfect UI  
❌ Have all features built  
❌ Have external integrations  

Focus on: **Stable + Connected + Backed Up**

---

## Next Week Preview

**Week 2:** Sales Tools (audit generator, proposal, contract)  
**Week 3:** Delivery Tools (checklist, monitoring)  
**Week 4:** Refinement + First Client Onboarding

---

**You've got this. Start with Day 1. One checkpoint at a time.**

🚀 **Ready? Let's go.**

---

Questions?
- Check the guides above (linked)
- Document any issues you hit
- Review error messages carefully

**Target completion:** Friday EOD Week 1  
**Minimum viable:** Tuesday EOD (lead bridge + E2E test)
