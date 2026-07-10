import { z } from "zod";

// A single Archive Review multiple-choice question (`reviewScreen()` in
// main.js, rendered from REVIEW.mcq / UNIT_02_REVIEW.mcq).
const McqQuestionSchema = z
  .object({
    prompt: z.string().min(1, "mcq.prompt is required"),
    choices: z.array(z.string().min(1)).min(2, "mcq.choices needs at least 2 options"),
    answer: z.number().int().nonnegative(),
    explanation: z.string().min(1, "mcq.explanation is required"),
  })
  .superRefine((question, ctx) => {
    if (question.answer >= question.choices.length) {
      ctx.addIssue({
        code: "custom",
        path: ["answer"],
        message: `mcq.answer (${question.answer}) is out of range for ${question.choices.length} choices.`,
      });
    }
  });

// Matches rubric prose like "3 points total" (REVIEW.saq.rubric). Rubric text
// that doesn't state an explicit numeric total (e.g. UNIT_02_REVIEW.saq's
// "one point per part" phrasing) is intentionally not checked — see
// docs/content/CONTENT-VALIDATION.md's "Known limitations".
const RUBRIC_TOTAL_PATTERN = /(\d+)\s*points?\s*total/i;

const SaqSchema = z
  .object({
    stimulus: z.string().min(1, "saq.stimulus is required"),
    prompts: z.array(z.string().min(1)).min(1, "saq.prompts must contain at least one prompt"),
    rubric: z.string().min(1, "saq.rubric is required"),
  })
  .superRefine((saq, ctx) => {
    const match = saq.rubric.match(RUBRIC_TOTAL_PATTERN);
    if (match) {
      const statedTotal = Number(match[1]);
      if (statedTotal !== saq.prompts.length) {
        ctx.addIssue({
          code: "custom",
          path: ["rubric"],
          message: `saq.rubric states ${statedTotal} points total, but saq.prompts has ${saq.prompts.length} prompt(s).`,
        });
      }
    }
  });

export const ReviewSchema = z.object({
  mcq: z.array(McqQuestionSchema).min(1, "review.mcq must contain at least one question"),
  saq: SaqSchema,
});
