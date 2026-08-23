// DISCREPANCY — the player checks an authoritative record against what they can
// actually observe, then explains the difference wherever the evidence permits it.
//
// The mechanic, with the subject stripped off: a list of claims, a list of
// observations, a verdict per claim, and — for claims the record does not simply
// support — a second question about *why* they differ. The second question is the
// whole engine. Anyone can notice that a document is wrong; the move worth
// teaching is telling a mistake apart from a choice, and telling both apart from
// not yet knowing which it was.
//
// Both lists are content, deliberately. A verdict set of "supported by the
// evidence / complicated by the evidence / contradicted by the evidence / not
// enough evidence" is a claim about how history is argued, and an engine that
// hard-coded it would be making that claim on every subject's behalf.
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
  COMMON_ACTIVITY_FIELDS,
  ClosingChoiceSchema,
  actNotebook,
  checkUniqueIds,
  closerResult,
  closerSkillOutcomes,
  escapeHtml,
  notebookKept,
  renderCloser,
  renderNotebook,
} from "./contract.js";

const LabelledSchema = z.object({
  id: z.string().min(1, "id is required"),
  label: z.string().min(1, "label is required"),
  note: z.string().min(1).optional(),
});

export const DiscrepancyActivitySchema = z
  .object({
    ...COMMON_ACTIVITY_FIELDS,
    kind: z.literal("discrepancy"),
    record: z.object({
      label: z.string().min(1, "record.label is required"),
      attribution: z.string().min(1, "record.attribution is required"),
      // Who made this, for whom, and why — the situation the claims come out of.
      // Optional, but an audit without it hands a player five sentences from a
      // stranger: the first playtest of this engine reported not knowing who
      // Columbus was in the scene or what he was doing there.
      context: z.string().min(1).optional(),
      // The passage itself, in paragraphs, shown before it is broken into
      // claims. Reading the whole thing first is the move being taught.
      text: z.array(z.string().min(1)).min(1).optional(),
    }),
    // The verdicts are content, not an enum, because what counts as a verdict
    // differs by subject — "supported / complicated / contradicted / not enough
    // evidence" here, "matches / overstated / not itemised" in an accounts audit.
    verdicts: z.array(LabelledSchema).min(2, "a discrepancy needs at least two verdicts"),
    // The standing instruction above the claim list: what the player is being
    // asked to compare against what. Three bare verdict buttons do not say
    // "against your own observations" — content has to.
    verdictPrompt: z.string().min(1).optional(),
    // Which verdict means "this failed, now say why". Naming it in content is
    // what keeps the engine from having to know that "contradicted" is special.
    //
    // A list, or one id for the common case. More than one verdict can want the second question:
    // once "complicated by the evidence" exists beside "contradicted by the evidence", both are
    // claims the record does not simply support, and both are worth asking why about. A bare
    // string stays valid and means a list of one, so shipped content parses unchanged.
    gapRequiredFor: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
    // The second question, in the words of the subject asking it.
    //
    // This was `<p>Is that gap an error, or a design?</p>` in the renderer — an engine that had
    // already handed `gapKinds` to content and then hard-coded two of their labels back into its
    // own prose. An audit whose kinds are "mistake / different perspective / not enough evidence
    // to determine why" was being asked a question about none of them.
    gapPrompt: z.string().min(1).optional(),
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

    gapVerdicts(activity).forEach((verdictId, index) => {
      if (verdictIds.has(verdictId)) return;
      ctx.addIssue({
        code: "custom",
        path: Array.isArray(activity.gapRequiredFor)
          ? ["gapRequiredFor", index]
          : ["gapRequiredFor"],
        message: `gapRequiredFor "${verdictId}" is not one of the authored verdicts.`,
      });
    });

    activity.claims.forEach((claim, index) => {
      if (!verdictIds.has(claim.verdict)) {
        ctx.addIssue({
          code: "custom",
          path: ["claims", index, "verdict"],
          message: `Claim "${claim.id}" has unknown verdict "${claim.verdict}".`,
        });
      }
      const expectsGap = needsGap(activity, claim);
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
  return { verdicts: {}, gaps: {}, filed: null, notebook: { kept: [] } };
}

/**
 * The verdicts that open the second question, always as a list.
 *
 * Function declaration rather than a const so the schema's own `.superRefine()` above can call it
 * — both are evaluated at module load, and only a declaration is hoisted that far.
 */
function gapVerdicts(activity) {
  const required = activity.gapRequiredFor;
  return Array.isArray(required) ? required : required ? [required] : [];
}

function needsGap(activity, claim) {
  return gapVerdicts(activity).includes(claim.verdict);
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
  // opens it — asking why a claim differs from the evidence, about a claim the
  // player has just called supported, would give the verdict away.
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
  // A filed record is a finished record, and no verb on this board takes it back.
  //
  // Phase 90F stopped the closer accepting a second conclusion (decision log 0084). It was one door
  // of five: changing a verdict un-settles the record and `release` un-supports the conclusion, and
  // either makes isDiscrepancyComplete() false again on something fileToCodex() has already written
  // and deliberately never unfiles.
  //
  // Above the notebook delegation on purpose, since `release` is handled in there.
  if (isDiscrepancyComplete(activity, state)) return state;

  const notebook = actNotebook(activity, state, action, discrepancyFindings(activity, state));
  if (notebook !== state) return notebook;

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
    // Guarded here rather than only in the UI: the closer's disabled attribute is a hint, not a
    // lock, and a filed-too-early record would read as complete. (Re-filing is refused at the top.)
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
  // Filed and finished, which is a different thing from `settled` above: that one asks whether the
  // record is answered, this one whether it is closed. The reducer refuses every verb in this state,
  // so the controls below say so rather than looking live and doing nothing.
  const filed = isDiscrepancyComplete(activity, state);

  const available = activity.observed.filter((item) => !item.requires || holds.has(item.requires));
  const observations = activity.observed
    .map((item) => {
      if (!available.includes(item)) {
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
          return `<button type="button" class="activity-verdict${tone}" data-activity-action="verdict" data-claim="${escapeHtml(claim.id)}" data-verdict="${escapeHtml(verdict.id)}" aria-pressed="${chosen ? "true" : "false"}"${filed ? " disabled" : ""}>${escapeHtml(verdict.label)}</button>`;
        })
        .join("");

      const gapBlock = status.gapOpen
        ? `<div class="activity-gap">
      <p>${escapeHtml(activity.gapPrompt || "Why does the record differ from what you gathered?")}</p>
      <div class="activity-gap__options">${activity.gapKinds
        .map((kind) => {
          const chosen = status.chosenGap === kind.id;
          const tone = chosen ? (status.gapRight ? " is-correct" : " is-wrong") : "";
          return `<button type="button" class="activity-gap-kind${tone}" data-activity-action="gap" data-claim="${escapeHtml(claim.id)}" data-gap="${escapeHtml(kind.id)}" aria-pressed="${chosen ? "true" : "false"}"${filed ? " disabled" : ""}>${escapeHtml(kind.label)}</button>`;
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

  const transcript = activity.record.text
    ? `<div class="activity-transcript">${activity.record.text
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("")}</div>`
    : "";

  return `<section class="activity-board activity-board--discrepancy">
  <div class="activity-audit">
    <div class="activity-audit__record">
      <h3>${escapeHtml(activity.record.label)}</h3>
      <p class="activity-attribution">${escapeHtml(activity.record.attribution)}</p>
      ${activity.record.context ? `<p class="activity-record-context">${escapeHtml(activity.record.context)}</p>` : ""}
      ${transcript}
      ${activity.verdictPrompt ? `<p class="activity-verdict-prompt">${escapeHtml(activity.verdictPrompt)}</p>` : ""}
      <ol class="activity-claims">${claims}</ol>
    </div>
    <aside class="activity-audit__observed">
      <h3>Evidence available to you <em>${available.length} of ${activity.observed.length}</em></h3>
      <ul class="activity-observations">${observations}</ul>
    </aside>
  </div>
  ${renderNotebook(activity, state, discrepancyFindings(activity, state), { settled: filed })}
  ${renderCloser(activity.closer, state.filed, {
    locked: !settled,
    lockedNote: activity.lockedNote || "Settle every line of the record before you file.",
    kept: notebookKept(activity, state, discrepancyFindings(activity, state)),
  })}
</section>`;
}

/**
 * What the audit has surfaced: one entry per claim the player has settled, both verdict and — where
 * the verdict called for one — the reason the record differs.
 *
 * @param {import("zod").infer<typeof DiscrepancyActivitySchema>} activity
 * @param {ReturnType<typeof defaultDiscrepancyState>} [state]
 */
export function discrepancyFindings(activity, state = defaultDiscrepancyState()) {
  return activity.claims
    .filter((claim) => claimStatus(activity, claim, state).settled)
    .map((claim) => ({ id: claim.id, text: claim.why, from: activity.record.attribution }));
}

/**
 * @param {import("zod").infer<typeof DiscrepancyActivitySchema>} activity
 * @param {ReturnType<typeof defaultDiscrepancyState>} [state]
 */
export function isDiscrepancyComplete(activity, state = defaultDiscrepancyState()) {
  const kept = notebookKept(activity, state, discrepancyFindings(activity, state));
  const result = closerResult(activity.closer, state.filed, kept);
  return discrepancySettled(activity, state) && result.correct && result.supported;
}

/**
 * @param {import("zod").infer<typeof DiscrepancyActivitySchema>} activity
 * @param {ReturnType<typeof defaultDiscrepancyState>} [state]
 */
export function discrepancyOutcome(activity, state = defaultDiscrepancyState()) {
  const findings = discrepancyFindings(activity, state);
  return {
    findings,
    evidence: notebookKept(activity, state, findings),
    skillOutcomes: closerSkillOutcomes(activity.id, activity.closer, state.filed),
  };
}
