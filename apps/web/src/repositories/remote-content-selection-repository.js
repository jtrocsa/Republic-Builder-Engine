/**
 * Teacher Mode's source/quest swap mechanism. Two halves:
 *
 *  - A resolution cache (resolveSourceSlot/resolveQuestSlot), read
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
 * slot_kind covers a source slot ("source") or any of the 4 quest-type keys
 * from apps/web/src/quest-types/index.js's QUEST_TYPES ("mcq", "sequencing",
 * "evidence-organizing", "hipp") — see 0007_generalize_content_slots.sql,
 * which widened the original {source, mcq-quest}-only constraint. Using the
 * same string QUEST_TYPES already keys by means slot_kind can be passed
 * straight into renderQuest/gradeQuest with no translation layer.
 *
 * The curated alternate-content pools are plain content-file imports (same
 * "content lives in apps/web/src/content/" precedent as every other unit
 * content file) — as more cases get alternates, add another import + spread
 * into QUEST_ALTERNATE_ENTRIES_BY_TYPE below, mirroring how main.js's
 * ARCHIVE_CHALLENGE_QUESTS_BY_TYPE aggregates per-unit quest arrays.
 */
import { supabase } from "../lib/supabase-client.js";
import { getSession } from "./remote-auth-repository.js";
import { CASE_001_SOURCE_ALTERNATES } from "../content/case-001-source-alternates.js";
import { CASE_001_MCQ_ALTERNATES } from "../content/quests/case-001-mcq-alternates.js";
import { CASE_001_SEQUENCING_ALTERNATES } from "../content/quests/case-001-sequencing-alternates.js";
import { CASE_001_EVIDENCE_ORGANIZING_ALTERNATES } from "../content/quests/case-001-evidence-organizing-alternates.js";
import { CASE_001_HIPP_ALTERNATES } from "../content/quests/case-001-hipp-alternates.js";
import { CASE_006_EVIDENCE_ORGANIZING_ALTERNATES } from "../content/quests/case-006-evidence-organizing-alternates.js";

const QUEST_ALTERNATE_ENTRIES_BY_TYPE = {
  mcq: CASE_001_MCQ_ALTERNATES,
  sequencing: CASE_001_SEQUENCING_ALTERNATES,
  "evidence-organizing": [...CASE_001_EVIDENCE_ORGANIZING_ALTERNATES, ...CASE_006_EVIDENCE_ORGANIZING_ALTERNATES],
  hipp: CASE_001_HIPP_ALTERNATES,
};

const SOURCE_ALTERNATES_BY_ALT_ID = new Map(
  CASE_001_SOURCE_ALTERNATES.map((entry) => [entry.source.id, entry.source])
);
const QUEST_ALTERNATES_BY_ALT_ID_BY_TYPE = Object.fromEntries(
  Object.entries(QUEST_ALTERNATE_ENTRIES_BY_TYPE).map(([questType, entries]) => [
    questType,
    new Map(entries.map((entry) => [entry.quest.id, entry.quest])),
  ])
);

// contentId -> [{id, label}] curated alternates a teacher may pick for that
// official slot, used to render the Manage Content dropdowns.
const SOURCE_ALTERNATIVES_BY_SLOT = groupAlternativesBySlot(CASE_001_SOURCE_ALTERNATES, "replacesSourceId", "source");
const QUEST_ALTERNATIVES_BY_SLOT_BY_TYPE = Object.fromEntries(
  Object.entries(QUEST_ALTERNATE_ENTRIES_BY_TYPE).map(([questType, entries]) => [
    questType,
    groupAlternativesBySlot(entries, "replacesQuestId", "quest"),
  ])
);

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

export function alternativesForQuestSlot(questType, slotContentId) {
  return QUEST_ALTERNATIVES_BY_SLOT_BY_TYPE[questType]?.[slotContentId] || [];
}

// --- Resolution cache (student/live-game path + teacher preview) ---

let sourceSelections = {};
let questSelectionsByType = {};

export async function loadSelectionsForResolution(classroomId, status = "published") {
  sourceSelections = {};
  questSelectionsByType = {};
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
    else (questSelectionsByType[row.slot_kind] ??= {})[row.slot_content_id] = row.alt_content_id;
  }
}

export function resolveSourceSlot(officialSource) {
  const altId = sourceSelections[officialSource.id];
  if (!altId) return officialSource;
  const alt = SOURCE_ALTERNATES_BY_ALT_ID.get(altId);
  return alt ? { ...alt, id: officialSource.id } : officialSource;
}

export function resolveQuestSlot(questType, officialQuest) {
  const altId = questSelectionsByType[questType]?.[officialQuest.id];
  if (!altId) return officialQuest;
  const alt = QUEST_ALTERNATES_BY_ALT_ID_BY_TYPE[questType]?.get(altId);
  return alt ? { ...alt, id: officialQuest.id } : officialQuest;
}

export function clearResolutionCache() {
  sourceSelections = {};
  questSelectionsByType = {};
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

// slotIds: [{slotKind, slotContentId}] — every source/quest slot belonging
// to this case. For each: a draft row present publishes it (upsert); a
// draft row absent deletes any existing published row (a full
// revert-to-official).
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
