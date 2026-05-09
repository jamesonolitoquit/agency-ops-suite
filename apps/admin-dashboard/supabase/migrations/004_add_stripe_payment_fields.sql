-- Add Stripe payment fields to invoices table
ALTER TABLE invoices
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN stripe_invoice_id VARCHAR(255),
ADD COLUMN stripe_payment_intent_id VARCHAR(255),
ADD COLUMN stripe_subscription_id VARCHAR(255),
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'processing', 'paid', 'failed', 'refunded')),
ADD COLUMN paid_at TIMESTAMP,
ADD COLUMN payment_url TEXT,
ADD COLUMN stripe_metadata JSONB DEFAULT '{}';

-- Create indexes for Stripe lookups
CREATE INDEX idx_invoices_stripe_customer_id ON invoices(stripe_customer_id);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_stripe_payment_intent_id ON invoices(stripe_payment_intent_id);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_paid_at ON invoices(paid_at DESC);

-- Create webhook_events table for Stripe webhook tracking
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Create stripe_customers table for caching customer data
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_stripe_customers_client_id ON stripe_customers(client_id);
CREATE INDEX idx_stripe_customers_stripe_customer_id ON stripe_customers(stripe_customer_id);

-- Enable RLS on webhook_events (admin only)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Webhook events are admin only"
  ON webhook_events FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);

-- Enable RLS on stripe_customers (admin only for now)
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stripe customers are admin only"
  ON stripe_customers FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);
