import { describe, it, expect } from "vitest";
import {
  EvidenceOrganizingQuestSchema,
  EvidenceOrganizingQuestListSchema,
  renderEvidenceOrganizingQuest,
  gradeEvidenceOrganizingQuest,
} from "../../apps/web/src/quest-types/history/evidence-organizing-quest.js";
import { UNIT_01_EVIDENCE_ORGANIZING_QUESTS } from "../../apps/web/src/content/quests/unit-01-quests.js";

const validQuest = {
  id: "sample-evidence-quest",
  prompt: "Sort each record into the skill it best demonstrates.",
  slots: [
    { id: "slot-a", label: "Slot A" },
    { id: "slot-b", label: "Slot B" },
  ],
  sources: [
    {
      id: "source-1",
      label: "Source One",
      attribution: "Author One, 1500",
      excerpt: "An excerpt.",
      skillCategory: "Slot A",
      correctSlotId: "slot-a",
    },
    {
      id: "source-2",
      label: "Source Two",
      attribution: "Author Two, 1600",
      excerpt: "Another excerpt.",
      skillCategory: "Slot B",
      correctSlotId: "slot-b",
    },
  ],
  reflectionPrompt: "Explain your reasoning in a few sentences.",
  rubric: {
    skillCategories: ["Slot A", "Slot B"],
    pointsTotal: 2,
    description: "1 point per correct match.",
  },
};

describe("EvidenceOrganizingQuestSchema", () => {
  it("accepts a well-formed quest (normal case)", () => {
    const result = EvidenceOrganizingQuestSchema.safeParse(validQuest);
    expect(result.success).toBe(true);
  });

  it("accepts a quest with no reflectionPrompt (boundary case)", () => {
    const withoutReflection = { ...validQuest };
    delete withoutReflection.reflectionPrompt;
    const result = EvidenceOrganizingQuestSchema.safeParse(withoutReflection);
    expect(result.success).toBe(true);
  });

  it("rejects a source whose correctSlotId is not one of the quest's own slots (invalid/missing data)", () => {
    const result = EvidenceOrganizingQuestSchema.safeParse({
      ...validQuest,
      sources: [{ ...validQuest.sources[0], correctSlotId: "slot-nonexistent" }, validQuest.sources[1]],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("correctSlotId must be one of")),
      ).toBe(true);
    }
  });

  it("rejects a duplicate source id within one quest (duplicate ID)", () => {
    const result = EvidenceOrganizingQuestSchema.safeParse({
      ...validQuest,
      sources: [validQuest.sources[0], { ...validQuest.sources[1], id: validQuest.sources[0].id }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("Duplicate source id"))).toBe(
        true,
      );
    }
  });

  it("rejects a duplicate slot id within one quest (duplicate ID)", () => {
    const result = EvidenceOrganizingQuestSchema.safeParse({
      ...validQuest,
      slots: [validQuest.slots[0], { ...validQuest.slots[1], id: validQuest.slots[0].id }],
    });
    expect(result.success).toBe(false);
  });
});

describe("EvidenceOrganizingQuestListSchema", () => {
  it("rejects a duplicate quest id across the list (duplicate ID)", () => {
    const result = EvidenceOrganizingQuestListSchema.safeParse([validQuest, { ...validQuest }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("Duplicate evidence-organizing quest id"),
        ),
      ).toBe(true);
    }
  });

  it("accepts the real Unit 1 evidence-organizing quest list (normal case)", () => {
    const result = EvidenceOrganizingQuestListSchema.safeParse(UNIT_01_EVIDENCE_ORGANIZING_QUESTS);
    expect(result.success).toBe(true);
  });
});

describe("renderEvidenceOrganizingQuest", () => {
  it("renders every source and slot (normal case)", () => {
    const html = renderEvidenceOrganizingQuest(validQuest);
    expect(html).toContain("Source One");
    expect(html).toContain("Source Two");
    expect(html).toContain("Slot A");
    expect(html).toContain("Slot B");
  });

  it("shows a placed source's label inside its slot (normal case)", () => {
    const html = renderEvidenceOrganizingQuest(validQuest, { placements: { "source-1": "slot-a" } });
    expect(html).toContain('data-evidence-slot-filled="source-1"');
  });

  it("omits the reflection field when the quest has none (boundary case)", () => {
    const withoutReflection = { ...validQuest };
    delete withoutReflection.reflectionPrompt;
    const html = renderEvidenceOrganizingQuest(withoutReflection);
    expect(html).not.toContain("quest-reflection");
  });

  it("escapes HTML in source excerpt text (invalid/missing data)", () => {
    const html = renderEvidenceOrganizingQuest({
      ...validQuest,
      sources: [{ ...validQuest.sources[0], excerpt: '<img src=x onerror=alert(1)>' }, validQuest.sources[1]],
    });
    expect(html).not.toContain("<img");
  });
});

describe("gradeEvidenceOrganizingQuest", () => {
  const correctPlacements = { "source-1": "slot-a", "source-2": "slot-b" };
  const longReflection = "This is a sufficiently long reflection response for the gate.";

  it("is complete when all sources are placed correctly and reflection meets the length gate (normal case)", () => {
    const result = gradeEvidenceOrganizingQuest(validQuest, {
      placements: correctPlacements,
      reflection: longReflection,
    });
    expect(result).toEqual({ allPlacedCorrectly: true, reflectionOk: true, complete: true });
  });

  it("is incomplete when a source is placed in the wrong slot (normal case)", () => {
    const result = gradeEvidenceOrganizingQuest(validQuest, {
      placements: { "source-1": "slot-b", "source-2": "slot-b" },
      reflection: longReflection,
    });
    expect(result.allPlacedCorrectly).toBe(false);
    expect(result.complete).toBe(false);
  });

  it("is incomplete when the reflection is below the minimum length (boundary case)", () => {
    const result = gradeEvidenceOrganizingQuest(validQuest, {
      placements: correctPlacements,
      reflection: "Too short",
    });
    expect(result.reflectionOk).toBe(false);
    expect(result.complete).toBe(false);
  });

  it("does not require a reflection when the quest defines none (boundary case)", () => {
    const withoutReflection = { ...validQuest };
    delete withoutReflection.reflectionPrompt;
    const result = gradeEvidenceOrganizingQuest(withoutReflection, { placements: correctPlacements });
    expect(result.reflectionOk).toBe(true);
    expect(result.complete).toBe(true);
  });
});
