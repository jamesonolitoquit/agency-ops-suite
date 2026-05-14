#!/usr/bin/env node
import fs from 'fs';
import { config as loadEnv } from 'dotenv';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import path from 'path';

// Load local env files if present (same behavior as setup script)
for (const envFile of ['.env.local', '.env.preview.local', '.env.production.local']) {
  if (fs.existsSync(envFile)) {
    loadEnv({ path: envFile });
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in the environment and retry.');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadSeed() {
  const seedPath = path.join(process.cwd(), 'src', 'lib', 'seed-data.ts');
  try {
    const content = await readFile(seedPath, 'utf8');
    // extract the seedData object literal by simple eval inside a module wrapper
    // This is a pragmatic approach for the local developer script — the file is trusted in this repo.
    const marker = 'export const seedData';
    const idx = content.indexOf(marker);
    if (idx === -1) throw new Error('seed-data.ts not found or unexpected format');
    const objText = content.slice(idx + marker.length);
    // Find the first '{' that starts the object literal and locate the matching closing brace.
    const firstBrace = objText.indexOf('{');
    if (firstBrace === -1) throw new Error('Could not find start of seedData object');
    let depth = 0;
    let endIndex = -1;
    for (let i = firstBrace; i < objText.length; i++) {
      const ch = objText[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) { endIndex = i; break; }
      }
    }
    if (endIndex === -1) throw new Error('Could not find end of seedData object');
    const objectLiteral = objText.slice(firstBrace, endIndex + 1);
    // Evaluate the object literal in a Function to get a runtime object
    const seed = Function(`return (${objectLiteral});`)();
    return seed;
  } catch (err) {
    console.error('Failed to load seed-data.ts:', err);
    process.exit(1);
  }
}

async function upsert(table, rows) {
  if (!Array.isArray(rows) || rows.length === 0) return;
  console.log(`Upserting ${rows.length} rows into ${table}...`);
  const { error } = await sb.from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    console.error(`Failed to upsert ${table}:`, error.message);
  } else {
    console.log(`OK: ${table}`);
  }
}

function camelToSnake(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/-/g, '_').toLowerCase();
}

function uuidFromLegacyId(legacyId) {
  const hash = createHash('sha256').update(legacyId).digest('hex');
  const timeLow = hash.slice(0, 8);
  const timeMid = hash.slice(8, 12);
  const timeHi = `4${hash.slice(13, 16)}`;
  const clockSeq = ((parseInt(hash.slice(16, 20), 16) & 0x3fff) | 0x8000).toString(16).padStart(4, '0');
  const node = hash.slice(18, 30);
  return `${timeLow}-${timeMid}-${timeHi}-${clockSeq}-${node}`;
}

function buildLegacyIdMap(seed) {
  const legacyIds = new Set();
  for (const value of Object.values(seed)) {
    if (!Array.isArray(value)) continue;
    for (const row of value) {
      if (row && typeof row === 'object' && typeof row.id === 'string') {
        legacyIds.add(row.id);
      }
    }
  }

  return new Map(Array.from(legacyIds, (legacyId) => [legacyId, uuidFromLegacyId(legacyId)]));
}

function normalizeRow(row, legacyIdMap) {
  if (Array.isArray(row)) {
    return row.map((item) => normalizeRow(item, legacyIdMap));
  }

  if (row && typeof row === 'object' && row.constructor === Object) {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [camelToSnake(key), normalizeRow(value, legacyIdMap)])
    );
  }

  if (typeof row === 'string' && legacyIdMap.has(row)) {
    return legacyIdMap.get(row);
  }

  return row;
}

async function upsertWithFallbacks(primaryTable, fallbackTables, rows, legacyIdMap) {
  const normalizedRows = rows.map((row) => normalizeRow(row, legacyIdMap));
  for (const table of [primaryTable, ...fallbackTables]) {
    console.log(`Upserting ${normalizedRows.length} rows into ${table}...`);
    const { error } = await sb.from(table).upsert(normalizedRows, { onConflict: 'id' });
    if (!error) {
      console.log(`OK: ${table}`);
      return;
    }

    const message = error.message || 'Unknown error';
    console.error(`Failed to upsert ${table}:`, message);

    if (!/column|relation|schema cache/i.test(message)) {
      return;
    }
  }
}

async function run() {
  const seed = await loadSeed();
  const legacyIdMap = buildLegacyIdMap(seed);

  // Map seed sections to table names used in the app
  await upsertWithFallbacks('clients', [], seed.clients || [], legacyIdMap);
  await upsertWithFallbacks('leads', [], seed.leads || [], legacyIdMap);
  await upsertWithFallbacks('billing', [], seed.billing || [], legacyIdMap);
  await upsertWithFallbacks('client_requests', ['requests'], seed.requests || [], legacyIdMap);
  await upsertWithFallbacks('client_assets', ['assets'], seed.assets || [], legacyIdMap);
  await upsertWithFallbacks('domains', [], seed.domains || [], legacyIdMap);
  await upsertWithFallbacks('tasks', [], seed.tasks || [], legacyIdMap);
  await upsertWithFallbacks('maintenance', [], seed.maintenance || [], legacyIdMap);

  console.log('Seed complete.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
