// What "Reset Case 1.01" is allowed to touch.
//
// The control has named one case since it shipped, and until Spine Review Part 6 its first
// statement was `progress = resetProgress()` — the whole save, every unit. The lines after it
// re-seeded a handful of Case 1.01 fields, which is what made the shape look deliberate on a quick
// read; `CURRENT-REPOSITORY-AUDIT.md` describes it as "surgically resets only case-001-related
// fields", and that sentence has been wrong for as long as it has existed.
//
// Case 1.01 stays unlocked and replayable all year, so the student most likely to press this button
// is the one with the most to lose: someone in Unit 6 who reopened the Caribbean to revise. These
// cases pin the blast radius.

import { describe, expect, it } from "vitest";

import { resetCaseState } from "../../apps/web/src/main.js";

/** A save mid-Unit-6, with Case 1.01 long finished. */
const saveInProgress = () => ({
  profile: { name: "Ada", appearance: "b" },
  completedCases: ["case-001", "case-002", "case-003", "case-016"],
  unlocked: ["case-001", "case-002", "case-003", "case-016", "case-017"],
  caseEvidence: {
    "case-001": ["taino-context", "columbus-letter"],
    "case-016": ["railhead-land-office-receipt"],
  },
  responses: {
    "taino-context": "a Unit 1 answer",
    "railhead-land-office-receipt": "a Unit 6 answer",
  },
  reconstruction: { "taino-context": "precontact", "railhead-land-office-receipt": "survey" },
  sourceActivities: {
    "taino-context": { completed: true, briefed: true },
    "railhead-land-office-receipt": { briefed: true },
  },
  revealedContexts: ["taino-context", "railhead-land-office-receipt"],
  activeActivitySourceId: "railhead-land-office-receipt",
  codex: { "taino-interview": { filed: true } },
});

const CASE_ONE_SOURCES = ["taino-context", "columbus-letter", "waldseemuller-map"];

describe("resetCaseState", () => {
  it("clears the named case's own records (normal case)", () => {
    const save = resetCaseState(saveInProgress(), "case-001", CASE_ONE_SOURCES);
    expect(save.caseEvidence["case-001"]).toEqual([]);
    expect(save.responses["taino-context"]).toBeUndefined();
    expect(save.reconstruction["taino-context"]).toBeUndefined();
    expect(save.sourceActivities["taino-context"]).toBeUndefined();
    expect(save.revealedContexts).not.toContain("taino-context");
  });

  it("leaves every other unit untouched (normal case)", () => {
    // The whole point. Everything a case owns except its evidence list is keyed by source id, so
    // the case's own source list is the entire key set and nothing else can be caught by it.
    const save = resetCaseState(saveInProgress(), "case-001", CASE_ONE_SOURCES);
    expect(save.caseEvidence["case-016"]).toEqual(["railhead-land-office-receipt"]);
    expect(save.responses["railhead-land-office-receipt"]).toBe("a Unit 6 answer");
    expect(save.reconstruction["railhead-land-office-receipt"]).toBe("survey");
    expect(save.sourceActivities["railhead-land-office-receipt"]).toEqual({ briefed: true });
    expect(save.revealedContexts).toEqual(["railhead-land-office-receipt"]);
  });

  it("keeps badges, unlocks, the Codex and the profile (normal case)", () => {
    // Replaying the fieldwork is what the control offers. Revoking a badge the student earned — and
    // possibly re-locking the case behind it — is not, and the Codex is the one store designed to
    // outlive the case that filled it.
    const save = resetCaseState(saveInProgress(), "case-001", CASE_ONE_SOURCES);
    expect(save.completedCases).toContain("case-001");
    expect(save.unlocked).toContain("case-017");
    expect(save.codex).toEqual({ "taino-interview": { filed: true } });
    expect(save.profile).toEqual({ name: "Ada", appearance: "b" });
  });

  it("releases the tracked activity only when it belongs to this case (edge case)", () => {
    // `activeActivitySourceId` is what the Mission Tracker reads for its in-flight block. Left
    // pointing at a record whose state was just deleted, the panel resolves nothing; cleared when
    // it points at another unit's record, a student loses the mission they were actually in.
    const other = resetCaseState(saveInProgress(), "case-001", CASE_ONE_SOURCES);
    expect(other.activeActivitySourceId).toBe("railhead-land-office-receipt");

    const own = saveInProgress();
    own.activeActivitySourceId = "taino-context";
    expect(resetCaseState(own, "case-001", CASE_ONE_SOURCES).activeActivitySourceId).toBeNull();
  });

  it("survives a save that predates the fields it clears (edge case)", () => {
    // readProgress() deep-merges DEFAULT_PROGRESS, so these are always present in practice — but a
    // reset is the wrong moment to throw, and the optional chaining that prevents it is easy to
    // drop in a later edit.
    expect(() => resetCaseState({}, "case-001", CASE_ONE_SOURCES)).not.toThrow();
    const bare = resetCaseState({}, "case-001", CASE_ONE_SOURCES);
    expect(bare.caseEvidence).toEqual({ "case-001": [] });
    expect(bare.revealedContexts).toEqual([]);
  });

  it("clears nothing when the case owns no records (edge case)", () => {
    const save = resetCaseState(saveInProgress(), "case-002", []);
    expect(save.responses["taino-context"]).toBe("a Unit 1 answer");
    expect(save.caseEvidence["case-002"]).toEqual([]);
    expect(save.caseEvidence["case-001"]).toEqual(["taino-context", "columbus-letter"]);
  });
});
