'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ClientJoinPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing invite token.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/client/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || json.error || 'Failed to accept invite');
      }

      router.push('/client/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to accept invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: 24 }}>
      <h1>Join Client Portal</h1>
      <p>Set your password to activate your invite.</p>

      {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

      <form onSubmit={onSubmit}>
        <label style={{ display: 'block', marginBottom: 10 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 14px',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Activating...' : 'Activate Account'}
        </button>
      </form>
    </main>
  );
}
