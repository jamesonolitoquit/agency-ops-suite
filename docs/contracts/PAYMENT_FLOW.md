# Payment & Invoice Flow

Overview
- This document defines the payment process for client engagements, invoice lifecycle, and integration notes for automation.

1. Invoice Generation
- At proposal acceptance, generate Invoice # with 50% deposit due immediately (unless alternate terms agreed).
- Attach SOW and payment instructions to the invoice email.

2. Accepted Payment Methods
- Bank Transfer (preferred for Philippines bank payouts)
- GCash / Maya (mobile wallets)
- Stripe (cards) / PayPal (international clients)
- Manual check or other methods by prior agreement

3. Payment Confirmation
- Client uploads payment proof to the Client Portal or replies to the invoice email.
- For automated gateways (Stripe/PayPal), listen for payment webhooks and mark invoice as `paid` in Supabase `billing` table.
- Store `transaction_id`, `payment_method`, `amount`, `paid_at`, and `receipt_url` in the billing record.

4. Triggers & Provisioning
- Provisioning runs and onboarding steps requiring payment confirmation must wait until the deposit invoice status is `paid`.
- Idempotency: store `idempotency_key` on invoices and payment callbacks to avoid double-processing.

5. Reminders & Late Fees
- Automated reminders: 7 days before due, 3 days before due, on due date, and 7/15/30 days after overdue.
- Late fee policy: 1.5% monthly compounded on overdue balance.

6. Refunds & Cancellations
- Refunds are handled case-by-case per SOW. Refund requests must be submitted in writing.

7. Integration Notes (Developer)
- Add a `billing` table in Supabase with columns: `id`, `client_id`, `invoice_number`, `status` (draft|sent|paid|overdue|canceled), `amount_cents`, `currency`, `due_date`, `transaction_id`, `metadata`, `created_at`, `updated_at`.
- Webhook endpoints should validate signatures and use `x-idempotency-key` headers.
- For manual payments, provide an admin UI to mark invoices `paid` and attach receipt URL.

Webhook endpoint:
- A generic webhook endpoint is available at `/api/payments/webhook` to receive payment processor callbacks (Stripe/PayPal/other). The endpoint expects JSON with `invoice_id` and `transaction_id` and will mark the invoice `paid` when appropriate.
