-- Enable RLS on client-facing tables if not already enabled

-- Clients table - enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Invoices table - enable RLS (if not already)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Contracts table - enable RLS (if not already)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients table
-- Admins can see all clients
CREATE POLICY "Admins can read all clients"
  ON clients FOR SELECT
  USING (current_user_id() IN (SELECT user_id FROM admin_users));

-- Clients can only see their own record
CREATE POLICY "Clients can read own client record"
  ON clients FOR SELECT
  USING (id IN (
    SELECT client_id FROM client_roles 
    WHERE user_email = current_setting('user_email') AND status = 'active'
  ));

-- RLS Policies for invoices table
-- Admins can see all invoices
CREATE POLICY "Admins can read all invoices"
  ON invoices FOR SELECT
  USING (current_user_id() IN (SELECT user_id FROM admin_users));

-- Clients can only see their own invoices
CREATE POLICY "Clients can read own invoices"
  ON invoices FOR SELECT
  USING (client_id IN (
    SELECT client_id FROM client_roles 
    WHERE user_email = current_setting('user_email') AND status = 'active'
  ));

-- RLS Policies for contracts table
-- Admins can see all contracts
CREATE POLICY "Admins can read all contracts"
  ON contracts FOR SELECT
  USING (current_user_id() IN (SELECT user_id FROM admin_users));

-- Clients can only see their own contracts
CREATE POLICY "Clients can read own contracts"
  ON contracts FOR SELECT
  USING (client_id IN (
    SELECT client_id FROM client_roles 
    WHERE user_email = current_setting('user_email') AND status = 'active'
  ));
