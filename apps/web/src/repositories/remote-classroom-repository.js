/**
 * Classroom/roster operations. Reads/writes that RLS can scope to auth.uid()
 * go straight through the browser Supabase client; the three privileged
 * operations (provisioning slot IDs, claiming a slot, resetting a password)
 * are proxied through service-role api/roster/*.js functions instead — see
 * api/_lib/supabase-admin.js for why those can't run in the browser.
 * Disabling a slot and reading progress summaries never touch auth.users, so
 * those stay direct RLS-scoped client calls rather than growing a fourth
 * privileged endpoint.
 */
import { supabase } from "../lib/supabase-client.js";
import { getSession } from "./remote-auth-repository.js";

const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

function randomJoinCode() {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += JOIN_CODE_ALPHABET[Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)];
  }
  return out;
}

async function callRosterApi(path, body) {
  const session = await getSession();
  const headers = { "Content-Type": "application/json" };
  if (session) headers.Authorization = `Bearer ${session.access_token}`;

  const response = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request to ${path} failed (${response.status}).`);
  }
  return payload;
}

export async function createClassroom(name) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await supabase
      .from("classrooms")
      .insert({ teacher_id: session.user.id, name, join_code: randomJoinCode() })
      .select("id, name, join_code, created_at")
      .single();
    if (!error) return data;
    // Unique-violation on join_code — try again with a fresh random code.
    if (error.code !== "23505") throw error;
  }
  throw new Error("Could not generate a unique join code. Try again.");
}

export async function listMyClassrooms() {
  const { data, error } = await supabase
    .from("classrooms")
    .select("id, name, join_code, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getRoster(classroomId) {
  const { data, error } = await supabase
    .from("roster_slots")
    .select("id, student_id_code, display_name, status, claimed_at, auth_user_id")
    .eq("classroom_id", classroomId)
    .order("student_id_code", { ascending: true });
  if (error) throw error;
  return data;
}

// Bulk classroom+roster setup for the teacher signup wizard's step 2 — orchestrates the
// existing createClassroom/provisionSlots calls above, sequentially (not Promise.all) so a
// join-code collision retry on one row can't race the next, and so a failure on one
// classroom attributes cleanly to that row instead of aborting the whole batch.
export async function createClassroomsWithRoster(rows) {
  const results = [];
  for (const row of rows) {
    try {
      const classroom = await createClassroom(row.name);
      const { slots } = await provisionSlots(classroom.id, { count: row.studentCount });
      results.push({ ok: true, classroom, slots });
    } catch (err) {
      results.push({ ok: false, name: row.name, error: err.message || "Could not create this classroom." });
    }
  }
  return results;
}

// Soft-delete only — disabling a slot never touches auth.users, so unlike
// provision/claim/reissue this doesn't need a service-role proxy: the
// roster_slots_teacher_all RLS policy already lets the owning teacher update this row
// directly. A disabled slot's join-code+student-ID sign-in is already rejected by
// api/roster/resolve-email.js's existing `status !== "claimed"` check, with no changes
// needed there. This does not revoke an already-active browser session for that student.
export async function disableStudentSlot(rosterSlotId) {
  const { error } = await supabase
    .from("roster_slots")
    .update({ status: "disabled" })
    .eq("id", rosterSlotId);
  if (error) throw error;
}

// Read-only per-student progress summary for the teacher dashboard's roster table, sourced
// from student_world_profiles (the remote mirror of each student's local save — see
// chronicle-progress-store.js's DEFAULT_PROGRESS for the `completedCases`/`currentScreen`
// shape). Keyed by auth_user_id to match getRoster()'s roster_slots rows.
export async function getClassroomProgressSummaries(classroomId) {
  const { data, error } = await supabase
    .from("student_world_profiles")
    .select("student_user_id, progress")
    .eq("classroom_id", classroomId)
    .eq("pack_id", "chronicle");
  if (error) throw error;
  const byStudent = {};
  for (const row of data) {
    const p = row.progress || {};
    byStudent[row.student_user_id] = {
      completedCount: Array.isArray(p.completedCases) ? p.completedCases.length : 0,
      currentScreen: p.currentScreen || null,
    };
  }
  return byStudent;
}

export async function provisionSlots(classroomId, { count, names } = {}) {
  return callRosterApi("/api/roster/provision", { classroomId, count, names });
}

export async function claimSlot({ joinCode, studentIdCode, password, displayName }) {
  return callRosterApi("/api/roster/claim", { joinCode, studentIdCode, password, displayName });
}

export async function resolveStudentEmail({ joinCode, studentIdCode }) {
  return callRosterApi("/api/roster/resolve-email", { joinCode, studentIdCode });
}

export async function resetStudentPassword(rosterSlotId) {
  const result = await callRosterApi("/api/roster/reissue", { rosterSlotId });
  return result.temporaryPassword;
}
