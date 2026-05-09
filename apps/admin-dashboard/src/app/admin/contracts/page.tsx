import React from 'react';

async function fetchContracts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/contracts`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch contracts');
  const json = await res.json();
  return json.contracts ?? [];
}

export default async function Page() {
  const contracts = await fetchContracts();

  const badgeStyle = (status: string) => {
    if (status === 'signed') return { background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 999 };
    if (status === 'sent') return { background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 999 };
    if (status === 'expired') return { background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 999 };
    return { background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 999 };
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Contracts</h1>
      <a href="/admin/contracts/new">New Contract</a>
      <table style={{ width: '100%', marginTop: 12 }}>
        <thead>
          <tr><th>Contract #</th><th>Client</th><th>Type</th><th>Status</th><th>Created</th></tr>
        </thead>
        <tbody>
          {contracts.map((c: any) => (
            <tr key={c.id}>
              <td><a href={`/admin/contracts/${c.id}`}>{c.contract_number}</a></td>
              <td>{c.clients?.name ?? ''}</td>
              <td>{c.contract_type}</td>
              <td><span style={badgeStyle(c.status)}>{c.status}</span></td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
