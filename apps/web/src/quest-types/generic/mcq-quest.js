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

export const McqQuestSchema = McqQuestionSchema.extend({
  id: z.string().min(1, "mcq quest id is required"),
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
  <p class="quest-prompt">${escapeHtml(quest.prompt)}</p>
  <div class="quest-choices">
    ${quest.choices
      .map(
        (choice, index) => `<label class="choice">
      <input type="radio" name="mcq-${escapeHtml(quest.id)}" data-mcq-quest="${escapeHtml(quest.id)}" value="${index}" ${
        String(selected) === String(index) ? "checked" : ""
      }>
      <span>${escapeHtml(choice)}</span>
    </label>`,
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
