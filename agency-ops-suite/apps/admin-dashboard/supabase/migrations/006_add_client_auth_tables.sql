-- Create client_roles table for client authentication
CREATE TABLE client_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'viewer', 'uploader')),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  invite_token VARCHAR(255) UNIQUE,
  invite_expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX idx_client_roles_client_email ON client_roles(client_id, user_email);
CREATE INDEX idx_client_roles_user_email ON client_roles(user_email);
CREATE INDEX idx_client_roles_status ON client_roles(status);
CREATE INDEX idx_client_roles_invite_token ON client_roles(invite_token);

-- Create client_sessions table for tracking client logins
CREATE TABLE client_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  auth_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_client_sessions_client_email ON client_sessions(client_id, user_email);
CREATE INDEX idx_client_sessions_auth_token ON client_sessions(auth_token);
CREATE INDEX idx_client_sessions_expires_at ON client_sessions(expires_at);

-- RLS Policies

-- client_roles: only admins can see all, clients see their own
ALTER TABLE client_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see all client roles"
  ON client_roles FOR SELECT
  USING (current_setting('role') = 'authenticated' AND current_user_id() IN (
    SELECT user_id FROM admin_users
  ));

CREATE POLICY "Clients can view roles for their account"
  ON client_roles FOR SELECT
  USING (current_setting('user_email') = user_email OR
         current_setting('user_email') IN (
           SELECT user_email FROM client_roles WHERE client_id = client_roles.client_id AND status = 'active'
         ));

-- client_sessions: only the client can see their sessions
ALTER TABLE client_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own sessions"
  ON client_sessions FOR SELECT
  USING (current_setting('user_email') = user_email);

CREATE POLICY "Service role can manage sessions"
  ON client_sessions FOR ALL
  USING (current_user_id() IS NOT NULL);
