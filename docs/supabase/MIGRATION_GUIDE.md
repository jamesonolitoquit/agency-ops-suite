# Supabase Database Migration Guide

## Quick Setup

The Audit Generator feature requires database tables to be created in Supabase. Since the Supabase JavaScript client doesn't support arbitrary SQL execution, follow these steps:

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to SQL Editor**
   - Navigate to: https://app.supabase.com/project/eavpknxospplscdrnenz/sql/new
   - Replace `eavpknxospplscdrnenz` with your actual project ID if different

2. **Create New Query**
   - Click "New Query"
   - Paste the SQL from below
   - Click "Run"

3. **Execute Migration SQL**
   ```sql
   -- Create audit_reports table
   CREATE TABLE IF NOT EXISTS audit_reports (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     website_url TEXT NOT NULL,
     project_type TEXT CHECK (project_type IN ('landing-page', 'ecommerce', 'corporate', 'saas', 'blog')),
     
     -- Lighthouse scores (0-100)
     performance INT,
     accessibility INT,
     seo INT,
     best_practices INT,
     
     -- Extracted issues (JSON array)
     issues JSONB DEFAULT '[]'::jsonb,
     
     -- Metadata
     created_at TIMESTAMP DEFAULT now(),
     created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

   -- Create indexes for performance
   CREATE INDEX IF NOT EXISTS idx_audit_created_by ON audit_reports(created_by);
   CREATE INDEX IF NOT EXISTS idx_audit_public_token ON audit_reports(public_token);
   CREATE INDEX IF NOT EXISTS idx_audit_is_public ON audit_reports(is_public);
   CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_reports(created_at DESC);

   -- Enable Row Level Security
   ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;

   -- Create RLS Policies

   -- Policy 1: Users can view their own audits
   CREATE POLICY "Users can view own audits" ON audit_reports
     FOR SELECT
     USING (auth.uid() = created_by);

   -- Policy 2: Users can create audits
   CREATE POLICY "Users can create audits" ON audit_reports
     FOR INSERT
     WITH CHECK (auth.uid() = created_by);

   -- Policy 3: Users can update their own audits
   CREATE POLICY "Users can update own audits" ON audit_reports
     FOR UPDATE
     USING (auth.uid() = created_by)
     WITH CHECK (auth.uid() = created_by);

   -- Policy 4: Public audits are viewable by anyone (no auth required)
   CREATE POLICY "Public audits are viewable" ON audit_reports
     FOR SELECT
     USING (is_public = true);
   ```

### Option 2: Using Supabase CLI (If Installed)

```bash
# Install Supabase CLI if needed
npm install -g supabase

# Push migrations
supabase db push --db-url postgresql://postgres:[password]@[host]:5432/postgres
```

### Option 3: Using psql (Direct PostgreSQL Connection)

```bash
# Get your connection string from Supabase Settings → Database → Connection String
psql postgresql://postgres:[password]@[host]:5432/postgres < supabase/migrations/001_create_audit_reports.sql
```

## Verify Migration

After applying the migration, verify it worked:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'audit_reports'
);

-- Check table structure
\d audit_reports

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'audit_reports';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'audit_reports';
```

## What Gets Created

### Table: `audit_reports`
- **id**: UUID primary key
- **website_url**: The URL being audited
- **project_type**: One of: landing-page, ecommerce, corporate, saas, blog
- **performance/accessibility/seo/best_practices**: Audit scores (0-100)
- **issues**: JSON array of audit issues found
- **estimated_cost_low/high**: Dollar estimate range
- **estimated_hours**: Hours to fix all issues
- **public_token**: 32-char hex string for public sharing
- **is_public**: Boolean flag for public access
- **created_by**: User ID of report creator
- **created_at/generated_at/expires_at**: Timestamps

### Indexes (for performance)
- `idx_audit_created_by`: Fast lookup by user
- `idx_audit_public_token`: Fast public report access
- `idx_audit_is_public`: Fast filtering
- `idx_audit_created_at`: Fast sorting by date

### Security Policies (RLS)
1. Users see only their own private audits
2. Users can create audits
3. Users can update their own audits
4. Anyone can view public audits (no auth needed)

## Testing After Migration

Run e2e tests to verify everything works:

```bash
cd apps/admin-dashboard
npm run test:e2e tests/e2e/audit.spec.ts
```

Expected output: **6/6 tests passing**

## Troubleshooting

### Error: "relation audit_reports does not exist"
- Migration hasn't been applied yet
- Check that you followed the steps above
- Verify in Supabase dashboard that the table exists

### Error: "permission denied for schema public"
- Service role key might not have correct permissions
- Check that SUPABASE_SERVICE_ROLE_KEY is correct in .env.local

### Error: "duplicate key value violates unique constraint"
- Public token collision (extremely rare)
- Clear old test data and retry

### Policies not working (403 errors)
- RLS policies might not have been applied
- Run the policy creation SQL statements again
- Verify policies in Supabase dashboard

## Next Steps

After applying the migration:

1. ✅ All e2e tests should pass
2. Generate sample audits for testing
3. Test public link sharing
4. Proceed with Phase 2A Proposal Generator
5. Add Audit link to dashboard navigation

---

**Migration Status**: Pending manual application  
**Impact**: Blocks audit generation until applied  
**Estimated Time**: 2 minutes  
**Difficulty**: Easy - copy/paste into SQL editor
