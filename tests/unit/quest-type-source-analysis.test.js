import { describe, it, expect } from "vitest";
import {
  HippOptionSchema,
  HippPromptSchema,
  SourceAnalysisQuestSchema,
  SourceAnalysisQuestListSchema,
  renderSourceAnalysisQuest,
  gradeSourceAnalysisQuest,
} from "../../apps/web/src/quest-types/history/source-analysis-quest.js";
import { UNIT_01_SOURCE_ANALYSIS_QUESTS } from "../../apps/web/src/content/quests/unit-01-quests.js";

const validHippPrompt = {
  id: "sample-hipp-prompt",
  dimension: "Purpose",
  argument: "The author's purpose shapes what is emphasized in the account.",
  options: [
    {
      id: "explained",
      text: "Because the author wanted continued support, the account foregrounds favorable details.",
      correct: true,
    },
    {
      id: "named-only",
      text: "The author's purpose was to report on the voyage.",
      identificationOnly: true,
      correct: false,
    },
    {
      id: "wrong-distractor",
      text: "The author's purpose was to record navigational data only.",
      correct: false,
    },
  ],
};

const validQuest = {
  id: "sample-source-analysis",
  prompt: "Analyze this document using HIPP reasoning.",
  document: {
    text: "A sample historical document excerpt.",
    attribution: "A Sample Author, 1500",
  },
  hippPrompts: [validHippPrompt],
};

describe("HippOptionSchema", () => {
  it("accepts a well-formed option (normal case)", () => {
    const result = HippOptionSchema.safeParse(validHippPrompt.options[0]);
    expect(result.success).toBe(true);
  });

  it("rejects an option that is both correct and identificationOnly (invalid/missing data)", () => {
    const result = HippOptionSchema.safeParse({
      id: "bad-option",
      text: "Some text.",
      correct: true,
      identificationOnly: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("cannot be both correct and identificationOnly"),
        ),
      ).toBe(true);
    }
  });
});

describe("HippPromptSchema", () => {
  it("accepts a well-formed prompt (normal case)", () => {
    const result = HippPromptSchema.safeParse(validHippPrompt);
    expect(result.success).toBe(true);
  });

  it("rejects a prompt with zero correct options (invalid/missing data)", () => {
    const result = HippPromptSchema.safeParse({
      ...validHippPrompt,
      options: validHippPrompt.options.map((option) => ({ ...option, correct: false })),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("must contain exactly one correct, explanation-linked option"),
        ),
      ).toBe(true);
    }
  });

  it("rejects a prompt with more than one correct option (invalid/missing data)", () => {
    const result = HippPromptSchema.safeParse({
      ...validHippPrompt,
      options: [
        validHippPrompt.options[0],
        { ...validHippPrompt.options[1], identificationOnly: false, correct: true },
        validHippPrompt.options[2],
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("must contain exactly one correct, explanation-linked option"),
        ),
      ).toBe(true);
    }
  });

  it("rejects a prompt with no identificationOnly distractor at all (invalid/missing data)", () => {
    const result = HippPromptSchema.safeParse({
      ...validHippPrompt,
      options: validHippPrompt.options.map((option) => ({ ...option, identificationOnly: false })),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("must include at least one identification-only distractor"),
        ),
      ).toBe(true);
    }
  });

  it("rejects a prompt with fewer than 3 options (boundary case)", () => {
    const result = HippPromptSchema.safeParse({
      ...validHippPrompt,
      options: validHippPrompt.options.slice(0, 2),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("needs at least 3 candidate statements")),
      ).toBe(true);
    }
  });

  it("rejects a duplicate option id within one prompt (duplicate ID)", () => {
    const result = HippPromptSchema.safeParse({
      ...validHippPrompt,
      options: [
        validHippPrompt.options[0],
        { ...validHippPrompt.options[1], id: validHippPrompt.options[0].id },
        validHippPrompt.options[2],
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("Duplicate option id"))).toBe(
        true,
      );
    }
  });
});

describe("SourceAnalysisQuestSchema", () => {
  it("accepts a well-formed quest (normal case)", () => {
    const result = SourceAnalysisQuestSchema.safeParse(validQuest);
    expect(result.success).toBe(true);
  });

  it("rejects more than 2 hippPrompts (invalid/missing data)", () => {
    const result = SourceAnalysisQuestSchema.safeParse({
      ...validQuest,
      hippPrompts: [
        validHippPrompt,
        { ...validHippPrompt, id: "second-prompt", dimension: "Point of view" },
        { ...validHippPrompt, id: "third-prompt", dimension: "Historical situation" },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("tag only the 1-2 HIPP dimensions"),
        ),
      ).toBe(true);
    }
  });

  it("rejects two hippPrompts that both tag the same dimension (duplicate ID)", () => {
    const result = SourceAnalysisQuestSchema.safeParse({
      ...validQuest,
      hippPrompts: [validHippPrompt, { ...validHippPrompt, id: "second-prompt" }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("Duplicate HIPP dimension"),
        ),
      ).toBe(true);
    }
  });
});

describe("SourceAnalysisQuestListSchema", () => {
  it("rejects a duplicate quest id across the list (duplicate ID)", () => {
    const result = SourceAnalysisQuestListSchema.safeParse([validQuest, { ...validQuest }]);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("Duplicate source-analysis quest id"),
        ),
      ).toBe(true);
    }
  });

  it("accepts the real Unit 1 source-analysis quest list (normal case)", () => {
    const result = SourceAnalysisQuestListSchema.safeParse(UNIT_01_SOURCE_ANALYSIS_QUESTS);
    expect(result.success).toBe(true);
  });
});

describe("renderSourceAnalysisQuest", () => {
  it("renders the document text/attribution and every hippPrompt's options (normal case)", () => {
    const html = renderSourceAnalysisQuest(validQuest);
    expect(html).toContain("A sample historical document excerpt.");
    expect(html).toContain("A Sample Author, 1500");
    expect(html).toContain("Because the author wanted continued support");
    expect(html).toContain("purpose was to report on the voyage.");
    expect(html).toContain("purpose was to record navigational data only.");
  });

  it("marks the selected option as checked via state.selected (normal case)", () => {
    const html = renderSourceAnalysisQuest(validQuest, {
      selected: { "sample-hipp-prompt": "explained" },
    });
    const optionChunk = html
      .split("<label")
      .find((chunk) => chunk.includes("Because the author wanted continued support"));
    expect(optionChunk).toContain("checked");
  });

  it("escapes HTML in document text containing an XSS payload (invalid/missing data)", () => {
    const html = renderSourceAnalysisQuest({
      ...validQuest,
      document: { ...validQuest.document, text: '<img src=x onerror=alert(1)>' },
    });
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});

describe("gradeSourceAnalysisQuest", () => {
  const shippedQuest = UNIT_01_SOURCE_ANALYSIS_QUESTS[0];
  const audiencePrompt = shippedQuest.hippPrompts.find((prompt) => prompt.id === "columbus-audience");
  const identificationOnlyOption = audiencePrompt.options.find((option) => option.identificationOnly);
  const explanationLinkedOption = audiencePrompt.options.find((option) => option.correct);

  it("scores an identification-only distractor as zero for that dimension (invalid/missing data)", () => {
    const result = gradeSourceAnalysisQuest(shippedQuest, {
      selected: { "columbus-audience": identificationOnlyOption.id },
    });
    expect(result.results["columbus-audience"]).toBe(false);
    expect(result.pointsEarned).toBe(0);
  });

  it("scores the correct explanation-linked option as earned for that dimension (normal case)", () => {
    const result = gradeSourceAnalysisQuest(shippedQuest, {
      selected: { "columbus-audience": explanationLinkedOption.id },
    });
    expect(result.results["columbus-audience"]).toBe(true);
    expect(result.pointsEarned).toBe(1);
  });

  it("scores a dimension false when no selection is made for its prompt (boundary case)", () => {
    const result = gradeSourceAnalysisQuest(shippedQuest, { selected: {} });
    expect(result.results["columbus-audience"]).toBe(false);
    expect(result.results["columbus-purpose"]).toBe(false);
    expect(result.pointsEarned).toBe(0);
  });

  it("is complete only when pointsEarned equals pointsPossible (normal case)", () => {
    const purposePrompt = shippedQuest.hippPrompts.find((prompt) => prompt.id === "columbus-purpose");
    const purposeCorrectOption = purposePrompt.options.find((option) => option.correct);

    const partial = gradeSourceAnalysisQuest(shippedQuest, {
      selected: { "columbus-audience": explanationLinkedOption.id },
    });
    expect(partial.complete).toBe(false);

    const full = gradeSourceAnalysisQuest(shippedQuest, {
      selected: {
        "columbus-audience": explanationLinkedOption.id,
        "columbus-purpose": purposeCorrectOption.id,
      },
    });
    expect(full.pointsEarned).toBe(full.pointsPossible);
    expect(full.complete).toBe(true);
  });
});
