**Automated Restore (Ephemeral DB) — Runbook**

Purpose: safely restore a SQL backup into an ephemeral Postgres instance (Docker), run validation checks, and then destroy the instance. This avoids touching live/staging Supabase projects while validating backups.

Requirements:
- Docker installed and running
- Node 18+ (to run the script)

Quick steps:

1. Prepare a checks JSON file (optional). Example `scripts/restore-checks.json`:

```
{
  "public.clients": 42,
  "public.invoices": null
}
```

The repository includes a starter template at [scripts/restore-checks.json](../scripts/restore-checks.json).

- If expected value is `null`, the script will print the count but not fail on mismatch.

2. Run the automated restore script:

```bash
# from repo root
node scripts/automated-restore.mjs backups/backup-2026-05-11.sql --checks scripts/restore-checks.json
```

3. Optional flags:
- `--keep` — keep the Docker container alive for manual inspection. The script prints the container name.

What it does:
- Starts a temporary `postgres:15` Docker container with a random name.
- Copies the provided SQL backup into the container and runs `psql -f /backup.sql` as user `postgres`.
- Executes the validation queries from your checks JSON.
- Removes the container (unless `--keep`), and prints a pass/fail summary.

Notes & risks:
- This uses a local Docker Postgres instance to perform a dry-run restore. It does not create or modify any Supabase project.
- For a full staging restore into Supabase you still need `STAGING_SUPABASE_SERVICE_ROLE_KEY` and `psql` access; use `scripts/test-restore.sh` for that (operator-only, requires credentials).
- If you need automation that creates a temporary Supabase project, that requires Supabase platform access and billing — we can extend this script to call the Supabase management API/CLI if you provide the necessary API token and acceptance of project creation.

If you want, I can now:
- Run the script here (requires Docker and a chosen backup file in the workspace), or
- Extend the script to attempt creating a temporary Supabase project (requires Supabase admin API credentials).
