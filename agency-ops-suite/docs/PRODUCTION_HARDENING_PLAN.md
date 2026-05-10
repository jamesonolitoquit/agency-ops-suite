# Production Hardening Plan — Agency Ops Suite

Goal: Prepare the admin-dashboard and supporting services for safe production use.

Priority checklist (short):
1. Secrets & config
   - Move `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_URL` to hosting/CI secret store (Vercel, GitHub Actions secrets, or Vault).
   - Ensure `.env.local` and `.env*.local` are ignored and sanitized.

2. CI and tests
   - Add CI workflow to run `npm ci`, `npm run test:smoke`, and `npx playwright test` on PRs.
   - Add a secret-scan step to CI (e.g., github action `trufflehog` or `gitleaks`).

3. Database and migrations
   - Review DB schema: reconcile `client_assets` vs `assets` and migrate to canonical tables.
   - Add migration tooling (prefer a schema migration tool) and automated migration checks in CI.
   - Configure automated backups and point-in-time restore.

4. Security and RLS
   - Review Row-Level Security policies and service role usage; scope service role to migration/admin only.
   - Remove privileged keys from client bundles; ensure only server has service role.

5. Observability
   - Add error logging (Sentry/LogDNA) and request tracing.
   - Add uptime checks and Playwright periodic runs for smoke endpoints.

6. Release process
   - Use `RELEASE_CHECKLIST_REAL_DEAL.md` for deploy steps; ensure rollbacks and DB backups are part of the runbook.

Implementation plan (3 sprints):
- Sprint 1 (days 1–3): Secrets migration, CI + secret-scan, sanitize repo.
- Sprint 2 (days 4–10): DB migration plan + run migrations in staging, add backups.
- Sprint 3 (days 11–15): Observability, policy review, run full E2E in CI, finalize release runbook.

Owners: Architect (plan + review), QA (tests + validation), Engineer (implement CI, migrations, monitoring).
# Production Hardening Plan — Agency Ops Suite

Goal: harden the app for safe production use by the agency with clear, prioritized steps.

Phase 1 — Secrets & CI (Days 0-2)
- Move all sensitive env values to hosting/CI secrets (Vercel env, GitHub Actions secrets, or Vault).
- Ensure `.env*.local` is ignored and remove committed `.env.local` from the repo index; rotate keys if they were present in history.
- Add a CI workflow to run `npm run test:smoke` and `npx playwright test` on PRs; fail the job on test failures.
- Add an `env.example` and `.env.production.example` for documentation only.

Phase 2 — Database & Backups (Days 2-4)
- Verify Supabase RLS policies and remove service-role usage from public endpoints.
- Ensure only server-side operations use the service-role key; mark admin endpoints behind auth.
- Configure automated backups and point-in-time recovery; test a restore to staging.

Phase 3 — Access & Logging (Days 4-6)
- Enforce admin allowlists or role-based access; audit current admin emails and roles.
- Add structured audit logging (already present) and integrate with log ingestion (e.g., Datadog, Sentry, Logflare).
- Configure alerts for failed audit inserts, high 5xx rates, or auth failures.

Phase 4 — Release & Runbook (Days 6-8)
- Finalize `RELEASE_CHECKLIST_REAL_DEAL.md` with deploy, verify, and rollback steps.
- Create runbook for incidents (how to rotate keys, disable service workers, revert deploy).
- Perform a rehearsed staging deploy and run the full Playwright suite.

Phase 5 — Continuous Improvements
- Add tenant/isolation checks if onboarding external clients.
- Periodic security scan and dependency upgrade job.

Deliverables I will prepare (next):
- CI workflow file (`.github/workflows/ci.yml`) that runs tests and lints.
- `docs/SECURITY_AUDIT.md` (added) and `docs/PRODUCTION_HARDENING_PLAN.md` (this file).
- A script and steps to remove tracked `.env.local` from git and instructions to rotate secrets.
