# Stripe Configuration

## Required Environment Variables

Copy these to your `.env.local` file and fill in your Stripe keys:

```bash
# Stripe API Keys
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE

# Webhook Secret
# Get this from: https://dashboard.stripe.com/webhooks
# Create a webhook endpoint pointing to: https://your-domain.com/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY_HERE
```

## Setup Instructions

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Navigate to the Dashboard

### 2. Get API Keys

1. Go to **Developers > API keys**
2. Copy your **Publishable key** → `STRIPE_PUBLIC_KEY`
3. Copy your **Secret key** → `STRIPE_SECRET_KEY`

### 3. Setup Webhook

1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
5. Click **Add endpoint**
6. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 4. Enable Payment Methods

1. Go to **Settings > Payment methods**
2. Ensure **Card** is enabled

## Local Development with Stripe CLI

### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (via scoop)
scoop install stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Forward Webhooks to Local Machine

```bash
# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# This will output your webhook secret, copy it to .env.local
```

### Trigger Test Events

```bash
# In another terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
```

## Testing Payment Flow

### Manual Testing

1. Create an invoice in the admin dashboard
2. Click the **Pay Invoice** button
3. Use Stripe test card: `4242 4242 4242 4242`
4. Any expiry date in the future (e.g., 12/26)
5. Any 3-digit CVC
6. Check that the invoice marks as paid in the dashboard

### Test Card Numbers

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Dispute**: `4000 0000 0000 0259`

## Production Deployment

### Checklist

- [ ] Switch to LIVE API keys (not test keys)
- [ ] Verify `STRIPE_WEBHOOK_SECRET` is set for production domain
- [ ] Test payment flow end-to-end
- [ ] Enable email notifications in Stripe Dashboard
- [ ] Set up Stripe Dashboard alerts
- [ ] Document payment failure runbook

### API Keys Management

- **Never** commit secret keys to version control
- Use GitHub Secrets or environment variable service
- Rotate keys periodically
- Monitor API key usage in Stripe Dashboard

## Troubleshooting

### Webhook Not Firing

1. Check webhook endpoint URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` is set correctly
3. Look at failed delivery attempts in Stripe Dashboard
4. Ensure server is running and accessible

### Payment Showing as Failed

1. Check payment intent details in Stripe Dashboard
2. Look at webhook logs for error message
3. Verify invoice is in correct status in database
4. Check application logs for processing errors

### Rate Limiting

Stripe applies rate limits per API key. If you hit limits:

1. Space out API calls
2. Use batch operations where possible
3. Contact Stripe support for higher limits

## Security Best Practices

1. **Always verify webhook signatures** - Never trust webhook data without verification
2. **Use server-side validation** - Don't rely on client-side payment status
3. **Secure webhook secret** - Treat like a password
4. **Enable 3D Secure** - For enhanced fraud protection
5. **Monitor disputes** - Set up alerts for chargebacks
6. **Audit logging** - Log all payment state changes
