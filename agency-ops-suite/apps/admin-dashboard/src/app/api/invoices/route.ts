import { NextResponse } from 'next/server';
import { listInvoices, createInvoiceRecord, getInvoiceById } from '@/lib/agency-db';
import { info } from '@/lib/server-logger';

function isMissingTableError(err: any) {
  return err?.code === 'PGRST205' || String(err?.message || '').includes("Could not find the table 'public.invoices'");
}

export async function GET() {
  try {
    const invoices = await listInvoices();
    return NextResponse.json({ invoices });
  } catch (err: any) {
    if (isMissingTableError(err)) {
      return NextResponse.json(
        {
          error: 'invoices_table_missing',
          hint: 'Apply Supabase schema/migrations to create public.invoices.',
        },
        { status: 503 }
      );
    }
    throw err;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });

  const { clientId, project, lineItems, tax, discount, dueDate, notes } = body;
  if (!clientId || !lineItems) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

  try {
    const invoice = await createInvoiceRecord({ clientId, project, lineItems, tax, discount, dueDate, notes });
    await info(`Invoice created: ${invoice.invoice_number}`, { invoiceId: invoice.id, clientId });

    return NextResponse.json({ ok: true, invoice }, { status: 201 });
  } catch (err: any) {
    if (isMissingTableError(err)) {
      return NextResponse.json(
        {
          error: 'invoices_table_missing',
          hint: 'Apply Supabase schema/migrations to create public.invoices.',
        },
        { status: 503 }
      );
    }
    throw err;
  }
}
