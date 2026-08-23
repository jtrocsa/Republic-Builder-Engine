// The Field Notebook — the one piece of the mission rhythm all four engines share, and the only
// one whose whole job is to make the player give something up.
//
// Two rules are load-bearing enough to be worth stating before the assertions:
//
//   1. `capacity` caps what you KEEP, not what you GATHER. Both shipped interviews require every
//      useful answer on the map, and that stays right — walking past a witness should not be a
//      strategy. The judgement is what you do with a full hand afterwards.
//   2. An activity that declares no `notebook` keeps everything and offers no controls. That is
//      what makes this phase invisible to all six pre-Phase-72 activities, and it is asserted here
//      rather than assumed.
//
// The reducer's refusal contract (same object reference back) is tested directly, because the host
// dispatches on it: `if (next === entry.state) return;` in main.js's handleActivityAction().
import { describe, expect, it } from "vitest";
import {
  actNotebook,
  closerResult,
  notebookKept,
  renderCloser,
  renderNotebook,
} from "../../apps/web/src/engine/activities/contract.js";
import {
  actInterview,
  defaultInterviewState,
  interviewFindings,
  isInterviewComplete,
} from "../../apps/web/src/engine/activities/interview.js";

const FINDINGS = [
  { id: "f1", text: "The elder was consulted first.", from: "Elder" },
  { id: "f2", text: "The garden is worked ground.", from: "Gardener" },
  { id: "f3", text: "Bells for bread, and no shared price.", from: "Sailor" },
];

const capped = (capacity = 2) => ({ notebook: { capacity } });
const uncapped = () => ({});

describe("a notebook nobody declared", () => {
  it("keeps everything the mission surfaced (normal case)", () => {
    expect(notebookKept(uncapped(), {}, FINDINGS)).toEqual(FINDINGS);
  });

  it("refuses both verbs, by reference, so the host does not re-render", () => {
    const state = { filed: null };
    expect(actNotebook(uncapped(), state, { type: "keep", finding: "f1" }, FINDINGS)).toBe(state);
    expect(actNotebook(uncapped(), state, { type: "release", finding: "f1" }, FINDINGS)).toBe(
      state
    );
  });

  it("renders a review with no controls on it", () => {
    const markup = renderNotebook(uncapped(), {}, FINDINGS);
    expect(markup).toContain("Field Notebook");
    expect(markup).toContain("The garden is worked ground.");
    expect(markup).not.toContain('data-activity-action="keep"');
    expect(markup).not.toContain('data-activity-action="release"');
  });
});

describe("keeping and releasing", () => {
  it("keeps in the order the player chose (normal case)", () => {
    let state = { notebook: { kept: [] } };
    state = actNotebook(capped(), state, { type: "keep", finding: "f3" }, FINDINGS);
    state = actNotebook(capped(), state, { type: "keep", finding: "f1" }, FINDINGS);
    expect(state.notebook.kept).toEqual(["f3", "f1"]);
    expect(notebookKept(capped(), state, FINDINGS).map((f) => f.id)).toEqual(["f3", "f1"]);
  });

  it("refuses a finding the mission has not surfaced", () => {
    const state = { notebook: { kept: [] } };
    // Otherwise the closer screen becomes a way to fill the notebook with evidence never earned.
    expect(actNotebook(capped(), state, { type: "keep", finding: "nope" }, FINDINGS)).toBe(state);
  });

  it("refuses a duplicate", () => {
    const state = { notebook: { kept: ["f1"] } };
    expect(actNotebook(capped(), state, { type: "keep", finding: "f1" }, FINDINGS)).toBe(state);
  });

  it("refuses a keep into a full notebook rather than evicting silently (edge case)", () => {
    const state = { notebook: { kept: ["f1", "f2"] } };
    // Choosing what to drop is the entire point of the cap, so it has to be a move the player makes.
    expect(actNotebook(capped(2), state, { type: "keep", finding: "f3" }, FINDINGS)).toBe(state);
  });

  it("releases, and releasing makes room", () => {
    let state = { notebook: { kept: ["f1", "f2"] } };
    state = actNotebook(capped(2), state, { type: "release", finding: "f1" }, FINDINGS);
    expect(state.notebook.kept).toEqual(["f2"]);
    state = actNotebook(capped(2), state, { type: "keep", finding: "f3" }, FINDINGS);
    expect(state.notebook.kept).toEqual(["f2", "f3"]);
  });

  it("refuses to release something not held", () => {
    const state = { notebook: { kept: ["f1"] } };
    expect(actNotebook(capped(), state, { type: "release", finding: "f2" }, FINDINGS)).toBe(state);
  });

  it("survives a save written before the field existed (edge case)", () => {
    // ensureSourceActivity() never rewrites an existing state object, so every reader of
    // `notebook` has to tolerate its absence. This is the migration.
    const legacy = { asked: {}, logged: {}, filed: null };
    expect(notebookKept(capped(), legacy, FINDINGS)).toEqual([]);
    const next = actNotebook(capped(), legacy, { type: "keep", finding: "f1" }, FINDINGS);
    expect(next.notebook.kept).toEqual(["f1"]);
    expect(legacy.notebook).toBeUndefined();
  });

  it("drops a kept entry the mission stopped surfacing, without forgetting it (edge case)", () => {
    // A DISCREPANCY player can change a verdict and un-settle a claim they had already kept. The
    // notebook shows what is actually held; the id stays in state, so re-settling restores it.
    const state = { notebook: { kept: ["f1", "f2"] } };
    const withoutF1 = FINDINGS.filter((finding) => finding.id !== "f1");
    expect(notebookKept(capped(), state, withoutF1).map((f) => f.id)).toEqual(["f2"]);
    expect(notebookKept(capped(), state, FINDINGS).map((f) => f.id)).toEqual(["f1", "f2"]);
  });
});

describe("the notebook panel", () => {
  it("counts against capacity and offers the right control per entry (normal case)", () => {
    const markup = renderNotebook(capped(2), { notebook: { kept: ["f1"] } }, FINDINGS);
    expect(markup).toContain("1 of 2");
    expect(markup).toContain('data-activity-action="release" data-finding="f1"');
    expect(markup).toContain('data-activity-action="keep" data-finding="f2"');
  });

  it("disables keeping once full, and says why (edge case)", () => {
    const markup = renderNotebook(capped(2), { notebook: { kept: ["f1", "f2"] } }, FINDINGS);
    expect(markup).toContain("Your Field Notebook is full");
    expect(markup).toMatch(/data-finding="f3"[^>]*disabled/);
  });

  it("says nothing about a limit before the limit binds", () => {
    const markup = renderNotebook(capped(2), { notebook: { kept: ["f1"] } }, FINDINGS);
    expect(markup).not.toContain("is full");
  });

  it("has an empty state, and content can word it", () => {
    expect(renderNotebook(uncapped(), {}, [])).toContain("Nothing yet");
    const authored = { notebook: { capacity: 2, emptyNote: "Nobody has told you anything yet." } };
    expect(renderNotebook(authored, {}, [])).toContain("Nobody has told you anything yet.");
  });

  // P8-1. Release was the fifth door into an un-filed record, and the one this panel owns.
  it("goes read-only once the record is filed, and says so (regression case)", () => {
    const state = { notebook: { kept: ["f1"] } };
    const markup = renderNotebook(capped(2), state, FINDINGS, { settled: true });
    expect(markup).toContain("This record is filed.");
    expect(markup).toMatch(/data-activity-action="release" data-finding="f1"[^>]*disabled/);
    expect(markup).toMatch(/data-activity-action="keep" data-finding="f2"[^>]*disabled/);
    expect(markup).toContain('class="evidence-notebook is-settled"');
  });

  it("says the record is filed instead of the capacity note, when both would apply", () => {
    const full = { notebook: { kept: ["f1", "f2"] } };
    expect(renderNotebook(capped(2), full, FINDINGS, { settled: true })).not.toContain("is full");
    expect(renderNotebook(capped(2), full, FINDINGS)).toContain("is full");
  });

  it("defaults to live, so every pre-Phase-90G call site renders unchanged", () => {
    const state = { notebook: { kept: ["f1"] } };
    expect(renderNotebook(capped(2), state, FINDINGS)).toBe(
      renderNotebook(capped(2), state, FINDINGS, { settled: false })
    );
  });
});

describe("a conclusion measured against its evidence", () => {
  const closer = {
    prompt: "What does the record support?",
    options: [
      {
        id: "purpose",
        text: "What its sponsors needed established",
        correct: true,
        why: "Right.",
        requiresEvidence: ["f1", "f3"],
        unsupportedNote: "Neither account you kept establishes what they knew before arriving.",
      },
      { id: "island", text: "What was on the island", correct: false, why: "No." },
    ],
  };

  it("is supported when the notebook carries what the conclusion names (normal case)", () => {
    const result = closerResult(closer, "purpose", [{ id: "f1" }, { id: "f3" }]);
    expect(result).toMatchObject({ filed: true, correct: true, supported: true });
  });

  it("is correct but unsupported when the evidence is missing", () => {
    // The whole point: landing the defensible conclusion by elimination is not the same as being
    // able to argue it.
    const result = closerResult(closer, "purpose", [{ id: "f2" }]);
    expect(result).toMatchObject({ correct: true, supported: false });
  });

  it("fails closed when no notebook is passed at all (edge case)", () => {
    expect(closerResult(closer, "purpose").supported).toBe(false);
  });

  it("treats an option naming no evidence as supported, which is every shipped option", () => {
    expect(closerResult(closer, "island", []).supported).toBe(true);
  });

  it("is not supported when nothing is filed", () => {
    expect(closerResult(closer, null, [{ id: "f1" }])).toMatchObject({
      filed: false,
      supported: false,
    });
  });

  it("shows the unsupported note instead of the why, in its own tone", () => {
    const markup = renderCloser(closer, "purpose", { kept: [{ id: "f2" }] });
    expect(markup).toContain("Neither account you kept establishes");
    expect(markup).toContain("is-unsupported");
    expect(markup).not.toContain("activity-why is-correct");
  });

  // Spine Review Part 7. `file` overwrites `state.filed` unconditionally once a board is settled,
  // so a player who reopened a finished mission from the Mission Tracker could un-finish it in one
  // click — while the Codex, which deliberately never unfiles, kept the entry. renderCloser() works
  // this out with no help from the host: every engine's isComplete() is <board settled> && correct
  // && supported, and `locked` is that first term negated.
  it("closes the closer once the filed conclusion is correct and supported", () => {
    const markup = renderCloser(closer, "purpose", { kept: [{ id: "f1" }, { id: "f3" }] });
    expect(markup).toContain("is-settled");
    // Every option, including the one that was filed — this is a record, not a re-run.
    expect(markup.match(/class="activity-option[^"]*"[^>]*disabled/g)).toHaveLength(2);
    // And it still reads as the conclusion that was filed.
    expect(markup).toContain("activity-option is-correct");
  });

  it("stays live for a wrong conclusion and for an unsupported one", () => {
    // Both are states the player is meant to be able to change, so neither closes.
    const wrong = renderCloser(closer, "island", { kept: [] });
    expect(wrong).not.toContain("is-settled");
    expect(wrong).not.toContain("disabled");
    const unsupported = renderCloser(closer, "purpose", { kept: [{ id: "f2" }] });
    expect(unsupported).not.toContain("is-settled");
    expect(unsupported).not.toContain("disabled");
  });

  it("leaves a locked closer locked rather than settled (edge case)", () => {
    // `locked` means the board below is unfinished, so nothing has been filed and nothing can be.
    const markup = renderCloser(closer, null, { locked: true, lockedNote: "Not yet." });
    expect(markup).toContain("is-locked");
    expect(markup).not.toContain("is-settled");
  });

  it("falls back to a placeless note when content authored none (edge case)", () => {
    const bare = {
      prompt: "P",
      options: [
        { id: "a", text: "A", correct: true, why: "y", requiresEvidence: ["f1"] },
        { id: "b", text: "B", correct: false, why: "n" },
      ],
    };
    expect(renderCloser(bare, "a", { kept: [] })).toContain("nothing you kept in your Field");
  });
});

describe("an engine wired to the notebook", () => {
  const activity = () => ({
    kind: "interview",
    id: "test-interview",
    title: "T",
    intro: "I",
    briefing: null,
    notebook: { capacity: 1 },
    questions: [
      { id: "grows", label: "What grows here?" },
      { id: "gold", label: "Where is the gold?" },
    ],
    speakers: [
      {
        id: "elder",
        name: "Elder",
        fallback: "She says nothing.",
        answers: { grows: { text: "Cassava, and maize after it.", useful: true } },
      },
      {
        id: "sailor",
        name: "Sailor",
        fallback: "He shrugs.",
        answers: { gold: { text: "Bells for bread.", useful: true } },
      },
    ],
    requires: { useful: 2 },
    closer: {
      prompt: "P",
      options: [
        {
          id: "asked",
          text: "It records what was asked",
          correct: true,
          why: "Right.",
          requiresEvidence: ["elder:grows"],
        },
        { id: "there", text: "It records what was there", correct: false, why: "No." },
      ],
    },
  });

  const gathered = () => {
    let state = defaultInterviewState();
    [
      ["elder", "grows"],
      ["sailor", "gold"],
    ].forEach(([speaker, question]) => {
      state = actInterview(activity(), state, { type: "ask", speaker, question });
      state = actInterview(activity(), state, { type: "log", speaker, question });
    });
    return state;
  };

  it("surfaces every logged useful answer as a finding (normal case)", () => {
    expect(interviewFindings(activity(), gathered()).map((f) => f.id)).toEqual([
      "elder:grows",
      "sailor:gold",
    ]);
  });

  it("routes keep through the engine's own reducer", () => {
    const state = actInterview(activity(), gathered(), {
      type: "keep",
      finding: "sailor:gold",
    });
    expect(state.notebook.kept).toEqual(["sailor:gold"]);
  });

  it("withholds completion for the right conclusion argued from the wrong evidence", () => {
    let state = actInterview(activity(), gathered(), { type: "keep", finding: "sailor:gold" });
    state = actInterview(activity(), state, { type: "file", option: "asked" });
    expect(state.filed).toBe("asked");
    // Filed, correct, and not finished — the player has to go back and change what they kept.
    expect(isInterviewComplete(activity(), state)).toBe(false);

    state = actInterview(activity(), state, { type: "release", finding: "sailor:gold" });
    state = actInterview(activity(), state, { type: "keep", finding: "elder:grows" });
    expect(isInterviewComplete(activity(), state)).toBe(true);
  });

  // P8-1, and the one the Spine Review found first: releasing what a filed conclusion names
  // un-supports it, so `isComplete` goes false on a record fileToCodex() has already written and
  // deliberately never unfiles. The board would then read unfinished and the Archive filed.
  it("refuses to release the evidence a filed conclusion rests on (regression case)", () => {
    const a = activity();
    let state = actInterview(a, gathered(), { type: "keep", finding: "elder:grows" });
    state = actInterview(a, state, { type: "file", option: "asked" });
    expect(isInterviewComplete(a, state)).toBe(true);

    expect(actInterview(a, state, { type: "release", finding: "elder:grows" })).toBe(state);
    expect(isInterviewComplete(a, state)).toBe(true);
  });

  // The exemption, and it is the reason this engine's guard is not the blanket one the other three
  // got. `ask`/`log` are drawn out on the map in the field dialogue bubble, live whatever the
  // mission's state; freezing them would leave four dead question chips on every stranger. Neither
  // can un-complete anything — both only ever add, and coverage counts `logged`.
  it("keeps asking and logging live out on the map after the record is filed", () => {
    const a = activity();
    let state = actInterview(a, gathered(), { type: "keep", finding: "elder:grows" });
    state = actInterview(a, state, { type: "file", option: "asked" });
    expect(isInterviewComplete(a, state)).toBe(true);

    const asked = actInterview(a, state, { type: "ask", speaker: "elder", question: "gold" });
    expect(asked).not.toBe(state);
    expect(asked.asked.elder).toContain("gold");
    expect(isInterviewComplete(a, asked)).toBe(true);
  });
});
