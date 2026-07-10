import { describe, it, expect, beforeEach } from "vitest";
import { progress, badgeRecordsForUnit, unlockNext } from "../../apps/web/src/main.js";
import { UNIT_01 } from "../../apps/web/src/content/unit-01-campaign.js";

beforeEach(() => {
  localStorage.clear();
  progress.completedCases = [];
  progress.unlocked = ["case-001"];
  progress.caseEvidence = { "case-001": [] };
});

describe("badgeRecordsForUnit", () => {
  it("marks the Caribbean badge unearned before completion or evidence (normal case)", () => {
    const badges = badgeRecordsForUnit(UNIT_01);
    const caribbean = badges.find((b) => b.id === "case-001");
    expect(caribbean.earned).toBe(false);
  });

  it("marks the Caribbean badge earned once the case is completed (normal case)", () => {
    progress.completedCases.push("case-001");
    const caribbean = badgeRecordsForUnit(UNIT_01).find((b) => b.id === "case-001");
    expect(caribbean.earned).toBe(true);
  });

  it("also earns the Caribbean badge from evidence count alone, without completion (boundary case)", () => {
    // badgeRecordsForUnit's case-001 rule is an OR of completedCases / evidence>=3 -
    // this pins that OR so a future refactor to AND doesn't silently relock the badge.
    progress.caseEvidence["case-001"] = ["taino-context", "columbus-letter", "waldseemuller-map"];
    const caribbean = badgeRecordsForUnit(UNIT_01).find((b) => b.id === "case-001");
    expect(caribbean.earned).toBe(true);
  });

  it("returns no badges for a unit id with no configured badges (invalid/missing data)", () => {
    expect(badgeRecordsForUnit({ id: "unit-does-not-exist" })).toEqual([]);
  });
});

describe("unlockNext", () => {
  it("completes the given case and unlocks the next one in sequence (normal case)", () => {
    unlockNext("case-001");
    expect(progress.completedCases).toContain("case-001");
    expect(progress.unlocked).toContain("case-002");
  });

  it("does not duplicate entries when called twice for the same case (boundary case)", () => {
    unlockNext("case-001");
    unlockNext("case-001");
    expect(progress.completedCases.filter((id) => id === "case-001")).toHaveLength(1);
    expect(progress.unlocked.filter((id) => id === "case-002")).toHaveLength(1);
  });

  it("completes the final case in a unit without unlocking anything invalid (boundary case)", () => {
    // case-003 is the last case in UNIT_01 - there is no "next" case to push.
    unlockNext("case-003");
    expect(progress.completedCases).toContain("case-003");
    expect(progress.unlocked).not.toContain(undefined);
  });
});
