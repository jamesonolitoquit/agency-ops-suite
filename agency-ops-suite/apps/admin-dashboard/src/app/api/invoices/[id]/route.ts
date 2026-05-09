import { NextResponse } from 'next/server';
import { getInvoiceById, updateInvoiceRecord } from '@/lib/agency-db';
import { info } from '@/lib/server-logger';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ invoice });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  const { status, paidAt, notes } = body;
  const invoice = await updateInvoiceRecord(id, { status, paidAt, notes });
  await info(`Invoice updated: ${id} -> ${status}`);
  return NextResponse.json({ ok: true, invoice });
}
