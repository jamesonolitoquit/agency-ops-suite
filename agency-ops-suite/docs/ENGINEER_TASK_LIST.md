# Engineer Task List

## Locked Product Decisions

1. Weekly report starts as manual one-click export with DB run tracking (`report_runs`).
2. Content export supports single and batch export; default UX is batch export per client.
3. Provisioning traceability uses both local CLI logs and DB logs (`provisioning_runs`).

## Current Delivery Order

1. Client edit flow (blocker)
2. Provisioning run logs (critical)
3. Content export API (revenue support)
4. Report runs table and manual report action

## Implementation Status

- [x] Auth/session foundation
- [x] Seed fallback plus DB reads
- [x] CRUD coverage (client edit flow implemented)
- [x] Reporting and ops automation (content export, report tracking, and history/provisioning visibility delivered)
- [x] Billing amount alignment and totals (`collected`, `pending`, `projected MRR`)
- [x] Tasks module CRUD baseline (`/tasks` page, actions, DB access, nav)
- [x] Assets module CRUD baseline (`/assets` page, actions, DB access, nav)
- [x] Domain tracker CRUD baseline (`/domains` page, actions, DB access, nav)
- [x] Audit log module baseline (`/audit-logs` page, actions, DB access, nav)
- [x] Role-ready access control baseline (centralized role resolver)

## Milestone A: Auth and Live Data Foundation

1. Add Supabase dependencies and environment template.
2. Add Supabase client helpers for browser, server, and middleware.
3. Add login page with email/password sign in.
4. Protect dashboard routes with middleware.
5. Add logout action in the app shell.

Acceptance criteria:
- Unauthenticated users are redirected to `/login`.
- Authenticated users can access dashboard routes.
- Login and logout flows work end to end.

## Milestone B: Replace Seed Reads with Supabase Reads

1. Create typed data access layer for `clients`, `billing`, `leads`, `requests`, and `maintenance`.
2. Replace page-level seed data reads with Supabase queries.
3. Keep seed data as a fallback mode only for local demos.

Acceptance criteria:
- Dashboard pages render DB-backed data.
- Fallback mode can be enabled with one env flag.

## Milestone C: CRUD Operations

1. Add create/edit for clients.
2. Add mark-paid action for billing.
3. Add status updates for leads and requests.
4. Add maintenance record updates.

Acceptance criteria:
- Core operations can be completed fully in-app.
- All actions include validation and error handling.

Implementation notes:
- Client edit must support `name`, `business_type`, `domain`, `plan`, `monthly_fee`, `status`.
- Client edit action should revalidate dashboard and clients pages.

Status:
- [x] Client create
- [x] Client edit
- [x] Billing paid toggle
- [x] Lead status updates
- [x] Request status updates
- [x] Maintenance record updates

## Milestone D: Reporting and Ops Automation

1. Add manual report generation action and save run metadata.
2. Add content generator save flow with client attribution and export endpoint.
3. Add provisioning CLI run logs (local + optional DB write-back).

Acceptance criteria:
- Weekly reporting is one-click.
- Content output can be saved and reused.
- Provisioning runs are traceable.

Implementation notes:
- Add `report_runs` table for report generation tracking.
- Add `provisioning_runs` table for CLI tracking.
- Add `/api/export/content` route with `client_id` and `format=json|md|csv`.

Status:
- [x] Manual report generation action and `report_runs` tracking
- [x] Content save flow with client attribution
- [x] Content export endpoint
- [x] Provisioning run logs with local + DB writes