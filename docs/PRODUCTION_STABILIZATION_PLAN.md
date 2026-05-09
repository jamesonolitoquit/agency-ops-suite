# ARCHITECT'S PLAN: PRODUCTION STABILIZATION SPRINT
## Agency Ops Suite — May 5–19, 2026

---

## EXECUTIVE SUMMARY

We are transitioning from **feature delivery** to **operational reliability**. This 14-day sprint focuses exclusively on making the system production-safe:

- Secure all admin APIs with authentication
- Verify data integrity (deletion behavior, duplicate prevention)
- Add operational observability (failure logging, monitoring)
- Prepare staging environment for real workflows
- Prevent silent failures

**Scope Rule:** No new product features. No UI redesign. No analytics, proposals, or mobile. Stability first.

---

## PHASE A: AUTHENTICATION HARDENING (Days 1–3)

**Goal:** Block all unauthenticated access to admin operations.

### Current State
```
❌ /api/admin/* is publicly accessible
❌ /dashboard/* has no auth protection
❌ Service role used for all operations (no user context)
❌ Anonymous users can create/edit/delete clients
```

### Required State
```
✅ Anonymous requests rejected (401 Unauthorized)
✅ Authenticated users validated via middleware
✅ Simple role system (admin role enforced)
✅ Failed auth attempts logged
✅ Session tokens validated server-side
```

### Architecture Decision: Supabase Auth

Use Supabase's built-in auth system (already available in project).

**Why:**
- Already configured in `.env.local`
- JWT-based (stateless, scalable)
- Built-in RLS support
- No custom auth to maintain
- Seamless Supabase integration

### Task A1: Create Auth Middleware

**File:** `apps/admin-dashboard/src/middleware.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith('/api/admin/') || pathname.startsWith('/dashboard/')) {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Missing authentication token' },
        { status: 401 }
      );
    }

    try {
      await jwtVerify(token, secret);
      // Token valid, continue
      return NextResponse.next();
    } catch (err) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*', '/dashboard/:path*'],
};
```

### Task A2: Add Helper for Route Handlers

**File:** `apps/admin-dashboard/src/lib/auth.ts` (NEW)

```typescript
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

/**
 * Extract JWT from request headers
 */
export function getAuthToken(): string | null {
  const h = headers();
  return h.get('authorization')?.split('Bearer ')[1] ?? null;
}

/**
 * Require authentication in route handlers
 * Throws if not authenticated
 */
export async function requireAuth() {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Unauthorized: No authentication token');
  }
  return token;
}

/**
 * Verify user has admin role
 */
export async function requireAdminRole(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error('Invalid token');
  }

  const userRole = data.user.user_metadata?.role ?? 'user';
  if (userRole !== 'admin') {
    throw new Error('Forbidden: Admin role required');
  }

  return data.user;
}
```

### Task A3: Update Route Handlers

Update `POST /api/admin/clients` to validate auth:

**Pattern:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const token = await requireAuth();
    const user = await requireAdminRole(token);
    
    // Audit: log who made this request
    console.log(`[AUDIT] User ${user.id} creating client`);

    const body = await request.json();
    // ... rest of logic
  } catch (err) {
    if (err.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (err.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    // ... error handling
  }
}
```

### Task A4: Add Auth Events to `system_events`

Update handlers to log auth failures:

```typescript
const supabase = createServiceClient();
await supabase.from('system_events').insert({
  type: 'auth_failed',
  severity: 'warning',
  payload: {
    endpoint: '/api/admin/clients',
    reason: 'missing_token', // or 'invalid_token', 'invalid_role'
    timestamp: new Date().toISOString()
  }
});
```

### Task A5: Dashboard Protection

Add auth context provider for Next.js pages:

**File:** `apps/admin-dashboard/src/lib/auth-context.tsx` (NEW)

Implement Supabase session management:
- Load user on app startup
- Redirect to login if not authenticated
- Store JWT in secure storage
- Refresh token on expiry

### Validation Criteria (Auth Complete)

```
✅ curl http://localhost:3000/api/admin/clients → 401 Unauthorized
✅ curl -H "Authorization: Bearer invalid" → 401 Invalid token
✅ curl -H "Authorization: Bearer $TOKEN" (admin user) → 200 OK
✅ auth_failed event logged on rejected request
✅ User ID captured in audit logs
```

**Definition of Done:** All admin APIs reject anonymous requests.

---

## PHASE B: DATA INTEGRITY TESTING (Days 4–5)

**Goal:** Verify deletion behavior and duplicate prevention work correctly.

### Current State
```
❌ DELETE endpoint created but never tested
❌ Cascade delete behavior unverified
❌ Duplicate lead detection is broken
❌ No E2E test for deletion workflows
```

### Required State
```
✅ DELETE client cascades correctly
✅ FK SET NULL behavior verified
✅ No orphaned records after deletion
✅ Duplicate leads prevented
✅ All operations tested end-to-end
```

### Task B1: Fix Duplicate Lead Detection

**File:** `apps/admin-dashboard/src/lib/agency-db.ts`

Current bug in `createLeadRecord`:
```typescript
// BROKEN: queries by email but returns duplicate.data[0]
const duplicate = await supabase
  .from('leads')
  .select('*')
  .eq('email', input.email.trim())
  .limit(1);

if (duplicate.data && duplicate.data.length > 0) {
  return { lead: toLeadRecord(duplicate.data[0]), duplicate: true };
}
```

**Fix:** Normalize email and check existence before insert:

```typescript
export async function createLeadRecord(input: {
  name: string;
  businessType: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
}) {
  const supabase = getClient();
  
  // Normalize email for duplicate check
  const normalizedEmail = input.email?.trim().toLowerCase();
  
  // Check if lead already exists
  if (normalizedEmail) {
    const { data: existing } = await supabase
      .from('leads')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      // Log duplicate attempt
      await supabase.from('system_events').insert({
        type: 'duplicate_lead_detected',
        severity: 'info',
        payload: {
          leadId: existing.id,
          email: normalizedEmail,
          timestamp: new Date().toISOString()
        }
      });
      
      return { lead: toLeadRecord(existing), duplicate: true };
    }
  }

  // Insert new lead
  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        name: input.name.trim(),
        business_type: input.businessType?.trim() ?? '',
        email: normalizedEmail ?? '',
        phone: input.phone?.trim() ?? '',
        notes: input.message?.trim() ?? '',
        source: normalizeSource(input.source),
        status: 'new',
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return { lead: toLeadRecord(data), duplicate: false };
}
```

### Task B2: Create DELETE E2E Test

**File:** `apps/admin-dashboard/test-delete-behavior.js` (NEW)

Test scenario:
1. Create test client
2. Create related billing records
3. Create related requests
4. Create provisioning run (should SET NULL, not delete)
5. Delete client
6. Verify:
   - Billing records deleted (CASCADE)
   - Requests deleted (CASCADE)
   - Provisioning run still exists with client_id=NULL
   - Audit logs preserved (still referencing deleted client)

```javascript
async function testDeleteBehavior() {
  console.log('Testing DELETE client cascade behavior...');

  // 1. Create client
  const client = await api.POST('/api/admin/clients', {
    name: 'Test Delete Client',
    domain: `test-delete-${Math.random().toString(36).substring(7)}.example`,
    businessType: 'test',
  });
  const clientId = client.id;
  console.log(`✓ Client created: ${clientId}`);

  // 2. Create billing (should CASCADE delete)
  const billing = await api.POST('/api/admin/billing', {
    clientId,
    amount: 100,
    dueDate: '2026-06-01',
  });
  console.log(`✓ Billing created: ${billing.id}`);

  // 3. Create request (should CASCADE delete)
  const request = await api.POST('/api/admin/requests', {
    clientId,
    title: 'Test request',
  });
  console.log(`✓ Request created: ${request.id}`);

  // 4. Create provisioning run (should SET NULL)
  const prov = await api.POST('/api/admin/provisioning', {
    clientId,
    domain: 'test.example',
    status: 'pending',
  });
  console.log(`✓ Provisioning created: ${prov.id}`);

  // 5. Delete client
  await api.DELETE('/api/admin/clients', { id: clientId });
  console.log(`✓ Client deleted`);

  // 6. Verify cascade behavior
  const billingAfter = await api.GET(`/api/admin/billing/${billing.id}`);
  if (billingAfter.status === 404) {
    console.log(`✓ Billing record CASCADE deleted`);
  } else {
    console.error(`✗ Billing still exists: ${JSON.stringify(billingAfter)}`);
  }

  const provAfter = await api.GET(`/api/admin/provisioning/${prov.id}`);
  if (provAfter.clientId === null) {
    console.log(`✓ Provisioning run SET NULL correctly`);
  } else {
    console.error(`✗ Provisioning client_id not null: ${provAfter.clientId}`);
  }

  const auditAfter = await api.GET(`/api/admin/audit-logs?entity=client&id=${clientId}`);
  if (auditAfter.length > 0) {
    console.log(`✓ Audit logs preserved after deletion`);
  } else {
    console.error(`✗ Audit logs deleted (should be preserved)`);
  }
}
```

### Task B3: Add Endpoints for Testing

Create temporary test endpoints (for staging only):
- `GET /api/admin/billing/:id`
- `POST /api/admin/billing`
- `GET /api/admin/requests/:id`
- `POST /api/admin/requests`
- `GET /api/admin/provisioning/:id`
- `POST /api/admin/provisioning`

These can be removed after testing or gated behind `?test=true` flag.

### Task B4: Create Database Cleanup Helper

**File:** `apps/admin-dashboard/src/lib/cleanup.ts` (NEW)

Safe cleanup after tests:

```typescript
/**
 * Delete all test records safely
 * Used after E2E testing to reset staging state
 */
export async function cleanupTestData(pattern: string) {
  const supabase = createServiceClient();
  
  // Delete in reverse dependency order
  await supabase.from('requests').delete().like('title', pattern);
  await supabase.from('provisioning_runs').delete().like('domain', pattern);
  await supabase.from('clients').delete().like('domain', pattern);
  await supabase.from('leads').delete().like('email', pattern);
}
```

### Validation Criteria (Integrity Complete)

```
✅ Repeated lead submission returns existing record (no duplicate row)
✅ Delete client → billing deleted (CASCADE)
✅ Delete client → requests deleted (CASCADE)
✅ Delete client → provisioning_runs.client_id = NULL
✅ Delete client → audit_logs preserved
✅ E2E test passes (all assertions pass)
```

**Definition of Done:** All deletion behavior matches FK strategy.

---

## PHASE C: MONITORING & OBSERVABILITY (Days 6–7)

**Goal:** Make failures visible and actionable.

### Current State
```
❌ Failures may go unnoticed
❌ No structured failure logging
❌ No alerting mechanism
❌ No request tracing
```

### Required State
```
✅ All failures logged to system_events
✅ Auth failures tracked
✅ API errors categorized
✅ Severity levels enforced
✅ Audit trail complete
```

### Task C1: Create Logging Helper

**File:** `apps/admin-dashboard/src/lib/logging.ts` (NEW)

```typescript
import { createServiceClient } from './supabase/service';

export interface SystemEvent {
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  payload: Record<string, any>;
}

export async function logSystemEvent(event: SystemEvent) {
  const supabase = createServiceClient();
  
  const { error } = await supabase.from('system_events').insert({
    type: event.type,
    severity: event.severity,
    payload: {
      ...event.payload,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });

  if (error) {
    console.error('[LOGGING] Failed to log system event:', error);
  }
}

// Event type helpers
export const systemEvents = {
  authFailed: (reason: string, details: any) => ({
    type: 'auth_failed',
    severity: 'warning' as const,
    payload: { reason, details },
  }),
  
  apiFailed: (endpoint: string, statusCode: number, error: string) => ({
    type: 'api_failed',
    severity: 'error' as const,
    payload: { endpoint, statusCode, error },
  }),
  
  duplicateDetected: (entity: string, id: string) => ({
    type: 'duplicate_detected',
    severity: 'info' as const,
    payload: { entity, id },
  }),
  
  provisioningFailed: (clientId: string, reason: string) => ({
    type: 'provisioning_failed',
    severity: 'error' as const,
    payload: { clientId, reason },
  }),
  
  deploymentValidationFailed: (clientId: string, reason: string) => ({
    type: 'deployment_validation_failed',
    severity: 'warning' as const,
    payload: { clientId, reason },
  }),
};
```

### Task C2: Integrate Logging into Route Handlers

Update all admin endpoints to log failures:

Pattern for `POST /api/admin/clients`:
```typescript
export async function POST(request: NextRequest) {
  try {
    const token = await requireAuth();
    // ...
  } catch (err) {
    await logSystemEvent(
      systemEvents.apiFailed('/api/admin/clients', 500, err.message)
    );
    return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  }
}
```

### Task C3: Create Observability Dashboard Route

**File:** `apps/admin-dashboard/src/app/api/admin/system-health.ts` (NEW)

```typescript
export async function GET() {
  const supabase = createServiceClient();
  
  // Get last 24 hours of events
  const { data: events, error } = await supabase
    .from('system_events')
    .select('*')
    .order('created_at', { ascending: false })
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(100);

  if (error) return NextResponse.json({ error }, { status: 500 });

  // Aggregate by severity
  const summary = {
    total: events.length,
    critical: events.filter(e => e.severity === 'critical').length,
    error: events.filter(e => e.severity === 'error').length,
    warning: events.filter(e => e.severity === 'warning').length,
    info: events.filter(e => e.severity === 'info').length,
    events: events.slice(0, 20), // Last 20
  };

  return NextResponse.json(summary);
}
```

### Task C4: Audit Logging for All Mutations

Ensure every write operation logs to `audit_logs`:

Pattern:
```typescript
const { data, error } = await supabase.from('clients').insert([payload]).select().single();

if (data) {
  await supabase.from('audit_logs').insert({
    entity_type: 'client',
    entity_id: data.id,
    action: 'create',
    summary: `Created client: ${data.name}`,
    metadata: { userId: user.id, domain: data.domain },
  });
}
```

### Validation Criteria (Monitoring Complete)

```
✅ Failed API request creates system_events entry
✅ Auth failure logged with reason
✅ Duplicate detection logged
✅ All mutations have audit entries
✅ GET /api/admin/system-health returns event summary
✅ Severity levels properly categorized
```

**Definition of Done:** All failures are observable and traceable.

---

## PHASE D: STAGING ENVIRONMENT PREP (Days 8–10)

**Goal:** Create production-like staging environment.

### Current State
```
❌ Only local development environment
❌ No separate staging DB
❌ No staging deployment
```

### Required State
```
✅ Staging Supabase project
✅ Staging env vars configured
✅ Staging deployment URL
✅ Staging smoke tests
```

### Task D1: Create Staging Environment Configuration

**File:** `.env.staging` (NEW)

```bash
# Staging environment
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=https://<staging-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<staging-service-role-key>
INTAKE_WEBHOOK_SECRET=staging-secret-key
```

**File:** `.env.staging.example` (NEW)

```bash
# Template for staging environment setup
NODE_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_STAGING_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_STAGING_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_STAGING_SERVICE_ROLE_KEY
INTAKE_WEBHOOK_SECRET=YOUR_STAGING_SECRET
```

### Task D2: Create Staging Deployment Runbook

**File:** `docs/STAGING_DEPLOYMENT_RUNBOOK.md` (NEW)

Contents:
1. Prerequisites
2. Supabase project setup (staging)
3. Schema migration to staging
4. Environment variable configuration
5. Deployment to staging (e.g., Vercel)
6. Smoke test checklist
7. Backup procedures
8. Rollback procedures

### Task D3: Create Staging Database Schema

Run full migration on staging Supabase project:
- Apply SUPABASE_MIGRATIONS_REORDERED.sql to staging
- Verify all 15 tables exist
- Verify indexes created
- Verify RLS policies active

### Task D4: Create Staging Smoke Test Script

**File:** `test-staging-smoke.js` (NEW)

```javascript
/**
 * Smoke test for staging environment
 * Run after deploying to staging
 */
const stagingUrl = process.env.STAGING_API_URL || 'https://staging.example.com';
const stagingSecret = process.env.INTAKE_WEBHOOK_SECRET;

async function runStagingSmoke() {
  console.log(`Testing staging at ${stagingUrl}\n`);

  // 1. Test lead intake
  console.log('→ Testing lead intake...');
  const leadRes = await fetch(`${stagingUrl}/api/intake/lead`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-intake-secret': stagingSecret,
    },
    body: JSON.stringify({
      name: 'Staging Test',
      businessType: 'test',
      email: `staging-test-${Date.now()}@example.com`,
    }),
  });
  if (leadRes.ok) console.log('✓ Lead intake working');
  else console.error('✗ Lead intake failed:', leadRes.status);

  // 2. Test admin API (should require auth)
  console.log('→ Testing admin auth...');
  const adminRes = await fetch(`${stagingUrl}/api/admin/clients`, {
    method: 'GET',
  });
  if (adminRes.status === 401) console.log('✓ Auth protection active');
  else console.error('✗ Auth protection not working');

  // 3. Test system health
  console.log('→ Checking system health...');
  const healthRes = await fetch(`${stagingUrl}/api/admin/system-health`, {
    headers: { 'Authorization': `Bearer ${process.env.STAGING_AUTH_TOKEN}` },
  });
  if (healthRes.ok) console.log('✓ System health endpoint working');
  else console.error('✗ System health endpoint failed');

  console.log('\n✅ Staging smoke test complete');
}

runStagingSmoke();
```

### Validation Criteria (Staging Complete)

```
✅ Staging Supabase project exists
✅ Schema applied to staging
✅ Staging env vars configured
✅ Smoke test passes on staging
✅ Lead intake works on staging
✅ Admin auth enforced on staging
✅ Logging works on staging
```

**Definition of Done:** Staging environment is production-like and ready for testing.

---

## PHASE E: DEPLOYMENT VALIDATION GATE (Days 11–12)

**Goal:** Prevent incomplete deployments.

### Task E1: Add Deployment Checklist Validation

**File:** `apps/admin-dashboard/src/lib/deployment-validation.ts` (NEW)

```typescript
export async function validateDeploymentReadiness(clientId: string) {
  const supabase = createServiceClient();
  
  // Get checklist
  const { data: checklist } = await supabase
    .from('deployment_checklists')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (!checklist) {
    return { valid: false, reason: 'No deployment checklist found' };
  }

  // Check all items completed
  const checks = [
    { field: 'domain_connected', label: 'Domain connected' },
    { field: 'ssl_active', label: 'SSL active' },
    { field: 'cta_works', label: 'CTA tested' },
    { field: 'mobile_responsive', label: 'Mobile responsive' },
    { field: 'seo_meta_tags', label: 'SEO meta tags' },
  ];

  const failures = checks.filter(c => !checklist[c.field]);
  if (failures.length > 0) {
    return {
      valid: false,
      reason: `Incomplete checks: ${failures.map(f => f.label).join(', ')}`,
    };
  }

  return { valid: true, reason: 'All checks passed' };
}

export async function blockDeploymentIfIncomplete(clientId: string) {
  const validation = await validateDeploymentReadiness(clientId);
  
  if (!validation.valid) {
    // Log and throw
    const supabase = createServiceClient();
    await supabase.from('system_events').insert({
      type: 'deployment_blocked',
      severity: 'warning',
      payload: {
        clientId,
        reason: validation.reason,
        timestamp: new Date().toISOString(),
      },
    });
    
    throw new Error(`Deployment blocked: ${validation.reason}`);
  }
}
```

### Task E2: Add Deployment Endpoint

**File:** `apps/admin-dashboard/src/app/api/admin/deployments/route.ts` (NEW)

```typescript
export async function POST(request: NextRequest) {
  try {
    const token = await requireAuth();
    const body = await request.json();
    const { clientId } = body;

    // Validate deployment readiness
    await blockDeploymentIfIncomplete(clientId);

    // Set ready_for_deploy
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('clients')
      .update({ ready_for_deploy: true })
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;

    // Log deployment
    await supabase.from('audit_logs').insert({
      entity_type: 'deployment',
      entity_id: clientId,
      action: 'deploy',
      summary: `Deployed client: ${data.name}`,
      metadata: { userId: token },
    });

    return NextResponse.json({ ok: true, client: data });
  } catch (err) {
    if (err.message.includes('Deployment blocked')) {
      return NextResponse.json(
        { error: 'deployment_blocked', message: err.message },
        { status: 409 }
      );
    }
    // ... error handling
  }
}
```

### Validation Criteria (Deployment Gate Complete)

```
✅ POST /api/admin/deployments requires complete checklist
✅ Incomplete checklist returns 409 Conflict
✅ Deployment logged in audit_logs
✅ Deployment blocked event logged in system_events
```

---

## PHASE F: REAL WORKFLOW SIMULATION (Days 13–14)

**Goal:** End-to-end validation of complete client lifecycle.

### Task F1: Create Workflow Test Script

**File:** `test-staging-workflow.js` (NEW)

Simulate complete client journey on staging:

```
1. Lead submits inquiry
2. Lead becomes client
3. Client gets deployment checklist
4. Checklist items completed
5. Client deployed
6. Billing created
7. Request created
8. Request completed
9. Report generated
10. Client records queried
11. Client deleted (cascade verified)
```

### Task F2: Document Workflow Results

Create `docs/WORKFLOW_VALIDATION_RESULTS.md` capturing:
- Timing at each step
- Data integrity checks
- Any issues encountered
- Performance observations

### Validation Criteria (Workflow Complete)

```
✅ Lead intake → Client conversion works
✅ Deployment checklist created automatically
✅ Deployment gate prevents incomplete deployments
✅ Cascade deletes verified in staging
✅ Audit trail complete for full lifecycle
✅ No orphaned records after deletion
```

---

## DELIVERABLES CHECKLIST

### Documentation (Required)
- [ ] `docs/AUTH_IMPLEMENTATION.md` — Supabase Auth setup
- [ ] `docs/STAGING_RUNBOOK.md` — Staging deployment steps
- [ ] `docs/DELETE_BEHAVIOR_TESTS.md` — FK cascade verification
- [ ] `docs/MONITORING_EVENTS.md` — System events logging
- [ ] `docs/WORKFLOW_VALIDATION_RESULTS.md` — End-to-end test results
- [ ] Updated `API_DOCUMENTATION.md` with auth examples

### Code (Required)
- [ ] Auth middleware (`src/middleware.ts`)
- [ ] Auth helpers (`src/lib/auth.ts`)
- [ ] Logging utilities (`src/lib/logging.ts`)
- [ ] Deployment validation (`src/lib/deployment-validation.ts`)
- [ ] System health endpoint
- [ ] Deployment endpoint

### Tests (Required)
- [ ] Updated E2E test with auth
- [ ] DELETE behavior test
- [ ] Duplicate detection test
- [ ] Staging smoke test
- [ ] Workflow simulation test

### Configuration (Required)
- [ ] `.env.staging.example`
- [ ] Staging Supabase project created
- [ ] Staging schema applied
- [ ] Staging deployment URL configured

### Clean Up (Required)
- [ ] No hardcoded secrets
- [ ] No test endpoints in production
- [ ] All debug logging removed
- [ ] All TODO comments resolved

---

## SUCCESS CRITERIA

### Phase A (Auth): PASS
- Anonymous request → 401 Unauthorized ✅
- Valid token → 200 OK ✅
- Admin role required → 403 Forbidden ✅

### Phase B (Integrity): PASS
- Duplicate leads prevented ✅
- DELETE → CASCADE behavior verified ✅
- DELETE → SET NULL behavior verified ✅
- Audit logs preserved ✅

### Phase C (Monitoring): PASS
- All failures logged ✅
- system_events populated ✅
- System health endpoint working ✅

### Phase D (Staging): PASS
- Staging environment mirrors production ✅
- Smoke test passes ✅

### Phase E (Deployment): PASS
- Incomplete checklist blocks deployment ✅
- Valid checklist allows deployment ✅

### Phase F (Workflow): PASS
- Full client lifecycle validated ✅
- No data loss in any scenario ✅
- Performance acceptable ✅

---

## SCHEDULE

```
DAY 1:  Auth middleware + helpers
DAY 2:  Route handler updates + role validation
DAY 3:  Dashboard auth context + testing
DAY 4:  Duplicate detection fix
DAY 5:  DELETE E2E tests + validation
DAY 6:  Logging infrastructure + integration
DAY 7:  System health endpoint + observability
DAY 8:  Staging project setup + schema migration
DAY 9:  Staging deployment configuration + smoke tests
DAY 10: Staging environment validation
DAY 11: Deployment validation gate
DAY 12: Gate integration + documentation
DAY 13: Full workflow simulation
DAY 14: Results documentation + final validation
```

---

## RULES

### Hard Boundaries
- ❌ No new features
- ❌ No UI redesign
- ❌ No analytics
- ❌ No proposals generator
- ❌ No mobile app
- ❌ No multi-user teams
- ❌ No advanced billing

### Must Have
- ✅ Authentication on all admin APIs
- ✅ Failure logging on all mutations
- ✅ Staging environment
- ✅ Production-like workflow testing
- ✅ Operational reliability

### Code Quality
- All changes reviewed for security
- All logging structured and queryable
- All errors categorized
- All edge cases tested

---

## RISK MITIGATION

| Risk | Mitigation |
|------|-----------|
| Auth implementation breaks API | Use Supabase (mature, tested) |
| Staging not matching production | Mirror all config exactly |
| DELETE behavior misunderstood | Comprehensive E2E test |
| Silent failures in production | Comprehensive logging + monitoring |
| Incomplete deployments | Mandatory validation gate |

---

## ESTIMATED EFFORT

- **Phase A (Auth):** 3 days (~24 hours)
- **Phase B (Integrity):** 2 days (~16 hours)
- **Phase C (Monitoring):** 2 days (~16 hours)
- **Phase D (Staging):** 3 days (~24 hours)
- **Phase E (Gate):** 2 days (~16 hours)
- **Phase F (Validation):** 2 days (~16 hours)

**Total:** 14 days (~112 hours = 2 weeks at 40 hrs/week)

---

## NEXT PHASE (After Stabilization)

Once production-hardened and staging-validated:

1. **Build React Admin Dashboard UI** (first real UI work)
2. **Integrate Stripe billing** (if needed)
3. **Deploy to production** (with production monitoring)
4. **Onboard first real client** (on staging then production)
5. **Plan Phase 2 features** (after stability established)

---

## FINAL NOTE

This sprint is not about building features.

It is about building **operational confidence**.

When this is complete, you will be able to:
- Know when something breaks
- Fix it quickly
- Trust the data
- Scale safely

That is the real value.

---

**Plan prepared by:** Architect  
**Status:** READY FOR IMPLEMENTATION  
**Start date:** Today  
**End date:** 14 days  
**Scope lock:** YES (no feature creep)
