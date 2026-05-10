#!/usr/bin/env node
import fs from 'fs';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

for (const envFile of ['.env.local', '.env.preview.local', '.env.production.local']) {
  if (fs.existsSync(envFile)) {
    loadEnv({ path: envFile });
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const E2E_ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'jumpstarthost@gmail.com';
const E2E_ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'admin123';
const E2E_NON_ADMIN_EMAIL = process.env.E2E_NON_ADMIN_EMAIL || 'e2e.nonadmin@example.com';
const E2E_NON_ADMIN_PASSWORD = process.env.E2E_NON_ADMIN_PASSWORD || 'admin123';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users || [];
    const matched = users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (matched) return matched;

    if (users.length < perPage) return null;
    page += 1;
  }
}

async function upsertUser(email, password, label) {
  const existing = await findUserByEmail(email);

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata || {}),
        e2e: true,
        label,
      },
    });
    if (error) throw error;
    return { id: existing.id, created: false };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      e2e: true,
      label,
    },
  });
  if (error) throw error;
  return { id: data.user?.id, created: true };
}

function checkAllowlist(email) {
  const legacy = (process.env.ADMIN_EMAIL_ALLOWLIST || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  const roleMap = (process.env.ADMIN_ROLE_ALLOWLIST || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((entry) => entry.split(':')[0]?.trim().toLowerCase())
    .filter(Boolean);

  const allowlisted = legacy.includes(email.toLowerCase()) || roleMap.includes(email.toLowerCase());
  return allowlisted;
}

async function main() {
  console.log('Setting up E2E auth users...');

  const adminResult = await upsertUser(E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, 'e2e-admin');
  const nonAdminResult = await upsertUser(E2E_NON_ADMIN_EMAIL, E2E_NON_ADMIN_PASSWORD, 'e2e-non-admin');

  console.log(`Admin user: ${E2E_ADMIN_EMAIL} (${adminResult.created ? 'created' : 'updated'})`);
  console.log(`Non-admin user: ${E2E_NON_ADMIN_EMAIL} (${nonAdminResult.created ? 'created' : 'updated'})`);

  if (!checkAllowlist(E2E_ADMIN_EMAIL)) {
    console.warn(`WARNING: ${E2E_ADMIN_EMAIL} is not in ADMIN allowlist. Admin auth tests may fail.`);
  }

  if (checkAllowlist(E2E_NON_ADMIN_EMAIL)) {
    console.warn(`WARNING: ${E2E_NON_ADMIN_EMAIL} is allowlisted. Non-admin rejection test may fail.`);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error('Failed to setup E2E auth users:', error.message || error);
  process.exit(1);
});
