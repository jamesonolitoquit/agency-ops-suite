-- Create contracts table
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
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'reviewed', 'signed', 'completed', 'declined')),
  version INTEGER DEFAULT 1,
  parent_contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  
  -- Signature
  prospect_signature JSONB,
  
  -- Sharing & Public Access
  public_token VARCHAR(32) UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  sent_at TIMESTAMP,
  signed_at TIMESTAMP,
  completed_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for contracts table
CREATE INDEX idx_contracts_created_by ON contracts(created_by);
CREATE INDEX idx_contracts_proposal_id ON contracts(proposal_id);
CREATE INDEX idx_contracts_public_token ON contracts(public_token);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_prospect_email ON contracts(prospect_email);
CREATE INDEX idx_contracts_expires_at ON contracts(expires_at);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);

-- Enable RLS on contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
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

-- Create contract_templates table
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
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  is_default BOOLEAN DEFAULT FALSE
);

-- Create indexes for contract_templates
CREATE INDEX idx_contract_templates_created_by ON contract_templates(created_by);
CREATE INDEX idx_contract_templates_project_type ON contract_templates(project_type);
CREATE INDEX idx_contract_templates_is_default ON contract_templates(is_default);

-- Enable RLS on contract_templates
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contract_templates
CREATE POLICY "Users can view templates"
  ON contract_templates FOR SELECT
  USING (auth.uid() = created_by OR is_default = true);

CREATE POLICY "Users can create templates"
  ON contract_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates"
  ON contract_templates FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Create contract_audit_log table
CREATE TABLE contract_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  prospect_ip VARCHAR(45),
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- Create index for contract_audit_log
CREATE INDEX idx_contract_audit_log_contract_id ON contract_audit_log(contract_id);
CREATE INDEX idx_contract_audit_log_created_at ON contract_audit_log(created_at DESC);

-- No RLS needed on audit log (immutable records)
