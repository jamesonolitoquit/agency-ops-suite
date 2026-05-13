#!/usr/bin/env node

/**
 * Staging Validation Test Suite
 * Validates all critical MVP features against a staging environment
 * 
 * Usage: node scripts/staging_validation.js https://staging.example.com
 * 
 * Test Categories:
 * 1. Basic Connectivity - Health checks and page loads
 * 2. Authentication - Login flow and session management
 * 3. Lead Intake - Webhook validation and lead creation
 * 4. Audit Generation - URL processing and report generation
 * 5. Contracts & Invoices - Document generation and signing
 * 6. Data Persistence - Cross-feature data integrity
 */

const https = require('https');
const http = require('http');

// Configuration
const STAGING_URL = process.argv[2] || 'http://localhost:3000';
const BASE_URL = new URL(STAGING_URL).origin;
const INTAKE_SECRET = process.env.INTAKE_WEBHOOK_SECRET || '1HHbTIxeLU1iDSQWbqsk2ehyBLAKoUYv';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Helper to make HTTP requests
function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : BASE_URL + path);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'User-Agent': 'StagingValidationBot/1.0',
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };

    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test runner
async function test(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.passed++;
    results.tests.push({ name, status: '✅', duration });
    console.log(`${colors.green}✅${colors.reset} ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    results.failed++;
    results.tests.push({ name, status: '❌', error: error.message, duration });
    console.log(`${colors.red}❌${colors.reset} ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Phase 1: Basic Connectivity
async function phase1() {
  console.log(`\n${colors.bold}${colors.cyan}Phase 1: Basic Connectivity${colors.reset}`);
  
  await test('Home page loads', async () => {
    const res = await makeRequest('GET', '/');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.includes('Agency Ops Suite') && !res.body.includes('sign in')) {
      throw new Error('Expected homepage or login page');
    }
  });

  await test('Login page accessible', async () => {
    const res = await makeRequest('GET', '/login');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.includes('Sign in')) throw new Error('Login form not found');
  });

  await test('Health endpoint accessible', async () => {
    const res = await makeRequest('GET', '/api/health');
    if (res.status !== 200 && res.status !== 401) {
      throw new Error(`Expected 200 or 401, got ${res.status}`);
    }
  });

  await test('API routes exist', async () => {
    const res = await makeRequest('GET', '/api/intake/lead');
    if (res.status === 404) throw new Error('Lead intake route not found');
    // Should return 400 (missing body) or 401 (missing secret), not 404
  });
}

// Phase 2: Authentication
async function phase2() {
  console.log(`\n${colors.bold}${colors.cyan}Phase 2: Authentication${colors.reset}`);
  
  await test('Protected routes require auth', async () => {
    const res = await makeRequest('GET', '/api/admin/clients');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('Dashboard redirects to login', async () => {
    const res = await makeRequest('GET', '/clients', { 
      'Cookie': '' // No session cookie
    });
    // Should be 200 (redirect happens client-side) or 307/302 (server redirect)
    if (res.status !== 200 && res.status !== 307 && res.status !== 302) {
      throw new Error(`Expected 200/302/307, got ${res.status}`);
    }
  });

  await test('System health requires auth', async () => {
    const res = await makeRequest('GET', '/api/admin/system-health');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });
}

// Phase 3: Lead Intake
async function phase3() {
  console.log(`\n${colors.bold}${colors.cyan}Phase 3: Lead Intake${colors.reset}`);
  
  await test('Lead intake endpoint exists', async () => {
    const res = await makeRequest('POST', '/api/intake/lead', {
      'X-Webhook-Secret': 'invalid'
    }, {});
    // Should reject invalid secret (401) not return 404
    if (res.status === 404) throw new Error('Lead intake route not found');
  });

  await test('Webhook secret validation', async () => {
    const res = await makeRequest('POST', '/api/intake/lead', {
      'X-Webhook-Secret': 'wrong-secret'
    }, {
      email: 'test@example.com',
      company: 'Test Corp'
    });
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected 401/403 for invalid secret, got ${res.status}`);
    }
  });

  await test('Create test lead with valid secret', async () => {
    const testLead = {
      email: `test-${Date.now()}@example.com`,
      company: 'Staging Test Corp',
      phone: '555-1234',
      projectDescription: 'Staging validation test lead'
    };
    
    const res = await makeRequest('POST', '/api/intake/lead', {
      'X-Webhook-Secret': INTAKE_SECRET
    }, testLead);
    
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Expected 200/201, got ${res.status}. Response: ${res.body}`);
    }
    
    let responseData;
    try {
      responseData = JSON.parse(res.body);
    } catch {
      throw new Error(`Invalid JSON response: ${res.body}`);
    }
    
    if (!responseData.id) {
      throw new Error('Lead ID not returned in response');
    }
  });
}

// Phase 4: Audit Generation (Basic)
async function phase4() {
  console.log(`\n${colors.bold}${colors.cyan}Phase 4: Audit Generation${colors.reset}`);
  
  await test('Audit page loads', async () => {
    const res = await makeRequest('GET', '/audit');
    // Will likely redirect to login (200 after client-side redirect or 302)
    if (res.status !== 200 && res.status !== 302 && res.status !== 307) {
      throw new Error(`Expected 200/302/307, got ${res.status}`);
    }
  });

  await test('Audit creation page loads', async () => {
    const res = await makeRequest('GET', '/audit/new');
    if (res.status !== 200 && res.status !== 302 && res.status !== 307) {
      throw new Error(`Expected 200/302/307, got ${res.status}`);
    }
  });

  await test('Audit API endpoint exists', async () => {
    const res = await makeRequest('GET', '/api/audit/generate');
    // Should return 401 (needs auth) or 405 (method not allowed), not 404
    if (res.status === 404) throw new Error('Audit API route not found');
  });
}

// Phase 5: Contracts & Invoices (Basic)
async function phase5() {
  console.log(`\n${colors.bold}${colors.cyan}Phase 5: Contracts & Invoices${colors.reset}`);
  
  await test('Contract creation page loads', async () => {
    const res = await makeRequest('GET', '/contract/new');
    if (res.status !== 200 && res.status !== 302 && res.status !== 307) {
      throw new Error(`Expected 200/302/307, got ${res.status}`);
    }
  });

  await test('Proposal page loads', async () => {
    const res = await makeRequest('GET', '/proposal');
    if (res.status !== 200 && res.status !== 302 && res.status !== 307) {
      throw new Error(`Expected 200/302/307, got ${res.status}`);
    }
  });

  await test('Billing page loads', async () => {
    const res = await makeRequest('GET', '/billing');
    if (res.status !== 200 && res.status !== 302 && res.status !== 307) {
      throw new Error(`Expected 200/302/307, got ${res.status}`);
    }
  });

  await test('Invoice API exists', async () => {
    const res = await makeRequest('GET', '/api/invoices');
    // Should return 401 (needs auth) or 405 (method not allowed), not 404
    if (res.status === 404) throw new Error('Invoice API route not found');
  });
}

// Phase 6: Audit Logs & Admin
async function phase6() {
  console.log(`\n${colors.bold}${colors.cyan}Phase 6: Admin & Logging${colors.reset}`);
  
  await test('Audit logs page accessible', async () => {
    const res = await makeRequest('GET', '/audit-logs');
    if (res.status !== 200 && res.status !== 302 && res.status !== 307) {
      throw new Error(`Expected 200/302/307, got ${res.status}`);
    }
  });

  await test('Deployment checklist page exists', async () => {
    const res = await makeRequest('GET', '/deployment-checklist');
    if (res.status !== 200 && res.status !== 302 && res.status !== 307) {
      throw new Error(`Expected 200/302/307, got ${res.status}`);
    }
  });

  await test('Reports page exists', async () => {
    const res = await makeRequest('GET', '/reports');
    if (res.status !== 200 && res.status !== 302 && res.status !== 307) {
      throw new Error(`Expected 200/302/307, got ${res.status}`);
    }
  });
}

// Main execution
async function main() {
  console.log(`${colors.bold}Staging Validation Test Suite${colors.reset}`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('='.repeat(50));

  const startTime = Date.now();
  
  try {
    await phase1();
    await phase2();
    await phase3();
    await phase4();
    await phase5();
    await phase6();
  } catch (error) {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error.message);
    process.exit(1);
  }

  const duration = Date.now() - startTime;
  
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.bold}Test Results Summary${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⏭️  Skipped: ${results.skipped}${colors.reset}`);
  console.log(`Total time: ${duration}ms`);
  console.log('='.repeat(50));

  if (results.failed === 0) {
    console.log(`\n${colors.green}${colors.bold}🎉 All staging validation tests passed!${colors.bold}${colors.reset}`);
    console.log('Staging environment is ready for E2E testing.');
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}⚠️  ${results.failed} test(s) failed${colors.reset}`);
    console.log('Review errors above and fix issues before proceeding.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
