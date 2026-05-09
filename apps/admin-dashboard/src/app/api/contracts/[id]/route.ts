import { NextResponse } from 'next/server';
import { getContractById, updateContractRecord } from '@/lib/agency-db';
import { info } from '@/lib/server-logger';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ contract });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  const { status, signedName, signedIp, signedAt, fileUrl, metadata } = body;
  const contract = await updateContractRecord(id, { status, signedName, signedIp, signedAt, fileUrl, metadata });
  await info(`Contract updated: ${id} -> ${status}`);
  return NextResponse.json({ ok: true, contract });
}
