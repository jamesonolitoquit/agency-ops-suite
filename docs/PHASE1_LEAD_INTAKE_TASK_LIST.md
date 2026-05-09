# Phase 1 Lead Intake Task List

## Goal

Implement a reliable lead ingestion pipeline from public website forms into the internal CRM.

## Endpoint Contract

### Internal ingestion endpoint

- Path: /api/intake/lead
- Method: POST
- Auth: shared secret header x-intake-secret
- Request body:
  - name (required)
  - businessType (required)
  - email (optional)
  - phone (optional)
  - message (optional)
  - source (optional)

### Responses

- 201: lead created
- 400: invalid payload
- 401: missing or invalid secret
- 500: server misconfiguration or insert failure

## Architecture Notes

- Public app should not write directly to DB from browser.
- Public app API route performs server-to-server POST to internal endpoint.
- Internal endpoint validates secret and writes lead + audit event.

## Implementation Checklist

- [x] Create internal ingestion endpoint /api/intake/lead.
- [x] Validate shared secret via INTAKE_WEBHOOK_SECRET.
- [x] Validate required payload fields.
- [x] Persist lead via createLeadRecord.
- [x] Write audit event for ingestion.
- [x] Allow route in middleware public routes while keeping secret gate.
- [x] Add smoke test for unauthorized ingestion.
- [ ] Add public-site API route proxy (in public website repo).
- [ ] Add public contact form payload validation and error UX.
- [x] Add retry logic with idempotency key for webhook robustness.
- [x] Add basic rate limiting and abuse protection.

## Security Checklist

- [ ] Store INTAKE_WEBHOOK_SECRET in environment only.
- [ ] Rotate shared secret quarterly.
- [ ] Restrict internal app exposure to private network/VPN.
- [ ] Log only non-sensitive metadata in audit records.

## Test Cases

- [x] Valid secret + valid payload returns 201 and creates lead row (live integration test harness added; requires live env).
- [x] Missing secret returns 401.
- [x] Wrong secret returns 401.
- [x] Missing name or businessType returns 400.
- [x] Malformed JSON payload returns 400.
- [x] Insert failure returns 500 with stable error shape.
- [x] Audit row created with leadId metadata (live integration test harness added; requires live env).

## Rollout Sequence

1. Deploy internal endpoint and env secret.
2. Verify endpoint manually with curl/Postman.
3. Wire public website API route proxy.
4. Enable contact form integration.
5. Observe first live submissions in leads dashboard.
