# Agency Ops Suite

Internal workspace for agency leverage tools.

## Quick Start

1. Install dependencies.
2. Configure environment variables for `apps/admin-dashboard`.
3. Run local feature tests.
4. Run the role-access tests.
5. Follow the production runbooks before any launch promotion.

### Admin Dashboard Setup

From `apps/admin-dashboard`, the core validation commands are:

```bash
npm run test:smoke
npm run test:role-access
```

For live staging validation:

```bash
npm run test:staging-smoke
```

Production smoke validation uses the same staging validation script against the production URL.

## Structure

- `apps/admin-dashboard` - private Next.js admin dashboard for CRM, billing, leads, requests, and maintenance tracking.
- `apps/provisioning-cli` - Node.js CLI for client site provisioning.

## Build Order

1. Shared data model and auth.
2. CRM plus billing.
3. Lead tracker.
4. Provisioning CLI.
5. Content generator.
6. Maintenance dashboard.
7. Client request queue.

## Deploy Checklist

Before deploying the admin dashboard, verify:

1. `NEXT_PUBLIC_SUPABASE_URL` points to the target Supabase project.
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the matching anon key for that project.
3. `ADMIN_EMAIL_ALLOWLIST` contains only the approved internal access emails.
4. `ADMIN_ROLE_ALLOWLIST` can map emails to `admin` or `operator` for role-ready access control.
5. `NEXT_PUBLIC_USE_SEED_DATA` is set to `false` in production.
6. The SQL in `supabase/schema.sql` has been applied, including RLS policies.
7. Smoke tests pass against the deployed site.
8. The production build passes with `npm run build:dashboard`.
9. Role-access tests pass with `npm run test:role-access`.
10. Production operations guidance is up to date in [docs/PRODUCTION_OPERATIONS_RUNBOOK.md](docs/PRODUCTION_OPERATIONS_RUNBOOK.md).

## 🚀 Production Status (May 13, 2026)

**Status:** ✅ **70% PRODUCTION READY** — All MVP features deployed and tested  
**Production URL:** https://agency-ops-suite.vercel.app  
**Smoke Tests:** 20/20 passing ✅

### START HERE: Two-Minute Orientation

1. **[PRODUCTION_READINESS_SUMMARY.md](docs/PRODUCTION_READINESS_SUMMARY.md)** — Read this first (2 min)
   - What's complete ✅
   - What's pending (your action) ⏳
   - How to proceed (3 options)

2. **[USER_ACTION_CHECKLIST.md](docs/USER_ACTION_CHECKLIST.md)** — Your task list (30 min read)
   - Section 1: Backup & Disaster Recovery (2-3 hours to complete)
   - Section 2: Monitoring & Alerting (1-2 hours to complete)
   - Section 3: Security Verification (1 hour to complete)
   - Section 4: Final UAT Tests (1-2 hours to complete)

3. **[PRODUCTION_OPERATIONS_RUNBOOK.md](docs/PRODUCTION_OPERATIONS_RUNBOOK.md)** — Your operational guide
   - Deploy procedures
   - Rollback procedures
   - Restore procedures (critical if backup test fails)
   - Incident response playbook

### What You Can Do Today (Automated ✅)

- ✅ Deploy changes (automatic on main branch push)
- ✅ Access production dashboard (https://agency-ops-suite.vercel.app)
- ✅ Create leads via webhook (POST /api/intake/lead)
- ✅ Monitor health endpoint (GET /api/health)
- ✅ View audit logs (admin-only)

### What You Must Do (Before First Client)

- ⏳ **Enable backups in Supabase** (15 min, then 1-2 hours for testing)
- ⏳ **Create monitoring dashboards** (1-2 hours)
- ⏳ **Verify security policies** (1 hour)
- ⏳ **Run final UAT tests** (1-2 hours)

**Total time:** 4-6 hours to be fully production-ready

### Reference Docs

- [CURRENT_PLAN.md](docs/CURRENT_PLAN.md) — Active roadmap
- [TROUBLESHOOTING_GUIDE.md](docs/TROUBLESHOOTING_GUIDE.md) — Common errors and solutions
- [SUPPORT_CONTACTS.md](docs/SUPPORT_CONTACTS.md) — Contact list template
- [MONITORING_DASHBOARD_SETUP.md](docs/MONITORING_DASHBOARD_SETUP.md) — Detailed dashboard setup
- [SECURITY.md](SECURITY.md) — Security policies and procedures

## Architecture Planning Docs

- [HYBRID_V2_ARCHITECTURE_PLAN.md](docs/HYBRID_V2_ARCHITECTURE_PLAN.md) - Local-first hybrid architecture, phased rollout, and cost guardrails.
- [SUPABASE_QUICKSTART.md](docs/SUPABASE_QUICKSTART.md) - Fast setup guide for data/auth integration.
- [OPERATIONAL_READINESS_ARCHITECTURE.md](docs/OPERATIONAL_READINESS_ARCHITECTURE.md) - Complete gap analysis, pre-launch validation.

## Archived Projects

Inactive or experimental projects have been intentionally archived to reduce operational overhead. See [/ARCHIVED_PROJECTS.md](../ARCHIVED_PROJECTS.md) for details and status.

## QA Commands

- `npm run test:smoke --workspace apps/admin-dashboard` - baseline route/auth/intake rejection checks.
- `npm run test:intake-live --workspace apps/admin-dashboard` - live intake integration test (requires `SMOKE_*` env vars).