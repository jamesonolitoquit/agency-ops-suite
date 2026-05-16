import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { resolveBrowserSupabaseKey, resolveBrowserSupabaseUrl } from "@/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    resolveBrowserSupabaseUrl(),
    resolveBrowserSupabaseKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: "", ...options });
        }
      }
    }
  );
}

// Backward-compatible alias used across the codebase.
export const getClient = createClient;