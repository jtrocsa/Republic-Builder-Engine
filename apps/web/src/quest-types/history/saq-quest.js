// History-coupled Short Answer Question (SAQ) quest type. Mirrors the exact
// stimulus/prompts/rubric shape the bespoke Archive Review SAQ block
// (reviewScreen() in main.js) already uses, so an authored SAQ reads
// identically whether it's a unit-level review question or a per-case quest.
//
// Grading here is deliberately *not* AI-graded. The real College Board SAQ
// rubric (api/_lib/rubrics.js) awards 1 point per part (a/b/c), earned or not
// earned, no partial credit — a judgment call the AI evaluator only ever
// produces as *formative feedback*, never an authoritative grade (a teacher
// enters the real grade by hand via gradingScreen(), same as the Archive
// Review SAQ). To keep this quest type consistent with every other
// QUEST_TYPES entry's synchronous render/grade contract, "complete" here
// means "the student submitted a non-empty response to every part" — exactly
// what unlocks progress/unlock tracking for every other quest type. The AI
// evaluator round trip (runEvaluation()/archiveFeedbackMarkup()) composes
// separately at the call site in main.js, the same way sourceReader() and
// reviewScreen() already layer their own evaluator sections around their own
// bespoke content without either concern living inside a quest-type module.
import { z } from "zod";
import { SaqSchema } from "../../content/schemas/review.schema.js";
import { escapeHtml, readOnlyAttr, readOnlyClass, readonlyIf } from "../shared/html.js";

export const SaqQuestSchema = SaqSchema.extend({
  id: z.string().min(1, "saq quest id is required"),
});

export const SaqQuestListSchema = z.array(SaqQuestSchema).superRefine((items, ctx) => {
  const firstSeenAt = new Map();
  items.forEach((item, index) => {
    if (firstSeenAt.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `Duplicate saq quest id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
      });
    } else {
      firstSeenAt.set(item.id, index);
    }
  });
});

/**
 * @param {import("zod").infer<typeof SaqQuestSchema>} quest
 * @param {{ responses?: Record<number, string> }} [state] - `responses` maps
 *   prompt index -> the student's draft text for that part.
 * @param {{ readOnly?: boolean }} [options] - see quest-types/shared/html.js.
 */
export function renderSaqQuest(quest, state = {}, options = {}) {
  const readOnly = Boolean(options.readOnly);
  const responses = state.responses || {};

  // Reuses .quest-document/.rubric-note/.quest-reflection — the same
  // already-styled classes reviewScreen()'s bespoke SAQ block and the other
  // quest types' render functions use — rather than introducing new,
  // unstyled classes for what's visually the same kind of stimulus/rubric/
  // response-textarea layout.
  return `<section class="quest quest-saq${readOnlyClass(readOnly)}" data-quest-id="${escapeHtml(quest.id)}" data-quest-type="saq"${readOnlyAttr(readOnly)}>
  <blockquote class="quest-document">
    <p class="quest-document-text">${escapeHtml(quest.stimulus)}</p>
  </blockquote>
  <div class="rubric-note"><b>Structured SAQ practice · ${quest.prompts.length} points total</b><p>${escapeHtml(quest.rubric)}</p></div>
  ${quest.prompts
    .map(
      (prompt, index) => `<label class="quest-reflection">${escapeHtml(prompt)}
    <textarea data-saq-quest="${escapeHtml(quest.id)}" data-saq-index="${index}"${readonlyIf(readOnly)}>${escapeHtml(
      responses[index] || ""
    )}</textarea>
  </label>`
    )
    .join("")}
</section>`;
}

/**
 * @param {import("zod").infer<typeof SaqQuestSchema>} quest
 * @param {{ responses?: Record<number, string> }} [state]
 */
export function gradeSaqQuest(quest, state = {}) {
  const responses = state.responses || {};
  const complete = quest.prompts.every((_, index) => (responses[index] || "").trim().length > 0);
  return { complete };
}

/** @param {{ responses?: Record<number, string> }} [state] */
export function saqAnsweredAny(state = {}) {
  return Object.values(state.responses || {}).some((value) => (value || "").trim().length > 0);
}

/** @param {ReturnType<typeof gradeSaqQuest>} result */
export function isSaqComplete(result) {
  return !!result.complete;
}

// No invented partial-credit UI state — matches mcq/hipp's convention.
// "Complete" already only means "submitted", not "graded correctly"; there's
// no finer-grained status to report here without the (deliberately excluded)
// AI evaluator result.
export function saqPartialSuccess() {
  return false;
}

export function saqHint() {
  return "Draft a response for every part (a, b, c) before submitting.";
}
