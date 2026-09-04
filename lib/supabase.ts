import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for the visitor counter.
 *
 * Required environment variables (place in `.env.local`):
 * - NEXT_PUBLIC_SUPABASE_URL      → your project URL (Settings → API)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY → your anon/public key (Settings → API)
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
