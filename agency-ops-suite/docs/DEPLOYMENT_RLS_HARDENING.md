# RLS Hardening Deployment Runbook

**Date**: May 2, 2026  
**Status**: Ready for Production  
**Risk Level**: MEDIUM (requires coordination with existing admin access)  
**Rollback**: Can revert by re-applying baseline permissive policies from `supabase/schema.sql`

---

## 📋 Pre-Deployment Checklist

Before applying RLS hardening, verify:

- [ ] **Backup Supabase database** (Supabase Dashboard → Backups)
- [ ] **Identify all admin users** who need access (see step 1 below)
- [ ] **Confirm DEV_AUTH_BYPASS=false** in production `.env`
- [ ] **Test in staging first** (recommended: apply to staging Supabase instance)
- [ ] **Notify team** of temporary downtime (~2 minutes during migration)
- [ ] **Have admin emails ready** for `app_admins` population

---

## 🚀 Deployment Steps

### Step 1: Identify Admin Users

**Action**: List all Supabase Auth users who should have admin access.

**Location**: Supabase Dashboard → Authentication → Users

**Example admin emails to allow**:
```
jumpstarthost@gmail.com
[other-admin-email@company.com]
```

Keep this list ready for Step 4.

---

### Step 2: Backup Production Database

**Action**: Create a manual backup in Supabase.

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **Backups**
3. Click **Create Backup**
4. Wait for backup to complete (usually <1 minute)
5. Verify backup appears in backup list with timestamp

**Note**: Supabase creates daily automatic backups. This manual backup gives a point-in-time snapshot before RLS changes.

---

### Step 3: Apply RLS Hardening Migration

**Action**: Execute the hardening SQL in Supabase SQL Editor.

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of [supabase/rls_hardening.sql](../supabase/rls_hardening.sql)
5. Paste into the SQL Editor
6. **Review the SQL** carefully (verify all table names match your schema)
7. Click **Run**
8. Wait for completion (typically <10 seconds)
9. Verify success: You should see output similar to:
   ```
   BEGIN
   CREATE TABLE
   REVOKE
   GRANT
   CREATE OR REPLACE FUNCTION
   REVOKE
   GRANT
   DROP POLICY (x15)
   CREATE POLICY (x13)
   COMMIT
   ```

**On Error**: If you see permission errors or unknown table errors:
- Check that all tables in the migration exist in your schema
- Verify RLS is enabled on each table
- Contact support or rollback with Step 6

---

### Step 4: Populate `app_admins` Table

**Action**: Add admin email addresses to the `app_admins` table.

1. In **Supabase SQL Editor**, create a new query
2. Enter one INSERT statement per admin:
   ```sql
   insert into public.app_admins (email) values ('jumpstarthost@gmail.com');
   insert into public.app_admins (email) values ('other-admin@company.com');
   -- Add as many as needed
   ```
   
   Or use a single statement:
   ```sql
   insert into public.app_admins (email) values 
     ('jumpstarthost@gmail.com'),
     ('other-admin@company.com');
   ```

3. Click **Run**
4. Verify success: You should see `INSERT 0 N` (where N = number of admins added)

**Verify admin table is populated**:
```sql
select email, created_at from public.app_admins;
```

Expected output:
```
email                  | created_at
-----------------------+---------------------------
jumpstarthost@gmail.com | 2026-05-02 19:30:00+00
other-admin@company.com | 2026-05-02 19:30:05+00
```

---

### Step 5: Verify Admin Can Still Access Data

**Action**: Test that an admin user can query data.

1. In your Next.js app (production), sign in with one of the admin emails
2. Navigate to **Dashboard** → should see all dashboard metrics
3. Click **Clients** → should see client list
4. Click **Leads** → should see lead list
5. Try creating a new client or lead → should succeed
6. Check **Audit Logs** → should see your recent actions

**Expected**: Full access to all tables with no permission errors.

**If you see "permission denied" errors**:
- Verify the email is exactly in `app_admins` table (case-insensitive match)
- Verify the JWT token contains the correct email
- Restart the app to refresh session
- Check Supabase logs for RLS policy violations

---

### Step 6: Test Non-Admin Access is Denied

**Action**: Confirm non-admin users cannot access data.

1. Create a test Supabase Auth user with a non-allowlisted email
2. Sign in with that user in your app
3. Should see redirect to `/login?error=not_allowed` (from proxy auth)
4. If that doesn't trigger, RLS policies will enforce: any data query returns empty/permission denied

**Expected**: Non-admin users see no data, cannot mutate any records.

**If you see data as non-admin**:
- Verify `is_app_admin()` function is created correctly
- Check that all policies are using `is_app_admin()` in their `USING` clause
- Verify `app_admins` table has the correct email(s)

---

### Step 7: Monitor Application for Issues

**Action**: Watch application logs and user reports for 24 hours.

**What to monitor**:
- Terminal logs: Look for any "permission denied" errors for admins
- Supabase logs: Navigate to **Logs** → **Auth** and **API**  
- User reports: Ask team if anyone has access issues

**If issues appear**:
- Check if user email is in `app_admins` table
- Verify email matches exactly (case-insensitive)
- Restart the app to refresh session tokens
- Escalate if persistent

---

## ⏮️ Rollback Steps

If you need to rollback to permissive RLS:

1. Go to **Supabase SQL Editor**
2. Run this migration:
   ```sql
   begin;

   -- Drop admin-only policies
   drop policy if exists "admin clients access" on clients;
   drop policy if exists "admin billing access" on billing;
   drop policy if exists "admin leads access" on leads;
   drop policy if exists "admin requests access" on requests;
   drop policy if exists "admin client_requests access" on client_requests;
   drop policy if exists "admin tasks access" on tasks;
   drop policy if exists "admin assets access" on assets;
   drop policy if exists "admin domains access" on domains;
   drop policy if exists "admin maintenance access" on maintenance;
   drop policy if exists "admin content_outputs access" on content_outputs;
   drop policy if exists "admin deployment_checklists access" on deployment_checklists;
   drop policy if exists "admin provisioning_runs access" on provisioning_runs;
   drop policy if exists "admin report_runs access" on report_runs;
   drop policy if exists "admin audit_logs access" on audit_logs;

   -- Re-apply permissive policies from schema.sql
   create policy "authenticated clients access" on clients for all to authenticated
     using (true) with check (true);
   create policy "authenticated billing access" on billing for all to authenticated
     using (true) with check (true);
   -- ... (copy remaining policies from supabase/schema.sql)

   commit;
   ```
3. Verify all users regain access
4. Revert app `.env` if needed (remove RLS-related settings)

---

## ✅ Post-Deployment Verification

Run these verification checks after deployment:

### Check 1: Admin Function Exists
```sql
select proname from pg_proc where proname = 'is_app_admin';
```
Expected: One row with `is_app_admin`

### Check 2: Admin Table Is Populated
```sql
select count(*) as admin_count from public.app_admins;
```
Expected: N > 0 (number of admins)

### Check 3: Policies Are Applied
```sql
select schemaname, tablename, policyname 
from pg_policies 
where policyname like 'admin%' 
order by tablename;
```
Expected: 13 rows (one "admin" policy per table)

### Check 4: App Still Starts
```bash
# In your app directory
npm run build --workspace apps/admin-dashboard
npm run dev --workspace apps/admin-dashboard
# Verify it starts and serves /login page without errors
```

---

## 📝 Implementation Notes

**Timeline**: May 2, 2026 (current date)

**Why This Matters**:
- Baseline permissive RLS allowed ANY authenticated user to read/write all data
- Hardening restricts to allowlisted admin users via `is_app_admin()` function
- This is a critical security improvement for production

**What Changes for Users**:
- Admins: No change (still have full access)
- Non-admins: Now completely denied access to all data (previously could read everything)
- Intake webhook: Still works (uses service role, not RLS)

**Monitoring**:
- Set calendar reminder to check logs weekly for first month
- Document any issues in [SECURITY_ADVISORY_EXCEPTION.md](./SECURITY_ADVISORY_EXCEPTION.md)
- Plan for non-admin role support later if needed

---

## 📞 Support / Questions

**If migration fails**: 
1. Check Supabase Dashboard → Logs for error details
2. Verify table names match your actual schema
3. Contact Supabase support with error message

**If users lose access after migration**:
1. Verify their email is in `public.app_admins`
2. Have them clear browser cache and log out/in
3. Check server logs for RLS violations

**For rollback**:
1. Supabase Dashboard → Backups → Restore from the backup created in Step 2
2. Or run the rollback SQL from "Rollback Steps" section above
