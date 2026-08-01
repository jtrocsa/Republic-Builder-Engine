// What all four activity engines have in common.
//
// An activity engine is a playable interaction that takes its whole subject
// from content. `engine/` is the folder whose rule is "no subject-specific
// facts," and that rule is the entire point here: the four engines in this
// folder are the mechanics with the history stripped off, so a different
// subject supplies content matching the Zod contract and gets a playable
// activity with no code change. If an engine cannot be written without naming
// a historical thing, it is not an engine.
//
// The registry in ./index.js is deliberately the same small shape as
// quest-types/index.js — an object literal and a throwing lookup, not a
// plugin-discovery system. Adding a fifth engine is one more entry.
import { z } from "zod";

// Deliberate twin of quest-types/shared/html.js's escapeHtml.
//
// Not imported from there, and not deduplicated: that file's own header says
// quest-types/ is meant to stand alone, and this folder has the stronger
// version of the same requirement — engine/activities/ has to be liftable into
// another subject's pack without dragging APUSH quest types behind it. Eight
// lines of pure string work is the right price for that boundary. (Same
// reasoning as isCaribbeanLand's duplication between main.js and
// scripts/generate-caribbean-tmj.js.)
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Every activity ends the same way: the player files a judgement about what the
 * record they just handled can actually support. This is the one graded moment
 * — the interaction before it teaches, this scores.
 *
 * Every option carries `why`, not just the right one, so filing the wrong
 * record is informative rather than a buzzer. That is the same discipline as
 * ASSEMBLY's `misread`.
 */
export const ClosingChoiceSchema = z
  .object({
    prompt: z.string().min(1, "closer.prompt is required"),
    // Optional, opaque taxonomy tag, exactly as mcq-quest.js declares it —
    // a plain string rather than an enum, so a non-history subject can use its
    // own taxonomy. Feeds the skill-mastery record through outcome().
    skillCategory: z.string().min(1).optional(),
    options: z
      .array(
        z.object({
          id: z.string().min(1, "closer option id is required"),
          text: z.string().min(1, "closer option text is required"),
          correct: z.boolean(),
          why: z.string().min(1, "every closer option needs a `why`, including the wrong ones"),
        })
      )
      .min(2, "a closer needs at least two options"),
  })
  .superRefine((closer, ctx) => {
    const correct = closer.options.filter((option) => option.correct);
    if (correct.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: `A closer must have exactly one correct option; found ${correct.length}.`,
      });
    }
    const firstSeenAt = new Map();
    closer.options.forEach((option, index) => {
      if (firstSeenAt.has(option.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["options", index, "id"],
          message: `Duplicate closer option id "${option.id}" (first seen at index ${firstSeenAt.get(option.id)}).`,
        });
      } else {
        firstSeenAt.set(option.id, index);
      }
    });
  });

/**
 * Shared id-uniqueness check. Every engine has at least one array whose ids are
 * used as lookup keys, and a duplicate there fails silently at runtime (the
 * second entry is simply unreachable) rather than loudly, so it is worth a
 * schema issue.
 *
 * @param {{ id: string }[]} items
 * @param {import("zod").RefinementCtx} ctx
 * @param {string} label
 * @param {(string|number)[]} [path]
 */
export function checkUniqueIds(items, ctx, label, path = []) {
  const firstSeenAt = new Map();
  items.forEach((item, index) => {
    if (firstSeenAt.has(item.id)) {
      ctx.addIssue({
        code: "custom",
        path: [...path, index, "id"],
        message: `Duplicate ${label} id "${item.id}" (first seen at index ${firstSeenAt.get(item.id)}).`,
      });
    } else {
      firstSeenAt.set(item.id, index);
    }
  });
}

/**
 * How a filed closer graded.
 *
 * @param {import("zod").infer<typeof ClosingChoiceSchema>} closer
 * @param {string|null|undefined} filedId
 */
export function closerResult(closer, filedId) {
  const option = closer.options.find((item) => item.id === filedId) || null;
  return { filed: !!option, correct: !!option?.correct, option };
}

/**
 * The closer, rendered.
 *
 * `locked` is passed by an engine whose earlier phase isn't finished yet — the
 * options still render, so the player can read where the activity is going, but
 * they can't be filed. Hiding it entirely made the activity look like it had no
 * ending.
 *
 * @param {import("zod").infer<typeof ClosingChoiceSchema>} closer
 * @param {string|null|undefined} filedId
 * @param {{ locked?: boolean, lockedNote?: string }} [options]
 */
export function renderCloser(closer, filedId, { locked = false, lockedNote = "" } = {}) {
  const { option, correct } = closerResult(closer, filedId);
  const options = closer.options
    .map((item) => {
      const chosen = item.id === filedId;
      const state = chosen ? (item.correct ? " is-correct" : " is-wrong") : "";
      return `<button type="button" class="activity-option${state}" data-activity-action="file" data-option="${escapeHtml(item.id)}" aria-pressed="${chosen ? "true" : "false"}"${locked ? " disabled" : ""}>${escapeHtml(item.text)}</button>`;
    })
    .join("");
  const verdict = option
    ? `<p class="activity-why ${correct ? "is-correct" : "is-wrong"}">${escapeHtml(option.why)}</p>`
    : locked && lockedNote
      ? `<p class="activity-why is-locked">${escapeHtml(lockedNote)}</p>`
      : "";
  return `<section class="activity-closer${locked ? " is-locked" : ""}">
  <h3>File the record</h3>
  <p class="activity-closer__prompt">${escapeHtml(closer.prompt)}</p>
  <div class="activity-closer__options">${options}</div>
  ${verdict}
</section>`;
}

/**
 * The skill-mastery outcome a filed closer reports.
 *
 * Deliberately the same `{ key, skillCategory, correct }` shape quest types
 * return from skillOutcomes(), so main.js's existing recordSkillOutcomes() can
 * consume an activity's outcome without learning anything new. Returns [] for
 * an unfiled closer or one with no skillCategory tag, matching mcqSkillOutcomes.
 *
 * @param {string} activityId
 * @param {import("zod").infer<typeof ClosingChoiceSchema>} closer
 * @param {string|null|undefined} filedId
 */
export function closerSkillOutcomes(activityId, closer, filedId) {
  const { filed, correct } = closerResult(closer, filedId);
  if (!filed || !closer.skillCategory) return [];
  return [{ key: activityId, skillCategory: closer.skillCategory, correct }];
}
