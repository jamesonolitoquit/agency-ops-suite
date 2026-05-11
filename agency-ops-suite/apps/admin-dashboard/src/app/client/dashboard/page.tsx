import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentClientSession, clearClientSession } from '@/lib/client-auth';
import { getClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Client Dashboard',
};

export default async function ClientDashboard() {
  const session = await getCurrentClientSession();

  if (!session) {
    redirect('/client/login');
  }

  const supabase = await getClient();

  // Fetch client details
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', session.clientId)
    .single();

  // Fetch pending invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', session.clientId)
    .in('payment_status', ['unpaid', 'processing'])
    .order('due_date', { ascending: true })
    .limit(5);

  // Fetch contracts
  const { data: contracts } = await supabase
    .from('contracts')
    .select('*')
    .eq('client_id', session.clientId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Calculate totals
  const totalDue = (invoices || []).reduce((sum, inv) => sum + inv.total, 0);
  const pendingCount = invoices?.length || 0;

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: 4 }}>{client?.name}</h1>
          <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Welcome, {session.userEmail}</p>
        </div>
        <form
          action={async () => {
            'use server';
            await clearClientSession();
            redirect('/client/login');
          }}
        >
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Sign Out
          </button>
        </form>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div
          style={{
            padding: 20,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
          }}
        >
          <p style={{ margin: 0, color: '#991b1b', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            AMOUNT DUE
          </p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#991b1b' }}>
            ${(totalDue / 100).toFixed(2)}
          </p>
          <p style={{ margin: 0, marginTop: 8, color: '#7f1d1d', fontSize: 12 }}>
            {pendingCount} invoice{pendingCount !== 1 ? 's' : ''} pending
          </p>
        </div>

        <div
          style={{
            padding: 20,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
          }}
        >
          <p style={{ margin: 0, color: '#166534', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            CONTRACTS
          </p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#166534' }}>
            {contracts?.length || 0}
          </p>
          <p style={{ margin: 0, marginTop: 8, color: '#15803d', fontSize: 12 }}>
            Total on file
          </p>
        </div>
      </div>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link
            href="/client/requests"
            style={{
              display: 'inline-block',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 6,
              padding: '10px 14px',
              fontWeight: 500,
            }}
          >
            Submit Request
          </Link>
          <Link
            href="/client/assets"
            style={{
              display: 'inline-block',
              background: '#0f766e',
              color: 'white',
              textDecoration: 'none',
              borderRadius: 6,
              padding: '10px 14px',
              fontWeight: 500,
            }}
          >
            Upload Assets
          </Link>
        </div>
      </section>

      {/* Pending Invoices */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20 }}>Pending Invoices</h2>

        {!invoices || invoices.length === 0 ? (
          <p style={{ color: '#999' }}>No pending invoices.</p>
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
                  <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, idx) => (
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
                      {new Date(invoice.due_date).toLocaleDateString()}
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
        )}

        {invoices && invoices.length > 0 && (
          <Link
            href="/client/invoices"
            style={{
              display: 'inline-block',
              marginTop: 16,
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            View all invoices →
          </Link>
        )}
      </section>

      {/* Recent Contracts */}
      <section>
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20 }}>Recent Contracts</h2>

        {!contracts || contracts.length === 0 ? (
          <p style={{ color: '#999' }}>No contracts on file.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {contracts.map((contract) => (
              <div
                key={contract.id}
                style={{
                  padding: 16,
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>
                    <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 3 }}>
                      {contract.contract_number}
                    </code>
                  </p>
                  <p style={{ margin: 0, color: '#666', fontSize: 14, marginTop: 4 }}>
                    Signed {new Date(contract.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/client/contracts/${contract.id}`}
                  style={{
                    color: '#0066cc',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  View PDF
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
