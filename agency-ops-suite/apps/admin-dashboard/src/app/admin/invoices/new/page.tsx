"use client";
import React, { useState } from 'react';

export default function NewInvoicePage() {
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('Website design');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState(2500);
  const [message, setMessage] = useState('');

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      clientId,
      lineItems: [{ description, qty: Number(qty), unitPrice: Number(unit) }],
      notes: message,
    };

    const res = await fetch('/api/invoices', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data?.ok && data.invoice) {
      // redirect to invoice page
      window.location.href = `/admin/invoices/${data.invoice.id}`;
    } else {
      alert('Failed to create invoice');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>New Invoice</h1>
      <form onSubmit={create}>
        <div>
          <label>Client ID (paste):</label>
          <input value={clientId} onChange={e => setClientId(e.target.value)} required />
        </div>
        <div>
          <label>Description:</label>
          <input value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <label>Qty:</label>
          <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))} />
        </div>
        <div>
          <label>Unit Price:</label>
          <input type="number" value={unit} onChange={e => setUnit(Number(e.target.value))} />
        </div>
        <div>
          <label>Notes:</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        <button type="submit">Create Invoice</button>
      </form>
    </main>
  );
}
