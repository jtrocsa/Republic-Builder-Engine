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

export const SequencingQuestSchema = z
  .object({
    id: z.string().min(1, "sequencing quest id is required"),
    prompt: z.string().min(1, "prompt is required"),
    items: z.array(SequencingItemSchema).min(2, "items must contain at least 2 entries"),
    explanation: z.string().min(1).optional(),
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

export const SequencingQuestListSchema = z.array(SequencingQuestSchema).superRefine((items, ctx) => {
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

/**
 * @param {import("zod").infer<typeof SequencingQuestSchema>} quest
 * @param {{ order?: string[] }} [state] - `order` is the current arrangement
 *   of item ids (post-drag). Defaults to the order items are authored in,
 *   which content authors must NOT author in already-correct order.
 */
export function renderSequencingQuest(quest, state = {}) {
  const order =
    state.order && state.order.length === quest.items.length
      ? state.order
      : quest.items.map((item) => item.id);
  const byId = new Map(quest.items.map((item) => [item.id, item]));

  return `<section class="quest quest-sequencing" data-quest-id="${escapeHtml(quest.id)}" data-quest-type="sequencing">
  <p class="quest-prompt">${escapeHtml(quest.prompt)}</p>
  <ol class="quest-sequence-list">
    ${order
      .map((itemId, index) => {
        const item = byId.get(itemId);
        return `<li class="sequence-item" draggable="true" data-sequence-item="${escapeHtml(itemId)}" data-sequence-index="${index}">${escapeHtml(item.label)}</li>`;
      })
      .join("")}
  </ol>
</section>`;
}

/**
 * @param {import("zod").infer<typeof SequencingQuestSchema>} quest
 * @param {{ order?: string[] }} [state]
 */
export function gradeSequencingQuest(quest, state = {}) {
  const order = state.order || [];
  const answered = order.length === quest.items.length;
  if (!answered) {
    return { answered: false, correct: false };
  }
  const byId = new Map(quest.items.map((item) => [item.id, item]));
  const correct = order.every((itemId, index) => byId.get(itemId)?.position === index);
  return { answered: true, correct };
}
