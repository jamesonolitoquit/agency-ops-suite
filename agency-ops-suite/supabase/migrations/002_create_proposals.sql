-- Proposal Tables Migration

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source data
  audit_id UUID REFERENCES audit_reports(id) ON DELETE SET NULL,
  prospect_email TEXT,
  prospect_name TEXT,
  prospect_company TEXT,
  
  -- Content
  project_name TEXT,
  project_scope TEXT CHECK (project_scope IN ('Basic', 'Standard', 'Premium', 'Custom')),
  proposed_timeline_weeks INT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  
  -- Pricing
  estimated_cost_low INT,
  estimated_cost_high INT,
  estimated_total_hours NUMERIC,
  final_quote INT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP,
  
  -- Sharing & Status
  public_token VARCHAR(32) UNIQUE,
  is_public BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined')),
  sent_at TIMESTAMP,
  accepted_at TIMESTAMP,
  
  -- Version control
  version INT DEFAULT 1,
  parent_proposal_id UUID REFERENCES proposals(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_audit_id ON proposals(audit_id);
CREATE INDEX IF NOT EXISTS idx_proposals_public_token ON proposals(public_token);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_expires_at ON proposals(expires_at);
CREATE INDEX IF NOT EXISTS idx_proposals_prospect_email ON proposals(prospect_email);

-- Enable RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users see own proposals" ON proposals
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users create proposals" ON proposals
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users update own proposals" ON proposals
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Public proposals viewable" ON proposals
  FOR SELECT
  USING (is_public = true);

-- Create proposal templates table
CREATE TABLE IF NOT EXISTS proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template metadata
  name TEXT NOT NULL,
  project_type TEXT,
  
  -- Template content
  header_text TEXT,
  intro_paragraph TEXT,
  included_items JSONB,
  excluded_items JSONB,
  process_steps JSONB,
  footer_text TEXT,
  
  -- Pricing
  base_cost INT,
  add_on_multipliers JSONB,
  
  created_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create proposal audit log table
CREATE TABLE IF NOT EXISTS proposal_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  action TEXT,
  prospect_ip TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_log_proposal ON proposal_audit_log(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_log_created ON proposal_audit_log(created_at);
