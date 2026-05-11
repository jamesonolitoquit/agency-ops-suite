# Operational Readiness Architecture

**Status:** Pre-launch validation phase  
**Date:** April 2026  
**Objective:** Define system completeness before accepting first 3 paying clients

---

## I. Current System State

### ✅ What You Have

| Component | Status | Notes |
|-----------|--------|-------|
| **Data Layer** | Ready | Supabase hosted, schema complete, RLS enabled |
| **Admin Dashboard** | Ready | Next.js, auth, core CRM routes built |
| **Provisioning CLI** | Ready | Standalone Node.js tool for site generation |
| **Lead Intake API** | Ready | `/api/intake/lead` endpoint with secret auth, audit logging |
| **Smoke Tests** | Ready | 7 tests covering auth, intake validation, malformed JSON |
| **Build Pipeline** | Ready | Next.js production build passes, CI/CD ready |
| **Documentation** | Ready | Centralized docs/, reference links working |

### ⚠️ Critical Gaps (Blockers)

| Gap | Impact | Fix Priority |
|-----|--------|--------------|
| **Landing page → internal API bridge missing** | Leads can't reach system | **CRITICAL** |
| **No end-to-end client lifecycle test** | Unknown failure points | **CRITICAL** |
| **CLI → DB sync incomplete** | Manual provisioning status tracking | **HIGH** |
| **No backup/disaster recovery** | Data loss risk | **HIGH** |
| **Monitoring disabled** | Silent failures on client sites | **HIGH** |
| **No operational logging** | Can't debug production issues | **MEDIUM** |
| **Environment isolation weak** | Risk of mixing dev/prod | **MEDIUM** |

---

## II. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ EXTERNAL WORLD                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Vercel Hosting]                  [Client Sites]           │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │ Landing Page     │              │ Client Websites  │    │
│  │ ┌────────────┐   │              │ (Vercel/VPS)     │    │
│  │ │ Contact    │   │              └────────┬─────────┘    │
│  │ │ Form       │   │                       │              │
│  │ └──────┬─────┘   │              ┌────────▼─────────┐   │
│  │        │         │              │ Uptime Monitor   │   │
│  │ ┌──────▼─────┐   │              │ (Cron ping)      │   │
│  │ │ API Route  │   │              └──────────────────┘   │
│  │ │ /api/lead  │   │                                      │
│  │ └──────┬─────┘   │                                      │
│  └────────┼──────────┘                                      │
│           │                                                │
│           │ (HTTPS → Internal secret)                     │
│           │                                                │
├───────────┼────────────────────────────────────────────────┤
│ PRIVATE NETWORK (VPN/Private)                              │
│           │                                                │
│  ┌────────▼──────────────────────────────────────────┐   │
│  │ AGENCY OPS SUITE (Internal)                       │   │
│  │                                                   │   │
│  │ Admin Dashboard (Next.js 14)                      │   │
│  │ ├─ CRM (leads, clients, deals)                   │   │
│  │ ├─ Billing                                       │   │
│  │ ├─ Requests queue                                │   │
│  │ ├─ Site provisioning status                      │   │
│  │ ├─ Maintenance tracking                          │   │
│  │ ├─ Reports & analytics                           │   │
│  │ └─ Uptime dashboard                              │   │
│  │                                                   │   │
│  │ Internal APIs                                     │   │
│  │ ├─ /api/intake/lead (lead ingestion)             │   │
│  │ ├─ /api/audit/generate (website audits)          │   │
│  │ ├─ /api/proposal/generate                        │   │
│  │ ├─ /api/contract/generate                        │   │
│  │ ├─ /api/checklist/* (deployment checklists)      │   │
│  │ └─ /api/monitor/status (uptime checks)           │   │
│  │                                                   │   │
│  │ Background Services                              │   │
│  │ ├─ Provisioning CLI                              │   │
│  │ ├─ Uptime monitor cron                           │   │
│  │ ├─ Backup cron (daily DB dump)                   │   │
│  │ └─ Notification service                          │   │
│  │                                                   │   │
│  │ Libraries & Services                             │   │
│  │ ├─ Lead enrichment                               │   │
│  │ ├─ Report generation (HTML/PDF)                  │   │
│  │ ├─ Template management                           │   │
│  │ └─ Logging & error tracking                      │   │
│  │                                                   │   │
│  └─────────────┬──────────────────────────────────────┘   │
│                │                                           │
├────────────────┼───────────────────────────────────────────┤
│ DATA LAYER     │                                           │
│ ┌──────────────▼─────────────────────────────────────┐   │
│ │ Supabase Hosted Database                           │   │
│ │ ├─ leads                                           │   │
│ │ ├─ clients                                         │   │
│ │ ├─ deals                                           │   │
│ │ ├─ provisioning_runs                              │   │
│ │ ├─ deployments & checklists                       │   │
│ │ ├─ uptime_status                                  │   │
│ │ ├─ audit_events                                   │   │
│ │ ├─ notifications                                  │   │
│ │ └─ daily_backups (metadata + timestamps)          │   │
│ │                                                   │   │
│ │ Backup Storage (S3/Local)                         │   │
│ │ └─ timestamped DB dumps (daily)                   │   │
│ └───────────────────────────────────────────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## III. Pre-Launch Validation Checklist

### A. Lead Intake Bridge (CRITICAL)

**Goal:** Verify landing page leads actually reach internal system

```
Task: Wire public site contact form → internal /api/intake/lead
├─ [ ] Public site repo has API route /api/lead
├─ [ ] Route reads NEXT_PUBLIC_INTAKE_ENDPOINT (your internal URL)
├─ [ ] Route includes INTAKE_WEBHOOK_SECRET in header
├─ [ ] Public form submits → validates payload → sends to internal
├─ [ ] Internal endpoint receives + creates lead
└─ [ ] Dashboard shows new lead immediately (no delay)

Test Script:
  curl -X POST https://[your-internal-domain]/api/intake/lead \
    -H "x-intake-secret: ${INTAKE_WEBHOOK_SECRET}" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Business",
      "businessType": "e-commerce",
      "email": "test@example.com"
    }'
  
  Expected: 201 + lead row in dashboard
```

**Timeline:** 2-4 hours  
**Owner:** You  
**Blocker for:** First lead conversion

---

### B. End-to-End Client Lifecycle Test (CRITICAL)

**Goal:** Simulate full client journey from lead to delivery

```
Scenario: Convert fake "TechStartup Inc" through complete flow

1. [ ] Lead Creation (simulate form submission)
   └─ New lead appears in CRM
   
2. [ ] Qualification (manual)
   └─ Mark as "qualified" → creates Deal
   
3. [ ] Provisioning (CLI)
   └─ CLI generates site files
   └─ Stores output in provisioning_runs table
   
4. [ ] Deployment (manual or automated)
   └─ Deploy to Vercel/VPS
   └─ DNS configured
   └─ Mark site as "live"
   
5. [ ] Uptime Monitor Ping
   └─ Cron runs → pings deployed URL
   └─ Status recorded in uptime_status table
   └─ Dashboard shows "up" badge
   
6. [ ] Billing Entry
   └─ Create invoice for this client
   └─ Track payment due date
   
7. [ ] First Request
   └─ Client submits maintenance request
   └─ Appears in requests queue
   └─ Can be assigned and tracked
   
8. [ ] Reports
   └─ Generate analytics report
   └─ Send to client (export PDF)

If ANY step fails → document + fix before launch
```

**Timeline:** 4-6 hours (includes fixing bugs)  
**Owner:** You  
**Validation:** Can you repeat this 3 times without errors?

---

### C. Deployment Environment Lock (HIGH)

**Goal:** Ensure dev/staging/prod are isolated

```
Create .env matrix:

.env.local (development)
├─ NEXT_PUBLIC_SUPABASE_URL=http://localhost:5432
├─ SUPABASE_SERVICE_ROLE_KEY=[local-dev-key]
├─ INTAKE_WEBHOOK_SECRET=dev-secret-only-local
├─ NEXT_PUBLIC_USE_SEED_DATA=true
└─ DEBUG=true

.env.production (Vercel)
├─ NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
├─ SUPABASE_SERVICE_ROLE_KEY=[prod-key-from-vault]
├─ INTAKE_WEBHOOK_SECRET=[rotating-secret-prod]
├─ NEXT_PUBLIC_USE_SEED_DATA=false
└─ DEBUG=false

Validation:
  [ ] Build with `.env.production` does NOT connect to local DB
  [ ] Production API keys are never in `.env.local`
  [ ] Rotation plan documented (quarterly secret rotation)
```

**Timeline:** 30 minutes  
**Owner:** You  
**Critical for:** No data leakage between environments

---

### D. CLI → Dashboard Sync (HIGH)

**Goal:** Provisioning CLI writes completion status to DB

```
Current Flow (broken):
  CLI runs independently
  → Dashboard has no status

Fixed Flow:
  1. CLI invoked via dashboard (new button)
  2. Insert row: provisioning_runs (status=pending)
  3. CLI runs → generates files
  4. CLI updates row (status=success, output_url=...)
  5. Dashboard refreshes → shows "deployment complete"

Implementation:
  [ ] Add provisioning_runs table schema
  [ ] CLI accepts --client-id and --run-id args
  [ ] CLI writes completion to Supabase
  [ ] Dashboard polls provisioning_runs → shows status
  [ ] Error handling: if CLI fails → row status=error + logs
```

**Timeline:** 3-4 hours  
**Owner:** You  
**Blocker for:** Can't track provisioning status

---

### E. Backup System (HIGH)

**Goal:** Protect data before first client lives

```
Minimal Implementation (choose ONE):

Option 1: Local Backup Script (easiest)
  ├─ Script: daily_backup.sh
  ├─ Runs: nightly via cron
  ├─ Output: ~/backups/db_[date].sql
  ├─ Retention: last 30 days
  └─ Verification: monthly restore test

Option 2: S3-Compatible (better)
  ├─ Provider: Backblaze B2 or DigitalOcean Spaces
  ├─ Script: uploads daily dump
  ├─ Retention: 90 days
  └─ Cost: ~$5-10/month

Option 3: Supabase Backup (if available)
  ├─ Use Supabase's built-in backup feature
  ├─ Verify weekly
  └─ Restore to staging quarterly

Create Backup Checklist:
  [ ] Backup script created + tested
  [ ] First backup run completed
  [ ] Restore procedure documented
  [ ] Test restore on staging (monthly)
  [ ] Alert if backup fails (email)
```

**Timeline:** 1-2 hours  
**Owner:** You  
**Risk if missing:** Total data loss = business shutdown

---

### F. Logging & Monitoring (MEDIUM)

**Goal:** Visibility into system health and errors

```
Minimum Logging:
  [ ] All /api/* routes log: method, path, response code, latency
  [ ] Errors logged with stack trace
  [ ] Audit events logged: who, what, when
  [ ] Provisioning CLI logs written to file + DB

Implementation:
  ├─ Use pino or winston for structured logs
  ├─ Log to file in logs/ directory
  ├─ Rotate logs (daily, keep 14 days)
  └─ Optionally pipe to Sentry/Datadog (later)

Dashboard Addition:
  ├─ Simple error log viewer in admin
  ├─ Filter by date/severity
  └─ Show last 24 hours of events
```

**Timeline:** 2-3 hours  
**Owner:** You  
**Value:** Can debug production issues without guessing

---

### G. Network Security (MEDIUM)

**Goal:** Internal tools not accessible to public

```
Current Setup Validation:
  [ ] Admin dashboard NOT publicly routable (no public DNS)
  [ ] API keys NOT in git repository
  [ ] Secrets stored ONLY in .env files (gitignored)
  [ ] Database RLS policies enabled

Hardening (optional now, do later):
  - Restrict to private VPN (Tailscale)
  - Enable IP allowlist for internal routes
  - SSL certificates for internal HTTPS
  - Regular secret rotation (quarterly)
```

**Timeline:** 30 minutes  
**Owner:** You  
**Validation:** Public can't reach admin dashboard

---

## IV. Force Multiplier Tools (Sequenced Build)

### Phase 1: Sales Conversion (Week 1-2)

**High-ROI tools to close deals faster**

#### 1.1 Website Audit Generator (RECOMMENDED FIRST)

```
Purpose: Convert cold leads by showing pain points

Input:  URL (e.g., client.com)
Output: HTML report showing:
  - Lighthouse performance (0-100)
  - SEO issues (title, meta, headings)
  - UX problems (mobile, CTA, loading)
  - "Cost of issues" summary

Implementation:
  [ ] Create service: lib/audit-generator.ts
  ├─ Accept URL
  ├─ Fetch page + run Lighthouse API
  ├─ Parse performance/SEO/UX issues
  ├─ Generate HTML template with data
  └─ Return as blob (shareable link)
  
  [ ] Add API route: /api/audit/generate
  └─ POST { url: string } → returns shareable URL
  
  [ ] Add dashboard button
  └─ Input URL → generate → send to client
  
  Timeline: 4-6 hours
  ROI: Can DM "analyzed your site, costing you X" → warm lead
```

#### 1.2 Proposal Generator

```
Purpose: Sell faster by auto-generating proposals

Input: 
  - client_id
  - service_package (e.g., "landing", "ecom", "saas")
  - timeline preference

Output: 
  - Proposal document (HTML/PDF)
  - Shareable link or email
  - Pricing included

Implementation:
  [ ] Create templates: lib/proposal-templates/
  ├─ landing.md (5 pages)
  ├─ ecommerce.md (8 pages)
  └─ custom.md (generic)
  
  [ ] Create generator: lib/proposal-generator.ts
  ├─ Load template
  ├─ Replace: {{client_name}}, {{price}}, {{timeline}}
  ├─ Render to HTML/PDF
  └─ Return shareable URL
  
  [ ] Add API route: /api/proposal/generate
  [ ] Add dashboard form + preview
  
  Timeline: 3-4 hours
  ROI: Eliminates manual proposal writing
```

#### 1.3 Contract Generator

```
Purpose: Legal protection + speed

Input:
  - client_id
  - service_type
  - pricing
  - terms (scope, timeline, payment)

Output:
  - Contract (HTML/PDF)
  - Ready to sign (manual for now, e-sign later)

Implementation:
  [ ] Create template: lib/contract-template.md
  ├─ Client services agreement
  ├─ Payment terms
  ├─ Scope of work
  └─ Liability/warranty clauses
  
  [ ] Create generator: lib/contract-generator.ts
  [ ] Add API route: /api/contract/generate
  
  Timeline: 2-3 hours
  ROI: Legal protection + professional image
```

### Phase 2: Delivery Speed (Week 2-3)

#### 2.1 Deployment Checklist (CRITICAL)

```
Purpose: Prevent mistakes when deploying client sites

Checklist Items:
  □ Domain registered & pointed to hosting
  □ SSL certificate active
  □ Analytics installed (GA/custom)
  □ Primary CTA working
  □ Mobile responsive tested
  □ Email contact form working
  □ Social links correct
  □ Loading time < 3s
  □ No console errors
  □ SEO metadata correct

Implementation:
  [ ] Create table: deployment_checklists
  [ ] Add API: /api/checklist/create, /api/checklist/update
  [ ] Add dashboard checklist UI
  [ ] Store completion + timestamp
  [ ] Generate completion certificate
  
  Timeline: 3-4 hours
  ROI: Catch issues before client sees site
```

#### 2.2 Uptime Monitor (CRITICAL LATER)

```
Purpose: Catch site outages before clients notice

Implementation:
  [ ] Create Cron route: /api/cron/monitor-sites
  [ ] Store client URLs in database
  [ ] Every 5 minutes:
    ├─ Ping each URL
    ├─ Check response code (200-299 = up, else = down)
    ├─ Record status + timestamp
    └─ Alert if down > 5 minutes
  
  [ ] Dashboard shows:
    ├─ Client site status (green/red)
    ├─ Last checked time
    ├─ Uptime % (last 24h, 7d, 30d)
    └─ Alert log
  
  [ ] Notifications:
    └─ Toast alert in dashboard when site down
    └─ Optional: Slack webhook (later)
  
  Timeline: 2-3 hours
  ROI: Proactive support → client retention
```

#### 2.3 Onboarding Form

```
Purpose: Collect client info once, use everywhere

Collects:
  - Business name, type, industry
  - Logo upload
  - Brand colors (hex)
  - Services offered
  - Contact info
  - Existing website URL

Output:
  - Prefilled data for:
    ├─ Site provisioning
    ├─ Proposal templates
    ├─ Content generator
    └─ CRM records

Implementation:
  [ ] Create table: client_onboarding
  [ ] Add form: /admin/onboarding
  [ ] Store uploads + parsed data
  [ ] Link to client record
  
  Timeline: 2-3 hours
  ROI: Faster provisioning + better client data
```

### Phase 3: Operational Tools (Week 3+)

#### 3.1 Analytics Collector (MVP)

```
Purpose: Track client site usage without external services

Tracks:
  - Page views (basic)
  - CTA clicks
  - Form submissions

Implementation:
  [ ] Lightweight tracking pixel
  [ ] API route: /api/analytics/track
  [ ] Store in: analytics_events table
  [ ] Dashboard shows: page visits, CTA clicks, trends
  
  Timeline: 2-3 hours
  ROI: Own your data, know what converts
```

#### 3.2 Template Version Manager

```
Purpose: Track which template version each client uses

Problem:
  You update templates → old clients become outdated
  No way to know who needs updates

Solution:
  [ ] Tag each deployed client site with template version
  [ ] Flag if site is on outdated version
  [ ] Queue update task in requests
  [ ] Sell as maintenance service
  
  Timeline: 1-2 hours
  ROI: New service = new revenue
```

#### 3.3 Pricing Calculator Tool

```
Purpose: Internal tool to prevent underpricing

Calculates price based on:
  - # of pages
  - # of features
  - custom requests
  - timeline requirements

Output:
  - Recommended price
  - Confidence (high/low)

Timeline: 1 hour
ROI: Consistent pricing, better margins
```

---

## V. Immediate Action Plan (Next 72 Hours)

### Day 1: Lead Bridge + Environment Lock
```
Task 1: Wire landing page → internal lead intake
  [ ] Public site repo: add /api/lead route
  [ ] Route calls internal /api/intake/lead with secret
  [ ] Test with curl: should create lead
  Est. time: 2-3 hours

Task 2: Lock environment variables
  [ ] Create .env.production config
  [ ] Ensure dev/prod secrets isolated
  [ ] Verify build uses correct env
  Est. time: 30 min

Daily Goal: 3 hours → "Leads can flow in"
```

### Day 2: End-to-End Test
```
Task 1: Run full client lifecycle simulation
  [ ] Create fake lead "TechStartup Inc"
  [ ] Convert to client
  [ ] Provision site with CLI
  [ ] Deploy to Vercel
  [ ] Enable monitoring
  [ ] Track in billing
  Est. time: 4-6 hours

Daily Goal: 5 hours → "Full flow works, find bugs"
```

### Day 3: Risk Mitigation
```
Task 1: Backup system
  [ ] Create daily_backup.sh script
  [ ] Run first backup
  [ ] Test restore
  Est. time: 1-2 hours

Task 2: CLI → DB sync
  [ ] Add provisioning_runs table logging
  [ ] CLI updates status in DB
  [ ] Dashboard shows status
  Est. time: 2-3 hours

Task 3: Logging foundation
  [ ] Add basic request logging
  [ ] Create error log viewer
  Est. time: 1-2 hours

Daily Goal: 4-5 hours → "Data protected, debuggable"
```

---

## VI. Pre-Client Checklist (HARD GATE)

**DO NOT accept first client until ALL are checked:**

### Core System
- [ ] Lead intake bridge working (forms → DB)
- [ ] End-to-end client lifecycle tested (no failures)
- [ ] Backup system running (at least 3 backups done)
- [ ] Environment variables locked (dev/prod isolated)
- [ ] All smoke tests passing
- [ ] Production build passing
- [ ] CI/CD pipeline ready

### Operations
- [ ] Logging set up (can see errors)
- [ ] Uptime monitor working
- [ ] Deployment checklist procedure documented
- [ ] CLI → DB sync working
- [ ] Error handling tested (what happens when things break?)

### Security
- [ ] No secrets in git
- [ ] Database RLS enabled
- [ ] Intake endpoint rate-limited
- [ ] Auth middleware working
- [ ] INTAKE_WEBHOOK_SECRET rotatable

### Documentation
- [ ] Deployment runbook written
- [ ] Operational procedures documented
- [ ] Client onboarding sequence defined
- [ ] Troubleshooting guide started

### Team Readiness
- [ ] You can deploy manually without panic
- [ ] You can diagnose issues from logs
- [ ] Backup/restore procedure tested
- [ ] You've run through 2-3 fake client scenarios

---

## VII. Scaling Timeline

| Phase | Duration | Objective | Tools Added |
|-------|----------|-----------|-------------|
| **Current** | ~1 week | Operational readiness | Lead bridge, E2E test, backups, logging |
| **Phase 1** | Weeks 1-2 | Sales tools | Audit generator, proposal, contract |
| **Phase 2** | Weeks 2-3 | Delivery tools | Checklist, monitoring, onboarding |
| **Phase 3** | Weeks 3+ | Optimization | Analytics, versioning, pricing calc |

---

## VIII. Risk Assessment

### Highest Risk: Lead Bridge Failure
**Symptom:** Leads come in but don't appear in system  
**Prevention:** Test with real form submission before going live  
**Recovery:** Check: 1) Secret correct? 2) Endpoint accessible? 3) DB insert succeeding?

### High Risk: Silent Client Site Failures
**Symptom:** Client site is down but you don't know  
**Prevention:** Deploy uptime monitor immediately  
**Recovery:** Monitor logs, restore from backup

### High Risk: Data Loss
**Symptom:** Can't recover from outage  
**Prevention:** Backup system running before first client  
**Recovery:** Restore from backup (if exists)

### Medium Risk: Wrong Environment Secrets
**Symptom:** Production queries hit staging DB  
**Prevention:** Lock env variables, verify build  
**Recovery:** Immediate rollback + audit data

---

## IX. Definition of "Ready for Clients"

You are **NOT ready** if:
- [ ] You cannot explain lead → client → delivery → billing flow end-to-end
- [ ] You don't have a backup
- [ ] You can't reproduce a bug from logs
- [ ] You haven't tested provisioning CLI on real client scenario
- [ ] You're worried about something but haven't documented it

You **ARE ready** if:
- ✅ Lead bridge tested → leads appear in system
- ✅ Full client lifecycle simulated 3 times without critical errors
- ✅ Backup system running + tested restore
- ✅ Logging shows you what's happening
- ✅ Monitoring catches failures
- ✅ You've documented how to recover from every failure scenario

---

## X. Success Criteria for First 3 Clients

### Client 1: Validation
- Lead → qualified → provisioned → live → invoice created
- All steps traceable in dashboard
- Zero missed steps

### Client 2: Iteration
- Same flow but faster (learned from client 1)
- Checklist used → no deployment mistakes

### Client 3: Confidence
- Can onboard client without anxiety
- System handles the workload
- Cash flows in on time

**If all 3 succeed:** You have a replicable business process. Scale.

---

**Created:** April 27, 2026  
**Next Review:** May 4, 2026 (after first 3 clients or end of Week 1)
