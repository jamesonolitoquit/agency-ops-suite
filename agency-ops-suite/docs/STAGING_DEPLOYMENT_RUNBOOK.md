# Staging Deployment Runbook

## Goal

Stand up a staging environment that mirrors production behavior closely enough to validate auth, integrity, monitoring, and live intake before Phase E deployment gating.

## Preconditions

- Supabase staging project created.
- Staging schema applied from `SUPABASE_MIGRATIONS_REORDERED.sql`.
- Staging environment variables available.
- A staging deployment target exists (Vercel preview or equivalent).

## Environment Variables

Start from `docs/ENV_STAGING_TEMPLATE.txt` and set the following in your staging platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_USE_SEED_DATA=false`
- `DEV_AUTH_BYPASS=false`
- `ADMIN_EMAIL_ALLOWLIST`
- `INTAKE_WEBHOOK_SECRET`
- `INTAKE_RATE_LIMIT_WINDOW_MS`
- `INTAKE_RATE_LIMIT_MAX_REQUESTS`
- `INTAKE_IDEMPOTENCY_TTL_MS`
- `STAGING_ENABLE_LIVE_INTAKE=true` when you want live intake validation
- `STAGING_INTAKE_SECRET`
- `STAGING_SUPABASE_URL`
- `STAGING_SUPABASE_SERVICE_ROLE_KEY`
- `STAGING_BASE_URL`

## Deployment Order

1. Apply the Supabase schema to the staging database.
2. Confirm tables exist and RLS is enabled.
3. Deploy the app to staging.
4. Verify the staging deployment can reach the staging database.
5. Run smoke tests.
6. Run live intake validation if staging secrets are available.

## Verification Checklist

- `/login` loads or redirects correctly.
- `/` blocks unauthenticated access.
- `/api/report/export` responds safely.
- `/api/intake/lead` rejects missing and invalid secrets.
- Live intake creates a lead row when enabled.
- `audit_logs` records the intake event.
- `system_events` records auth and duplicate events once monitoring is wired fully.

## Smoke Test Commands

```bash
cd apps/admin-dashboard
npm run test:staging-smoke
```

For live intake validation:

```bash
set STAGING_ENABLE_LIVE_INTAKE=true
npm run test:staging-smoke
```

## Rollback Notes

- If the staging deployment fails, revert the app deployment first.
- If schema changes fail, stop and fix the migration block before continuing.
- Do not promote staging secrets into production values.

## Exit Criteria

- Smoke tests pass.
- Live intake validation passes when enabled.
- No unexplained 500s during the staging run.
- Staging environment is aligned with the current Phase A-C implementation.
