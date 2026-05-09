import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentClientSession } from '@/lib/client-auth';
import { getClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'My Invoices',
};

export default async function ClientInvoices() {
  const session = await getCurrentClientSession();

  if (!session) {
    redirect('/client/login');
  }

  const supabase = await getClient();

  // Fetch all invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', session.clientId)
    .order('created_at', { ascending: false });

  // Group by status
  const unpaid = invoices?.filter((i) => i.payment_status === 'unpaid') || [];
  const paid = invoices?.filter((i) => i.payment_status === 'paid') || [];

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/client/dashboard"
          style={{
            color: '#0066cc',
            textDecoration: 'none',
            fontSize: 14,
            marginBottom: 16,
            display: 'inline-block',
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 style={{ marginTop: 0, marginBottom: 24 }}>My Invoices</h1>

      {/* Unpaid Section */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, color: '#991b1b' }}>
          Unpaid ({unpaid.length})
        </h2>

        {unpaid.length === 0 ? (
          <p style={{ color: '#999' }}>No unpaid invoices. Great!</p>
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
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                    Amount
                  </th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Due Date
                  </th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Issued
                  </th>
                  <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {unpaid.map((invoice, idx) => (
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
                    <td style={{ padding: 12, textAlign: 'right', fontWeight: 500, color: '#991b1b' }}>
                      ${(invoice.total / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: 12 }}>
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 12 }}>
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <Link
                        href={`/client/invoices/${invoice.id}`}
                        style={{
                          color: '#0066cc',
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        View & Pay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Paid Section */}
      {paid.length > 0 && (
        <section>
          <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, color: '#166534' }}>
            Paid ({paid.length})
          </h2>

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
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>
                    Amount
                  </th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Paid Date
                  </th>
                  <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paid.map((invoice, idx) => (
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
                    <td style={{ padding: 12, textAlign: 'right', fontWeight: 500 }}>
                      ${(invoice.total / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: 12 }}>
                      {new Date(invoice.paid_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <Link
                        href={`/client/invoices/${invoice.id}`}
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
        </section>
      )}
    </main>
  );
}
