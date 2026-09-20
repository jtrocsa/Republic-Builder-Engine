/**
 * Facade main.js imports instead of local-progress-repository.js directly.
 * Re-exports the same four names unchanged (loadProgress/saveProgress stay
 * synchronous — export let progress = loadProgress() at main.js's boot must
 * never become async) and adds background remote sync on top:
 *   - saveProgress still writes to localStorage synchronously, then
 *     debounce-pushes to Supabase in the background (no-op if signed out).
 *   - hydrateRemoteProgress() is a new, separate async entry point called
 *     once after boot to pull a signed-in student's server copy and merge it
 *     in — never awaited at module init.
 * This exists because real classrooms mean shared/rotating school
 * Chromebooks: localStorage alone would strand a student's progress on
 * whichever machine they happened to play on last.
 */
import {
  loadProgress as loadLocalProgress,
  saveProgress as saveLocalProgress,
  resetProgress as resetLocalProgress,
  hasSavedProgress,
} from "./local-progress-repository.js";
import { pullRemoteProgress, pushRemoteProgress } from "./remote-progress-repository.js";
import { getSession, getCurrentClassroomId } from "./remote-auth-repository.js";

const PUSH_DEBOUNCE_MS = 2000;
let pushTimeoutId = null;

// Last-write-wins by timestamp. local.lastSavedAt is null for a brand-new or
// legacy save (predating this field) — treated as -Infinity so a real remote
// copy always wins over an empty/never-saved local one (the "new Chromebook"
// case). Equal timestamps keep local, matching "last-write-wins, local ties."
//
// **Ownership is asked first, and it is not a tiebreaker.** A timestamp can
// only say which save is newer, and on a shared machine the newest save is
// routinely somebody else's — the student who used this Chromebook last
// period. Comparing them at all is the mistake: a save that belongs to another
// student is not a candidate, however recent it is. Returns null when there is
// nothing of this student's to fall back on, which the caller reads as "start
// clean" rather than as "keep what is here".
//
// signedInUserId is optional so the pure-timestamp behaviour is what a caller
// with no session gets, unchanged.
export function resolveProgressConflict(local, remote, signedInUserId = null) {
  const localOwner = local?.ownerUserId ?? null;
  // localOwner === null is a solo save made before signing in, and absorbing it
  // is the intended behaviour — it is the only way progress made without an
  // account ever reaches one.
  if (signedInUserId && localOwner && localOwner !== signedInUserId) {
    return remote ? remote.progress : null;
  }
  if (!remote) return local;
  const localTimestamp = local?.lastSavedAt ?? -Infinity;
  const remoteTimestamp = new Date(remote.updatedAt).getTime();
  return remoteTimestamp > localTimestamp ? remote.progress : local;
}

export function loadProgress() {
  return loadLocalProgress();
}

export function saveProgress(next) {
  const saved = saveLocalProgress(next);
  clearTimeout(pushTimeoutId);
  pushTimeoutId = setTimeout(() => {
    getSession()
      .then((session) => {
        if (!session) return null;
        // **A save is only ever pushed to the row of the student it belongs to.** Signing in is
        // two independent async paths — the handler that sets the screen and saves, and
        // onAuthStateChange's hydrate — and the handler's save() runs first, holding whatever was
        // on the machine before hydration had decided anything. Without this check that write is
        // pushed to the student who has just signed in, so a returning student's cloud copy is
        // replaced by their classmate's save (measured: three completed cases replaced by an
        // empty one) before hydration can restore it locally. An unowned save is a solo one and
        // still pushes, which is how progress made before signing in reaches the account.
        if (saved.ownerUserId && saved.ownerUserId !== session.user.id) return null;
        return getCurrentClassroomId().then((classroomId) => {
          if (!classroomId) return null;
          return pushRemoteProgress(session.user.id, classroomId, saved);
        });
      })
      .catch((err) => console.error("Background progress sync failed", err));
  }, PUSH_DEBOUNCE_MS);
  return saved;
}

export function resetProgress() {
  return resetLocalProgress();
}

export { hasSavedProgress };

// Called after boot **and on every sign-in** (main.js wires it to both
// getSession() and onAuthStateChange), fire-and-forget. Returns the resolved
// progress object if hydration produced something different from what the
// caller is holding, or null if there's nothing to change (signed out, no
// classroom yet, or local was already this student's and newer/equal).
//
// This is also where the save gets stamped with its owner, because it is the
// one place that knows both the save and who is signed in. Every sign-in
// passes through here, so every save a signed-in student writes afterwards
// carries their id and the next student is not handed it.
export async function hydrateRemoteProgress(localProgress) {
  const session = await getSession();
  if (!session) return null;
  const classroomId = await getCurrentClassroomId();
  if (!classroomId) return null;

  const remote = await pullRemoteProgress(session.user.id, classroomId);
  const resolved = resolveProgressConflict(localProgress, remote, session.user.id);
  // null means the local save belongs to another student and this one has no
  // remote copy to restore — a first sign-in on a classmate's machine. Clearing
  // is the only correct answer: their save is not ours to keep playing.
  const base = resolved === null ? resetLocalProgress() : resolved;
  if (base === localProgress && localProgress.ownerUserId === session.user.id) return null;

  const owned = { ...base, ownerUserId: session.user.id };
  saveLocalProgress(owned);
  return owned;
}
