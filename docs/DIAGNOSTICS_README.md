# Diagnostics & Secret Provisioning

This document lists steps to provision required secrets in Vercel and GitHub, and how to verify them using the diagnostics endpoint we added at `/api/internal/diag`.

## Required secrets
- `INTAKE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DIAGNOSTICS_SECRET` (server-only, used only for the diagnostics endpoint)

## Provisioning (Vercel)
Using the Vercel CLI:

```bash
# login first if necessary
vercel login

# set secrets (examples)
vercel env add INTAKE_WEBHOOK_SECRET production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add DIAGNOSTICS_SECRET production

# repeat for preview/staging as needed (use --environment preview)
```

If you prefer the Vercel web UI, add the same keys under Project Settings → Environment Variables. Make sure `SUPABASE_SERVICE_ROLE_KEY` and `DIAGNOSTICS_SECRET` are marked as encrypted and not exposed to the client.

## Provisioning (GitHub Actions secrets)
Using the GitHub CLI:

```bash
gh secret set STAGING_INTAKE_WEBHOOK_SECRET --body "$INTAKE_WEBHOOK_SECRET" --repo OWNER/REPO
gh secret set STAGING_SUPABASE_SERVICE_ROLE_KEY --body "$SUPABASE_SERVICE_ROLE_KEY" --repo OWNER/REPO
```

Or use the repository Settings → Secrets → Actions UI.

## Verify with diagnostics endpoint
After the deployment (preview/staging/production) finishes and the environment is available, run:

PowerShell / Windows example:

```powershell
$base = 'https://deploy-agency-suite-hub.vercel.app'
$secret = 'your-diagnostics-secret-value'
node .\scripts\diag_check.mjs $base $secret
```

Bash / macOS / Linux example:

```bash
BASE=https://deploy-agency-suite-hub.vercel.app DIAGNOSTICS_SECRET=your-diagnostics-secret-value node scripts/diag_check.mjs $BASE
```

The script will exit with code 0 when all required envs are present. It prints the HTTP status and JSON body.

## Quick local smoke test
Create a local `.env` file (or set env vars) with the same keys, then run the smoke test:

```bash
# from workspace root
node --test apps/admin-dashboard/tests/smoke.test.mjs
```

If the local env lacks `INTAKE_WEBHOOK_SECRET` you should see 401; when present, a valid create should return 200/201.

## Next steps after verification
1. Run staging smoke tests (`npm run test:staging-smoke`) and confirm DB inserts.
2. Run Playwright E2E against preview or staging.
3. Harden idempotency/rate-limit persistence if required.