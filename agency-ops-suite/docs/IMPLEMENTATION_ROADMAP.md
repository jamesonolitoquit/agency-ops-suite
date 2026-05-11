# Implementation Roadmap: Next 4 Weeks

**Audience:** You (solo builder)  
**Timeline:** April 27 - May 25, 2026  
**Goal:** System ready for first 3 paying clients

---

## WEEK 1: Operational Readiness (LAUNCH CRITICAL)

### Monday-Tuesday: Lead Bridge Integration

**Task:** Wire landing page forms to internal CRM

**Current State:**
- ✅ Internal /api/intake/lead endpoint exists
- ✅ Endpoint has shared secret auth
- ❌ Landing page doesn't know how to call it

**Deliverables:**
1. Public site `/api/lead` route (proxy to internal)
2. Contact form integration
3. End-to-end test (form → internal DB)

**Work:**
```typescript
// public-site/app/api/lead/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  
  // Validate payload
  if (!body.name || !body.businessType) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }
  
  // Forward to internal endpoint
  const internal = await fetch(
    process.env.NEXT_PUBLIC_INTAKE_ENDPOINT + '/api/intake/lead',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-intake-secret': process.env.INTAKE_WEBHOOK_SECRET,
      },
      body: JSON.stringify(body),
    }
  );
  
  return internal;
}
```

**Acceptance Criteria:**
- [ ] Form submission creates lead in internal DB
- [ ] Lead appears in dashboard within 2 seconds
- [ ] Smoke test covers the flow

**Time:** 3-4 hours

---

### Wednesday: Environment Lockdown

**Task:** Ensure dev/prod are completely isolated

**Deliverables:**
1. `.env.production` template
2. Verified environment separation
3. Build test with prod env

**Work:**
```bash
# Root of agency-ops-suite/apps/admin-dashboard/

# Create .env.production
cat > .env.production << 'EOF'
# Production environment (Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[prod-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[prod-service-key]
NEXT_PUBLIC_USE_SEED_DATA=false
DEBUG=false
EOF

# Verify it's in .gitignore
grep ".env.production" .gitignore
```

**Acceptance Criteria:**
- [ ] Production build uses prod DB URL
- [ ] Dev build uses local/staging DB URL
- [ ] No secrets in git repository
- [ ] Clear env rotation procedure documented

**Time:** 1-2 hours

---

### Thursday: End-to-End Client Lifecycle Test

**Task:** Simulate full TechStartup Inc client journey

**Scenario:**
```
1. Lead created (form submission)
2. Lead qualified (convert to client)
3. Site provisioned (CLI)
4. Site deployed (to Vercel)
5. Uptime monitored (cron starts pinging)
6. Invoice created (billing)
7. First request submitted (maintenance)
8. Report generated (for client)
```

**Execution:**
1. **Monday morning:** Submit fake form → watch dashboard
2. **Convert to client:** Use dashboard UI
3. **Provision:** `npm run provision -- --client-id=123`
4. **Deploy:** Push to Vercel manually
5. **Check uptime:** Verify monitor runs
6. **Create invoice:** Add to billing
7. **Submit request:** Add maintenance task
8. **Generate report:** Export analytics

**Acceptance Criteria:**
- [ ] Each step completes without manual workaround
- [ ] Can see full journey in dashboard
- [ ] Zero errors logged
- [ ] If 1 error found → log it + fix

**Time:** 4-6 hours (includes debugging)

---

### Friday: Backup + Logging Foundation

**Task:** Protect data + add visibility

**Deliverables:**
1. Daily backup script (tested)
2. First 3 backups completed
3. Basic request logging
4. Error log viewer in dashboard

**Backup Implementation:**
```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/home/user/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Export from Supabase
pg_dump \
  "postgresql://user:password@db.supabase.co:5432/postgres" \
  > "$BACKUP_DIR/backup_${TIMESTAMP}.sql"

# Keep only last 30 days
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +30 -delete

echo "Backup complete: $BACKUP_DIR/backup_${TIMESTAMP}.sql"
```

**Add to Crontab:**
```
0 2 * * * /home/user/backup-db.sh
```

**Logging Implementation:**
```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

// Use in routes
logger.info({ method: req.method, path: req.url, statusCode: res.statusCode });
```

**Acceptance Criteria:**
- [ ] Backup script runs successfully
- [ ] At least 3 backups created
- [ ] Restore procedure tested on staging
- [ ] Logs show all API calls
- [ ] Error log viewer works in dashboard

**Time:** 2-3 hours

---

## WEEK 2: Sales Tools + Risk Mitigation

### Monday-Tuesday: Website Audit Generator

**Purpose:** DM cold lead "We analyzed your site, here's the cost"

**Output Example:**
```
┌─────────────────────────────────┐
│ Website Audit Report            │
│ client.com                      │
├─────────────────────────────────┤
│ Performance: 42/100             │
│  → 3.2s load time (target: <2s) │
│  → 2.1MB uncompressed assets    │
│                                  │
│ SEO: 68/100                      │
│  → Missing H1 tag               │
│  → No meta description          │
│                                  │
│ UX: 55/100                       │
│  → Not mobile responsive        │
│  → CTA button too small         │
│                                  │
│ ESTIMATED COST: $2,400-3,200   │
│ (To fix issues + modernize)     │
└─────────────────────────────────┘
```

**Implementation:**
1. Create `lib/audit-generator.ts`
2. Add API route `/api/audit/generate`
3. Add dashboard form + results view

**Work:**
```typescript
// lib/audit-generator.ts
import lighthouse from 'lighthouse';

export async function generateAudit(url: string) {
  // Run Lighthouse
  const browser = await puppeteer.launch();
  const results = await lighthouse(url, {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'seo', 'accessibility'],
  });
  
  // Extract scores
  const performance = results.lhr.categories.performance.score * 100;
  const seo = results.lhr.categories.seo.score * 100;
  const a11y = results.lhr.categories.accessibility.score * 100;
  
  // Generate HTML report
  const html = generateReportHTML({
    url,
    performance,
    seo,
    a11y,
    issues: extractIssues(results),
  });
  
  return html;
}
```

**Acceptance Criteria:**
- [ ] Audit generates in < 30 seconds
- [ ] Report shows clear issues
- [ ] Shareable link works
- [ ] Can send to client via email/DM

**Time:** 4-5 hours

---

### Wednesday: Proposal + Contract Generators

**Purpose:** Eliminate manual document writing

**Deliverables:**
1. Proposal template + generator
2. Contract template + generator
3. Dashboard UI to generate + download

**Templates to Create:**
- `lib/templates/proposal-landing.md`
- `lib/templates/proposal-ecommerce.md`
- `lib/templates/contract-service.md`

**Generation Flow:**
```
1. Select client + package
2. Fill in form (timeline, pricing)
3. Click "Generate"
4. HTML preview
5. Download as PDF or send link
```

**Acceptance Criteria:**
- [ ] Proposal generates in < 5 seconds
- [ ] Contract has all required clauses
- [ ] Both downloadable as PDF
- [ ] Client gets professional looking doc

**Time:** 3-4 hours

---

### Thursday-Friday: Deployment Checklist System

**Purpose:** Catch mistakes before client sees site

**Checklist Items:**
```
□ Domain registered & DNS updated
□ SSL certificate active
□ Analytics installed
□ Primary CTA working
□ Mobile responsive
□ Form submissions working
□ Social links verified
□ Page speed < 3s
□ No console errors
□ SEO metadata complete
```

**Implementation:**
1. Create `deployment_checklists` table
2. Add `ChecklistItem` model
3. Dashboard UI with checkboxes
4. Mark completion + timestamp
5. Generate "Ready for Launch" certificate

**Acceptance Criteria:**
- [ ] Can create checklist for new client
- [ ] Checkboxes save to DB
- [ ] Completion timestamp recorded
- [ ] Certificate generates when all checked

**Time:** 3-4 hours

---

## WEEK 3: Delivery Tools + Monitoring

### Monday-Tuesday: Uptime Monitor

**Purpose:** Catch site outages before clients notice

**Implementation:**
```typescript
// app/api/cron/monitor-sites/route.ts
export async function GET(req: Request) {
  // Verify it's actually cron (check auth header)
  
  // Get all active client sites
  const clients = await db.clients.findAll({ status: 'active' });
  
  for (const client of clients) {
    try {
      const response = await fetch(client.site_url, { timeout: 5000 });
      const status = response.ok ? 'up' : 'down';
      
      // Record in DB
      await db.uptime_status.create({
        client_id: client.id,
        status,
        checked_at: new Date(),
        response_time: response.time,
      });
      
      // Alert if down
      if (status === 'down') {
        await notifyDashboard(client.id, 'Site down!');
      }
    } catch (error) {
      await db.uptime_status.create({
        client_id: client.id,
        status: 'error',
        checked_at: new Date(),
        error_message: error.message,
      });
    }
  }
  
  return Response.json({ monitored: clients.length });
}
```

**Setup Cron:**
- Use Vercel cron (if public site)
- Or use EasyCron/AWS EventBridge

**Dashboard View:**
```
Client Site Status
├─ TechStartup Inc (UP, checked 2m ago)
├─ LocalBiz LLC (DOWN since 15m ago) ⚠️
└─ WebShop Store (UP, last check 1m ago)
```

**Acceptance Criteria:**
- [ ] Monitor runs every 5 minutes
- [ ] Status recorded in DB
- [ ] Dashboard shows real-time status
- [ ] Alert triggers if down > 5 minutes

**Time:** 2-3 hours

---

### Wednesday: CLI → Dashboard Sync

**Purpose:** Track provisioning progress in real-time

**Current Issue:** CLI runs independently, dashboard doesn't know status

**Fix:**
```typescript
// CLI: provisioning-cli/index.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SERVICE_ROLE_KEY);

async function provision(clientId, runId) {
  // Mark as running
  await supabase
    .from('provisioning_runs')
    .update({ status: 'running', started_at: new Date() })
    .eq('id', runId);
  
  try {
    // Do provisioning...
    const output = await generateSiteFiles(clientId);
    
    // Mark as complete
    await supabase
      .from('provisioning_runs')
      .update({ 
        status: 'success', 
        completed_at: new Date(),
        output_url: `s3://.../${clientId}/site.zip`
      })
      .eq('id', runId);
      
  } catch (error) {
    await supabase
      .from('provisioning_runs')
      .update({ 
        status: 'error',
        error_message: error.message,
        completed_at: new Date(),
      })
      .eq('id', runId);
  }
}
```

**Dashboard Update:**
```typescript
// Check provisioning_runs status
const run = await supabase
  .from('provisioning_runs')
  .select()
  .eq('client_id', clientId)
  .single();

// Show status
{
  run.status === 'running' && <Spinner />
  run.status === 'success' && <Success message="Ready to deploy" />
  run.status === 'error' && <Error message={run.error_message} />
}
```

**Acceptance Criteria:**
- [ ] CLI can be invoked from dashboard
- [ ] Status updates in real-time
- [ ] Errors show clearly
- [ ] Can retry from dashboard

**Time:** 2-3 hours

---

### Thursday-Friday: Onboarding Form

**Purpose:** Collect client data once, use everywhere

**Form Fields:**
```
Business Info:
├─ Company name
├─ Industry (dropdown)
├─ Website URL (optional)
└─ Description

Branding:
├─ Logo upload
├─ Primary color
├─ Secondary color
└─ Font preference

Contact:
├─ Business email
├─ Phone
└─ Service area

Services:
├─ Landing page
├─ E-commerce
├─ Blog
├─ SEO
└─ Maintenance
```

**Implementation:**
1. Create `client_onboarding` table
2. Add upload handler for logo
3. Create form UI in dashboard
4. Link to client record
5. Prefill proposal/contract with data

**Acceptance Criteria:**
- [ ] Form saves all data
- [ ] Logo uploads + stores
- [ ] Data appears in proposal template
- [ ] Can edit/update later

**Time:** 2-3 hours

---

## WEEK 4: Hardening + Prep for Launch

### Monday: Documentation Sprint

**Create:**
1. Deployment runbook (step-by-step deploy)
2. Troubleshooting guide (common issues)
3. Client onboarding sequence
4. Operational procedures manual

**Deployment Runbook Example:**
```markdown
## Deploy New Client Site

1. [ ] Create client record in CRM
2. [ ] Fill onboarding form (branding, services)
3. [ ] Click "Provision Site" → wait for completion
4. [ ] Review generated files
5. [ ] Deploy to Vercel (git push)
6. [ ] Configure custom domain
7. [ ] Enable SSL
8. [ ] Run deployment checklist
9. [ ] Add to uptime monitor
10. [ ] Create initial invoice
11. [ ] Send welcome email to client
12. [ ] Record deployment date in CRM
```

**Time:** 2-3 hours

---

### Tuesday-Wednesday: Security Audit + Hardening

**Checklist:**
- [ ] No secrets in git (audit .gitignore)
- [ ] Database RLS policies enabled
- [ ] Rate limiting on intake endpoint
- [ ] CSRF protection enabled
- [ ] Input validation on all forms
- [ ] Error messages don't leak info
- [ ] Logs don't contain sensitive data

**Quick Fixes:**
```typescript
// Add rate limiting to intake
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
});

app.post('/api/intake/lead', limiter, handleLead);
```

**Time:** 2-3 hours

---

### Thursday: Stress Test

**Goal:** Verify system handles multiple concurrent operations

**Test Scenarios:**
1. 10 simultaneous lead submissions
2. Provisioning + dashboard browse simultaneously
3. Large file upload (logo)
4. Report generation while monitoring runs

**Expected Outcome:**
- No crashes
- Graceful degradation
- Clear error messages if limits hit

**Time:** 2 hours

---

### Friday: Launch Readiness Review

**Final Checklist:**

```
CORE SYSTEMS
□ Lead bridge working
□ E2E client flow tested 3x
□ Backup system running
□ Logging visible
□ Environment variables locked
□ Build passing
□ All smoke tests passing

SALES TOOLS
□ Audit generator working
□ Proposal generator working
□ Contract generator working
□ Can send to clients

DELIVERY TOOLS
□ Provisioning working
□ Uptime monitor running
□ Deployment checklist working
□ Onboarding form working

OPERATIONS
□ Deployment runbook written
□ Troubleshooting guide written
□ Can diagnose issues from logs
□ Can restore from backup

SECURITY
□ No secrets in git
□ RLS enabled
□ Rate limiting active
□ CSRF protection on

YOU
□ Can deploy without anxiety
□ Know how to handle failures
□ Have run 3+ fake client scenarios
□ Ready to take first real client

SIGN-OFF: _________________________ DATE: _____
```

**Time:** 1-2 hours

---

## Success Metrics

### By End of Week 1:
- ✅ Leads can flow from public site → internal CRM
- ✅ Full client lifecycle testable (at least once without errors)
- ✅ Backup system active
- ✅ Can diagnose issues via logs

### By End of Week 2:
- ✅ Can generate audit/proposal/contract in < 2 minutes
- ✅ Deployment checklist prevents mistakes
- ✅ 3+ fake client scenarios run cleanly

### By End of Week 3:
- ✅ Uptime monitoring catching issues
- ✅ CLI writes status to dashboard
- ✅ Onboarding form speeds up delivery

### By End of Week 4:
- ✅ All documentation complete
- ✅ System hardened + tested
- ✅ **Ready to accept first paying client**

---

## If Behind Schedule

**Priority Cut-Off Order:**
1. ❌ Proposal generator (can do manually for first clients)
2. ❌ Onboarding form (can collect data via form for now)
3. ❌ Analytics (can add later)
4. ✅ Keep: Lead bridge, E2E test, backup, logging, audit generator
5. ✅ Keep: Deployment checklist, uptime monitor

**Minimum Viable Launch:**
- Lead intake + bridge
- CLI provisioning + DB sync
- Uptime monitoring
- Backup system
- Deployment checklist
- Audit generator (for sales)

If you have these 6, you can take clients and deliver.

---

**Document Created:** April 27, 2026  
**Last Review:** [Your Notes]  
**Next Update:** May 4, 2026
