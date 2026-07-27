import { describe, it, expect } from "vitest";
import {
  reorderAuthoringRow,
  sectionForValidationError,
  mcqSectionSummaries,
  sequencingSectionSummaries,
  evidenceOrganizingSectionSummaries,
  hippSectionSummaries,
} from "../../apps/web/src/main.js";
import {
  buildMcqContent,
  buildHippContent,
} from "../../apps/web/src/engine/custom-content-authoring.js";

// reorderAuthoringRow() — shared Move Up/Down helper for MCQ choices and
// HIPP options-per-prompt (see the Phase 3 plan). Correctness always
// travels with the row object itself (choice.correct / option.correct), so
// reordering should never need any index bookkeeping — proved below by
// feeding the reordered rows through the real build*Content() validators
// rather than just asserting array order.
describe("reorderAuthoringRow", () => {
  const rows = ["a", "b", "c"];

  it("swaps a row with its next neighbor when moving down", () => {
    expect(reorderAuthoringRow(rows, 0, 1)).toEqual(["b", "a", "c"]);
  });

  it("swaps a row with its previous neighbor when moving up", () => {
    expect(reorderAuthoringRow(rows, 2, -1)).toEqual(["a", "c", "b"]);
  });

  it("is a no-op moving the first row up", () => {
    expect(reorderAuthoringRow(rows, 0, -1)).toEqual(rows);
  });

  it("is a no-op moving the last row down", () => {
    expect(reorderAuthoringRow(rows, 2, 1)).toEqual(rows);
  });

  it("does not mutate the original array", () => {
    const original = ["a", "b", "c"];
    reorderAuthoringRow(original, 0, 1);
    expect(original).toEqual(["a", "b", "c"]);
  });

  it("keeps the correct MCQ choice marked correct after reordering, through buildMcqContent()", () => {
    const choices = [
      { text: "Wrong", correct: false },
      { text: "Right", correct: true },
      { text: "Also wrong", correct: false },
    ];
    // Move "Right" (index 1) up to index 0.
    const reordered = reorderAuthoringRow(choices, 1, -1);
    const result = buildMcqContent({
      prompt: "A prompt",
      choices: reordered,
      explanation: "Because it was the dominant Atlantic trading power.",
    });
    expect(result.ok).toBe(true);
    expect(result.content.choices[result.content.answer]).toBe("Right");
  });

  it("keeps the correct HIPP option marked correct after reordering, through buildHippContent()", () => {
    const options = [
      { text: "Identifies only", correct: false, identificationOnly: true },
      { text: "Explains the connection", correct: true, identificationOnly: false },
      { text: "Unrelated", correct: false, identificationOnly: false },
    ];
    // Move the correct option (index 1) down to index 2.
    const reordered = reorderAuthoringRow(options, 1, 1);
    const result = buildHippContent({
      documentText: "Document text",
      documentAttribution: "Author, Date",
      hippPrompts: [{ dimension: "Purpose", argument: "An argument", options: reordered }],
    });
    expect(result.ok).toBe(true);
    const correctOption = result.content.hippPrompts[0].options.find((o) => o.correct);
    expect(correctOption.text).toBe("Explains the connection");
  });
});

// sectionForValidationError() — classifies a raw auth.errors[] message to
// the guided section it belongs to, purely from its leading field-name
// token. Table-tested against the real message strings the two error
// sources (custom-content-authoring.js's hand-written checks, and Zod's
// issuesToMessages()) actually produce, so this can't silently drift from
// what the validators really say.
describe("sectionForValidationError", () => {
  it.each([
    ["mcq", "choices: add at least 2 choices", "answers"],
    ["mcq", "choices: mark exactly one choice correct (found 2)", "answers"],
    ["mcq", "prompt: String must contain at least 1 character(s)", "question"],
    ["mcq", "relatedSource.label: Required", "source"],
    ["sequencing", "items: add at least 2 items", "answers"],
    ["sequencing", "items: each item must have a unique position from 1 to the number of items", "answers"],
    ["sequencing", "prompt: Required", "question"],
    ["evidence-organizing", "prompt: Required", "question"],
    ["evidence-organizing", "sources: add at least 1 evidence record", "answers"],
    ["evidence-organizing", "sources[0].skillCategory: Invalid enum value", "answers"],
    ["hipp", "prompts: add at least 1 HIPP prompt", "answers"],
    ["hipp", "prompts[0].dimension: must be one of Historical situation, ...", "answers"],
    ["hipp", "document.text: Required", "source"],
    ["hipp", "hippPrompts: too_small", "answers"],
  ])("classifies %s error %j as %s", (slotKind, message, expected) => {
    expect(sectionForValidationError(slotKind, message)).toBe(expected);
  });

  it("returns null for an unrecognized message prefix rather than mislinking it", () => {
    expect(sectionForValidationError("mcq", "totally-unknown-field: broken")).toBeNull();
  });
});

describe("section-summary builders", () => {
  it("mcqSectionSummaries describes source/question/answers state", () => {
    const summaries = mcqSectionSummaries({
      relatedSourceLabel: "",
      relatedSourceExcerpt: "",
      prompt: "Which empire controlled the largest share of the triangular trade?",
      choices: [
        { text: "Spain", correct: false },
        { text: "Portugal", correct: true },
        { text: "", correct: false },
      ],
    });
    expect(summaries.source).toBe("");
    expect(summaries.question).toContain("Which empire");
    expect(summaries.answers).toBe("3 choices, correct answer selected");
  });

  it("mcqSectionSummaries reports no answer chosen yet", () => {
    const summaries = mcqSectionSummaries({
      prompt: "",
      choices: [
        { text: "A", correct: false },
        { text: "B", correct: false },
      ],
    });
    expect(summaries.answers).toBe("2 choices, no correct answer selected yet");
  });

  it("sequencingSectionSummaries counts only filled-in items", () => {
    const summaries = sequencingSectionSummaries({
      prompt: "Order the events",
      items: [
        { label: "First", position: 0 },
        { label: "", position: 1 },
      ],
    });
    // Only 1 of 2 items has text — below the 2-filled threshold.
    expect(summaries.answers).toBe("");
  });

  it("sequencingSectionSummaries reports a full item count once filled", () => {
    const summaries = sequencingSectionSummaries({
      prompt: "Order the events",
      items: [
        { label: "First", position: 0 },
        { label: "Second", position: 1 },
        { label: "Third", position: 2 },
      ],
    });
    expect(summaries.answers).toBe("3 items in order");
  });

  it("evidenceOrganizingSectionSummaries has no source key", () => {
    const summaries = evidenceOrganizingSectionSummaries({
      prompt: "Sort the evidence",
      slots: [{ label: "Comparison" }, { label: "Causation" }],
      sources: [
        { label: "Record A", correctSlotId: "comparison" },
        { label: "Record B", correctSlotId: "causation" },
      ],
    });
    expect(summaries.source).toBeUndefined();
    expect(summaries.answers).toBe("2 slots, 2 evidence records, all placed");
  });

  it("hippSectionSummaries has no question key and lists dimensions", () => {
    const summaries = hippSectionSummaries({
      documentAttribution: "Columbus, Letter, 1493",
      documentText: "",
      hippPrompts: [
        { dimension: "Purpose", argument: "An argument" },
        { dimension: "Point of view", argument: "" },
      ],
    });
    expect(summaries.question).toBeUndefined();
    expect(summaries.answers).toContain("2 HIPP prompts");
    expect(summaries.answers).toContain("Purpose");
  });
});
