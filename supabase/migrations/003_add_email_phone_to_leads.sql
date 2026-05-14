-- Add email and phone columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email text default '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone text default '';

-- Create index on email for duplicate checking (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON leads(LOWER(email)) WHERE email != '';
