import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

test('Schema Health Check', async (t) => {
  await t.test('GET /api/health/schema returns 200 when schema is accessible', async () => {
    const res = await fetch(`${BASE_URL}/api/health/schema`);
    
    if (res.status !== 200) {
      const body = await res.text();
      throw new Error(`Expected 200, got ${res.status}: ${body}`);
    }

    const data = await res.json();
    assert.equal(data.status, 'healthy', `Expected status "healthy", got "${data.status}"`);
    assert.ok(data.timestamp, 'Expected timestamp in response');
    console.log(`✓ Schema health: ${data.message}`);
  });

  await t.test('Returns structured response with timestamp', async () => {
    const res = await fetch(`${BASE_URL}/api/health/schema`);
    assert.equal(res.status, 200);
    
    const data = await res.json();
    assert.ok(data.message, 'Expected message field');
    assert.ok(data.timestamp, 'Expected timestamp field');
    assert.match(data.timestamp, /^\d{4}-\d{2}-\d{2}/, 'Timestamp should be ISO format');
  });
});
