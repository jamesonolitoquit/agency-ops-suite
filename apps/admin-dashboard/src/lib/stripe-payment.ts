import Stripe from 'stripe';
import { createServiceClient } from './supabase/service';
import { sendPaymentReceivedEmail } from './email-templates';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
}) : null;

export { stripe };

function resolveClientEmail(client: any, clientId: string) {
  return (
    client?.email ||
    client?.contact_email ||
    client?.user_email ||
    `client-${clientId}@example.com`
  );
}

function resolveAppBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (!vercelUrl) return 'http://localhost:3000';
  return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
}

export async function getOrCreateStripeCustomer(clientId: string, email: string, name: string) {
  const supabase = createServiceClient();

  // Check if we already have a Stripe customer for this client
  const { data: existing } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('client_id', clientId)
    .single();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // Create a new Stripe customer
  if (!stripe) throw new Error('Stripe not configured');

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { clientId },
  });

  // Cache it in our database
  await supabase.from('stripe_customers').insert([
    {
      client_id: clientId,
      stripe_customer_id: customer.id,
      email: customer.email,
      name: customer.name,
      metadata: customer.metadata,
    },
  ]);

  return customer.id;
}

export async function createCheckoutSession(
  invoiceId: string,
  stripeCustomerId: string,
  amount: number,
  clientName: string,
  invoiceNumber: string
) {
  const supabase = createServiceClient();
  const appBaseUrl = resolveAppBaseUrl();

  // Create Stripe checkout session
  if (!stripe) throw new Error('Stripe not configured');

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Invoice ${invoiceNumber}`,
            description: `Payment for ${clientName}`,
          },
          // Amounts are stored in cents throughout the app, so pass them through directly.
          unit_amount: Math.round(amount),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appBaseUrl}/invoices/${invoiceId}?payment=success`,
    cancel_url: `${appBaseUrl}/invoices/${invoiceId}?payment=cancelled`,
    metadata: {
      invoiceId,
      clientName,
      invoiceNumber,
    },
  });

  // Update invoice with payment URL and session info
  await supabase
    .from('invoices')
    .update({
      payment_url: session.url,
      stripe_metadata: {
        checkout_session_id: session.id,
        created_at: new Date().toISOString(),
      },
    })
    .eq('id', invoiceId);

  return session;
}

export async function markInvoiceAsPaid(invoiceId: string, stripePaymentIntentId: string) {
  const supabase = createServiceClient();
  const now = new Date();

  const { data, error } = await supabase
    .from('invoices')
    .update({
      payment_status: 'paid',
      paid_at: now.toISOString(),
      stripe_payment_intent_id: stripePaymentIntentId,
      status: 'paid',
    })
    .eq('id', invoiceId)
    .select('*, clients(*)')
    .single();

  if (error) throw error;

  // Log the payment event
  try {
    await supabase.from('audit_logs').insert([
      {
        entity_type: 'invoice',
        entity_id: invoiceId,
        action: 'payment_received',
        summary: `Invoice ${data.invoice_number} payment received via Stripe`,
        metadata: {
          stripePaymentIntentId,
          amount: data.total,
          paidAt: now.toISOString(),
        },
      },
    ]);

    // Also log as system event
    await supabase.from('system_events').insert([
      {
        type: 'invoice_paid',
        severity: 'info',
        data: {
          invoiceId,
          invoiceNumber: data.invoice_number,
          amount: data.total,
          stripePaymentIntentId,
        },
      },
    ]);
  } catch (e) {
    console.error('audit/system event logging failed', e);
  }

  // Send payment received email
  try {
    const clientEmail = resolveClientEmail(data.clients, data.client_id);
    if (clientEmail) {
      await sendPaymentReceivedEmail(
        clientEmail,
        data.clients.name,
        data.invoice_number,
        data.total
      );
    }
  } catch (e) {
    console.error('Failed to send payment received email:', e);
    // Don't throw - email failure shouldn't block payment processing
  }

  return data;
}

export async function recordWebhookEvent(
  stripeEventId: string,
  eventType: string,
  data: any
) {
  const supabase = createServiceClient();

  // Check if we've already processed this webhook
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id, processed')
    .eq('stripe_event_id', stripeEventId)
    .single();

  if (existing) {
    return { alreadyProcessed: true, id: existing.id };
  }

  // Record the webhook event
  const { data: event, error } = await supabase
    .from('webhook_events')
    .insert([
      {
        event_type: eventType,
        stripe_event_id: stripeEventId,
        event_id: `${eventType}-${stripeEventId}`,
        data,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return { alreadyProcessed: false, id: event.id };
}

export async function markWebhookEventProcessed(eventId: string, error?: string) {
  const supabase = createServiceClient();

  const payload: any = {
    processed: !error,
    processed_at: new Date().toISOString(),
  };

  if (error) {
    payload.error_message = error;
    payload.retry_count = (await supabase
      .from('webhook_events')
      .select('retry_count')
      .eq('id', eventId)
      .single()).data?.retry_count || 0;
    payload.retry_count += 1;
  }

  await supabase.from('webhook_events').update(payload).eq('id', eventId);
}

export async function getInvoiceWithStripeData(invoiceId: string) {
  const supabase = createServiceClient();

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .maybeSingle();

  if (error) throw error;

  if (!invoice) {
    return null;
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', invoice.client_id)
    .maybeSingle();

  if (clientError) throw clientError;

  return {
    ...invoice,
    clients: client ?? null,
  };
}

export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const invoiceId = paymentIntent.metadata?.invoiceId;
  if (!invoiceId) {
    console.warn('Payment intent succeeded but no invoiceId in metadata', paymentIntent.id);
    return;
  }

  await markInvoiceAsPaid(invoiceId, paymentIntent.id);
}

export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createServiceClient();
  const invoiceId = paymentIntent.metadata?.invoiceId;

  if (!invoiceId) {
    console.warn('Payment intent failed but no invoiceId in metadata', paymentIntent.id);
    return;
  }

  const { data, error } = await supabase
    .from('invoices')
    .update({
      payment_status: 'failed',
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw error;

  try {
    await supabase.from('audit_logs').insert([
      {
        entity_type: 'invoice',
        entity_id: invoiceId,
        action: 'payment_failed',
        summary: `Invoice ${data.invoice_number} payment failed`,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          failureReason: paymentIntent.last_payment_error?.message,
        },
      },
    ]);

    await supabase.from('system_events').insert([
      {
        type: 'invoice_payment_failed',
        severity: 'warning',
        data: {
          invoiceId,
          invoiceNumber: data.invoice_number,
          stripePaymentIntentId: paymentIntent.id,
          failureReason: paymentIntent.last_payment_error?.message,
        },
      },
    ]);
  } catch (e) {
    console.error('audit logging failed for failed payment', e);
  }
}

export async function handleChargeRefunded(charge: Stripe.Charge) {
  const supabase = createServiceClient();
  const invoiceId = charge.metadata?.invoiceId;

  if (!invoiceId) {
    console.warn('Charge refunded but no invoiceId in metadata', charge.id);
    return;
  }

  const { data, error } = await supabase
    .from('invoices')
    .update({
      payment_status: 'refunded',
      stripe_metadata: {
        refundedChargeId: charge.id,
        refundAmount: charge.amount_refunded,
      },
    })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw error;

  try {
    await supabase.from('audit_logs').insert([
      {
        entity_type: 'invoice',
        entity_id: invoiceId,
        action: 'payment_refunded',
        summary: `Invoice ${data.invoice_number} refunded`,
        metadata: {
          stripeChargeId: charge.id,
          refundAmount: charge.amount_refunded,
        },
      },
    ]);

    await supabase.from('system_events').insert([
      {
        type: 'invoice_refunded',
        severity: 'info',
        data: {
          invoiceId,
          invoiceNumber: data.invoice_number,
          stripeChargeId: charge.id,
          refundAmount: charge.amount_refunded,
        },
      },
    ]);
  } catch (e) {
    console.error('audit logging failed for refund', e);
  }
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    if (!stripe) throw new Error('Stripe not configured');
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return null;
  }
}
