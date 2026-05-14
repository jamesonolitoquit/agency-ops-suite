# Phase 2B: Contract Generator - Architectural Specification

**Status:** Design Phase  
**Priority:** High  
**Estimated Implementation:** 3-4 hours  
**Dependencies:** Phase 2A (Audit & Proposal Generators)

---

## 📋 Executive Summary

The Contract Generator transforms accepted proposals into professional service contracts in seconds. It provides:
- ✅ Auto-populated contracts from proposals
- ✅ Contract templates by project type
- ✅ Version control (track contract iterations)
- ✅ Status tracking (draft → sent → signed → completed)
- ✅ E-signature ready format
- ✅ Public sharing with secure tokens
- ✅ Full audit trail logging

**Goal:** Sales teams send contracts within 5 minutes of proposal acceptance.

---

## 🎯 Feature Requirements

### Core Features
1. **Generate from Proposal** - Auto-create contract from accepted proposal
2. **Contract Templates** - Pre-built templates by project type
3. **Smart Population** - Auto-fill prospect/company/deliverables/pricing
4. **Status Workflow** - Track lifecycle (draft → sent → signed → completed)
5. **Version Control** - Track contract iterations
6. **Public Sharing** - Secure link for clients to review/sign
7. **Action Logging** - Full audit trail of all actions
8. **Cost Tracking** - Final contract cost vs proposal estimate

### User Stories
- **Sales Manager:** "I need to send a contract to the client in <5 minutes after they accept the proposal"
- **Operations:** "I need to track which contracts are signed and when"
- **Finance:** "I need final contract amounts for invoicing"
- **Legal:** "I need an audit trail of all contract versions and actions"

---

## 🏗️ System Architecture

### Data Model

```
contracts
├─ id (uuid, primary key)
├─ proposal_id (uuid, foreign key)
├─ contract_number (string, e.g., "C-2026-001")
├─ contract_type (enum: service | retainer | maintenance)
├─ prospect_id (string - email-based identifier)
├─ prospect_name (string)
├─ prospect_email (string)
├─ prospect_company (string)
├─ prospect_signature (jsonb - {signed_at, ip, user_agent})
├─ project_name (string)
├─ project_description (text)
├─ start_date (date)
├─ end_date (date)
├─ timeline_weeks (integer)
├─ deliverables (jsonb array of {name, description, hours, cost, category})
├─ contract_cost_low (integer)
├─ contract_cost_high (integer)
├─ final_cost (integer, null until signed)
├─ payment_terms (string, e.g., "50% upfront, 50% on completion")
├─ acceptance_criteria (jsonb array of {criterion, description})
├─ terms_and_conditions (text)
├─ nda_included (boolean)
├─ status (enum: draft | sent | reviewed | signed | completed | declined)
├─ version (integer, auto-increment)
├─ parent_contract_id (uuid, null if first version)
├─ public_token (string, 32-char hex, for public sharing)
├─ is_public (boolean)
├─ sent_at (timestamp)
├─ signed_at (timestamp)
├─ completed_at (timestamp)
├─ expires_at (timestamp)
├─ created_by (uuid, foreign key to auth.users)
├─ created_at (timestamp, auto)
├─ updated_at (timestamp, auto)
```

### Relationships
```
proposals → contracts (1:many)
  - One proposal can generate multiple contract versions
  - Foreign key: contracts.proposal_id → proposals.id

contracts → contract_versions (implicit via version + parent_contract_id)
  - Version 1: initial creation
  - Version 2+: amendments/updates
  - Tracks full audit trail

contracts → contract_audit_log (1:many)
  - One contract has many action logs
  - Actions: created, sent, viewed, signed, updated, archived
```

### Contract Templates

```
contract_templates
├─ id (uuid)
├─ name (string)
├─ project_type (enum: landing-page | ecommerce | corporate | saas | blog | custom)
├─ contract_type (enum: service | retainer | maintenance)
├─ content (text - markdown with {{variable}} placeholders)
├─ terms_template (text - T&C template)
├─ payment_terms_default (string)
├─ nda_template (text - NDA template)
├─ accepted_criteria_template (jsonb array)
├─ created_by (uuid)
├─ created_at (timestamp)
└─ is_default (boolean)
```

**Template Variables (auto-replaced):**
```
{{prospect_name}}          Client contact name
{{prospect_company}}       Client company
{{project_name}}           Project name
{{project_description}}    Detailed description
{{start_date}}             Project start date (formatted)
{{end_date}}               Project end date (formatted)
{{timeline_weeks}}         Duration in weeks
{{deliverables_list}}      HTML table of deliverables
{{total_cost}}             Final contract cost
{{payment_terms}}          Payment schedule
{{contract_number}}        Auto-generated reference
{{contract_date}}          Contract creation date
{{nda_section}}            NDA section (if included)
```

---

## 💻 Backend Implementation

### Service: `src/lib/contract-service.ts`

**Core Functions:**

```typescript
// Generate contract from accepted proposal
async generateContractFromProposal(params: {
  proposalId: string;
  userId: string;
  contractType?: 'service' | 'retainer' | 'maintenance';
  includeNda?: boolean;
}): Promise<{success: boolean, contractId: string, publicToken: string}>

// Create custom contract
async createContract(data: ContractData, userId: string): Promise<Contract>

// Fetch contract
async getContractById(id: string, userId: string): Promise<Contract>

// Fetch public contract (no auth required)
async getPublicContract(token: string): Promise<Contract | null>

// List user's contracts
async listContracts(userId: string, filters?: {
  status?: ContractStatus;
  proposal_id?: string;
  limit?: number;
}): Promise<Contract[]>

// Update contract status
async updateContractStatus(
  id: string,
  status: ContractStatus,
  userId: string
): Promise<Contract>

// Generate contract number (e.g., "C-2026-001")
async generateContractNumber(): Promise<string>

// Populate contract from template
async populateContractContent(
  templateId: string,
  data: ContractData
): Promise<string>

// Create contract version (for amendments)
async createContractVersion(
  contractId: string,
  updates: Partial<ContractData>,
  userId: string,
  changeReason: string
): Promise<Contract>

// Sign contract
async signContract(params: {
  token: string;
  signature_ip: string;
  signature_user_agent: string;
}): Promise<{success: boolean, signedAt: string}>

// Generate public token
function generatePublicToken(): string

// Log contract action
async logContractAction(params: {
  contract_id: string;
  action: string;
  prospect_ip?: string;
  details?: Record<string, any>;
}): Promise<void>
```

**Exported Types:**

```typescript
type ContractType = 'service' | 'retainer' | 'maintenance';
type ContractStatus = 'draft' | 'sent' | 'reviewed' | 'signed' | 'completed' | 'declined';

interface ContractData {
  proposal_id: string;
  contract_type: ContractType;
  prospect_name: string;
  prospect_email: string;
  prospect_company: string;
  project_name: string;
  project_description: string;
  start_date: string; // ISO date
  end_date: string;   // ISO date
  timeline_weeks: number;
  deliverables: Deliverable[];
  contract_cost_low: number;
  contract_cost_high: number;
  final_cost?: number;
  payment_terms: string;
  acceptance_criteria: {criterion: string, description: string}[];
  terms_and_conditions: string;
  nda_included: boolean;
}

interface Contract extends ContractData {
  id: string;
  contract_number: string;
  version: number;
  parent_contract_id?: string;
  status: ContractStatus;
  public_token: string;
  is_public: boolean;
  prospect_signature?: {signed_at: string, ip: string, user_agent: string};
  sent_at?: string;
  signed_at?: string;
  completed_at?: string;
  expires_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ContractAuditLog {
  id: string;
  contract_id: string;
  action: string; // created | sent | viewed | signed | updated | declined
  prospect_ip?: string;
  details?: Record<string, any>;
  created_at: string;
}
```

---

## 🔌 API Routes

### POST `/api/contract/generate`
**Purpose:** Generate contract from accepted proposal  
**Auth:** Required (JWT)  
**Request:**
```json
{
  "proposalId": "uuid",
  "contractType": "service",
  "includeNda": true
}
```
**Response (200):**
```json
{
  "success": true,
  "contractId": "uuid",
  "publicToken": "32-char-hex",
  "data": {
    "id": "uuid",
    "contract_number": "C-2026-001",
    "status": "draft",
    "public_token": "...",
    "...": "..."
  }
}
```
**Response (400/401/404/500):**
```json
{
  "error": "Proposal not found or not accepted"
}
```

---

### POST `/api/contract/create`
**Purpose:** Create custom contract (not from proposal)  
**Auth:** Required (JWT)  
**Request:**
```json
{
  "prospect_name": "John Doe",
  "prospect_email": "john@example.com",
  "prospect_company": "Acme Corp",
  "project_name": "Website Redesign",
  "contract_type": "service",
  "start_date": "2026-06-01",
  "end_date": "2026-08-31",
  "timeline_weeks": 12,
  "deliverables": [{...}],
  "contract_cost_low": 5000,
  "contract_cost_high": 8000,
  "payment_terms": "50% upfront, 50% on completion"
}
```
**Response (200):** Contract object  
**Response (400/401):** Error

---

### GET `/api/contract/generate`
**Purpose:** List user's contracts  
**Auth:** Required (JWT)  
**Query Params:**
- `status?` - Filter by status
- `limit?` - Limit results (default 50)
- `offset?` - Pagination offset

**Response (200):**
```json
{
  "contracts": [{...}, {...}],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

---

### GET `/api/contract/[id]`
**Purpose:** Fetch contract details  
**Auth:** Required (JWT) + Ownership verification  
**Response (200):** Contract object  
**Response (401/404):** Error

---

### PATCH `/api/contract/[id]`
**Purpose:** Update contract (status, cost, terms)  
**Auth:** Required (JWT) + Ownership verification  
**Request:**
```json
{
  "status": "sent",
  "final_cost": 6500,
  "payment_terms": "40% upfront, 60% on completion"
}
```
**Response (200):** Updated contract  
**Response (400/401/404):** Error

---

### POST `/api/contract/[id]/version`
**Purpose:** Create new version (amendment)  
**Auth:** Required (JWT) + Ownership  
**Request:**
```json
{
  "changes": {
    "final_cost": 7000,
    "end_date": "2026-09-15"
  },
  "reason": "Client requested extended timeline"
}
```
**Response (200):** New version contract  
**Response (400/401/404):** Error

---

### GET `/api/contract/public/[token]`
**Purpose:** Fetch public contract (no auth)  
**Auth:** Not required  
**Response (200):** Contract object (filtered for public view)  
**Response (404):** Not found

**Logs:** View action in audit log

---

### POST `/api/contract/[token]/sign`
**Purpose:** Sign contract via public link  
**Auth:** Not required  
**Headers:** IP address, User-Agent  
**Request:**
```json
{
  "signature": "John Doe"
}
```
**Response (200):**
```json
{
  "success": true,
  "signed_at": "2026-05-15T14:30:00Z",
  "contract_number": "C-2026-001"
}
```

---

### POST `/api/contract/[id]/log`
**Purpose:** Log contract action (internal use)  
**Auth:** Service role  
**Request:**
```json
{
  "action": "viewed",
  "prospect_ip": "192.168.1.1",
  "details": {"referrer": "email"}
}
```
**Response (200):** Log entry created

---

## 🎨 Frontend Components

### 1. ContractForm.tsx (Multi-step Form)
**Purpose:** Create contract from scratch or proposal  
**Steps:**
- Step 1: Select proposal or custom entry
- Step 2: Choose contract type & template
- Step 3: Review/edit deliverables
- Step 4: Set dates and payment terms
- Step 5: Review final contract
- Step 6: Generate and send

**Features:**
- Auto-load proposal data if generating from proposal
- Show template preview
- WYSIWYG editor for terms/conditions
- Signature preview
- Download as PDF option

---

### 2. ContractResults.tsx (Display Component)
**Purpose:** View contract details  
**Sections:**
- Header (contract number, status, prospect)
- Contract content (formatted HTML)
- Deliverables table
- Payment terms & total cost
- Acceptance criteria
- Signature section (if public)
- Sharing options (link, email)
- Status timeline

---

### 3. ContractCard.tsx (List Item)
**Purpose:** Grid/list display  
**Shows:**
- Contract number
- Prospect name/company
- Status (draft/sent/signed/completed)
- Contract cost (final or range)
- Date created
- Quick actions (view, send, download)

---

### 4. ContractTimeline.tsx (Status Tracker)
**Purpose:** Visual status progression  
**Shows:**
- draft → sent → reviewed → signed → completed
- Timestamps for each transition
- Action indicators
- Sign button if needed

---

## 📄 Pages

### `/contract`
**Purpose:** List all contracts  
**Features:**
- Table/grid view of all contracts
- Filter by status
- Search by prospect/company
- "New Contract" button
- Quick actions (view, download, resend)

### `/contract/new`
**Purpose:** Create contract  
**Options:**
- From proposal (if any accepted)
- From template (pre-filled)
- Custom (blank)

### `/contract/[id]`
**Purpose:** View/edit contract  
**Features:**
- Full contract display
- Edit button (for draft status)
- Send/resend button
- Download as PDF
- View signature (if signed)
- Create amendment button
- Audit trail log

### `/contract/[id]/preview`
**Purpose:** Preview before sending  
**Features:**
- Full contract preview
- Print to PDF
- Send confirmation

### `/contract/report/[token]`
**Purpose:** Public contract view  
**Features:**
- Contract display (no edit)
- Sign button (prominent)
- Signature capture form
- Confirmation message after signing

### `/contract/not-found`
**Purpose:** 404 page

---

## 🗄️ Database Schema

### contracts Table
```sql
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  contract_number VARCHAR(20) UNIQUE NOT NULL,
  contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('service', 'retainer', 'maintenance')),
  
  -- Prospect Information
  prospect_name VARCHAR(255) NOT NULL,
  prospect_email VARCHAR(255) NOT NULL,
  prospect_company VARCHAR(255) NOT NULL,
  
  -- Project Details
  project_name VARCHAR(255) NOT NULL,
  project_description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  timeline_weeks INTEGER,
  
  -- Contract Content
  deliverables JSONB,
  contract_cost_low INTEGER,
  contract_cost_high INTEGER,
  final_cost INTEGER,
  payment_terms TEXT,
  acceptance_criteria JSONB,
  terms_and_conditions TEXT,
  nda_included BOOLEAN DEFAULT FALSE,
  
  -- Status & Workflow
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  parent_contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  
  -- Signature
  prospect_signature JSONB, -- {signed_at, ip, user_agent}
  
  -- Sharing & Public Access
  public_token VARCHAR(32) UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  sent_at TIMESTAMP,
  signed_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contracts_created_by ON contracts(created_by);
CREATE INDEX idx_contracts_proposal_id ON contracts(proposal_id);
CREATE INDEX idx_contracts_public_token ON contracts(public_token);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_prospect_email ON contracts(prospect_email);
CREATE INDEX idx_contracts_expires_at ON contracts(expires_at);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);

-- RLS Policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = created_by OR is_public = true);

CREATE POLICY "Users can insert own contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own draft contracts"
  ON contracts FOR DELETE
  USING (auth.uid() = created_by AND status = 'draft');
```

### contract_templates Table
```sql
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  project_type VARCHAR(50),
  contract_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  terms_template TEXT,
  payment_terms_default TEXT,
  nda_template TEXT,
  accepted_criteria_template JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  is_default BOOLEAN DEFAULT FALSE
);
```

### contract_audit_log Table
```sql
CREATE TABLE contract_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  prospect_ip VARCHAR(45),
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_contract_audit_log_contract_id ON contract_audit_log(contract_id);
```

---

## 🔐 Security Model

### Authentication
- Service: JWT cookies (same as audit/proposal)
- Public: 32-char hex tokens for sharing
- Signature: IP + User-Agent logging

### Authorization
- Users see only own contracts
- Public contracts explicitly marked
- RLS enforces data isolation
- Service role for setup operations

### Data Protection
- Contract content encrypted at rest
- Signature capture logs IP/UA
- Audit trail immutable
- Prospect email validated
- Token rotation after signing

---

## 📊 Status Workflow

```
┌─────────┐
│  DRAFT  │ ← New contract created
└────┬────┘
     │
     ├─→ [Send to client]
     │
┌────▼────┐
│   SENT   │ ← Contract emailed to client
└────┬────┘
     │
     ├─→ [Client reviews]
     │
┌────▼────┐
│ REVIEWED │ ← Client opens and views
└────┬────┘
     │
     ├─→ [Client signs]
     │
┌────▼─────┐
│  SIGNED   │ ← Client digitally signs
└────┬─────┘
     │
     ├─→ [Project complete]
     │
┌────▼────────┐
│  COMPLETED   │ ← Deliverables complete
└──────────────┘

Alternative: DECLINED (at any stage)
```

---

## 🧪 Testing Strategy

### Unit Tests
- Cost calculation logic
- Contract number generation
- Template variable replacement
- Signature validation

### E2E Tests (8 tests)
```
✓ Generate contract from accepted proposal
✓ Create custom contract
✓ All contract types work
✓ List contracts with filters
✓ Update contract status
✓ Create contract amendment
✓ Public contract accessible via token
✓ Sign contract captures IP/UA
```

### Integration Tests
- Proposal → Contract generation flow
- Signature → Email notification
- PDF generation
- Audit log completeness

---

## 📈 Acceptance Criteria

### Functional
- ✅ Generate contracts from proposals in <5 seconds
- ✅ All contract fields auto-populated from proposal
- ✅ Contract templates by project type
- ✅ Status tracking (draft → completed)
- ✅ Version control (track amendments)
- ✅ Public sharing via tokens
- ✅ Signature capture with metadata
- ✅ Action logging/audit trail
- ✅ Export to PDF

### Non-Functional
- ✅ <200ms response time (excluding PDF generation)
- ✅ <100KB page size
- ✅ Full RLS data isolation
- ✅ Audit trail immutable
- ✅ Zero TypeScript errors
- ✅ Mobile responsive
- ✅ 8+ E2E tests

### Security
- ✅ JWT auth on all user endpoints
- ✅ Ownership verification on updates
- ✅ RLS policies enforced
- ✅ Public contracts explicitly marked
- ✅ Signature metadata captured
- ✅ Action logging complete

---

## 📋 Implementation Roadmap

### Phase 2B.1: Backend (2 hours)
1. Create `src/lib/contract-service.ts` (300+ LOC)
2. Create 6 API routes
3. Create database migration

### Phase 2B.2: Frontend (1.5 hours)
1. Create 4 components
2. Create 4 pages
3. Add 8 E2E tests

### Phase 2B.3: Testing & Polish (30 min)
1. Run full test suite
2. Fix any issues
3. Documentation

**Total: 3-4 hours**

---

## 🚀 Success Metrics

- Generate contract from proposal: <5 seconds
- Sales team sends contracts: <5 minutes after acceptance
- Contract signature capture: <30 seconds
- Client receives contract: <1 minute after send
- Audit trail: 100% of actions logged
- Acceptance rate: 40%+ (up from 35% with proposals)

---

## 📞 Dependencies & Constraints

### Dependencies
- Phase 2A (Audit & Proposal) must be complete
- Database migrations applied
- Supabase configured

### Constraints
- Must use existing auth system
- Must follow component pattern from phases 2A
- Must maintain RLS security
- Must be production-ready

### Assumptions
- Prospects have email addresses
- Contracts have 30-day expiration
- PDF export optional for MVP
- E-signatures not legally binding (informational)

---

## 🔄 Future Enhancements (Phase 3+)

- **PDF Export** - Generate PDF contracts for download
- **E-Signatures** - Integrations with DocuSign/Hellosign
- **Email Notifications** - Auto-send contracts to clients
- **Contract Templates** - More industry-specific templates
- **Invoice Generation** - Auto-generate invoices from signed contracts
- **Payment Integration** - Connect to payment gateway
- **Renewal Tracking** - Auto-renew contracts/retainers
- **Amendments Workflow** - Streamlined amendment process

---

## 📚 References

**Related Specifications:**
- [Phase 2A Audit Generator Spec](./PHASE_2A_AUDIT_GENERATOR_SPEC.md)
- [Phase 2A Proposal Generator Spec](./PHASE_2A_PROPOSAL_GENERATOR_SPEC.md)

**Implementation Pattern:**
- Follow same service/API/page structure as Proposals
- Use same styling as existing components
- Same error handling pattern
- Same auth pattern (JWT + RLS)

---

**Created:** May 3, 2026  
**Status:** Ready for Implementation  
**Estimated Effort:** 3-4 hours  
**Team:** Full Stack (1 developer)
