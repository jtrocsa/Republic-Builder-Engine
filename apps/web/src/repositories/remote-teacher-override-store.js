/**
 * Classroom-scoped replacement for local-teacher-override-store.js's flat
 * per-browser blob — same allow-listed field shape (title/centralQuestion),
 * now persisted in Supabase and scoped to a classroom so a teacher's edits
 * apply to their own students, not just their own browser.
 *
 * resolveField() is called synchronously from inside render()-critical
 * paths (resolvedUnitTitle/resolvedUnitCentralQuestion), so this module
 * keeps an in-memory cache rather than querying Supabase per call —
 * populated once via loadOverridesForClassroom() whenever the active
 * classroom changes, refreshed optimistically on every write.
 */
import { supabase } from "../lib/supabase-client.js";

let cache = {};
let cachedClassroomId = null;

function bucket(contentId) {
  cache[contentId] ??= {};
  return cache[contentId];
}

export async function loadOverridesForClassroom(classroomId) {
  cachedClassroomId = classroomId;
  cache = {};
  if (!classroomId) return;

  const { data, error } = await supabase
    .from("content_overrides")
    .select("content_id, field_name, value")
    .eq("classroom_id", classroomId);
  if (error) {
    console.error("loadOverridesForClassroom failed", error);
    return;
  }
  for (const row of data) {
    bucket(row.content_id)[row.field_name] = row.value;
  }
}

export function getOverride(contentId, fieldName) {
  return cache[contentId]?.[fieldName];
}

export function hasOverride(contentId, fieldName) {
  return getOverride(contentId, fieldName) !== undefined;
}

export function resolveField(contentId, fieldName, officialValue) {
  const override = getOverride(contentId, fieldName);
  return override !== undefined ? override : officialValue;
}

export async function setOverride(contentId, fieldName, value, updatedByUserId) {
  if (!cachedClassroomId) return;
  bucket(contentId)[fieldName] = value; // optimistic — reflects instantly, matching today's UX
  const { error } = await supabase.from("content_overrides").upsert(
    {
      classroom_id: cachedClassroomId,
      content_id: contentId,
      field_name: fieldName,
      value,
      updated_by: updatedByUserId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "classroom_id,content_id,field_name" }
  );
  if (error) console.error("setOverride failed", error);
}

export async function clearOverride(contentId, fieldName) {
  if (!cachedClassroomId) return;
  if (cache[contentId]) delete cache[contentId][fieldName];
  const { error } = await supabase
    .from("content_overrides")
    .delete()
    .eq("classroom_id", cachedClassroomId)
    .eq("content_id", contentId)
    .eq("field_name", fieldName);
  if (error) console.error("clearOverride failed", error);
}

export async function clearAllOverrides(contentId) {
  if (!cachedClassroomId) return;
  delete cache[contentId];
  const { error } = await supabase
    .from("content_overrides")
    .delete()
    .eq("classroom_id", cachedClassroomId)
    .eq("content_id", contentId);
  if (error) console.error("clearAllOverrides failed", error);
}
