# E2E Runbook — Protected Staging

Purpose
-------
Run end-to-end client lifecycle tests against the staging environment in a controlled, auditable CI job.

Prerequisites
-------------
- Staging environment deployed and reachable
- Required secrets added to repository secrets (Settings → Secrets):
  - `STAGING_BASE_URL`
  - `STAGING_SUPABASE_URL`
  - `STAGING_SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `RESEND_API_KEY`
  - `INTAKE_WEBHOOK_SECRET`

Quick Steps
-----------
1. Add the required secrets to the repo (see prerequisites).
2. In GitHub Actions → Workflows → `E2E - Protected Staging`, click **Run workflow**.
3. Optionally set `run-id` for traceability.
4. Watch the job: it will validate env, install Playwright browsers, and run `npm run test:e2e`.

Local Validation
----------------
Before dispatching CI, validate locally:
```bash
# Ensure env vars are set locally or in your shell
node scripts/validate-e2e-env.mjs

# Run Playwright locally (requires Playwright installed)
npx playwright test --project=chromium
```

Troubleshooting
---------------
- If `validate-e2e-env.mjs` reports missing variables, add them to repo secrets.
- If Playwright fails to install browsers on CI, ensure `npx playwright install --with-deps` completes successfully (network/firewall may block).
- For flaky tests, capture Playwright traces and artifacts (configure `playwright.config.ts` to save traces on failure).

Security Notes
--------------
- Do not store secrets in plaintext or chat. Use GitHub repository secrets or a secure vault.
- Rotate `INTAKE_WEBHOOK_SECRET` per `SECRETS_INVENTORY.md` after testing if used for temporary public forms.

Run History
-----------
Record the workflow run ID and any notable failures in `docs/STAGING_DEPLOYMENT_LOG.md`.
