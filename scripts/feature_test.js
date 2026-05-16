// Feature Test Suite for Agency Ops Suite
// Tests all critical features needed for first clients

const dotenv = require('dotenv');
const path = require('path');

// Check what's already set
console.log(`process.env.INTAKE_WEBHOOK_SECRET BEFORE dotenv: "${process.env.INTAKE_WEBHOOK_SECRET}"`);

const envPath = path.resolve(__dirname, '../apps/admin-dashboard/.env.local');
console.log(`Loading .env from: ${envPath}`);
const result = dotenv.config({ path: envPath, override: true });
console.log(`dotenv parsed INTAKE_WEBHOOK_SECRET: "${result.parsed?.INTAKE_WEBHOOK_SECRET}"`);
console.log(`process.env.INTAKE_WEBHOOK_SECRET AFTER dotenv: "${process.env.INTAKE_WEBHOOK_SECRET}"`);

(async () => {
  const results = {
    passed: [],
    failed: [],
    skipped: [],
  };

  const BASE = process.env.BASE_URL || process.env.DEPLOY_URL || 'http://localhost:3000';
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || '';
  const INTAKE_WEBHOOK_SECRET = process.env.INTAKE_WEBHOOK_SECRET || '';
  const SUPABASE_URL = process.env.SUPABASE_URL || '';

  async function test(name, fn) {
    try {
      const start = Date.now();
      await fn();
      const elapsed = Date.now() - start;
      results.passed.push({ name, elapsed });
      console.log(`✅ ${name} (${elapsed}ms)`);
    } catch (err) {
      results.failed.push({ name, error: String(err) });
      console.log(`❌ ${name}: ${err.message}`);
    }
  }

  // Test 1: Public site loads
  await test('Public site home page (GET /)', async () => {
    const r = await fetch(`${BASE}/`);
    if (r.status !== 200) throw new Error(`Status ${r.status}`);
  });

  // Test 2: Login page loads
  await test('Login page (GET /login)', async () => {
    const r = await fetch(`${BASE}/login`);
    if (r.status !== 200) throw new Error(`Status ${r.status}`);
  });

  // Test 3: Lead intake endpoint exists (POST without auth)
  await test('Lead intake endpoint exists (POST /api/intake/lead)', async () => {
    const r = await fetch(`${BASE}/api/intake/lead`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    // 401 (missing secret) is expected, 405 means endpoint doesn't exist
    if (r.status === 405) throw new Error('Endpoint not found (405)');
  });

  // Test 4: POST test lead with secret
  await test('Create test lead (POST /api/intake/lead with secret)', async () => {
    const secret = process.env.INTAKE_WEBHOOK_SECRET || '';
    console.log(`  DEBUG: Using secret: "${secret}" (length: ${secret.length})`);
    if (!secret) {
      throw new Error('INTAKE_WEBHOOK_SECRET not provided (env)');
    }
    const r = await fetch(`${BASE}/api/intake/lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-intake-secret': secret,
      },
      body: JSON.stringify({ name: 'Test Lead', email: 'test+' + Date.now() + '@localhost.dev', businessType: 'Testing' }),
    });
    const text = await r.text();
    if (r.status === 401) throw new Error('Unauthorized (check INTAKE_WEBHOOK_SECRET)');
    if (r.status >= 400) throw new Error(`Status ${r.status}: ${text.slice(0, 500)}`);
  });

  // Test 5: Clients endpoint (protected)
  await test('Protected route /api/admin/clients returns 401 without auth', async () => {
    const r = await fetch(`${BASE}/api/admin/clients`);
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });

  // Test 6: System health endpoint (requires auth)
  await test('System health endpoint requires auth (GET /api/admin/system-health)', async () => {
    const r = await fetch(`${BASE}/api/admin/system-health`);
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });

  // Test 7: Dashboard pages exist (not authenticated, so should redirect or 401)
  await test('Dashboard routes exist (/clients, /billing, /leads)', async () => {
    const paths = ['/clients', '/billing', '/leads'];
    for (const p of paths) {
      const r = await fetch(`${BASE}${p}`);
      // 200 (returns page) or 307/302 (redirect to login) are OK, 404 means missing
      if (r.status === 404) throw new Error(`${p} not found (404)`);
    }
  });

  // Test 8: API routes exist
  await test('API routes exist (/api/admin/clients, /api/admin/system-health, /api/intake/lead)', async () => {
    const endpoints = ['/api/admin/clients', '/api/admin/system-health', '/api/intake/lead'];
    for (const ep of endpoints) {
      const r = await fetch(`${BASE}${ep}`, { method: 'GET' });
      // 405 (method not allowed) is OK, means route exists. 404 is bad.
      if (r.status === 404) throw new Error(`${ep} not found (404)`);
    }
  });

  // Test 9: Deployment checklist page
  await test('Deployment checklist page exists (GET /deployment-checklist)', async () => {
    const r = await fetch(`${BASE}/deployment-checklist`);
    if (r.status === 404) throw new Error('Not found (404)');
  });

  // Test 10: Reports page
  await test('Reports page exists (GET /reports)', async () => {
    const r = await fetch(`${BASE}/reports`);
    if (r.status === 404) throw new Error('Not found (404)');
  });

  // Test 11: Contracts/Proposals pages
  await test('Contracts/Proposals routes exist (/contract/new, /proposal)', async () => {
    const paths = ['/contract/new', '/proposal'];
    for (const p of paths) {
      const r = await fetch(`${BASE}${p}`);
      if (r.status === 404) throw new Error(`${p} not found (404)`);
    }
  });

  // Test 12: Audit logs page
  await test('Audit logs page exists (GET /audit-logs)', async () => {
    const r = await fetch(`${BASE}/audit-logs`);
    if (r.status === 404) throw new Error('Not found (404)');
  });

  // Test 13: Tasks and Assets pages
  await test('Tasks and Assets pages exist (/tasks, /assets)', async () => {
    const paths = ['/tasks', '/assets'];
    for (const p of paths) {
      const r = await fetch(`${BASE}${p}`);
      if (r.status === 404) throw new Error(`${p} not found (404)`);
    }
  });

  // Test 14: Health check
  await test('Health check endpoint responds', async () => {
    const r = await fetch(`${BASE}/api/admin/system-health`);
    // 401 expected (no auth), not 404
    if (r.status === 404) throw new Error('Health endpoint not found (404)');
  });

  // Summary
  console.log('\n========== FEATURE TEST SUMMARY ==========\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed tests:');
    for (const f of results.failed) {
      console.log(`  - ${f.name}: ${f.error}`);
    }
  }

  const totalTime = results.passed.reduce((a, b) => a + b.elapsed, 0);
  console.log(`\nTotal time: ${totalTime}ms`);

  if (results.failed.length === 0) {
    console.log('\n🎉 All critical features present and accessible!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some features failed. Check errors above.\n');
    process.exit(1);
  }
})();
