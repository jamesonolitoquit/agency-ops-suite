# Invoice Template

Use this template to generate client invoices.

Invoice: [INVOICE_NUMBER]
Date: [DATE]
Due Date: [DUE_DATE]

BILL TO:
- Client Name: [CLIENT_NAME]
- Client Contact: [CLIENT_CONTACT]
- Client Billing Address: [CLIENT_ADDRESS]

ITEMS
| Qty | Description                      | Unit Price | Total |
|-----|----------------------------------|------------|-------|
| 1   | Project kickoff (50% deposit)    | [AMOUNT]   | [AMOUNT] |
| 1   | Final delivery (remaining 50%)   | [AMOUNT]   | [AMOUNT] |

Subtotal: [SUBTOTAL]
Tax: [TAX]
Total: [TOTAL]

Payment Instructions:
- Bank Transfer: Account Name, Account Number, Bank
- GCash: [GCASH_NUMBER] (reference: [INVOICE_NUMBER])
- Stripe/PayPal: [PAYMENT_LINK]

Terms:
- Standard terms: 50% upfront to begin work; remaining balance due before final delivery/launch.
- Late payments incur 1.5% interest per month and may result in suspension of services after 15 days past due.

Notes:
- Please include the invoice number as the payment reference. Email payment receipts to [ACCOUNTING_EMAIL].
