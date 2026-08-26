// The read-only render mode — one contract slot, six implementations, and the reason all six are
// checked here rather than in each type's own file: the thing that can go wrong is not one
// renderer's markup, it is the six disagreeing about what "read-only" means.
//
// It exists because a finished mission's answer was in `progress.questResponses` and shown nowhere
// — Spine Review Part 10, P10-4, decision log `0089` §2 — and re-rendering that quest *editable*
// would be worse than showing nothing: grading recomputes on every render, so an edited answer
// flips "complete" back to a hint while `completedCases` keeps the case archived.
//
// Three claims, and the third is the one worth having:
//
//   1. **Nothing in a read-only quest can take input.** Every radio and select disabled, every
//      textarea readonly, every drag source draggable="false", every move button disabled.
//   2. **The answer survives the mode.** A locked form that shows nothing back is the bug this
//      closes, wearing different clothes.
//   3. **The default render is untouched.** A renderer that emitted `disabled` unconditionally
//      would lock the live form on every screen in the game, and every other test in the suite
//      would still pass — they all render the default and none of them asserts the absence of an
//      attribute nobody had thought of yet.

import { describe, it, expect } from "vitest";
import { renderQuest } from "../../apps/web/src/quest-types/index.js";

function parse(html) {
  const host = document.createElement("div");
  host.innerHTML = html;
  return host;
}

const mcq = {
  id: "read-only-mcq",
  prompt: "Which reading of the toll receipt is best supported?",
  choices: ["Wheat moved east", "Wheat moved west", "Nothing moved"],
  answer: 0,
  explanation: "Eastbound tonnage dominates the ledger.",
};

const sequencing = {
  id: "read-only-sequencing",
  prompt: "Arrange the Bank War in the order in which each step made the next possible.",
  items: [
    { id: "veto", label: "Jackson vetoes recharter", position: 1 },
    { id: "recharter", label: "Clay forces an early recharter bill", position: 0 },
    { id: "removal", label: "Deposits are removed to the pet banks", position: 2 },
  ],
  reflectionPrompt: "Which step mattered most, and why?",
};

const evidence = {
  id: "read-only-evidence",
  prompt: "File each record under the claim it supports.",
  slots: [
    { id: "labor", label: "Labor" },
    { id: "trade", label: "Trade" },
  ],
  sources: [
    {
      id: "src-a",
      label: "Indenture contract",
      attribution: "Virginia, 1623",
      excerpt: "…to serve for the term of seven years…",
      correctSlotId: "labor",
      skillCategory: "Sourcing",
    },
    {
      id: "src-b",
      label: "Customs entry",
      attribution: "Bristol, 1631",
      excerpt: "…forty hogsheads of tobacco…",
      correctSlotId: "trade",
      skillCategory: "Sourcing",
    },
  ],
  reflectionPrompt: "What does the pair together show?",
  rubric: { pointsTotal: 2, description: "One point per correctly filed record." },
};

const hipp = {
  id: "read-only-hipp",
  prompt: "Analyze this record's sourcing.",
  document: { text: "We do hereby require…", attribution: "A requisition officer, 1863" },
  hippPrompts: [
    {
      id: "purpose",
      dimension: "Purpose",
      argument: "Why was this written?",
      options: [
        { id: "p1", text: "To compel delivery", correct: true },
        { id: "p2", text: "To record a sale", correct: false },
      ],
    },
  ],
};

const saq = {
  id: "read-only-saq",
  stimulus: "A sample stimulus.",
  prompts: ["A. Identify one.", "B. Explain one.", "C. Explain another."],
  rubric: "1 point per part.",
};

const dbq = {
  id: "read-only-dbq",
  prompt: "Evaluate the extent to which a sample development changed a sample era.",
  documents: [1, 2, 3, 4].map((n) => ({
    id: `doc-${n}`,
    label: `Document ${n}`,
    attribution: `Creator ${n}`,
    date: "1776",
    excerpt: `Excerpt ${n}.`,
  })),
  rubric: "7 points total.",
};

// One row per quest type, each carrying a *completed* answer — the state this mode is only ever
// rendered from — plus the fragment of that answer the record has to still show.
const CASES = [
  {
    type: "mcq",
    quest: mcq,
    state: { selected: 0 },
    shows: (root) => root.querySelector('input[value="0"]').checked,
  },
  {
    type: "sequencing",
    quest: sequencing,
    state: { order: ["recharter", "veto", "removal"], reflection: "The veto set the terms." },
    shows: (root) =>
      Array.from(root.querySelectorAll("li.sequence-item")).map(
        (li) => li.dataset.sequenceItem
      )[0] === "recharter" && root.querySelector("textarea").value === "The veto set the terms.",
  },
  {
    type: "evidence-organizing",
    quest: evidence,
    state: {
      placements: { "src-a": "labor", "src-b": "trade" },
      reflection: "Both describe the same economy from two ends.",
    },
    shows: (root) =>
      root.querySelector('[data-evidence-select="src-a"]').value === "labor" &&
      root.querySelectorAll("[data-evidence-slot-filled]").length === 2,
  },
  {
    type: "hipp",
    quest: hipp,
    state: { selected: { purpose: "p1" } },
    shows: (root) => root.querySelector('input[value="p1"]').checked,
  },
  {
    type: "saq",
    quest: saq,
    state: { responses: { 0: "Answer a.", 1: "Answer b.", 2: "Answer c." } },
    shows: (root) => root.querySelectorAll("textarea")[1].value === "Answer b.",
  },
  {
    type: "dbq",
    quest: dbq,
    state: { response: "d".repeat(400) },
    shows: (root) => root.querySelector("textarea").value.length === 400,
  },
];

describe("read-only quest rendering", () => {
  CASES.forEach(({ type, quest, state, shows }) => {
    describe(type, () => {
      it("flags the quest root, so the host's mutators have something to refuse off", () => {
        const root = parse(renderQuest(type, quest, state, { readOnly: true })).firstElementChild;
        expect(root.dataset.questReadonly).toBe("true");
        expect(root.classList.contains("quest--read-only")).toBe(true);
      });

      it("leaves no control that can change the answer", () => {
        const root = parse(renderQuest(type, quest, state, { readOnly: true }));
        root.querySelectorAll("input, select, button").forEach((el) => {
          expect(el.disabled, `${type}: <${el.tagName.toLowerCase()}> is still live`).toBe(true);
        });
        root.querySelectorAll("textarea").forEach((el) => {
          // readonly rather than disabled — see quest-types/shared/html.js. A disabled textarea
          // greys its own text out, and showing that text back is the entire point.
          expect(el.readOnly, `${type}: <textarea> is still editable`).toBe(true);
          expect(el.disabled, `${type}: <textarea> should be readonly, not disabled`).toBe(false);
        });
        root.querySelectorAll("[draggable]").forEach((el) => {
          expect(el.getAttribute("draggable"), `${type}: still a drag source`).toBe("false");
        });
      });

      it("still shows the answer it was given", () => {
        const root = parse(renderQuest(type, quest, state, { readOnly: true }));
        expect(shows(root), `${type}: the player's own answer is not in the record`).toBe(true);
      });

      it("changes nothing about the default render", () => {
        // The regression that would otherwise ship silently: a renderer that emits `disabled`
        // unconditionally locks the live form on every screen in the game, and every other test in
        // this suite renders the default and asserts nothing about attributes it never expected.
        const root = parse(renderQuest(type, quest, state));
        expect(root.firstElementChild.dataset.questReadonly).toBeUndefined();
        expect(root.firstElementChild.classList.contains("quest--read-only")).toBe(false);
        root.querySelectorAll("input, select, textarea").forEach((el) => {
          expect(el.disabled, `${type}: default render disabled a control`).toBe(false);
          expect(el.readOnly ?? false, `${type}: default render locked a textarea`).toBe(false);
        });
        root.querySelectorAll("[draggable]").forEach((el) => {
          expect(el.getAttribute("draggable"), `${type}: default render killed a drag source`).toBe(
            "true"
          );
        });
      });

      it("renders identically whether options are omitted or explicitly not read-only", () => {
        // `renderQuest(type, quest, state)` passes `undefined` through to a renderer whose own
        // default is `{}` — the two paths have to converge or the four call sites that pass no
        // options would diverge from the one that passes `{ readOnly: false }`.
        expect(renderQuest(type, quest, state, { readOnly: false })).toBe(
          renderQuest(type, quest, state)
        );
      });
    });
  });

  it("disables the sequencing move buttons that the live form leaves live", () => {
    // The one type whose controls are already conditionally disabled — the first row's ↑ and the
    // last row's ↓. The middle row is the one that proves the mode did anything.
    const state = { order: ["recharter", "veto", "removal"] };
    const live = parse(renderQuest("sequencing", sequencing, state));
    const middleLive = live.querySelectorAll("li.sequence-item")[1];
    expect(
      Array.from(middleLive.querySelectorAll("button")).every((b) => !b.disabled),
      "the live form's middle row should have two working buttons"
    ).toBe(true);

    const record = parse(renderQuest("sequencing", sequencing, state, { readOnly: true }));
    const middleRecord = record.querySelectorAll("li.sequence-item")[1];
    expect(Array.from(middleRecord.querySelectorAll("button")).every((b) => b.disabled)).toBe(true);
  });
});
