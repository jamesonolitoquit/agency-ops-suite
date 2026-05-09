#!/usr/bin/env node
/**
 * Test script: Phase A - Auth Enforcement
 * 
 * Tests that authentication is properly enforced on admin endpoints:
 * 1. Anonymous requests (no token) → 401 Unauthorized
 * 2. Invalid tokens → 401 Unauthorized
 * 3. Public endpoints (no auth) → 200 OK
 * 
 * Note: For full testing with real tokens, you need:
 * - Valid Supabase JWT token
 * - User must have admin role in Supabase auth metadata
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const INTAKE_SECRET = process.env.INTAKE_WEBHOOK_SECRET || 'local-test-secret-abc123xyz';

// ANSI colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(method, path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...(options.body && { body: JSON.stringify(options.body) }),
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);
    
    return {
      status: res.status,
      ok: res.ok,
      data,
      url,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      error: err.message,
      url,
    };
  }
}

async function runTests() {
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('PHASE A: AUTHENTICATION ENFORCEMENT TESTS', 'cyan');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  let passed = 0;
  let failed = 0;

  // Test 1: Anonymous request to admin endpoint → 401
  log('TEST 1: Anonymous request to /api/admin/clients', 'yellow');
  const test1 = await testEndpoint('GET', '/api/admin/clients');
  if (test1.status === 401) {
    log(`  ✓ PASS: Got 401 Unauthorized (expected)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got ${test1.status}, expected 401`, 'red');
    log(`    Response: ${JSON.stringify(test1.data)}`, 'red');
    failed++;
  }

  // Test 2: Invalid token → 401
  log('\nTEST 2: Invalid token to /api/admin/clients', 'yellow');
  const test2 = await testEndpoint('GET', '/api/admin/clients', {
    headers: { 'Authorization': 'Bearer invalid-token-xyz' },
  });
  if (test2.status === 401) {
    log(`  ✓ PASS: Got 401 Unauthorized (expected)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got ${test2.status}, expected 401`, 'red');
    log(`    Response: ${JSON.stringify(test2.data)}`, 'red');
    failed++;
  }

  // Test 3: Malformed Authorization header → 401
  log('\nTEST 3: Malformed Authorization header to /api/admin/clients', 'yellow');
  const test3 = await testEndpoint('GET', '/api/admin/clients', {
    headers: { 'Authorization': 'NotBearer token' },
  });
  if (test3.status === 401) {
    log(`  ✓ PASS: Got 401 Unauthorized (expected)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got ${test3.status}, expected 401`, 'red');
    log(`    Response: ${JSON.stringify(test3.data)}`, 'red');
    failed++;
  }

  // Test 4: Public endpoint (intake) without token → should work
  log('\nTEST 4: Public endpoint /api/intake/lead (no auth required)', 'yellow');
  const test4 = await testEndpoint('POST', '/api/intake/lead', {
    headers: { 'x-intake-secret': INTAKE_SECRET },
    body: {
      name: 'Auth Test Lead',
      businessType: 'testing',
      email: `auth-test-${Date.now()}@example.com`,
    },
  });
  if (test4.status === 201 || test4.status === 200) {
    log(`  ✓ PASS: Public endpoint works without JWT (status ${test4.status})`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got ${test4.status}, expected 201 or 200`, 'red');
    log(`    Response: ${JSON.stringify(test4.data)}`, 'red');
    failed++;
  }

  // Test 5: POST request without token → 401
  log('\nTEST 5: Anonymous POST to /api/admin/clients', 'yellow');
  const test5 = await testEndpoint('POST', '/api/admin/clients', {
    body: {
      name: 'Test Client',
      domain: 'test.example',
      businessType: 'testing',
    },
  });
  if (test5.status === 401) {
    log(`  ✓ PASS: Got 401 Unauthorized (expected)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got ${test5.status}, expected 401`, 'red');
    log(`    Response: ${JSON.stringify(test5.data)}`, 'red');
    failed++;
  }

  // Test 6: PATCH request without token → 401
  log('\nTEST 6: Anonymous PATCH to /api/admin/clients', 'yellow');
  const test6 = await testEndpoint('PATCH', '/api/admin/clients', {
    body: {
      id: '00000000-0000-0000-0000-000000000000',
      updates: { status: 'paused' },
    },
  });
  if (test6.status === 401) {
    log(`  ✓ PASS: Got 401 Unauthorized (expected)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got ${test6.status}, expected 401`, 'red');
    log(`    Response: ${JSON.stringify(test6.data)}`, 'red');
    failed++;
  }

  // Test 7: DELETE request without token → 401
  log('\nTEST 7: Anonymous DELETE to /api/admin/clients', 'yellow');
  const test7 = await testEndpoint('DELETE', '/api/admin/clients', {
    body: { id: '00000000-0000-0000-0000-000000000000' },
  });
  if (test7.status === 401) {
    log(`  ✓ PASS: Got 401 Unauthorized (expected)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got ${test7.status}, expected 401`, 'red');
    log(`    Response: ${JSON.stringify(test7.data)}`, 'red');
    failed++;
  }

  // Summary
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log(`RESULTS: ${passed} passed, ${failed} failed`, passed === 7 ? 'green' : 'red');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  if (failed === 0) {
    log('✓ ALL TESTS PASSED - Auth enforcement is working correctly!', 'green');
    process.exit(0);
  } else {
    log('✗ SOME TESTS FAILED - Please check the errors above', 'red');
    process.exit(1);
  }
}

// Instructions
log('\n📋 INSTRUCTIONS:', 'cyan');
log('1. Start the dev server: npm run dev', 'cyan');
log('2. In another terminal, run this test:', 'cyan');
log(`   API_BASE_URL=http://localhost:3000 node test-auth-enforcement.js`, 'cyan');
log('\n⚠️  NOTE: These tests verify auth rejection WITHOUT valid tokens.', 'cyan');
log('   To test WITH valid tokens, you need:', 'cyan');
log('   - Valid Supabase JWT token from authenticated user', 'cyan');
log('   - User must have admin role in Supabase auth.users metadata', 'cyan');
log('\n');

runTests();
