import { NextResponse } from 'next/server';
import { sendContractForSigning, getContractById } from '@/lib/agency-db';
import { info } from '@/lib/server-logger';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { token } = await sendContractForSigning(id, 7);
  const base = process.env.NEXT_PUBLIC_APP_URL || '';
  const url = `${base}/contracts/sign/${encodeURIComponent(token)}`;

  await info(`Contract ${id} sent for signing`, { url });
  return NextResponse.json({ ok: true, url });
}
