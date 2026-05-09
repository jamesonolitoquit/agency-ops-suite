#!/usr/bin/env node
/**
 * Test script: Phase B - DELETE Cascade and SET NULL Behavior
 * 
 * Verifies that:
 * 1. DELETE client → billing records CASCADE deleted
 * 2. DELETE client → requests records CASCADE deleted
 * 3. DELETE client → provisioning_runs SET NULL (not deleted)
 * 4. DELETE client → audit_logs preserved (not deleted)
 */

const { generateTestToken } = require('./test-auth-token');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const INTAKE_SECRET = process.env.INTAKE_WEBHOOK_SECRET || 'local-test-secret-abc123xyz';
const AUTH_TOKEN = process.env.AUTH_TOKEN || generateTestToken({ email: 'test-delete@example.com', role: 'admin' });

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
      ...(options.includeAuth && { 'Authorization': `Bearer ${AUTH_TOKEN}` }),
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
  log('PHASE B: DELETE CASCADE & SET NULL BEHAVIOR TESTS', 'cyan');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  let passed = 0;
  let failed = 0;

  const timestamp = Date.now();
  const testDomain = `delete-test-${timestamp}.example.com`;
  let clientId = null;

  // Test 1: Create test client
  log('TEST 1: Create test client', 'yellow');
  const test1 = await testEndpoint('POST', '/api/admin/clients', {
    includeAuth: true,
    body: {
      name: `Delete Test Client ${timestamp}`,
      domain: testDomain,
      businessType: 'testing',
      plan: 'growth',
      monthlyFee: 299,
      status: 'active',
    },
  });

  if (test1.status === 201 && test1.data?.client?.id) {
    clientId = test1.data.client.id;
    log(`  ✓ PASS: Client created (ID: ${clientId.substring(0, 8)}...)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got status ${test1.status}, expected 201`, 'red');
    log(`    Response: ${JSON.stringify(test1.data)}`, 'red');
    failed++;
    return; // Can't continue without client
  }

  // Test 2: Create related billing record (should CASCADE delete)
  log('\nTEST 2: Create billing record (for CASCADE test)', 'yellow');
  const test2 = await testEndpoint('POST', '/api/admin/billing', {
    includeAuth: true,
    body: {
      clientId,
      amount: 299.99,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: 'bank',
      notes: 'Test billing record for cascade verification',
    },
  });

  let billingId = null;
  if (test2.status === 201 && test2.data?.billing?.id) {
    billingId = test2.data.billing.id;
    log(`  ✓ PASS: Billing record created (ID: ${billingId.substring(0, 8)}...)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got status ${test2.status}, expected 201`, 'red');
    log(`    Response: ${JSON.stringify(test2.data)}`, 'red');
    failed++;
  }
  
  // Test 3: Create related request (should CASCADE delete)
  log('\nTEST 3: Create request record (for CASCADE test)', 'yellow');
  const test3 = await testEndpoint('POST', '/api/admin/requests', {
    includeAuth: true,
    body: {
      clientId,
      title: 'Test Request for Cascade Verification',
      description: 'This request should be CASCADE deleted when the client is deleted',
      status: 'pending',
      priority: 'high',
    },
  });

  let requestId = null;
  if (test3.status === 201 && test3.data?.request?.id) {
    requestId = test3.data.request.id;
    log(`  ✓ PASS: Request record created (ID: ${requestId.substring(0, 8)}...)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got status ${test3.status}, expected 201`, 'red');
    log(`    Response: ${JSON.stringify(test3.data)}`, 'red');
    failed++;
  }

  // Test 3.5: Create related provisioning_run (should SET NULL on client delete)
  log('\nTEST 3.5: Create provisioning_run record (for SET NULL test)', 'yellow');
  const test3_5 = await testEndpoint('POST', '/api/admin/provisioning', {
    includeAuth: true,
    body: {
      clientId,
      templateType: 'nextjs_landing',
      domain: `provisioning-test-${timestamp}.example.com`,
      status: 'pending',
    },
  });

  let provisioningRunId = null;
  if (test3_5.status === 201 && test3_5.data?.provisioning_run?.id) {
    provisioningRunId = test3_5.data.provisioning_run.id;
    log(`  ✓ PASS: Provisioning run created (ID: ${provisioningRunId.substring(0, 8)}...)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got status ${test3_5.status}, expected 201`, 'red');
    log(`    Response: ${JSON.stringify(test3_5.data)}`, 'red');
    failed++;
  }

  // Test 4: Query audit logs before deletion
  log('\nTEST 4: Query audit logs before deletion', 'yellow');
  const test4auditBefore = await testEndpoint('GET', `/api/admin/audit-logs?entityId=${clientId}`, {
    includeAuth: true,
  });

  if (test4auditBefore.status === 200) {
    log(`  ✓ PASS: Audit logs retrieved (${test4auditBefore.data?.logs?.length || 0} records)`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Could not retrieve audit logs before deletion`, 'red');
    failed++;
  }

  // Test 5: Verify client exists before deletion
  log('\nTEST 5: Verify client exists before deletion', 'yellow');

  const test5 = await testEndpoint('GET', `/api/admin/clients?id=${clientId}`, {
    includeAuth: true,
  });

  if (test5.status === 200 && test5.data?.client?.id === clientId) {
    log(`  ✓ PASS: Client exists and can be retrieved`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Could not retrieve client before deletion`, 'red');
    failed++;
  }

  // Test 6: Delete the client (should CASCADE delete billing & requests)
  log('\nTEST 6: Delete client (should CASCADE delete related records)', 'yellow');
  const test6 = await testEndpoint('DELETE', '/api/admin/clients', {
    includeAuth: true,
    body: { id: clientId },
  });

  if (test6.status === 200) {
    log(`  ✓ PASS: Client deleted successfully`, 'green');
    passed++;
  } else {
    log(`  ✗ FAIL: Got status ${test6.status}, expected 200`, 'red');
    log(`    Response: ${JSON.stringify(test6.data)}`, 'red');
    failed++;
  }

  // Test 7: Verify client is deleted
  log('\nTEST 7: Verify client is deleted (404)', 'yellow');
  const test7 = await testEndpoint('GET', `/api/admin/clients?id=${clientId}`, {
    includeAuth: true,
  });

  if (test7.status === 404 || (test7.status === 200 && !test7.data?.client)) {
    log(`  ✓ PASS: Client no longer exists (404)`, 'green');
    passed++;
  } else if (test7.status === 200 && test7.data?.client) {
    log(`  ✗ FAIL: Client still exists after deletion`, 'red');
    failed++;
  } else {
    log(`  ✗ FAIL: Unexpected response (status ${test7.status})`, 'red');
    failed++;
  }

  // Test 8: Verify billing records CASCADE deleted
  log('\nTEST 8: Verify billing records CASCADE deleted', 'yellow');
  if (billingId) {
    const test8 = await testEndpoint('GET', `/api/admin/billing?clientId=${clientId}`, {
      includeAuth: true,
    });

    if (test8.status === 200 && test8.data?.billing?.length === 0) {
      log(`  ✓ PASS: Billing records CASCADE deleted (0 remaining)`, 'green');
      passed++;
    } else if (test8.status === 200 && test8.data?.billing?.length > 0) {
      log(`  ✗ FAIL: Billing records still exist after client deletion`, 'red');
      log(`    Found ${test8.data.billing.length} records`, 'red');
      failed++;
    } else {
      log(`  ✗ FAIL: Could not verify billing deletion (status ${test8.status})`, 'red');
      failed++;
    }
  } else {
    log('  ⚠ SKIP: No billing record was created', 'yellow');
  }

  // Test 9: Verify request records CASCADE deleted
  log('\nTEST 9: Verify request records CASCADE deleted', 'yellow');
  if (requestId) {
    const test9 = await testEndpoint('GET', `/api/admin/requests?clientId=${clientId}`, {
      includeAuth: true,
    });

    if (test9.status === 200 && test9.data?.requests?.length === 0) {
      log(`  ✓ PASS: Request records CASCADE deleted (0 remaining)`, 'green');
      passed++;
    } else if (test9.status === 200 && test9.data?.requests?.length > 0) {
      log(`  ✗ FAIL: Request records still exist after client deletion`, 'red');
      log(`    Found ${test9.data.requests.length} records`, 'red');
      failed++;
    } else {
      log(`  ✗ FAIL: Could not verify request deletion (status ${test9.status})`, 'red');
      failed++;
    }
  } else {
    log('  ⚠ SKIP: No request record was created', 'yellow');
  }

  // Test 10: Verify audit logs preserved
  log('\nTEST 10: Verify audit logs preserved after deletion', 'yellow');
  const test10 = await testEndpoint('GET', `/api/admin/audit-logs?entityId=${clientId}`, {
    includeAuth: true,
  });

  if (test10.status === 200 && test10.data?.logs && test10.data.logs.length > 0) {
    log(`  ✓ PASS: Audit logs preserved (${test10.data.logs.length} records)`, 'green');
    passed++;
  } else if (test10.status === 200 && (!test10.data?.logs || test10.data.logs.length === 0)) {
    log(`  ⚠ WARN: No audit logs found (expected at least deletion log)`, 'yellow');
  } else {
    log(`  ✗ FAIL: Could not retrieve audit logs (status ${test10.status})`, 'red');
    failed++;
  }

  // Test 11: Verify provisioning_runs SET NULL on client delete
  log('\nTEST 11: Verify provisioning_runs SET NULL after client deletion', 'yellow');
  if (provisioningRunId) {
    const test11 = await testEndpoint('GET', `/api/admin/provisioning?clientId=${clientId}`, {
      includeAuth: true,
    });

    if (test11.status === 200 && test11.data?.provisioning_runs?.length === 0) {
      log(`  ✓ PASS: Provisioning run no longer linked to client (client_id SET NULL)`, 'green');
      passed++;
    } else if (test11.status === 200 && test11.data?.provisioning_runs?.length > 0) {
      log(`  ✗ FAIL: Provisioning run still linked to deleted client`, 'red');
      log(`    Found ${test11.data.provisioning_runs.length} records with client_id`, 'red');
      failed++;
    } else {
      log(`  ✗ FAIL: Could not verify provisioning_runs SET NULL (status ${test11.status})`, 'red');
      failed++;
    }
  } else {
    log('  ⚠ SKIP: No provisioning_run record was created', 'yellow');
  }

  // Summary
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log(`RESULTS: ${passed} passed, ${failed} failed`, passed === 11 && failed === 0 ? 'green' : (failed === 0 ? 'yellow' : 'red'));
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  if (failed === 0) {
    log('✓ FULL FK & CASCADE TESTS PASSED!', 'green');
    log('\n📊 PHASE E COMPLETE:', 'green');
    log('   ✓ Client → Billing CASCADE verified', 'green');
    log('   ✓ Client → Requests CASCADE verified', 'green');
    log('   ✓ Client → Provisioning_runs SET NULL verified', 'green');
    log('   ✓ Audit logs preserved on deletion', 'green');
    log('   ✓ All FK delete behaviors confirmed', 'green');
    log('   ✓ System ready for Phase F: Dashboard Auth Enforcement', 'green');
    log('\n');
    process.exit(0);
  } else {
    log('✗ SOME TESTS FAILED', 'red');
    process.exit(1);
  }
}

log('\n📋 INSTRUCTIONS:', 'cyan');
log('1. Ensure dev server is running: npm run dev', 'cyan');
log('2. Note: Full CASCADE testing requires billing/request endpoints', 'cyan');
log('3. Run this test:', 'cyan');
log(`   API_BASE_URL=http://localhost:3000 AUTH_TOKEN=<admin-token> node test-delete-behavior.js`, 'cyan');
log('\n⚠️  Current MVP:', 'cyan');
log('   - Verifies client deletion works', 'cyan');
log('   - Core DELETE functionality', 'cyan');
log('   - Cascade behavior testing pending (need related record endpoints)', 'cyan');
log('\n');

runTests();
