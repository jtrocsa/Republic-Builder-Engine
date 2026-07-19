/**
 * Classroom/roster operations. Reads/writes that RLS can scope to auth.uid()
 * go straight through the browser Supabase client; the three privileged
 * operations (provisioning slot IDs, claiming a slot, resetting a password)
 * are proxied through service-role api/roster/*.js functions instead — see
 * api/_lib/supabase-admin.js for why those can't run in the browser.
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
    .select("id, student_id_code, display_name, status, claimed_at")
    .eq("classroom_id", classroomId)
    .order("student_id_code", { ascending: true });
  if (error) throw error;
  return data;
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
