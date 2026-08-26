// Document-Based Question (DBQ) quest type — Phase 49E, "The Chronicle
// Dossier." 25% of the real APUSH exam and the biggest build in the
// Phase 49 program (PHASES-46-50.md), so it deliberately reuses every
// pattern saq-quest.js (Phase 49A) already proved rather than inventing new
// ones: real College Board rubric text (api/_lib/rubrics.js's "dbq" taskType,
// a superset of the LEQ rubric's 6 points plus 3 document-specific rows —
// document-evidence, outside-evidence, sourcing — for 7 total), grading here
// is deliberately *not* AI-graded ("complete" means "submitted a
// substantial response," matching every other QUEST_TYPES entry's
// synchronous render/grade contract, not "earned all 7 points"). The AI
// Archive Evaluator round trip (buildDbqEvaluationRequest in
// evaluator-requests.js) composes separately at the call site, the same way
// sourceReader()/reviewScreen()/archiveChallengeQuestCard() already layer
// their own evaluator sections around their own content. A teacher enters
// the real grade by hand via gradingScreen(), same as SAQ/HIPP.
import { z } from "zod";
import { escapeHtml, readOnlyAttr, readOnlyClass, readonlyIf } from "../shared/html.js";

const DbqDocumentSchema = z.object({
  id: z.string().min(1, "document.id is required"),
  // "Document 1", "Document 2"... — the real exam's own numbering
  // convention, which the essay prompt and rubric both refer back to.
  label: z.string().min(1, "document.label is required"),
  attribution: z.string().min(1, "document.attribution is required"),
  date: z.string().min(1, "document.date is required"),
  excerpt: z.string().min(1, "document.excerpt is required"),
});

export const DbqQuestSchema = z
  .object({
    id: z.string().min(1, "dbq quest id is required"),
    prompt: z.string().min(1, "dbq.prompt is required"),
    // The real exam always uses 7; kept a little flexible (4-9) for
    // authoring headroom rather than hard-coding the exam's exact count,
    // matching rubric.dbq's own "at least 4 documents" floor.
    documents: z
      .array(DbqDocumentSchema)
      .min(4, "dbq.documents must contain at least 4 documents")
      .max(9, "dbq.documents should contain at most 9 documents"),
    rubric: z.string().min(1, "dbq.rubric is required"),
  })
  .superRefine((quest, ctx) => {
    const firstSeenAt = new Map();
    quest.documents.forEach((doc, index) => {
      if (firstSeenAt.has(doc.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["documents", index, "id"],
          message: `Duplicate document id "${doc.id}" (first seen at documents[${firstSeenAt.get(doc.id)}]).`,
        });
      } else {
        firstSeenAt.set(doc.id, index);
      }
    });
  });

export const DbqQuestListSchema = z.array(DbqQuestSchema).superRefine((items, ctx) => {
  const firstSeenAt = new Map();
  items.forEach((item, index) => {
    if (firstSeenAt.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `Duplicate dbq quest id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
      });
    } else {
      firstSeenAt.set(item.id, index);
    }
  });
});

// A real DBQ response runs several paragraphs (thesis, contextualization,
// document use, outside evidence, reasoning, complexity) — 400 characters is
// a deliberately low practice-mode floor for "submitted a substantial
// response," not an attempt to approximate the real rubric's word count.
// The rubric itself (via the AI evaluator, then a teacher's real grade) is
// what actually judges quality — this floor only gates the local "complete"
// signal every other quest type also uses for unlock/progress tracking.
export const DBQ_MIN_RESPONSE_LENGTH = 400;

/**
 * @param {import("zod").infer<typeof DbqQuestSchema>} quest
 * @param {{ response?: string }} [state]
 * @param {{ readOnly?: boolean }} [options] - see quest-types/shared/html.js.
 */
export function renderDbqQuest(quest, state = {}, options = {}) {
  const readOnly = Boolean(options.readOnly);
  const response = state.response || "";
  const length = response.trim().length;

  return `<section class="quest quest-dbq${readOnlyClass(readOnly)}" data-quest-id="${escapeHtml(quest.id)}" data-quest-type="dbq"${readOnlyAttr(readOnly)}>
  <p class="quest-prompt">${escapeHtml(quest.prompt)}</p>
  ${quest.documents
    .map(
      (doc) => `<blockquote class="quest-document">
    <p class="quest-document-text">${escapeHtml(doc.excerpt)}</p>
    <cite class="quest-document-attribution">${escapeHtml(doc.label)} — ${escapeHtml(doc.attribution)}, ${escapeHtml(doc.date)}</cite>
  </blockquote>`
    )
    .join("")}
  <div class="rubric-note"><b>Document-Based Question · 7 points total</b><p>${escapeHtml(quest.rubric)}</p></div>
  <label class="quest-reflection">Your Dossier response
    <textarea data-dbq-response="${escapeHtml(quest.id)}" rows="14"${readonlyIf(readOnly)}>${escapeHtml(response)}</textarea>
  </label>
  <p class="quest-reflection-counter" data-dbq-response-counter="${escapeHtml(quest.id)}">${length}/${DBQ_MIN_RESPONSE_LENGTH} characters</p>
</section>`;
}

/**
 * @param {import("zod").infer<typeof DbqQuestSchema>} quest
 * @param {{ response?: string }} [state]
 */
export function gradeDbqQuest(quest, state = {}) {
  const length = (state.response || "").trim().length;
  return { complete: length >= DBQ_MIN_RESPONSE_LENGTH, length };
}

/** @param {{ response?: string }} [state] */
export function dbqAnsweredAny(state = {}) {
  return (state.response || "").trim().length > 0;
}

/** @param {ReturnType<typeof gradeDbqQuest>} result */
export function isDbqComplete(result) {
  return !!result.complete;
}

// No invented partial-credit UI state — matches saq/mcq/hipp's convention.
// evidence-organizing/sequencing's partialSuccess means "got the substantive
// part right, one small step left" (e.g. all placed correctly, reflection
// pending); a dossier response under the length floor hasn't cleared any such
// bar, so it doesn't qualify for that green "success" treatment either.
export function dbqPartialSuccess() {
  return false;
}

/** @param {ReturnType<typeof gradeDbqQuest>} [result] */
export function dbqHint(result) {
  if (result && (result.length || 0) > 0 && !result.complete) {
    return `Keep going — reach at least ${DBQ_MIN_RESPONSE_LENGTH} characters, using at least four documents and one piece of outside evidence, before submitting.`;
  }
  return "Draft a thesis, use the documents plus outside evidence, and explain your reasoning before submitting.";
}

// No skillOutcomes export — same rationale as saq-quest.js: "complete" here
// means "submitted," not "graded," so there is no binary correct/incorrect
// signal to feed the skill-mastery record without the AI evaluator or a
// teacher's real grade.
