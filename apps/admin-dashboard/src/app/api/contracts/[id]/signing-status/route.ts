import { NextResponse } from 'next/server';
import { getContractSigningStatus } from '@/lib/agency-db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const status = await getContractSigningStatus(id);
    return NextResponse.json({ ok: true, status });
  } catch (err) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
