import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://eavpknxospplscdrnenz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhdnBrbnhvc3BwbHNjZHJuZW56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzI0MDM3NCwiZXhwIjoyMDkyODE2Mzc0fQ.6Dju1ifMWMvd8k5QjqPLW4HXarUrGWA1JCYioFbbRq4'
);

const r = await sb
  .from('leads')
  .insert({ name: 'Test', business_type: 'SaaS', source: 'google', status: 'new', notes: 'test' })
  .select('id')
  .single();

console.log(JSON.stringify(r, null, 2));
