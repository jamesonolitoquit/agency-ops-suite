import React from 'react';
import ContractActions from '@/components/ContractActions';
import { renderContractHtml } from '@/lib/contract-template';
import { headers } from 'next/headers';

async function fetchContract(id: string) {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get('x-forwarded-host');
  const host = forwardedHost || requestHeaders.get('host') || process.env.NEXT_PUBLIC_APP_URL || '';
  const protocol = requestHeaders.get('x-forwarded-proto') || 'https';
  const baseUrl = host.startsWith('http') ? host : `${protocol}://${host}`;
  const res = await fetch(`${baseUrl}/api/contracts/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.contract;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await fetchContract(id);
  const clientName = contract.clients?.name ?? '';
  const html = renderContractHtml(contract, contract.clients ?? {});

  return (
    <main style={{ padding: 24 }}>
      <h1>Contract {contract.contract_number}</h1>
      <p>Client: {clientName}</p>
      <p>Status: {contract.status}</p>
      <p>Linked Invoice: {contract.invoice_id || 'None'}</p>
      <a href={`/api/contracts/${contract.id}/pdf`} target="_blank" rel="noreferrer">Download PDF</a>
      <ContractActions id={contract.id} />
      <hr />
      <div style={{ background: '#fff', padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }} dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
