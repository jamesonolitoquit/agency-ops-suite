# Email Integration Setup Guide

This guide covers setting up Resend email service for the Agency Ops Suite.

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Resend Account Configuration](#resend-account-configuration)
3. [Email Templates](#email-templates)
4. [Testing & Preview](#testing--preview)
5. [Email Events](#email-events)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

## Environment Setup

### 1. Install Dependencies

```bash
npm install resend
```

The `resend` package is already in `package.json`.

### 2. Configure Environment Variables

Add the following to `.env.local`:

```env
# Resend API Key (from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# From email address (must be verified in Resend)
NEXT_PUBLIC_FROM_EMAIL=noreply@yourcompany.com

# Company/Brand name (for email templates)
NEXT_PUBLIC_COMPANY_NAME=Your Company Name
```

## Resend Account Configuration

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Create API Key

1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Click "Create New API Key"
3. Copy the key to your `.env.local` as `RESEND_API_KEY`

### 3. Add From Email

1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain or use Resend's test domain
3. Verify domain ownership (if using your own domain)
4. Update `NEXT_PUBLIC_FROM_EMAIL` with your verified email

**For Development:**
- Use Resend test domain: `onboarding@resend.dev`
- Set `NEXT_PUBLIC_FROM_EMAIL=onboarding@resend.dev`

**For Production:**
- Add your own domain and verify it
- Set `NEXT_PUBLIC_FROM_EMAIL=noreply@yourdomain.com`

## Email Templates

### Supported Email Types

The system includes templates for:

#### 1. Contract Sent (`contract_sent`)
- Sent when contract is generated and ready for signing
- Includes: contract number, expiry date, signing link

#### 2. Invoice Created (`invoice_created`)
- Sent when invoice is generated
- Includes: invoice number, amount, due date, payment link

#### 3. Payment Received (`payment_received`)
- Sent when payment is successfully processed
- Includes: invoice number, amount, confirmation date

#### 4. Onboarding Welcome (`onboarding_welcome`)
- Sent when client account is created
- Includes: portal link and overview of features

### Email Template Functions

All templates are in `src/lib/email-templates.ts`:

```typescript
// Contract sent
sendContractSentEmail(
  clientEmail,
  clientName,
  contractNumber,
  signingUrl,
  expiresAt
);

// Invoice created
sendInvoiceCreatedEmail(
  clientEmail,
  clientName,
  invoiceNumber,
  amount,      // in cents
  dueDate,
  invoiceUrl
);

// Payment received
sendPaymentReceivedEmail(
  clientEmail,
  clientName,
  invoiceNumber,
  amount        // in cents
);

// Onboarding welcome
sendOnboardingWelcomeEmail(
  clientEmail,
  clientName,
  portalUrl
);
```

## Testing & Preview

### 1. Preview Templates in Browser

Use the email preview endpoint to view templates:

```
http://localhost:3001/api/admin/email-preview?template=contract_sent
http://localhost:3001/api/admin/email-preview?template=invoice_created
http://localhost:3001/api/admin/email-preview?template=payment_received
http://localhost:3001/api/admin/email-preview?template=onboarding_welcome
```

### 2. Send Test Emails

During development, you can send test emails:

```typescript
import { sendContractSentEmail } from '@/lib/email-templates';

// Send test email
await sendContractSentEmail(
  'your-email@example.com',
  'Test Client',
  'CTR-202605-TEST',
  'https://example.com/contracts/sign/test',
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
);
```

### 3. Use Resend Dashboard

- Check sent emails: [Resend Emails Dashboard](https://resend.com/emails)
- View delivery status and metrics
- Check failed emails and reasons

## Email Events

### Database Schema

Email events are tracked in the `email_events` table:

```sql
CREATE TABLE email_events (
  id UUID PRIMARY KEY,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,         -- queued, sent, failed, bounced
  resend_id VARCHAR(255),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Status Values

- **queued**: Email queued for sending
- **sent**: Successfully sent via Resend
- **failed**: Failed to send (check `error_message`)
- **bounced**: Email bounced after delivery

### Accessing Email Events

```typescript
import { getClient } from '@/lib/supabase/server';

const supabase = await getClient();
const { data } = await supabase
  .from('email_events')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100);
```

## Troubleshooting

### Email Not Sent

1. **Check `RESEND_API_KEY` is set correctly**
   ```bash
   # In development
   echo $RESEND_API_KEY
   ```

2. **Verify From Email**
   - For test emails: Use `onboarding@resend.dev`
   - For production: Verify domain in Resend dashboard

3. **Check Email Events Table**
   ```sql
   SELECT * FROM email_events 
   WHERE status = 'failed' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

4. **Review Server Logs**
   - Email failures are logged to console
   - Check app logs for error messages

### Emails Going to Spam

1. **Add SPF Record** (for your domain)
   ```
   v=spf1 include:sendingdomain.resend.com ~all
   ```

2. **Add DKIM Record** (provided by Resend)
   - Copy from Resend domain verification page

3. **Add DMARC Policy**
   ```
   v=DMARC1; p=quarantine; rua=mailto:admin@yourdomain.com
   ```

### Send Failures

Common errors:

- **"Invalid API Key"**: Check `RESEND_API_KEY` is correct
- **"Email not verified"**: Add email to Resend verified addresses
- **"Rate limited"**: Resend free plan has limits; upgrade if needed

## Production Deployment

### Pre-Production Checklist

- [ ] Resend account created and API key generated
- [ ] Custom domain added and verified in Resend
- [ ] SPF/DKIM/DMARC records configured
- [ ] Email templates reviewed and approved
- [ ] Test emails sent successfully
- [ ] Email events table migrated to production database

### Environment Variables

For production deployment (e.g., Vercel):

1. Set `RESEND_API_KEY` in Vercel environment variables
2. Set `NEXT_PUBLIC_FROM_EMAIL` to your verified domain
3. Set `NEXT_PUBLIC_COMPANY_NAME` appropriately

### Monitoring

Set up monitoring for email failures:

```typescript
// Example: Alert on failed emails
const { data } = await supabase
  .from('email_events')
  .select('*')
  .eq('status', 'failed')
  .gte('created_at', new Date(Date.now() - 1000 * 60 * 5).toISOString());

if (data && data.length > 0) {
  // Send alert to admin/Slack
  console.error(`${data.length} emails failed in last 5 minutes`);
}
```

## API Reference

### sendEmail()

```typescript
function sendEmail(
  to: string,
  template: EmailTemplate,
  metadata?: Record<string, any>
): Promise<SendEmailResponse>
```

### EmailTemplate Interface

```typescript
interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;  // Plain text fallback
}
```

### Template Functions

See [Email Templates](#email-templates) section above for specific function signatures.

## Quick Start

1. Create Resend account
2. Create API key: `re_xxxxx`
3. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxx
   NEXT_PUBLIC_FROM_EMAIL=onboarding@resend.dev
   NEXT_PUBLIC_COMPANY_NAME=Your Company
   ```
4. Run `npm install`
5. Test: Visit `/api/admin/email-preview?template=contract_sent`
6. Deploy environment variables to production

## Further Resources

- [Resend Documentation](https://resend.com/docs)
- [Email Best Practices](https://resend.com/docs/guides/mailbox-best-practices)
- [Resend API Reference](https://resend.com/docs/api-reference/emails/send)
