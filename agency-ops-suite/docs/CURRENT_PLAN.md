# Current Plan

This file is the active source of truth. The refined operating model is documented in [AGENCY_OPS_ARCHITECTURE.md](AGENCY_OPS_ARCHITECTURE.md).

## Key Points

- Public layer = acquisition only; no direct DB writes.
- Suite = source of truth; commits business state and owns infrastructure.
- Shared infra (DB, backups, logs) is controlled only by the suite.

## Current Active Work

1. Finish Supabase schema wiring (Phase 1).
2. Implement lead intake bridge (Phase 1).
3. Validate client lifecycle simulation (Phase 1).
4. Keep the combined migration source and runbook as the manual apply path.

## Canonical References

- [AGENCY_OPS_ARCHITECTURE.md](AGENCY_OPS_ARCHITECTURE.md) — refined operating model (this repo)
- [SUPABASE_MIGRATIONS_REORDERED.sql](SUPABASE_MIGRATIONS_REORDERED.sql)
- [SUPABASE_MIGRATION_RUNBOOK.md](SUPABASE_MIGRATION_RUNBOOK.md)
- [IMPLEMENTATION_INDEX.md](IMPLEMENTATION_INDEX.md)
- [PHASE1_LEAD_INTAKE_TASK_LIST.md](PHASE1_LEAD_INTAKE_TASK_LIST.md)

