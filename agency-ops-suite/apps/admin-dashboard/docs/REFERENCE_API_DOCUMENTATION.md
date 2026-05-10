# Agency Ops Suite - Admin Dashboard API Documentation

## Overview

The admin dashboard provides RESTful APIs for managing leads, clients, and deployment tracking. All endpoints use Supabase service-role authentication (bypasses RLS) and are protected by webhook secrets or API authentication.

## Database Schema

### Core Tables (Phase 1)

| Table | Purpose | FK Strategy |
|-------|---------|-------------|
| `users` | Admin user records | — |
| `clients` | Client accounts and billing info | — |
| `leads` | Lead intake and conversion tracking | `→ clients (SET NULL)` |
| `billing` | Billing records per client | `→ clients (CASCADE)` |
| `requests` | Service requests from clients | `→ clients (CASCADE)` |
| `provisioning_runs` | Website provisioning jobs | `→ clients (SET NULL)` |
| `report_runs` | Analytics report generations | `→ clients (SET NULL)` |
| `audit_logs` | Historical audit trail | `→ clients (SET NULL)` |

### Supporting Tables (Phase 2)

| Table | Purpose | FK Strategy |
|-------|---------|-------------|
| `assets` | Client assets (images, docs, etc.) | `→ clients (SET NULL)` |
| `domains` | Domain registration and hosting info | `→ clients (SET NULL)` |
| `tasks` | Operational tasks per client | `→ clients (SET NULL)` |
| `backup_logs` | System backup history | — |
| `deployment_checklists` | Site deployment status per client | `→ clients (CASCADE)` |
| `deployment_checklist_items` | Detailed checklist items | `→ deployment_checklists (CASCADE)` |
| `system_events` | System-wide events and monitoring | — |

## API Endpoints

### Lead Intake (Public)

#### POST `/api/intake/lead`

Creates a new lead from public intake form (e.g., landing page signup).

**Required Headers:**
```
x-intake-secret: <INTAKE_WEBHOOK_SECRET from .env.local>
Content-Type: application/json
```

**Optional Headers:**
```
x-idempotency-key: <unique key for idempotent retry>
```

**Request Body:**
```json
{
  "name": "John's Medical Clinic",
  "businessType": "medical_clinic",
  "email": "john@clinic.example",
  "phone": "+1-555-1234",
  "message": "Looking for website redesign",
  "source": "google"
}
```

**Response (201 Created):**
```json
{
  "ok": true,
  "leadId": "uuid",
  "duplicate": false
}
```

**Rate Limiting:**
- 30 requests per 60 seconds per IP (configurable via env vars)
- Returns `429 Too Many Requests` if exceeded

**Idempotency:**
- Include `x-idempotency-key` header for safe retries
- Server caches results for 10 minutes (configurable)

### Client Management (Protected)

#### GET `/api/admin/clients`

List all clients or fetch a specific client.

**Query Parameters:**
```
?id=<uuid>    # Optional: fetch single client by ID
```

**Response (200 OK):**
```json
{
  "ok": true,
  "clients": [
    {
      "id": "uuid",
      "name": "Acme Clinic",
      "businessType": "medical",
      "domain": "acmeclinic.example",
      "plan": "growth",
      "status": "active",
      "monthlyFee": 299,
      "readyForDeploy": true,
      "liveUrl": "https://acmeclinic.example",
      "createdAt": "2026-05-04T12:00:00Z"
    }
  ]
}
```

#### POST `/api/admin/clients`

Create a new client.

**Request Body:**
```json
{
  "name": "New Clinic",
  "businessType": "medical",
  "email": "admin@newclinic.example",
  "phone": "+1-555-5678",
  "domain": "newclinic.example",
  "plan": "starter",
  "monthlyFee": 99,
  "status": "active",
  "readyForDeploy": false,
  "liveUrl": ""
}
```

**Response (201 Created or 200 if duplicate):**
```json
{
  "ok": true,
  "client": { /* client object */ },
  "duplicate": false
}
```

**Behavior:**
- Checks for duplicate domain before insert
- Auto-creates deployment checklist entry
- Logs to `audit_logs` table

#### PATCH `/api/admin/clients`

Update an existing client.

**Request Body:**
```json
{
  "id": "uuid",
  "updates": {
    "status": "paused",
    "plan": "pro",
    "monthlyFee": 499,
    "readyForDeploy": true,
    "liveUrl": "https://newclinic.example"
  }
}
```

**Response (200 OK):**
```json
{
  "ok": true,
  "client": { /* updated client object */ }
}
```

#### DELETE `/api/admin/clients`

Delete a client by ID.

**Request Body:**
```json
{
  "id": "uuid"
}
```

**Response (200 OK):**
```json
{
  "ok": true,
  "message": "Client deleted"
}
```

**Cascading Behavior:**
- `billing` records → deleted
- `requests` records → deleted
- `provisioning_runs` records → client_id set to NULL
- `deployment_checklists` → deleted (cascades to items)

## Environment Variables

### Required
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Optional (Lead Intake)
```bash
INTAKE_WEBHOOK_SECRET=your-secret-key
INTAKE_RATE_LIMIT_WINDOW_MS=60000          # Default: 60 seconds
INTAKE_RATE_LIMIT_MAX_REQUESTS=30          # Default: 30 per window
INTAKE_IDEMPOTENCY_TTL_MS=600000           # Default: 10 minutes
```

## Authentication & Authorization

- **Lead Intake (`/api/intake/lead`)**: Protected by webhook secret
- **Admin Endpoints (`/api/admin/*`)**: Currently open (no auth required in MVP)
  - Production should enforce API key or OAuth2
- **Database**: All operations use service-role key (bypasses RLS)
  - RLS policies allow authenticated users only
  - Service role has full access

## Audit Logging

All mutations (create, update, delete) are logged to `audit_logs`:

```json
{
  "id": "uuid",
  "entity_type": "lead | client | request | ...",
  "entity_id": "uuid",
  "action": "create | update | delete | duplicate_detected",
  "summary": "Human-readable action description",
  "metadata": { /* JSON object with context */ },
  "created_at": "2026-05-04T12:00:00Z"
}
```

## Testing

### Manual Testing with curl

**Create a lead:**
```bash
curl -X POST http://localhost:3000/api/intake/lead \
  -H "Content-Type: application/json" \
  -H "x-intake-secret: test-secret" \
  -d '{
    "name": "Test Clinic",
    "businessType": "medical",
    "email": "test@clinic.example",
    "phone": "+1-555-0000"
  }'
```

**List clients:**
```bash
curl http://localhost:3000/api/admin/clients
```

**Create a client:**
```bash
curl -X POST http://localhost:3000/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Clinic",
    "businessType": "medical",
    "domain": "testclinic.example",
    "plan": "growth",
    "monthlyFee": 299
  }'
```

### Automated Testing

Run the end-to-end test suite:

```bash
# 1. Start the dev server
npm run dev

# 2. In another terminal, run tests
API_BASE_URL=http://localhost:3000 \
INTAKE_WEBHOOK_SECRET=test-secret \
node test-api-e2e.js
```

Expected output: All tests pass, endpoints respond correctly, data persists.

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": "Optional detailed info"
}
```

### Common Errors

| Status | Error Code | Cause |
|--------|-----------|-------|
| 400 | `invalid_payload` | Malformed JSON or missing required fields |
| 400 | `missing_required_fields` | Named field(s) are required but not provided |
| 401 | `unauthorized` | Webhook secret missing or incorrect |
| 429 | `rate_limited` | Too many requests from this IP |
| 500 | `create_failed` | Database insert failed |
| 500 | `update_failed` | Database update failed |
| 500 | `delete_failed` | Database delete failed |

## Deployment Notes

### Production Checklist

- [ ] Set strong `INTAKE_WEBHOOK_SECRET` in production
- [ ] Enable API key authentication for admin endpoints
- [ ] Consider rate limiting enforcement (currently in-memory, doesn't persist across instances)
- [ ] Monitor audit logs for suspicious activity
- [ ] Backup Supabase regularly
- [ ] Test disaster recovery procedures
- [ ] Implement request signing or HMAC validation for webhooks
- [ ] Use environment-specific `.env` files (never commit secrets)

### Scaling Considerations

- **Rate Limiting**: Current in-memory implementation works for single instance; use Redis or database for multi-instance deployments
- **Idempotency**: Current in-memory cache works for single instance; consider database-backed cache for resilience
- **Audit Logs**: Append-only; consider partitioning by date or archiving old entries
- **Database Backups**: Supabase handles automatic backups; configure retention and test restore procedures

## Related Files

- **Schema**: [SUPABASE_MIGRATIONS_REORDERED.sql](../docs/SUPABASE_MIGRATIONS_REORDERED.sql)
- **Service Client**: [src/lib/supabase/service.ts](src/lib/supabase/service.ts)
- **DB Helpers**: [src/lib/agency-db.ts](src/lib/agency-db.ts)
- **Lead Intake**: [src/app/api/intake/lead/route.ts](src/app/api/intake/lead/route.ts)
- **Client Mgmt**: [src/app/api/admin/clients/route.ts](src/app/api/admin/clients/route.ts)
- **Tests**: [test-api-e2e.js](test-api-e2e.js)
