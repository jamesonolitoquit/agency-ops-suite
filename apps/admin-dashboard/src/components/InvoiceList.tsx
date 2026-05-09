"use client";
import React, { useState } from 'react';

type Invoice = {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  description?: string;
  status: string;
  dueDate?: string;
};

export default function InvoiceList({ initial }: { initial: Invoice[] }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initial || []);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  async function markPaid(id: string) {
    setLoadingIds(s => ({ ...s, [id]: true }));
    try {
      const res = await fetch('/api/test-billing', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, status: 'paid' }),
      });
      const data = await res.json();
      if (data?.invoice) {
        setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' } : i));
      }
    } finally {
      setLoadingIds(s => ({ ...s, [id]: false }));
    }
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Due</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id} style={{ borderTop: '1px solid #eee' }}>
              <td>{inv.clientName || inv.clientId}</td>
              <td>{inv.description || ''}</td>
              <td>{inv.amount.toFixed(2)}</td>
              <td>{inv.dueDate || ''}</td>
              <td>{inv.status}</td>
              <td>
                {inv.status !== 'paid' ? (
                  <button onClick={() => markPaid(inv.id)} disabled={loadingIds[inv.id]}>Mark Paid</button>
                ) : (
                  <span>Paid</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
