import { NextResponse } from "next/server";
import { info, error as logError } from '@/lib/server-logger';
import { convertLeadToClientRecord, deleteClientRecord, listClients, updateClientRecord } from '@/lib/agency-db';

export async function GET() {
  try {
    const clients = await listClients();
    return NextResponse.json({
      clients,
      count: clients.length,
    });
  } catch (err: any) {
    await logError('GET /api/test-clients failed', { err: err?.stack ?? String(err) });
    return NextResponse.json({ error: 'internal_server_error', detail: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadId, name, businessType, email, phone, domain, plan = 'starter', monthlyFee = 2999 } = body;

    if (!name || !domain) {
      return NextResponse.json({ error: 'Name and domain required' }, { status: 400 });
    }

    const { client, duplicate } = await convertLeadToClientRecord(leadId, {
      name,
      businessType,
      email,
      phone,
      domain,
      plan,
      monthlyFee,
    });

    await info(`Client created: ${name} (${domain})`, { leadId, plan, monthlyFee, duplicate });

    return NextResponse.json({ ok: true, client, duplicate }, { status: duplicate ? 200 : 201 });
  } catch (err: any) {
    await logError('POST /api/test-clients failed', { err: err?.stack ?? String(err) });
    return NextResponse.json({ error: 'internal_server_error', detail: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, readyForDeploy, liveUrl, plan, monthlyFee, domain } = body;

    if (!id) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const client = await updateClientRecord(id, {
      status,
      readyForDeploy,
      liveUrl,
      plan,
      monthlyFee,
      domain,
    });
    return NextResponse.json({ ok: true, client });
  } catch (err: any) {
    await logError('PATCH /api/test-clients failed', { err: err?.stack ?? String(err) });
    return NextResponse.json({ error: 'internal_server_error', detail: String(err?.message ?? err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('id');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    await deleteClientRecord(clientId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    await logError('DELETE /api/test-clients failed', { err: err?.stack ?? String(err) });
    return NextResponse.json({ error: 'internal_server_error', detail: String(err?.message ?? err) }, { status: 500 });
  }
}
