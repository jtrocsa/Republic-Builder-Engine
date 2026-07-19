/**
 * Thin wrapper around Supabase Auth plus the two lookups the rest of the app
 * needs immediately after sign-in: the caller's role/display name (profiles
 * row) and which classroom they're currently scoped to. A teacher may own
 * more than one classroom, so their "current" one is just whichever they
 * last selected in the dashboard — persisted locally, not a server concept.
 */
import { supabase } from "../lib/supabase-client.js";

const SELECTED_CLASSROOM_KEY = "republic-builder.chronicle.selected-classroom.v1";

let cachedProfile = null;
let cachedProfileUserId = null;

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      cachedProfile = null;
      cachedProfileUserId = null;
    }
    callback(event, session);
  });
  return data.subscription;
}

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

// Self-serve teacher account creation — the one open-signup path in this
// system (student accounts are always teacher-provisioned, see
// remote-classroom-repository.js's claimSlot). Uses the anon-key browser
// client only; no privileged operation is involved.
export async function signUpTeacher(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error("Sign-up did not return a user.");

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    role: "teacher",
    display_name: displayName?.trim() || "Teacher",
  });
  if (profileError) throw profileError;

  return data.session;
}

export async function signOut() {
  cachedProfile = null;
  cachedProfileUserId = null;
  localStorage.removeItem(SELECTED_CLASSROOM_KEY);
  await supabase.auth.signOut();
}

// Cached per signed-in user — cleared on sign-out and on a different user
// signing in, so a stale profile never leaks across accounts on a shared
// browser (a real risk on shared school Chromebooks).
export async function getProfile() {
  const session = await getSession();
  if (!session) return null;
  if (cachedProfile && cachedProfileUserId === session.user.id) return cachedProfile;

  const { data, error } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", session.user.id)
    .single();
  if (error || !data) return null;

  cachedProfile = { role: data.role, displayName: data.display_name };
  cachedProfileUserId = session.user.id;
  return cachedProfile;
}

export function getSelectedClassroomId() {
  return localStorage.getItem(SELECTED_CLASSROOM_KEY);
}

export function setSelectedClassroomId(classroomId) {
  localStorage.setItem(SELECTED_CLASSROOM_KEY, classroomId);
}

// Resolves the classroom the current session should act within: a teacher's
// locally-selected classroom, or a student's one claimed roster slot.
export async function getCurrentClassroomId() {
  const session = await getSession();
  if (!session) return null;

  const profile = await getProfile();
  if (profile?.role === "teacher") {
    return getSelectedClassroomId();
  }

  const { data, error } = await supabase
    .from("roster_slots")
    .select("classroom_id")
    .eq("auth_user_id", session.user.id)
    .eq("status", "claimed")
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.classroom_id;
}
