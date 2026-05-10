# Release Checklist: Real-Deal Readiness

Use this checklist before every Preview or Production deployment.

## 1. Environment Alignment

- Confirm all Supabase variables point to the same project:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Enforce live mode:
  - `NEXT_PUBLIC_USE_SEED_DATA=false`
  - `DEV_AUTH_BYPASS=false`
- Ensure allowlists are correct:
  - `ADMIN_EMAIL_ALLOWLIST`
  - `ADMIN_ROLE_ALLOWLIST`

## 2. Auth and Test Accounts

Run:

```powershell
npm run setup:e2e:auth-users
```

Optional custom values:

```powershell
$env:E2E_ADMIN_EMAIL="jumpstarthost@gmail.com"
$env:E2E_ADMIN_PASSWORD="admin123"
$env:E2E_NON_ADMIN_EMAIL="e2e.nonadmin@example.com"
$env:E2E_NON_ADMIN_PASSWORD="admin123"
npm run setup:e2e:auth-users
```

## 3. Seed Operational Data (if needed)

```powershell
npm run seed:e2e
```

Use only for staging/testing data. Keep production data intentional.

## 4. Test Gates

Run in this order:

```powershell
npm run test:smoke
npx playwright test tests/e2e/auth.spec.ts --reporter=list
npx playwright test tests/e2e/audit.spec.ts --reporter=list
npx playwright test tests/e2e/proposal.spec.ts --reporter=list
npx playwright test tests/e2e/contract.spec.ts --reporter=list
npx playwright test -c playwright.config.ts --reporter=list
```

Expected:
- All tests pass.
- `non-admin login is rejected` may be skipped only when non-admin env vars are intentionally not set.

## 5. Deploy and Verify

- Deploy Preview and verify key pages:
  - `/`
  - `/clients`
  - `/billing`
  - `/audit`
  - `/proposal`
  - `/contract`
- Verify API health endpoints return healthy responses.
- Confirm login, session refresh, and protected-route behavior.

## 6. Post-Deploy Monitoring

- Check server logs for auth/system event insert failures.
- Confirm no repeated runtime errors on core routes.
- Validate real user CRUD operations for clients, billing, proposals, and contracts.
