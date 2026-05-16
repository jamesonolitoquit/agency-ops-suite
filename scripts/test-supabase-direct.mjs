#!/usr/bin/env node
/**
 * Test Supabase connection directly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xfasfyuhtelnmsyokygc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYXNmeXVodGVsbG1zeW9yeWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDM2MiwiZXhwIjoyMDkzOTI2MzYyfQ.AvXInuCkAHFyJOFqJPcvyezKIgj60aj4dxo5b0FdnTA';

console.log('🔍 Testing Supabase Connection\n');
console.log(`URL: ${supabaseUrl}`);
console.log(`Service Key Length: ${serviceRoleKey.length}\n`);

// Decode JWT payload
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch {
    return null;
  }
}

const payload = decodeJWT(serviceRoleKey);
if (payload) {
  console.log('JWT Payload:');
  console.log(`  Issuer: ${payload.iss}`);
  console.log(`  Project: ${payload.ref}`);
  console.log(`  Role: ${payload.role}`);
  console.log(`  Issued: ${new Date(payload.iat * 1000).toISOString()}`);
  console.log(`  Expires: ${new Date(payload.exp * 1000).toISOString()}\n`);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testConnection() {
  try {
    console.log('⏳ Testing connection by querying leads table...\n');
    
    const { data, error, status } = await supabase
      .from('leads')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.log(`❌ Error (${status}): ${error.message}`);
      console.log(`   Code: ${error.code}`);
      if (error.hint) console.log(`   Hint: ${error.hint}`);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log(`   Leads table exists and is accessible`);
    if (data) console.log(`   Response:`, data);
    return true;
  } catch (err) {
    console.log(`💥 Exception: ${err.message}`);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n📊 Next: Testing lead creation...\n');
    return testLeadCreation();
  }
  process.exit(1);
});

async function testLeadCreation() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        name: 'Connection Test Lead',
        business_type: 'Test',
        source: 'google',
        status: 'new',
        notes: 'Auto-generated test record'
      }])
      .select()
      .single();
    
    if (error) {
      console.log(`❌ Lead creation failed: ${error.message}`);
      return false;
    }
    
    console.log('✅ Lead created successfully!');
    console.log(`   Lead ID: ${data.id}`);
    return true;
  } catch (err) {
    console.log(`💥 Exception: ${err.message}`);
    return false;
  }
}
