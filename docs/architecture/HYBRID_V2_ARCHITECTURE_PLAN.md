# Hybrid V2 Architecture Plan

## Decision

Yes, hybrid is the correct decision for your current stage.

- Public site: externally hosted for speed and reliability.
- Internal tools: local/private to control costs and keep operations flexible.
- Data: hosted Supabase for now (free tier), with a defined migration path to self-hosted Postgres later.

## Target Architecture

### Public Layer

- Landing and marketing pages hosted on Vercel.
- Future public pages: pricing, portfolio, contact.
- Public form submission endpoint (API route) forwards lead data into internal system.

### Internal Layer

- Admin dashboard (Next.js) runs locally or on private VPS.
- Provisioning CLI runs from trusted machine or private server.
- Internal scripts and automations run in private network only.

### Data Layer (Hybrid)

- Supabase hosted Postgres (free tier) for now.
- Use existing schema and auth patterns already in the suite.
- Keep app data contracts DB-agnostic where possible to allow later migration.

## Network and Security Model

### Minimum

- Internal tools not publicly exposed.
- Secrets only in env files, never in repo.
- Allowlist-based access control enabled.

### Recommended

- Private network access using Tailscale or WireGuard.
- If VPS is used, protect internal routes behind VPN and firewall.
- Daily database backup export.

## Deployment and Flow Design

### Sales to Delivery Flow

1. Lead captured from public site form.
2. Lead written into internal CRM queue.
3. Team qualifies and converts lead.
4. Provisioning CLI generates client site.
5. Client site deployed to Vercel or VPS.
6. Internal dashboard tracks status, billing, tasks, and maintenance.

### Lead Intake Flow

1. User submits public contact form.
2. Public API route validates payload.
3. API route sends signed request to internal ingestion endpoint.
4. Internal endpoint creates lead row and audit entry.

## Environment Matrix

### Local Dev

- Public site: optional local or Vercel preview.
- Internal dashboard: local.
- Data: Supabase hosted free tier.

### Staging (Later)

- Public site: Vercel preview or staging domain.
- Internal tools: private VPS route.
- Data: dedicated Supabase project (still free if within limits).

### Production (Later)

- Public site: Vercel production.
- Internal tools: private VPS or private LAN host.
- Data: Supabase paid only when usage justifies, or migrate to self-hosted Postgres.

## Cost Guardrails

- Keep on free tiers while validating demand.
- Track monthly usage and set spend limits where possible.
- Avoid introducing paid observability/services until required by load.

## Implementation Phases

## Phase 0: Hybrid Baseline (Now)

- Keep current codebase architecture.
- Use Supabase free tier for DB/auth.
- Keep internal tools local/private.
- Ensure no seed data in live local testing.

Exit criteria:

- Dashboard and CLI function with real data.
- Access controls and audit logs are active.

## Phase 1: Intake and Conversion Path

- Add public lead form endpoint and server-side validation.
- Add secure ingestion from public app to internal system.
- Add alerting/notification for new leads (simple email or chat webhook).

Exit criteria:

- Every contact form submission appears as lead in dashboard.

## Phase 2: Private Ops Hardening

- Add VPN/private access path for internal dashboard.
- Add scheduled backups and restore drill.
- Add minimal health checks and runbook.

Exit criteria:

- Internal tools are not publicly accessible.
- Backup and restore verified.

## Phase 3: Optional Self-Hosted DB Readiness

- Keep schema and data access abstraction clean.
- Prepare migration scripts from Supabase Postgres to self-hosted Postgres.
- Run pilot migration in non-production environment.

Exit criteria:

- Migration path validated without functional regressions.

## Operational Checklist

- Public app has clear CTA and conversion-focused copy.
- Internal dashboard has real-data mode enabled.
- Lead intake path tested end-to-end.
- Provisioning logs and report snapshots validated.
- Backup process documented and tested.

## Risks and Mitigations

- Risk: delayed lead conversion due to weak messaging.
  - Mitigation: prioritize offer clarity, pricing visibility, and CTA strength.

- Risk: local-only internal tools become availability bottleneck.
  - Mitigation: move internal tools to private VPS once volume increases.

- Risk: dependency on external DB provider.
  - Mitigation: preserve migration path and periodic export backups.

## Immediate Next 7 Days

1. Finalize public offer messaging and CTA.
2. Implement lead intake endpoint and ingestion path.
3. Run full local live checklist against real data.
4. Define backup schedule and restore test.
5. Create private access plan for internal tools.
