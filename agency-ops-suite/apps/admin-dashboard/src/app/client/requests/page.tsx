'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

type ClientRequest = {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
};

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/client/requests');
      if (!res.ok) throw new Error('Failed to load requests');
      const json = await res.json();
      setRequests(json.requests ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/client/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || json.error || 'Failed to submit request');
      }

      setTitle('');
      setDescription('');
      setPriority('medium');
      await loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Link href="/client/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ marginTop: 16, marginBottom: 20 }}>Requests</h1>

      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Submit New Request</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={255}
              style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              style={{ width: 220, padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 14px',
              cursor: 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </section>

      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Request History</h2>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

        {!loading && !error && requests.length === 0 && <p>No requests yet.</p>}

        {!loading && !error && requests.length > 0 && (
          <div style={{ display: 'grid', gap: 10 }}>
            {requests.map((req) => (
              <article key={req.id} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong>{req.title}</strong>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ marginBottom: 6 }}>{req.description || 'No description provided.'}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#4b5563' }}>
                  Priority: {req.priority} | Status: {req.status}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
