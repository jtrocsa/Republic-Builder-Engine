/**
 * Browser-side Supabase client. Uses the anon key only — every table this
 * client touches is protected by Postgres Row Level Security, not by key
 * secrecy. Never import the service-role key here; that only ever lives in
 * api/_lib/supabase-admin.js on the server.
 */
import { createClient } from "@supabase/supabase-js";

// Falls back to inert placeholders when the env vars aren't set (local dev
// without a .env.local yet, or Vitest importing main.js for unrelated pure-
// function tests) — createClient() throws synchronously on a missing/empty
// URL, which would otherwise break every test that imports main.js, not just
// ones that touch accounts. Real calls just fail as network errors, already
// handled by the .catch()/.then() chains that use this client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
