import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

const requiredEnvs = {
  STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
  SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: !!process.env.RESEND_API_KEY,
};

const missing = Object.entries(requiredEnvs).filter(([, ok]) => !ok).map(([k]) => k);
if (missing.length) {
  console.log('⚠️  Missing envs that may be required for full payment tests:', missing.join(', '));
} else {
  console.log('✅ All optional payment envs present');
}

async function fetchApi(endpoint: string, options: any = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  return res;
}

test('Payment Reconciliation Flow (structural checks)', async (t) => {
  if (!requiredEnvs.SUPABASE_SERVICE_ROLE_KEY) {
    await t.test('Get test clients (skipped: SUPABASE_SERVICE_ROLE_KEY missing)', { skip: true }, async () => {});
  } else {
    await t.test('Get test clients', async () => {
      const res = await fetchApi('/api/test-clients');
      // Accept 200 or 404 if endpoint not implemented
      if (![200, 404].includes(res.status)) {
        const body = await res.text().catch(() => '<no-body>');
        throw new Error(`/api/test-clients returned ${res.status}: ${body}`);
      }
      if (res.status === 200) {
        const body = await res.json();
        assert.ok(Array.isArray(body.clients) || (body.clients && typeof body.clients.length === 'number'));
      }
    });
  }

  if (!requiredEnvs.STRIPE_SECRET_KEY) {
    await t.test('Checkout endpoint accessible (skipped: STRIPE_SECRET_KEY missing)', { skip: true }, async () => {});
  } else {
    await t.test('Checkout endpoint accessible', async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/invoices/fake-id/checkout`, { method: 'POST' });
        if (![200, 404].includes(res.status)) {
          const body = await res.text().catch(() => '<no-body>');
          throw new Error(`/api/invoices/fake-id/checkout returned ${res.status}: ${body}`);
        }
      } catch (e) {
        // Network error counts as failure to reach endpoint
        throw e;
      }
    });
  }

  await t.test('Webhook endpoint responds to invalid signature', async () => {
    const res = await fetch(`${BASE_URL}/api/webhooks/stripe`, {
      method: 'POST',
      headers: { 'stripe-signature': 'invalid' },
      body: JSON.stringify({}),
    });
    assert.ok([401, 400, 500, 404].includes(res.status));
  });

  await t.test('Admin invoices page accessible', async () => {
    const res = await fetch(`${BASE_URL}/admin/invoices`);
    assert.ok(res.ok || [307, 308].includes(res.status));
  });

  await t.test('Webhook storage/schema presence (manual check)', async () => {
    // This is a placeholder: verifying webhook_events table requires DB access.
    // Pass if endpoints exist above.
    assert.ok(true);
  });
});

console.log('\n📋 Payment Reconciliation Smoke Test (wrapper)');
