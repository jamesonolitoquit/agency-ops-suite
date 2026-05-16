#!/usr/bin/env node
/**
 * Direct Supabase schema update using admin API
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

// Extract project ID from URL
const projectId = supabaseUrl.split('//')[1]?.split('.')[0];

async function executeSQL(sql) {
  console.log(`Executing SQL:\n${sql.substring(0, 100)}...\n`);
  
  // For Supabase, we need to go through the SQL editor dashboard or use a different method
  // The simplest way is to use the Supabase JS client with a workaround
  try {
    // Show the SQL that needs to be executed
    console.log('📝 Copy this SQL into Supabase SQL Editor:\n');
    console.log(sql);
    console.log('\n🔗 Dashboard: ' + supabaseUrl.replace('xfasfyuh', 'https://app.supabase.com/project/xfasfyuh'));
    return true;
  } catch (err) {
    console.error('Error:', err.message);
    return false;
  }
}

async function main() {
  const sqlMigrations = `
-- Add email and phone columns to leads table if they don't exist
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email text default '';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone text default '';

-- Create index on email for case-insensitive duplicate checking
CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON leads(LOWER(email)) WHERE email != '';

-- Verify columns were added
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leads' ORDER BY column_name;
  `.trim();
  
  await executeSQL(sqlMigrations);
}

main().catch(console.error);
