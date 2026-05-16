# Production Operations Runbook

This runbook is the operational playbook for the first client launch window and the first 48 hours after production deploy.

## Purpose

- Keep production deployment repeatable.
- Keep rollback and restore steps ready before a client is onboarded.
- Give a short, actionable path for incidents, backup recovery, and support escalation.

## Preconditions

- Production deployment is approved.
- Production environment variables are set in Vercel.
- Production Supabase project is provisioned and reachable.
- Backup and restore procedures are available in [BACKUP_SYSTEM_GUIDE.md](BACKUP_SYSTEM_GUIDE.md), [RESTORE_RUNBOOK.md](RESTORE_RUNBOOK.md), and [AUTOMATED_RESTORE.md](AUTOMATED_RESTORE.md).

## Standard Production Deploy

1. Confirm staging is green.
2. Confirm the production checklist is current.
3. Merge the approved staging branch into `main`.
4. Push `main` to trigger Vercel production deploy.
5. Verify the production URL loads.
6. Run the production smoke test suite.

### Production Validation Command

```bash
cd "d:\GitHub\Portfolio Files\agency-ops-suite"
node scripts/staging_validation.js https://agency-ops-suite.vercel.app
```

Expected result: 20/20 passing.

## Rollback Procedure

Use this when production is degraded or a critical regression is detected.

1. Open the Vercel deployment page for the production deployment.
2. Roll back to the last known good deployment.
3. Verify the production URL returns to the prior version.
4. Re-run the production smoke suite.
5. Notify the support owner and record the incident.

### Rollback Triggers

- 500s on core routes.
- Auth failure spikes.
- Lead intake failures on valid secrets.
- Database connectivity loss.
- Any security issue involving secrets or unauthorized access.

## Backup Recovery Procedure

Use the restore runbooks when data recovery is needed.

### Staging Restore Verification

```bash
bash scripts/test-restore.sh backups/<backup-file>.sql
```

### Ephemeral Dry Run

```bash
node scripts/automated-restore.mjs backups/<backup-file>.sql
```

### Recovery Sequence

1. Identify the latest safe backup.
2. Validate the backup in ephemeral or staging first.
3. Restore to the target environment.
4. Confirm row counts and critical records.
5. Re-run smoke tests.

## Incident Response

### Severity 1

- Production unavailable.
- Data loss or corruption.
- Credential exposure.

Action:
1. Roll back immediately if safe.
2. Freeze deployments.
3. Preserve logs and deployment details.
4. Notify the owner and security contact.

### Severity 2

- Partial outage.
- Lead intake failing.
- Auth failures beyond baseline.

Action:
1. Capture request IDs and timestamps.
2. Check Vercel logs and Supabase logs.
3. Compare against the last known good deployment.
4. Fix forward or roll back based on risk.

### Severity 3

- Non-blocking bug.
- UI or docs issue.

Action:
1. Log the defect.
2. Patch on the next release.
3. Keep production live.

## Monitoring Checklist

- Confirm the homepage loads.
- Confirm `/login` works.
- Confirm `/api/health` returns 200.
- Confirm lead intake works with a valid shared secret.
- Confirm admin-only routes reject unauthorized requests.
- Confirm audit logs and system events are recording.

## Maintenance Window Guidance

- Prefer low-traffic windows.
- Announce the window before making changes.
- Keep rollback steps ready before any deploy.
- Avoid schema and app changes in the same window unless necessary.

## Support Contacts

Keep the current owners here before first client launch.

- Development Lead: TBD
- QA Lead: TBD
- Security Contact: TBD
- Primary Operator: TBD

## References

- [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md)
- [BACKUP_SYSTEM_GUIDE.md](BACKUP_SYSTEM_GUIDE.md)
- [RESTORE_RUNBOOK.md](RESTORE_RUNBOOK.md)
- [AUTOMATED_RESTORE.md](AUTOMATED_RESTORE.md)
- [STAGING_DEPLOYMENT_RUNBOOK.md](STAGING_DEPLOYMENT_RUNBOOK.md)
