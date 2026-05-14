# Feature Testing Plan

## Goal

Verify the full live feature surface of Agency Ops Suite in staging/production with a repeatable pass/fail checklist, not just route availability.

This plan is organized for 100% feature coverage of the current app surface:
- Core revenue flows
- Operational/admin flows
- Public/auth flows
- Client-facing flows
- Supporting APIs and exports
- Scaffolded or partial surfaces that still need explicit confirmation

## Test Method

Use the same sequence for each feature area:
1. Open the live route.
2. Confirm authenticated or public access is correct.
3. Exercise the primary happy path.
4. Try one validation or error case.
5. Confirm persistence or expected state change.
6. Capture a note if the page contains seeded duplicates, empty states, or placeholder data.

## Coverage Buckets

### 1. Authentication and Session

Routes:
- `/login`
- `/login/reset`
- `/login/recover`
- logout flow

Checks:
- Login form accepts valid credentials.
- Invalid credentials are rejected cleanly.
- Authenticated users are redirected away from public auth pages when appropriate.
- Reset and recovery pages render without the admin shell.
- Logout clears session state and returns to public auth.

### 2. Admin Dashboard

Routes:
- `/`

Checks:
- KPI cards render with live values.
- Recent clients and upcoming billing load.
- Export links work.
- Generate report action works or fails gracefully with a clear message.
- Sidebar navigation links all resolve.

### 3. Clients CRM

Route:
- `/clients`

Checks:
- Client list renders.
- Client create flow works.
- Edit fields persist.
- Status changes persist.
- Domain, plan, fee, and metadata fields save.
- Duplicate client records are identified as data issues, not rendering bugs.

### 4. Billing

Route:
- `/billing`

Checks:
- Invoice list renders.
- Create invoice flow works.
- Status transitions persist.
- Payment method selection works.
- PDF export link opens/downloads.
- Stripe checkout link resolves or fails with an explicit message.

### 5. Reports and Analytics

Routes:
- `/reports`
- `/api/report/export`

Checks:
- Report history renders.
- Client/date/type filters work.
- Export downloads HTML and JSON variants.
- Snapshot-backed runs display correctly.
- Empty-state behavior is clear when filters match nothing.

### 6. Leads Pipeline

Route:
- `/leads`

Checks:
- Lead creation works.
- Source and stage controls work.
- Notes persist.
- Status updates persist across reload.
- Duplicate detection or repeated test rows are recognized as data history, not UI failure.

### 7. Contracts and Proposals

Routes:
- `/proposal`
- `/proposal/new`
- `/proposal/[id]`
- `/proposal/report/[token]`
- `/contract`
- `/contract/new`
- `/contract/[id]`
- `/contracts/sign/[token]`
- `/contract/report/[token]`

Checks:
- Proposal list renders.
- Proposal wizard loads audits.
- Proposal wizard advances through all steps.
- Scope selection updates pricing.
- Prospect details validation blocks incomplete submission.
- Contract list renders.
- Contract wizard advances from source selection to review.
- Required fields block submission until complete.
- Signing flow renders and accepts valid signatures.
- Report and token routes resolve.

### 8. Deployment Readiness

Routes:
- `/deployment-checklist`
- `/provisioning`
- `/domains`

Checks:
- Checklist loads per client.
- Pending/completed/blocked states render distinctly.
- Provisioning templates render.
- Provisioning run creation works or clearly explains why it cannot start.
- Domain form saves registrar, host, expiry, and auto-renew status.
- Readiness summary reflects the selected client correctly.

### 9. Operations Workspace

Routes:
- `/tasks`
- `/requests`
- `/maintenance`
- `/assets`
- `/content`
- `/audit-logs`
- `/security`

Checks:
- Create/edit/save actions work in each workspace page.
- Status selectors persist.
- Summary cards reflect current data.
- Audit logs display recent mutations.
- Security page exposes password reset and password change paths.
- Content generation produces usable draft copy.
- Assets and requests accept new entries.
- Maintenance and task records update cleanly.

### 10. Supporting APIs and Health

Routes:
- `/api/admin/system-health`
- `/api/admin/email-preview`
- `/api/health/schema`
- `/api/intake/lead`
- `/api/invoices/[id]/pdf`
- `/api/invoices/[id]/checkout`

Checks:
- Health endpoints return expected status codes.
- Email preview renders.
- Schema health behaves correctly when the service role key is present or absent.
- Lead intake accepts valid payloads and rejects malformed requests.
- Invoice PDF and checkout endpoints resolve correctly.

## Test Order

Use this sequence for the next staging pass:
1. Authentication and session.
2. Dashboard.
3. Clients and billing.
4. Reports.
5. Leads.
6. Contracts and proposals.
7. Deployment readiness.
8. Operations workspace.
9. Supporting APIs and health.

## Acceptance Criteria

A feature area is marked passed only when:
- The primary page loads in the correct auth context.
- The main action path works end to end.
- One validation or edge case is confirmed.
- The result is visible after reload or navigation.
- Any data anomalies are classified separately from UI defects.

## Defect Labels

Use these labels when logging issues:
- `ui-regression` for broken layout, missing controls, or navigation failures.
- `data-quality` for duplicates, stale seeded data, or inconsistent records.
- `auth-regression` for login/session/public-page bugs.
- `workflow-blocker` for wizard steps or save actions that cannot complete.
- `api-regression` for endpoint failures, bad status codes, or broken exports.

## Open Gaps To Recheck

- Duplicate seeded records in clients, billing, reports, tasks, and related selectors.
- Proposal and contract flows after live redeploys or data refreshes.
- Stripe payment and email delivery validation.
- Backup restore and performance testing.

## Completion Rule

The suite is considered fully feature-tested when every route and workflow above has at least one live pass recorded, plus a documented outcome for any known duplicates, placeholders, or intentionally empty states.