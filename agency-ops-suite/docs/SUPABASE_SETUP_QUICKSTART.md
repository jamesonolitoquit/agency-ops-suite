# ⚡ SUPABASE SETUP QUICK START

**Goal:** Get all 9 tables + safeguards running in Supabase in 10 minutes

---

## 📋 Pre-Flight Check

Before you start:

- [ ] You have a Supabase account
- [ ] You have access to project at: https://supabase.com/dashboard
- [ ] Project URL: `https://eavpknxospplscdrnenz.supabase.co`
- [ ] You have `.env.local` with Supabase credentials

---

## 🚀 STEP-BY-STEP SETUP

### STEP 1: Copy the Schema SQL

1. Go to: `docs/SUPABASE_MIGRATIONS.sql` (in this repo)
2. Copy **ALL** the SQL content

### STEP 2: Run Schema in Supabase

1. Go to: https://supabase.com/dashboard
2. Click your project
3. Go to: **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. **Paste** the entire SQL content
6. Click **"Run"** (or Cmd+Enter)

**Wait for:** Green ✓ message saying "Complete"

### STEP 3: Verify Tables Created

1. Go to: **Table Editor** (left sidebar)
2. You should see:
   - [ ] leads
   - [ ] clients
   - [ ] provisioning_runs
   - [ ] deployment_checklists
   - [ ] billing
   - [ ] client_requests
   - [ ] reports
   - [ ] backup_logs
   - [ ] api_logs

**If all 9 exist:** ✅ You're good

---

## 🧪 TEST THE SCHEMA

### Test 1: Create a Lead

```bash
# In your terminal or use Supabase client:
curl -X POST 'https://eavpknxospplscdrnenz.supabase.co/rest/v1/leads' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "email": "test@example.com",
    "phone": "555-1234",
    "business_type": "ecommerce",
    "source": "landing_page",
    "status": "new"
  }'
```

**Expected response:**
```json
{
  "id": "abc123...",
  "name": "Test Company",
  "created_at": "2026-04-28T...",
  ...
}
```

### Test 2: View in Table Editor

1. Go to **Table Editor**
2. Click **leads** table
3. You should see your test lead

---

## 🔐 Enable RLS (Optional - For Production)

**Right now:** Leave RLS disabled (easier for testing)

**Later (before real clients):** Enable RLS policies

To enable later:
1. Table Editor → select table
2. Click "Policies" button
3. Create policies for your auth model

---

## 🧩 Integrate with Your App

Once schema is created, your app can use it:

```typescript
// Already built in: src/lib/supabase.ts
import { createLead, getLeads, convertLeadToClient } from '@/lib/supabase';

// Create a lead
const lead = await createLead({
  name: "Test",
  email: "test@example.com",
  source: "landing_page"
});

// Get all leads
const leads = await getLeads();

// Convert to client
const client = await convertLeadToClient(lead.id, {
  name: "Test Client",
  domain: "test.com",
  plan: "professional",
  monthlyFee: 50000
});
```

---

## ✅ VERIFICATION CHECKLIST

After setup:

- [ ] All 9 tables exist in Supabase
- [ ] Can create a lead via API
- [ ] Can see lead in Table Editor
- [ ] Timestamps auto-populate (created_at, updated_at)
- [ ] `.env.local` has correct credentials
- [ ] App can connect to Supabase

---

## 🐛 Troubleshooting

### "Permission denied" error

**Fix:** Make sure you're using the correct API key (should have no column restrictions)

```
❌ Wrong: Row-level restricted key
✅ Right: Service role key or anon key with full access
```

### "Table doesn't exist"

**Fix:** Run the schema SQL again, check for errors

```sql
-- Check if table exists:
SELECT * FROM information_schema.tables 
WHERE table_name = 'leads';
```

### "Timestamp not updating"

**Fix:** Verify trigger exists

```sql
-- Check triggers:
SELECT * FROM pg_trigger WHERE tgname LIKE 'trigger_leads%';
```

---

## 🎯 Next Steps (After Schema is Live)

1. ✅ Schema created
2. ⏳ Wire Leads API to use real DB (Task 1.1)
3. ⏳ Wire Clients API (Task 2.1)
4. ⏳ Build Deployment Checklist (Task 3.4)
5. ⏳ Add Safeguards (Task 3.1)

See: `docs/IMPLEMENTATION_CHECKLIST.md` for full task list

---

## 📞 Need Help?

- Supabase Docs: https://supabase.com/docs
- SQL Reference: https://www.postgresql.org/docs/current/sql-commands.html
- Check logs: Supabase Dashboard → Logs

---

**READY TO START?** Apply the schema now! 🚀
