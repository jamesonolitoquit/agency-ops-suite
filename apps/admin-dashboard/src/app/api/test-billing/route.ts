import { NextResponse } from "next/server";
import { info } from '@/lib/server-logger';
import { createBillingRecord, listBilling, updateBillingRecord } from '@/lib/agency-db';

function toInvoiceShape(row: any) {
  const paid = Boolean(row.paid);
  const dueDate = row.due_date ? new Date(row.due_date) : null;
  const overdue = !paid && dueDate ? dueDate.getTime() < Date.now() : false;

  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.clients?.name ?? row.clientName ?? '',
    amount: Number(row.amount ?? 0),
    description: row.description ?? '',
    status: paid ? 'paid' : overdue ? 'overdue' : row.status ?? 'draft',
    createdAt: row.created_at,
    dueDate: row.due_date,
  };
}

export async function GET() {
  const invoices = await listBilling();
  const normalizedInvoices = invoices.map(toInvoiceShape);
  const stats = {
    total: normalizedInvoices.length,
    draft: normalizedInvoices.filter(i => i.status === 'draft').length,
    sent: normalizedInvoices.filter(i => i.status === 'sent').length,
    paid: normalizedInvoices.filter(i => i.status === 'paid').length,
    overdue: normalizedInvoices.filter(i => i.status === 'overdue').length,
    totalRevenue: normalizedInvoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + Number(i.amount || 0), 0),
  };

  return NextResponse.json({
    invoices: normalizedInvoices,
    stats,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { clientId, clientName, amount, description, dueDate } = body;

  if (!clientId || !amount || !dueDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const invoice = await createBillingRecord({
    clientId,
    amount,
    dueDate,
    notes: description,
  });
  await info(`Invoice created: ${clientName}`, { amount, description });
  return NextResponse.json({ ok: true, invoice: toInvoiceShape(invoice) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  const invoice = await updateBillingRecord(id, {
    status,
    paid: status === 'paid',
    lastPaidAt: status === 'paid' ? new Date().toISOString() : undefined,
    nextDueDate: status === 'paid' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  await info(`Invoice updated: ${invoice.id} → ${status}`);

  return NextResponse.json({ ok: true, invoice: toInvoiceShape(invoice) });
}
