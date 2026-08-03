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

    const nodeIds = new Set(activity.nodes.map((node) => node.id));
    const effectIds = new Set(activity.effects.map((effect) => effect.id));

    activity.legs.forEach((leg, index) => {
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
  return { ledger: {}, filed: null, notebook: { kept: [] } };
}

/**
 * @param {import("zod").infer<typeof TraceActivitySchema>} activity
 * @param {{ id: string, effect: string }} leg
 * @param {ReturnType<typeof defaultTraceState>} [state]
 */
export function legStatus(activity, leg, state = defaultTraceState()) {
  const chosen = state.ledger?.[leg.id] ?? null;
  return { chosen, answered: chosen !== null, correct: chosen === leg.effect };
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
 * @param {{ type: string, leg?: string, effect?: string, option?: string }} action
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
          const tone = chosen ? (status.correct ? " is-correct" : " is-wrong") : "";
          return `<button type="button" class="activity-effect${tone}" data-activity-action="log" data-leg="${escapeHtml(leg.id)}" data-effect="${escapeHtml(effect.id)}" aria-pressed="${chosen ? "true" : "false"}">${escapeHtml(effect.label)}</button>`;
        })
        .join("");
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
 * legs whose correct answer is that the record does not reach that far.
 *
 * @param {import("zod").infer<typeof TraceActivitySchema>} activity
 * @param {ReturnType<typeof defaultTraceState>} [state]
 */
export function traceFindings(activity, state = defaultTraceState()) {
  return activity.legs
    .filter((leg) => legStatus(activity, leg, state).correct)
    .map((leg) => ({ id: leg.id, text: leg.why, from: leg.actor }));
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
