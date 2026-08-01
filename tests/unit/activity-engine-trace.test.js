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
});
