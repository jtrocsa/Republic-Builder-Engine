// History-coupled Source Analysis (HIPP) quest type. Deliberately not
// forced generic — it assumes a historical document with attribution and
// HIPP (Historical situation / Intended audience / Point of view / Purpose)
// sourcing reasoning, the same rubric-grounded skill the real DBQ sourcing
// point rewards.
//
// The actual DBQ rubric only awards the sourcing point when a response
// explains *how or why* a document's HIPP element is relevant to an
// argument — not for merely identifying it. This schema builds that exact
// distinction in: each hippPrompt requires exactly one explanation-linked
// correct option, plus at least one identification-only distractor (an
// option that correctly identifies the HIPP element but doesn't connect it
// to an argument) that must score zero, matching the rubric's own logic.
// Scoring is binary per dimension per document — no invented partial-credit
// scale.
import { z } from "zod";
import { escapeHtml } from "../shared/html.js";

export const HIPP_DIMENSIONS = [
  "Historical situation",
  "Intended audience",
  "Point of view",
  "Purpose",
];

export const HippOptionSchema = z
  .object({
    id: z.string().min(1, "option.id is required"),
    text: z.string().min(1, "option.text is required"),
    correct: z.boolean(),
    identificationOnly: z.boolean().optional().default(false),
  })
  .superRefine((option, ctx) => {
    if (option.correct && option.identificationOnly) {
      ctx.addIssue({
        code: "custom",
        path: ["identificationOnly"],
        message:
          "an option cannot be both correct and identificationOnly — the real DBQ rubric scores identification-only responses as zero, never as the correct explanation-linked answer.",
      });
    }
  });

export const HippDocumentSchema = z.object({
  text: z.string().min(1, "document.text is required"),
  attribution: z.string().min(1, "document.attribution is required"),
});

export const HippPromptSchema = z
  .object({
    id: z.string().min(1, "hippPrompt.id is required"),
    dimension: z.enum(HIPP_DIMENSIONS, {
      message: `hippPrompt.dimension must be one of: ${HIPP_DIMENSIONS.join(", ")}`,
    }),
    argument: z
      .string()
      .min(1, "hippPrompt.argument is required — the specific argument this HIPP dimension should connect to"),
    options: z
      .array(HippOptionSchema)
      .min(3, "hippPrompt.options needs at least 3 candidate statements (correct + identification-only distractor + at least one other distractor)"),
  })
  .superRefine((hippPrompt, ctx) => {
    const correctCount = hippPrompt.options.filter((option) => option.correct).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: `hippPrompt.options must contain exactly one correct, explanation-linked option (found ${correctCount}).`,
      });
    }
    const hasIdentificationOnlyDistractor = hippPrompt.options.some(
      (option) => option.identificationOnly && !option.correct,
    );
    if (!hasIdentificationOnlyDistractor) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message:
          "hippPrompt.options must include at least one identification-only distractor (correctly identifies the HIPP element but does not connect it to the argument) — this is what the real rubric scores as zero.",
      });
    }
    const firstSeenAt = new Map();
    hippPrompt.options.forEach((option, index) => {
      if (firstSeenAt.has(option.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["options", index, "id"],
          message: `Duplicate option id "${option.id}" (first seen at index ${firstSeenAt.get(option.id)}).`,
        });
      } else {
        firstSeenAt.set(option.id, index);
      }
    });
  });

export const SourceAnalysisQuestSchema = z
  .object({
    id: z.string().min(1, "source-analysis quest id is required"),
    prompt: z.string().min(1, "prompt is required"),
    document: HippDocumentSchema,
    hippPrompts: z
      .array(HippPromptSchema)
      .min(1, "hippPrompts must tag at least one HIPP dimension")
      .max(
        2,
        "tag only the 1-2 HIPP dimensions that are actually meaningfully arguable for this document — don't force all four onto every source",
      ),
  })
  .superRefine((quest, ctx) => {
    const seenDimensionAt = new Map();
    quest.hippPrompts.forEach((hippPrompt, index) => {
      if (seenDimensionAt.has(hippPrompt.dimension)) {
        ctx.addIssue({
          code: "custom",
          path: ["hippPrompts", index, "dimension"],
          message: `Duplicate HIPP dimension "${hippPrompt.dimension}" tagged twice for one document.`,
        });
      } else {
        seenDimensionAt.set(hippPrompt.dimension, index);
      }
    });
  });

export const SourceAnalysisQuestListSchema = z
  .array(SourceAnalysisQuestSchema)
  .superRefine((items, ctx) => {
    const firstSeenAt = new Map();
    items.forEach((item, index) => {
      if (firstSeenAt.has(item.id)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "id"],
          message: `Duplicate source-analysis quest id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
        });
      } else {
        firstSeenAt.set(item.id, index);
      }
    });
  });

/**
 * @param {import("zod").infer<typeof SourceAnalysisQuestSchema>} quest
 * @param {{ selected?: Record<string, string> }} [state] - `selected` maps
 *   hippPrompt id -> chosen option id.
 */
export function renderSourceAnalysisQuest(quest, state = {}) {
  const selected = state.selected || {};

  return `<section class="quest quest-source-analysis" data-quest-id="${escapeHtml(quest.id)}" data-quest-type="hipp">
  <p class="quest-prompt">${escapeHtml(quest.prompt)}</p>
  <blockquote class="quest-document">
    <p class="quest-document-text">${escapeHtml(quest.document.text)}</p>
    <cite class="quest-document-attribution">${escapeHtml(quest.document.attribution)}</cite>
  </blockquote>
  <div class="quest-hipp-prompts">
    ${quest.hippPrompts
      .map(
        (hippPrompt) => `<fieldset class="hipp-prompt" data-hipp-prompt="${escapeHtml(hippPrompt.id)}" data-hipp-dimension="${escapeHtml(hippPrompt.dimension)}">
      <legend>${escapeHtml(hippPrompt.dimension)}: ${escapeHtml(hippPrompt.argument)}</legend>
      ${hippPrompt.options
        .map(
          (option) => `<label class="hipp-option">
        <input type="radio" name="hipp-${escapeHtml(quest.id)}-${escapeHtml(hippPrompt.id)}" data-hipp-option="${escapeHtml(option.id)}" value="${escapeHtml(option.id)}" ${
          selected[hippPrompt.id] === option.id ? "checked" : ""
        }>
        <span>${escapeHtml(option.text)}</span>
      </label>`,
        )
        .join("")}
    </fieldset>`,
      )
      .join("")}
  </div>
</section>`;
}

/**
 * @param {import("zod").infer<typeof SourceAnalysisQuestSchema>} quest
 * @param {{ selected?: Record<string, string> }} [state]
 */
export function gradeSourceAnalysisQuest(quest, state = {}) {
  const selected = state.selected || {};
  const results = {};
  quest.hippPrompts.forEach((hippPrompt) => {
    const chosenOptionId = selected[hippPrompt.id];
    const chosenOption = hippPrompt.options.find((option) => option.id === chosenOptionId);
    results[hippPrompt.id] = Boolean(chosenOption && chosenOption.correct);
  });
  const pointsEarned = Object.values(results).filter(Boolean).length;
  const pointsPossible = quest.hippPrompts.length;
  return {
    results,
    pointsEarned,
    pointsPossible,
    complete: pointsEarned === pointsPossible,
  };
}
