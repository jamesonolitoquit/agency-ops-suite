import React from 'react';
import ContractSignForm from '@/components/ContractSignForm';

async function fetchPayload(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/contracts/sign/${encodeURIComponent(token)}`, { cache: 'no-store' });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || 'failed');
  }
  const json = await res.json();
  return json.contract;
}

export default async function Page({ params }: { params: { token: string } }) {
  try {
    const contract = await fetchPayload(params.token);
    return (
      <main style={{ padding: 24 }}>
        <h1>Sign Contract {contract.contract_number}</h1>
        <p>Client: {contract.client?.name}</p>
        <section style={{ marginTop: 12 }}>
          <h2>Summary</h2>
          <div
            style={{ background: '#fff', padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}
            dangerouslySetInnerHTML={{ __html: contract.html }}
          />
        </section>
        <section style={{ marginTop: 12 }}>
          <ContractSignForm token={params.token} />
        </section>
      </main>
    );
  } catch (err: any) {
    const msg = err?.message ?? 'invalid or expired token';
    return (<main style={{ padding: 24 }}><h1>Unable to view contract</h1><p>{msg}</p></main>);
  }
}
