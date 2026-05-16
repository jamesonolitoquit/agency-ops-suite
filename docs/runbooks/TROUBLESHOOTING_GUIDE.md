# Troubleshooting Guide

Use this guide when production or staging behavior does not match the expected smoke-test results.

## Common Errors

### 1. Build fails on Vercel

Likely causes:
- Missing environment variables.
- Wrong build command or output directory.
- Workspace linked to the wrong Vercel project.

What to check:
1. Confirm the deployment is linked to `agency-ops-suite`.
2. Confirm `vercel.json` matches the current build flow.
3. Check the build log for the first error, not the last one.

### 2. `/api/intake/lead` returns 401

Likely causes:
- Missing `INTAKE_WEBHOOK_SECRET`.
- Wrong secret header.
- Staging or production env vars not synced.

What to check:
1. Confirm the shared secret is present in Vercel.
2. Confirm the caller sends `x-intake-secret` or `x-webhook-secret`.
3. Confirm the payload contains the expected fields.

### 3. Admin routes return 401

Likely causes:
- Missing `ADMIN_DOWNLOAD_SECRET`.
- Wrong admin header.
- Request made without the correct admin context.

What to check:
1. Confirm the request sends `x-admin-secret`.
2. Confirm the configured secret matches the route guard.
3. Check the route-level tests for the expected status code.

### 4. Health endpoint returns 404

Likely causes:
- Deployment is stale.
- The wrong deployment URL is being checked.
- A route regression was introduced.

What to check:
1. Re-run the production smoke suite.
2. Confirm the URL is the current Vercel alias.
3. Confirm `apps/admin-dashboard/src/app/api/health/route.ts` is present.

### 5. Database inserts fail

Likely causes:
- Supabase env vars missing.
- RLS blocking the request.
- Wrong project credentials in the environment.

What to check:
1. Confirm `NEXT_PUBLIC_SUPABASE_URL` is correct.
2. Confirm `SUPABASE_SERVICE_ROLE_KEY` is set.
3. Check Supabase logs for the underlying error.

## Debug Logging Instructions

1. Capture the request ID if the request path includes it.
2. Check Vercel function logs.
3. Check Supabase logs.
4. Compare against the last known good deployment.
5. Save the failing request/response payloads in the incident record.

## Database Query Examples

```sql
SELECT COUNT(*) FROM public.leads;
SELECT COUNT(*) FROM public.audit_logs;
SELECT COUNT(*) FROM public.system_events;
```

```sql
SELECT * FROM public.audit_logs ORDER BY created_at DESC LIMIT 20;
SELECT * FROM public.system_events ORDER BY created_at DESC LIMIT 20;
```

## Performance Tuning Tips

- Keep smoke tests small and deterministic.
- Use the staging validation suite before production deploys.
- Check for slow queries in Supabase when response times drift upward.
- Watch for repeated 401/403 responses after auth changes.

## Security Incident Response

If a secret is exposed or unauthorized access is suspected:

1. Rotate the affected secret.
2. Roll back if the exposure came from a recent deploy.
3. Preserve logs and deployment details.
4. Notify the designated security contact.
5. Review the production operations runbook for next steps.

## References

- [PRODUCTION_OPERATIONS_RUNBOOK.md](PRODUCTION_OPERATIONS_RUNBOOK.md)
- [PRODUCTION_READINESS_CHECKLIST.md](PRODUCTION_READINESS_CHECKLIST.md)
- [DEPLOYMENT_STATUS_CURRENT.md](DEPLOYMENT_STATUS_CURRENT.md)
