import { describe, it, expect } from "vitest";
import { skillsForQuestSlots } from "../../apps/web/src/engine/ced-alignment.js";

const SKILL_ORDER = ["Comparison", "Causation", "Continuity and Change", "Contextualization", "Sourcing"];

describe("skillsForQuestSlots", () => {
  it("adds Sourcing for any hipp slot regardless of quest content (normal case)", () => {
    const slots = [{ questType: "hipp", quest: {} }];
    expect(skillsForQuestSlots(slots, SKILL_ORDER)).toEqual(["Sourcing"]);
  });

  it("reads mcq/sequencing skillCategory directly (normal case)", () => {
    const slots = [
      { questType: "mcq", quest: { skillCategory: "Causation" } },
      { questType: "sequencing", quest: { skillCategory: "Comparison" } },
    ];
    expect(skillsForQuestSlots(slots, SKILL_ORDER)).toEqual(["Comparison", "Causation"]);
  });

  it("ignores mcq/sequencing quests with no skillCategory tag (boundary case)", () => {
    const slots = [{ questType: "mcq", quest: {} }];
    expect(skillsForQuestSlots(slots, SKILL_ORDER)).toEqual([]);
  });

  it("reads every entry of an evidence-organizing quest's rubric.skillCategories (normal case)", () => {
    const slots = [
      {
        questType: "evidence-organizing",
        quest: { rubric: { skillCategories: ["Contextualization", "Sourcing"] } },
      },
    ];
    expect(skillsForQuestSlots(slots, SKILL_ORDER)).toEqual(["Contextualization", "Sourcing"]);
  });

  it("dedupes repeated skills across multiple slots (regression case)", () => {
    const slots = [
      { questType: "mcq", quest: { skillCategory: "Sourcing" } },
      { questType: "hipp", quest: {} },
    ];
    expect(skillsForQuestSlots(slots, SKILL_ORDER)).toEqual(["Sourcing"]);
  });

  it("always returns skills in SKILL_CATEGORIES' own fixed order, not slot order (normal case)", () => {
    const slots = [
      { questType: "mcq", quest: { skillCategory: "Sourcing" } },
      { questType: "mcq", quest: { skillCategory: "Comparison" } },
    ];
    expect(skillsForQuestSlots(slots, SKILL_ORDER)).toEqual(["Comparison", "Sourcing"]);
  });

  it("returns an empty array for an empty slot list (boundary case)", () => {
    expect(skillsForQuestSlots([], SKILL_ORDER)).toEqual([]);
  });
});
