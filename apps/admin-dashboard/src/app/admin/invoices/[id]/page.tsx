import React from 'react';
import { PaymentStatusBadge, InvoicePaymentButton } from '@/components/PaymentComponents';

async function fetchInvoice(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/invoices/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed');
  const json = await res.json();
  return json.invoice;
}

export default async function Page({ params }: { params: { id: string } }) {
  const invoice = await fetchInvoice(params.id);
  const clientName = invoice.clients?.name ?? '';

  return (
    <main style={{ padding: 24 }}>
      <h1>Invoice {invoice.invoice_number}</h1>

      <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Client</p>
          <p style={{ fontSize: 16, fontWeight: 500 }}>{clientName}</p>
        </div>

        <div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Status</p>
          <p style={{ fontSize: 16, fontWeight: 500 }}>{invoice.status}</p>
        </div>

        <div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Payment Status</p>
          <PaymentStatusBadge
            status={invoice.payment_status || 'unpaid'}
            paidAt={invoice.paid_at}
          />
        </div>

        <div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Total Amount</p>
          <p style={{ fontSize: 16, fontWeight: 500 }}>
            ${(invoice.total / 100).toFixed(2)}
          </p>
        </div>

        <div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Due Date</p>
          <p style={{ fontSize: 16, fontWeight: 500 }}>
            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        <div>
          <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Created</p>
          <p style={{ fontSize: 16, fontWeight: 500 }}>
            {new Date(invoice.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Line Items</h2>
        {invoice.metadata?.lineItems && invoice.metadata.lineItems.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: 8, textAlign: 'left', fontWeight: 500 }}>Description</th>
                <th style={{ padding: 8, textAlign: 'right', fontWeight: 500 }}>Qty</th>
                <th style={{ padding: 8, textAlign: 'right', fontWeight: 500 }}>Unit Price</th>
                <th style={{ padding: 8, textAlign: 'right', fontWeight: 500 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.metadata.lineItems.map((item: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 8 }}>{item.description}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{item.qty}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td style={{ padding: 8, textAlign: 'right' }}>
                    ${(item.qty * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#999' }}>No line items</p>
        )}
      </div>

      <div style={{ marginBottom: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Totals</h2>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: 8 }}>Subtotal:</td>
              <td style={{ padding: 8, textAlign: 'right' }}>${(invoice.subtotal / 100).toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>Tax:</td>
              <td style={{ padding: 8, textAlign: 'right' }}>${(invoice.tax / 100).toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>Discount:</td>
              <td style={{ padding: 8, textAlign: 'right' }}>
                ${(invoice.discount / 100).toFixed(2)}
              </td>
            </tr>
            <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 'bold' }}>
              <td style={{ padding: 8 }}>Total:</td>
              <td style={{ padding: 8, textAlign: 'right' }}>
                ${(invoice.total / 100).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {invoice.notes && (
        <div style={{ marginBottom: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3>Notes</h3>
          <p>{invoice.notes}</p>
        </div>
      )}

      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <InvoicePaymentButton
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoice_number}
          amount={invoice.total}
          paymentStatus={invoice.payment_status || 'unpaid'}
        />
        <a
          href={`/api/invoices/${invoice.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '8px 16px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            textDecoration: 'none',
            color: '#111',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Download PDF
        </a>
      </div>

      {invoice.payment_url && (
        <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 8, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666', marginBottom: 8 }}>
            Payment URL (Stripe Checkout):
          </p>
          <a href={invoice.payment_url} target="_blank" rel="noreferrer" style={{ color: '#0066cc', wordBreak: 'break-all' }}>
            {invoice.payment_url}
          </a>
        </div>
      )}
    </main>
  );
}
