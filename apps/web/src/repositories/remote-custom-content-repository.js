/**
 * Real free-text content authoring, storage layer — see
 * supabase/migrations/0008_custom_content_authoring.sql for the full design
 * rationale. Two kinds of row, both holding a validated content object in
 * `content` (never loose text fields):
 *
 *  - mode: "replacement" — a teacher-written swap for an existing official
 *    slot. Feeds into remote-content-selection-repository.js's alternatives
 *    list/resolution alongside the curated JS-file pool; its own draft vs.
 *    published lifecycle stays owned by classroom_content_selections
 *    (alt_kind: "custom" pointing at this row's id) exactly like a curated
 *    alternate today.
 *
 *  - mode: "addition" — a brand-new question/source with no official
 *    counterpart, so there's no classroom_content_selections row for it to
 *    ride on. Owns its own draft/published status directly on this table.
 *
 * related_source_id is presentational only (which source card Manage
 * Content groups a question under) — never read by grading/resolution.
 */
import { supabase } from "../lib/supabase-client.js";
import { getSession } from "./remote-auth-repository.js";

export async function listCustomContentForCase(classroomId, caseId) {
  const { data, error } = await supabase
    .from("custom_content_items")
    .select(
      "id, slot_kind, mode, replaces_official_id, related_source_id, content, status, created_at, updated_at"
    )
    .eq("classroom_id", classroomId)
    .eq("case_id", caseId);
  if (error) throw error;
  return data;
}

export async function createCustomContent({
  classroomId,
  caseId,
  slotKind,
  mode,
  replacesOfficialId = null,
  relatedSourceId = null,
  content,
}) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");

  const { data, error } = await supabase
    .from("custom_content_items")
    .insert({
      classroom_id: classroomId,
      case_id: caseId,
      slot_kind: slotKind,
      mode,
      replaces_official_id: replacesOfficialId,
      related_source_id: relatedSourceId,
      content,
      created_by: session.user.id,
    })
    .select(
      "id, slot_kind, mode, replaces_official_id, related_source_id, content, status, created_at, updated_at"
    )
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomContent(id, { content, relatedSourceId, status } = {}) {
  const patch = { updated_at: new Date().toISOString() };
  if (content !== undefined) patch.content = content;
  if (relatedSourceId !== undefined) patch.related_source_id = relatedSourceId;
  if (status !== undefined) patch.status = status;

  const { data, error } = await supabase
    .from("custom_content_items")
    .update(patch)
    .eq("id", id)
    .select(
      "id, slot_kind, mode, replaces_official_id, related_source_id, content, status, created_at, updated_at"
    )
    .single();
  if (error) throw error;
  return data;
}

// Intended for mode: "addition" rows only (a teacher-added question with no
// official counterpart) — a "replacement" row should be reverted to
// official via setDraftSelection(..., null) instead of deleted, matching
// how a curated alternate is never itself deletable, only unselected. The
// UI enforces this by not offering delete on replacement-mode cards.
export async function deleteCustomContent(id) {
  const { error } = await supabase.from("custom_content_items").delete().eq("id", id);
  if (error) throw error;
}
