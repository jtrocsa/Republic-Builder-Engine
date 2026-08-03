// TRACE — the player follows one thing through a chain of nodes and logs what
// changes at each step.
//
// The mechanic, with the subject stripped off: an ordered chain of legs, each
// with an author-declared `transforms` (what changes here) and `actor` (who
// acts here), and one ledger question per leg that the player answers. The
// chain is validated as an actual chain — every leg begins where the last one
// ended — because a trace whose links don't join isn't a trace, it's a table.
//
// The effect list is content, and it is expected to include an option meaning
// "the evidence does not establish this." Choosing that one correctly is the
// scored move: what separates following a thing from assuming where it went is
// knowing which legs the record actually covers.
//
// No content ships against this engine in Unit 1 — the Caribbean map runs
// INTERVIEW, ASSEMBLY and DISCREPANCY. It was built ahead of any content
// because the four contracts were specified together and the registry's shape
// is only proven by more than one member.
//
// Its first mission is Riverbend's wharf ledger ("One Hogshead",
// content/activities/unit-02-activities.js), as of Phase 70. This comment used
// to name Canal Crossroads, which the owner reassigned — see decision log 0053
// §2. Unit 4 keeps its own trace for whenever that map is authored.
//
// Transfers as: a supply chain or migration (geography), a circulatory or water
// cycle (biology), an algorithm's state (computing).
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

export const TraceActivitySchema = z
  .object({
    ...COMMON_ACTIVITY_FIELDS,
    kind: z.literal("trace"),
    // The one thing being followed. A trace with two subjects is two traces.
    subject: z.object({
      label: z.string().min(1, "subject.label is required"),
      note: z.string().min(1).optional(),
    }),
    nodes: z
      .array(
        z.object({
          id: z.string().min(1, "node.id is required"),
          label: z.string().min(1, "node.label is required"),
          note: z.string().min(1).optional(),
        })
      )
      .min(2, "a trace needs at least two nodes"),
    effects: z
      .array(
        z.object({
          id: z.string().min(1, "effect.id is required"),
          label: z.string().min(1, "effect.label is required"),
          note: z.string().min(1).optional(),
        })
      )
      .min(2, "a trace needs at least two effects to choose between"),
    /**
     * The second axis: how far this record carries the answer the player just gave.
     *
     * Optional, and its absence is the pre-Phase-76 trace — one question per leg, with "the record
     * does not show this" sitting in the `effects` list as one answer among the others.
     *
     * That shape had a flaw the first shipped trace demonstrated. With "not shown" as an *effect*,
     * a chain needs exactly one leg keyed to it or the idea goes untaught — and a player who
     * notices that is no longer weighing evidence, they are spotting the odd one out. Declaring
     * `supportLevels` moves the judgement onto *every* leg: what happens here, and can this page
     * prove it. Those are different questions, and conflating them is the misconception the
     * activity exists to correct.
     */
    supportLevels: z
      .array(
        z.object({
          id: z.string().min(1, "supportLevel.id is required"),
          label: z.string().min(1, "supportLevel.label is required"),
          note: z.string().min(1).optional(),
        })
      )
      .min(2, "a support axis with one level is not a judgement")
      .optional(),
    // The second question, in the words of whoever authored the record. The engine's default is
    // deliberately placeless; a mission that knows it is holding a wharf book can say so.
    supportPrompt: z.string().min(1).optional(),
    legs: z
      .array(
        z.object({
          id: z.string().min(1, "leg.id is required"),
          from: z.string().min(1, "leg.from is required"),
          to: z.string().min(1, "leg.to is required"),
          label: z.string().min(1, "leg.label is required"),
          transforms: z.string().min(1, "leg.transforms is required — what changes on this leg"),
          actor: z.string().min(1, "leg.actor is required — whose hands it passes through"),
          // The ledger question's answer.
          effect: z.string().min(1, "leg.effect is required"),
          // The support question's answer. Required on every leg once the activity declares
          // `supportLevels`, checked below — a half-graded chain is worse than an ungraded one.
          support: z.string().min(1).optional(),
          why: z.string().min(1, "leg.why is required — it is what the player earns"),
        })
      )
      .min(1, "a trace needs at least one leg"),
    closer: ClosingChoiceSchema,
  })
  .superRefine((activity, ctx) => {
    checkUniqueIds(activity.nodes, ctx, "node", ["nodes"]);
    checkUniqueIds(activity.effects, ctx, "effect", ["effects"]);
    checkUniqueIds(activity.legs, ctx, "leg", ["legs"]);
    if (activity.supportLevels)
      checkUniqueIds(activity.supportLevels, ctx, "support level", ["supportLevels"]);

    const nodeIds = new Set(activity.nodes.map((node) => node.id));
    const effectIds = new Set(activity.effects.map((effect) => effect.id));
    const supportIds = new Set((activity.supportLevels || []).map((level) => level.id));

    activity.legs.forEach((leg, index) => {
      if (activity.supportLevels) {
        if (!leg.support) {
          ctx.addIssue({
            code: "custom",
            path: ["legs", index, "support"],
            message: `Leg "${leg.id}" has no support level, but this trace asks the support question — every leg has to answer it.`,
          });
        } else if (!supportIds.has(leg.support)) {
          ctx.addIssue({
            code: "custom",
            path: ["legs", index, "support"],
            message: `Leg "${leg.id}" has unknown support level "${leg.support}".`,
          });
        }
      } else if (leg.support) {
        ctx.addIssue({
          code: "custom",
          path: ["legs", index, "support"],
          message: `Leg "${leg.id}" declares a support level but the activity declares no supportLevels to choose from.`,
        });
      }
      if (!nodeIds.has(leg.from)) {
        ctx.addIssue({
          code: "custom",
          path: ["legs", index, "from"],
          message: `Leg "${leg.id}" starts at unknown node "${leg.from}".`,
        });
      }
      if (!nodeIds.has(leg.to)) {
        ctx.addIssue({
          code: "custom",
          path: ["legs", index, "to"],
          message: `Leg "${leg.id}" ends at unknown node "${leg.to}".`,
        });
      }
      if (!effectIds.has(leg.effect)) {
        ctx.addIssue({
          code: "custom",
          path: ["legs", index, "effect"],
          message: `Leg "${leg.id}" has unknown effect "${leg.effect}".`,
        });
      }
      // The chain invariant. Without it a "trace" is a set of disconnected
      // hops, and the player has no thing to follow.
      const previous = activity.legs[index - 1];
      if (previous && previous.to !== leg.from) {
        ctx.addIssue({
          code: "custom",
          path: ["legs", index, "from"],
          message: `Leg "${leg.id}" begins at "${leg.from}" but the previous leg ended at "${previous.to}" — a trace has to join up.`,
        });
      }
    });
  });

export function defaultTraceState() {
  return { ledger: {}, support: {}, filed: null, notebook: { kept: [] } };
}

/**
 * Where this leg stands on both questions.
 *
 * `correct` is what everything downstream reads, and it is deliberately the conjunction: a leg is
 * not logged until the player has said what happens *and* how far the record carries it. A trace
 * with no `supportLevels` never asks the second question, so `supportRight` is vacuously true and
 * the whole thing behaves exactly as it did before Phase 76.
 *
 * `state.support` is read defensively — `ensureSourceActivity()` never rewrites an existing state
 * object, so a save written before this field existed arrives without it.
 *
 * @param {import("zod").infer<typeof TraceActivitySchema>} activity
 * @param {{ id: string, effect: string, support?: string }} leg
 * @param {ReturnType<typeof defaultTraceState>} [state]
 */
export function legStatus(activity, leg, state = defaultTraceState()) {
  const chosen = state.ledger?.[leg.id] ?? null;
  const effectRight = chosen === leg.effect;
  const asksSupport = !!activity.supportLevels;
  const supportChosen = state.support?.[leg.id] ?? null;
  const supportRight = !asksSupport || supportChosen === leg.support;
  return {
    chosen,
    answered: chosen !== null,
    effectRight,
    asksSupport,
    supportChosen,
    supportAnswered: supportChosen !== null,
    supportRight,
    correct: effectRight && supportRight,
  };
}

/**
 * @param {import("zod").infer<typeof TraceActivitySchema>} activity
 * @param {ReturnType<typeof defaultTraceState>} [state]
 */
export function traceLogged(activity, state = defaultTraceState()) {
  return activity.legs.every((leg) => legStatus(activity, leg, state).correct);
}

/**
 * @param {import("zod").infer<typeof TraceActivitySchema>} activity
 * @param {ReturnType<typeof defaultTraceState>} [state]
 * @param {{ type: string, leg?: string, effect?: string, support?: string, option?: string }} action
 */
export function actTrace(activity, state = defaultTraceState(), action = { type: "" }) {
  const notebook = actNotebook(activity, state, action, traceFindings(activity, state));
  if (notebook !== state) return notebook;

  if (action.type === "log") {
    const leg = activity.legs.find((item) => item.id === action.leg);
    const effect = activity.effects.find((item) => item.id === action.effect);
    if (!leg || !effect) return state;
    return { ...state, ledger: { ...state.ledger, [leg.id]: effect.id } };
  }
  if (action.type === "support") {
    const leg = activity.legs.find((item) => item.id === action.leg);
    const level = (activity.supportLevels || []).find((item) => item.id === action.support);
    if (!leg || !level) return state;
    // Refused until the leg's first question is right, matching the render: asking how far the
    // record carries an answer the player has not settled on is asking about nothing.
    if (!legStatus(activity, leg, state).effectRight) return state;
    return { ...state, support: { ...state.support, [leg.id]: level.id } };
  }
  if (action.type === "file") {
    if (!traceLogged(activity, state)) return state;
    const option = activity.closer.options.find((item) => item.id === action.option);
    return option ? { ...state, filed: option.id } : state;
  }
  return state;
}

/**
 * @param {import("zod").infer<typeof TraceActivitySchema>} activity
 * @param {ReturnType<typeof defaultTraceState>} [state]
 */
export function renderTrace(activity, state = defaultTraceState()) {
  const nodeLabel = (id) => activity.nodes.find((node) => node.id === id)?.label || id;
  const logged = traceLogged(activity, state);

  const legs = activity.legs
    .map((leg, index) => {
      const status = legStatus(activity, leg, state);
      const options = activity.effects
        .map((effect) => {
          const chosen = status.chosen === effect.id;
          const tone = chosen ? (status.effectRight ? " is-correct" : " is-wrong") : "";
          return `<button type="button" class="activity-effect${tone}" data-activity-action="log" data-leg="${escapeHtml(leg.id)}" data-effect="${escapeHtml(effect.id)}" aria-pressed="${chosen ? "true" : "false"}">${escapeHtml(effect.label)}</button>`;
        })
        .join("");
      // The second question, and it only appears once the first is right. Two reasons: asking how
      // far a record carries an answer the player has not settled on is asking about nothing, and
      // nine buttons on one card is a form rather than a judgement.
      const support =
        status.asksSupport && status.effectRight
          ? `<div class="activity-leg__support" role="group" aria-label="Support for leg ${index + 1}">
      <p class="activity-leg__ask">${escapeHtml(activity.supportPrompt || "How far does this record carry that?")}</p>
      ${activity.supportLevels
        .map((level) => {
          const chosen = status.supportChosen === level.id;
          const tone = chosen ? (status.supportRight ? " is-correct" : " is-wrong") : "";
          return `<button type="button" class="activity-support${tone}" data-activity-action="support" data-leg="${escapeHtml(leg.id)}" data-support="${escapeHtml(level.id)}" aria-pressed="${chosen ? "true" : "false"}">${escapeHtml(level.label)}</button>`;
        })
        .join("")}
    </div>`
          : "";
      return `<li class="activity-leg${status.correct ? " is-logged" : ""}">
    <div class="activity-leg__route">
      <span class="activity-leg__node">${escapeHtml(nodeLabel(leg.from))}</span>
      <span class="activity-leg__arrow" aria-hidden="true">→</span>
      <span class="activity-leg__node">${escapeHtml(nodeLabel(leg.to))}</span>
    </div>
    <h4>${escapeHtml(leg.label)}</h4>
    <dl class="activity-leg__facts">
      <dt>What changes</dt><dd>${escapeHtml(leg.transforms)}</dd>
      <dt>Whose hands</dt><dd>${escapeHtml(leg.actor)}</dd>
    </dl>
    <div class="activity-leg__ledger" role="group" aria-label="Ledger entry for leg ${index + 1}">${options}</div>
    ${support}
    ${status.correct ? `<p class="activity-why is-correct">${escapeHtml(leg.why)}</p>` : ""}
  </li>`;
    })
    .join("");

  return `<section class="activity-board activity-board--trace">
  <div class="activity-subject">
    <h3>${escapeHtml(activity.subject.label)}</h3>
    ${activity.subject.note ? `<p class="activity-note">${escapeHtml(activity.subject.note)}</p>` : ""}
  </div>
  <ol class="activity-legs">${legs}</ol>
  ${renderNotebook(activity, state, traceFindings(activity, state))}
  ${renderCloser(activity.closer, state.filed, {
    locked: !logged,
    lockedNote:
      activity.lockedNote ||
      "Account for every leg before you file — including the ones this record does not support.",
    kept: notebookKept(activity, state, traceFindings(activity, state)),
  })}
</section>`;
}

/**
 * What the trace has surfaced: one entry per leg the player has entered correctly, including the
 * legs whose answer the record does not reach far enough to carry.
 *
 * The text is the *entry the player made*, not the paragraph explaining why it was right. That
 * paragraph is `leg.why`, it is on the board from the moment the leg lands, and it stays there —
 * whereas a finding is carried into the Field Notebook and, once filed, into the Codex, where four
 * of them made a record three times the height of any other engine's (decision log `0058`). A
 * notebook entry is a note. What the player concluded is the note; the argument is on the board.
 *
 * @param {import("zod").infer<typeof TraceActivitySchema>} activity
 * @param {ReturnType<typeof defaultTraceState>} [state]
 */
export function traceFindings(activity, state = defaultTraceState()) {
  return activity.legs
    .filter((leg) => legStatus(activity, leg, state).correct)
    .map((leg) => {
      const effect = activity.effects.find((item) => item.id === leg.effect);
      const level = (activity.supportLevels || []).find((item) => item.id === leg.support);
      const entry = [leg.label, effect?.label].filter(Boolean).join(" — ");
      return {
        id: leg.id,
        text: level ? `${entry} (${level.label})` : entry,
        from: leg.actor,
      };
    });
}

/**
 * @param {import("zod").infer<typeof TraceActivitySchema>} activity
 * @param {ReturnType<typeof defaultTraceState>} [state]
 */
export function isTraceComplete(activity, state = defaultTraceState()) {
  const kept = notebookKept(activity, state, traceFindings(activity, state));
  const result = closerResult(activity.closer, state.filed, kept);
  return traceLogged(activity, state) && result.correct && result.supported;
}

/**
 * @param {import("zod").infer<typeof TraceActivitySchema>} activity
 * @param {ReturnType<typeof defaultTraceState>} [state]
 */
export function traceOutcome(activity, state = defaultTraceState()) {
  const findings = traceFindings(activity, state);
  return {
    findings,
    evidence: notebookKept(activity, state, findings),
    skillOutcomes: closerSkillOutcomes(activity.id, activity.closer, state.filed),
  };
}
