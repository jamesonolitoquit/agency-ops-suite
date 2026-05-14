# Initiative: Website Audit Generator

**Goal:** Generate professional website audit reports (performance, SEO, accessibility) with estimated fix costs to send cold leads and qualify prospects

**Target User:** Sales/business development team  
**Business Value:** Audit reports prove capability + generate DM-friendly sales assets + speed up qualification

---

## Current Gap

- ❌ No automated website analysis capability
- ❌ Manual audits take 30+ minutes per site
- ❌ Can't quickly estimate client fix costs
- ❌ No shareable audit report format
- ❌ Portfolio has no "live tool" to prove capability

---

## Proposed Architecture

### Route/Section Changes

**New Route:** `/audit` (dashboard section)
```
├─ /audit (list of generated reports)
├─ /audit/new (form to generate new audit)
└─ /api/audit/generate (POST: triggers audit)
```

**New API Route:** `/api/audit/generate`
- Input: URL + project type (landing page, e-commerce, corporate)
- Process: Run Lighthouse + collect metrics
- Output: JSON report → stored in DB → accessible via shareable link

---

### Component Boundaries

**Database (Supabase):**
```sql
CREATE TABLE audit_reports (
  id UUID PRIMARY KEY,
  website_url TEXT NOT NULL,
  project_type TEXT, -- 'landing-page', 'ecommerce', 'corporate'
  
  -- Lighthouse scores (0-100)
  performance INT,
  accessibility INT,
  seo INT,
  best_practices INT,
  
  -- Extracted issues (JSON)
  issues JSONB,
  
  -- Metadata
  created_at TIMESTAMP,
  created_by UUID REFERENCES auth.users,
  generated_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Sharing
  public_token VARCHAR(32) UNIQUE,
  is_public BOOLEAN DEFAULT false,
  
  -- Cost estimation
  estimated_cost_low INT,
  estimated_cost_high INT,
  estimated_hours INT
);
```

**Backend Service** (`lib/audit-service.ts`):
- `generateAudit(url, projectType)` → triggers Lighthouse
- `extractIssues(lhrResult)` → parses actionable issues
- `estimateCost(issues, projectType)` → calculates fix cost
- `createAuditReport(...)` → saves to DB
- `getPublicReport(token)` → returns shareable audit

**Frontend Components:**
- `AuditForm.tsx` - input URL + project type selector
- `AuditResults.tsx` - display scores + issues + cost estimate
- `AuditList.tsx` - history of generated reports
- `AuditShareDialog.tsx` - public link + embed options

---

## Implementation Plan

### Task 1: Database Schema + API Route

1. Create `audit_reports` table in Supabase
2. Add Lighthouse as dev dependency (`npm install lighthouse`)
3. Create `/api/audit/generate` POST route
   - Validate URL (http/https)
   - Queue async job or run synchronously (depends on URL availability)
   - Return audit ID immediately
4. Create `/api/audit/[id]` GET route to fetch report
5. Create `/api/audit/public/[token]` GET route for public sharing

**Files to create:**
- `src/lib/audit-service.ts` - Lighthouse integration
- `src/app/api/audit/generate/route.ts` - POST endpoint
- `src/app/api/audit/[id]/route.ts` - GET single report
- `src/app/api/audit/public/[token]/route.ts` - public link

---

### Task 2: Dashboard UI + Form

1. Create `/audit` page listing all generated reports
2. Create `/audit/new` page with URL input form
3. Add form validation + UX feedback (generating... states)
4. Display results with visual score breakdown (charts/cards)
5. Add "Copy public link" button + preview

**Files to create:**
- `src/app/audit/page.tsx` - list view
- `src/app/audit/new/page.tsx` - generation form
- `src/app/audit/[id]/page.tsx` - results view
- `src/components/AuditForm.tsx` - input component
- `src/components/AuditResults.tsx` - results display

---

### Task 3: Test + Polish

1. Test with 5 different site types (landing page, blog, e-commerce, SaaS, corporate)
2. Verify public link sharing works
3. Add error handling (timeouts, unreachable URLs)
4. Performance: optimize Lighthouse runtime (cache results, set timeouts)
5. Create public sample audit on portfolio site

**Acceptance Criteria:**
- [ ] Can generate audit in < 30 seconds
- [ ] Report shows 5+ actionable issues
- [ ] Cost estimate is within 20% accuracy (compare to real quotes)
- [ ] Public link is shareable (no auth required)
- [ ] Sample audit displayed on portfolio site
- [ ] Works on mobile (responsive design)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Audit generation time | < 30 seconds |
| Report quality (clarity) | 9/10 user rating |
| Public link click-through | Trackable (add utm params) |
| Lead qualification impact | 20%+ of leads receive audit |
| Portfolio sample traffic | 100+ views/week |

---

## Reuse Potential

- **Audit Generator Component** → Portfolio sample site
- **Report Template** → Client reporting UI
- **Lighthouse Integration** → Monitoring dashboard (track improvements over time)
- **Cost Estimation Logic** → Sales tool API

---

## Risk & Trade-offs

| Factor | Trade-off |
|--------|-----------|
| **Effort** | 4-5 hours (depends on Lighthouse setup complexity) |
| **Risk** | Lighthouse requires network access + browser launch (timeout risk) |
| **Mitigation** | Add timeout (30s), cache results, graceful error messages |
| **Portfolio Value** | HIGH - proves performance/SEO expertise |
| **Maintenance** | LOW - Lighthouse is maintained by Google |

---

## Handoff Criteria

✅ Ready for Engineer when:
- [ ] Database schema approved
- [ ] Lighthouse integration approach validated
- [ ] Component hierarchy defined
- [ ] Cost estimation formula documented
- [ ] Error handling strategy defined

✅ Ready for QA when:
- [ ] All acceptance criteria met
- [ ] Public link tested with multiple browsers
- [ ] Performance benchmarked (Lighthouse runtime)
- [ ] Sample audit added to portfolio

✅ Ready for Publication when:
- [ ] Portfolio site displays sample audit
- [ ] Documentation added to README
- [ ] Shareable link tested with external users
