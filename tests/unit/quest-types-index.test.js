import { describe, it, expect } from "vitest";
import { gradeQuest, questSkillOutcomes } from "../../apps/web/src/quest-types/index.js";

const taggedMcq = {
  id: "sample-mcq",
  prompt: "Which option is correct?",
  choices: ["First", "Second"],
  answer: 0,
  explanation: "First is correct.",
  skillCategory: "Sourcing",
};

const saqQuest = {
  id: "sample-saq",
  stimulus: "A sample stimulus.",
  prompts: ["A. Identify one thing.", "B. Explain one thing.", "C. Explain another thing."],
  rubric: "1 point per part.",
};

describe("questSkillOutcomes", () => {
  it("delegates to the quest type's own skillOutcomes implementation (normal case)", () => {
    const state = { selected: 0 };
    const result = gradeQuest("mcq", taggedMcq, state);
    expect(questSkillOutcomes("mcq", taggedMcq, state, result)).toEqual([
      { key: "sample-mcq", skillCategory: "Sourcing", correct: true },
    ]);
  });

  it("returns [] for a quest type with no skillOutcomes contract slot, e.g. saq (boundary case)", () => {
    const state = { responses: { 0: "answer a", 1: "answer b", 2: "answer c" } };
    const result = gradeQuest("saq", saqQuest, state);
    expect(questSkillOutcomes("saq", saqQuest, state, result)).toEqual([]);
  });

  it("throws on an unknown quest type, matching gradeQuest's own guard (invalid/missing data)", () => {
    expect(() => questSkillOutcomes("not-a-real-type", taggedMcq, {}, {})).toThrow(
      /Unknown quest type/
    );
  });
});
