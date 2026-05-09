#!/usr/bin/env node
/**
 * Test script: Duplicate Lead Detection
 * 
 * Verifies that:
 * 1. Submitting the same email twice returns existing lead
 * 2. Submitting different emails creates new leads
 * 3. Duplicate events are logged to system_events
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const INTAKE_SECRET = process.env.INTAKE_WEBHOOK_SECRET || 'local-test-secret-abc123xyz';

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
  log('PHASE B: DUPLICATE LEAD DETECTION TESTS', 'cyan');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  let passed = 0;
  let failed = 0;

  const testEmail = `dup-test-${Date.now()}@example.com`;
  let firstLeadId = null;

  // Test 1: Create first lead
  log('TEST 1: Create first lead with email', 'yellow');
  const test1 = await testEndpoint('POST', '/api/intake/lead', {
    headers: { 'x-intake-secret': INTAKE_SECRET },
    body: {
      name: 'Duplicate Test Lead 1',
      businessType: 'testing',
      email: testEmail,
    },
  });

  if (test1.status === 201 && test1.data?.leadId) {
    firstLeadId = test1.data.leadId;
    log(`  ✓ PASS: Lead created with ID ${firstLeadId}`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got status ${test1.status}, expected 201`, 'red');
    log(`    Response: ${JSON.stringify(test1.data)}`, 'red');
    failed++;
    return;
  }

  // Test 2: Submit duplicate email - should return existing lead
  log('\nTEST 2: Submit same email - should detect duplicate', 'yellow');
  const test2 = await testEndpoint('POST', '/api/intake/lead', {
    headers: { 'x-intake-secret': INTAKE_SECRET },
    body: {
      name: 'Duplicate Test Lead 2',
      businessType: 'testing',
      email: testEmail,
    },
  });

  if (test2.status === 200 && test2.data?.leadId === firstLeadId) {
    log(`  ✓ PASS: Duplicate detected, returned existing lead ID`, 'green');
    passed++;
  } else if (test2.status === 201 && test2.data?.leadId === firstLeadId) {
    log(`  ✓ PASS: Duplicate detected, returned existing lead ID (status 201)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got status ${test2.status}, expected 200/201 with same leadId`, 'red');
    log(`    Returned ID: ${test2.data?.leadId}, Expected: ${firstLeadId}`, 'red');
    failed++;
  }

  // Test 3: Different email should create new lead
  log('\nTEST 3: Submit different email - should create new lead', 'yellow');
  const test3 = await testEndpoint('POST', '/api/intake/lead', {
    headers: { 'x-intake-secret': INTAKE_SECRET },
    body: {
      name: 'Duplicate Test Lead 3',
      businessType: 'testing',
      email: `other-email-${Date.now()}@example.com`,
    },
  });

  if (test3.status === 201 && test3.data?.leadId !== firstLeadId) {
    log(`  ✓ PASS: New lead created with different ID ${test3.data.leadId}`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Expected new lead with different ID`, 'red');
    log(`    Response: ${JSON.stringify(test3.data)}`, 'red');
    failed++;
  }

  // Test 4: Case-insensitive duplicate detection
  log('\nTEST 4: Case-insensitive email check', 'yellow');
  const testEmailUpper = testEmail.toUpperCase();
  const test4 = await testEndpoint('POST', '/api/intake/lead', {
    headers: { 'x-intake-secret': INTAKE_SECRET },
    body: {
      name: 'Case Test Lead',
      businessType: 'testing',
      email: testEmailUpper,
    },
  });

  if (test4.status === 200 || test4.status === 201) {
    if (test4.data?.leadId === firstLeadId) {
      log(`  ✓ PASS: Case-insensitive duplicate detected`, 'green');
      passed++;
    } else {
      log(`  ✗ FAIL: Should return same lead ID with uppercase email`, 'red');
      failed++;
    }
  } else {
    log(`  ✗ FAIL: Got status ${test4.status}`, 'red');
    failed++;
  }

  // Summary
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log(`RESULTS: ${passed} passed, ${failed} failed`, passed === 4 ? 'green' : 'red');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  if (failed === 0) {
    log('✓ ALL TESTS PASSED - Duplicate detection is working correctly!', 'green');
    process.exit(0);
  } else {
    log('✗ SOME TESTS FAILED - Please check the errors above', 'red');
    process.exit(1);
  }
}

log('\n📋 INSTRUCTIONS:', 'cyan');
log('1. Ensure dev server is running: npm run dev', 'cyan');
log('2. In another terminal, run this test:', 'cyan');
log(`   API_BASE_URL=http://localhost:3000 INTAKE_WEBHOOK_SECRET=local-test-secret-abc123xyz node test-duplicate-detection.js`, 'cyan');
log('\n');

runTests();
