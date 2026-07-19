/**
 * Confirms a caller's identity before a privileged (service-role) action
 * proceeds. Uses the anon key deliberately, not the service-role key — this
 * only asks Supabase "who does this JWT belong to," it never bypasses RLS.
 * Callers (api/roster/provision.js, api/roster/reissue.js) still separately
 * verify the resolved user actually owns the classroom/resource in question.
 */
import { createClient } from "@supabase/supabase-js";

export async function verifyAuth(req) {
  const header = req.headers.authorization ?? req.headers.Authorization;
  const token = typeof header === "string" ? header.replace(/^Bearer\s+/i, "").trim() : "";
  if (!token) return null;

  const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
