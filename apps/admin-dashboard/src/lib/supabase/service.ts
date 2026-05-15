import { createClient } from "@supabase/supabase-js";
import { resolveServerSupabaseKey, resolveServerSupabaseUrl } from "@/lib/supabase/env";

/**
 * Service-role Supabase client — bypasses RLS.
 * Safe to import in Route Handlers (no next/headers dependency).
 * Use only in trusted server-side contexts.
 */
export function createServiceClient() {
  const url = resolveServerSupabaseUrl();
  const key = resolveServerSupabaseKey();

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
  }

  return createClient(url, key);
}
