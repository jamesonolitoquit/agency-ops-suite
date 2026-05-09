# DeployHub + Agency Ops Suite Integration Plan

## Architect View

### Goal
Connect the public DeployHub landing site to the Agency Ops Suite so public inquiries become tracked CRM records instead of ending as email-only leads.

### Current Gap
- The public site collects contact and audit requests, but it does not write anything into the internal suite.
- Public audit and booking flows are fragmented and not normalized into a shared intake record.
- The suite already has the authenticated internal intake endpoint and CRM pipeline, but the landing site is not using it.

### Proposed Architecture
- Public contact form submits to a server-side bridge route in DeployHub.
- The bridge route validates payloads, forwards a normalized lead to the suite intake endpoint, and then sends the existing confirmation emails.
- Manual audit booking submits to the same suite intake path with audit-specific messaging.
- Public site keeps user-facing marketing pages and lightweight capture only; the suite remains the system of record.

### Route and Data Mapping
- Contact form
  - Public route: `/api/lead`
  - Suite target: `/api/intake/lead`
  - Mapping: `name` stays `name`, `serviceNeeded` becomes `businessType`, `projectDetails` becomes `message`, page path becomes `source`
- Manual audit booking
  - Public route: `/api/book-audit`
  - Suite target: `/api/intake/lead`
  - Mapping: `auditType` becomes `businessType`, `websiteUrl` and `details` are folded into `message`, page path becomes `source`
- Legacy email flow
  - Keep `/api/send` functional during the transition, but make the bridge the canonical capture path.

### Security Requirements
- Keep the suite endpoint and intake secret server-side only.
- Do not expose the shared secret to the browser bundle.
- Fail closed if the suite intake configuration is missing.
- Reject invalid payloads before forwarding anything.
- Preserve existing spam protection and add idempotency for server-side forwarding.

### Implementation Plan
1. Add a shared server-only intake bridge helper in DeployHub.
2. Add `/api/lead` as the canonical contact bridge.
3. Update the contact form to submit to the bridge.
4. Update manual audit booking to normalize into the suite intake.
5. Keep email confirmations as a secondary notification path.
6. Run lint and targeted smoke checks.

### Success Criteria
- A public contact submission creates a lead in the suite.
- A manual audit booking creates a corresponding CRM record.
- No secret values are exposed client-side.
- Existing email confirmations still work.
- The bridge fails safely if the suite endpoint is unavailable.

## QA Specialist Review

### Security Check
- Server-side bridge only: pass.
- Secret handling stays in route handlers and helper utilities: pass.
- Public inputs are validated before forwarding: pass.
- Spam honeypot remains in the contact form: pass.
- No direct browser-to-suite writes: pass.

### Risk Notes
- The contact flow now depends on the suite being available; if the suite is down, submissions should fail visibly rather than silently disappear.
- Manual audit bookings are normalized into the lead pipeline, so downstream tagging must be done in the suite.
- Email sending remains a separate external dependency and should be monitored independently.

### QA Verdict
- Go for implementation if the bridge rejects missing configuration and returns clear errors.
- Recheck after changes with lint and a live submission smoke test.

## Engineer Handoff

### Build Slice
1. Create a reusable intake bridge helper.
2. Add `/api/lead` and wire the contact form to it.
3. Add suite forwarding to `/api/book-audit`.
4. Validate with lint and a live smoke request.

### Rollback Note
- The landing site can fall back to email-only behavior by disabling the suite bridge, but that should be treated as degraded mode, not normal operation.