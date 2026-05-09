# Local Live Testing Checklist (Real Database)

## 0) Preflight configuration

- [ ] In `.env.local`, confirm `NEXT_PUBLIC_USE_SEED_DATA=false`.
- [ ] In `.env.local`, set real `NEXT_PUBLIC_SUPABASE_URL` (not placeholder).
- [ ] In `.env.local`, set real `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not placeholder).
- [ ] In `.env.local`, confirm `DEV_AUTH_BYPASS=false`.
- [ ] In `.env.local`, set `ADMIN_EMAIL_ALLOWLIST` (or `ADMIN_ROLE_ALLOWLIST`) to your test admin email(s).
- [ ] Restart the dev server after any env change.

## 1) Authentication and access control

- [ ] Open `/login` and sign in with a real allowlisted Supabase user.
- [ ] Verify allowlisted user is redirected to `/` after login.
- [ ] Verify a non-allowlisted user gets redirected with `error=not_allowed`.
- [ ] Verify unauthenticated access to `/` redirects to `/login`.
- [ ] Verify `/api/report/export` is protected when logged out.

## 2) Real data visibility (no seed fallback)

- [ ] Dashboard cards show current counts from DB (clients, tasks, billing, domains).
- [ ] `/clients` lists real records from table `clients`.
- [ ] `/billing` lists real records from table `billing`.
- [ ] `/leads` lists real records from table `leads`.
- [ ] `/requests` lists real records from table `requests`.
- [ ] `/tasks` lists real records from table `tasks`.
- [ ] `/assets` lists real records from table `assets`.
- [ ] `/domains` lists real records from table `domains`.
- [ ] `/maintenance` lists real records from table `maintenance`.

## 3) Mutations and persistence checks

- [ ] Create one new client and verify it appears immediately in `/clients` and dashboard metrics.
- [ ] Update client status and verify state change persists after page refresh.
- [ ] Create a billing record and toggle paid/unpaid; verify counts and values update.
- [ ] Create/update a task; verify list ordering and status counters update.
- [ ] Create/update a domain; verify expiry date displays correctly and input keeps `YYYY-MM-DD` format.
- [ ] Create/update maintenance entry and verify dashboard signals update.

## 4) Report run snapshot behavior

- [ ] Generate a report from `/` using current period.
- [ ] Confirm new run appears in `/reports`.
- [ ] Confirm run row shows snapshot presence.
- [ ] Download report from `/reports` and verify content matches generated run snapshot.
- [ ] Generate another report after changing data; verify old run export remains historically consistent.

## 5) Audit trail behavior

- [ ] Open `/audit-logs` and verify recent create/update/generate events appear.
- [ ] Confirm report generation writes a `report` audit event with a `reportRunId` in metadata.
- [ ] Confirm provisioning events write `provisioning` audit records for create and status update.
- [ ] Use filters (`entityType`, `action`) and verify table results match filters.

## 6) API and export checks

- [ ] `GET /api/report/export` works when authenticated.
- [ ] `GET /api/report/export?format=json` returns valid JSON.
- [ ] `GET /api/report/export?reportRunId=<id>` returns snapshot-backed export.
- [ ] Content export endpoints return expected format (`json`, `md`, `csv`) for existing client data.

## 7) Basic regression and UX checks

- [ ] No unexpected 500s in terminal while navigating all pages.
- [ ] Forms return actionable `ok` / `err` banners.
- [ ] Navigation works for all sidebar tools.
- [ ] Date/time displays are human-readable and consistent.

## 8) Optional verification in Supabase dashboard

- [ ] Confirm inserted/updated rows exist in corresponding tables.
- [ ] Confirm `report_runs.report_snapshot` is populated for newly generated runs.
- [ ] Confirm `audit_logs` rows are written with expected metadata fields.

## 9) Live intake integration test (real DB)

- [ ] In your shell session, set:
	- `SMOKE_ENABLE_LIVE_INTAKE=true`
	- `SMOKE_INTAKE_SECRET=<same value as INTAKE_WEBHOOK_SECRET>`
	- `SMOKE_SUPABASE_URL=<project URL>`
	- `SMOKE_SUPABASE_SERVICE_ROLE_KEY=<service role key>`
- [ ] Start app locally: `npm run dev --workspace apps/admin-dashboard`.
- [ ] In a separate shell, run: `npm run test:intake-live --workspace apps/admin-dashboard`.
- [ ] Confirm test passes and verifies both lead row creation and audit metadata (`leadId`).
- [ ] Unset `SMOKE_SUPABASE_SERVICE_ROLE_KEY` after test session.

