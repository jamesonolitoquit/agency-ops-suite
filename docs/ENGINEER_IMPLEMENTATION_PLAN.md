# Engineer Implementation Reference Plan

## Purpose

This document is the execution reference for engineering work on internal agency tools.
It defines:

- Implementation order
- Schema migration strategy
- App cutover checkpoints
- Validation and rollback standards

This plan prioritizes production safety and avoids rework by using additive migrations and module-by-module cutover.

---

## Delivery Principles (Non-Negotiable)

1. **Additive-first migrations**
   - Add new tables/columns/indexes before removing old ones.
   - Do not break existing reads/writes during a migration pass.

2. **Module-by-module cutover**
   - Migrate one domain at a time (CRM, billing, requests, etc.).
   - Validate each domain with executable checks before moving forward.

3. **Backward compatibility until cutover complete**
   - Keep adapter logic where needed (example: content model transition).
   - Remove legacy paths only after validation windows pass.

4. **Manual-first operations**
   - Manual report generation, manual billing marks, manual provisioning trigger.
   - No automation/cron until operational volume justifies it.

5. **Observability before optimization**
   - Log key actions and statuses first.
   - Optimize later when pain is measured.

---

## Current State Summary

- Auth, middleware protection, and smoke checks are in place.
- Core CRUD is implemented for clients/billing/leads/requests/maintenance.
- Client edit flow is implemented.
- Provisioning run logging (local + optional DB write-back) is implemented.
- Content export endpoint is implemented.
- Manual report action writes report run metadata.
- Report history view is implemented in dashboard.
- Provisioning runs visibility page with filters is implemented.
- Billing amount alignment is implemented in model, actions, data layer, and UI metrics.
- Tasks module CRUD baseline is implemented with client-optional linkage and status workflow.
- Assets module CRUD baseline is implemented with client-linked URL storage and type classification.
- Domain and hosting tracker baseline is implemented with registrar, hosting, renewal, and expiry tracking.
- Audit logs baseline is implemented with timestamped event capture and an in-app history view.
- Role-ready access control is implemented with centralized auth context and `admin`/`operator` role mapping.

Engineering should continue from this baseline and avoid rebuilding implemented features.

Immediate remaining feature work is now focused on role-ready access control and executive dashboard metrics.

---

## Target Feature Domains

1. Core CRM
2. Billing and revenue tracking
3. Lead pipeline
4. Provisioning system
5. Provisioning logs
6. Content generator and library
7. Request queue
8. Maintenance dashboard
9. Reporting runs
10. Internal tasks
11. Assets
12. Domain and hosting tracker
13. Access control baseline
14. Audit logs
15. Executive dashboard metrics

---

## Execution Phases

## Phase 0: Contract Freeze

### Objective
Lock domain contracts before more code changes.

### Tasks

1. Lock status enums in code and schema:
   - clients: `lead | active | paused | churned`
   - leads: `new | contacted | replied | closed | lost`
   - requests: `pending | in_progress | done`
   - provisioning_runs: `pending | success | failed`

2. Lock shared field conventions:
   - `created_at`, `updated_at`, `started_at`, `completed_at`
   - nullable relation behavior (`set null` vs `cascade`) per table

3. Lock export formats:
   - content: `json | md | csv`
   - report: `json | md` initially

### Exit Criteria

- Enums and field conventions are documented and reflected in model types.

---

## Phase 1: Schema v2 Additive Migration

### Objective
Bring schema to production-ready shape without breaking existing flows.

### Tasks

1. Add/align core table fields:
   - clients: ensure lifecycle includes `lead`
   - billing: add `amount` (manual-first support)
   - requests: add `priority`

2. Add operations tables:
   - `provisioning_runs`
   - `report_runs`

3. Add expansion tables:
   - `tasks`
   - `assets`
   - `domains`
   - `audit_logs`

4. Add indexes on query-critical columns:
   - status, client_id, due_date, created_at/date range columns

5. Apply RLS and grants for new tables:
   - authenticated-only access (current policy model)

### Exit Criteria

- SQL applies cleanly in Supabase.
- Existing dashboard still builds and runs.
- No existing route regressions.

---

## Phase 2: CRM/Billing/Leads Contract Alignment

### Objective
Align implemented app flows with final domain schema.

### Tasks

1. CRM
   - Ensure `lead` status exists in UI/actions for clients.
   - Confirm client archive/churn semantics are clear.

2. Billing
   - Add `amount` to create/edit billing flow.
   - Extend dashboard metrics to include collected amount and pending amount.

3. Leads
   - Add `lost` stage to lead pipeline UI and action validation.
   - Keep conversion tracking as ratio from closed vs total qualified leads.

### Exit Criteria

- CRUD and status transitions match schema enums.
- Dashboard metrics remain accurate after schema alignment.

---

## Phase 3: Provisioning Traceability Hardening

### Objective
Make provisioning runs fully traceable in local logs and DB.

### Tasks

1. Keep local JSONL logging in CLI.
2. Keep optional DB write-back with service role envs.
3. Add provisioning runs viewer page in dashboard:
   - filters: status, client, date range
   - columns: template, domain, status, started/completed, error

4. Add "retry" marker action (optional):
   - first pass can be metadata-only button without full re-run orchestration.

### Exit Criteria

- Every CLI run leaves a local trace.
- DB run rows are created/updated when env is configured.
- Dashboard provides visibility for run outcomes.

---

## Phase 4: Content System Completion

### Objective
Finalize client-scoped content operations and exports.

### Tasks

1. Keep current `content_outputs` compatibility.
2. If moving to `content_items`, add adapter reads/writes before hard cutover.
3. Ensure batch export is client-scoped default.
4. Preserve single-item export capability via id filters later if needed.

### Exit Criteria

- Client-scoped export works in `json`, `md`, and `csv`.
- Content generation/save remains stable.

---

## Phase 5: Reporting and Value Proof

### Objective
Manual one-click reporting with persistent run tracking.

### Tasks

1. Keep manual "Generate Report" action.
2. Persist report run metadata in `report_runs`.
3. Add report history view:
   - filter by client/date range
   - show period start/end and generation timestamp

4. Add basic value metrics into report payload:
   - requests completed
   - pending requests
   - billing paid vs pending
   - maintenance updates count (if available)

### Exit Criteria

- One-click report generation persists run metadata.
- History is visible in-app.

---

## Phase 6: New Ops Modules

### Objective
Add coordination and operational safety modules.

### Tasks

1. Tasks module
   - create/assign/status/due_date
   - optional client link

2. Assets module
   - upload URL storage and client linkage

3. Domains module
   - status, expiry date, basic reminder flags

4. Audit logs
   - track key mutating actions from app and CLI

### Exit Criteria

- Each module has working CRUD baseline and appears in nav.
- Audit logs capture key events with timestamps.

---

## Cross-Cutting Requirements

## Access Control

Current:
- Admin-only (authenticated internal users)

Near-term:
- Add role-ready shape without full RBAC complexity:
  - role field prepared (`admin`, `operator`)
  - guard checks centralized

## Validation Standards

Every mutation path must:

1. Validate required fields and enum values.
2. Return deterministic error states.
3. Revalidate affected pages/routes.
4. Write audit log for critical entity changes.

## Observability Standards

Minimum logs required:

- provisioning run start/success/fail
- billing status/amount changes
- client lifecycle status changes
- report generation actions

---

## Testing and Validation Gates

For each phase, run:

1. Build checks:
   - `npm run build:dashboard`
   - `npm run build:cli`

2. Smoke checks:
   - unauthenticated route protection
   - report export route behavior

3. Feature checks (phase-specific):
   - validate the exact new mutation/read paths introduced

Do not start next phase until current phase gates pass.

---

## Rollback Strategy

1. Never drop old columns/tables in the same release that introduces new ones.
2. Keep fallback reads where schema transition is in progress.
3. If runtime issues appear:
   - disable new UI path,
   - keep existing data path,
   - patch forward with additive change.

---

## Defer List (Do Not Build Yet)

- Automated cron-based weekly reporting
- Full analytics ingestion stack
- External client portal / multi-tenant auth
- Complex billing automation

These are intentionally deferred to keep internal ops fast and stable.

---

## Immediate Engineer Backlog (Next 3 Slices)

1. Add report history view backed by `report_runs`.
2. Add provisioning runs dashboard table with filters.
3. Align billing model/UI with `amount` and add collected-vs-pending totals.

This backlog is the recommended continuation from current implementation.
