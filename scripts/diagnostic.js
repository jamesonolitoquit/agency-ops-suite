// Diagnostic: Verify Supabase credentials and connection

(async () => {
  console.log('🔍 Supabase Diagnostic\n');

  // Verify env vars are loaded
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('📋 Environment Variables:');
  console.log(`  SUPABASE_URL: ${url ? '✅ Set' : '❌ Missing'}`);
  console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${key ? '✅ Set' : '❌ Missing'}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey ? '✅ Set' : '❌ Missing'}`);

  // Decode JWT
  function decodeJWT(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format (expected 3 parts)');
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload;
    } catch (e) {
      return { error: e.message };
    }
  }

  if (key) {
    console.log('\n🔐 Service Role JWT:');
    const svc = decodeJWT(key);
    if (svc.error) {
      console.log(`  ❌ Decode failed: ${svc.error}`);
    } else {
      console.log(`  ✅ Ref (Project): ${svc.ref}`);
      console.log(`  Role: ${svc.role}`);
      console.log(`  Expires: ${new Date(svc.exp * 1000).toISOString()}`);
    }
  }

  if (anonKey) {
    console.log('\n🔑 Anon Key JWT:');
    const anon = decodeJWT(anonKey);
    if (anon.error) {
      console.log(`  ❌ Decode failed: ${anon.error}`);
    } else {
      console.log(`  ✅ Ref (Project): ${anon.ref}`);
      console.log(`  Role: ${anon.role}`);
      console.log(`  Expires: ${new Date(anon.exp * 1000).toISOString()}`);
    }
  }

  // Try to connect and fetch project info
  if (url && key) {
    console.log('\n🌐 Testing Supabase Connection:');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, key);

      // Try a simple query to check connection
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .limit(1);

      if (error) {
        console.log(`  ❌ Query failed: ${error.message}`);
        console.log(`     Code: ${error.code}`);
        console.log(`     Hint: ${error.hint}`);
      } else {
        console.log(`  ✅ Connection successful`);
        console.log(`  Leads table rows: ${data?.length || 0}`);
      }
    } catch (err) {
      console.log(`  ❌ Connection test failed: ${err.message}`);
    }
  }

  console.log('\n✅ Diagnostic complete.\n');
})();
