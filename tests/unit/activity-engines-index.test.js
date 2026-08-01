// The registry contract. These four keys are also main.js's screen ids and the
// strings content puts in a source's `activityRoute`, so an engine that half-
// implements the contract fails at the point a student opens a record, not at
// build time. This test is what makes that a unit failure instead.
import { describe, expect, it } from "vitest";
import {
  ACTIVITY_ENGINES,
  ACTIVITY_ENGINE_KEYS,
  ActivityMapSchema,
  actOnActivity,
  activityOutcome,
  defaultActivityState,
  isActivityComplete,
  isActivityEngine,
  renderActivity,
  renderActivityInline,
} from "../../apps/web/src/engine/activities/index.js";

const REQUIRED = ["schema", "defaultState", "render", "act", "isComplete", "outcome"];

// A minimal but valid activity per engine, used to prove the wrappers dispatch
// rather than to re-test each engine's own rules.
const SAMPLES = {
  interview: {
    kind: "interview",
    id: "s-interview",
    title: "T",
    intro: "I",
    briefing: null,
    questions: [
      { id: "q1", label: "Q1" },
      { id: "q2", label: "Q2" },
    ],
    speakers: [
      { id: "a", name: "A", fallback: "…", answers: { q1: { text: "yes", useful: true } } },
      { id: "b", name: "B", fallback: "…", answers: {} },
    ],
    requires: { questions: 1, speakers: 1 },
    closer: {
      prompt: "P",
      options: [
        { id: "ok", text: "OK", correct: true, why: "y" },
        { id: "no", text: "No", correct: false, why: "n" },
      ],
    },
  },
  assembly: {
    kind: "assembly",
    id: "s-assembly",
    title: "T",
    intro: "I",
    boards: [
      {
        id: "b",
        kind: "label",
        label: "B",
        columns: 1,
        rows: 1,
        slots: [
          { id: "s1", label: "S1" },
          { id: "s2", label: "S2" },
        ],
        fragments: [
          { id: "f1", label: "F1", belongs: "s1", misread: "m" },
          { id: "f2", label: "F2", belongs: "s2", misread: "m" },
        ],
      },
    ],
    closer: {
      prompt: "P",
      options: [
        { id: "ok", text: "OK", correct: true, why: "y" },
        { id: "no", text: "No", correct: false, why: "n" },
      ],
    },
  },
  discrepancy: {
    kind: "discrepancy",
    id: "s-discrepancy",
    title: "T",
    intro: "I",
    record: { label: "R", attribution: "A" },
    verdicts: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    gapRequiredFor: "no",
    gapKinds: [
      { id: "error", label: "Error" },
      { id: "design", label: "Design" },
    ],
    claims: [
      { id: "c1", text: "C1", verdict: "yes", gap: null, why: "w" },
      { id: "c2", text: "C2", verdict: "no", gap: "design", why: "w" },
    ],
    observed: [{ id: "o1", text: "O1", requires: null }],
    closer: {
      prompt: "P",
      options: [
        { id: "ok", text: "OK", correct: true, why: "y" },
        { id: "no", text: "No", correct: false, why: "n" },
      ],
    },
  },
  trace: {
    kind: "trace",
    id: "s-trace",
    title: "T",
    intro: "I",
    subject: { label: "S" },
    nodes: [
      { id: "n1", label: "N1" },
      { id: "n2", label: "N2" },
    ],
    effects: [
      { id: "e1", label: "E1" },
      { id: "e2", label: "E2" },
    ],
    legs: [
      {
        id: "l1",
        from: "n1",
        to: "n2",
        label: "L1",
        transforms: "t",
        actor: "a",
        effect: "e1",
        why: "w",
      },
    ],
    closer: {
      prompt: "P",
      options: [
        { id: "ok", text: "OK", correct: true, why: "y" },
        { id: "no", text: "No", correct: false, why: "n" },
      ],
    },
  },
};

describe("ACTIVITY_ENGINES — the contract every engine owes", () => {
  it("registers exactly the four engines the screens and content route to (normal case)", () => {
    expect(ACTIVITY_ENGINE_KEYS).toEqual(["interview", "assembly", "discrepancy", "trace"]);
  });

  it.each(ACTIVITY_ENGINE_KEYS)("%s implements every required slot (normal case)", (kind) => {
    REQUIRED.forEach((slot) => {
      expect(typeof ACTIVITY_ENGINES[kind][slot], `${kind}.${slot}`).not.toBe("undefined");
    });
    expect(typeof ACTIVITY_ENGINES[kind].schema.safeParse).toBe("function");
  });

  it("implements renderInline only where an engine runs on the map (boundary case)", () => {
    // The one optional slot. INTERVIEW puts its questions to people standing on
    // the field map; the other three are entirely screen-hosted.
    const inline = ACTIVITY_ENGINE_KEYS.filter((kind) => ACTIVITY_ENGINES[kind].renderInline);
    expect(inline).toEqual(["interview"]);
  });

  it.each(ACTIVITY_ENGINE_KEYS)("%s round-trips through the wrappers (normal case)", (kind) => {
    const activity = SAMPLES[kind];
    expect(ACTIVITY_ENGINES[kind].schema.safeParse(activity).success).toBe(true);
    const state = defaultActivityState(kind);
    expect(renderActivity(kind, activity, state)).toContain("activity-board");
    expect(isActivityComplete(kind, activity, state)).toBe(false);
    expect(activityOutcome(kind, activity, state)).toMatchObject({
      findings: expect.any(Array),
      skillOutcomes: expect.any(Array),
    });
    // An unrecognised action must be inert rather than throwing — the host
    // dispatches whatever a data-activity-action attribute says.
    expect(actOnActivity(kind, activity, state, { type: "nonsense" })).toBe(state);
  });
});

describe("lookup", () => {
  it("answers whether a string names an engine, for the screen router (normal case)", () => {
    expect(isActivityEngine("assembly")).toBe(true);
    expect(isActivityEngine("map-jigsaw")).toBe(false);
    expect(isActivityEngine(undefined)).toBe(false);
  });

  it("throws for an unknown engine, naming the ones that exist (edge case)", () => {
    expect(() => renderActivity("puzzle", {}, {})).toThrow(
      /Unknown activity engine "puzzle" — known engines: interview, assembly, discrepancy, trace/
    );
  });

  it("returns empty markup rather than throwing for an engine with no inline view (boundary case)", () => {
    // Lets the field renderer call it for every NPC without branching on kind.
    expect(renderActivityInline("assembly", SAMPLES.assembly, {}, "anyone")).toBe("");
  });
});

describe("ActivityMapSchema", () => {
  it("validates a whole unit's activity module (normal case)", () => {
    const result = ActivityMapSchema.safeParse({
      "source-one": SAMPLES.interview,
      "source-two": SAMPLES.assembly,
    });
    expect(result.success).toBe(true);
  });

  it("reports a bad entry under its own source id (regression case)", () => {
    // Hand-dispatched rather than z.discriminatedUnion (which rejects the
    // engines' .superRefine) or z.union (which would report four sets of
    // failures for one typo). The path is what makes a validator message
    // actionable.
    const broken = structuredClone(SAMPLES.trace);
    broken.legs[0].to = "nowhere";
    const result = ActivityMapSchema.safeParse({ "source-three": broken });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path.slice(0, 2)).toEqual(["source-three", "legs"]);
  });

  it("rejects an activity whose kind names no engine (edge case)", () => {
    const result = ActivityMapSchema.safeParse({ "source-four": { kind: "jigsaw" } });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("known engines");
  });
});
