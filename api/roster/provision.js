/**
 * POST /api/roster/provision — a teacher pre-provisions N student roster
 * slots for their classroom. Service-role only: generating unique slot IDs
 * is a privileged write the browser must never perform directly (a student
 * guessing/creating their own slot would let them impersonate a roster
 * entry). The teacher's ownership of classroomId is verified before any
 * write happens.
 */
import { supabaseAdmin } from "../_lib/supabase-admin.js";
import { verifyAuth } from "../_lib/verify-auth.js";

function padCode(n) {
  return String(n).padStart(2, "0");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const user = await verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: "Sign in required." });
  }

  const { classroomId, count, names } = req.body ?? {};
  if (typeof classroomId !== "string" || !classroomId) {
    return res.status(400).json({ error: "classroomId is required." });
  }

  const requestedNames = Array.isArray(names) ? names.filter((n) => typeof n === "string") : null;
  const slotCount = requestedNames ? requestedNames.length : Number(count);
  if (!Number.isInteger(slotCount) || slotCount < 1 || slotCount > 200) {
    return res.status(400).json({ error: "count must be an integer between 1 and 200." });
  }

  const admin = supabaseAdmin();

  const { data: classroom, error: classroomError } = await admin
    .from("classrooms")
    .select("id, teacher_id")
    .eq("id", classroomId)
    .single();
  if (classroomError || !classroom || classroom.teacher_id !== user.id) {
    return res.status(403).json({ error: "You do not own this classroom." });
  }

  const { data: existingSlots, error: existingError } = await admin
    .from("roster_slots")
    .select("student_id_code")
    .eq("classroom_id", classroomId);
  if (existingError) {
    console.error("roster/provision: failed to read existing slots", existingError);
    return res.status(500).json({ error: "Could not read existing roster." });
  }

  const usedNumbers = existingSlots
    .map((s) => Number(s.student_id_code))
    .filter((n) => Number.isInteger(n));
  let nextNumber = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 1;

  const rows = [];
  for (let i = 0; i < slotCount; i += 1) {
    rows.push({
      classroom_id: classroomId,
      student_id_code: padCode(nextNumber),
      display_name: requestedNames ? requestedNames[i] : null,
      status: "unclaimed",
    });
    nextNumber += 1;
  }

  const { data: inserted, error: insertError } = await admin
    .from("roster_slots")
    .insert(rows)
    .select("id, student_id_code, display_name, status");
  if (insertError) {
    console.error("roster/provision: insert failed", insertError);
    return res.status(500).json({ error: "Could not create roster slots." });
  }

  return res.status(200).json({ slots: inserted });
}
