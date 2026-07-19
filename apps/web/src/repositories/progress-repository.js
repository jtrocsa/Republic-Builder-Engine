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
export function resolveProgressConflict(local, remote) {
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

// Called once after boot, fire-and-forget. Returns the resolved progress
// object if hydration produced something different from what boot already
// used locally, or null if there's nothing to change (signed out, no
// classroom yet, or local was already newer/equal).
export async function hydrateRemoteProgress(localProgress) {
  const session = await getSession();
  if (!session) return null;
  const classroomId = await getCurrentClassroomId();
  if (!classroomId) return null;

  const remote = await pullRemoteProgress(session.user.id, classroomId);
  const resolved = resolveProgressConflict(localProgress, remote);
  if (resolved === localProgress) return null;

  saveLocalProgress(resolved);
  return resolved;
}
