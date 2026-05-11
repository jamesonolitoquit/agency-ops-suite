import { NextResponse } from 'next/server';
import { getContractById } from '@/lib/agency-db';
import { generateContractPdf } from '@/lib/contract-pdf';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await getContractById(id);
  if (!contract) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const client = contract.clients ?? { name: 'Client' };
  const buffer = await generateContractPdf(contract, client);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${contract.contract_number}.pdf"`,
    },
  });
}
