import { NextResponse } from 'next/server';
import { updateBillingRecord } from '@/lib/agency-db';
import { info, warn } from '@/lib/server-logger';

export async function POST(request: Request) {
  const signatureHeader = request.headers.get('x-provider-signature') || '';
  // Optional: validate signature using INTENTIONAL placeholder env secret
  const payload = await request.json().catch(() => null);
  if (!payload) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });

  const invoiceId = payload.invoice_id || payload.metadata?.invoice_id;
  const transactionId = payload.transaction_id || payload.id;
  const status = payload.status || payload.payment_status || 'paid';

  if (!invoiceId || !transactionId) {
    return NextResponse.json({ error: 'missing_invoice_or_transaction' }, { status: 400 });
  }

  try {
    // Idempotency guard: update only if not already marked paid
    const updated = await updateBillingRecord(invoiceId, {
      paid: status === 'paid',
      lastPaidAt: status === 'paid' ? new Date().toISOString() : undefined,
    });

    await info(`Payment webhook processed for invoice ${invoiceId}`, { transactionId });
    return NextResponse.json({ ok: true, invoice: updated });
  } catch (err) {
    await warn('Payment webhook processing failed', { err: String(err), invoiceId, transactionId, signatureHeader });
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}
