/**
 * Teacher Mode's source/MCQ-quest swap mechanism. Two halves:
 *
 *  - A resolution cache (resolveSourceSlot/resolveMcqQuestSlot), read
 *    synchronously from render-critical main.js code exactly like
 *    remote-teacher-override-store.js's resolveField — populated via
 *    loadSelectionsForResolution(classroomId, status) whenever the active
 *    classroom or preview mode changes. status is "published" for the real
 *    student-facing game and the teacher's own default view, or "draft"
 *    while a teacher has Preview-as-student toggled on for a case. Students
 *    can never read draft rows (see 0006_teacher_mode.sql's RLS).
 *
 *  - Teacher-editing CRUD (listSelectionsForCase/setDraftSelection/
 *    publishCaseSelections), direct DB reads/writes with no cache, used only
 *    by the Manage Content editor screens.
 *
 * The curated alternate-content pools are plain content-file imports (same
 * "content lives in apps/web/src/content/" precedent as every other unit
 * content file) — as more cases get alternates, add another import + spread
 * here, mirroring how main.js's ARCHIVE_CHALLENGE_QUESTS_BY_TYPE aggregates
 * per-unit quest arrays.
 */
import { supabase } from "../lib/supabase-client.js";
import { getSession } from "./remote-auth-repository.js";
import { CASE_001_SOURCE_ALTERNATES } from "../content/case-001-source-alternates.js";
import { CASE_001_MCQ_ALTERNATES } from "../content/quests/case-001-mcq-alternates.js";

const SOURCE_ALTERNATES_BY_ALT_ID = new Map(
  CASE_001_SOURCE_ALTERNATES.map((entry) => [entry.source.id, entry.source])
);
const MCQ_ALTERNATES_BY_ALT_ID = new Map(
  CASE_001_MCQ_ALTERNATES.map((entry) => [entry.quest.id, entry.quest])
);

// contentId -> [{id, label}] curated alternates a teacher may pick for that
// official slot, used to render the Manage Content dropdowns.
const SOURCE_ALTERNATIVES_BY_SLOT = groupAlternativesBySlot(CASE_001_SOURCE_ALTERNATES, "replacesSourceId", "source");
const MCQ_ALTERNATIVES_BY_SLOT = groupAlternativesBySlot(CASE_001_MCQ_ALTERNATES, "replacesQuestId", "quest");

function groupAlternativesBySlot(entries, replacesKey, contentKey) {
  const bySlot = {};
  for (const entry of entries) {
    const content = entry[contentKey];
    (bySlot[entry[replacesKey]] ??= []).push({ id: content.id, label: content.title || content.prompt });
  }
  return bySlot;
}

export function alternativesForSourceSlot(slotContentId) {
  return SOURCE_ALTERNATIVES_BY_SLOT[slotContentId] || [];
}

export function alternativesForMcqSlot(slotContentId) {
  return MCQ_ALTERNATIVES_BY_SLOT[slotContentId] || [];
}

// --- Resolution cache (student/live-game path + teacher preview) ---

let sourceSelections = {};
let mcqSelections = {};

export async function loadSelectionsForResolution(classroomId, status = "published") {
  sourceSelections = {};
  mcqSelections = {};
  if (!classroomId) return;

  const { data, error } = await supabase
    .from("classroom_content_selections")
    .select("slot_kind, slot_content_id, alt_content_id")
    .eq("classroom_id", classroomId)
    .eq("status", status);
  if (error) {
    console.error("loadSelectionsForResolution failed", error);
    return;
  }
  for (const row of data) {
    if (row.slot_kind === "source") sourceSelections[row.slot_content_id] = row.alt_content_id;
    else mcqSelections[row.slot_content_id] = row.alt_content_id;
  }
}

export function resolveSourceSlot(officialSource) {
  const altId = sourceSelections[officialSource.id];
  if (!altId) return officialSource;
  const alt = SOURCE_ALTERNATES_BY_ALT_ID.get(altId);
  return alt ? { ...alt, id: officialSource.id } : officialSource;
}

export function resolveMcqQuestSlot(officialQuest) {
  const altId = mcqSelections[officialQuest.id];
  if (!altId) return officialQuest;
  const alt = MCQ_ALTERNATES_BY_ALT_ID.get(altId);
  return alt ? { ...alt, id: officialQuest.id } : officialQuest;
}

export function clearResolutionCache() {
  sourceSelections = {};
  mcqSelections = {};
}

// --- Teacher editing (draft CRUD; direct DB hits, no cache) ---

export async function listSelectionsForCase(classroomId, caseId) {
  const { data, error } = await supabase
    .from("classroom_content_selections")
    .select("slot_kind, slot_content_id, status, alt_content_id, updated_at")
    .eq("classroom_id", classroomId)
    .eq("case_id", caseId);
  if (error) throw error;
  return data;
}

export async function setDraftSelection(classroomId, caseId, slotKind, slotContentId, altContentId) {
  if (altContentId === null) {
    const { error } = await supabase
      .from("classroom_content_selections")
      .delete()
      .eq("classroom_id", classroomId)
      .eq("slot_kind", slotKind)
      .eq("slot_content_id", slotContentId)
      .eq("status", "draft");
    if (error) throw error;
    return;
  }
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");

  const { error } = await supabase.from("classroom_content_selections").upsert(
    {
      classroom_id: classroomId,
      case_id: caseId,
      slot_kind: slotKind,
      slot_content_id: slotContentId,
      status: "draft",
      alt_content_id: altContentId,
      updated_by: session.user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "classroom_id,slot_kind,slot_content_id,status" }
  );
  if (error) throw error;
}

// slotIds: [{slotKind, slotContentId}] — every source/mcq slot belonging to
// this case. For each: a draft row present publishes it (upsert); a draft
// row absent deletes any existing published row (a full revert-to-official).
export async function publishCaseSelections(classroomId, caseId, slotIds) {
  const session = await getSession();
  if (!session) throw new Error("Sign in required.");

  for (const { slotKind, slotContentId } of slotIds) {
    const { data: draftRow, error: draftError } = await supabase
      .from("classroom_content_selections")
      .select("alt_content_id")
      .eq("classroom_id", classroomId)
      .eq("slot_kind", slotKind)
      .eq("slot_content_id", slotContentId)
      .eq("status", "draft")
      .maybeSingle();
    if (draftError) throw draftError;

    if (draftRow) {
      const { error } = await supabase.from("classroom_content_selections").upsert(
        {
          classroom_id: classroomId,
          case_id: caseId,
          slot_kind: slotKind,
          slot_content_id: slotContentId,
          status: "published",
          alt_content_id: draftRow.alt_content_id,
          updated_by: session.user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "classroom_id,slot_kind,slot_content_id,status" }
      );
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("classroom_content_selections")
        .delete()
        .eq("classroom_id", classroomId)
        .eq("slot_kind", slotKind)
        .eq("slot_content_id", slotContentId)
        .eq("status", "published");
      if (error) throw error;
    }
  }
}
