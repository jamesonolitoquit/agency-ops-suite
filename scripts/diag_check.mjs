#!/usr/bin/env node
import process from 'process';
import { fileURLToPath } from 'url';

const argv = process.argv.slice(2);
if (argv.length < 1) {
  console.error('Usage: node scripts/diag_check.mjs <BASE_URL> [DIAGNOSTICS_SECRET]');
  process.exit(2);
}

const BASE = argv[0].replace(/\/+$/, '');
const SECRET = argv[1] || process.env.DIAGNOSTICS_SECRET || '';

async function run() {
  try {
    const res = await fetch(`${BASE}/api/internal/diag`, {
      headers: {
        'x-diagnostics-secret': SECRET,
        'accept': 'application/json',
      },
    });

    const body = await res.text();
    let parsed = body;
    try { parsed = JSON.parse(body); } catch (e) { /* keep text */ }

    console.log('STATUS:', res.status);
    console.log('BODY:', typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2));
    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    console.error('Error contacting diagnostics endpoint:', err.message || err);
    process.exit(3);
  }
}

run();
