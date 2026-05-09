# Agency Ops Suite

Internal workspace for agency leverage tools.

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

## 🚀 Operational Readiness (START HERE)

**Status:** Pre-launch validation phase  
**Next Step:** Follow [IMPLEMENTATION_INDEX.md](docs/IMPLEMENTATION_INDEX.md)

### Quick Links
- **[WEEK1_QUICK_START.md](docs/WEEK1_QUICK_START.md)** - 3-day sprint to client-ready (lead bridge + E2E test + backups)
- **[ARCHITECTURE_SUMMARY.md](docs/ARCHITECTURE_SUMMARY.md)** - System diagram and decisions
- **[IMPLEMENTATION_INDEX.md](docs/IMPLEMENTATION_INDEX.md)** - Complete index of all 14 guides

### Critical Path (Next 72 Hours)
1. [ENVIRONMENT_SETUP_GUIDE.md](docs/ENVIRONMENT_SETUP_GUIDE.md) - Configure .env and verify endpoints (1-2h)
2. [E2E_CLIENT_LIFECYCLE_TEST.md](docs/E2E_CLIENT_LIFECYCLE_TEST.md) - Run complete flow (4-6h)
3. [BACKUP_SYSTEM_GUIDE.md](docs/BACKUP_SYSTEM_GUIDE.md) - Implement daily backups (1-2h)

### Phase 2 (Week 2-4)
- Sales Tools: Audit generator, proposal generator, contract generator
- Delivery Tools: Deployment checklist, uptime monitor, onboarding form

## Architecture Planning Docs

- [HYBRID_V2_ARCHITECTURE_PLAN.md](docs/HYBRID_V2_ARCHITECTURE_PLAN.md) - Local-first hybrid architecture, phased rollout, and cost guardrails.
- [SUPABASE_QUICKSTART.md](docs/SUPABASE_QUICKSTART.md) - Fast setup guide for data/auth integration.
- [OPERATIONAL_READINESS_ARCHITECTURE.md](docs/OPERATIONAL_READINESS_ARCHITECTURE.md) - Complete gap analysis, pre-launch validation.

## QA Commands

- `npm run test:smoke --workspace apps/admin-dashboard` - baseline route/auth/intake rejection checks.
- `npm run test:intake-live --workspace apps/admin-dashboard` - live intake integration test (requires `SMOKE_*` env vars).