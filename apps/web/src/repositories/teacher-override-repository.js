/**
 * Facade main.js imports instead of local-teacher-override-store.js
 * directly. Delegates to the classroom-scoped remote store once a
 * classroom is active (a signed-in teacher or student); otherwise falls
 * back to today's local store unchanged — so Author Mode keeps working
 * exactly as it does now for local/offline dev work with no signed-in
 * account. authorPanel() in main.js needs no structural change: it already
 * only calls these five functions by their imported names.
 */
import * as localStore from "./local-teacher-override-store.js";
import * as remoteStore from "./remote-teacher-override-store.js";
import { getProfile, getCurrentClassroomId, getSession } from "./remote-auth-repository.js";

let activeClassroomId = null;

export async function setActiveClassroom(classroomId) {
  activeClassroomId = classroomId;
  if (classroomId) await remoteStore.loadOverridesForClassroom(classroomId);
}

// Called once after sign-in (teacher or student) resolves which classroom is
// active. A no-op — falls back to the local store — for a signed-out player.
export async function initForCurrentUser() {
  const profile = await getProfile();
  if (!profile) {
    activeClassroomId = null;
    return;
  }
  await setActiveClassroom(await getCurrentClassroomId());
}

function activeStore() {
  return activeClassroomId ? remoteStore : localStore;
}

export function getOverride(contentId, fieldName) {
  return activeStore().getOverride(contentId, fieldName);
}

export function hasOverride(contentId, fieldName) {
  return activeStore().hasOverride(contentId, fieldName);
}

export function resolveField(contentId, fieldName, officialValue) {
  return activeStore().resolveField(contentId, fieldName, officialValue);
}

export async function setOverride(contentId, fieldName, value) {
  if (activeClassroomId) {
    const session = await getSession();
    return remoteStore.setOverride(contentId, fieldName, value, session?.user?.id);
  }
  return localStore.setOverride(contentId, fieldName, value);
}

export async function clearOverride(contentId, fieldName) {
  if (activeClassroomId) return remoteStore.clearOverride(contentId, fieldName);
  return localStore.clearOverride(contentId, fieldName);
}

export async function clearAllOverrides(contentId) {
  if (activeClassroomId) return remoteStore.clearAllOverrides(contentId);
  return localStore.clearAllOverrides(contentId);
}
