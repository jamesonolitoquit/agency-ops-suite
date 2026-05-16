#!/usr/bin/env node
// Simple validator for E2E/staging environment variables
const required = [
  'STAGING_BASE_URL',
  'STAGING_SUPABASE_URL',
  'STAGING_SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'RESEND_API_KEY',
  'INTAKE_WEBHOOK_SECRET'
];

const missing = required.filter(k => !process.env[k]);
if (missing.length === 0) {
  console.log('OK: All required E2E env vars are set');
  process.exit(0);
}

console.error('MISSING ENV VARS:');
for (const m of missing) console.error(' -', m);
console.error('\nSet these in your environment or CI secrets before running E2E.');
process.exit(2);
