# Agency Ops Suite

Internal workspace for agency leverage tools.

## Source of Truth

Start with [Current Plan](CURRENT_PLAN.md). It explains the active boundary between the public site, the internal suite, and shared infrastructure.

## Workspace Structure

- `apps/admin-dashboard` - private Next.js admin dashboard for CRM, billing, leads, requests, reporting, and maintenance.
- `apps/provisioning-cli` - Node.js CLI for client site provisioning.

## Build Order

1. Lead intake and source-of-truth data model.
2. CRM and billing.
3. Provisioning and deployment controls.
4. Monitoring, backups, and logging.
5. Sales tools that support the current funnel.

## Keep or Ignore

- Keep: [IMPLEMENTATION_INDEX.md](IMPLEMENTATION_INDEX.md), [SUPABASE_MIGRATIONS_REORDERED.sql](SUPABASE_MIGRATIONS_REORDERED.sql), [SUPABASE_MIGRATION_RUNBOOK.md](SUPABASE_MIGRATION_RUNBOOK.md), [PHASE1_LEAD_INTAKE_TASK_LIST.md](PHASE1_LEAD_INTAKE_TASK_LIST.md)
- Ignore as historical context: one-off status summaries and completion reports that repeat the same plan.
