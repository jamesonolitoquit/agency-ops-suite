#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// Test with the provided keys
const url = 'https://xfasfyuhtellmsyorygc.supabase.co'; // Project from service key JWT
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYXNmeXVodGVsbG1zeW9yeWdjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM1MDM2MiwiZXhwIjoyMDkzOTI2MzYyfQ.AvXInuCkAHFyJOFqJPcvyezKIgj60aj4dxo5b0FdnTA';

console.log('Testing Supabase Connection');
console.log('URL:', url);
console.log('Service Key JWT ref: xfasfyuhtellmsyorygc\n');

const supabase = createClient(url, serviceKey);

async function test() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.log('❌ Failed:', error.message);
      return false;
    }
    
    console.log('✅ Success! Connection works!');
    return true;
  } catch (err) {
    console.log('❌ Exception:', err.message);
    return false;
  }
}

test();
