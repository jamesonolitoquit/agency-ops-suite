"use client";
import React, { useState } from 'react';

export default function ContractSignForm({ token }: { token: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/sign/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ signed_name: name, signed_email: email, signature_data: signature }),
      });
      const data = await res.json();
      if (data?.ok) setDone(true);
      else alert('Signing failed: ' + (data?.error || 'unknown'));
    } finally { setLoading(false); }
  }

  if (done) return <div>Thank you — contract signed successfully.</div>;

  return (
    <form onSubmit={submit} style={{ maxWidth: 640 }}>
      <div>
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Signature (type your name as signature)</label>
        <input value={signature} onChange={e => setSignature(e.target.value)} required />
      </div>
      <div>
        <button type="submit" disabled={loading}>{loading ? 'Signing...' : 'Sign Contract'}</button>
      </div>
    </form>
  );
}
