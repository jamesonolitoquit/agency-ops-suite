# Supabase Credentials Fix Guide

## Issue
The Supabase project ID in the URL does not match the project ID in the JWT token.

- **URL Project ID**: `xfasfyuhtelnmsyokygc`
- **JWT Project ID**: `xfasfyuhtellmsyokygc` (DIFFERENT)

This mismatch causes "Invalid API key" errors.

## Solution

### Option 1: Verify Current Credentials (Recommended)

1. Go to your Supabase dashboard: https://app.supabase.com
2. Find the correct project
3. Copy the **Project ID** from Settings → General
4. Go to Settings → API Keys
5. Copy the **anon key** and **service_role key** (with label "api key")
6. Replace all values in `.env.local`

### Option 2: Regenerate Keys (if rotated)

1. Go to Supabase dashboard
2. Settings → API Keys
3. Click "Regenerate" next to "service_role"
4. Copy the new key to `.env.local`

### Option 3: List Available Projects

If you have multiple Supabase projects:

```bash
# Using Supabase CLI (if installed)
supabase projects list
```

## Update .env.local

Once you have verified credentials:

```bash
# Update these lines in .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

## After Update

1. Restart the dev server
2. Rerun feature tests
3. Lead intake should now work

## Verify Fix

Run diagnostic again:
```bash
cd apps/admin-dashboard
node ../../scripts/diagnostic.js
```

Output should show:
- ✅ URL and JWT project IDs match
- ✅ Connection successful
- ✅ leads table accessible

---

**Need help?** Check Supabase docs: https://supabase.com/docs/reference/javascript/create-client
