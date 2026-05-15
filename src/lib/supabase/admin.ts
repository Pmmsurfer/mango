import { createClient } from "@supabase/supabase-js";

/**
 * Admin client — server-only. Uses the service role key, bypasses RLS.
 * Use sparingly: only for trusted operations like seeding sample data
 * after first signup. NEVER import from a Client Component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase admin credentials");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
