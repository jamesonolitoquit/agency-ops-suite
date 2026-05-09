# Phase 2A Proposal Generator - Architecture Specification

## Overview
The Proposal Generator automatically creates professional web development proposals with accurate pricing and scope based on audit findings. Sales team can generate proposals in seconds, auto-filled with audit data, and send directly to prospects.

**Business Value:**
- Convert cold leads to warm leads (audit + proposal = sales engagement)
- Professional delivery: branded proposals increase conversion 23%
- Speed: generate proposals in < 30s vs. 2-3 hours manual
- Accuracy: pricing auto-calculated from audit issues

---

## Database Schema

### Table: `proposals`
```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source data
  audit_id UUID REFERENCES audit_reports(id) ON DELETE SET NULL,
  prospect_email TEXT,
  prospect_name TEXT,
  prospect_company TEXT,
  
  -- Content
  project_scope TEXT, -- "Basic" | "Standard" | "Premium" | "Custom"
  proposed_timeline_weeks INT,
  deliverables JSONB, -- Array of deliverable items with hours
  
  -- Pricing
  estimated_cost_low INT,
  estimated_cost_high INT,
  final_quote INT,
  
  -- Metadata
  project_name TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP DEFAULT (now() + interval '30 days'),
  
  -- Sharing & Status
  public_token VARCHAR(32) UNIQUE,
  is_public BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft', -- "draft" | "sent" | "accepted" | "declined"
  sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  
  -- Version control
  version INT DEFAULT 1,
  parent_proposal_id UUID REFERENCES proposals(id)
);

CREATE INDEX idx_proposals_created_by ON proposals(created_by);
CREATE INDEX idx_proposals_audit_id ON proposals(audit_id);
CREATE INDEX idx_proposals_public_token ON proposals(public_token);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_expires_at ON proposals(expires_at);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own proposals" ON proposals
  FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users create proposals" ON proposals
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users update own proposals" ON proposals
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Public proposals viewable" ON proposals
  FOR SELECT USING (is_public = true);
```

### Table: `proposal_templates`
```sql
CREATE TABLE proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template metadata
  name TEXT NOT NULL, -- "Standard Web Design" | "E-commerce Build" etc.
  project_type TEXT NOT NULL,
  
  -- Template content
  header_text TEXT,
  intro_paragraph TEXT,
  included_items JSONB, -- Array of scope items
  excluded_items JSONB, -- Array of non-included items
  process_steps JSONB, -- Design → Development → Testing → Launch
  footer_text TEXT,
  
  -- Pricing structure
  base_cost INT,
  add_on_multipliers JSONB, -- { "performance_issue": 1.2, "seo_issue": 0.8 }
  
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);
```

### Table: `proposal_audit_log`
```sql
CREATE TABLE proposal_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  action TEXT, -- "created" | "shared" | "viewed" | "accepted" | "declined"
  prospect_ip TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## Component Architecture

### Backend Services

#### 1. `src/lib/proposal-service.ts`
Core business logic for proposal generation, similar to audit-service.

**Exports:**
- `generateProposal(auditId, templateType, prospectEmail)`: Create from audit
- `createCustomProposal(data)`: Manual proposal creation
- `getProposalById(id)`: Fetch proposal (auth required)
- `getPublicProposal(token)`: Public endpoint
- `listProposals(userId)`: User's proposals
- `updateProposalStatus(id, status)`: Mark accepted/declined
- `calculateProposalCost(audit, scope)`: Smart pricing algorithm
- `renderProposalHTML(proposal)`: HTML for PDF/email
- `generatePublicToken()`: Secure token

**Key Logic:**
```typescript
// Cost calculation from audit issues
function calculateProposalCost(audit, scope) {
  const issueHours = {
    critical: 4 * count,
    high: 2 * count,
    medium: 1 * count
  }
  
  const scopeMultiplier = {
    Basic: 1.0,      // Fix critical issues
    Standard: 1.3,   // Add high issues
    Premium: 1.6,    // All issues fixed
    Custom: manual
  }
  
  return {
    low: Math.round(issueHours * scopeMultiplier * 150 * 1.1),
    high: Math.round(issueHours * scopeMultiplier * 150 * 1.3)
  }
}
```

#### 2. API Routes
- **POST /api/proposal/generate** - Create from audit
  - Input: `{ auditId, templateType, prospectEmail }`
  - Output: `{ proposalId, publicToken }`

- **POST /api/proposal/create** - Manual proposal
  - Input: Full proposal data
  - Output: `{ proposalId }`

- **GET /api/proposal/[id]** - Fetch proposal (auth)
  - Output: Full proposal with HTML rendered

- **GET /api/proposal/public/[token]** - Public access (no auth)
  - Output: Proposal HTML optimized for viewing

- **PATCH /api/proposal/[id]** - Update status/content
  - Input: `{ status, final_quote }`
  - Output: Updated proposal

- **POST /api/proposal/[id]/send** - Send via email
  - Input: `{ prospect_email }`
  - Output: `{ success, shared_link }`

### Frontend Pages

#### 1. `/proposal` (List View)
- **Component:** ProposalList.tsx
- **Features:**
  - List all user proposals
  - Status badges (draft, sent, accepted, expired)
  - Filter by status
  - Search by prospect company
  - Quick actions (view, send, edit, duplicate)
  - Bulk operations (send multiple, archive)

#### 2. `/proposal/new` (Create Form)
- **Component:** ProposalForm.tsx with multi-step:
  - **Step 1:** Choose audit to base proposal on
    - Auto-fills: project_type, initial cost estimate
    - Shows audit scores
  - **Step 2:** Select scope level
    - "Basic": Fix critical issues
    - "Standard": Fix critical + high issues
    - "Premium": Fix all issues
    - "Custom": Manual scope
    - Shows updated cost estimate
  - **Step 3:** Prospect details
    - Name, email, company
    - Custom intro message
  - **Step 4:** Review & send
    - Preview rendered proposal
    - Final quote review
    - Option to send immediately or save as draft

#### 3. `/proposal/[id]` (Detail/Edit)
- **Component:** ProposalDetail.tsx
- **Features:**
  - Edit proposal content
  - Update final quote
  - View prospect engagement (opened, viewed sections)
  - Send/resend to prospect
  - Copy link to clipboard
  - Mark accepted/declined
  - View version history
  - Edit scope and rebuild pricing

#### 4. `/proposal/report/[token]` (Public View)
- **Component:** ProposalPublic.tsx
- **Features:**
  - Professional PDF-like rendering
  - No auth required
  - Prospect can:
    - View detailed scope
    - See pricing breakdown
    - Click "Accept" button
    - Request modifications
  - Logs: page views, section views, acceptance clicks

#### 5. `/proposal/templates` (Admin)
- Manage proposal templates
- Create custom scopes
- Set multipliers and pricing
- Test template rendering

### Frontend Components

#### ProposalForm.tsx (Multi-step)
```typescript
interface ProposalFormProps {
  auditId?: string;
  templateType?: string;
  onSuccess?: (proposalId: string) => void;
}

// Steps:
// 1. SelectAudit - choose source audit
// 2. SelectScope - Basic/Standard/Premium/Custom
// 3. ProspectInfo - name, email, company
// 4. ReviewProposal - preview + send
```

#### ProposalResults.tsx
```typescript
interface ProposalResultsProps {
  proposal: Proposal;
  editable?: boolean;
}
// Render:
// - Header (company, project name)
// - Executive summary
// - Current website issues (from audit)
// - Proposed solution breakdown
// - Deliverables with timeline
// - Pricing summary
// - Terms & conditions
// - Signature area
```

#### ProposalCard.tsx
```typescript
// List item showing:
// - Prospect company & name
// - Status badge
// - Sent date
// - Last action date
// - Cost estimate
// - Quick actions menu
```

#### ProposalPreview.tsx
```typescript
// Mobile/desktop preview of rendered proposal
// PDF-like styling
// Responsive layout
```

---

## Proposal Content Template

```
Header:
┌─────────────────────────────────────┐
│ Agency Branding                     │
│ Web Development Proposal             │
│ Generated: [Date]                   │
│ Valid Until: [Date]                 │
└─────────────────────────────────────┘

Executive Summary:
"We reviewed {{prospect_company}}'s website and identified {{issue_count}} 
critical issues affecting performance and conversions. This proposal outlines 
our recommended solutions and associated costs."

Current Situation:
- Website URL: {{website_url}}
- Project Type: {{project_type}}
- Performance Score: {{performance}}/100
- Critical Issues: {{critical_count}}
- High Priority Issues: {{high_count}}

Identified Issues:
[List from audit results]
├─ Performance: {{performance_issues}}
├─ SEO: {{seo_issues}}
├─ Accessibility: {{accessibility_issues}}
└─ Best Practices: {{best_practices_issues}}

Recommended Solution ({{scope}} Scope):
[Include/Exclude based on scope selection]

Deliverables:
- Item 1: {{hours}} hours, {{cost}}
- Item 2: {{hours}} hours, {{cost}}
...
- Total: {{total_hours}} hours

Timeline:
- Phase 1: Design (weeks 1-2)
- Phase 2: Development (weeks 3-5)
- Phase 3: Testing (week 6)
- Phase 4: Launch (week 7)
Duration: {{timeline_weeks}} weeks

Investment:
- Low Estimate: ${{estimate_low}}
- High Estimate: ${{estimate_high}}
- Final Quote: ${{final_quote}}
- Payment Terms: 50% upfront, 50% on completion

Next Steps:
1. Review this proposal
2. Accept or request modifications
3. Sign contract
4. Project begins
```

---

## API Response Examples

### Generate Proposal
```json
{
  "success": true,
  "proposalId": "550e8400-e29b-41d4-a716-446655440000",
  "publicToken": "7a8b9c0d1e2f3a4b5c6d7e8f",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "prospect_company": "TechCorp Inc",
    "prospect_email": "john@techcorp.com",
    "estimated_cost_low": 8500,
    "estimated_cost_high": 12000,
    "project_scope": "Standard",
    "status": "draft",
    "public_token": "7a8b9c0d1e2f3a4b5c6d7e8f",
    "created_at": "2026-05-03T14:30:00Z"
  }
}
```

### Fetch Public Proposal
```json
{
  "prospect_company": "TechCorp Inc",
  "project_name": "Website Redesign & Optimization",
  "status": "sent",
  "sent_at": "2026-05-03T14:35:00Z",
  "final_quote": 10500,
  "deliverables": [
    {
      "name": "Performance Optimization",
      "hours": 12,
      "cost": 1800
    },
    {
      "name": "SEO Improvements",
      "hours": 8,
      "cost": 1200
    }
  ],
  "expires_at": "2026-06-02T14:30:00Z",
  "public_token": "7a8b9c0d1e2f3a4b5c6d7e8f"
}
```

---

## Security & Compliance

### Authentication
- Private endpoints require Supabase auth
- Public endpoints use secure tokens (32-char hex)
- Proposal ownership verified on all write operations

### Data Protection
- RLS policies enforce user isolation
- Public proposals show only non-sensitive data
- Email delivery logs prospect opens (privacy-compliant)

### Audit Trail
- Track proposal creation, modifications, sends
- Log prospect views and acceptance
- Maintain version history

---

## Performance Targets

- ✅ Proposal generation: < 5s (including email send)
- ✅ Page load: < 1s
- ✅ Public report rendering: < 2s
- ✅ Cost calculation: < 100ms

---

## Acceptance Criteria

- ✅ Generate proposal from audit in < 5s
- ✅ 4 scope levels with accurate pricing
- ✅ Public link sharing (no auth)
- ✅ Email delivery with tracking
- ✅ Status updates (sent, accepted, declined)
- ✅ Professional PDF-like rendering
- ✅ Mobile responsive
- ✅ Version control (duplicate/modify previous)

---

## Implementation Plan

### Phase 1: Core Infrastructure (2 hours)
- Create database tables and RLS policies
- Build proposal-service.ts with core functions
- Create API routes (generate, fetch, update status)

### Phase 2: Frontend UI (2 hours)
- ProposalForm multi-step component
- ProposalList page
- ProposalDetail page with editing
- ProposalPublic page

### Phase 3: Integration & Testing (1.5 hours)
- E2E tests covering all flows
- Email integration (optional for Phase 2A)
- Public link sharing test
- Proposal status workflow

### Phase 4: Polish & Documentation (1 hour)
- Mobile responsive refinements
- Performance optimization
- Documentation & runbooks

**Total Estimated Time: 6.5 hours**

---

## Success Metrics

- Sales team generates 10+ proposals per week
- 35%+ of proposals convert to accepted projects
- Average time to generate proposal: < 2 minutes
- 40%+ proposal acceptance rate (vs. manual 25%)

---

## Integration Points

**Upstream (Audit Generator):**
- Auto-populate from audit results
- Reference audit scores in proposal
- Link to audit data

**Downstream (Contract Generator):**
- Generate contract from accepted proposal
- Auto-populate terms and pricing
- Create delivery timeline

**Email/Notifications:**
- Send proposal to prospect (future)
- Notify team when proposal accepted
- Remind prospect when expiring

---

**Status**: Ready for implementation  
**Priority**: High (revenue impact)  
**Team**: 1 developer, ~6.5 hours
