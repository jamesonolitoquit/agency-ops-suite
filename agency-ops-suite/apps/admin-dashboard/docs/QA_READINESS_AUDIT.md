# QA Readiness Audit — Agency Ops Suite

Summary:
- Tracked secrets sanitized in `.env.local` (service-role and anon keys cleared).
- Seed and E2E scripts hardened (ID normalization, snake_case mapping, fallbacks).
- Smoke tests and Playwright E2E run locally: smoke 7/7, Playwright 24/25 (one skipped non-admin test).

Findings:
- `client_assets` primary table missing `asset_type` in current DB schema; seed falls back to `assets` (handled).
- Some local env examples previously had secrets; `.env.example` now recommends `NEXT_PUBLIC_USE_SEED_DATA=false`.
- `.env.local` is now sanitized; ensure CI/hosting stores actual keys.

Immediate action items (QA):
1. Add automated secret-scan in CI (detect committed JWTs/keys).
2. Add acceptance test requiring non-admin credentials set in CI to avoid skips.
3. Confirm DB schema vs app expectations (migrate `client_assets` vs `assets` table).
4. Add backups + DB migration plan (see production hardening plan).

Notes for devs:
- Do NOT commit any `.env*.local` files. Use secret manager for deployment.
- Run `npm run setup:e2e:auth-users` and `npm run seed:e2e` in staging only.
