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
// client only; no privileged operation is involved. The `profiles` row is
// created by a database trigger (see migrations 0003/0005) from the metadata
// passed here, not by a client-side insert — a client insert would have no
// auth.uid() to satisfy RLS with whenever email confirmation is pending.
// Returns `{ session, needsEmailConfirmation }`: session is null and
// needsEmailConfirmation is true when the project requires confirming the
// address before it's usable.
export async function signUpTeacher(email, password, displayName, schoolName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "teacher",
        display_name: displayName?.trim() || "Teacher",
        school_name: schoolName?.trim() || null,
      },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("Sign-up did not return a user.");

  return { session: data.session, needsEmailConfirmation: !data.session };
}

// Google OAuth entry point for teachers only (see main.js's loginScreen()/"Continue with
// Google" — students always join via a teacher-provisioned roster slot, never this path).
// No Google provider is configured in any Supabase project yet, so this is expected to
// reject with a Supabase-thrown error until that's set up in the Supabase dashboard — the
// caller (handleAuthScreenClick's "continue-with-google" branch) surfaces that as a normal
// authUiState.error rather than an unhandled rejection.
export async function signInWithOAuthGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
  });
  if (error) throw error;
  return data;
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
