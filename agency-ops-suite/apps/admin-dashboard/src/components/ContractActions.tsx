"use client";
import React, { useState } from 'react';

export default function ContractActions({ id }: { id: string }) {
  const [sending, setSending] = useState(false);
  const [url, setUrl] = useState('');

  async function sendContract() {
    setSending(true);
    try {
      const res = await fetch(`/api/contracts/${id}/send`, { method: 'POST' });
      const data = await res.json();
      if (data?.ok) {
        setUrl(data.url || '');
      } else {
        alert(data?.error || 'Failed to send contract');
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={sendContract} disabled={sending}>{sending ? 'Sending...' : 'Send Contract'}</button>
      {url ? (
        <p style={{ marginTop: 8 }}>
          Signing URL: <a href={url} target="_blank" rel="noreferrer">{url}</a>
        </p>
      ) : null}
    </div>
  );
}
