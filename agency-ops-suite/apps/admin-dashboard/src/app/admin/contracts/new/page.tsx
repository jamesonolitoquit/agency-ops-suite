"use client";
import React, { useState } from 'react';

export default function NewContractPage() {
  const [clientId, setClientId] = useState('');
  const [packageName, setPackageName] = useState('starter');
  const [price, setPrice] = useState(0);
  const [timeline, setTimeline] = useState('2 weeks');
  const [revisionLimit, setRevisionLimit] = useState('2');
  const [scope, setScope] = useState('Website design and development');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      clientId,
      metadata: { packageName, price, timeline, revisionLimit, scope },
    };

    const res = await fetch('/api/contracts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.ok && data.contract) {
      window.location.href = `/admin/contracts/${data.contract.id}`;
    } else {
      alert('Failed to create contract');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>New Contract</h1>
      <form onSubmit={create}>
        <div>
          <label>Client ID:</label>
          <input value={clientId} onChange={e => setClientId(e.target.value)} required />
        </div>
        <div>
          <label>Package:</label>
          <input value={packageName} onChange={e => setPackageName(e.target.value)} />
        </div>
        <div>
          <label>Price:</label>
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
        </div>
        <div>
          <label>Timeline:</label>
          <input value={timeline} onChange={e => setTimeline(e.target.value)} />
        </div>
        <div>
          <label>Revision Limit:</label>
          <input value={revisionLimit} onChange={e => setRevisionLimit(e.target.value)} />
        </div>
        <div>
          <label>Scope:</label>
          <textarea value={scope} onChange={e => setScope(e.target.value)} />
        </div>
        <button type="submit">Create Contract</button>
      </form>
    </main>
  );
}
