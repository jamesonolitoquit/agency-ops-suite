import React from 'react';
import Link from 'next/link';
import { PaymentStatusBadge } from '@/components/PaymentComponents';
import { getClient } from '@/lib/supabase/server';

async function fetchInvoices() {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('invoices')
    .select('*, clients(name, email)')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

export default async function Page() {
  const invoices = await fetchInvoices();

  return (
    <main style={{ padding: 24 }}>
      <h1>Invoices</h1>
      <p>Manage invoices and track payment status.</p>

      <div style={{ marginBottom: 16 }}>
        <Link
          href="/admin/invoices/new"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            borderRadius: 4,
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          + New Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p style={{ color: '#999' }}>No invoices yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #e5e7eb',
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Invoice #
                </th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Client
                </th>
                <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                  Amount
                </th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Payment Status
                </th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Due Date
                </th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Created
                </th>
                <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice: any, idx) => (
                <tr
                  key={invoice.id}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <td style={{ padding: 12 }}>
                    <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 3 }}>
                      {invoice.invoice_number}
                    </code>
                  </td>
                  <td style={{ padding: 12 }}>{invoice.clients?.name || 'Unknown'}</td>
                  <td style={{ padding: 12, textAlign: 'right', fontWeight: 500 }}>
                    ${(invoice.total / 100).toFixed(2)}
                  </td>
                  <td style={{ padding: 12 }}>
                    <PaymentStatusBadge
                      status={invoice.payment_status || 'unpaid'}
                      paidAt={invoice.paid_at}
                    />
                  </td>
                  <td style={{ padding: 12 }}>
                    {invoice.due_date
                      ? new Date(invoice.due_date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td style={{ padding: 12 }}>
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <Link
                      href={`/admin/invoices/${invoice.id}`}
                      style={{
                        color: '#0066cc',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
