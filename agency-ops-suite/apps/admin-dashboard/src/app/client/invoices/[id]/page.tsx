import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PaymentStatusBadge, InvoicePaymentButton } from '@/components/PaymentComponents';
import { getCurrentClientSession, verifyClientAccess } from '@/lib/client-auth';
import { getClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Invoice Details',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientInvoiceDetail({ params }: Props) {
  const session = await getCurrentClientSession();

  if (!session) {
    redirect('/client/login');
  }

  const { id } = await params;

  // Verify access
  const hasAccess = await verifyClientAccess(session.clientId);
  if (!hasAccess) {
    redirect('/client/login');
  }

  const supabase = await getClient();

  // Fetch invoice
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('client_id', session.clientId)
    .single();

  if (error || !invoice) {
    return (
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <div
          style={{
            padding: 16,
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: 4,
            color: '#c33',
          }}
        >
          Invoice not found.
        </div>
        <Link
          href="/client/invoices"
          style={{
            display: 'inline-block',
            marginTop: 16,
            color: '#0066cc',
            textDecoration: 'none',
          }}
        >
          ← Back to Invoices
        </Link>
      </main>
    );
  }

  const lineItems = invoice.metadata?.lineItems || [];
  const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.qty * item.unitPrice), 0);
  const tax = invoice.metadata?.tax || 0;
  const discount = invoice.metadata?.discount || 0;

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Link
        href="/client/invoices"
        style={{
          color: '#0066cc',
          textDecoration: 'none',
          marginBottom: 16,
          display: 'inline-block',
        }}
      >
        ← Back to Invoices
      </Link>

      {/* Header */}
      <div
        style={{
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          marginBottom: 24,
          background: '#f9fafb',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              INVOICE #
            </p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
              {invoice.invoice_number}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              STATUS
            </p>
            <PaymentStatusBadge status={invoice.payment_status} paidAt={invoice.paid_at} />
          </div>

          <div>
            <p style={{ margin: 0, color: '#666', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              AMOUNT DUE
            </p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111' }}>
              ${(invoice.total / 100).toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, color: '#666', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              DUE DATE
            </p>
            <p style={{ margin: 0, fontSize: 16 }}>
              {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p style={{ margin: 0, color: '#666', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              ISSUED
            </p>
            <p style={{ margin: 0, fontSize: 14 }}>
              {new Date(invoice.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16 }}>Invoice Items</h2>
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
                    Description
                  </th>
                  <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Qty
                  </th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                    Unit Price
                  </th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item: any, idx: number) => (
                  <tr
                    key={idx}
                    style={{
                      background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <td style={{ padding: 12 }}>{item.description}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      ${(item.unitPrice / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', fontWeight: 500 }}>
                      ${((item.qty * item.unitPrice) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Totals */}
      <section style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '100%', maxWidth: 300 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 12,
              paddingTop: 12,
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <p style={{ margin: 0, color: '#666' }}>Subtotal:</p>
            <p style={{ margin: 0, textAlign: 'right' }}>${(subtotal / 100).toFixed(2)}</p>

            {tax > 0 && (
              <>
                <p style={{ margin: 0, color: '#666' }}>Tax:</p>
                <p style={{ margin: 0, textAlign: 'right' }}>${(tax / 100).toFixed(2)}</p>
              </>
            )}

            {discount > 0 && (
              <>
                <p style={{ margin: 0, color: '#666' }}>Discount:</p>
                <p style={{ margin: 0, textAlign: 'right' }}>-${(discount / 100).toFixed(2)}</p>
              </>
            )}

            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 16,
                paddingTop: 12,
                borderTop: '1px solid #e5e7eb',
              }}
            >
              Total:
            </p>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 16,
                textAlign: 'right',
                paddingTop: 12,
                borderTop: '1px solid #e5e7eb',
              }}
            >
              ${(invoice.total / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      {/* Notes */}
      {invoice.notes && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>Notes</h3>
          <p style={{ margin: 0, color: '#666', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {invoice.notes}
          </p>
        </section>
      )}

      {/* Payment Section */}
      <section
        style={{
          padding: 24,
          background: invoice.payment_status === 'paid' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${invoice.payment_status === 'paid' ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: 8,
        }}
      >
        {invoice.payment_status === 'paid' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#166534', fontSize: 16, fontWeight: 600 }}>
              ✓ Payment Received
            </p>
            <p style={{ margin: 0, marginTop: 4, color: '#15803d', fontSize: 14 }}>
              Paid on {new Date(invoice.paid_at).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ margin: 0, marginBottom: 16, color: '#111' }}>
              <strong>Ready to pay?</strong> Choose a payment method below.
            </p>
            <InvoicePaymentButton
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoice_number}
              amount={invoice.total}
              paymentStatus={invoice.payment_status}
            />
          </div>
        )}
      </section>
    </main>
  );
}
