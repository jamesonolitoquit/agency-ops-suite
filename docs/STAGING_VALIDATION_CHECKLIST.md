# Staging Validation Checklist

**Purpose**: Complete feature validation against staging Vercel deployment.  
**Status**: Pre-launch validation  
**Date**: May 11, 2026  

---

## 📋 Feature Scope (MVP)

Core features required for this project:

### 1. **Authentication & Authorization** (CRITICAL)
- [ ] Login page loads (no 500 errors)
- [ ] Email/password login works
- [ ] Admin allowlist enforcement (only whitelisted emails access dashboard)
- [ ] Session persistence (refresh token works)
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Admin vs operator role routing (if implemented)

### 2. **Lead Management** (CRITICAL)
- [ ] Lead intake form accessible at `/api/intake/lead`
- [ ] Form validation (email, company, etc.)
- [ ] Intake webhook secret validation
- [ ] Lead appears in `/leads` dashboard
- [ ] Lead status tracking (new, contacted, converted, lost)
- [ ] Lead details viewable

### 3. **Audit Generation** (CRITICAL)
- [ ] `/audit/new` page loads
- [ ] Audit form accepts valid URLs
- [ ] Audit generation API endpoint works (`/api/audit/generate`)
- [ ] Public audit report viewable via token (`/audit/report/[token]`)
- [ ] Audit results include: performance, accessibility, SEO, best practices scores
- [ ] Audit list shows in `/audit` dashboard

### 4. **Contracts & Signing** (CRITICAL)
- [ ] `/contract/new` page loads
- [ ] Contract generation API works (`/api/contract/generate`)
- [ ] Contract creation stores in DB
- [ ] Public contract signing page works (`/contracts/sign/[token]`)
- [ ] Contract signing generates signature with timestamp
- [ ] Signed contract marked as signed in DB
- [ ] Contract PDF generation works

### 5. **Proposals** (CORE)
- [ ] `/proposal/new` page loads
- [ ] Proposal generation from audit works
- [ ] Proposal list shows in `/proposal` dashboard
- [ ] Public proposal view works (`/proposal/report/[token]`)
- [ ] Proposal pricing calculations correct
- [ ] Status transitions (draft → sent → accepted/declined)

### 6. **Invoices & Billing** (CORE)
- [ ] `/billing` page loads
- [ ] Invoice creation works (`/api/invoices`)
- [ ] Invoice details page viewable (`/invoices/[id]`)
- [ ] Invoice PDF generation works
- [ ] Stripe checkout integration works (`/invoices/[id]/checkout`)
- [ ] Test payment acceptance

### 7. **Admin Functions** (SUPPORT)
- [ ] Admin webhook dashboard (`/admin/webhooks`) accessible
- [ ] Webhook logs visible
- [ ] System health endpoint works (`/api/health/provisioning`, `/api/health/schema`)
- [ ] Audit logs accessible (`/audit-logs`)
- [ ] Database backups configured (check `/api/admin/backup`)

### 8. **Client Portal** (SECONDARY)
- [ ] `/client/login` accessible
- [ ] Client account creation works
- [ ] Client dashboard loads (`/client/dashboard`)
- [ ] Client can view assets (`/client/assets`)
- [ ] Client can view invoices (`/client/invoices`)
- [ ] Client request submission works

### 9. **API Endpoints** (SUPPORT)
- [ ] `/api/health/provisioning` returns 200
- [ ] `/api/health/schema` returns 200
- [ ] Error handling returns proper status codes (400, 401, 403, 404, 500)
- [ ] Webhook validation (missing secret → 400, invalid secret → 401)

### 10. **Data Integrity** (CRITICAL)
- [ ] No console errors in browser
- [ ] All form submissions succeed without timeouts
- [ ] Database queries complete in <1s
- [ ] No memory leaks (check Network tab)
- [ ] No unhandled promise rejections

---

## 🚀 Test Execution Plan

### **Phase 1: Basic Connectivity** (5 min)
```bash
# Login page loads
curl -s https://<staging-url>/login | grep -c "<title>"

# Health check
curl -s https://<staging-url>/api/health/provisioning

# API baseline
curl -s https://<staging-url>/api/deployment-checklist
```

### **Phase 2: Authentication Flow** (10 min)
1. Navigate to `/login`
2. Try invalid credentials → expect 401 or login error
3. Try non-allowlisted email → expect rejection
4. Login with valid allowlisted email + password
5. Verify redirect to dashboard `/`
6. Verify session persists on page refresh
7. Logout and verify redirect to `/login`

### **Phase 3: Lead Intake** (10 min)
```bash
# Test lead intake (requires INTAKE_WEBHOOK_SECRET)
curl -X POST https://<staging-url>/api/intake/lead \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: <your-staging-secret>" \
  -d '{
    "email": "test@example.com",
    "company": "Test Corp",
    "phone": "555-1234",
    "projectDescription": "Test project"
  }'
```

### **Phase 4: Audit Generation** (15 min)
1. Navigate to `/audit/new`
2. Submit valid website URL (e.g., `https://example.com`)
3. Verify audit generation completes (scores appear)
4. Get public audit token from response
5. View public report at `/audit/report/[token]`
6. Verify scores visible to unauthenticated user

### **Phase 5: Contract & Invoice Flow** (20 min)
1. Navigate to `/contract/new`
2. Fill contract form, generate contract
3. Get public signing token
4. View contract at `/contracts/sign/[token]`
5. Sign contract (verify signature stored)
6. Create invoice for signed contract
7. Generate invoice PDF
8. Test Stripe TEST mode checkout

### **Phase 6: Data Persistence** (10 min)
1. Verify leads appear in `/leads` dashboard
2. Verify audits appear in `/audit` dashboard
3. Verify contracts appear in `/admin/contracts`
4. Verify invoices appear in `/billing`
5. Verify all data matches what was submitted

---

## ✅ Pass/Fail Criteria

**PASS** if:
- All critical features (Auth, Leads, Audits, Contracts, Invoices) work end-to-end
- No 500 errors in browser console
- All API endpoints respond with correct status codes
- Database transactions complete without timeouts
- Public report views accessible without auth

**FAIL** if:
- Any critical feature returns error or blank screen
- Database connection fails
- Auth flow broken
- API timeouts or returns 5xx
- Deployment config incomplete

---

## 📊 Results Template

```
STAGING VALIDATION RESULTS
=========================

Date: [DATE]
Staging URL: [URL]
Tester: [NAME]

FEATURE RESULTS:
1. Authentication: [PASS/FAIL] - Notes
2. Leads: [PASS/FAIL] - Notes
3. Audits: [PASS/FAIL] - Notes
4. Contracts: [PASS/FAIL] - Notes
5. Invoices: [PASS/FAIL] - Notes

OVERALL: [PASS/FAIL]

Issues Found:
- [Issue 1]
- [Issue 2]

Blockers for Production:
- [Blocker 1]
```

---

## Next Steps

1. Provide staging URL
2. Verify database is configured (Supabase project connected)
3. Verify secrets set (INTAKE_WEBHOOK_SECRET, etc.)
4. Execute test plan phases in order
5. Document results
6. Fix any issues found
7. Re-validate before production deployment
