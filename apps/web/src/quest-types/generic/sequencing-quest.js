// Generic Sequencing quest type. No subject-specific assumptions: field
// names stay generic (id, label, position) so this same renderer and
// content contract could serve a future non-history subject unchanged.
// Chronological reasoning in the real AP rubrics is about causal/
// developmental logic, not date recall — content authors are responsible for
// choosing item sets where the correct order reflects a cause-and-effect or
// developmental relationship (enforced by convention/authoring guidance, not
// by a schema field, since "is this causally meaningful" isn't machine-
// checkable). Scoring is all-or-nothing per item set (the full order must be
// correct), matching the rubric's per-point-independent-but-binary logic —
// no partial credit for a near-miss ordering.
import { z } from "zod";
import { escapeHtml } from "../shared/html.js";

export const SequencingItemSchema = z.object({
  id: z.string().min(1, "item.id is required"),
  label: z.string().min(1, "item.label is required"),
  position: z.number().int().nonnegative("item.position must be a non-negative integer"),
});

export const SequencingRelatedSourceSchema = z.object({
  label: z.string().min(1, "relatedSource.label is required"),
  attribution: z.string().optional(),
  excerpt: z.string().min(1, "relatedSource.excerpt is required"),
});

export const SequencingQuestSchema = z
  .object({
    id: z.string().min(1, "sequencing quest id is required"),
    prompt: z.string().min(1, "prompt is required"),
    items: z.array(SequencingItemSchema).min(2, "items must contain at least 2 entries"),
    explanation: z.string().min(1).optional(),
    // Optional free-text reflection gate, mirroring
    // evidence-organizing-quest.js's reflectionPrompt/REFLECTION_MIN_LENGTH
    // pattern exactly (added for Case 1.03's migration off its bespoke
    // empireScreen(), which paired its causal-order mechanic with a graded
    // reflection the plain all-or-nothing sequencing type had no field for).
    reflectionPrompt: z.string().min(1).optional(),
    // Optional, non-graded reference source — same purely-decorative role as
    // mcq-quest.js's own relatedSource, see that file's doc comment.
    relatedSource: SequencingRelatedSourceSchema.nullable().optional(),
    // Optional, opaque taxonomy tag — same rationale as mcq-quest.js's own
    // skillCategory field (a plain string, not an enum tied to
    // evidence-organizing-quest.js's history-specific SKILL_CATEGORIES, to
    // keep this module subject-agnostic). See that file's doc comment.
    skillCategory: z.string().min(1).optional(),
  })
  .superRefine((quest, ctx) => {
    const firstSeenAt = new Map();
    quest.items.forEach((item, index) => {
      if (firstSeenAt.has(item.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "id"],
          message: `Duplicate item id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
        });
      } else {
        firstSeenAt.set(item.id, index);
      }
    });

    const n = quest.items.length;
    const expected = Array.from({ length: n }, (_, i) => i);
    const positions = quest.items.map((item) => item.position).sort((a, b) => a - b);
    const isValidPermutation = positions.every((position, index) => position === expected[index]);
    if (!isValidPermutation) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: `item positions must form a complete 0..${n - 1} ordering with no gaps or repeats (got: ${quest.items
          .map((item) => item.position)
          .join(", ")}).`,
      });
    }
  });

export const SequencingQuestListSchema = z
  .array(SequencingQuestSchema)
  .superRefine((items, ctx) => {
    const firstSeenAt = new Map();
    items.forEach((item, index) => {
      if (firstSeenAt.has(item.id)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "id"],
          message: `Duplicate sequencing quest id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
        });
      } else {
        firstSeenAt.set(item.id, index);
      }
    });
  });

export const REFLECTION_MIN_LENGTH = 20;

/**
 * @param {import("zod").infer<typeof SequencingQuestSchema>} quest
 * @param {{ order?: string[], reflection?: string }} [state] - `order` is the
 *   current arrangement of item ids (post-drag). Defaults to the order items
 *   are authored in, which content authors must NOT author in already-correct
 *   order.
 */
export function renderSequencingQuest(quest, state = {}) {
  const order =
    state.order && state.order.length === quest.items.length
      ? state.order
      : quest.items.map((item) => item.id);
  const byId = new Map(quest.items.map((item) => [item.id, item]));
  const reflectionLength = (state.reflection || "").trim().length;

  return `<section class="quest quest-sequencing" data-quest-id="${escapeHtml(quest.id)}" data-quest-type="sequencing">
  ${
    quest.relatedSource
      ? `<p class="quest-related-source">${quest.relatedSource.attribution ? `<span class="quest-related-source-attribution">${escapeHtml(quest.relatedSource.attribution)}</span> — ` : ""}${escapeHtml(quest.relatedSource.excerpt)}</p>`
      : ""
  }
  <p class="quest-prompt">${escapeHtml(quest.prompt)}</p>
  <ol class="quest-sequence-list">
    ${order
      .map((itemId, index) => {
        const item = byId.get(itemId);
        return `<li class="sequence-item" draggable="true" data-sequence-item="${escapeHtml(itemId)}" data-sequence-index="${index}">
      <span class="sequence-item-label">${escapeHtml(item.label)}</span>
      <span class="sequence-item-controls">
        <button type="button" class="sequence-move-btn" data-action="sequence-move" data-sequence-quest="${escapeHtml(quest.id)}" data-sequence-item="${escapeHtml(itemId)}" data-direction="up" ${index === 0 ? "disabled" : ""} aria-label="Move &quot;${escapeHtml(item.label)}&quot; earlier in the sequence">↑</button>
        <button type="button" class="sequence-move-btn" data-action="sequence-move" data-sequence-quest="${escapeHtml(quest.id)}" data-sequence-item="${escapeHtml(itemId)}" data-direction="down" ${index === order.length - 1 ? "disabled" : ""} aria-label="Move &quot;${escapeHtml(item.label)}&quot; later in the sequence">↓</button>
      </span>
    </li>`;
      })
      .join("")}
  </ol>
  ${
    quest.reflectionPrompt
      ? `<label class="quest-reflection">${escapeHtml(quest.reflectionPrompt)}
    <textarea data-sequence-reflection="${escapeHtml(quest.id)}">${escapeHtml(state.reflection || "")}</textarea>
  </label>
  <p class="quest-reflection-counter" data-sequence-reflection-counter="${escapeHtml(quest.id)}">${reflectionLength}/${REFLECTION_MIN_LENGTH} characters</p>`
      : ""
  }
</section>`;
}

/**
 * @param {import("zod").infer<typeof SequencingQuestSchema>} quest
 * @param {{ order?: string[], reflection?: string }} [state]
 */
export function gradeSequencingQuest(quest, state = {}) {
  const order = state.order || [];
  const answered = order.length === quest.items.length;
  const byId = new Map(quest.items.map((item) => [item.id, item]));
  const correct = answered && order.every((itemId, index) => byId.get(itemId)?.position === index);
  // Quests without a reflectionPrompt keep the original two-field shape
  // exactly (existing content/tests depend on this) — the reflection gate
  // only appears in the result at all for quests that opt into it.
  if (!quest.reflectionPrompt) {
    return { answered, correct };
  }
  const reflectionOk =
    typeof state.reflection === "string" && state.reflection.trim().length >= REFLECTION_MIN_LENGTH;
  return { answered, correct, reflectionOk, complete: correct && reflectionOk };
}

// Deliberately broader than gradeSequencingQuest's own `answered` field
// (which requires a *complete* order, one entry per item, before it's
// gradeable): this answers "has the player started interacting with this
// quest at all," for UI purposes (e.g. showing an "in-progress" status
// instead of a blank "unanswered" one). In practice the app never writes a
// partial order — applySequenceMove()/the drag handler always derive the
// full reordered item list from every current sibling — so the two only
// diverge on a state no real interaction produces.
/** @param {{ order?: string[] }} [state] */
export function sequencingAnsweredAny(state = {}) {
  return Array.isArray(state.order) && state.order.length > 0;
}

/** @param {ReturnType<typeof gradeSequencingQuest>} result */
export function isSequencingComplete(result) {
  return "complete" in result ? !!result.complete : !!result.correct;
}

// Sequencing without a reflection gate has no partial-credit state
// (all-or-nothing per item set) — false. With a reflection gate, mirrors
// evidence-organizing-quest.js's one real partial-credit state: the order is
// correct but the reflection isn't (yet) long enough.
/** @param {ReturnType<typeof gradeSequencingQuest>} result */
export function sequencingPartialSuccess(result) {
  return "complete" in result ? !!result.correct && !result.reflectionOk : false;
}

/** @param {ReturnType<typeof gradeSequencingQuest>} [result] */
export function sequencingHint(result) {
  if (result && "complete" in result && result.correct && !result.reflectionOk) {
    return "The order is correct. Add a reflection of at least a sentence to complete this challenge.";
  }
  return "Use the ↑/↓ buttons (or drag) to arrange the records in order.";
}

// Optional 5th contract slot — see mcq-quest.js's mcqSkillOutcomes for the
// full rationale. Uses `correct` (the ordering itself), not the reflection
// gate, as the mastery signal: the skill this quest type exercises is
// causal/developmental ordering, not the separate reflection-writing task.
/**
 * @param {import("zod").infer<typeof SequencingQuestSchema>} quest
 * @param {{ order?: string[], reflection?: string }} [state]
 * @param {ReturnType<typeof gradeSequencingQuest>} [result]
 */
export function sequencingSkillOutcomes(quest, state = {}, result) {
  if (!quest.skillCategory || !sequencingAnsweredAny(state)) return [];
  const graded = result || gradeSequencingQuest(quest, state);
  if (!graded.answered) return [];
  return [{ key: quest.id, skillCategory: quest.skillCategory, correct: !!graded.correct }];
}
