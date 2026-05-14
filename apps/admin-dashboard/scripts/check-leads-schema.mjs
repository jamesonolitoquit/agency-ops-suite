#!/usr/bin/env node
/**
 * Check leads table schema in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkSchema() {
  console.log('🔍 Checking leads table schema...\n');
  
  try {
    // Try to insert a test record to see which columns cause errors
    const testData = {
      name: 'Schema Test',
      business_type: 'Test',
      email: 'test@test.com',
      phone: '555-1234',
      source: 'google',
      status: 'new',
      notes: 'Schema test record'
    };
    
    const { data, error } = await supabase
      .from('leads')
      .insert([testData])
      .select()
      .single();
    
    if (error) {
      console.log('❌ Insert failed (expected):');
      console.log(`   Error: ${error.message}`);
      console.log('\n   This likely means the columns are missing from the table.\n');
      
      // Try without email and phone
      console.log('🔄 Attempting insert without email/phone columns...\n');
      const testData2 = {
        name: 'Schema Test 2',
        business_type: 'Test',
        source: 'google',
        status: 'new',
        notes: 'Schema test record 2'
      };
      
      const { data: data2, error: error2 } = await supabase
        .from('leads')
        .insert([testData2])
        .select()
        .single();
      
      if (error2) {
        console.log('❌ Also failed:');
        console.log(`   Error: ${error2.message}`);
      } else {
        console.log('✅ Success! The table exists and works without email/phone.');
        console.log('   Columns that work: name, business_type, source, status, notes\n');
        console.log('📝 Next steps: Add email and phone columns using this SQL in Supabase:\n');
        console.log(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS email text default '';`);
        console.log(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone text default '';`);
        console.log(`CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON leads(LOWER(email)) WHERE email != '';\n`);
      }
    } else {
      console.log('✅ Full insert succeeded!');
      console.log('   All columns (including email/phone) are present.\n');
      console.log('   Inserted record:', data);
    }
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

checkSchema().catch(console.error);
