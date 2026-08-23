// TRACE's one structural invariant is that its legs actually join up — a trace
// whose links don't meet is a table with arrows drawn on it. That is enforced
// in the schema and pinned here.
//
// No content ships against this engine yet (Unit 1's Caribbean map runs
// INTERVIEW, ASSEMBLY and DISCREPANCY; TRACE's first mission is Canal
// Crossroads), so these tests are the only thing exercising it. They cover the
// renderer as well as the reducer for that reason.
import { describe, expect, it } from "vitest";
import {
  TraceActivitySchema,
  actTrace,
  defaultTraceState,
  isTraceComplete,
  legStatus,
  renderTrace,
  traceLogged,
  traceOutcome,
} from "../../apps/web/src/engine/activities/trace.js";

const activity = () => ({
  kind: "trace",
  id: "test-trace",
  title: "One barrel",
  intro: "Follow it.",
  subject: { label: "A barrel of flour", note: "Milled on the second of April." },
  nodes: [
    { id: "mill", label: "The mill" },
    { id: "wharf", label: "The wharf" },
    { id: "city", label: "The city" },
  ],
  effects: [
    { id: "feeds", label: "Feeds someone" },
    { id: "enriches", label: "Enriches someone" },
    { id: "cannot", label: "Cannot establish" },
  ],
  legs: [
    {
      id: "leg-1",
      from: "mill",
      to: "wharf",
      label: "Down the race road",
      transforms: "A toll is charged by weight.",
      actor: "The collector",
      effect: "enriches",
      why: "The toll is the first time the barrel makes anyone money.",
    },
    {
      id: "leg-2",
      from: "wharf",
      to: "city",
      label: "Downriver",
      transforms: "The barrel is re-marked for a new buyer.",
      actor: "A factor whose name is not recorded",
      effect: "cannot",
      why: "The manifest stops at the wharf; who ate it is not in the record.",
    },
  ],
  closer: {
    prompt: "File it.",
    skillCategory: "causation",
    options: [
      { id: "partial", text: "The record covers part of the route", correct: true, why: "Right." },
      {
        id: "whole",
        text: "The record covers the whole route",
        correct: false,
        why: "It stops early.",
      },
    ],
  },
});

const logged = () => {
  const a = activity();
  let state = defaultTraceState();
  state = actTrace(a, state, { type: "log", leg: "leg-1", effect: "enriches" });
  state = actTrace(a, state, { type: "log", leg: "leg-2", effect: "cannot" });
  return state;
};

describe("TraceActivitySchema", () => {
  it("accepts a well-formed chain (normal case)", () => {
    expect(TraceActivitySchema.safeParse(activity()).success).toBe(true);
  });

  it("rejects a chain whose legs do not join up (regression case)", () => {
    // Without this a "trace" is a set of disconnected hops and the player has
    // no single thing to follow.
    const broken = activity();
    broken.legs[1].from = "mill";
    const result = TraceActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("has to join up"))).toBe(true);
  });

  it("rejects a leg through a node that does not exist (edge case)", () => {
    const broken = activity();
    broken.legs[0].to = "nowhere";
    const result = TraceActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes('unknown node "nowhere"'))).toBe(
      true
    );
  });

  it("rejects a leg whose answer is not one of the effects (edge case)", () => {
    const broken = activity();
    broken.legs[0].effect = "vanishes";
    const result = TraceActivitySchema.safeParse(broken);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes('unknown effect "vanishes"'))).toBe(
      true
    );
  });
});

describe("actTrace / traceLogged / isTraceComplete", () => {
  it("logs an effect against a leg (normal case)", () => {
    const state = actTrace(activity(), defaultTraceState(), {
      type: "log",
      leg: "leg-1",
      effect: "enriches",
    });
    expect(state.ledger["leg-1"]).toBe("enriches");
    expect(legStatus(activity(), activity().legs[0], state).correct).toBe(true);
  });

  it("counts a wrong entry as logged-but-not-correct (boundary case)", () => {
    const state = actTrace(activity(), defaultTraceState(), {
      type: "log",
      leg: "leg-1",
      effect: "feeds",
    });
    const status = legStatus(activity(), activity().legs[0], state);
    expect(status.answered).toBe(true);
    expect(status.correct).toBe(false);
    expect(traceLogged(activity(), state)).toBe(false);
  });

  it("ignores an unknown leg or effect (edge case)", () => {
    const before = defaultTraceState();
    expect(actTrace(activity(), before, { type: "log", leg: "ghost", effect: "feeds" })).toBe(
      before
    );
    expect(actTrace(activity(), before, { type: "log", leg: "leg-1", effect: "ghost" })).toBe(
      before
    );
  });

  it("refuses to file until every leg is logged, then completes (boundary case)", () => {
    expect(
      actTrace(activity(), defaultTraceState(), { type: "file", option: "partial" }).filed
    ).toBe(null);
    const state = actTrace(activity(), logged(), { type: "file", option: "partial" });
    expect(isTraceComplete(activity(), state)).toBe(true);
    expect(traceOutcome(activity(), state).skillOutcomes).toEqual([
      { key: "test-trace", skillCategory: "causation", correct: true },
    ]);
  });

  // Spine Review Part 7. A filed record does not get re-filed. `file` used to overwrite
  // `state.filed` unconditionally once the board was settled, so reopening a finished mission from
  // the Mission Tracker and clicking a wrong option un-finished it — while the Codex, which
  // deliberately never unfiles, kept the entry it had already written.
  it("refuses a second conclusion once the record is filed (regression case)", () => {
    const board = logged();
    // The wrong option lands while the record is open, which is what makes the refusal below a
    // refusal rather than an unknown id being dropped on the floor.
    expect(actTrace(activity(), board, { type: "file", option: "whole" }).filed).toBe("whole");

    const filed = actTrace(activity(), board, { type: "file", option: "partial" });
    expect(isTraceComplete(activity(), filed)).toBe(true);
    // Identity, not merely equality: the host re-renders only when a reducer returns a new object.
    expect(actTrace(activity(), filed, { type: "file", option: "whole" })).toBe(filed);
  });

  // P8-1. Closing the closer left the ledger open, and re-logging one leg wrong un-does a filed
  // chain — isTraceComplete() goes false on a record the Codex never unfiles.
  it("refuses every board verb once the record is filed (regression case)", () => {
    const a = activity();
    const filed = actTrace(a, logged(), { type: "file", option: "partial" });
    expect(isTraceComplete(a, filed)).toBe(true);

    // The verb lands while the record is open, so the refusal below is a refusal.
    const reLogged = actTrace(a, logged(), { type: "log", leg: "leg-1", effect: "cannot" });
    expect(reLogged.ledger["leg-1"]).toBe("cannot");

    expect(actTrace(a, filed, { type: "log", leg: "leg-1", effect: "cannot" })).toBe(filed);
    expect(isTraceComplete(a, filed)).toBe(true);
  });
});

// The second axis (Phase 76). A trace that declares `supportLevels` asks every leg twice: what
// happens here, and how far this record carries it. The activity above declares none, and every
// test in this file that predates the axis still passes unchanged — which is the contract.
const supported = () => {
  const a = activity();
  a.supportLevels = [
    { id: "states", label: "The record states it" },
    { id: "infer", label: "Reasonable, not stated" },
    { id: "not-shown", label: "Not shown here" },
  ];
  a.legs[0].support = "states";
  a.legs[1].support = "not-shown";
  return a;
};

const bothAnswered = () => {
  const a = supported();
  let state = defaultTraceState();
  state = actTrace(a, state, { type: "log", leg: "leg-1", effect: "enriches" });
  state = actTrace(a, state, { type: "support", leg: "leg-1", support: "states" });
  state = actTrace(a, state, { type: "log", leg: "leg-2", effect: "cannot" });
  state = actTrace(a, state, { type: "support", leg: "leg-2", support: "not-shown" });
  return state;
};

describe("TRACE's support axis", () => {
  it("requires a support level on every leg once the activity declares them (edge case)", () => {
    const half = supported();
    delete half.legs[1].support;
    const result = TraceActivitySchema.safeParse(half);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("every leg has to answer it"))).toBe(
      true
    );
  });

  it("rejects a support level nothing declares (edge case)", () => {
    const orphan = activity();
    orphan.legs[0].support = "states";
    const result = TraceActivitySchema.safeParse(orphan);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.message.includes("no supportLevels"))).toBe(true);
  });

  it("does not log a leg on the right effect alone (boundary case)", () => {
    // The whole point of splitting the axis: saying what happens is half the job.
    const state = actTrace(supported(), defaultTraceState(), {
      type: "log",
      leg: "leg-1",
      effect: "enriches",
    });
    const status = legStatus(supported(), supported().legs[0], state);
    expect(status.effectRight).toBe(true);
    expect(status.correct).toBe(false);
    expect(traceLogged(supported(), state)).toBe(false);
  });

  it("refuses the support verb until the effect is right (boundary case)", () => {
    const a = supported();
    const wrong = actTrace(a, defaultTraceState(), { type: "log", leg: "leg-1", effect: "feeds" });
    // Asking how far a record carries an answer the player has not settled on is asking about
    // nothing, and the renderer does not draw the control — the reducer refuses it too.
    expect(actTrace(a, wrong, { type: "support", leg: "leg-1", support: "states" })).toBe(wrong);
  });

  it("completes only when both questions land on every leg (normal case)", () => {
    const a = supported();
    const state = actTrace(a, bothAnswered(), { type: "file", option: "partial" });
    expect(traceLogged(a, state)).toBe(true);
    expect(isTraceComplete(a, state)).toBe(true);
  });

  it("reads a save written before the axis existed as unanswered (regression case)", () => {
    // ensureSourceActivity() never rewrites an existing state object, so a pre-Phase-76 save
    // arrives with a full `ledger` and no `support` at all. It must reopen the second question,
    // not throw and not count as finished.
    const a = supported();
    const old = { ledger: { "leg-1": "enriches", "leg-2": "cannot" }, filed: "partial" };
    expect(() => legStatus(a, a.legs[0], old)).not.toThrow();
    expect(legStatus(a, a.legs[0], old).supportAnswered).toBe(false);
    expect(traceLogged(a, old)).toBe(false);
    expect(isTraceComplete(a, old)).toBe(false);
  });

  it("names the entry the player made, not the paragraph explaining it (normal case)", () => {
    // A finding is carried into the Field Notebook and then into the Codex. `leg.why` is on the
    // board and stays there; four of them made a filed Codex record three times the height of any
    // other engine's (decision log 0058).
    const findings = traceOutcome(supported(), bothAnswered()).findings;
    expect(findings[0].text).toBe("Down the race road — Enriches someone (The record states it)");
    expect(findings[1].text).toBe("Downriver — Cannot establish (Not shown here)");
    expect(findings[0].text).not.toContain("The toll is the first time");
  });
});

describe("renderTrace", () => {
  it("draws each leg between its named nodes (normal case)", () => {
    const markup = renderTrace(activity(), defaultTraceState());
    expect(markup).toContain("The mill");
    expect(markup).toContain("The wharf");
    expect(markup).toContain("A toll is charged by weight.");
  });

  it("withholds a leg's `why` until it is logged correctly (normal case)", () => {
    expect(renderTrace(activity(), defaultTraceState())).not.toContain(
      "The manifest stops at the wharf"
    );
    expect(renderTrace(activity(), logged())).toContain("The manifest stops at the wharf");
  });

  it("offers the cannot-establish effect on every leg (normal case)", () => {
    // Choosing it correctly is the scored move — the point of the engine is
    // knowing which legs the record actually covers.
    const markup = renderTrace(activity(), defaultTraceState());
    expect((markup.match(/data-effect="cannot"/g) || []).length).toBe(2);
  });

  it("opens the support question only on a leg whose effect is right (normal case)", () => {
    const a = supported();
    expect(renderTrace(a, defaultTraceState())).not.toContain('data-activity-action="support"');
    const wrong = actTrace(a, defaultTraceState(), { type: "log", leg: "leg-1", effect: "feeds" });
    expect(renderTrace(a, wrong)).not.toContain('data-activity-action="support"');
    const right = actTrace(a, defaultTraceState(), {
      type: "log",
      leg: "leg-1",
      effect: "enriches",
    });
    const markup = renderTrace(a, right);
    // One leg's worth of controls, not both — the second leg's effect is still unanswered.
    expect((markup.match(/data-activity-action="support"/g) || []).length).toBe(3);
  });

  it("draws no support control at all for a trace that declares none (regression case)", () => {
    expect(renderTrace(activity(), logged())).not.toContain("activity-leg__support");
  });
});
