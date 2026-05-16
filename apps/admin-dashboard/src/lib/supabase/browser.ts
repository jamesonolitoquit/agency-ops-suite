import { createBrowserClient } from "@supabase/ssr";
import { resolveBrowserSupabaseKey, resolveBrowserSupabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  return createBrowserClient(
    resolveBrowserSupabaseUrl(),
    resolveBrowserSupabaseKey()
  );
}