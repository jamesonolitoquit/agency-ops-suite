import assert from 'node:assert/strict';
import test from 'node:test';

const BASE_URL = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:3000';

async function fetchRoute(path) {
  return fetch(new URL(path, BASE_URL), {
    redirect: 'manual',
  });
}

test('client login page renders', async () => {
  const response = await fetchRoute('/login');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Sign in/i);
});

for (const route of ['/client/dashboard', '/client/requests', '/client/invoices', '/client/assets']) {
  test(`${route} redirects unauthenticated users to client login`, async () => {
    const response = await fetchRoute(route);
    assert.ok([307, 308, 302].includes(response.status), `expected redirect, got ${response.status}`);
    const location = response.headers.get('location') ?? '';
    assert.match(location, /\/login/i);
  });
}
