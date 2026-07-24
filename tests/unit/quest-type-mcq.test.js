import { describe, it, expect } from "vitest";
import {
  McqQuestSchema,
  McqQuestListSchema,
  renderMcqQuest,
  gradeMcqQuest,
  mcqAnsweredAny,
  isMcqComplete,
  mcqPartialSuccess,
  mcqHint,
} from "../../apps/web/src/quest-types/generic/mcq-quest.js";
import { UNIT_01_MCQ_QUESTS } from "../../apps/web/src/content/quests/unit-01-quests.js";

const validQuest = {
  id: "sample-mcq",
  prompt: "Which option is correct?",
  choices: ["First", "Second", "Third"],
  answer: 1,
  explanation: "Second is correct because the fixture says so.",
};

describe("McqQuestSchema", () => {
  it("accepts a well-formed quest (normal case)", () => {
    const result = McqQuestSchema.safeParse(validQuest);
    expect(result.success).toBe(true);
  });

  it("accepts an answer index equal to the last choice (boundary case)", () => {
    const result = McqQuestSchema.safeParse({ ...validQuest, answer: 2 });
    expect(result.success).toBe(true);
  });

  it("rejects an answer index out of range for the choices given (invalid/missing data)", () => {
    const result = McqQuestSchema.safeParse({ ...validQuest, answer: 3 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("out of range"))).toBe(
        true
      );
    }
  });

  it("rejects a quest missing an id (invalid/missing data)", () => {
    const withoutId = { ...validQuest };
    delete withoutId.id;
    const result = McqQuestSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });
});

describe("McqQuestListSchema", () => {
  it("rejects a duplicate quest id (duplicate ID)", () => {
    const result = McqQuestListSchema.safeParse([validQuest, { ...validQuest }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("Duplicate mcq quest id"))
      ).toBe(true);
    }
  });

  it("accepts a real Unit 1 quest list (normal case)", () => {
    const result = McqQuestListSchema.safeParse(UNIT_01_MCQ_QUESTS);
    expect(result.success).toBe(true);
  });
});

describe("renderMcqQuest", () => {
  it("renders the prompt and every choice (normal case)", () => {
    const html = renderMcqQuest(validQuest);
    expect(html).toContain("Which option is correct?");
    expect(html).toContain("First");
    expect(html).toContain("Second");
    expect(html).toContain("Third");
  });

  it("marks the selected choice as checked (normal case)", () => {
    const html = renderMcqQuest(validQuest, { selected: 1 });
    const secondChoiceInput = html.split("<label").find((chunk) => chunk.includes("Second"));
    expect(secondChoiceInput).toContain("checked");
  });

  it("escapes HTML in prompt/choice text (invalid/missing data)", () => {
    const html = renderMcqQuest({
      ...validQuest,
      prompt: '<script>alert("x")</script>',
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("gradeMcqQuest", () => {
  it("reports correct when the selected index matches answer (normal case)", () => {
    expect(gradeMcqQuest(validQuest, { selected: 1 })).toEqual({ answered: true, correct: true });
  });

  it("reports incorrect when the selected index does not match answer (normal case)", () => {
    expect(gradeMcqQuest(validQuest, { selected: 0 })).toEqual({ answered: true, correct: false });
  });

  it("reports unanswered when no selection has been made (boundary case)", () => {
    expect(gradeMcqQuest(validQuest, {})).toEqual({ answered: false, correct: false });
  });
});

describe("mcqAnsweredAny", () => {
  it("is true once a selection is made, including index 0 (boundary case)", () => {
    expect(mcqAnsweredAny({ selected: 0 })).toBe(true);
    expect(mcqAnsweredAny({ selected: "0" })).toBe(true);
    expect(mcqAnsweredAny({ selected: 2 })).toBe(true);
  });

  it("is false with no state or an empty selection (normal case)", () => {
    expect(mcqAnsweredAny({})).toBe(false);
    expect(mcqAnsweredAny()).toBe(false);
    expect(mcqAnsweredAny({ selected: "" })).toBe(false);
  });
});

describe("isMcqComplete", () => {
  it("matches gradeMcqQuest's correct field (normal case)", () => {
    expect(isMcqComplete(gradeMcqQuest(validQuest, { selected: 1 }))).toBe(true);
    expect(isMcqComplete(gradeMcqQuest(validQuest, { selected: 0 }))).toBe(false);
    expect(isMcqComplete(gradeMcqQuest(validQuest, {}))).toBe(false);
  });
});

describe("mcqPartialSuccess", () => {
  it("is always false — mcq has no partial-credit state (normal case)", () => {
    expect(mcqPartialSuccess(gradeMcqQuest(validQuest, { selected: 1 }))).toBe(false);
    expect(mcqPartialSuccess(gradeMcqQuest(validQuest, { selected: 0 }))).toBe(false);
  });
});

describe("mcqHint", () => {
  it("returns a non-empty instructive string (normal case)", () => {
    expect(mcqHint().length).toBeGreaterThan(0);
  });
});
