/**
 * Service-role Supabase client factory — server-only, used exclusively by
 * api/roster/*.js for the three privileged operations the browser must never
 * perform directly: creating a student's auth identity on roster-slot claim,
 * resetting a student's password, and generating roster-slot IDs. Never
 * import this from apps/web/src — SUPABASE_SERVICE_ROLE_KEY bypasses RLS
 * entirely.
 */
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
