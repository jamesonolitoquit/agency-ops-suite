#!/usr/bin/env node

const https = require('https');

const BASE_URL = process.env.DEPLOYMENT_URL || 'https://agency-ops-suite.vercel.app';
const CHECKS = [
  { name: 'Public health', url: '/api/health', expect: [200] },
  { name: 'Schema health', url: '/api/health/schema', expect: [200] },
  { name: 'Homepage', url: '/', expect: [200, 307, 308] },
  { name: 'Lead intake route exists', url: '/api/intake/lead', method: 'GET', expect: [401, 400, 405] },
  { name: 'Admin health route protected', url: '/api/admin/system-health', method: 'GET', expect: [401] },
];

function request(method, url) {
  return new Promise((resolve) => {
    const fullUrl = new URL(url, BASE_URL);
    const started = Date.now();
    const req = https.request(
      fullUrl,
      { method, timeout: 10000, headers: { Accept: 'application/json' } },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            elapsedMs: Date.now() - started,
            body,
          });
        });
      }
    );

    req.on('error', (error) => {
      resolve({ status: 0, elapsedMs: Date.now() - started, body: error.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, elapsedMs: Date.now() - started, body: 'timeout' });
    });

    req.end();
  });
}

async function main() {
  console.log('Production Monitor Check');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const check of CHECKS) {
    const method = check.method || 'GET';
    const result = await request(method, check.url);
    const ok = check.expect.includes(result.status);

    if (ok) {
      passed += 1;
      console.log(`PASS  ${check.name} | ${method} ${check.url} -> ${result.status} (${result.elapsedMs}ms)`);
      if (result.body) {
        const snippet = result.body.slice(0, 160).replace(/\s+/g, ' ');
        console.log(`      ${snippet}`);
      }
    } else {
      failed += 1;
      console.log(`FAIL  ${check.name} | ${method} ${check.url} -> ${result.status} (${result.elapsedMs}ms)`);
      if (result.body) {
        const snippet = result.body.slice(0, 160).replace(/\s+/g, ' ');
        console.log(`      ${snippet}`);
      }
    }
  }

  console.log('='.repeat(60));
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Monitor check failed:', error);
  process.exit(1);
});
