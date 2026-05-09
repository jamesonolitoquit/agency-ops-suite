-- Create email_events table for tracking sent emails
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'bounced')),
  resend_id VARCHAR(255),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_email_events_recipient ON email_events(recipient);
CREATE INDEX idx_email_events_status ON email_events(status);
CREATE INDEX idx_email_events_created_at ON email_events(created_at DESC);
CREATE INDEX idx_email_events_resend_id ON email_events(resend_id);

-- Enable RLS on email_events (admin only)
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Email events are admin only"
  ON email_events FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);
