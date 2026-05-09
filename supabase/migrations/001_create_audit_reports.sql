-- Audit Reports Table
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

-- Indexes for performance
CREATE INDEX idx_audit_created_by ON audit_reports(created_by);
CREATE INDEX idx_audit_public_token ON audit_reports(public_token);
CREATE INDEX idx_audit_is_public ON audit_reports(is_public);
CREATE INDEX idx_audit_created_at ON audit_reports(created_at DESC);

-- RLS Policies
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own audits
CREATE POLICY "Users can view own audits" ON audit_reports
  FOR SELECT
  USING (auth.uid() = created_by);

-- Users can create audits
CREATE POLICY "Users can create audits" ON audit_reports
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own audits
CREATE POLICY "Users can update own audits" ON audit_reports
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Anyone can view public audits (no auth needed - use in app logic)
CREATE POLICY "Public audits are viewable" ON audit_reports
  FOR SELECT
  USING (is_public = true);

-- Add to audit_logs for tracking
CREATE TABLE IF NOT EXISTS audit_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES audit_reports(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_log_audit_id ON audit_log_entries(audit_id);
