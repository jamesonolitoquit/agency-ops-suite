# 🧱 IMPLEMENTATION CHECKLIST - MODULE BY MODULE

**Timeline:** 2-3 days to full implementation

---

## STEP 0: SETUP (Before anything else)

### 0.1 Apply Supabase Schema

- [ ] Go to Supabase SQL Editor (https://supabase.com/dashboard)
- [ ] Copy entire content from `docs/SUPABASE_MIGRATIONS.sql`
- [ ] Run it in SQL Editor (all at once or in sections if needed)
- [ ] Verify all 9 tables exist:
  - [ ] leads
  - [ ] clients
  - [ ] provisioning_runs
  - [ ] deployment_checklists
  - [ ] billing
  - [ ] client_requests
  - [ ] reports
  - [ ] backup_logs
  - [ ] api_logs

### 0.2 Install/Update Dependencies

```bash
npm install @supabase/supabase-js
```

### 0.3 Verify Environment Variables

In `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://eavpknxospplscdrnenz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

---

## STEP 1: MODULE 1 - LEAD INTAKE + CRM

### Goal
Replace in-memory lead store with real Supabase data. Add timestamps.

### Tasks

**1.1 Update `/api/test-leads` endpoint**

- [ ] Replace mock data with `supabase.from('leads').select('*')`
- [ ] Add GET: fetch all leads
- [ ] Add POST: create lead (validate: name, email or phone required)
- [ ] Add status tracking (new/contacted/replied/closed/lost)
- [ ] Add error handling

**Code Pattern:**
```typescript
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}
```

**1.2 Update dashboard Leads page (`app/leads/page.tsx`)**

- [ ] Page now fetches from real `/api/test-leads`
- [ ] Add "Mark as Contacted" button → updates `contacted_at`
- [ ] Add "Convert to Client" button → triggers conversion flow
- [ ] Already has search/filter working ✅

**1.3 Test Flow**

- [ ] Submit lead via API
- [ ] Lead appears in dashboard
- [ ] Mark as contacted → `contacted_at` updates
- [ ] Convert to client → lead.status becomes "closed", client created

---

## STEP 2: MODULE 2 - CLIENT SYSTEM

### Goal
Replace in-memory client store. Add required fields: `ready_for_deploy`, `live_url`.

### Tasks

**2.1 Update `/api/test-clients` endpoint**

- [ ] Replace mock data with Supabase `clients` table
- [ ] Add GET: fetch all clients
- [ ] Add POST: create client
- [ ] Add PUT: update client (including ready_for_deploy toggle)
- [ ] SAFEGUARD: Only allow UPDATE if all required fields present

**2.2 Update Clients dashboard page (`app/clients/page.tsx`)**

- [ ] Fetch from real `/api/test-clients`
- [ ] Add "Mark Ready for Deploy" button → toggles `ready_for_deploy`
- [ ] Show `live_url` when deployment complete
- [ ] Search/filter working ✅

**2.3 Create Quick Setup Form (Optional but Helpful)**

- [ ] Simple modal to fill in: domain, plan, monthly_fee
- [ ] Create client in DB
- [ ] Redirect to client detail page

---

## STEP 3: MODULE 3 + 4 - PROVISIONING + DEPLOYMENT CHECKLIST

### Goal
Build the safeguard system that prevents broken deployments.

### Tasks

**3.1 Create `/api/provisioning/validate` endpoint**

- [ ] Check: client exists
- [ ] Check: `ready_for_deploy = true` (BLOCKER)
- [ ] Check: domain is not empty (BLOCKER)
- [ ] Return: errors if any checks fail

**Code:**
```typescript
if (!client.ready_for_deploy) {
  return NextResponse.json(
    { error: 'Client must be marked ready for deploy' },
    { status: 400 }
  );
}
```

**3.2 Update `/api/test-provisioning` endpoint**

- [ ] Call validation first
- [ ] Simulate deployment (or wire to real if you have it)
- [ ] Record `provisioning_run` in DB
- [ ] Try HTTP GET to deployed URL
- [ ] Record `http_check_passed` (SAFEGUARD)
- [ ] If fails: log error and mark as failed

**3.3 Create `/api/checklist` endpoint**

- [ ] GET: fetch checklist for client
- [ ] POST: mark individual checklist item complete
  - [ ] domain_connected
  - [ ] ssl_active
  - [ ] cta_works
  - [ ] mobile_responsive
  - [ ] seo_meta_tags

**3.4 Create Deployment Checklist Dashboard Page**

NEW FILE: `app/deployment-checklist/page.tsx`

- [ ] Per-client checklist view
- [ ] Checkboxes for each item
- [ ] Progress bar (% complete)
- [ ] BLOCKER: Prevent marking "deployment complete" until checklist 100%

---

## STEP 4: MODULE 5 - BILLING

### Goal
Track payments and flag overdue clients. Add `last_paid_at` and `next_due_date`.

### Tasks

**4.1 Create `/api/billing` endpoints**

- [ ] GET: fetch billing records
- [ ] POST: create billing entry
- [ ] PUT: mark as paid → auto-calculate `next_due_date`

**4.2 Add Overdue Detection**

- [ ] GET `/api/billing/overdue`:
  - [ ] Returns all unpaid invoices past `due_date`
  - [ ] Includes client name + contact info (for follow-up)

**4.3 Update Billing Dashboard Page (`app/billing/page.tsx`)**

- [ ] Already has status filtering ✅
- [ ] Add "Mark Paid" button → calls PUT endpoint
- [ ] Highlight overdue in RED
- [ ] Show `next_due_date` after marking paid

---

## STEP 5: MODULE 6 - REQUEST QUEUE

### Goal
Track client requests and prevent scope creep with limits.

### Tasks

**5.1 Create `/api/requests` endpoints**

- [ ] GET: fetch requests for client
- [ ] POST: create request
- [ ] PUT: update status (pending → in_progress → done)

**5.2 Add Limit Checking**

- [ ] New function: `getRequestsCount(clientId, monthsBack=1)`
- [ ] If > 5 requests in month → show warning

**Code:**
```typescript
const count = await getRequestsCount(clientId);
if (count > 5) {
  showWarning(`Client has ${count} requests this month`);
}
```

**5.3 Update Requests Dashboard (`app/requests/page.tsx`)**

- [ ] Already has filters ✅
- [ ] Add "Create Request" form
- [ ] Add limit warning badge

---

## STEP 6: MODULE 7 - REPORTING

### Goal
Simple reporting that shows what was delivered.

### Tasks

**6.1 Create `/api/reports` endpoints**

- [ ] GET: fetch reports
- [ ] POST: create report
  - [ ] Auto-populate:
    - [ ] `updates_count` = requests completed this month
    - [ ] `requests_completed` count
    - [ ] `billing_status` (paid/pending/overdue)

**6.2 Wire Reports Page (`app/reports/page.tsx`)**

- [ ] Click "Generate Report"
- [ ] Creates report in DB
- [ ] Download as JSON/CSV ✅ (already working)

---

## STEP 7: MODULE 8 - BACKUP SYSTEM

### Goal
Add logging so we can track backup success/failure.

### Tasks

**7.1 Update Backup Script (`scripts/backup.js`)**

- [ ] After backup completes:
  - [ ] Check if file exists (fs.exists)
  - [ ] Call `supabase.from('backup_logs').insert()`
  - [ ] Log status, file_path, file_exists

**Code:**
```typescript
const { error } = await supabase
  .from('backup_logs')
  .insert([
    {
      status: fileExists ? 'success' : 'failed',
      file_path: filePath,
      file_exists: fileExists,
      error_message: fileExists ? null : 'File not created'
    }
  ]);
```

**7.2 Update `/api/admin/backup` endpoint**

- [ ] After backup: create backup_log entry
- [ ] Return: `{ ok: true, file: fileName, logged: true }`

---

## STEP 8: MODULE 9 - LOGGING

### Goal
This is already working via `src/lib/server-logger.ts` ✅

- [ ] No changes needed

---

## VALIDATION: END-TO-END FLOW TEST

Run this exact flow with REAL data (not test):

```
1. [ ] Submit lead from /submit-lead
2. [ ] Appears in /leads dashboard
3. [ ] Mark as contacted → contacted_at updates
4. [ ] Convert to client → client created
5. [ ] Edit client info + mark ready_for_deploy
6. [ ] Run provisioning → deployment_checklist created
7. [ ] Complete checklist items
8. [ ] Create billing entry
9. [ ] Add client request
10. [ ] Generate report
11. [ ] Mark invoice as paid → next_due_date auto-calculated
12. [ ] Backup system logs successfully
```

If ANY step fails → debug and fix

---

## SAFEGUARDS CHECKLIST (MUST HAVE)

- [ ] Prevent deploy if `ready_for_deploy = false`
- [ ] Prevent deploy if `http_check_passed = false`
- [ ] Warn if requests > 5/month
- [ ] Highlight overdue billing in red
- [ ] Validate domain/content before deploy
- [ ] Log all errors to backup_logs table

---

## FINAL BUILD TEST

```bash
npm run build  # Must be 0 errors
npm run test:smoke  # Must be 7/7 passing
```

If both pass → **READY FOR REAL CLIENTS**

---

## Timeline Estimate

| Step | Effort | Days |
|------|--------|------|
| 0: Setup | 30min | 0.2 |
| 1: Leads | 1h | 0.3 |
| 2: Clients | 1h | 0.3 |
| 3: Provisioning + Checklist | 2h | 0.5 |
| 4: Billing | 1h | 0.3 |
| 5: Requests | 1h | 0.3 |
| 6: Reporting | 1h | 0.3 |
| 7: Backup Logging | 30min | 0.2 |
| 8: Validation | 2h | 0.5 |
| **TOTAL** | **~10 hours** | **~3 days** |

**Realistic timeline with testing:** **Apr 28 - Apr 30**

---

## Success Criteria

- ✅ All tables created in Supabase
- ✅ E2E flow works with REAL data (not in-memory)
- ✅ All safeguards in place
- ✅ Build clean
- ✅ Tests passing
- ✅ Ready to acquire first real client

---

**START HERE:** Step 0.1 - Apply Supabase schema
