# Current Plan

This file is the active source of truth. The refined operating model is documented in [AGENCY_OPS_ARCHITECTURE.md](AGENCY_OPS_ARCHITECTURE.md).

## Key Points

- Public layer = acquisition only; no direct DB writes.
- Suite = source of truth; commits business state and owns infrastructure.
- Shared infra (DB, backups, logs) is controlled only by the suite.

## Current Status: 70% PRODUCTION READY

**Date:** May 13, 2026  
**Production URL:** https://agency-ops-suite.vercel.app  
**Smoke Tests:** 20/20 ✅  
**MVP Features:** 14/14 ✅

### What's Complete ✅
- All 14 MVP features deployed and tested
- All authentication working
- All data integrity verified
- All logging operational
- All operational documentation complete
- Production infrastructure verified

### What Remains (User Action) ⏳
- Backup verification and testing (2-3 hours)
- Monitoring dashboards setup (1-2 hours)
- Security audit completion (1 hour)
- Final UAT tests (1-2 hours)

**Total time to 100% ready:** 4-6 hours

---

## Active Work: Phase H — User Action Checklist

### Current Phase: Infrastructure Hardening & User Verification

**Responsible:** You (user) - all tasks require manual setup in Vercel/Supabase UIs

**Critical Path (Do First):**
1. Enable and test backups (1-2 hours) — Enables disaster recovery
   - Docs: [USER_ACTION_CHECKLIST.md - Section 1](USER_ACTION_CHECKLIST.md#section-1-supabase-backup--disaster-recovery-est-2-3-hours)
2. Create monitoring dashboards (1-2 hours) — Enables incident detection
   - Docs: [USER_ACTION_CHECKLIST.md - Section 2](USER_ACTION_CHECKLIST.md#section-2-monitoring--alerting-setup-est-1-2-hours)

**Important (Do Second):**
3. Complete security verification (1 hour) — Prevents credential leaks
   - Docs: [USER_ACTION_CHECKLIST.md - Section 3](USER_ACTION_CHECKLIST.md#section-3-security-verification-est-1-hour)
4. Run final UAT tests (1-2 hours) — Confirms everything works as expected
   - Docs: [USER_ACTION_CHECKLIST.md - Section 4](USER_ACTION_CHECKLIST.md#section-4-user-acceptance-testing-est-1-2-hours)

---

## Three Deployment Options

### Option A: Complete Now (4-6 hours)
- Do all backup, monitoring, security, and UAT tasks today
- Result: Fully production-hardened and ready for paying clients
- For: Teams with time available

### Option B: Fast-Track (1-2 hours + 5-6 this week)
- Do backup verification + basic error dashboard now
- Complete monitoring and security setup this week
- Result: Can accept first client with hardening in progress

### Option C: Deploy Today (15 minutes + 5-6 hours this week)
- Enable backups now (that's it)
- Complete full setup by end of week
- Result: Production live with basic safeguards

---

## Next Task List

Start with: [USER_ACTION_CHECKLIST.md](USER_ACTION_CHECKLIST.md)

### Your Checklist (Copy into your todo)

**Phase H1: Backup & Disaster Recovery (2-3 hours)**
- [ ] Task 1.1: Enable daily backups in Supabase (15 min)
- [ ] Task 1.2: Test restore procedure with real backup (1-2 hours)
- [ ] Task 1.3: Document RTO/RPO (15 min)

**Phase H2: Monitoring & Alerting (1-2 hours)**
- [ ] Task 2.1: Create Vercel error rate dashboard (30 min)
- [ ] Task 2.2: Create Supabase performance dashboard (30 min)
- [ ] Task 2.3: Configure alert notifications (15 min)

**Phase H3: Security Verification (1 hour)**
- [ ] Task 3.1: Verify RLS policies enabled (30 min)
- [ ] Task 3.2: Verify no secrets hardcoded (15 min)
- [ ] Task 3.3: Plan credential rotation (15 min)

**Phase H4: UAT & Sign-Off (1-2 hours)**
- [ ] Task 4.1: Smoke tests in production (30 min)
- [ ] Task 4.2: Test cascading delete logic (30 min)
- [ ] Task 4.3: Test session lifecycle (30 min)
- [ ] Final: Sign off on GO/NO-GO checklist

---

## Canonical References

### Start Here
- [HANDOFF_SUMMARY.md](HANDOFF_SUMMARY.md) — 5-minute orientation
- [PRODUCTION_READINESS_SUMMARY.md](PRODUCTION_READINESS_SUMMARY.md) — Status dashboard + options

### Your Task List
- [USER_ACTION_CHECKLIST.md](USER_ACTION_CHECKLIST.md) — Step-by-step tasks for each section

### Operational Guides
- [PRODUCTION_OPERATIONS_RUNBOOK.md](PRODUCTION_OPERATIONS_RUNBOOK.md) — Deploy, rollback, restore, incidents
- [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) — Common errors and solutions
- [SECURITY.md](../SECURITY.md) — Security policies and procedures

### Reference Documentation
- [AGENCY_OPS_ARCHITECTURE.md](AGENCY_OPS_ARCHITECTURE.md) — System design
- [BACKUP_SYSTEM_GUIDE.md](BACKUP_SYSTEM_GUIDE.md) — Backup procedures
- [RESTORE_RUNBOOK.md](RESTORE_RUNBOOK.md) — Restore procedures
- [MONITORING_DASHBOARD_SETUP.md](MONITORING_DASHBOARD_SETUP.md) — Dashboard setup details
- [SUPPORT_CONTACTS.md](SUPPORT_CONTACTS.md) — Contact list template

---

## Success Metrics

When all Phase H tasks are complete:

✅ **Operational Excellence**
- Daily backups with 30+ day retention
- Disaster recovery tested (RTO < 4 hours)
- Incident detection via dashboards

✅ **Security Hardened**
- RLS verified on all tables
- No hardcoded secrets
- Credentials rotation planned

✅ **Production Confident**
- All UAT tests passing
- All smoke tests passing
- Operational runbooks verified

✅ **Client Ready**
- Ready to accept first paying client
- Can handle incidents
- Can recover from data loss

---

## Timeline

| Date | Phase | Status |
|------|-------|--------|
| May 13 | MVP deployed to production | ✅ Complete |
| May 13 | Smoke tests (20/20) | ✅ Complete |
| May 13 | User action docs created | ✅ Complete |
| **May 13-14** | **Backup & monitoring setup** | ⏳ **IN PROGRESS** |
| **May 14** | **Security audit** | ⏳ **PENDING** |
| **May 14** | **Final UAT** | ⏳ **PENDING** |
| May 14+ | **Ready for first client** | 🎯 **TARGET** |

---

## Current State: What Works Today

✅ **All 14 MVP features operational**
- Lead intake (public webhook)
- Admin dashboard (authenticated)
- CRM (clients, billing, requests)
- Audit logging
- Health monitoring
- Data integrity

✅ **All validations passing**
- 20/20 smoke tests
- 5/5 role-access tests
- All auth working
- All audit logs created

✅ **Production verified**
- Deployed to Vercel
- All env vars set
- All secrets secured
- Node.js version pinned
- Build reproducible
- Deployment automated

---

## What's Next (Your Action)

**Read [HANDOFF_SUMMARY.md](HANDOFF_SUMMARY.md) now** (5 minutes)

Then choose:
- **Option A:** Do full setup today (4-6 hours)
- **Option B:** Fast-track now, finish this week
- **Option C:** Deploy now, setup by end of week

Start: [USER_ACTION_CHECKLIST.md](USER_ACTION_CHECKLIST.md)

