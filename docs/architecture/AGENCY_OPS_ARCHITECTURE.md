 # Agency Ops Architecture — Refined Operating Model

## Core Principle

```
Public Layer acquires opportunities.
Operations Layer runs the business.
```

The landing page exists to:

- attract
- qualify
- route

The suite exists to:

- operate
- track
- deliver
- retain

---

# FINAL SYSTEM BOUNDARY

# 1. Public Acquisition Layer

## Purpose

Generate and route leads safely.

## Stack

- Next.js
- Vercel
- public APIs only

---

## Responsibilities

### Marketing

- landing page
- pricing
- portfolio
- testimonials
- CTA optimization

### Conversion

- quote requests
- booking forms
- lead capture

### Routing

- forward submissions
- inject auth secret
- validate payload shape

---

## Allowed APIs

```
POST /api/lead
POST /api/quote
POST /api/booking
```

Only write-style intake APIs.

---

## Security Rules

- no DB credentials in browser
- no direct DB writes
- no internal endpoints exposed
- no operational logic

---

# 2. Operations Suite (Source of Truth)

## Purpose

Run the actual business.

## Stack

- Next.js admin dashboard
- local/private hosting
- protected APIs
- Supabase/Postgres

---

## Responsibilities

### CRM

- leads
- clients
- lifecycle tracking

### Operations

- provisioning
- deployment checklist
- requests
- reports

### Finance

- billing
- payment tracking

### System

- logs
- backups
- monitoring
- audit trails

---

## Security Rules

- auth required
- role protected
- RLS enabled
- all actions logged

---

# 3. Infrastructure Layer

## Shared Components

- database
- backups
- storage
- monitoring

## Ownership

Controlled ONLY by suite.

---

# FINAL EVENT FLOW

```
Visitor
  ↓
Landing Page
  ↓
Public Intake API
  ↓
Internal Intake Endpoint
  ↓
Validation + Logging
  ↓
Database
  ↓
CRM / Operations
```

---

# GOLDEN RULES

## Rule 1

```
If it changes business state,
it belongs in the suite.
```

## Rule 2

```
Public systems may initiate events,
but only the suite commits operational state.
```

## Rule 3

```
No public browser writes directly to the database.
```

---

# REFINED MVP TOOLSET (FINALIZED)

Only tools needed for:

- first clients
- stable delivery
- operational control

---

# MODULE PRIORITY ORDER

## PHASE 1 — CRITICAL FOUNDATION (Must complete before clients)

### 1. Supabase Schema Wiring

Goal: Replace ALL in-memory stores.

Deliverables:

- leads table
- clients table
- billing table
- requests table
- provisioning_runs table
- report_runs table
- audit_logs table

Validation: restart app → data persists

---

### 2. Lead Intake Bridge

Goal: Landing page safely forwards leads.

Deliverables:

- Vercel API route
- shared secret validation
- internal intake endpoint
- audit logging

Validation: lead appears in CRM

---

### 3. Client Lifecycle System

Goal: Track operational state.

Deliverables:

- lead → client conversion
- client edit flow
- status lifecycle
- notes/history

Validation: simulate real client

---

### 4. Provisioning Logs + Validation

Goal: Prevent broken deployments.

Deliverables:

- provisioning_runs table
- pre-deploy validation
- deployment status tracking
- error logging

Validation: failed deploy logs correctly

---

## PHASE 2 — OPERATIONAL STABILITY (Needed before scaling beyond 3–5 clients)

### 5. Deployment Checklist System

Goal: Prevent operational mistakes.

Checklist:

- domain connected
- SSL active
- CTA works
- mobile responsive
- SEO tags

Validation: deployment blocked if incomplete

---

### 6. Billing System

Goal: Prevent revenue leakage.

Deliverables:

- invoice tracking
- paid/unpaid
- overdue detection
- next_due_date automation

Validation: overdue client flagged

---

### 7. Request Queue

Goal: Control support workload.

Deliverables:

- request tracking
- status updates
- monthly request count
- abuse warning

Validation: excessive requests flagged

---

### 8. Backup + Restore System

Goal: Survive failure.

Deliverables:

- DB dump script
- backup logs
- restore test

Validation: restore from backup works

---

## PHASE 3 — SALES MULTIPLIERS (Only AFTER operations stable)

### 9. Audit Generator

Goal: Increase close rate.

Output: SEO, performance, UX issues, action summary

---

### 10. Proposal Generator

Goal: Reduce sales friction.

Output: scope, pricing, timeline

---

### 11. Contract Generator

Goal: Operational professionalism.

Output: standardized agreements

---

## PHASE 4 — SCALE LAYER (Do NOT do early)

Optional Later:


- advanced analytics
- automated reporting
- multi-user permissions
- template versioning

---

# IMMEDIATE NEXT STEPS (STRICT ORDER)

## NEXT 72 HOURS

### DAY 1 — Persistence Layer

Tasks:

- finalize Supabase schema
- create migrations
- replace test APIs
- validate CRUD

Success Condition:

```
Restart app → no data loss
```

---

### DAY 2 — Lead Flow + Logging

Tasks:

- landing page API bridge
- internal intake validation
- audit logging
- lead appears in CRM

Success Condition:

```
Public form submission → CRM entry
```

---

### DAY 3 — Real Lifecycle Simulation

Tasks: Run full simulation

```
lead
→ client
→ provisioning
→ checklist
→ billing
→ request
→ report
```

Success Condition:

- no manual confusion
- no broken states
- no missing logs

---

# PRE-LAUNCH GATES (Must ALL pass)

- [ ] data persists
- [ ] backups work
- [ ] lead intake works
- [ ] deployment validation works
- [ ] billing tracking works
- [ ] request queue works
- [ ] reports generate
- [ ] logs capture failures

---

# WHAT YOU SHOULD NOT DO NOW

Do NOT:

- redesign UI again
- add more dashboards
- build SaaS features
- over-automate
- optimize performance prematurely

---

# CURRENT REAL BUSINESS OBJECTIVE

Not:

```
Build perfect software
```

Instead:

```
Create a stable machine capable of handling paying clients.
```

---

*Document created: May 5, 2026*
