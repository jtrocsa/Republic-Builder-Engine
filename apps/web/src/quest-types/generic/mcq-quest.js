// Generic MCQ quest type. No subject-specific assumptions: field names stay
// generic (prompt, choices, answer, explanation, id) so this same renderer
// and content contract could serve a future non-history subject unchanged.
// Reuses the existing McqQuestionSchema shape from
// apps/web/src/content/schemas/review.schema.js (the same shape REVIEW.mcq
// already validates against) rather than inventing a divergent one — see
// docs/architecture/QUEST-TYPE-ARCHITECTURE.md.
import { z } from "zod";
import { McqQuestionSchema } from "../../content/schemas/review.schema.js";
import { escapeHtml } from "../shared/html.js";

export const McqRelatedSourceSchema = z.object({
  label: z.string().min(1, "relatedSource.label is required"),
  attribution: z.string().optional(),
  excerpt: z.string().min(1, "relatedSource.excerpt is required"),
});

export const McqQuestSchema = McqQuestionSchema.extend({
  id: z.string().min(1, "mcq quest id is required"),
  // Optional, non-graded reference source a teacher can attach for context —
  // see docs on evidence-organizing/hipp's own (required, graded) source
  // fields; this one is purely decorative student-facing context and has no
  // bearing on gradeMcqQuest().
  relatedSource: McqRelatedSourceSchema.nullable().optional(),
  // Optional, opaque taxonomy tag — deliberately a plain string, not an enum
  // tied to evidence-organizing-quest.js's history-specific SKILL_CATEGORIES,
  // since this module stays subject-agnostic (see header comment). History
  // content authors should set this to one of SKILL_CATEGORIES' values by
  // convention (see docs/content-guide/skill-taxonomy.md); a future non-
  // history subject could set it to its own taxonomy instead. Feeds the
  // Phase 49B skill-mastery record screen via skillOutcomes() below; omitted
  // questions simply don't contribute to any mastery bucket.
  skillCategory: z.string().min(1).optional(),
});

export const McqQuestListSchema = z.array(McqQuestSchema).superRefine((items, ctx) => {
  const firstSeenAt = new Map();
  items.forEach((item, index) => {
    if (firstSeenAt.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        path: [index, "id"],
        message: `Duplicate mcq quest id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
      });
    } else {
      firstSeenAt.set(item.id, index);
    }
  });
});

/**
 * @param {import("zod").infer<typeof McqQuestSchema>} quest
 * @param {{ selected?: number|string }} [state]
 */
export function renderMcqQuest(quest, state = {}) {
  const { selected } = state;
  return `<article class="quest quest-mcq" data-quest-id="${escapeHtml(quest.id)}" data-quest-type="mcq">
  ${
    quest.relatedSource
      ? `<p class="quest-related-source">${quest.relatedSource.attribution ? `<span class="quest-related-source-attribution">${escapeHtml(quest.relatedSource.attribution)}</span> — ` : ""}${escapeHtml(quest.relatedSource.excerpt)}</p>`
      : ""
  }
  <p class="quest-prompt">${escapeHtml(quest.prompt)}</p>
  <div class="quest-choices">
    ${quest.choices
      .map(
        (choice, index) => `<label class="choice">
      <input type="radio" name="mcq-${escapeHtml(quest.id)}" data-mcq-quest="${escapeHtml(quest.id)}" value="${index}" ${
        String(selected) === String(index) ? "checked" : ""
      }>
      <span>${escapeHtml(choice)}</span>
    </label>`
      )
      .join("")}
  </div>
</article>`;
}

/**
 * @param {import("zod").infer<typeof McqQuestSchema>} quest
 * @param {{ selected?: number|string }} [state]
 */
export function gradeMcqQuest(quest, state = {}) {
  const { selected } = state;
  const answered = selected !== undefined && selected !== null && selected !== "";
  const correct = answered && Number(selected) === quest.answer;
  return { answered, correct };
}

/** @param {{ selected?: number|string }} [state] */
export function mcqAnsweredAny(state = {}) {
  const { selected } = state;
  return selected !== undefined && selected !== null && selected !== "";
}

/** @param {ReturnType<typeof gradeMcqQuest>} result */
export function isMcqComplete(result) {
  return !!result.correct;
}

// MCQ has no partial-credit state — always false, kept for a uniform
// QUEST_TYPES contract across all four quest types (see evidence-organizing's
// real partial state, the one type that needs this).
export function mcqPartialSuccess() {
  return false;
}

export function mcqHint() {
  return "Choose the option that best explains why, not just the option that names the correct answer.";
}

// Optional 5th contract slot (see docs/architecture/QUEST-TYPE-ARCHITECTURE.md
// and quest-types/index.js's questSkillOutcomes() wrapper) — reports one
// mastery-bucket outcome once the question has been answered, keyed by the
// quest's own id so a later re-render/edit overwrites rather than
// double-counts the same item. Returns [] (no outcome yet) for an unanswered
// question or one with no skillCategory tag.
/**
 * @param {import("zod").infer<typeof McqQuestSchema>} quest
 * @param {{ selected?: number|string }} [state]
 * @param {ReturnType<typeof gradeMcqQuest>} [result]
 */
export function mcqSkillOutcomes(quest, state = {}, result) {
  if (!quest.skillCategory || !mcqAnsweredAny(state)) return [];
  const graded = result || gradeMcqQuest(quest, state);
  return [{ key: quest.id, skillCategory: quest.skillCategory, correct: !!graded.correct }];
}
