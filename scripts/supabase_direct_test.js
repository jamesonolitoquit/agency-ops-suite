// Direct Supabase test to diagnose lead insert failure

(async () => {
  const { createClient } = await import('@supabase/supabase-js');

  const SUPABASE_URL = 'https://xfasfyuhtelnmsyokygc.supabase.co';
  const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYXNmeXVodGVsbG1zeW9reWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDM2MiwiZXhwIjoyMDkzOTI2MzYyfQ.AvXInuCkAHFyJOFqJPcvyezKIgj60aj4dxo5b0FdnTA';

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  console.log('Testing direct Supabase insert...\n');

  // Test 1: Check if leads table exists
  try {
    console.log('1️⃣  Fetching leads table schema...');
    const { data: schema, error: schemaErr } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    if (schemaErr) {
      console.log(`   ❌ Schema fetch failed:`, schemaErr.message);
    } else {
      console.log(`   ✅ Leads table exists (${schema.length} rows currently)`);
    }
  } catch (err) {
    console.log(`   ❌ Exception:`, err.message);
  }

  // Test 2: Insert a test lead
  try {
    console.log('\n2️⃣  Inserting test lead...');
    const testLead = {
      name: 'Direct Test Lead',
      business_type: 'Testing',
      email: `direct-test-${Date.now()}@test.dev`,
      phone: '555-0100',
      notes: 'Test from direct script',
      source: 'google',
      status: 'new',
    };
    
    console.log('   Payload:', JSON.stringify(testLead, null, 2));
    
    const { data: inserted, error: insertErr } = await supabase
      .from('leads')
      .insert([testLead])
      .select()
      .single();

    if (insertErr) {
      console.log(`   ❌ Insert failed:`, insertErr.message);
      console.log(`      Code:`, insertErr.code);
      console.log(`      Details:`, insertErr.details);
    } else {
      console.log(`   ✅ Insert succeeded`);
      console.log(`      ID:`, inserted.id);
      console.log(`      Email:`, inserted.email);
    }
  } catch (err) {
    console.log(`   ❌ Exception:`, err.message);
  }

  // Test 3: Check system_events table
  try {
    console.log('\n3️⃣  Checking system_events table...');
    const { data: events, error: eventsErr } = await supabase
      .from('system_events')
      .select('*')
      .limit(1);
    if (eventsErr) {
      console.log(`   ❌ Failed:`, eventsErr.message);
    } else {
      console.log(`   ✅ system_events table exists (${events.length} rows currently)`);
    }
  } catch (err) {
    console.log(`   ❌ Exception:`, err.message);
  }

  // Test 4: Check audit_logs table
  try {
    console.log('\n4️⃣  Checking audit_logs table...');
    const { data: logs, error: logsErr } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);
    if (logsErr) {
      console.log(`   ❌ Failed:`, logsErr.message);
    } else {
      console.log(`   ✅ audit_logs table exists (${logs.length} rows currently)`);
    }
  } catch (err) {
    console.log(`   ❌ Exception:`, err.message);
  }

  console.log('\n✅ Direct Supabase test complete.\n');
})();
