// DISCREPANCY — the player checks an authoritative record against what they can
// actually observe, then decides whether each gap is an error or a design.
//
// The mechanic, with the subject stripped off: a list of claims, a list of
// observations, a verdict per claim, and — for claims that fail — a second
// question about *why* they fail. The second question is the whole engine.
// Anyone can notice that a document is wrong; the move worth teaching is
// telling a mistake apart from a choice.
//
// The observation column is the transferable hook for cause and effect: an
// entry may declare `requires`, an opaque token the host resolves against what
// this particular player has actually done elsewhere. Two players audit the
// same record against different evidence and reach it by different routes,
// without one atom of the record changing.
//
// Transfers as: a budget against its receipts (economics), claimed against
// measured data (science), a press release against the numbers (journalism).
import { z } from "zod";
import {
  ClosingChoiceSchema,
  checkUniqueIds,
  closerResult,
  closerSkillOutcomes,
  escapeHtml,
  renderCloser,
} from "./contract.js";

const LabelledSchema = z.object({
  id: z.string().min(1, "id is required"),
  label: z.string().min(1, "label is required"),
  note: z.string().min(1).optional(),
});

export const DiscrepancyActivitySchema = z
  .object({
    kind: z.literal("discrepancy"),
    id: z.string().min(1, "activity.id is required"),
    title: z.string().min(1, "activity.title is required"),
    intro: z.string().min(1, "activity.intro is required"),
    record: z.object({
      label: z.string().min(1, "record.label is required"),
      attribution: z.string().min(1, "record.attribution is required"),
    }),
    // The verdicts are content, not an enum, because what counts as a verdict
    // differs by subject — "supported / contradicted / cannot tell" here,
    // "matches / overstated / not itemised" in an accounts audit.
    verdicts: z.array(LabelledSchema).min(2, "a discrepancy needs at least two verdicts"),
    // Which verdict means "this failed, now say why". Naming it in content is
    // what keeps the engine from having to know that "contradicted" is special.
    gapRequiredFor: z.string().min(1, "gapRequiredFor is required"),
    gapKinds: z.array(LabelledSchema).min(2, "a discrepancy needs at least two gap kinds"),
    claims: z
      .array(
        z.object({
          id: z.string().min(1, "claim.id is required"),
          text: z.string().min(1, "claim.text is required"),
          verdict: z.string().min(1, "claim.verdict is required"),
          gap: z.string().min(1).nullable().default(null),
          why: z.string().min(1, "claim.why is required — it is what the player earns"),
        })
      )
      .min(2, "a discrepancy needs at least two claims"),
    observed: z
      .array(
        z.object({
          id: z.string().min(1, "observation.id is required"),
          text: z.string().min(1, "observation.text is required"),
          from: z.string().min(1).optional(),
          // Opaque token. Absent means always available; present means the host
          // decides, by passing ctx.holds.
          requires: z.string().min(1).nullable().default(null),
        })
      )
      .min(1, "a discrepancy needs something to check the record against"),
    closer: ClosingChoiceSchema,
  })
  .superRefine((activity, ctx) => {
    checkUniqueIds(activity.verdicts, ctx, "verdict", ["verdicts"]);
    checkUniqueIds(activity.gapKinds, ctx, "gap kind", ["gapKinds"]);
    checkUniqueIds(activity.claims, ctx, "claim", ["claims"]);
    checkUniqueIds(activity.observed, ctx, "observation", ["observed"]);

    const verdictIds = new Set(activity.verdicts.map((verdict) => verdict.id));
    const gapIds = new Set(activity.gapKinds.map((kind) => kind.id));

    if (!verdictIds.has(activity.gapRequiredFor)) {
      ctx.addIssue({
        code: "custom",
        path: ["gapRequiredFor"],
        message: `gapRequiredFor "${activity.gapRequiredFor}" is not one of the authored verdicts.`,
      });
    }

    activity.claims.forEach((claim, index) => {
      if (!verdictIds.has(claim.verdict)) {
        ctx.addIssue({
          code: "custom",
          path: ["claims", index, "verdict"],
          message: `Claim "${claim.id}" has unknown verdict "${claim.verdict}".`,
        });
      }
      const expectsGap = claim.verdict === activity.gapRequiredFor;
      if (expectsGap && !claim.gap) {
        ctx.addIssue({
          code: "custom",
          path: ["claims", index, "gap"],
          message: `Claim "${claim.id}" takes the verdict that requires a gap kind, but has none.`,
        });
      }
      if (!expectsGap && claim.gap) {
        ctx.addIssue({
          code: "custom",
          path: ["claims", index, "gap"],
          message: `Claim "${claim.id}" has a gap kind but a verdict that never asks for one — the player would never be shown it.`,
        });
      }
      if (claim.gap && !gapIds.has(claim.gap)) {
        ctx.addIssue({
          code: "custom",
          path: ["claims", index, "gap"],
          message: `Claim "${claim.id}" has unknown gap kind "${claim.gap}".`,
        });
      }
    });
  });

export function defaultDiscrepancyState() {
  return { verdicts: {}, gaps: {}, filed: null };
}

function needsGap(activity, claim) {
  return claim.verdict === activity.gapRequiredFor;
}

/**
 * Whether one claim is fully and correctly settled — the verdict, and the gap
 * kind if the verdict calls for one.
 *
 * @param {import("zod").infer<typeof DiscrepancyActivitySchema>} activity
 * @param {{ id: string, verdict: string, gap: string|null }} claim
 * @param {ReturnType<typeof defaultDiscrepancyState>} [state]
 */
export function claimStatus(activity, claim, state = defaultDiscrepancyState()) {
  const chosenVerdict = state.verdicts?.[claim.id] ?? null;
  const chosenGap = state.gaps?.[claim.id] ?? null;
  const verdictRight = chosenVerdict === claim.verdict;
  // The gap question only exists once the player has landed the verdict that
  // opens it — asking "error or design?" about a claim they think is supported
  // would give the verdict away.
  const gapOpen = verdictRight && needsGap(activity, claim);
  const gapRight = !gapOpen || chosenGap === claim.gap;
  return {
    chosenVerdict,
    chosenGap,
    answered: chosenVerdict !== null,
    verdictRight,
    gapOpen,
    gapRight,
    settled: verdictRight && gapRight,
  };
}

/**
 * @param {import("zod").infer<typeof DiscrepancyActivitySchema>} activity
 * @param {ReturnType<typeof defaultDiscrepancyState>} [state]
 */
export function discrepancySettled(activity, state = defaultDiscrepancyState()) {
  return activity.claims.every((claim) => claimStatus(activity, claim, state).settled);
}

/**
 * @param {import("zod").infer<typeof DiscrepancyActivitySchema>} activity
 * @param {ReturnType<typeof defaultDiscrepancyState>} [state]
 * @param {{ type: string, claim?: string, verdict?: string, gap?: string, option?: string }} action
 */
export function actDiscrepancy(activity, state = defaultDiscrepancyState(), action = { type: "" }) {
  if (action.type === "verdict") {
    const claim = activity.claims.find((item) => item.id === action.claim);
    const verdict = activity.verdicts.find((item) => item.id === action.verdict);
    if (!claim || !verdict) return state;
    const gaps = { ...state.gaps };
    // Changing the verdict abandons any gap kind chosen under the old one,
    // rather than leaving a stale answer to a question no longer on screen.
    delete gaps[claim.id];
    return { ...state, verdicts: { ...state.verdicts, [claim.id]: verdict.id }, gaps };
  }

  if (action.type === "gap") {
    const claim = activity.claims.find((item) => item.id === action.claim);
    const kind = activity.gapKinds.find((item) => item.id === action.gap);
    if (!claim || !kind) return state;
    if (!claimStatus(activity, claim, state).gapOpen) return state;
    return { ...state, gaps: { ...state.gaps, [claim.id]: kind.id } };
  }

  if (action.type === "file") {
    if (!discrepancySettled(activity, state)) return state;
    const option = activity.closer.options.find((item) => item.id === action.option);
    return option ? { ...state, filed: option.id } : state;
  }

  return state;
}

/**
 * @param {import("zod").infer<typeof DiscrepancyActivitySchema>} activity
 * @param {ReturnType<typeof defaultDiscrepancyState>} [state]
 * @param {{ holds?: string[] }} [ctx]
 */
export function renderDiscrepancy(activity, state = defaultDiscrepancyState(), ctx = {}) {
  const holds = new Set(ctx.holds || []);
  const settled = discrepancySettled(activity, state);

  const observations = activity.observed
    .map((item) => {
      const available = !item.requires || holds.has(item.requires);
      if (!available) {
        return `<li class="activity-observation is-missing"><span>You did not gather this.</span></li>`;
      }
      return `<li class="activity-observation">${escapeHtml(item.text)}${item.from ? `<cite>${escapeHtml(item.from)}</cite>` : ""}</li>`;
    })
    .join("");

  const claims = activity.claims
    .map((claim) => {
      const status = claimStatus(activity, claim, state);
      const verdictButtons = activity.verdicts
        .map((verdict) => {
          const chosen = status.chosenVerdict === verdict.id;
          const tone = chosen ? (status.verdictRight ? " is-correct" : " is-wrong") : "";
          return `<button type="button" class="activity-verdict${tone}" data-activity-action="verdict" data-claim="${escapeHtml(claim.id)}" data-verdict="${escapeHtml(verdict.id)}" aria-pressed="${chosen ? "true" : "false"}">${escapeHtml(verdict.label)}</button>`;
        })
        .join("");

      const gapBlock = status.gapOpen
        ? `<div class="activity-gap">
      <p>Is that gap an error, or a design?</p>
      <div class="activity-gap__options">${activity.gapKinds
        .map((kind) => {
          const chosen = status.chosenGap === kind.id;
          const tone = chosen ? (status.gapRight ? " is-correct" : " is-wrong") : "";
          return `<button type="button" class="activity-gap-kind${tone}" data-activity-action="gap" data-claim="${escapeHtml(claim.id)}" data-gap="${escapeHtml(kind.id)}" aria-pressed="${chosen ? "true" : "false"}">${escapeHtml(kind.label)}</button>`;
        })
        .join("")}</div>
    </div>`
        : "";

      const why = status.settled
        ? `<p class="activity-why is-correct">${escapeHtml(claim.why)}</p>`
        : "";

      return `<li class="activity-claim${status.settled ? " is-settled" : ""}">
    <blockquote>${escapeHtml(claim.text)}</blockquote>
    <div class="activity-claim__verdicts" role="group" aria-label="Verdict">${verdictButtons}</div>
    ${gapBlock}
    ${why}
  </li>`;
    })
    .join("");

  return `<section class="activity-board activity-board--discrepancy">
  <div class="activity-audit">
    <div class="activity-audit__record">
      <h3>${escapeHtml(activity.record.label)}</h3>
      <p class="activity-attribution">${escapeHtml(activity.record.attribution)}</p>
      <ol class="activity-claims">${claims}</ol>
    </div>
    <aside class="activity-audit__observed">
      <h3>What you saw</h3>
      <ul class="activity-observations">${observations}</ul>
    </aside>
  </div>
  ${renderCloser(activity.closer, state.filed, {
    locked: !settled,
    lockedNote: "Settle every line of the record before you file.",
  })}
</section>`;
}

/**
 * @param {import("zod").infer<typeof DiscrepancyActivitySchema>} activity
 * @param {ReturnType<typeof defaultDiscrepancyState>} [state]
 */
export function isDiscrepancyComplete(activity, state = defaultDiscrepancyState()) {
  return discrepancySettled(activity, state) && closerResult(activity.closer, state.filed).correct;
}

/**
 * @param {import("zod").infer<typeof DiscrepancyActivitySchema>} activity
 * @param {ReturnType<typeof defaultDiscrepancyState>} [state]
 */
export function discrepancyOutcome(activity, state = defaultDiscrepancyState()) {
  const findings = activity.claims
    .filter((claim) => claimStatus(activity, claim, state).settled)
    .map((claim) => ({ id: claim.id, text: claim.why, from: activity.record.attribution }));
  return {
    findings,
    skillOutcomes: closerSkillOutcomes(activity.id, activity.closer, state.filed),
  };
}
