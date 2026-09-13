// @vitest-environment jsdom
//
// This file needs a DOM. The suite's default is `node` (vitest.config.js) because most of these
// files do not, and standing up jsdom for all of them cost more than the tests took to run.

import { describe, it, expect } from "vitest";
import {
  addMcqChoice,
  removeMcqChoice,
  moveMcqChoice,
  addSequenceItem,
  removeSequenceItem,
  addEvidenceSlot,
  removeEvidenceSlot,
  addEvidenceSource,
  removeEvidenceSource,
  addHippPrompt,
  removeHippPrompt,
  addHippOption,
  removeHippOption,
  moveHippOption,
  AUTHORING_ROW_EDITS,
  SOURCE_PICKER_TARGETS,
  applyPickedHippSource,
  applyPickedRelatedSource,
  applyPickedEvidenceSource,
} from "../../apps/web/src/main.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MAIN_JS = readFileSync(path.join(REPO_ROOT, "apps/web/src/main.js"), "utf8");

/**
 * The add/remove/move rules behind Manage Content's authoring forms.
 *
 * These lived as eleven inline bodies inside handleManageContentClick(), and **none of them was
 * tested** — not one floor, not one ceiling, and not one of the three repairs that keep a form
 * consistent after a removal. The audit that found them counted them as eleven near-verbatim
 * copies, which is true of the four-line skeleton around them and false of the bodies: each is a
 * different rule, and three of them exist to stop a removal quietly breaking a quest.
 *
 * That is what these assert. The floors and ceilings are a teacher-facing constraint (the buttons
 * disable at the same bounds), but the repairs are correctness: an MCQ with no correct answer, a
 * sequencing quest with a gap in its position key, or a source filed under a slot that no longer
 * exists are all things a teacher could produce with one click and not see.
 */

const mcq = (...choices) => ({ question: "Q", choices });
const seq = (...items) => ({ items });

describe("MCQ choices", () => {
  it("adds an empty, non-correct choice", () => {
    const after = addMcqChoice(mcq({ text: "a", correct: true }, { text: "b", correct: false }));
    expect(after.choices).toHaveLength(3);
    expect(after.choices[2]).toEqual({ text: "", correct: false });
  });

  it("refuses to go below two choices", () => {
    const fields = mcq({ text: "a", correct: true }, { text: "b", correct: false });
    expect(removeMcqChoice(fields, 0)).toBe(fields);
  });

  it("removes a wrong choice and leaves the answer alone", () => {
    const after = removeMcqChoice(
      mcq(
        { text: "a", correct: true },
        { text: "b", correct: false },
        { text: "c", correct: false }
      ),
      1
    );
    expect(after.choices.map((c) => c.text)).toEqual(["a", "c"]);
    expect(after.choices.filter((c) => c.correct)).toHaveLength(1);
    expect(after.choices[0].correct).toBe(true);
  });

  // The repair. Without it a teacher removing the right answer is left with a question that
  // cannot be answered correctly, and nothing says so.
  it("promotes the first remaining choice when the correct one is removed", () => {
    const after = removeMcqChoice(
      mcq(
        { text: "a", correct: false },
        { text: "b", correct: true },
        { text: "c", correct: false }
      ),
      1
    );
    expect(after.choices.map((c) => c.text)).toEqual(["a", "c"]);
    expect(after.choices[0].correct).toBe(true);
    expect(after.choices.filter((c) => c.correct)).toHaveLength(1);
  });

  it("does not mutate the fields it was given", () => {
    const fields = mcq(
      { text: "a", correct: true },
      { text: "b", correct: false },
      { text: "c", correct: false }
    );
    const snapshot = JSON.stringify(fields);
    removeMcqChoice(fields, 0);
    addMcqChoice(fields);
    moveMcqChoice(fields, 0, 1);
    expect(JSON.stringify(fields)).toBe(snapshot);
  });

  it("moves a choice and carries its correctness with it", () => {
    const after = moveMcqChoice(
      mcq({ text: "a", correct: false }, { text: "b", correct: true }),
      1,
      -1
    );
    expect(after.choices.map((c) => c.text)).toEqual(["b", "a"]);
    expect(after.choices[0].correct).toBe(true);
  });

  it("clamps a move at the ends rather than wrapping", () => {
    const fields = mcq({ text: "a", correct: true }, { text: "b", correct: false });
    expect(moveMcqChoice(fields, 0, -1).choices.map((c) => c.text)).toEqual(["a", "b"]);
    expect(moveMcqChoice(fields, 1, 1).choices.map((c) => c.text)).toEqual(["a", "b"]);
  });
});

describe("sequencing items", () => {
  it("adds an item numbered after the last", () => {
    const after = addSequenceItem(seq({ label: "a", position: 0 }, { label: "b", position: 1 }));
    expect(after.items[2]).toEqual({ label: "", position: 2 });
  });

  it("refuses to go below two items", () => {
    const fields = seq({ label: "a", position: 0 }, { label: "b", position: 1 });
    expect(removeSequenceItem(fields, 0)).toBe(fields);
  });

  // The repair. `position` is the answer key, so a gap in it is a broken quest, and
  // sequencing-quest-order.test.js exists because this ordering is easy to get wrong.
  it("renumbers every remaining position 0..n-1 after a removal", () => {
    const after = removeSequenceItem(
      seq(
        { label: "a", position: 0 },
        { label: "b", position: 1 },
        { label: "c", position: 2 },
        { label: "d", position: 3 }
      ),
      1
    );
    expect(after.items.map((i) => [i.label, i.position])).toEqual([
      ["a", 0],
      ["c", 1],
      ["d", 2],
    ]);
  });

  // Authored order and position order are deliberately different — a sequencing quest is authored
  // out of order on purpose — so the renumbering has to sort by position, not by array index.
  it("renumbers by position, not by where a row happens to sit in the array", () => {
    const after = removeSequenceItem(
      seq(
        { label: "third", position: 2 },
        { label: "first", position: 0 },
        { label: "gone", position: 3 },
        { label: "second", position: 1 }
      ),
      2
    );
    expect(after.items.map((i) => [i.label, i.position])).toEqual([
      ["first", 0],
      ["second", 1],
      ["third", 2],
    ]);
  });
});

describe("evidence-organizing slots and sources", () => {
  const evidence = () => ({
    slots: [{ label: "Kept" }, { label: "Discarded" }, { label: "Unclear" }],
    sources: [
      { label: "s1", correctSlotId: "kept", excerpt: "" },
      { label: "s2", correctSlotId: "discarded", excerpt: "" },
      { label: "s3", correctSlotId: "unclear", excerpt: "" },
    ],
  });

  it("adds an empty slot", () => {
    expect(addEvidenceSlot(evidence()).slots).toHaveLength(4);
  });

  it("refuses to go below two slots", () => {
    const fields = { slots: [{ label: "a" }, { label: "b" }], sources: [] };
    expect(removeEvidenceSlot(fields, 0)).toBe(fields);
  });

  // The repair, and the least visible of the three: correctSlotId is matched by slug, so a source
  // left pointing at a deleted slot matches nothing and its answer can never be right.
  it("repoints sources filed under a removed slot at the first remaining slot", () => {
    const after = removeEvidenceSlot(evidence(), 1); // removes "Discarded"
    expect(after.slots.map((s) => s.label)).toEqual(["Kept", "Unclear"]);
    expect(after.sources.map((s) => s.correctSlotId)).toEqual(["kept", "kept", "unclear"]);
  });

  it("leaves sources filed under other slots untouched", () => {
    const after = removeEvidenceSlot(evidence(), 2); // removes "Unclear"
    expect(after.sources.map((s) => s.correctSlotId)).toEqual(["kept", "discarded", "kept"]);
  });

  it("adds a source already filed under the first slot", () => {
    const after = addEvidenceSource(evidence());
    expect(after.sources).toHaveLength(4);
    expect(after.sources[3].correctSlotId).toBe("kept");
    expect(after.sources[3]).toMatchObject({
      label: "",
      attribution: "",
      excerpt: "",
      sourcePoolValue: "",
    });
    expect(after.sources[3].skillCategory).toBeTruthy();
  });

  it("adds a source with no slot to file it under when there are no slots", () => {
    expect(addEvidenceSource({ slots: [], sources: [] }).sources[0].correctSlotId).toBe("");
  });

  it("refuses to remove the last source", () => {
    const fields = { slots: [{ label: "a" }], sources: [{ label: "only" }] };
    expect(removeEvidenceSource(fields, 0)).toBe(fields);
  });

  it("removes a source when more than one remains", () => {
    expect(removeEvidenceSource(evidence(), 0).sources.map((s) => s.label)).toEqual(["s2", "s3"]);
  });
});

describe("HIPP prompts and options", () => {
  const option = (text, correct = false) => ({ text, correct, identificationOnly: false });
  const prompt = (...options) => ({ dimension: "Historical situation", argument: "", options });
  const hipp = (...hippPrompts) => ({ hippPrompts });

  it("adds a prompt with three options, one of them correct", () => {
    const after = addHippPrompt(hipp(prompt(option("a", true), option("b"), option("c"))));
    expect(after.hippPrompts).toHaveLength(2);
    expect(after.hippPrompts[1].options).toHaveLength(3);
    expect(after.hippPrompts[1].options.filter((o) => o.correct)).toHaveLength(1);
    expect(after.hippPrompts[1].dimension).toBeTruthy();
  });

  it("refuses a third prompt", () => {
    const fields = hipp(prompt(option("a", true)), prompt(option("b", true)));
    expect(addHippPrompt(fields)).toBe(fields);
  });

  it("refuses to remove the last prompt", () => {
    const fields = hipp(prompt(option("a", true)));
    expect(removeHippPrompt(fields, 0)).toBe(fields);
  });

  it("removes a prompt when two exist", () => {
    const after = removeHippPrompt(hipp(prompt(option("a", true)), prompt(option("b", true))), 0);
    expect(after.hippPrompts).toHaveLength(1);
    expect(after.hippPrompts[0].options[0].text).toBe("b");
  });

  it("adds an option up to six, then refuses", () => {
    let fields = hipp(prompt(option("a", true), option("b"), option("c")));
    for (let i = 3; i < 6; i++) fields = addHippOption(fields, 0);
    expect(fields.hippPrompts[0].options).toHaveLength(6);
    expect(addHippOption(fields, 0)).toBe(fields);
  });

  it("refuses to go below three options", () => {
    const fields = hipp(prompt(option("a", true), option("b"), option("c")));
    expect(removeHippOption(fields, 0, 0)).toBe(fields);
  });

  it("removes an option when four exist", () => {
    const after = removeHippOption(
      hipp(prompt(option("a", true), option("b"), option("c"), option("d"))),
      0,
      1
    );
    expect(after.hippPrompts[0].options.map((o) => o.text)).toEqual(["a", "c", "d"]);
  });

  it("edits only the prompt it was given", () => {
    const fields = hipp(
      prompt(option("a", true), option("b"), option("c"), option("d")),
      prompt(option("x", true), option("y"), option("z"))
    );
    const after = removeHippOption(fields, 0, 3);
    expect(after.hippPrompts[0].options).toHaveLength(3);
    expect(after.hippPrompts[1].options.map((o) => o.text)).toEqual(["x", "y", "z"]);
  });

  it("moves an option within its own prompt and carries correctness", () => {
    const after = moveHippOption(
      hipp(prompt(option("a"), option("b", true), option("c"))),
      0,
      1,
      -1
    );
    expect(after.hippPrompts[0].options.map((o) => o.text)).toEqual(["b", "a", "c"]);
    expect(after.hippPrompts[0].options[0].correct).toBe(true);
  });
});
/**
 * The hazard the table was built to remove, asserted.
 *
 * Every one of these actions used to be its own branch, and each opened by hard-coding the quest
 * kind whose form it edits — `syncAuthoringFieldsFromDom("mcq", …)` for an MCQ button and so on.
 * Get that literal wrong and the handler reads the wrong form's rows out of the DOM: the edit runs
 * against a `fields` object whose `choices`/`items`/`slots` are missing, and a teacher's click
 * either does nothing or throws into `render()`'s catch, which shows them the Archive recovery
 * screen. Nothing checked it; keeping fourteen literals in step with fourteen forms was memory.
 *
 * The kind now lives in the same table row as the edit, which makes a mismatch visible. This makes
 * it fail instead — by reading, from `main.js` itself, which form's markup renders each button.
 * Each `<kind>FieldsMarkup()` function emits the buttons for exactly one quest type, so the
 * function a `data-action` appears in *is* the answer, and it is derived rather than restated.
 */
describe("every row edit is pointed at the form that renders its button", () => {
  const MARKUP_FN_KIND = {
    mcqFieldsMarkup: "mcq",
    sequencingFieldsMarkup: "sequencing",
    evidenceOrganizingFieldsMarkup: "evidence-organizing",
    hippFieldsMarkup: "hipp",
  };

  // The body of one top-level `function name(...) {` … `\n}` in main.js.
  const functionBody = (name) => {
    const start = MAIN_JS.indexOf(`function ${name}(`);
    if (start === -1) throw new Error(`could not find function ${name}`);
    const end = MAIN_JS.indexOf("\n}", start);
    if (end === -1) throw new Error(`could not find the end of ${name}`);
    return MAIN_JS.slice(start, end);
  };

  const kindThatRenders = {};
  for (const [fn, kind] of Object.entries(MARKUP_FN_KIND)) {
    for (const m of functionBody(fn).matchAll(/data-action="([a-z-]+)"/g)) {
      kindThatRenders[m[1]] = kind;
    }
  }

  it("finds the buttons in the markup at all", () => {
    // Without this the loop below could pass by comparing nothing, on a rename.
    expect(Object.keys(kindThatRenders).length).toBeGreaterThanOrEqual(
      Object.keys(AUTHORING_ROW_EDITS).length
    );
  });

  it.each(Object.keys(AUTHORING_ROW_EDITS))("%s edits the form it is drawn on", (action) => {
    const [kind] = AUTHORING_ROW_EDITS[action];
    expect(
      kind,
      `AUTHORING_ROW_EDITS["${action}"] syncs the "${kind}" form, but that button is rendered by ` +
        `the "${kindThatRenders[action]}" form. The handler would read the wrong rows out of the ` +
        `DOM, and the teacher's click would do nothing or land in render()'s recovery screen.`
    ).toBe(kindThatRenders[action]);
  });

  it("has an entry for every add/remove/move button the forms render", () => {
    const rendered = Object.keys(kindThatRenders).filter((a) => /^(add|remove|move)-/.test(a));
    for (const action of rendered) {
      expect(
        Object.keys(AUTHORING_ROW_EDITS),
        `the ${kindThatRenders[action]} form renders a "${action}" button that no table entry ` +
          `handles, so clicking it falls through handleManageContentClick() and does nothing`
      ).toContain(action);
    }
  });
});
/**
 * "Select source" copies a pool source into the form's fields. Which fields, per quest type.
 *
 * These were four branches of handleAppChange(), each repeating the same ten-line skeleton around
 * three lines that differ, and — like the row edits above — **none of the three was tested**. The
 * one that matters is HIPP's `fullText || excerpt`: it is the only form that copies the document
 * itself rather than a citation of it, so it is the only one that prefers a real transcription over
 * the short summary excerpt. Get that backwards and a HIPP question silently asks a student to read
 * a two-sentence description of a source instead of the source.
 */
describe("copying a picked pool source into a form", () => {
  const picked = {
    label: "Letter announcing the first voyage",
    attribution: "Christopher Columbus, 1492-1493",
    excerpt: "A short summary of the letter.",
    fullText: "The verbatim letter, transcribed in full.",
  };

  it("HIPP takes the transcribed full text, not the summary excerpt", () => {
    const after = applyPickedHippSource(
      { documentText: "old", documentAttribution: "old" },
      picked
    );
    expect(after.documentText).toBe(picked.fullText);
    expect(after.documentAttribution).toBe(picked.attribution);
  });

  it("HIPP falls back to the excerpt when a source has no transcription", () => {
    const after = applyPickedHippSource({}, { ...picked, fullText: null });
    expect(after.documentText).toBe(picked.excerpt);
  });

  // A visual source has no fullText at all, which is the real shape of the fallback above.
  it("HIPP takes a visual source's description", () => {
    const visual = {
      label: "A map",
      attribution: "Anon., 1524",
      excerpt: "What it shows.",
      fullText: null,
    };
    expect(applyPickedHippSource({}, visual).documentText).toBe("What it shows.");
  });

  it("MCQ and sequencing take the citation fields, and never the full text", () => {
    const after = applyPickedRelatedSource({ relatedSourceLabel: "old" }, picked);
    expect(after).toMatchObject({
      relatedSourceLabel: picked.label,
      relatedSourceAttribution: picked.attribution,
      relatedSourceExcerpt: picked.excerpt,
    });
    expect(JSON.stringify(after)).not.toContain(picked.fullText);
  });

  it("evidence-organizing writes into one row and leaves the others alone", () => {
    const fields = {
      sources: [
        { label: "a", attribution: "a", excerpt: "a", correctSlotId: "kept" },
        { label: "b", attribution: "b", excerpt: "b", correctSlotId: "discarded" },
        { label: "c", attribution: "c", excerpt: "c", correctSlotId: "kept" },
      ],
    };
    const after = applyPickedEvidenceSource(fields, picked, 1);
    expect(after.sources[1]).toMatchObject({
      label: picked.label,
      attribution: picked.attribution,
      excerpt: picked.excerpt,
      // The row's own filing is not part of the copy-in.
      correctSlotId: "discarded",
    });
    expect(after.sources[0].label).toBe("a");
    expect(after.sources[2].label).toBe("c");
    expect(fields.sources[1].label).toBe("b"); // the input is untouched
  });
});

// Same hazard as AUTHORING_ROW_EDITS, same derivation: the <select> is rendered by exactly one
// form's markup function, so that function names the kind and the table must agree with it.
describe("every source picker is pointed at the form that renders its select", () => {
  const MARKUP_FN_KIND = {
    mcqFieldsMarkup: "mcq",
    sequencingFieldsMarkup: "sequencing",
    evidenceOrganizingFieldsMarkup: "evidence-organizing",
    hippFieldsMarkup: "hipp",
  };

  const functionBody = (name) => {
    const start = MAIN_JS.indexOf(`function ${name}(`);
    if (start === -1) throw new Error(`could not find function ${name}`);
    const end = MAIN_JS.indexOf("\n}", start);
    if (end === -1) throw new Error(`could not find the end of ${name}`);
    return MAIN_JS.slice(start, end);
  };

  const kindThatRenders = {};
  for (const [fn, kind] of Object.entries(MARKUP_FN_KIND)) {
    for (const m of functionBody(fn).matchAll(/(data-copy-[a-z-]+-source)/g)) {
      kindThatRenders[m[1]] = kind;
    }
  }

  it("finds all four selects in the markup", () => {
    expect(Object.keys(kindThatRenders).sort()).toEqual(Object.keys(SOURCE_PICKER_TARGETS).sort());
  });

  it.each(Object.keys(SOURCE_PICKER_TARGETS))("%s edits the form it is drawn on", (attribute) => {
    expect(
      SOURCE_PICKER_TARGETS[attribute].kind,
      `SOURCE_PICKER_TARGETS["${attribute}"] syncs the "${SOURCE_PICKER_TARGETS[attribute].kind}" ` +
        `form, but that select is rendered by the "${kindThatRenders[attribute]}" form — the copy-in ` +
        `would read the wrong form's rows out of the DOM`
    ).toBe(kindThatRenders[attribute]);
  });
});
