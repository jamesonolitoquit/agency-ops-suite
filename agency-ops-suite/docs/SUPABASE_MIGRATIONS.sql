-- ============================================================================
-- AGENCY OPS SUITE - SUPABASE MIGRATIONS
-- Apply these in Supabase SQL Editor in order
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MODULE 1: LEADS (Entry Point)
-- ============================================================================

CREATE TABLE leads (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  business_type TEXT,
  source TEXT, -- "landing_page", "referral", "cold_outreach"
  status TEXT DEFAULT 'new', -- new/contacted/replied/closed/lost
  notes TEXT,
  contacted_at TIMESTAMP,
  last_contacted_at TIMESTAMP,
  closed_at TIMESTAMP,
  converted_to_client_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- ============================================================================
-- MODULE 2: CLIENTS (Source of Truth)
-- ============================================================================

CREATE TABLE clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  business_type TEXT,
  domain TEXT,
  plan TEXT, -- "starter", "professional", "enterprise"
  monthly_fee BIGINT DEFAULT 0, -- in cents
  status TEXT DEFAULT 'active', -- active/paused/churned
  ready_for_deploy BOOLEAN DEFAULT FALSE, -- SAFEGUARD: blocks deployment
  live_url TEXT, -- e.g., "https://client.com"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_ready_for_deploy ON clients(ready_for_deploy);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- ============================================================================
-- MODULE 3: PROVISIONING (Delivery Engine)
-- ============================================================================

CREATE TABLE provisioning_runs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  template TEXT,
  domain TEXT,
  status TEXT DEFAULT 'pending', -- pending/in_progress/success/failed
  error_message TEXT,
  output_path TEXT,
  http_check_passed BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_provisioning_runs_client_id ON provisioning_runs(client_id);
CREATE INDEX idx_provisioning_runs_status ON provisioning_runs(status);
CREATE INDEX idx_provisioning_runs_created_at ON provisioning_runs(created_at);

-- ============================================================================
-- MODULE 4: DEPLOYMENT CHECKLIST (Anti-Error System)
-- ============================================================================

CREATE TABLE deployment_checklists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Checklist items
  domain_connected BOOLEAN DEFAULT FALSE,
  ssl_active BOOLEAN DEFAULT FALSE,
  cta_works BOOLEAN DEFAULT FALSE,
  mobile_responsive BOOLEAN DEFAULT FALSE,
  seo_meta_tags BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  domain_connected_at TIMESTAMP,
  ssl_active_at TIMESTAMP,
  cta_works_at TIMESTAMP,
  mobile_responsive_at TIMESTAMP,
  seo_meta_tags_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deployment_checklists_client_id ON deployment_checklists(client_id);

-- ============================================================================
-- MODULE 5: BILLING (Cashflow Control)
-- ============================================================================

CREATE TABLE billing (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  amount BIGINT DEFAULT 0, -- in cents
  due_date TIMESTAMP NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  last_paid_at TIMESTAMP, -- SAFEGUARD: track payment history
  next_due_date TIMESTAMP, -- auto-calculated
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_billing_client_id ON billing(client_id);
CREATE INDEX idx_billing_due_date ON billing(due_date);
CREATE INDEX idx_billing_paid ON billing(paid);

-- ============================================================================
-- MODULE 6: REQUEST QUEUE (Operations Control)
-- ============================================================================

CREATE TABLE client_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending/in_progress/done
  priority TEXT DEFAULT 'medium', -- low/medium/high
  
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_client_requests_client_id ON client_requests(client_id);
CREATE INDEX idx_client_requests_status ON client_requests(status);
CREATE INDEX idx_client_requests_created_at ON client_requests(created_at);

-- ============================================================================
-- MODULE 7: REPORTING (Retention Tool)
-- ============================================================================

CREATE TABLE reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  report_type TEXT DEFAULT 'monthly_summary',
  period_label TEXT,
  updates_count INTEGER DEFAULT 0,
  requests_completed INTEGER DEFAULT 0,
  billing_status TEXT, -- "paid", "pending", "overdue"
  summary TEXT,
  export_format TEXT DEFAULT 'json',
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_client_id ON reports(client_id);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);

-- ============================================================================
-- MODULE 8: BACKUP SYSTEM (Disaster Prevention)
-- ============================================================================

CREATE TABLE backup_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  status TEXT NOT NULL, -- pending/success/failed
  file_path TEXT,
  file_exists BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_backup_logs_status ON backup_logs(status);
CREATE INDEX idx_backup_logs_created_at ON backup_logs(created_at);

-- ============================================================================
-- MODULE 9: LOGGING (Debugging)
-- ============================================================================

CREATE TABLE api_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  level TEXT, -- "info", "error"
  message TEXT,
  meta TEXT, -- JSON stringified
  context TEXT, -- "provisioning", "api", "backup"
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_logs_level ON api_logs(level);
CREATE INDEX idx_api_logs_context ON api_logs(context);
CREATE INDEX idx_api_logs_created_at ON api_logs(created_at);

-- ============================================================================
-- AUDIT TRIGGER (Auto-update updated_at)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_deployment_checklists_updated_at BEFORE UPDATE ON deployment_checklists FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trigger_billing_updated_at BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- RLS POLICIES (Enable if using Supabase auth)
-- ============================================================================

-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE provisioning_runs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deployment_checklists ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Example policy (enable later when auth is configured):
-- CREATE POLICY "Enable read access for authenticated users" ON leads FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users" ON leads FOR INSERT WITH CHECK (true);

-- ============================================================================
-- DONE
-- ============================================================================
