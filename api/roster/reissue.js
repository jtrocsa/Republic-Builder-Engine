/**
 * POST /api/roster/reissue — a teacher resets a student's password. Returns
 * a freshly generated temporary password exactly once; it is never stored,
 * and the teacher never sees the student's actual current password, only
 * ever a new one they can hand off. Service-role only.
 */
import { supabaseAdmin } from "../_lib/supabase-admin.js";
import { verifyAuth } from "../_lib/verify-auth.js";

function generateTempPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const user = await verifyAuth(req);
  if (!user) {
    return res.status(401).json({ error: "Sign in required." });
  }

  const { rosterSlotId } = req.body ?? {};
  if (typeof rosterSlotId !== "string" || !rosterSlotId) {
    return res.status(400).json({ error: "rosterSlotId is required." });
  }

  const admin = supabaseAdmin();

  const { data: slot, error: slotError } = await admin
    .from("roster_slots")
    .select("id, classroom_id, auth_user_id, status, classrooms!inner(teacher_id)")
    .eq("id", rosterSlotId)
    .single();
  if (slotError || !slot || slot.classrooms.teacher_id !== user.id) {
    return res.status(403).json({ error: "You do not own this roster slot." });
  }
  if (slot.status !== "claimed" || !slot.auth_user_id) {
    return res.status(400).json({ error: "This seat has not been claimed yet." });
  }

  const tempPassword = generateTempPassword();
  const { error: updateError } = await admin.auth.admin.updateUserById(slot.auth_user_id, {
    password: tempPassword,
  });
  if (updateError) {
    console.error("roster/reissue: password update failed", updateError);
    return res.status(500).json({ error: "Could not reset this student's password." });
  }

  return res.status(200).json({ temporaryPassword: tempPassword });
}
