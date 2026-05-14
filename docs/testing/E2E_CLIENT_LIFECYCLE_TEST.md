# End-to-End Client Lifecycle Test

**Status:** Day 2 of Operational Readiness  
**Goal:** Validate full client journey from lead to billing before accepting real clients  
**Time:** 4-6 hours (includes debugging)  
**Success Criteria:** Complete flow 3x with zero critical errors

---

## Why This Test Matters

This test simulates a complete client engagement:
1. Lead comes in (public form submission)
2. Convert lead to qualified client
3. Provision new site (CLI)
4. Deploy to hosting
5. Monitor for uptime
6. Create invoice
7. Client submits maintenance request
8. Generate report

If ANY step fails, you'll discover it here (not with a paying client).

---

## Scenario: "TechStartup Inc"

We'll use this fictional company throughout the test:

```
Company: TechStartup Inc
Business Type: SaaS
Contact: john@techstartup.example.com
Phone: 555-0123
Message: "Build us a landing page"
Service: 5-page landing + contact form
Timeline: 2 weeks
Expected Cost: $3,000
```

---

## Phase 1: Lead Capture (15 minutes)

### Step 1.1: Submit Lead via Form

Start your dev server:
```bash
npm run dev --workspace apps/admin-dashboard
```

Visit the test form:
```
http://localhost:3000/admin/test-lead-form
```

Submit:
```
Name: TechStartup Inc
Business Type: SaaS
Email: john@techstartup.example.com
Phone: 555-0123
Message: Build us a landing page
```

### Step 1.2: Verify Lead Appears

1. You should redirect to `/leads`
2. New lead should appear at the top
3. Status should be "new"
4. All fields should be populated

**If not working:**
- Check console for errors
- Verify INTAKE_WEBHOOK_SECRET is set
- Verify SUPABASE_URL and ANON_KEY are correct
- Check .env.local has no typos

**Checkpoint 1: ✅ Lead captured**

---

## Phase 2: Lead Qualification (10 minutes)

### Step 2.1: Convert Lead to Client

1. In dashboard, click on the TechStartup Inc lead
2. Click "Convert to Client"
3. Fill in:
   - Website URL: `techstartup-demo.example.com` (not real)
   - Service Type: `Landing Page`
   - Package: `5-page landing + contact`
4. Click "Create Client"

### Step 2.2: Create Deal

1. Navigate to "Deals" section
2. Click "New Deal"
3. Select Client: TechStartup Inc
4. Deal value: $3,000
5. Expected close: 2 weeks
6. Status: "In Progress"

**Checkpoint 2: ✅ Lead converted to client**

---

## Phase 3: Site Provisioning (30-45 minutes)

### Step 3.1: Provision New Site

In dashboard (or CLI), run provisioning:

```bash
# Method 1: Via CLI (manual)
npm run provision -- --client-id=techstartup-inc-demo

# Method 2: Via Dashboard (if implemented)
# Click "Provision" button on client page
```

**Expected output:**
```
Provisioning site for: TechStartup Inc
→ Creating site structure
→ Generating pages (home, about, services, blog, contact)
→ Creating contact form handler
→ Building CSS/styling
→ Output: /provisioned/techstartup-inc-demo/
```

### Step 3.2: Verify Generated Files

Check the provisioned files:
```bash
ls -la ~/provisioned/techstartup-inc-demo/
```

Should contain:
```
pages/
  index.html
  about.html
  services.html
  contact.html
styles/
  main.css
js/
  form-handler.js
```

### Step 3.3: Check Dashboard for Provisioning Run

If CLI writes to `provisioning_runs` table:
1. Go to "Provisioning" section in dashboard
2. Should show: "TechStartup Inc - Completed"
3. Status: "success"
4. Timestamp: recent

**If not yet implemented:**
- You can still continue
- Manual provisioning is acceptable for MVP

**Checkpoint 3: ✅ Site provisioned**

---

## Phase 4: Deployment to Hosting (20 minutes)

### Step 4.1: Deploy to Vercel (Recommended) or VPS

**Option A: Vercel (Easiest)**
```bash
# Connect your provisioned repo to Vercel
# Either: 
# 1. Push to GitHub and connect
# 2. Use Vercel CLI: vercel deploy ~/provisioned/techstartup-inc-demo/
```

**Option B: Manual / VPS**
```bash
# Copy files to hosting location
scp -r ~/provisioned/techstartup-inc-demo/* user@vps:/var/www/techstartup-inc-demo/
```

### Step 4.2: Configure Domain

1. Point DNS for `techstartup-demo.example.com` to your hosting
   - Vercel: Add custom domain in project settings
   - VPS: Update DNS A record to VPS IP

2. Wait for DNS propagation (~2-10 minutes)

3. Verify site is accessible:
```bash
curl https://techstartup-demo.example.com/
```

### Step 4.3: Mark as "Live" in Dashboard

1. Go to Client: TechStartup Inc
2. Update site status: "Active"
3. Set "Deploy Date": today
4. Save

**Checkpoint 4: ✅ Site deployed and live**

---

## Phase 5: Monitoring Setup (10 minutes)

### Step 5.1: Add to Uptime Monitor

1. In dashboard, go to "Monitoring"
2. Add site:
   - URL: `https://techstartup-demo.example.com/`
   - Name: TechStartup Inc
   - Alert threshold: Down > 5 minutes

### Step 5.2: Trigger Manual Ping

Run the monitor script:
```bash
npm run monitor -- --client-id=techstartup-inc-demo
```

Should see:
```
Checking: https://techstartup-demo.example.com/
Status: UP (200 OK in 245ms)
Recorded in uptime_status table
```

### Step 5.3: Verify in Dashboard

1. Go to "Client Health"
2. TechStartup Inc should show: "🟢 UP"
3. Last checked: just now
4. Uptime: 100% (new site)

**Checkpoint 5: ✅ Uptime monitoring active**

---

## Phase 6: Billing Setup (10 minutes)

### Step 6.1: Create Invoice

1. In dashboard, go to "Billing"
2. Click "New Invoice"
3. Select Client: TechStartup Inc
4. Date: today
5. Items:
   - Service: "5-page Landing Page"
   - Amount: $3,000
   - Description: "Professional landing page + contact form"
6. Payment Terms: Net 30
7. Save

### Step 6.2: Mark Invoice Status

- Status: "Draft" (until client approves)
- Track in "Awaiting Payment" section

**Checkpoint 6: ✅ Invoice created**

---

## Phase 7: Client Request / Maintenance (10 minutes)

### Step 7.1: Submit Maintenance Request

1. Go to "Requests" section
2. Create new request:
   - Client: TechStartup Inc
   - Type: "Content Update"
   - Priority: "Medium"
   - Description: "Change hero image on homepage"
   - Status: "New"

### Step 7.2: Assign to You

1. Click on request
2. Assign to: "You"
3. Status: "In Progress"
4. Add note: "Swapping image file in CDN"

### Step 7.3: Complete Request

1. Add note: "Hero image updated. Client should refresh browser cache."
2. Status: "Complete"
3. Timestamp: today

**Checkpoint 7: ✅ Request workflow complete**

---

## Phase 8: Report Generation (10 minutes)

### Step 8.1: Generate Performance Report

If audit generator is implemented:
```bash
npm run audit -- --url=https://techstartup-demo.example.com
```

Output should show:
```
Performance: 85/100
SEO: 92/100
UX: 88/100
Issues: 0 critical, 2 minor
```

### Step 8.2: Export Client Report

1. Go to "Reports" section
2. Select: TechStartup Inc, last 30 days
3. Export as: PDF
4. Save as: `techstartup-report-april-2026.pdf`

Should include:
- Traffic summary
- Request history
- Uptime statistics
- Performance metrics

**Checkpoint 8: ✅ Report generated**

---

## Summary: Full Journey Complete

If you reached here with all 8 checkpoints passing: ✅ **SYSTEM WORKS**

```
Lead In (form)
    ↓
Qualified to Client
    ↓
Site Provisioned
    ↓
Deployed Live
    ↓
Monitoring Active
    ↓
Invoice Created
    ↓
Request Completed
    ↓
Report Generated
```

---

## Document Findings

### Pass Results (Every step succeeded)

Create file: `E2E_TEST_RESULTS_PASS.md`

```markdown
# E2E Test Results: PASS ✅

Date: April 27, 2026
Scenario: TechStartup Inc (SaaS landing page)
Result: All 8 phases completed successfully

## Checkpoints
- ✅ Lead captured via form
- ✅ Lead converted to client
- ✅ Site provisioned
- ✅ Deployed to Vercel
- ✅ Monitoring active
- ✅ Invoice created
- ✅ Request completed
- ✅ Report generated

## Total Time: 2.5 hours
## Critical Errors: 0
## Minor Issues: 0

## Notes
All systems working as designed. Ready to proceed with real clients.
```

### Failure Results (Something broke)

For each failure, document:
1. What failed (which checkpoint)
2. Error message
3. Root cause
4. Fix applied
5. Re-test result

**Example failure log:**
```markdown
## FAILURE: Uptime Monitor Not Pinging

Checkpoint: 5
Error: "Cannot POST to monitor endpoint"

Root Cause:
- Monitor API endpoint not implemented yet
- Expected: /api/monitor/ping
- Got: 404

Fix Applied:
- Implement monitor endpoint in api/monitor/route.ts
- Add client URL validation

Re-test Result:
- ✅ Monitor now working
- Site correctly shows as UP
```

---

## Run 3x Until Perfect

**Run 1:** Document all failures
**Run 2:** Fix each failure, re-test
**Run 3:** Smooth flow, no errors

After Run 3 passes cleanly:
**You are client-ready** ✅

---

## If Behind Schedule

### Critical Path (Minimum to Pass)
- ✅ Lead capture (Phase 1)
- ✅ Client creation (Phase 2)
- ✅ Deployment (Phase 4)
- ✅ Invoice (Phase 6)

Skip Phase 3, 5, 7, 8 for now (add later)

### Still Works If:
- Provisioning is manual (no automation)
- Monitoring is manual (no cron)
- Reports are generated manually

---

## Success Criteria

**System is ready for first real client when:**

1. ✅ Lead→Client workflow works
2. ✅ Can deploy a site end-to-end
3. ✅ Can create invoice and track billing
4. ✅ Can handle a client request
5. ✅ Ran full flow 3 times, zero critical errors
6. ✅ Know exactly what to do if something fails

---

**Timeline:** Day 2 of Week 1  
**Next Steps:** If Pass → Backup system (Day 3)  
**Next Steps:** If Fail → Fix failures → Re-test
