import { NextResponse } from 'next/server';
import { getContractByToken, markContractViewed, signContractRecord } from '@/lib/agency-db';
import { renderContractHtml } from '@/lib/contract-template';
import { createServiceClient } from '@/lib/supabase/service';

// simple in-memory rate limiter per IP
const attempts: Record<string, number> = {};
const WINDOW_MS = 60 * 1000; // 1 minute
setInterval(() => { for (const k of Object.keys(attempts)) delete attempts[k]; }, WINDOW_MS);

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const contract = await getContractByToken(token);
  if (!contract) return NextResponse.json({ error: 'invalid_token' }, { status: 404 });

  if (contract.status === 'signed') {
    return NextResponse.json({ error: 'already_signed' }, { status: 409 });
  }

  const now = new Date();
  if (contract.signing_expires_at && new Date(contract.signing_expires_at) < now) {
    const supabase = createServiceClient();
    await supabase.from('contracts').update({ status: 'expired', signing_token: null }).eq('id', contract.id);
    await supabase.from('audit_logs').insert([
      {
        entity_type: 'contract',
        entity_id: contract.id,
        action: 'contract_expired',
        summary: 'Contract signing link expired',
        metadata: { token },
      },
    ]);
    return NextResponse.json({ error: 'expired' }, { status: 410 });
  }

  // mark viewed
  await markContractViewed(contract.id);

  // return minimal payload for public rendering
  const payload = {
    id: contract.id,
    contract_number: contract.contract_number,
    client: { name: contract.clients?.name ?? '' },
    metadata: contract.metadata,
    html: renderContractHtml(contract, contract.clients),
    signing_expires_at: contract.signing_expires_at,
  };
  return NextResponse.json({ ok: true, contract: payload });
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const ua = request.headers.get('user-agent') || '';

  // rate limit key per IP
  const key = `${ip}:${token}`;
  attempts[key] = (attempts[key] || 0) + 1;
  if (attempts[key] > 10) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });

  const { signed_name, signed_email, signature_data } = body;
  if (!signed_name || !signed_email || !signature_data) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

  // perform signing
  try {
    const signed = await signContractRecord(token, signed_name, signed_email, signature_data, ip, ua);
    return NextResponse.json({ ok: true, contract: { id: signed.id, status: signed.status, signed_at: signed.signed_at } });
  } catch (err: any) {
    const msg = err?.message || 'sign_failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
