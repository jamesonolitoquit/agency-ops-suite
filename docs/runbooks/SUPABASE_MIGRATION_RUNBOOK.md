# Supabase Migration Runbook

## Purpose

Use this runbook to apply the combined migration file manually in Supabase SQL Editor with review between phases. Do not auto-apply the SQL outside a reviewed session.

## Source File

- [docs/SUPABASE_MIGRATIONS_REORDERED.sql](docs/SUPABASE_MIGRATIONS_REORDERED.sql)

## Execution Order

1. Open Supabase Dashboard.
2. Open SQL Editor.
3. Paste the contents of `docs/SUPABASE_MIGRATIONS_REORDERED.sql`.
4. Run Phase 1 first.
5. Validate each Phase 1 table before moving on.
6. Run Phase 2 next.
7. Validate each Phase 2 table.
8. Only after validation, proceed with app smoke tests.

## Phase 1 Tables

Apply in this order:

1. `users`
2. `clients`
3. `leads`
4. `billing`
5. `requests`
6. `provisioning_runs`
7. `report_runs`
8. `audit_logs`

## Phase 2 Tables

Apply in this order:

1. `assets`
2. `domains`
3. `tasks`
4. `backup_logs`
5. `deployment_checklists`
6. `deployment_checklist_items`
7. `system_events`

## Supabase SQL Editor Instructions

1. Go to the Supabase project dashboard.
2. Open the SQL Editor.
3. Paste the migration file.
4. Execute one phase at a time.
5. Confirm the validation checklist after each table block.
6. Save the exact error text if anything fails.

## Rollback Procedure

1. Stop immediately when a block fails.
2. If the failure happened before data writes, fix the SQL and rerun the same block.
3. If the failure happened after writes, drop the last applied table(s) in reverse dependency order.
4. If multiple tables were changed, prefer restoring from a backup snapshot.

### Reverse Dependency Order

1. `system_events`
2. `deployment_checklist_items`
3. `deployment_checklists`
4. `backup_logs`
5. `tasks`
6. `domains`
7. `assets`
8. `report_runs`
9. `provisioning_runs`
10. `requests`
11. `billing`
12. `leads`
13. `clients`
14. `users`

## Validation Commands

Use the Supabase SQL Editor or your local app to run the following checks.

### Schema checks

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

```sql
select tablename, indexname
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;
```

```sql
select schemaname, tablename, policyname
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### Smoke inserts

Run a minimal insert, then update, then delete test for each table with dependencies already in place.

## Smoke Test Sequence

After migrations are applied:

1. Create lead.
2. Convert lead to client.
3. Create billing record.
4. Create request.
5. Run provisioning log.
6. Generate report.
7. Restart app.
8. Verify persistence.

## Required Failure Tests

1. Invalid lead payload should be rejected and logged.
2. Deploy without domain should be blocked.
3. Delete client should cascade billing and requests while preserving audit history.
4. Anonymous API access should be denied.

## Common Failure Cases

- Missing `pgcrypto` extension.
- Duplicate column or constraint from a partially applied schema.
- RLS enabled without a matching authenticated policy.
- Foreign key delete behavior not matching expected cascade or set-null strategy.
- `provisioning_runs.status` check constraint missing `in_progress`.
- Missing `deployment_checklist_items` causing checklist UI code to fail.

## Notes

- Keep RLS simple for the MVP internal suite: authenticated users only.
- Avoid anon writes.
- Do not expand the schema until this runbook completes cleanly.
