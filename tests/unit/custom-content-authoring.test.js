import { describe, it, expect } from "vitest";
import {
  slugify,
  buildMcqContent,
  mcqToFields,
  buildSequencingContent,
  sequencingToFields,
  buildEvidenceOrganizingContent,
  evidenceOrganizingToFields,
  buildHippContent,
  hippToFields,
  buildSourceContent,
  sourceToFields,
  buildAuthoredContent,
} from "../../apps/web/src/engine/custom-content-authoring.js";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("The Caribbean—Island Society")).toBe("the-caribbean-island-society");
  });
  it("falls back when everything strips away", () => {
    expect(slugify("")).toBe("item");
    expect(slugify("???")).toBe("item");
  });
});

describe("buildMcqContent", () => {
  it("builds a valid quest and marks the correct answer from the correct row", () => {
    const result = buildMcqContent({
      prompt: "What is 2+2?",
      choices: [
        { text: "3", correct: false },
        { text: "4", correct: true },
        { text: "5", correct: false },
      ],
      explanation: "Basic arithmetic.",
    });
    expect(result.ok).toBe(true);
    expect(result.content.choices).toEqual(["3", "4", "5"]);
    expect(result.content.answer).toBe(1);
  });

  it("rejects fewer than 2 choices", () => {
    const result = buildMcqContent({ prompt: "P", choices: [{ text: "only one", correct: true }], explanation: "E" });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/at least 2 choices/);
  });

  it("rejects zero or multiple correct choices", () => {
    expect(
      buildMcqContent({
        prompt: "P",
        choices: [
          { text: "a", correct: false },
          { text: "b", correct: false },
        ],
        explanation: "E",
      }).ok
    ).toBe(false);
    expect(
      buildMcqContent({
        prompt: "P",
        choices: [
          { text: "a", correct: true },
          { text: "b", correct: true },
        ],
        explanation: "E",
      }).ok
    ).toBe(false);
  });

  it("fails schema validation when explanation is left blank", () => {
    const result = buildMcqContent({
      prompt: "P",
      choices: [
        { text: "a", correct: true },
        { text: "b", correct: false },
      ],
      explanation: "",
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/explanation/);
  });

  it("round-trips through mcqToFields (prefill for editing)", () => {
    const built = buildMcqContent({
      prompt: "P",
      choices: [
        { text: "a", correct: false },
        { text: "b", correct: true },
        { text: "c", correct: false },
      ],
      explanation: "E",
    });
    const fields = mcqToFields(built.content);
    const rebuilt = buildMcqContent(fields);
    expect(rebuilt.ok).toBe(true);
    expect(rebuilt.content.choices).toEqual(built.content.choices);
    expect(rebuilt.content.answer).toBe(built.content.answer);
  });
});

describe("buildSequencingContent", () => {
  it("derives the answer key from authored position while storing items shuffled", () => {
    const result = buildSequencingContent({
      prompt: "Order these",
      items: [
        { label: "First event", position: 0 },
        { label: "Second event", position: 1 },
        { label: "Third event", position: 2 },
      ],
      explanation: "",
    });
    expect(result.ok).toBe(true);
    const byPosition = [...result.content.items].sort((a, b) => a.position - b.position);
    expect(byPosition.map((i) => i.label)).toEqual(["First event", "Second event", "Third event"]);
  });

  it("rejects fewer than 2 items", () => {
    const result = buildSequencingContent({ prompt: "P", items: [{ label: "only one", position: 0 }] });
    expect(result.ok).toBe(false);
  });

  it("rejects duplicate or out-of-range positions", () => {
    expect(
      buildSequencingContent({
        prompt: "P",
        items: [
          { label: "a", position: 0 },
          { label: "b", position: 0 },
        ],
      }).ok
    ).toBe(false);
    expect(
      buildSequencingContent({
        prompt: "P",
        items: [
          { label: "a", position: 0 },
          { label: "b", position: 5 },
        ],
      }).ok
    ).toBe(false);
  });

  it("round-trips through sequencingToFields back into the original correct order", () => {
    const built = buildSequencingContent({
      prompt: "P",
      items: [
        { label: "Alpha", position: 0 },
        { label: "Beta", position: 1 },
        { label: "Gamma", position: 2 },
        { label: "Delta", position: 3 },
      ],
    });
    const fields = sequencingToFields(built.content);
    expect(fields.items.map((i) => i.label)).toEqual(["Alpha", "Beta", "Gamma", "Delta"]);
  });
});

describe("buildEvidenceOrganizingContent", () => {
  const validFields = {
    prompt: "Sort these",
    slots: [{ label: "Category One" }, { label: "Category Two" }],
    sources: [
      {
        label: "Record A",
        attribution: "Someone, 1600",
        excerpt: "some text",
        skillCategory: "Sourcing",
        correctSlotId: "category-one",
      },
      {
        label: "Record B",
        attribution: "Someone Else, 1700",
        excerpt: "other text",
        skillCategory: "Causation",
        correctSlotId: "category-two",
      },
    ],
  };

  it("builds a valid quest from structured slot/source rows", () => {
    const result = buildEvidenceOrganizingContent(validFields);
    expect(result.ok).toBe(true);
    expect(result.content.sources).toHaveLength(2);
    expect(result.content.slots).toHaveLength(2);
    expect(result.content.rubric.pointsTotal).toBe(2);
  });

  it("rejects an unrecognized skill category", () => {
    const result = buildEvidenceOrganizingContent({
      ...validFields,
      sources: [{ ...validFields.sources[0], skillCategory: "Not A Real Skill" }, validFields.sources[1]],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/skillCategory/i);
  });

  it("rejects a correctSlotId that doesn't match any authored slot", () => {
    const result = buildEvidenceOrganizingContent({
      ...validFields,
      sources: [{ ...validFields.sources[0], correctSlotId: "nonexistent" }, validFields.sources[1]],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/correctSlotId/i);
  });

  it("round-trips through evidenceOrganizingToFields", () => {
    const built = buildEvidenceOrganizingContent(validFields);
    const fields = evidenceOrganizingToFields(built.content);
    const rebuilt = buildEvidenceOrganizingContent(fields);
    expect(rebuilt.ok).toBe(true);
    expect(rebuilt.content.sources.map((s) => s.label)).toEqual(built.content.sources.map((s) => s.label));
  });
});

describe("buildHippContent", () => {
  const validFields = {
    documentText: "Some historical document text long enough to pass validation.",
    documentAttribution: "Some Author, 1800",
    hippPrompts: [
      {
        dimension: "Purpose",
        argument: "Why this matters",
        options: [
          { text: "the correct, explanation-linked option", correct: true, identificationOnly: false },
          { text: "names purpose but does not explain it", correct: false, identificationOnly: true },
          { text: "an unrelated wrong option", correct: false, identificationOnly: false },
        ],
      },
    ],
  };

  it("builds a valid quest, tagging correct and identification-only options", () => {
    const result = buildHippContent(validFields);
    expect(result.ok).toBe(true);
    const prompt = result.content.hippPrompts[0];
    expect(prompt.dimension).toBe("Purpose");
    expect(prompt.options.filter((o) => o.correct)).toHaveLength(1);
    expect(prompt.options.filter((o) => o.identificationOnly)).toHaveLength(1);
  });

  it("rejects an unrecognized HIPP dimension", () => {
    const result = buildHippContent({
      ...validFields,
      hippPrompts: [{ ...validFields.hippPrompts[0], dimension: "Not A Dimension" }],
    });
    expect(result.ok).toBe(false);
  });

  it("fails schema validation when no identification-only distractor is given", () => {
    const result = buildHippContent({
      ...validFields,
      hippPrompts: [
        {
          dimension: "Purpose",
          argument: "Why",
          options: [
            { text: "correct one", correct: true, identificationOnly: false },
            { text: "wrong one", correct: false, identificationOnly: false },
            { text: "another wrong one", correct: false, identificationOnly: false },
          ],
        },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/identification-only/);
  });

  it("round-trips through hippToFields", () => {
    const built = buildHippContent(validFields);
    const fields = hippToFields(built.content);
    const rebuilt = buildHippContent(fields);
    expect(rebuilt.ok).toBe(true);
    expect(rebuilt.content.hippPrompts[0].dimension).toBe("Purpose");
  });
});

describe("buildSourceContent", () => {
  const wiring = {
    visual: "context",
    activityRoute: null,
    feedback: "Good work.",
    citation: "Some Archive, 1900",
    externalUrl: "https://example.com/source",
    reconstruction: "precontact",
    investigationMode: null,
    investigationQuestId: null,
  };

  it("builds a valid source, carrying forward non-editable wiring fields", () => {
    const result = buildSourceContent(
      {
        type: "Primary source",
        title: "A Record",
        creator: "Someone",
        date: "1900",
        record: "Some Archive",
        excerpt: "The text of the record.",
        prompt: "What does this show?",
      },
      wiring
    );
    expect(result.ok).toBe(true);
    expect(result.content.visual).toBe("context");
    expect(result.content.externalUrl).toBe("https://example.com/source");
  });

  it("fails validation when a required field is blank", () => {
    const result = buildSourceContent(
      { type: "", title: "A Record", creator: "Someone", date: "1900", record: "R", excerpt: "E", prompt: "P" },
      wiring
    );
    expect(result.ok).toBe(false);
  });

  it("round-trips through sourceToFields", () => {
    const built = buildSourceContent(
      { type: "T", title: "Title", creator: "C", date: "D", record: "R", excerpt: "E", prompt: "P" },
      wiring
    );
    const fields = sourceToFields(built.content);
    expect(fields.title).toBe("Title");
  });
});

describe("buildAuthoredContent dispatch", () => {
  it("routes to the right builder by slotKind", () => {
    const result = buildAuthoredContent("mcq", {
      prompt: "P",
      choices: [
        { text: "a", correct: true },
        { text: "b", correct: false },
      ],
      explanation: "E",
    });
    expect(result.ok).toBe(true);
  });

  it("returns an error for an unknown slotKind", () => {
    const result = buildAuthoredContent("saq", {});
    expect(result.ok).toBe(false);
  });
});
