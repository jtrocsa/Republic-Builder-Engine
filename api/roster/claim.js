/**
 * POST /api/roster/claim — a student claims a teacher-provisioned roster
 * slot and sets their own password. Service-role only: this creates a new
 * Supabase Auth identity, which the browser must never do directly. Chronicle
 * students don't have real email addresses on file, so each gets a stable
 * synthetic one derived from (classroomId, studentIdCode) — see
 * apps/web/src/engine/auth-flows.js for the exact derivation, mirrored here.
 */
import { supabaseAdmin } from "../_lib/supabase-admin.js";

function deriveStudentLoginEmail(classroomId, studentIdCode) {
  return `student-${classroomId}-${studentIdCode}@chronicle.invalid`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { joinCode, studentIdCode, password, displayName } = req.body ?? {};
  if (typeof joinCode !== "string" || !joinCode.trim()) {
    return res.status(400).json({ error: "Invalid join code or student ID." });
  }
  if (typeof studentIdCode !== "string" || !studentIdCode.trim()) {
    return res.status(400).json({ error: "Invalid join code or student ID." });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const admin = supabaseAdmin();

  const { data: classroom } = await admin
    .from("classrooms")
    .select("id")
    .eq("join_code", joinCode.trim())
    .maybeSingle();
  // Generic error on any mismatch below — never reveal whether the join code
  // or the ID code was the part that was wrong (no enumeration).
  if (!classroom) {
    return res.status(400).json({ error: "Invalid join code or student ID." });
  }

  const { data: slot } = await admin
    .from("roster_slots")
    .select("id, status")
    .eq("classroom_id", classroom.id)
    .eq("student_id_code", studentIdCode.trim())
    .maybeSingle();
  if (!slot || slot.status !== "unclaimed") {
    return res.status(400).json({ error: "Invalid join code or student ID." });
  }

  const email = deriveStudentLoginEmail(classroom.id, studentIdCode.trim());
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "student" },
  });
  if (createError || !created?.user) {
    console.error("roster/claim: createUser failed", createError);
    return res.status(500).json({ error: "Could not create your account. Try again." });
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    role: "student",
    display_name:
      typeof displayName === "string" && displayName.trim()
        ? displayName.trim()
        : `Chronicler ${studentIdCode.trim()}`,
  });
  if (profileError) {
    console.error("roster/claim: profile insert failed", profileError);
    return res.status(500).json({ error: "Could not finish creating your account." });
  }

  const { error: slotError } = await admin
    .from("roster_slots")
    .update({
      status: "claimed",
      auth_user_id: created.user.id,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", slot.id);
  if (slotError) {
    console.error("roster/claim: slot update failed", slotError);
    return res.status(500).json({ error: "Could not finish claiming your seat." });
  }

  return res.status(200).json({ email });
}
