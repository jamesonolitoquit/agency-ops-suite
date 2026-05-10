# Supabase Quickstart (for agency-ops-suite)

Use this guide to get a real Supabase URL and key for local testing.

## 1) Create a Supabase project

1. Go to https://supabase.com and sign in.
2. Click New project.
3. Choose your organization.
4. Enter:
   - Project name: agency-ops-local (or any name)
   - Database password: store this safely
   - Region: closest to you
5. Click Create new project and wait until setup finishes.

## 2) Get project URL and anon key

1. Open your project dashboard.
2. Go to Project Settings -> API.
3. Copy:
   - Project URL
   - Project API keys -> anon public

Optional for live intake integration test:

4. Copy:
   - Project API keys -> service_role (server-only, never expose in browser envs)

## 3) Update local environment

Edit apps/admin-dashboard/.env.local and set:

- NEXT_PUBLIC_SUPABASE_URL=<your Project URL>
- NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon public key>
- NEXT_PUBLIC_USE_SEED_DATA=false
- DEV_AUTH_BYPASS=false
- ADMIN_EMAIL_ALLOWLIST=<your test email>

If you want role-aware access instead, use ADMIN_ROLE_ALLOWLIST like:

- ADMIN_ROLE_ALLOWLIST=owner@example.com:admin,ops@example.com:operator

## 4) Apply database schema

Use SQL Editor in Supabase and run the schema from:

- supabase/schema.sql

Run it once per new project.

## 5) Create a test login user

1. In Supabase, go to Authentication -> Users.
2. Click Add user.
3. Create a user with an email that matches your allowlist.
4. Set a password for local sign-in testing.

## 6) Restart local app

From repo root:

- npm run dev --workspace apps/admin-dashboard

Open:

- http://localhost:3000/login

## 7) Verify real-data mode

- Log in and open dashboard pages.
- Confirm records come from DB, not seed data.
- Use apps/admin-dashboard/docs/CHECKLIST_LOCAL_LIVE_TEST.md to run full checks.

## Notes

- The anon key is intended for client-side use (with RLS protection).
- Keep service role keys out of browser env vars.
- If setup fails, first verify URL/key format and allowlisted email.

## Optional: Run live intake integration test

Use this only in local/internal QA shells:

- `SMOKE_ENABLE_LIVE_INTAKE=true`
- `SMOKE_INTAKE_SECRET=<same as INTAKE_WEBHOOK_SECRET>`
- `SMOKE_SUPABASE_URL=<project URL>`
- `SMOKE_SUPABASE_SERVICE_ROLE_KEY=<service_role key>`

Then run:

- `npm run dev --workspace apps/admin-dashboard`
- `npm run test:intake-live --workspace apps/admin-dashboard`
