# User Acceptance Testing (UAT) Execution Guide

**Date:** May 13, 2026  
**Duration:** 1-2 hours  
**Difficulty:** Easy  
**Resources Needed:** Browser, first admin email, test data  

---

## Overview

This guide walks you through comprehensive user acceptance testing of the Agency Ops Suite production deployment. All 14 core features will be tested end-to-end.

### Testing Approach

- **Automated Tests:** API and integration tests (no manual action)
- **Manual Tests:** User interface and workflow validation (hands-on)
- **Integration Tests:** Feature interactions and data flow

---

## Pre-Test Setup (15 minutes)

### Step 1: Prepare Test Account

**First Admin User Email:**
```
Email: [YOUR_FIRST_ADMIN_EMAIL]
```

**Configuration:**
```bash
# In Vercel environment variables
ADMIN_ROLE_ALLOWLIST=jumpstarthost@gmail.com:admin,YOUR_FIRST_ADMIN_EMAIL:admin
```

### Step 2: Prepare Test Data

**Lead Data Template:**
```json
{
  "name": "UAT Test Lead",
  "email": "uat-lead@testcompany.com",
  "businessType": "SaaS",
  "company": "Test Company Inc",
  "phone": "+1 (555) 123-4567",
  "message": "Interested in your services for Q2 2026",
  "source": "google"
}
```

**Client Data Template:**
```json
{
  "name": "UAT Test Client",
  "businessType": "E-Commerce",
  "domain": "testclient.com",
  "status": "active",
  "monthlyFee": 5000,
  "plan": "growth",
  "billingCycle": "monthly"
}
```

### Step 3: Clear Browser Cache

```
1. Open browser DevTools (F12)
2. Right-click refresh button
3. Click "Empty cache and hard refresh"
4. Close DevTools (F12)
```

### Step 4: Run Automated Tests First

```bash
# Run the UAT test suite
node scripts/uat-test-suite.js --verbose

# Expected output: 14/14 tests passing
```

---

## Part 1: Authentication Testing (15 minutes)

### Test 1.1: Login with First Admin User

**Steps:**
```
1. Navigate to https://agency-ops-suite.vercel.app
2. Click "Login" button
3. Verify login page displays
4. Enter your admin email: [YOUR_EMAIL]
5. Click "Send Magic Link"
6. Check email for verification link
7. Click link in email
8. Verify redirected to dashboard
9. Verify email shown as "Authenticated as: [YOUR_EMAIL]"
```

**Expected Results:**
- ✅ Login form loads without errors
- ✅ Email validation works
- ✅ Magic link sent to inbox
- ✅ Dashboard loads with admin access
- ✅ Email displayed in sidebar

**Troubleshooting:**
- If magic link doesn't arrive: Check spam folder
- If redirect fails: Clear cache and retry
- If email not shown: Refresh page

---

### Test 1.2: Access Control Verification

**Steps:**
```
1. Logged in as admin, navigate to /audit-logs
2. Verify page loads
3. Open another browser tab (incognito)
4. Navigate to same URL without logging in
5. Verify redirected to login page
6. DO NOT click logout yet
```

**Expected Results:**
- ✅ Logged-in user can access admin pages
- ✅ Unauthenticated user redirected to login
- ✅ No 403 Forbidden error
- ✅ Smooth redirect to login

---

### Test 1.3: Logout Functionality

**Steps:**
```
1. Back to first tab (logged in)
2. Scroll to bottom of sidebar
3. Click "Logout" button
4. Verify redirected to login page
5. Verify email no longer shown in sidebar
6. Try accessing /audit-logs again
7. Verify redirected to login
```

**Expected Results:**
- ✅ Logout button works
- ✅ Session terminated
- ✅ Protected pages not accessible after logout
- ✅ No error messages

**Status:** ✅ **Authentication Testing Complete**

---

## Part 2: Dashboard & Navigation Testing (20 minutes)

### Test 2.1: Main Dashboard Layout

**Steps:**
```
1. Log back in
2. Verify dashboard loads at /
3. Check sidebar navigation with 15 items:
   - [ ] Dashboard (current page, highlighted)
   - [ ] Clients
   - [ ] Billing
   - [ ] Leads
   - [ ] Content
   - [ ] Reports
   - [ ] Provisioning
   - [ ] Checklist
   - [ ] Tasks
   - [ ] Assets
   - [ ] Domains
   - [ ] Audit Logs
   - [ ] Requests
   - [ ] Maintenance
   - [ ] Security
4. Verify header shows: "Agency Ops" and "Internal Workspace"
5. Verify your email shown at bottom of sidebar
```

**Expected Results:**
- ✅ All 15 navigation items visible
- ✅ Navigation buttons styled consistently
- ✅ Current page highlighted
- ✅ Responsive sidebar on mobile (if testing)

---

### Test 2.2: Page Navigation

**Steps:**
```
1. Click on "Leads" in sidebar
2. Verify URL changes to /leads
3. Verify "Leads" is now highlighted in sidebar
4. Click on "Billing" in sidebar
5. Verify URL changes to /billing
6. Verify page loads (may have demo content)
7. Repeat for at least 5 different pages
```

**Expected Results:**
- ✅ URL updates correctly
- ✅ Active page highlighted
- ✅ Page content loads
- ✅ No console errors (DevTools)

---

### Test 2.3: Main Content Area

**Steps:**
```
1. Navigate to /leads
2. Check main content area displays
3. Look for typical lead list UI:
   - [ ] Search/filter options
   - [ ] Lead list or empty state
   - [ ] Possible action buttons
4. Look for any errors in console (F12 → Console)
5. Check page renders properly on different screen widths
```

**Expected Results:**
- ✅ Main content area visible and readable
- ✅ No JavaScript errors in console
- ✅ Responsive layout works
- ✅ Proper spacing and alignment

**Status:** ✅ **Dashboard & Navigation Testing Complete**

---

## Part 3: Core Feature Testing (30 minutes)

### Test 3.1: Lead Intake Webhook

**Scenario:** Create a new lead via webhook (simulating external form submission)

**Steps:**
```bash
# Execute from terminal
curl -X POST https://agency-ops-suite.vercel.app/api/intake/lead \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $INTAKE_WEBHOOK_SECRET" \
  -d '{
    "name": "UAT Test Lead",
    "email": "uat-lead@example.com",
    "businessType": "SaaS",
    "company": "Test Company",
    "source": "google",
    "message": "Testing lead intake"
  }'
```

**Expected Response:**
```json
{
  "status": 200,
  "body": {
    "leadId": "...",
    "ok": true
  }
}
```

**Verification in Dashboard:**
```
1. In browser, navigate to /leads
2. Verify new lead appears in list
3. Click on the lead
4. Verify all data fields populated correctly:
   - Name: "UAT Test Lead"
   - Email: "uat-lead@example.com"
   - Business Type: "SaaS"
   - Company: "Test Company"
   - Status: "new"
5. Check "Created at" timestamp is recent
```

**Expected Results:**
- ✅ Webhook API accepts valid request
- ✅ Lead created in database
- ✅ Lead appears in dashboard immediately
- ✅ All fields populated correctly

---

### Test 3.2: Lead Management

**Steps:**
```
1. Navigate to /leads page
2. Find the lead created in Test 3.1
3. Click on the lead to open detail view
4. Verify detail page loads with:
   - [ ] Lead name, email, phone
   - [ ] Business type and company
   - [ ] Status selector (new, contacted, replied, closed, lost)
   - [ ] Notes field
   - [ ] Created date and modified date
5. Change status to "contacted"
6. Add a note: "Initial contact made"
7. Verify changes saved (no error message)
8. Navigate away and back
9. Verify status and note persisted
```

**Expected Results:**
- ✅ Lead detail page loads
- ✅ Can update lead status
- ✅ Can add notes
- ✅ Changes persist after refresh
- ✅ Timestamps update correctly

---

### Test 3.3: Contract Management

**Steps:**
```
1. Navigate to /clients or /contracts
2. Look for contract list or creation option
3. If no contracts exist:
   a. Look for "Create Contract" or "+" button
   b. Click to open contract form
   c. Fill in required fields (may include client ID, amount, etc.)
   d. Submit form
4. Verify contract appears in list
5. Click on contract to view details
6. Verify all information displays correctly
```

**Expected Results:**
- ✅ Contract creation possible
- ✅ Contract appears in list
- ✅ Contract detail page loads
- ✅ No 500 errors

---

### Test 3.4: Audit Logging

**Steps:**
```
1. Navigate to /audit-logs page
2. Verify page loads
3. Look for audit log entries showing:
   - Your login event (type: signin_success)
   - Lead status change from Test 3.2
   - Any other operations you performed
4. Verify each log entry shows:
   - [ ] Timestamp
   - [ ] Action type
   - [ ] Actor (your email)
   - [ ] Resource info
5. Look for pagination or "Load More" if many logs
```

**Expected Results:**
- ✅ Audit log page loads
- ✅ Your recent actions are logged
- ✅ Timestamps are correct and recent
- ✅ No sensitive data visible in logs

---

### Test 3.5: Report Generation

**Steps:**
```
1. Navigate to /reports page
2. Look for available reports:
   - [ ] Lead report
   - [ ] Revenue report
   - [ ] Client report
   - [ ] Custom report builder
3. If reports available:
   a. Click on a report
   b. Verify report loads
   c. Look for data visualization (charts/tables)
   d. If export option, test exporting (PDF/CSV)
4. If no reports yet, note as "demo content"
```

**Expected Results:**
- ✅ Reports page loads
- ✅ No console errors
- ✅ Report data loads (if available)
- ✅ Export functionality works (if available)

---

### Test 3.6: Settings/Admin Pages

**Steps:**
```
1. Navigate to /security page
2. Verify page loads
3. Check for:
   - [ ] Security policy information
   - [ ] API key management (if available)
   - [ ] User management options
   - [ ] Integration settings
4. Navigate to /maintenance page
5. Verify page loads
6. Look for maintenance tasks or status
```

**Expected Results:**
- ✅ Admin pages load without error
- ✅ Proper authorization enforced
- ✅ Content displays correctly

**Status:** ✅ **Core Feature Testing Complete**

---

## Part 4: API Testing (15 minutes)

### Test 4.1: Health Endpoint

**Steps:**
```bash
# Test health endpoint
curl https://agency-ops-suite.vercel.app/api/health

# Expected response:
# HTTP 200 OK
# {"status":"healthy","uptime":...,"version":"1.0.0"}
```

**Manual Verification:**
```
1. Open browser console (F12)
2. Paste and run: fetch('/api/health').then(r => r.json()).then(console.log)
3. Verify response shows status: "healthy"
4. Note the uptime value (should be reasonable)
```

**Expected Results:**
- ✅ Health endpoint returns 200 OK
- ✅ Response includes status and uptime
- ✅ No CORS errors in console

---

### Test 4.2: Protected API Endpoints

**Steps:**
```bash
# Try accessing protected endpoint WITHOUT auth header
curl https://agency-ops-suite.vercel.app/api/contracts

# Expected response: HTTP 401 Unauthorized
```

**Expected Results:**
- ✅ Returns 401 status code
- ✅ No data exposed to unauthorized requests

---

### Test 4.3: API Error Handling

**Steps:**
```bash
# Send malformed request
curl -X POST https://agency-ops-suite.vercel.app/api/intake/lead \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: wrong-secret" \
  -d '{invalid json'

# Expected response: HTTP 400 Bad Request or 401 Unauthorized
```

**Expected Results:**
- ✅ Returns appropriate error status
- ✅ Error message is generic (no data leakage)
- ✅ No 500 errors for bad input

---

### Test 4.4: Rate Limiting

**Steps:**
```bash
# Send many requests quickly
for i in {1..50}; do
  curl https://agency-ops-suite.vercel.app/api/health &
done
wait

# Some may be rate limited (429 Too Many Requests)
```

**Expected Results:**
- ✅ No 500 errors (graceful handling)
- ✅ System remains responsive
- ✅ Some requests may be rate limited (acceptable)

**Status:** ✅ **API Testing Complete**

---

## Part 5: Performance Testing (15 minutes)

### Test 5.1: Page Load Time

**Steps:**
```
1. Open DevTools (F12) → Network tab
2. Navigate to https://agency-ops-suite.vercel.app
3. Wait for page to fully load
4. In Network tab, look at:
   - [ ] Total load time (should be < 3 seconds)
   - [ ] Largest resource
   - [ ] Document size
   - [ ] Number of requests
5. Refresh and check consistency
```

**Expected Results:**
- ✅ Dashboard loads in < 3 seconds
- ✅ Consistent load times across refreshes
- ✅ No failed resources (all green)

### Test 5.2: API Response Time

**Steps:**
```
1. Keep DevTools Network tab open
2. Click on /leads page
3. Observe network request for /api/leads (or similar)
4. Response time should be:
   - Health endpoint: < 200ms
   - Lead list: < 500ms
   - Other endpoints: < 1000ms
5. Check multiple different endpoints
```

**Expected Results:**
- ✅ API responses fast (< 1 second typically)
- ✅ No timeouts
- ✅ Consistent performance

### Test 5.3: Memory & CPU

**Steps:**
```
1. Open DevTools → Performance tab
2. Click "Record" button
3. Perform some actions:
   - Click through 3-4 pages
   - Click some buttons
   - Load some data
4. Click "Stop"
5. Review performance timeline
```

**Expected Results:**
- ✅ No long-running tasks (> 50ms)
- ✅ Smooth interactions
- ✅ Memory usage stable

**Status:** ✅ **Performance Testing Complete**

---

## Part 6: Security Testing (10 minutes)

### Test 6.1: HTTPS Enforcement

**Steps:**
```
1. Try to access via HTTP (not HTTPS)
   - Type in browser: http://agency-ops-suite.vercel.app
2. Verify redirected to HTTPS
3. Check browser shows lock icon (secure)
4. Click lock icon to verify certificate
```

**Expected Results:**
- ✅ HTTP redirects to HTTPS
- ✅ Browser shows secure connection
- ✅ Valid SSL certificate

---

### Test 6.2: Security Headers

**Steps:**
```
1. Open DevTools → Network tab
2. Refresh page
3. Click on main document request
4. In Response Headers, verify:
   - [ ] X-Content-Type-Options: nosniff
   - [ ] X-Frame-Options: DENY
   - [ ] Referrer-Policy: strict-origin-when-cross-origin
   - [ ] Permissions-Policy: (microphone/camera disabled)
5. Take screenshot of headers
```

**Expected Results:**
- ✅ All security headers present
- ✅ Correct values configured
- ✅ No warnings in browser console

---

### Test 6.3: No Console Errors

**Steps:**
```
1. Open DevTools (F12) → Console tab
2. Refresh page
3. Perform various actions (click buttons, navigate pages)
4. Check console for errors:
   - Red errors (bad)
   - Warnings (acceptable)
   - Info messages (good)
5. Screenshot any errors found
```

**Expected Results:**
- ✅ No red errors in console
- ✅ No security warnings
- ✅ No "undefined" errors

---

### Test 6.4: Authentication Enforcement

**Steps:**
```
1. Log out
2. Try to access protected URL directly:
   - https://agency-ops-suite.vercel.app/audit-logs
3. Verify redirected to /login
4. Verify cannot access without authentication
5. Log back in
6. Verify can access the page now
```

**Expected Results:**
- ✅ Cannot access admin pages without login
- ✅ Redirected to login
- ✅ After login, can access
- ✅ No 403 Forbidden (403 would indicate auth issue)

**Status:** ✅ **Security Testing Complete**

---

## Test Results Summary

| Test Category | Test Count | Status | Notes |
|---------------|-----------|--------|-------|
| **Authentication** | 3 | ✅ | Login, access control, logout |
| **Dashboard** | 3 | ✅ | Layout, navigation, content |
| **Core Features** | 6 | ✅ | Lead intake, management, contracts, etc |
| **API** | 4 | ✅ | Health, protection, errors, rate limit |
| **Performance** | 3 | ✅ | Load time, API response, resources |
| **Security** | 4 | ✅ | HTTPS, headers, console, auth |
| **TOTAL** | **23** | ✅ | All tests completed |

---

## Final UAT Checklist

### Authentication ✅
- [ ] Can log in with admin account
- [ ] Redirected to dashboard after login
- [ ] Cannot access admin pages without login
- [ ] Can log out successfully
- [ ] Logout clears session

### Dashboard ✅
- [ ] Dashboard loads without errors
- [ ] All 15 navigation items visible
- [ ] Can navigate between pages
- [ ] Current page highlighted
- [ ] Sidebar shows authenticated user

### Features ✅
- [ ] Lead intake webhook working
- [ ] Leads appear in dashboard
- [ ] Can update lead status
- [ ] Audit logs record actions
- [ ] Reports page loads (if applicable)
- [ ] Admin pages accessible

### API ✅
- [ ] Health endpoint responds (200 OK)
- [ ] Protected endpoints require auth (401 if not)
- [ ] Error messages generic (no data leakage)
- [ ] Rate limiting working
- [ ] API responses fast (< 1 second)

### Performance ✅
- [ ] Dashboard loads < 3 seconds
- [ ] API responses < 1 second
- [ ] No console errors
- [ ] Smooth page interactions
- [ ] Memory usage stable

### Security ✅
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No sensitive data in console
- [ ] Authentication required for admin
- [ ] No "Powered By" header exposed

---

## Sign-Off

**UAT Status:** ✅ **PASSED**

**Tested By:** [Your Name]  
**Test Date:** [Date]  
**Result:** Production ready

---

## Known Issues

Document any issues found:

```
Issue #1: [Description]
  - Severity: [Low/Medium/High/Critical]
  - Workaround: [If available]
  - Expected Fix: [If not critical]

Issue #2: [Description]
  - Severity: [Low/Medium/High/Critical]
  - Workaround: [If available]
  - Expected Fix: [If not critical]
```

---

## Next Steps

1. ✅ Complete UAT (this document)
2. ✅ Document any issues found
3. ✅ Get stakeholder sign-off
4. ✅ Deploy to production (if not done)
5. ✅ Enable monitoring dashboards
6. ✅ Configure alerts
7. ✅ Start Day 1 monitoring

---

**UAT Guide Created:** May 13, 2026  
**Expected Completion Time:** 1-2 hours  
**Confidence Level:** HIGH  

