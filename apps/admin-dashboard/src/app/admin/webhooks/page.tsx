import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function fetchWebhookEvents() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('webhook_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

export default async function WebhookEventsPage() {
  const events = await fetchWebhookEvents();

  return (
    <main style={{ padding: 24 }}>
      <h1>Webhook Events</h1>
      <p style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
        Last 100 Stripe webhook events processed by the system.
      </p>

      {events.length === 0 ? (
        <p style={{ color: '#999' }}>No webhook events recorded yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #e5e7eb',
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Event Type
                </th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Stripe Event ID
                </th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Status
                </th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Retries
                </th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Created
                </th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event: any, idx) => (
                <tr
                  key={event.id}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <td style={{ padding: 12 }}>
                    <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 3 }}>
                      {event.event_type}
                    </code>
                  </td>
                  <td style={{ padding: 12, fontFamily: 'monospace' }}>
                    {event.stripe_event_id?.substring(0, 20)}...
                  </td>
                  <td style={{ padding: 12 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 500,
                        background: event.processed
                          ? '#d1fae5'
                          : event.error_message
                            ? '#fee2e2'
                            : '#dbeafe',
                        color: event.processed
                          ? '#065f46'
                          : event.error_message
                            ? '#991b1b'
                            : '#1e40af',
                      }}
                    >
                      {event.processed
                        ? 'Processed'
                        : event.error_message
                          ? 'Failed'
                          : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{event.retry_count || 0}</td>
                  <td style={{ padding: 12 }}>
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: 12 }}>
                    <details style={{ cursor: 'pointer' }}>
                      <summary style={{ fontWeight: 500, color: '#0066cc' }}>View</summary>
                      <pre
                        style={{
                          marginTop: 8,
                          padding: 12,
                          background: '#f3f4f6',
                          borderRadius: 4,
                          fontSize: 11,
                          overflow: 'auto',
                          maxHeight: 200,
                        }}
                      >
                        {JSON.stringify(event, null, 2)}
                      </pre>
                    </details>
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
