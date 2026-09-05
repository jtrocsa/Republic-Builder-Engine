// Minimal activity-engine lookup — the same small shape as
// quest-types/index.js, and deliberately not a plugin-discovery system.
// Adding a fifth engine is one more entry here; nothing else changes.
//
// The difference from quest-types/: a quest type is a rubric-graded question
// rendered into a shared quest container. An activity engine is a playable
// interaction with a board of its own, hosted on its own screen (and, for
// INTERVIEW, partly inside the field dialogue bubble). Both take content as a
// parameter; neither knows any history.
//
// This registry is what replaced three hand-written activity screens that were
// each welded to a single source id — mapJigsawScreen() opened, literally, with
// sourceById("waldseemuller-map"). See docs/decision-log/0051.
import { z } from "zod";
import {
  assemblySummary,
  AssemblyActivitySchema,
  actAssembly,
  assemblyOutcome,
  defaultAssemblyState,
  isAssemblyComplete,
  renderAssembly,
} from "./assembly.js";
import {
  discrepancySummary,
  DiscrepancyActivitySchema,
  actDiscrepancy,
  defaultDiscrepancyState,
  discrepancyOutcome,
  isDiscrepancyComplete,
  renderDiscrepancy,
} from "./discrepancy.js";
import {
  InterviewActivitySchema,
  actInterview,
  defaultInterviewState,
  interviewHasAsked,
  interviewOutcome,
  interviewSummary,
  isInterviewComplete,
  renderInterview,
  renderInterviewInline,
} from "./interview.js";

export { interviewHasAsked };
import {
  traceSummary,
  TraceActivitySchema,
  actTrace,
  defaultTraceState,
  isTraceComplete,
  renderTrace,
  traceOutcome,
} from "./trace.js";

// Key naming note: these four keys are also the screen ids in main.js's
// VALID_SCREENS and the strings content puts in a source's `activityRoute`, so
// a rename here is a save-compatibility change, not a refactor.
//
// renderInline and summary are the two optional contract slots.
//
// Only INTERVIEW implements renderInline, because only INTERVIEW runs part of
// itself out on the map, in the field dialogue bubble, rather than entirely on
// its own screen.
//
// `summary` is how a panel outside the activity says how far along it is in one
// line. All four declare it as of Phase 109, and the two consumers are the
// field's Mission Tracker and the activity screen's own objective line.
//
// Only INTERVIEW did until then, which left the tracker blank on seventeen of
// the twenty-four missions and would have left the objective line blank there
// too — and that line is what the copy column's folded reference blocks are
// paid for with. This comment used to argue TRACE out of one, "a chain, not a
// count"; true of what a trace means, and beside the point of a player wanting
// to know how many legs are still open.
export const ACTIVITY_ENGINES = {
  interview: {
    schema: InterviewActivitySchema,
    defaultState: defaultInterviewState,
    render: renderInterview,
    renderInline: renderInterviewInline,
    summary: interviewSummary,
    act: actInterview,
    isComplete: isInterviewComplete,
    outcome: interviewOutcome,
  },
  assembly: {
    summary: assemblySummary,
    schema: AssemblyActivitySchema,
    defaultState: defaultAssemblyState,
    render: renderAssembly,
    act: actAssembly,
    isComplete: isAssemblyComplete,
    outcome: assemblyOutcome,
  },
  discrepancy: {
    summary: discrepancySummary,
    schema: DiscrepancyActivitySchema,
    defaultState: defaultDiscrepancyState,
    render: renderDiscrepancy,
    act: actDiscrepancy,
    isComplete: isDiscrepancyComplete,
    outcome: discrepancyOutcome,
  },
  trace: {
    summary: traceSummary,
    schema: TraceActivitySchema,
    defaultState: defaultTraceState,
    render: renderTrace,
    act: actTrace,
    isComplete: isTraceComplete,
    outcome: traceOutcome,
  },
};

export const ACTIVITY_ENGINE_KEYS = Object.keys(ACTIVITY_ENGINES);

export function isActivityEngine(kind) {
  return Object.prototype.hasOwnProperty.call(ACTIVITY_ENGINES, kind);
}

function requireEngine(kind) {
  const engine = ACTIVITY_ENGINES[kind];
  if (!engine) {
    throw new Error(
      `Unknown activity engine "${kind}" — known engines: ${ACTIVITY_ENGINE_KEYS.join(", ")}`
    );
  }
  return engine;
}

export function defaultActivityState(kind) {
  return requireEngine(kind).defaultState();
}

export function renderActivity(kind, activity, state, ctx) {
  return requireEngine(kind).render(activity, state, ctx);
}

/**
 * The optional contract slot — returns "" rather than throwing for an engine
 * that doesn't run on the map, so the field renderer can call it for every NPC
 * without branching on the engine kind itself.
 */
export function renderActivityInline(kind, activity, state, actorId) {
  const inline = requireEngine(kind).renderInline;
  return inline ? inline(activity, state, actorId) : "";
}

/**
 * The other optional slot — `{ label, done, total }` for a one-line progress
 * readout, or null for an engine that doesn't have one.
 */
export function activitySummary(kind, activity, state) {
  const summary = requireEngine(kind).summary;
  return summary ? summary(activity, state) : null;
}

export function actOnActivity(kind, activity, state, action) {
  return requireEngine(kind).act(activity, state, action);
}

export function isActivityComplete(kind, activity, state) {
  return requireEngine(kind).isComplete(activity, state);
}

export function activityOutcome(kind, activity, state) {
  return requireEngine(kind).outcome(activity, state);
}

/**
 * A whole unit's activity module: source id -> activity content.
 *
 * Dispatched by hand rather than through z.discriminatedUnion, for two reasons.
 * The engine schemas carry .superRefine(), which the discriminated-union
 * helper does not accept; and a plain z.union() would report four sets of
 * failures for one typo. This walks each entry, picks the schema by `kind`, and
 * re-paths that engine's own issues under the source id, so a validator prints
 * the one real problem.
 */
export const ActivityMapSchema = z
  .record(z.string(), z.unknown())
  .superRefine((activities, ctx) => {
    Object.entries(activities).forEach(([sourceId, activity]) => {
      const kind = activity && typeof activity === "object" ? activity.kind : undefined;
      if (!isActivityEngine(kind)) {
        ctx.addIssue({
          code: "custom",
          path: [sourceId, "kind"],
          message: `Activity for source "${sourceId}" has kind "${kind}" — known engines: ${ACTIVITY_ENGINE_KEYS.join(", ")}.`,
        });
        return;
      }
      const result = ACTIVITY_ENGINES[kind].schema.safeParse(activity);
      if (result.success) return;
      result.error.issues.forEach((issue) => {
        ctx.addIssue({ ...issue, path: [sourceId, ...(issue.path || [])] });
      });
    });
  });
