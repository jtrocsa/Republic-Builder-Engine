import { describe, it, expect } from "vitest";
import {
  SequencingItemSchema,
  SequencingQuestSchema,
  SequencingQuestListSchema,
  renderSequencingQuest,
  gradeSequencingQuest,
  sequencingAnsweredAny,
  isSequencingComplete,
  sequencingPartialSuccess,
  sequencingHint,
} from "../../apps/web/src/quest-types/generic/sequencing-quest.js";
import { UNIT_01_SEQUENCING_QUESTS } from "../../apps/web/src/content/quests/unit-01-quests.js";

const validQuest = {
  id: "sample-sequencing",
  prompt: "Arrange these developments in the order that reflects how each one caused the next.",
  items: [
    { id: "item-a", label: "First development", position: 0 },
    { id: "item-b", label: "Second development", position: 1 },
    { id: "item-c", label: "Third development", position: 2 },
  ],
  explanation: "Each step enables the next.",
};

describe("SequencingItemSchema", () => {
  it("accepts a well-formed item (normal case)", () => {
    const result = SequencingItemSchema.safeParse(validQuest.items[0]);
    expect(result.success).toBe(true);
  });

  it("rejects an item missing a label (invalid/missing data)", () => {
    const withoutLabel = { ...validQuest.items[0] };
    delete withoutLabel.label;
    const result = SequencingItemSchema.safeParse(withoutLabel);
    expect(result.success).toBe(false);
  });
});

describe("SequencingQuestSchema", () => {
  it("accepts a well-formed quest (normal case)", () => {
    const result = SequencingQuestSchema.safeParse(validQuest);
    expect(result.success).toBe(true);
  });

  it("accepts a quest with exactly 2 items, the schema's minimum (boundary case)", () => {
    const twoItemQuest = {
      ...validQuest,
      items: [
        { id: "item-a", label: "First development", position: 0 },
        { id: "item-b", label: "Second development", position: 1 },
      ],
    };
    const result = SequencingQuestSchema.safeParse(twoItemQuest);
    expect(result.success).toBe(true);
  });

  it("rejects positions with a gap that don't form a complete 0..n-1 ordering (invalid/missing data)", () => {
    const result = SequencingQuestSchema.safeParse({
      ...validQuest,
      items: [
        { id: "item-a", label: "First development", position: 0 },
        { id: "item-b", label: "Second development", position: 2 },
        { id: "item-c", label: "Third development", position: 3 },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("must form a complete 0.."))
      ).toBe(true);
    }
  });

  it("rejects positions with a repeat that don't form a complete 0..n-1 ordering (invalid/missing data)", () => {
    const result = SequencingQuestSchema.safeParse({
      ...validQuest,
      items: [
        { id: "item-a", label: "First development", position: 0 },
        { id: "item-b", label: "Second development", position: 1 },
        { id: "item-c", label: "Third development", position: 1 },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("must form a complete 0.."))
      ).toBe(true);
    }
  });

  it("rejects a duplicate item id within one quest (duplicate ID)", () => {
    const result = SequencingQuestSchema.safeParse({
      ...validQuest,
      items: [
        validQuest.items[0],
        { ...validQuest.items[1], id: validQuest.items[0].id },
        validQuest.items[2],
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("Duplicate item id"))).toBe(
        true
      );
    }
  });
});

describe("SequencingQuestListSchema", () => {
  it("rejects a duplicate quest id across the list (duplicate ID)", () => {
    const result = SequencingQuestListSchema.safeParse([validQuest, { ...validQuest }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("Duplicate sequencing quest id"))
      ).toBe(true);
    }
  });

  it("accepts the real Unit 1 sequencing quest list (normal case)", () => {
    const result = SequencingQuestListSchema.safeParse(UNIT_01_SEQUENCING_QUESTS);
    expect(result.success).toBe(true);
  });
});

describe("renderSequencingQuest", () => {
  it("renders every item's label (normal case)", () => {
    const html = renderSequencingQuest(validQuest);
    expect(html).toContain("First development");
    expect(html).toContain("Second development");
    expect(html).toContain("Third development");
  });

  it("falls back to the quest's authored item order when no state.order is given (normal case)", () => {
    const html = renderSequencingQuest(validQuest);
    const labelOrder = ["First development", "Second development", "Third development"].map(
      (label) => html.indexOf(label)
    );
    expect(labelOrder).toEqual([...labelOrder].sort((a, b) => a - b));
  });

  it("renders items in state.order instead of the authored order when given (normal case)", () => {
    const html = renderSequencingQuest(validQuest, { order: ["item-c", "item-a", "item-b"] });
    const thirdIndex = html.indexOf("Third development");
    const firstIndex = html.indexOf("First development");
    const secondIndex = html.indexOf("Second development");
    expect(thirdIndex).toBeLessThan(firstIndex);
    expect(firstIndex).toBeLessThan(secondIndex);
  });

  it("escapes HTML in an item label (invalid/missing data)", () => {
    const html = renderSequencingQuest({
      ...validQuest,
      items: [
        { ...validQuest.items[0], label: '<script>alert("x")</script>' },
        validQuest.items[1],
        validQuest.items[2],
      ],
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("gradeSequencingQuest", () => {
  it("reports correct when the order matches each item's position (normal case)", () => {
    const result = gradeSequencingQuest(validQuest, { order: ["item-a", "item-b", "item-c"] });
    expect(result).toEqual({ answered: true, correct: true });
  });

  it("reports incorrect when the last two items are swapped, confirming all-or-nothing scoring (normal case)", () => {
    const result = gradeSequencingQuest(validQuest, { order: ["item-a", "item-c", "item-b"] });
    expect(result).toEqual({ answered: true, correct: false });
  });

  it("reports unanswered when the order is shorter than items.length (boundary case)", () => {
    const result = gradeSequencingQuest(validQuest, { order: ["item-a", "item-b"] });
    expect(result).toEqual({ answered: false, correct: false });
  });

  it("reports unanswered when no order is given at all (boundary case)", () => {
    const result = gradeSequencingQuest(validQuest, {});
    expect(result).toEqual({ answered: false, correct: false });
  });
});

describe("sequencingAnsweredAny", () => {
  it("is true once any order has been written, including a partial one (normal case)", () => {
    expect(sequencingAnsweredAny({ order: ["item-a", "item-b", "item-c"] })).toBe(true);
  });

  it("is true for a partial order even though gradeSequencingQuest still calls it unanswered (boundary case — deliberate, see module doc comment)", () => {
    expect(sequencingAnsweredAny({ order: ["item-a"] })).toBe(true);
    expect(gradeSequencingQuest(validQuest, { order: ["item-a"] }).answered).toBe(false);
  });

  it("is false with no state or an empty order (normal case)", () => {
    expect(sequencingAnsweredAny({})).toBe(false);
    expect(sequencingAnsweredAny()).toBe(false);
  });
});

describe("isSequencingComplete", () => {
  it("matches gradeSequencingQuest's correct field (normal case)", () => {
    const correctResult = gradeSequencingQuest(validQuest, {
      order: ["item-a", "item-b", "item-c"],
    });
    expect(isSequencingComplete(correctResult)).toBe(true);
    const wrongResult = gradeSequencingQuest(validQuest, {
      order: ["item-a", "item-c", "item-b"],
    });
    expect(isSequencingComplete(wrongResult)).toBe(false);
  });
});

describe("sequencingPartialSuccess", () => {
  it("is always false — sequencing is all-or-nothing (normal case)", () => {
    const result = gradeSequencingQuest(validQuest, { order: ["item-a", "item-c", "item-b"] });
    expect(sequencingPartialSuccess(result)).toBe(false);
  });
});

describe("sequencingHint", () => {
  it("returns a non-empty instructive string (normal case)", () => {
    expect(sequencingHint().length).toBeGreaterThan(0);
  });
});
