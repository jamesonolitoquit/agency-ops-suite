# Quick Reference Card — Copy This To Your Todo App

## 🎯 Your Mission (Choose One Path)

```
OPTION A: Full Setup Today (4-6 hours, then fully ready)
[ ] Read HANDOFF_SUMMARY.md (5 min)
[ ] Complete Section 1: Backups (2-3 hours)
[ ] Complete Section 2: Monitoring (1-2 hours)
[ ] Complete Section 3: Security (1 hour)
[ ] Complete Section 4: UAT (1-2 hours)
[ ] Sign off → You're at 100% ✅

OPTION B: Fast Track (1-2 hours today + 5-6 later this week)
[ ] Read HANDOFF_SUMMARY.md (5 min)
[ ] Task 1.1: Enable backups (15 min)
[ ] Task 2.1: Vercel error dashboard (30 min)
[ ] Schedule rest of checklist for this week

OPTION C: Deploy Now (15 min today + 5-6 hours later this week)
[ ] Task 1.1: Enable backups in Supabase (15 min)
[ ] Deploy to production
[ ] Schedule full checklist for this week
```

---

## Phase 1: Backup & Disaster Recovery (2-3 hours)

```
[ ] Task 1.1: Enable Daily Backups
    Go to: Supabase Dashboard → Settings → Backups
    Set: Daily backups, 30+ day retention, point-in-time recovery ON
    Take: Screenshot of settings page
    Time: 15 minutes

[ ] Task 1.2: Test Restore Procedure
    Get: Recent backup from Supabase UI → Download
    Save: As backups/backup-latest.sql
    Run: node scripts/automated-restore.mjs backups/backup-latest.sql --checks scripts/restore-checks.json
    Verify: All tables restored, row counts match
    Time: 1-2 hours

[ ] Task 1.3: Document RTO/RPO
    Open: PRODUCTION_OPERATIONS_RUNBOOK.md
    Update: RTO (how long to restore) and RPO (max data loss)
    Set Contact: Who to notify if restore needed
    Commit: Changes to git
    Time: 15 minutes
```

---

## Phase 2: Monitoring & Alerting (1-2 hours)

```
[ ] Task 2.1: Create Vercel Error Dashboard
    Go to: Vercel Dashboard → agency-ops-suite → Monitoring
    Create: "Error Rate (5xx)" chart with target < 5%
    Create: "Response Time (p95)" chart with target < 1000ms
    Create: "Deployment Status" chart
    Create: "Auth Failures (401/403)" chart
    Save: Dashboard URL
    Time: 30 minutes

[ ] Task 2.2: Create Supabase Dashboard
    Go to: Supabase Dashboard → Reports
    View: Query Performance → Slow Queries
    View: Connection Pool Status
    Create: Auth Stats view
    Create: Activity Log filtered view (last 24h)
    Save: Screenshots and URLs
    Time: 30 minutes

[ ] Task 2.3: Configure Alerts
    Go to: Vercel → Settings → Notifications
    Add Email: For deployment failures
    Add Email: For 5xx error spikes
    Add Email: For high response times
    Go to: Supabase → Settings → Notifications (if available)
    Test: Send sample alert
    Record: Alert email address in SUPPORT_CONTACTS.md
    Time: 15 minutes
```

---

## Phase 3: Security Verification (1 hour)

```
[ ] Task 3.1: Verify RLS is Enabled
    Go to: Supabase Dashboard → Database
    Query:
        SELECT table_name, row_level_security
        FROM information_schema.tables
        WHERE table_schema = 'public'
    Verify: All tables have row_level_security = TRUE
    Update: SECURITY.md with results
    Time: 30 minutes

[ ] Task 3.2: Verify No Secrets Hardcoded
    Run: git log -p | grep -i "supabase" | head -20
    Run: git ls-files | grep -E "\.env"
    Run: grep -r "SUPABASE_SERVICE_ROLE_KEY" src/ || echo "✅ Safe"
    Verify: No hardcoded secrets found
    Check: .gitignore includes .env*
    Time: 15 minutes

[ ] Task 3.3: Plan Credential Rotation
    Open: SECURITY.md
    Document: Monthly rotation schedule
    Document: Who has access to Supabase dashboard
    Set Reminder: First rotation after 1 week of production
    Time: 15 minutes
```

---

## Phase 4: Final UAT Tests (1-2 hours)

```
[ ] Task 4.1: Production Smoke Tests
    Go to: https://agency-ops-suite.vercel.app
    Verify: Page loads (no 404/500)
    Test: Login with admin email
    Test: Can navigate dashboard
    Test: POST /api/intake/lead with webhook secret
    Verify: GET /api/health returns 200
    Verify: No console errors
    Time: 30 minutes

[ ] Task 4.2: Cascading Delete Logic
    Create: Test client in dashboard
    Create: Billing records for test client
    Create: Provisioning runs linked to client
    Delete: Test client
    Verify: Billing deleted, provisioning_runs set to NULL
    Verify: Audit logs show deletion
    Time: 30 minutes

[ ] Task 4.3: Session Lifecycle
    Login: To dashboard
    Wait: 5 minutes (observe token refresh in DevTools network tab)
    Verify: Session remains active
    Wait: 15+ minutes
    Refresh: Dashboard
    Verify: Redirects to login (session expired)
    Test: Sign Out button works
    Verify: Cannot access protected routes after logout
    Time: 30 minutes
```

---

## Final Sign-Off

```
[ ] All backup tasks complete and verified
[ ] All monitoring dashboards created and tested
[ ] All security checks passed
[ ] All UAT tests completed successfully
[ ] PRODUCTION_READINESS_CHECKLIST.md updated
[ ] All team members trained on procedures
[ ] Ready for first client onboarding

Sign Off:
Name: _________________ Date: _______
```

---

## Quick Links (Bookmark These)

```
🔗 Production: https://agency-ops-suite.vercel.app
📖 Runbook: docs/PRODUCTION_OPERATIONS_RUNBOOK.md
🆘 Troubleshooting: docs/TROUBLESHOOTING_GUIDE.md
🔐 Security: SECURITY.md
💾 Backup Guide: docs/BACKUP_SYSTEM_GUIDE.md
✅ Checklist: docs/USER_ACTION_CHECKLIST.md
📊 Status: docs/PRODUCTION_READINESS_SUMMARY.md
🎯 Start: docs/HANDOFF_SUMMARY.md
```

---

## Key Phone Numbers (Update in SUPPORT_CONTACTS.md)

```
[ ] Tech Lead: ___________________
[ ] DevOps: ___________________
[ ] Project Manager: ___________________
[ ] Emergency Contact: ___________________
```

---

## If Something Goes Wrong

**"I can't restore from backup"**
→ See: docs/TROUBLESHOOTING_GUIDE.md → Backup Restoration Issues

**"Dashboard shows 500 errors"**
→ See: docs/TROUBLESHOOTING_GUIDE.md → Common Errors

**"Need to rollback a deployment"**
→ See: docs/PRODUCTION_OPERATIONS_RUNBOOK.md → Rollback Procedures

**"System is down, need immediate restore"**
→ See: docs/RESTORE_RUNBOOK.md → Emergency Restore

---

## Status Tracking

```
Progress: ███░░░░░░ 30% → ██████░░░ 60% → █████████ 100%

Day 1: Backup verification
Day 2: Monitoring + Security
Day 3: UAT + Sign-off

Target: Friday (May 17, 2026)
```

---

## Final Checklist Before First Client

```
[ ] Backups running automatically (daily)
[ ] Backup restoration tested (verified)
[ ] Monitoring dashboards active (5 metrics tracked)
[ ] Alerts configured (3+ alert types)
[ ] RLS policies verified (all tables)
[ ] Secrets verified secure (no leaks)
[ ] Team trained on incident response
[ ] Runbooks accessible and current
[ ] All UAT tests passing
[ ] Ready to invoice first client ✨
```

---

**Copy this entire section into your project management tool (Jira, Asana, Notion, etc.)**

**You're at 70% ready. These tasks get you to 100%.** 💪
