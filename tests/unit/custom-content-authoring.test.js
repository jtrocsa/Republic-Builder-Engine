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
    const result = buildMcqContent({
      prompt: "P",
      choices: [{ text: "only one", correct: true }],
      explanation: "E",
    });
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
    const result = buildSequencingContent({
      prompt: "P",
      items: [{ label: "only one", position: 0 }],
    });
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
      sources: [
        { ...validFields.sources[0], skillCategory: "Not A Real Skill" },
        validFields.sources[1],
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/skillCategory/i);
  });

  it("rejects a correctSlotId that doesn't match any authored slot", () => {
    const result = buildEvidenceOrganizingContent({
      ...validFields,
      sources: [
        { ...validFields.sources[0], correctSlotId: "nonexistent" },
        validFields.sources[1],
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/correctSlotId/i);
  });

  it("round-trips through evidenceOrganizingToFields", () => {
    const built = buildEvidenceOrganizingContent(validFields);
    const fields = evidenceOrganizingToFields(built.content);
    const rebuilt = buildEvidenceOrganizingContent(fields);
    expect(rebuilt.ok).toBe(true);
    expect(rebuilt.content.sources.map((s) => s.label)).toEqual(
      built.content.sources.map((s) => s.label)
    );
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
          {
            text: "the correct, explanation-linked option",
            correct: true,
            identificationOnly: false,
          },
          {
            text: "names purpose but does not explain it",
            correct: false,
            identificationOnly: true,
          },
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
      {
        type: "",
        title: "A Record",
        creator: "Someone",
        date: "1900",
        record: "R",
        excerpt: "E",
        prompt: "P",
      },
      wiring
    );
    expect(result.ok).toBe(false);
  });

  it("round-trips through sourceToFields", () => {
    const built = buildSourceContent(
      {
        type: "T",
        title: "Title",
        creator: "C",
        date: "D",
        record: "R",
        excerpt: "E",
        prompt: "P",
      },
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

/**
 * The slot's id is the graded answer key, and the editor has to hand it back unchanged.
 *
 * Evidence-organizing is the only quest type in this file whose content cross-references itself —
 * `source.correctSlotId` names the slot the record belongs in, and that string is what a student is
 * marked against. It made a round trip through the editor as `slugify(label)`, and **every authored
 * quest writes a short id beside a long label**: `agriculture-diet` for "Transformed Agriculture
 * and Diet". So the rebuilt id matched nothing any source pointed at.
 *
 * In the browser that is worse than a dangling reference, because the `<select>` on each source row
 * cannot display a value it has no option for and falls back to its first option — which the next
 * read of the form takes as the teacher's own choice. Measured end to end before the fix: opening
 * Case 1.02's editor and pressing Publish **without touching anything** published a key with all
 * four records filed under the first slot, three of them wrong. See decision log `0148` and
 * `tests/e2e/teacher-content-reaches-students.spec.js`, which walks that.
 */
describe("evidence-organizing slot identity survives the editor", () => {
  /** The shape every authored quest has: a short id, a long label, and sources pointing at the id. */
  const authored = {
    prompt: "Sort each record beneath the claim it supports.",
    slots: [
      { id: "agriculture-diet", label: "Transformed Agriculture and Diet" },
      { id: "demographic-catastrophe", label: "Caused Demographic Catastrophe" },
    ],
    sources: [
      {
        id: "maize",
        label: "Maize",
        attribution: "José de Acosta, 1590",
        excerpt: "The principal grain of the Indies is maize.",
        skillCategory: "Causation",
        correctSlotId: "agriculture-diet",
      },
      {
        id: "smallpox",
        label: "Smallpox",
        attribution: "Motolinía, 1541",
        excerpt: "They died in heaps.",
        skillCategory: "Causation",
        correctSlotId: "demographic-catastrophe",
      },
    ],
    reflectionPrompt: "",
  };

  const roundTrip = (quest) => buildEvidenceOrganizingContent(evidenceOrganizingToFields(quest));

  it("returns every record to the slot it was authored under", () => {
    const result = roundTrip(authored);
    expect(
      result.ok,
      `the round trip refused the authored quest: ${result.errors?.join(", ")}`
    ).toBe(true);
    expect(
      result.content.sources.map((source) => [source.label, source.correctSlotId]),
      "opening a mission's activity and saving it rewrote which slot each record belongs in — the " +
        "answer key a class is graded against"
    ).toEqual([
      ["Maize", "agriculture-diet"],
      ["Smallpox", "demographic-catastrophe"],
    ]);
  });

  it("keeps the slots' own ids rather than re-deriving them from their labels", () => {
    expect(
      roundTrip(authored).content.slots.map((slot) => slot.id),
      "the slots came back with different ids, so every source filed under them is now dangling"
    ).toEqual(["agriculture-diet", "demographic-catastrophe"]);
  });

  it("lets a teacher rename a slot without moving what is filed under it", () => {
    const fields = evidenceOrganizingToFields(authored);
    const renamed = {
      ...fields,
      slots: [{ ...fields.slots[0], label: "Food and Farming" }, fields.slots[1]],
    };
    const result = buildEvidenceOrganizingContent(renamed);
    expect(result.ok, `renaming a slot was refused: ${result.errors?.join(", ")}`).toBe(true);
    expect(result.content.slots[0].label).toBe("Food and Farming");
    expect(
      result.content.sources.map((source) => source.correctSlotId),
      "renaming a slot emptied it — the label is not the slot's identity, and changing one must " +
        "not change the other"
    ).toEqual(["agriculture-diet", "demographic-catastrophe"]);
  });

  it("still mints an id from the label for a row that never had one", () => {
    const result = buildEvidenceOrganizingContent({
      prompt: "Sort these",
      slots: [{ label: "Category One" }, { label: "Category Two" }],
      sources: [{ ...authored.sources[0], correctSlotId: "category-one" }],
    });
    expect(result.ok).toBe(true);
    expect(result.content.slots.map((slot) => slot.id)).toEqual(["category-one", "category-two"]);
  });
});
