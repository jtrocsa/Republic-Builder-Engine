import { describe, it, expect } from "vitest";
import {
  SaqQuestSchema,
  SaqQuestListSchema,
  renderSaqQuest,
  gradeSaqQuest,
  saqAnsweredAny,
  isSaqComplete,
  saqPartialSuccess,
  saqHint,
} from "../../apps/web/src/quest-types/history/saq-quest.js";
import { UNIT_03_ARCHIVE_SAQ_QUESTS } from "../../apps/web/src/content/quests/unit-03-quests.js";

const validQuest = {
  id: "sample-saq",
  stimulus: "A sample stimulus quote for testing.",
  prompts: ["A. Identify one thing.", "B. Explain one thing.", "C. Explain another thing."],
  rubric: "SAQ practice rubric: 3 points total. Earn 1 point per part.",
};

describe("SaqQuestSchema", () => {
  it("accepts a well-formed quest (normal case)", () => {
    expect(SaqQuestSchema.safeParse(validQuest).success).toBe(true);
  });

  it("rejects a quest missing an id (invalid/missing data)", () => {
    const withoutId = { ...validQuest };
    delete withoutId.id;
    expect(SaqQuestSchema.safeParse(withoutId).success).toBe(false);
  });

  it("rejects a quest with no prompts (invalid/missing data)", () => {
    expect(SaqQuestSchema.safeParse({ ...validQuest, prompts: [] }).success).toBe(false);
  });

  it("flags a rubric total that disagrees with prompts.length (invalid/missing data)", () => {
    const result = SaqQuestSchema.safeParse({
      ...validQuest,
      rubric: "SAQ practice rubric: 4 points total.",
    });
    expect(result.success).toBe(false);
  });
});

describe("SaqQuestListSchema", () => {
  it("rejects a duplicate quest id (duplicate ID)", () => {
    const result = SaqQuestListSchema.safeParse([validQuest, { ...validQuest }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("Duplicate saq quest id"))
      ).toBe(true);
    }
  });

  it("accepts the real Unit 3 archive SAQ quest list (normal case)", () => {
    expect(SaqQuestListSchema.safeParse(UNIT_03_ARCHIVE_SAQ_QUESTS).success).toBe(true);
  });
});

describe("renderSaqQuest", () => {
  it("renders the stimulus, rubric, and every prompt (normal case)", () => {
    const html = renderSaqQuest(validQuest);
    expect(html).toContain("A sample stimulus quote for testing.");
    expect(html).toContain("SAQ practice rubric");
    expect(html).toContain("A. Identify one thing.");
    expect(html).toContain("B. Explain one thing.");
    expect(html).toContain("C. Explain another thing.");
  });

  it("fills in a saved response for the right prompt index (normal case)", () => {
    const html = renderSaqQuest(validQuest, { responses: { 1: "My answer to part B" } });
    expect(html).toContain("My answer to part B");
  });

  it("escapes HTML in stimulus/prompt text (invalid/missing data)", () => {
    const html = renderSaqQuest({ ...validQuest, stimulus: '<script>alert("x")</script>' });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("gradeSaqQuest", () => {
  it("is complete once every prompt has a non-empty response (normal case)", () => {
    expect(gradeSaqQuest(validQuest, { responses: { 0: "a", 1: "b", 2: "c" } })).toEqual({
      complete: true,
    });
  });

  it("is not complete when a part is missing or blank (boundary case)", () => {
    expect(gradeSaqQuest(validQuest, { responses: { 0: "a", 1: "b" } }).complete).toBe(false);
    expect(gradeSaqQuest(validQuest, { responses: { 0: "a", 1: "b", 2: "   " } }).complete).toBe(
      false
    );
  });

  it("is not complete with no state (normal case)", () => {
    expect(gradeSaqQuest(validQuest, {}).complete).toBe(false);
  });
});

describe("saqAnsweredAny", () => {
  it("is true once any part has non-whitespace text (normal case)", () => {
    expect(saqAnsweredAny({ responses: { 0: "a" } })).toBe(true);
  });

  it("is false with no state or only blank responses (boundary case)", () => {
    expect(saqAnsweredAny({})).toBe(false);
    expect(saqAnsweredAny()).toBe(false);
    expect(saqAnsweredAny({ responses: { 0: "   " } })).toBe(false);
  });
});

describe("isSaqComplete", () => {
  it("matches gradeSaqQuest's complete field (normal case)", () => {
    expect(
      isSaqComplete(gradeSaqQuest(validQuest, { responses: { 0: "a", 1: "b", 2: "c" } }))
    ).toBe(true);
    expect(isSaqComplete(gradeSaqQuest(validQuest, {}))).toBe(false);
  });
});

describe("saqPartialSuccess", () => {
  it("is always false — saq has no partial-credit UI state (normal case)", () => {
    expect(saqPartialSuccess()).toBe(false);
  });
});

describe("saqHint", () => {
  it("returns a non-empty instructive string (normal case)", () => {
    expect(saqHint().length).toBeGreaterThan(0);
  });
});
