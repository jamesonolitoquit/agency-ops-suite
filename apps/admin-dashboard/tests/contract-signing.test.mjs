import test from 'node:test';

test('runs signing API smoke test when base URL is provided', async () => {
  const base = process.env.TEST_BASE_URL;
  const contractId = process.env.TEST_CONTRACT_ID;

  if (!base || !contractId) {
    console.warn('TEST_BASE_URL or TEST_CONTRACT_ID not set — skipping signing API smoke test');
    return;
  }

  const sendRes = await fetch(`${base}/api/contracts/${contractId}/send`, { method: 'POST' });
  if (!sendRes.ok) throw new Error('send endpoint failed');
  const sendJson = await sendRes.json();
  const signUrl = sendJson?.url;
  if (!signUrl) throw new Error('missing signing URL');

  const token = signUrl.split('/').pop();
  if (!token) throw new Error('missing token');

  const viewRes = await fetch(`${base}/api/contracts/sign/${token}`);
  if (!viewRes.ok) throw new Error('view endpoint failed');

  const signRes = await fetch(`${base}/api/contracts/sign/${token}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      signed_name: 'Test Signer',
      signed_email: 'signer@example.com',
      signature_data: 'SIG-DATA',
    }),
  });

  if (!signRes.ok) throw new Error('sign endpoint failed');
  const signJson = await signRes.json();
  if (signJson?.contract?.status !== 'signed') throw new Error('status not signed');
});
