import { NextResponse } from 'next/server';
import {
  stripe,
  recordWebhookEvent,
  markWebhookEventProcessed,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleChargeRefunded,
  verifyWebhookSignature,
} from '@/lib/stripe-payment';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * POST /api/webhooks/stripe
 * 
 * Handles Stripe webhook events.
 * Must verify webhook signature before processing.
 */
export async function POST(request: Request) {
  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'webhook_secret_not_configured' }, { status: 500 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, WEBHOOK_SECRET);
    if (!event) {
      return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
    }

    console.warn(`[Webhook] Processing Stripe event: ${event.type} (${event.id})`);

    // Check if we've already processed this event (idempotency)
    const { alreadyProcessed, id: eventRecordId } = await recordWebhookEvent(
      event.id,
      event.type,
      event.data
    );

    if (alreadyProcessed) {
      console.warn(`[Webhook] Event already processed: ${event.id}`);
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    // Process the event based on type
    let processed = false;
    let error: string | undefined;

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as any;
          await handlePaymentIntentSucceeded(paymentIntent);
          console.warn(`[Webhook] Payment intent succeeded: ${paymentIntent.id}`);
          processed = true;
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as any;
          await handlePaymentIntentFailed(paymentIntent);
          console.warn(`[Webhook] Payment intent failed: ${paymentIntent.id}`);
          processed = true;
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as any;
          await handleChargeRefunded(charge);
          console.warn(`[Webhook] Charge refunded: ${charge.id}`);
          processed = true;
          break;
        }

        case 'charge.dispute.created': {
          console.warn(`[Webhook] Dispute created: ${(event.data.object as any).id}`);
          // Log for investigation
          processed = true;
          break;
        }

        default:
          console.warn(`[Webhook] Unhandled event type: ${event.type}`);
          processed = true; // Mark as processed even if unhandled
      }
    } catch (err: any) {
      error = err.message || 'Unknown error';
      console.error(`[Webhook] Error processing event ${event.id}:`, err);
    }

    // Mark the webhook event as processed
    await markWebhookEventProcessed(eventRecordId, error);

    if (error) {
      return NextResponse.json(
        { error: 'webhook_processing_failed', message: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, eventId: event.id });
  } catch (err: any) {
    console.error('[Webhook] Unexpected error:', err);
    return NextResponse.json(
      { error: 'internal_server_error', message: err.message },
      { status: 500 }
    );
  }
}
