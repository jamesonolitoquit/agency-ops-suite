import { NextResponse } from 'next/server';
import { getInvoiceById } from '@/lib/agency-db';
import { generateInvoicePdf } from '@/lib/invoice-pdf';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const client = invoice.clients ?? { name: 'Client' };
  const lineItems = (invoice.metadata?.lineItems) ?? [];
  const buffer = await generateInvoicePdf(invoice, client, lineItems);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
