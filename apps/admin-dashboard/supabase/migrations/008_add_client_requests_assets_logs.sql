-- Client requests submitted from portal
CREATE TABLE IF NOT EXISTS client_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_by_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_requests_client_id ON client_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_created_at ON client_requests(created_at DESC);

-- Client-uploaded files metadata
CREATE TABLE IF NOT EXISTS client_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  uploaded_by_email VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120),
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_assets_client_id ON client_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_client_assets_created_at ON client_assets(created_at DESC);

-- Audit trail for client portal actions
CREATE TABLE IF NOT EXISTS client_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80),
  entity_id VARCHAR(120),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_action_logs_client_id ON client_action_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_action_logs_created_at ON client_action_logs(created_at DESC);

ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_action_logs ENABLE ROW LEVEL SECURITY;

-- Keep direct DB access locked down; APIs use service role.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'client_requests' AND policyname = 'client_requests_admin_only'
  ) THEN
    CREATE POLICY client_requests_admin_only ON client_requests FOR ALL USING (false) WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'client_assets' AND policyname = 'client_assets_admin_only'
  ) THEN
    CREATE POLICY client_assets_admin_only ON client_assets FOR ALL USING (false) WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'client_action_logs' AND policyname = 'client_action_logs_admin_only'
  ) THEN
    CREATE POLICY client_action_logs_admin_only ON client_action_logs FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;
