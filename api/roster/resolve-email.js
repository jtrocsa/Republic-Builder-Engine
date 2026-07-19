/**
 * POST /api/roster/resolve-email — a returning student only knows their
 * classroom join code and student ID, not the synthetic email
 * (student-<classroomId>-<code>@chronicle.invalid) their account was created
 * with. This resolves that email so the client can call signInWithPassword
 * itself; it never returns or touches a password. Read-only lookup, but
 * still service-role since anonymous clients have no RLS access to
 * classrooms/roster_slots (see supabase/migrations/0001_init.sql).
 */
import { supabaseAdmin } from "../_lib/supabase-admin.js";

function deriveStudentLoginEmail(classroomId, studentIdCode) {
  return `student-${classroomId}-${studentIdCode}@chronicle.invalid`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { joinCode, studentIdCode } = req.body ?? {};
  if (
    typeof joinCode !== "string" ||
    !joinCode.trim() ||
    typeof studentIdCode !== "string" ||
    !studentIdCode.trim()
  ) {
    return res.status(400).json({ error: "Invalid join code or student ID." });
  }

  const admin = supabaseAdmin();

  const { data: classroom } = await admin
    .from("classrooms")
    .select("id")
    .eq("join_code", joinCode.trim())
    .maybeSingle();
  if (!classroom) {
    return res.status(400).json({ error: "Invalid join code or student ID." });
  }

  const { data: slot } = await admin
    .from("roster_slots")
    .select("status")
    .eq("classroom_id", classroom.id)
    .eq("student_id_code", studentIdCode.trim())
    .maybeSingle();
  if (!slot || slot.status !== "claimed") {
    return res.status(400).json({ error: "Invalid join code or student ID." });
  }

  return res
    .status(200)
    .json({ email: deriveStudentLoginEmail(classroom.id, studentIdCode.trim()) });
}
