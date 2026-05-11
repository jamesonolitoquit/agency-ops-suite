import { NextResponse } from 'next/server';
import { listContracts, createContractRecord } from '@/lib/agency-db';
import { info } from '@/lib/server-logger';

function isMissingTableError(err: any) {
  return err?.code === 'PGRST205' || String(err?.message || '').includes("Could not find the table 'public.contracts'");
}

export async function GET() {
  try {
    const contracts = await listContracts();
    return NextResponse.json({ contracts });
  } catch (err: any) {
    if (isMissingTableError(err)) {
      return NextResponse.json(
        {
          error: 'contracts_table_missing',
          hint: 'Apply Supabase schema/migrations to create public.contracts.',
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

  const { clientId, proposalId, invoiceId, contractType, metadata, fileUrl } = body;
  if (!clientId) return NextResponse.json({ error: 'missing_client' }, { status: 400 });

  try {
    const contract = await createContractRecord({ clientId, proposalId, invoiceId, contractType, metadata, fileUrl });
    await info(`Contract created: ${contract.contract_number}`, { contractId: contract.id, clientId });
    return NextResponse.json({ ok: true, contract }, { status: 201 });
  } catch (err: any) {
    if (isMissingTableError(err)) {
      return NextResponse.json(
        {
          error: 'contracts_table_missing',
          hint: 'Apply Supabase schema/migrations to create public.contracts.',
        },
        { status: 503 }
      );
    }
    throw err;
  }
}
