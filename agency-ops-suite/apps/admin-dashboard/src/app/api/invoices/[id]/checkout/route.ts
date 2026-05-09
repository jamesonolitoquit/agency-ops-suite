import { NextResponse } from 'next/server';
import { createCheckoutSession, getOrCreateStripeCustomer, getInvoiceWithStripeData } from '@/lib/stripe-payment';

/**
 * POST /api/invoices/[id]/checkout
 * 
 * Creates a Stripe checkout session for an invoice.
 * Public endpoint - anyone with invoice ID can initiate payment.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Fetch invoice details
    const invoice = await getInvoiceWithStripeData(id);
    if (!invoice) {
      return NextResponse.json({ error: 'invoice_not_found' }, { status: 404 });
    }

    // Check if already paid
    if (invoice.payment_status === 'paid') {
      return NextResponse.json(
        { error: 'already_paid', message: 'This invoice has already been paid.' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const clientEmail = invoice.clients?.email || `client-${invoice.client_id}@example.com`;
    const clientName = invoice.clients?.name || 'Client';

    const stripeCustomerId = await getOrCreateStripeCustomer(invoice.client_id, clientEmail, clientName);

    // Create checkout session
    const session = await createCheckoutSession(
      id,
      stripeCustomerId,
      invoice.total,
      clientName,
      invoice.invoice_number
    );

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      url: session.url,
      invoiceId: id,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total,
    });
  } catch (err: any) {
    console.error('Checkout session creation failed:', err);
    return NextResponse.json(
      { error: 'checkout_creation_failed', message: err.message },
      { status: 500 }
    );
  }
}
