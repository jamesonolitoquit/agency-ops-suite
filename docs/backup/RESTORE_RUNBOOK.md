# Restore Runbook (Staging)

Purpose: step-by-step instructions for restoring a Supabase SQL backup into a staging project for verification and testing.

Prerequisites:
- A SQL backup file exported from the staging or production Supabase project (e.g. `backup-2026-05-11.sql`).
- `STAGING_SUPABASE_URL` and `STAGING_SUPABASE_SERVICE_ROLE_KEY` available as environment variables.
- `psql` installed locally and access to the staging project's network.

Quick steps:

1. Copy the backup file to your machine:

```bash
# example
cp /path/to/backup-2026-05-11.sql ./backups/
```

2. Export staging env vars locally (do NOT commit):

```bash
export STAGING_SUPABASE_URL=https://your-staging-project.supabase.co
export STAGING_SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

3. Run the restore script (from repo root):

```bash
bash scripts/test-restore.sh backups/backup-2026-05-11.sql
```

4. Verify the data in staging (example queries via psql or Supabase SQL editor):

```sql
SELECT COUNT(*) FROM public.clients;
SELECT COUNT(*) FROM public.leads;
SELECT COUNT(*) FROM public.billing;
```

5. Start the app (local or staging) against the restored database and run smoke tests:

```bash
# Update .env.staging.local (or Vercel staging envs) to point to the restored DB
npm run dev --workspace apps/admin-dashboard
npm run test:staging-smoke --workspace apps/admin-dashboard
```

If you want a repeatable count check after restore, start from [scripts/restore-checks.json](../scripts/restore-checks.json).

Rollback:
- If the restore fails or produces corrupt data, delete the staging test project and recreate a clean staging project, then re-apply a corrected restore or fresh migration.

Security note: Never commit keys or backup files into source control. Keep all secrets in 1Password / Vercel / GitHub Secrets.
