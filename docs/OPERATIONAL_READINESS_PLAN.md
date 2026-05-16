# Operational Readiness Plan
## Agency Ops Suite → Production SaaS Operations
**Date:** May 11, 2026  
**Prepared For:** Transition from Prototype → Operator Mindset  
**Timeline:** 2-3 weeks to full operational readiness

---

## STRATEGIC CONTEXT

You have crossed the line from prototype into a legitimate operations platform:
- ✅ CRM lifecycle working
- ✅ Contracts + signing flow functional
- ✅ Invoice generation + PDF working
- ✅ Audit logging comprehensive
- ✅ Multi-app architecture solid
- ✅ Data layer proven

**Next phase is NOT more features. It's operational hardening.**

Your constraint is no longer engineering capacity. Your constraint is:
- Can you support multiple simultaneous users?
- Can you debug issues in production?
- Can you rotate secrets without downtime?
- Can you verify data integrity?
- Can you recover from disaster?

**This plan focuses exclusively on that.**

---

## PHASE 1: STABILIZATION (Days 1-3)

### Goal
Set up infrastructure that enables safe testing and change management without risking production.

### 1.1 Create Staging Environment

**Action Items:**

#### A. Staging Supabase Project
```bash
# Go to supabase.com → New Project
# Project name: agency-ops-suite-staging
# Region: Same as production (for consistency)
# Save credentials separately from production
```

**Store In:** `docs/SECRETS_INVENTORY.md` (git-ignored reference template)
```
STAGING_SUPABASE_URL = https://[staging-project].supabase.co
STAGING_SUPABASE_ANON_KEY = [staging-anon-key]
STAGING_SUPABASE_SERVICE_ROLE_KEY = [staging-service-key]
```

**Note:** Never commit actual keys. Store in 1Password or similar.

#### B. Staging Vercel Project
```bash
# Go to vercel.com → Add New → Project → Import Git Repository
# Link to: agency-ops-suite repo
# Environment: staging
# Framework: Next.js
# Build Command: npm run build:dashboard
# Output Directory: apps/admin-dashboard/.next
```

**Store:** Environment variables in Vercel dashboard (not in repo)
```
NEXT_PUBLIC_SUPABASE_URL = [staging-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [staging-anon-key]
NEXT_PUBLIC_USE_SEED_DATA = false
ADMIN_EMAIL_ALLOWLIST = staging-admin@yourcompany.com
```

#### C. Staging Stripe Account (Free)
```
https://dashboard.stripe.com/
Settings → Test Mode
Copy test keys:
  pk_test_XXXXXXXXXXX
  sk_test_XXXXXXXXXXX
```

#### D. Staging Resend Domain
```
https://resend.com/
Add domain: staging-emails.yourcompany.com
Add DNS records
Copy API key: re_XXXXXXXXXXX
```

**Success Criteria:**
- [ ] Staging Supabase accessible and empty
- [ ] Staging Vercel deployment successful
- [ ] Stripe test mode keys obtained
- [ ] Resend staging domain configured

**Effort:** 90 minutes

---

### 1.2 Lock Down Environment Management

**Create File:** `docs/SECRETS_INVENTORY.md` (reference template, do NOT commit actual keys)

```markdown
# Secrets Inventory & Rotation Schedule

## Production Secrets
| Secret | Owner | Rotation | Last Rotated | Notes |
|--------|-------|----------|--------------|-------|
| SUPABASE_SERVICE_ROLE_KEY | [Name] | Q1 | 2026-05-11 | DO NOT expose |
| STRIPE_SECRET_KEY | [Name] | Q1 | 2026-05-11 | Test before rotate |
| RESEND_API_KEY | [Name] | Q1 | 2026-05-11 | Update .env only |
| INTAKE_WEBHOOK_SECRET | [Name] | Monthly | 2026-05-11 | Rotate without downtime |

## Staging Secrets
[Same template, different values]

## Access Control
- Production keys: [Team lead] only
- Staging keys: [Dev team]
- Never post in Slack/chat
- Store in: 1Password / AWS Secrets Manager
```

**Create File:** `.env.example` (public template)

```bash
# .env.example (for repo - no actual values)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_USE_SEED_DATA=false
ADMIN_EMAIL_ALLOWLIST=admin@yourcompany.com
INTAKE_WEBHOOK_SECRET=your_secret_here
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
RESEND_API_KEY=re_xxxxx
```

**Create File:** `.gitignore` (verify no secrets tracked)

```bash
# Verify these patterns exist:
.env.local
.env.production.local
.env.staging.local
SECRETS_INVENTORY.md
*.key
*.pem
```

**Run Command:**
```bash
# Verify no secrets in git history
git log --all --full-history -S "sk_test" -- | head -5
git log --all --full-history -S "SUPABASE_SERVICE_ROLE" -- | head -5

# If found, use git filter-branch to remove
```

**Success Criteria:**
- [ ] Secrets inventory document created (in docs/)
- [ ] .env.example has no actual values
- [ ] .gitignore properly configured
- [ ] No secrets in git history (verified)
- [ ] Rotation schedule defined

**Effort:** 60 minutes

---

### 1.3 Implement Three-Environment Strategy

**Create File:** `docs/DEPLOYMENT_ENVIRONMENTS.md`

```markdown
# Deployment Environments

## LOCAL (Your Computer)
- Purpose: Feature development
- Database: local SQLite OR local Supabase
- URL: http://localhost:3000
- Auth: DEV_AUTH_BYPASS=true (local testing only)
- Data: Safe to destroy
- Never: Test against production data

## STAGING (team.staging-ops-suite.vercel.app)
- Purpose: Validation before production
- Database: Separate Supabase project
- URL: https://staging-ops-suite.vercel.app
- Auth: Real authentication
- Data: Test data only (not real customers)
- Deploy: Every merge to develop branch
- Never: Migrate production data here
- Test: All integration changes (Stripe, email, auth)

## PRODUCTION (agency-ops-suite.vercel.app)
- Purpose: Real customer data
- Database: Production Supabase project
- URL: https://agency-ops-suite.vercel.app
- Auth: Real authentication
- Data: Real customers, real invoices, real revenue
- Deploy: Manual, only after staging validation
- Protect: SSH keys, secrets, backups
- Monitor: 24/7 availability
- Backup: Daily with tested restore

## Deployment Gating

NEVER directly to production:
❌ Database migrations
❌ Authentication changes
❌ Payment flow changes
❌ RLS policy changes
❌ API contract changes
❌ Webhook integrations
❌ Email templates

Always through staging first:
✅ Run migration on staging
✅ Validate payment in Stripe test mode
✅ Send test email from staging
✅ Test RLS with staging data
✅ Verify behavior end-to-end
✅ Only then deploy to production
```

**Success Criteria:**
- [ ] Environment strategy document written
- [ ] Three separate Vercel projects created
- [ ] Three separate Supabase projects configured
- [ ] Deploy keys/automation setup (if applicable)

**Effort:** 45 minutes

---

### 1.4 Test Real Integrations (CRITICAL)

This is not "code exists" test. This is "does it actually work" test.

#### A. Stripe Payment Flow Test

**Step 1: Create Test Invoice in Staging**
```
Go: https://staging-ops-suite.vercel.app/billing
Create invoice: $99 for test client
Save invoice ID (e.g., inv_12345)
```

**Step 2: Generate Checkout Link**
```
Navigate: /api/invoices/[id]/checkout?mode=payment
(Replace [id] with actual invoice ID)
```

**Step 3: Attempt Payment**
```
Use Stripe test card: 4242 4242 4242 4242
Expiry: any future date (e.g., 12/25)
CVC: any 3 digits (e.g., 123)
```

**Step 4: Verify Webhook**
```
Wait 5 seconds
Check Stripe dashboard → Webhooks → Recent deliveries
Verify webhook payload received
```

**Step 5: Verify Invoice Marked Paid**
```
Go back to staging billing page
Check invoice status: should be "paid"
Verify timestamp updated
```

**Step 6: Verify Receipt Email**
```
Check admin email inbox
Should receive payment confirmation from Resend
Verify email formatting
```

**Possible Issues & Resolution:**
| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on checkout | Route not found | Verify Next.js route exists |
| Invalid API key | Stripe secret not in env | Check Vercel staging env vars |
| Webhook not received | Not configured | Add webhook URL in Stripe dashboard |
| Email not received | Resend not configured | Verify RESEND_API_KEY in .env |

**Success Criteria:**
- [ ] Payment completes without error
- [ ] Webhook received in Stripe
- [ ] Invoice marked "paid" in database
- [ ] Receipt email arrives in inbox

**Effort:** 30 minutes

---

#### B. Email Delivery Test

**Step 1: Send Test Email via API**
```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer [RESEND_API_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@staging-emails.yourcompany.com",
    "to": "your-test-email@gmail.com",
    "subject": "Test Email from Staging",
    "html": "<h1>Hello from Agency Ops Suite Staging</h1>"
  }'
```

**Step 2: Verify Delivery**
```
Wait 30 seconds
Check email inbox (including spam)
Verify subject, sender, content correct
```

**Step 3: Send Invoice Email**
```
Create test invoice in staging
Click "Email Invoice" button (or equivalent)
Verify email arrives
Check formatting and data
```

**Step 4: Document Email Template**
```
Create: docs/EMAIL_TEMPLATES.md
List all email types:
  - Invoice created
  - Invoice paid
  - Invoice overdue
  - Contract signed
  - New lead
  - Payment receipt
  - Password reset
  - Welcome
```

**Success Criteria:**
- [ ] Test email delivered within 1 minute
- [ ] Email appears in both inbox and Resend dashboard
- [ ] Invoice email includes correct data
- [ ] No emails in spam folder

**Effort:** 20 minutes

---

#### C. Backup & Restore Test

**Step 1: Create Backup**
```
Go: Supabase dashboard → staging project
Settings → Backups → Manual backup
Name: "2026-05-11-pre-restore-test"
Click Create
```

**Step 2: Export Backup**
```
Wait for backup to complete (5-15 min)
Download backup file locally
Verify file size > 100KB (has data)
```

**Step 3: Create Test Database**
```
Supabase dashboard → Create new project
Name: "agency-ops-suite-restore-test"
Save credentials temporarily
```

**Step 4: Restore Backup**
```
Upload backup to new database
(Follow Supabase restore documentation)
Verify tables exist
```

**Step 5: Verify Data Integrity**
```
Query restored database:
  SELECT COUNT(*) FROM clients;
  SELECT COUNT(*) FROM leads;
  SELECT COUNT(*) FROM invoices;
Verify counts match original
```

**Step 6: Test App Against Restored Data**
```
Update temporary .env with restore DB
Start local dev server
Go: http://localhost:3000
Verify: Clients list loads
Verify: Reports display
Verify: Dashboard shows data
```

**Step 7: Clean Up**
```
Delete restore test database
Document restore procedure
```

**Success Criteria:**
- [ ] Backup created and downloaded
- [ ] Data restored to new database
- [ ] Counts match original
- [ ] App works against restored data
- [ ] Restore procedure documented

**Effort:** 45 minutes

---

### 1.5 Document Operational Procedures

**Create File:** `docs/OPERATIONAL_PROCEDURES.md`

```markdown
# Operational Procedures

## Daily Checklist
- [ ] Verify staging deployment succeeded
- [ ] Check production error logs
- [ ] Verify backup completed
- [ ] Monitor Stripe webhook delivery

## Weekly Checklist
- [ ] Run E2E tests (payment, email, auth)
- [ ] Review audit logs for anomalies
- [ ] Check database size growth
- [ ] Verify all external APIs responding

## Monthly Checklist
- [ ] Rotate INTAKE_WEBHOOK_SECRET
- [ ] Review and update documentation
- [ ] Performance analysis (page load times)
- [ ] Security audit (code review)

## Incident Response
### Payment Processing Failed
1. Check Stripe dashboard for errors
2. Verify API keys in .env
3. Check webhook delivery logs
4. Notify affected customers

### Email Delivery Failed
1. Check Resend dashboard
2. Verify domain configuration
3. Check spam folder
4. Retry with updated template

### Data Integrity Issue
1. Query affected tables
2. Check audit logs
3. Verify RLS policies
4. If needed: restore from backup

### Performance Degradation
1. Check database query logs
2. Check API response times
3. Identify slow queries
4. Add indexes or optimize
```

**Success Criteria:**
- [ ] Daily checklist created
- [ ] Weekly checklist created
- [ ] Monthly checklist created
- [ ] Incident response procedures documented

**Effort:** 30 minutes

---

## PHASE 1 SUMMARY

| Task | Effort | Status |
|------|--------|--------|
| Staging Supabase | 30 min | ⏳ |
| Staging Vercel | 30 min | ⏳ |
| Staging Stripe/Resend | 30 min | ⏳ |
| Environment management docs | 60 min | ⏳ |
| Real integration tests | 95 min | ⏳ |
| Operational procedures | 30 min | ⏳ |

**PHASE 1 TOTAL: ~3.5 hours**

**Gate Before Moving to Phase 2:**
- ✅ Three environments isolated (local, staging, production)
- ✅ All secrets managed properly (no commits, inventory tracked)
- ✅ Stripe payment flow validated in staging
- ✅ Email delivery validated in staging
- ✅ Backup → Restore cycle tested and documented

---

## PHASE 2: MULTI-USER READINESS (Days 4-8)

### Goal
Enable safe multi-user access with proper role-based access control and audit trail.

### 2.1 Implement Proper RBAC (Role-Based Access Control)

**Current State:**
- Simple binary: admin vs. non-admin
- All admins have equal access
- No resource-level permissions

**Target State:**
- Five distinct roles with different capabilities
- Resource-level access control (can only edit own clients)
- Activity tracking for each action
- Immutable audit trail

#### A. Define Role Matrix

**Create File:** `docs/RBAC_MATRIX.md`

```markdown
# Role-Based Access Control Matrix

## Roles Definition

### 1. Owner
- Full system access
- Can create/delete users
- Can rotate secrets
- Can delete data
- Can access all clients
- Can run migrations
- **Assigned to:** [Your name]
- **Access level:** All

### 2. Admin
- Can manage clients
- Can view all reports
- Can create invoices
- Can process payments
- Cannot delete users
- Cannot access secrets
- Cannot run migrations
- **Example:** Team lead

### 3. Operations
- Can view clients
- Can create invoices
- Can track leads
- Can view own activity
- Cannot modify settings
- Cannot view financial data
- **Example:** Project manager

### 4. Finance
- Can view invoices
- Can process payments
- Can access payment reconciliation
- Cannot modify clients
- Cannot delete anything
- **Example:** Accountant

### 5. Client
- Can view own data only
- Can download invoices/reports
- Can submit support requests
- Cannot modify anything
- Cannot access admin areas
- **Example:** Customer account access

## Route-Level Access Control

| Route | Owner | Admin | Operations | Finance | Client |
|-------|-------|-------|-----------|---------|--------|
| /admin | ✅ | ✅ | ❌ | ❌ | ❌ |
| /clients | ✅ | ✅ | ✅ | ❌ | ❌ |
| /leads | ✅ | ✅ | ✅ | ❌ | ❌ |
| /billing | ✅ | ✅ | ✅ | ✅ | ❌ |
| /invoices | ✅ | ✅ | ✅ | ✅ | (own) |
| /reports | ✅ | ✅ | ❌ | ❌ | (own) |
| /settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| /audit-logs | ✅ | ✅ | ❌ | ❌ | ❌ |

## API-Level Access Control

```sql
-- Example RLS Policy for clients table
CREATE POLICY "Users can view assigned clients"
ON clients FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM team_members 
    WHERE role = 'owner' OR role = 'admin'
  )
  OR
  auth.uid() IN (
    SELECT user_id FROM client_assignments 
    WHERE client_id = clients.id
  )
);
```

## Data Visibility Rules

- Owner: All data
- Admin: All team data
- Operations: Team clients (not financials)
- Finance: Financial data only
- Client: Own invoice/report data only
```

**Success Criteria:**
- [ ] Five roles defined with clear responsibilities
- [ ] Route access matrix completed
- [ ] API access matrix completed
- [ ] Data visibility rules documented

**Effort:** 90 minutes

---

#### B. Implement RBAC in Code

**File:** `apps/admin-dashboard/src/lib/rbac.ts` (new file)

```typescript
// Role definitions
export type UserRole = 'owner' | 'admin' | 'operations' | 'finance' | 'client';

export interface RolePermissions {
  canManageUsers: boolean;
  canViewClients: boolean;
  canEditClients: boolean;
  canViewFinancials: boolean;
  canProcessPayments: boolean;
  canAccessSettings: boolean;
  canAccessAuditLogs: boolean;
  canRunMigrations: boolean;
}

const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    canManageUsers: true,
    canViewClients: true,
    canEditClients: true,
    canViewFinancials: true,
    canProcessPayments: true,
    canAccessSettings: true,
    canAccessAuditLogs: true,
    canRunMigrations: true,
  },
  admin: {
    canManageUsers: false,
    canViewClients: true,
    canEditClients: true,
    canViewFinancials: true,
    canProcessPayments: true,
    canAccessSettings: false,
    canAccessAuditLogs: true,
    canRunMigrations: false,
  },
  operations: {
    canManageUsers: false,
    canViewClients: true,
    canEditClients: true,
    canViewFinancials: false,
    canProcessPayments: false,
    canAccessSettings: false,
    canAccessAuditLogs: false,
    canRunMigrations: false,
  },
  finance: {
    canManageUsers: false,
    canViewClients: false,
    canEditClients: false,
    canViewFinancials: true,
    canProcessPayments: true,
    canAccessSettings: false,
    canAccessAuditLogs: false,
    canRunMigrations: false,
  },
  client: {
    canManageUsers: false,
    canViewClients: false,
    canEditClients: false,
    canViewFinancials: false,
    canProcessPayments: false,
    canAccessSettings: false,
    canAccessAuditLogs: false,
    canRunMigrations: false,
  },
};

export function getPermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission];
}
```

**File:** `apps/admin-dashboard/src/middleware.ts` (update)

```typescript
// Add role check before route handler
export function withRoleCheck(requiredRole: UserRole[]) {
  return async (req: NextRequest) => {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    if (!requiredRole.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
}
```

**Success Criteria:**
- [ ] RBAC utility functions implemented
- [ ] Middleware role checks in place
- [ ] Route protection tested
- [ ] API permissions validated

**Effort:** 180 minutes

---

#### C. Test RBAC

**Test Matrix:** `docs/RBAC_TEST_CASES.md`

```markdown
# RBAC Test Cases

## Test Case 1: Owner Access
- [ ] Login as owner
- [ ] Access /admin → Success
- [ ] Access /settings → Success
- [ ] Access all routes → Success

## Test Case 2: Admin Access
- [ ] Login as admin
- [ ] Access /clients → Success
- [ ] Access /billing → Success
- [ ] Access /settings → Forbidden (403)
- [ ] Access audit logs → Success

## Test Case 3: Operations Access
- [ ] Login as operations user
- [ ] Access /clients → Success
- [ ] Access /leads → Success
- [ ] Access /billing → Forbidden (403)

## Test Case 4: Finance Access
- [ ] Login as finance user
- [ ] Access /billing → Success
- [ ] Access /invoices → Success
- [ ] Access /clients → Forbidden (403)

## Test Case 5: Client Access
- [ ] Login as client user
- [ ] Access /client/portal → Not applicable for the internal-only tool
- [ ] Access /client/invoices → Not applicable for the internal-only tool
- [ ] Access /clients → Forbidden (403)
- [ ] Cannot see other clients' data
```

**Effort:** 60 minutes

---

### 2.2 Add Team Management

**Create File:** `apps/admin-dashboard/src/app/team/page.tsx` (new page)

```typescript
// Team management interface
// Features:
// - List all team members
// - Show role, status, last active
// - Invite new members
// - Update roles
// - Deactivate/remove members
// - Resend invite email

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'invited' | 'inactive';
  lastActive: Date;
  joinedAt: Date;
}
```

**Database Schema Addition:**

```sql
-- Add to Supabase migrations

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('owner', 'admin', 'operations', 'finance')),
  status VARCHAR NOT NULL CHECK (status IN ('active', 'invited', 'inactive')),
  invite_token VARCHAR UNIQUE,
  invite_sent_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view organization members"
ON team_members FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Only owner can modify team members"
ON team_members FOR UPDATE
USING (
  role = 'owner'
);
```

**Success Criteria:**
- [ ] Team members table created in database
- [ ] Team management UI created
- [ ] Invite workflow implemented
- [ ] Role assignment working
- [ ] RLS policies protecting data

**Effort:** 300 minutes

---

### 2.3 Immutable Audit Trail

**Requirement:** Every action tracked, immutable, queryable.

**Database Schema:**

```sql
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action VARCHAR NOT NULL,
  resource_type VARCHAR NOT NULL,
  resource_id VARCHAR,
  before_state JSONB,
  after_state JSONB,
  status VARCHAR NOT NULL CHECK (status IN ('success', 'failed')),
  error_message VARCHAR,
  ip_address INET,
  user_agent VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disable all mutations (immutable)
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit events are immutable (insert only)"
ON audit_events AS INSERT
WITH CHECK (true);

CREATE POLICY "Users can view audit events (read only)"
ON audit_events AS SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM team_members 
    WHERE user_id = auth.uid()
  )
);
```

**Audit Trigger (example):**

```sql
CREATE OR REPLACE FUNCTION audit_client_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_events (
    user_id, action, resource_type, resource_id,
    before_state, after_state, status, ip_address
  ) VALUES (
    auth.uid(),
    TG_OP,
    'client',
    NEW.id,
    TO_JSONB(OLD),
    TO_JSONB(NEW),
    'success',
    inet_client_addr()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_clients_insert
AFTER INSERT ON clients
FOR EACH ROW EXECUTE FUNCTION audit_client_changes();
```

**Success Criteria:**
- [ ] Audit events table created
- [ ] RLS policies immutable
- [ ] Triggers logging all changes
- [ ] Audit logs queryable in dashboard

**Effort:** 120 minutes

---

### 2.4 Session Management & Security

**Create File:** `docs/SESSION_MANAGEMENT.md`

```markdown
# Session Management & Security

## Session Timeout
- Idle timeout: 2 hours
- Absolute timeout: 8 hours
- Reminder at: 1 hour 50 minutes

## Force Logout
```sql
-- Create endpoint to revoke all user sessions
POST /api/admin/revoke-sessions?user_id=XXX
-- Invalidates all tokens immediately
```

## Password Reset
```sql
-- Secure password reset flow
1. User requests reset
2. Email sent with one-time token (valid 30 min)
3. Token redeemed for new password
4. All sessions invalidated
5. Audit logged
```

## Failed Login Tracking
```sql
-- Prevent brute force
- Track failed attempts per email
- Lock after 5 attempts
- Lock duration: 15 minutes
- Notify owner
```
```

**Success Criteria:**
- [ ] Session timeout implemented
- [ ] Logout workflow verified
- [ ] Password reset secure
- [ ] Brute force protection active

**Effort:** 120 minutes

---

## PHASE 2 SUMMARY

| Task | Effort | Status |
|------|--------|--------|
| RBAC matrix definition | 90 min | ⏳ |
| RBAC code implementation | 180 min | ⏳ |
| RBAC testing | 60 min | ⏳ |
| Team management feature | 300 min | ⏳ |
| Immutable audit trail | 120 min | ⏳ |
| Session management | 120 min | ⏳ |

**PHASE 2 TOTAL: ~16 hours (2 days intensive)**

**Gate Before Moving to Phase 3:**
- ✅ Five distinct roles implemented
- ✅ Route-level access control tested
- ✅ API-level access control tested
- ✅ Team member management working
- ✅ Immutable audit trail logging all actions
- ✅ Multi-user simultaneous access tested

---

## PHASE 3: OPERATIONAL HARDENING (Days 9-15)

### Goal
Set up monitoring, alerting, and disaster recovery systems.

### 3.1 Add Sentry for Error Tracking

**Why:** Errors happen in production. You need to know immediately.

**Steps:**

1. **Create Sentry Account**
   ```
   https://sentry.io
   Create organization
   Create project → Next.js
   Get DSN
   ```

2. **Install Sentry SDK**
   ```bash
   npm install @sentry/nextjs --workspace apps/admin-dashboard
   ```

3. **Configure**
   ```typescript
   // sentry.client.config.ts
   import * as Sentry from "@sentry/nextjs";
   
   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
     tracesSampleRate: 0.1,
   });
   ```

4. **Set Environment Variables**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN = https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
   NEXT_PUBLIC_ENVIRONMENT = production
   ```

5. **Test Error Capture**
   ```bash
   curl https://your-app.vercel.app/api/test-error
   Check Sentry dashboard → errors appear
   ```

**Success Criteria:**
- [ ] Sentry project created
- [ ] SDK installed and configured
- [ ] Test error captured
- [ ] Dashboard accessible
- [ ] Alerts configured

**Effort:** 90 minutes

---

### 3.2 Add Uptime Monitoring

**Option A: Simple (Recommended for now)**

```bash
# Use UptimeRobot (free tier)
1. Go: https://uptimerobot.com
2. Add monitor: https://agency-ops-suite.vercel.app
3. Check interval: Every 5 minutes
4. Alert: Email if down
5. Test: curl to trigger alert
```

**Option B: Advanced (Later)**
```
- Better Stack (paid)
- Synthetic monitoring
- Performance tracking
- Status page for customers
```

**Success Criteria:**
- [ ] UptimeRobot configured
- [ ] Monitoring active
- [ ] Alerts working
- [ ] Test alert received

**Effort:** 15 minutes

---

### 3.3 Daily Backup Automation

**Current:** Manual backups  
**Target:** Automated daily with verified restore

**Steps:**

1. **Enable Automated Backups (Supabase)**
   ```
   Supabase Dashboard → Settings → Backup
   Enable automatic backups
   Retention: 30 days
   ```

2. **Test Backup Schedule**
   ```
   Wait 24 hours
   Verify backup appears in dashboard
   Download backup locally
   Store in safe location
   ```

3. **Create Restore Test Procedure**
   ```
   docs/BACKUP_RESTORE_PROCEDURE.md:
   
   1. Download latest backup
   2. Create test database
   3. Upload backup
   4. Verify data integrity
   5. Test app against restored data
   6. Document any issues
   7. Clean up test database
   
   Run this procedure: Monthly (first Monday)
   Owner responsible: [Your name]
   ```

**Success Criteria:**
- [ ] Automated backups enabled
- [ ] Backup schedule verified
- [ ] Restore procedure documented
- [ ] Monthly restore test scheduled

**Effort:** 45 minutes

---

### 3.4 Webhook Monitoring

**Current State:** Webhooks configured but monitoring unknown

**Add Monitoring:**

```sql
-- Create webhook event log
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR NOT NULL, -- 'stripe', 'resend'
  event_type VARCHAR NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('received', 'processed', 'failed')),
  error_message VARCHAR,
  processed_at TIMESTAMP,
  received_at TIMESTAMP DEFAULT NOW()
);

-- Query: Recent webhook failures
SELECT * FROM webhook_events
WHERE status = 'failed'
AND received_at > NOW() - INTERVAL '24 hours'
ORDER BY received_at DESC;
```

**Dashboard Widget:**
```
Stripe Webhooks (Last 24h)
- Received: 47
- Failed: 0
- Average latency: 245ms

Resend Webhooks (Last 24h)
- Received: 12
- Failed: 0
- Average latency: 180ms
```

**Alert Threshold:**
```
If failed webhooks > 5 in 1 hour → Alert
If average latency > 1000ms → Alert
```

**Success Criteria:**
- [ ] Webhook event logging implemented
- [ ] Dashboard widget shows status
- [ ] Alerts configured for failures
- [ ] 24-hour history visible

**Effort:** 90 minutes

---

### 3.5 Database Health Monitoring

**Queries to Monitor:**

```sql
-- 1. Database size
SELECT pg_size_pretty(pg_database_size('postgres')) AS db_size;

-- 2. Slow queries
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 3. Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 4. Row counts
SELECT tablename, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- 5. RLS policy status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY tablename;
```

**Create Dashboard Page:** `apps/admin-dashboard/src/app/admin/database-health/page.tsx`

```typescript
// Display:
// - Database size
// - Row counts by table
// - Slow queries
// - RLS policy verification
// - Connection count
// - Replication status (if applicable)
```

**Success Criteria:**
- [ ] Database health page created
- [ ] Slow query tracking implemented
- [ ] Size alerts configured
- [ ] Weekly size trend visible

**Effort:** 120 minutes

---

### 3.6 Operational Documentation

**Create File:** `docs/RUNBOOKS.md`

```markdown
# Operational Runbooks

## Incident: Payment Processing Down

**Symptoms:** Customers can't pay

**Resolution (15 min):**
1. Check Stripe status: https://status.stripe.com
2. Verify API keys in .env
3. Check webhook delivery in Stripe dashboard
4. Review recent code changes (if deployed recently)
5. If still broken: Rollback last deployment
6. Notify customers of delay

## Incident: Email Delivery Failing

**Symptoms:** No invoices/notifications reaching customers

**Resolution (10 min):**
1. Check Resend dashboard for errors
2. Verify domain DNS records
3. Check DKIM/SPF/DMARC configuration
4. Review recent email template changes
5. If still broken: Use fallback email method

## Incident: Database Connection Limit Exceeded

**Symptoms:** App returning 500 errors

**Resolution (20 min):**
1. Check current connections: SELECT count(*) FROM pg_stat_activity;
2. Identify long-running queries
3. Terminate idle connections
4. Check for connection leaks in code
5. If pattern repeats: Increase connection pool size

## Incident: Slow Page Load Times

**Symptoms:** Dashboard taking > 2 seconds to load

**Resolution (30 min):**
1. Check database slow queries
2. Add missing indexes
3. Optimize N+1 query patterns
4. Check API response times
5. If needed: Deploy optimized version

## Maintenance: Rotating Secrets

**Procedure:**
1. Generate new secret
2. Update in production .env
3. Redeploy application
4. Verify app still works
5. Update old secret in SECRETS_INVENTORY.md
6. Archive old secret
```

**Success Criteria:**
- [ ] Runbooks written for common issues
- [ ] Incident response procedures documented
- [ ] Escalation path clear
- [ ] Team trained on runbooks

**Effort:** 90 minutes

---

## PHASE 3 SUMMARY

| Task | Effort | Status |
|------|--------|--------|
| Sentry setup | 90 min | ⏳ |
| Uptime monitoring | 15 min | ⏳ |
| Backup automation | 45 min | ⏳ |
| Webhook monitoring | 90 min | ⏳ |
| Database health | 120 min | ⏳ |
| Runbooks | 90 min | ⏳ |

**PHASE 3 TOTAL: ~8.5 hours (1 day)**

**Gate Before Moving to Phase 4:**
- ✅ Sentry error tracking working
- ✅ Uptime monitoring active
- ✅ Automated backups verified
- ✅ Webhook monitoring dashboard visible
- ✅ Database health dashboard built
- ✅ Operational runbooks documented

---

## PHASE 4: REVENUE AUTOMATION (Days 16-21)

### Goal
Automate the complete client lifecycle: Lead → Invoice → Payment → Provisioning

### 4.1 Automated Lead-to-Client Pipeline

```
Lead arrives
  ↓
Lead reviewed (manual)
  ↓
Lead converted to prospect
  ↓
Proposal auto-generated (template)
  ↓
Email sent to prospect
  ↓
Prospect reviews & signs
  ↓
Client created from signed contract
  ↓
Invoice auto-generated
  ↓
Payment link sent
  ↓
Payment received → Supabase webhook
  ↓
Invoice marked paid
  ↓
Provisioning script triggered
  ↓
Deployment checklist created
  ↓
Client access portal activated
```

**Implement Step-by-Step:**

1. **Lead Review Workflow** (1-2 hours)
   - Lead enters system
   - Admin reviews
   - Approves → Auto-converts to prospect
   - Rejects → Marked as "no-fit"

2. **Proposal Auto-Generation** (2-3 hours)
   - Template system
   - Data merge (prospect name, project details)
   - PDF generation
   - Email sending

3. **Contract Signing Integration** (2-3 hours)
   - Already built, needs integration
   - Post-signature webhook
   - Trigger client creation

4. **Invoice Auto-Generation** (1-2 hours)
   - On contract signature
   - Based on proposal pricing
   - Email to client + admin

5. **Payment Success Workflow** (1-2 hours)
   - Stripe webhook receipt
   - Invoice marked paid
   - Trigger provisioning
   - Send welcome email

6. **Provisioning Integration** (2-4 hours)
   - Call provisioning CLI
   - Track status in dashboard
   - Update client status
   - Send status emails

**Success Criteria:**
- [ ] Lead → Client workflow automated
- [ ] Zero manual intervention needed for happy path
- [ ] Each step has logging/audit trail
- [ ] Dashboard shows pipeline progress
- [ ] Entire flow tested 3x end-to-end

**Effort:** 12-18 hours (spread over days)

---

### 4.2 Performance Optimization

Now that you have a working system, optimize:

1. **Database Indexes** (2-3 hours)
   - Add indexes on frequently-queried fields
   - Measure query time before/after
   - Target: < 100ms for dashboard queries

2. **Caching** (1-2 hours)
   - Cache client list (invalidate on change)
   - Cache report snapshots
   - Cache audit log summary

3. **Page Load Time** (1-2 hours)
   - Measure with WebVitals
   - Target: < 300ms First Contentful Paint
   - Optimize images, bundle size

4. **API Response Time** (1-2 hours)
   - Profile API endpoints
   - Add request/response logging
   - Target: < 200ms for all endpoints

**Success Criteria:**
- [ ] Dashboard loads in < 300ms
- [ ] API endpoints respond in < 200ms
- [ ] Database queries run in < 100ms
- [ ] Performance metrics dashboard shows trends

**Effort:** 6-9 hours

---

### 4.3 Revenue Dashboard

Create comprehensive financial visibility:

```
Revenue Dashboard
├─ This Month
│  ├─ Total invoiced: $X
│  ├─ Amount collected: $X
│  ├─ Outstanding: $X
│  └─ Collection rate: X%
├─ Client Breakdown
│  ├─ [Client 1]: $X (paid)
│  ├─ [Client 2]: $X (pending 7 days)
│  └─ [Client 3]: $X (overdue)
├─ Pipeline
│  ├─ Leads: X
│  ├─ Proposals: X
│  ├─ Contracts: X
│  └─ Conversion rate: X%
└─ Trend
   ├─ MRR: $X (up/down vs last month)
   └─ Growth rate: X%
```

**Effort:** 4-6 hours

---

## PHASE 4 SUMMARY

| Task | Effort | Status |
|------|--------|--------|
| Lead-to-payment pipeline | 12-18 hours | ⏳ |
| Performance optimization | 6-9 hours | ⏳ |
| Revenue dashboard | 4-6 hours | ⏳ |

**PHASE 4 TOTAL: 22-33 hours (2-3 days)**

**Gate: Full System Ready**
- ✅ Lead arrives automatically, no manual data entry
- ✅ Proposal auto-generates from template
- ✅ Contract signature triggers invoice
- ✅ Payment completion triggers provisioning
- ✅ Client-facing surface was historically activated in earlier planning notes
- ✅ Revenue dashboard shows real-time metrics
- ✅ Dashboard load time < 300ms
- ✅ All workflows tested 3x with real data

---

## COMPLETE TIMELINE

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| **Phase 1: Stabilization** | 3.5 hours | Three isolated environments |
| **Phase 2: Multi-User** | 16 hours | RBAC + team management |
| **Phase 3: Hardening** | 8.5 hours | Monitoring + runbooks |
| **Phase 4: Automation** | 22-33 hours | Lead-to-payment pipeline |

**TOTAL: 50-61 hours over 2-3 weeks**

---

## SUCCESS CRITERIA (ALL GATES)

### ✅ Before First Customer
- [ ] Three environments isolated
- [ ] All integration tests passing
- [ ] Backup restore procedure tested
- [ ] RBAC implemented and tested
- [ ] Multi-user safety validated

### ✅ Before Scaling (5+ customers)
- [ ] Monitoring dashboard shows green status
- [ ] Error tracking (Sentry) active
- [ ] Performance benchmarks established
- [ ] Security audit completed
- [ ] Provisioning integrated with dashboard

### ✅ For Revenue Automation
- [ ] Complete lead-to-payment flow works
- [ ] Zero manual data entry in happy path
- [ ] Financial dashboard accurate
- [ ] Provisioning automatic
- [ ] Team can operate without your direct involvement

---

## DISCIPLINE CHECKLIST

**These are the rules you must follow:**

1. ❌ **Never skip** staging environment testing
   - Always test changes in staging first
   - Never deploy directly to production

2. ❌ **Never skip** backup testing
   - Monthly restore verification mandatory
   - Document any issues

3. ❌ **Never skip** RBAC enforcement
   - Every new route must have role check
   - Every new API must verify permissions

4. ❌ **Never add** features until stabilization complete
   - Your only focus right now: Phase 1-3
   - Phase 4 is release celebration, not new work

5. ✅ **Always document** operational procedures
   - Every incident → update runbook
   - Every bug → add test case
   - Every question → update FAQ

6. ✅ **Always track** decisions in git
   - Commit messages explain why, not just what
   - Architecture decisions in docs/
   - Breaking changes documented

---

## OPERATOR MINDSET SHIFT

**BEFORE (Prototype):**
- "Does it work?" (Yes/No)
- Feature → Ship
- Break something → Fix it
- Single operator

**AFTER (SaaS Operations):**
- "Can someone other than me run it?" (Documented procedures)
- Feature → Stage → Validate → Production
- Prevent something breaking (monitoring + alerts)
- Multi-team ready
- Change follows gating process
- Decisions tracked and reversible

---

## FINAL RECOMMENDATION

**Execute in this exact order:**

1. **Day 1-2:** Phase 1 (Stabilization)
   - Get three environments working
   - Test all integrations
   - Document procedures

2. **Day 3-4:** Phase 2 (Multi-User)
   - Implement RBAC
   - Add team management
   - Test simultaneous users

3. **Day 5:** Phase 3 (Hardening)
   - Add monitoring
   - Set up backups
   - Write runbooks

4. **Day 6-10:** Phase 4 (Automation)
   - Automate pipeline
   - Optimize performance
   - Revenue dashboard

5. **After:** Maintain Discipline
   - Follow gating process
   - Update documentation
   - Monitor metrics

---

**Prepared by:** Architect (Operational Strategy)  
**Date:** May 11, 2026  
**Review Schedule:** Weekly during Phase 1-3, Then monthly

**READY TO BEGIN. Let's make this operational. 🚀**
