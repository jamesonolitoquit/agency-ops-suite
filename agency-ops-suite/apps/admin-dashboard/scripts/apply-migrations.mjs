#!/usr/bin/env node
/**
 * Apply Supabase migrations manually using the service role key
 * Usage: node scripts/apply-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyMigrations() {
  const migrationsDir = path.join(projectRoot, 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('✓ No migrations to apply');
    return;
  }

  console.log(`📦 Found ${migrationFiles.length} migration file(s)`);
  console.log(`🔗 Supabase Project: ${supabaseUrl.split('//')[1]?.split('.')[0]}\n`);

  for (const file of migrationFiles) {
    const migrationPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`⏳ Applying: ${file}`);

    try {
      // Split by semicolons to handle multiple statements
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error } = await supabase.rpc('exec', {
          sql: statement,
        });

        if (error && !error.message.includes('already exists')) {
          throw error;
        }
      }

      console.log(`✓ Applied: ${file}\n`);
    } catch (error) {
      // Supabase doesn't expose rpc for arbitrary SQL, so we need a different approach
      console.error(`⚠ Could not apply via RPC. You'll need to apply this manually in the Supabase dashboard.`);
      console.error(`\n📋 SQL to apply:\n\n${sql}\n`);
      console.error(`\n🔗 Dashboard: https://app.supabase.com/project/${supabaseUrl.split('//')[1]?.split('.')[0]}`);
    }
  }
}

applyMigrations();
