// A content change must not take completed work away from a student mid-unit.
//
// Phase 58 replaced Unit 1's and Unit 2's unit-level Archive Challenges with real SAQs, and re-typed
// two case missions. unitArchiveChallengesComplete() matches on questId, so on its own that change
// makes any save that had finished the old challenges read as incomplete — which re-locks the unit's
// Archive Review, with nothing on screen to explain why. RETIRED_ARCHIVE_CHALLENGE_IDS maps each
// retired id to the challenge it now satisfies, and these assertions pin both halves of that:
// completed work still counts, and nothing is granted for work never done.

import { describe, expect, it } from "vitest";

import {
  RETIRED_ARCHIVE_CHALLENGE_IDS,
  archiveChallengeSatisfied,
} from "../../apps/web/src/main.js";
import { UNIT_01 } from "../../apps/web/src/content/unit-01-campaign.js";
import { UNIT_02 } from "../../apps/web/src/content/unit-02-campaign.js";
import { UNIT_03 } from "../../apps/web/src/content/unit-03-campaign.js";

const complete = (...ids) =>
  Object.fromEntries(ids.map((id) => [id, { status: "complete", completedAt: "2026-07-01" }]));

describe("retired Archive Challenge ids", () => {
  it("counts a finished predecessor as satisfying its replacement (normal case)", () => {
    const save = complete("unit-01-archive-claim-and-evidence-builder");
    expect(archiveChallengeSatisfied("unit-01-archive-atlantic-world-saq", save)).toBe(true);
  });

  it("counts the challenge itself when it was completed directly (normal case)", () => {
    const save = complete("unit-01-archive-atlantic-world-saq");
    expect(archiveChallengeSatisfied("unit-01-archive-atlantic-world-saq", save)).toBe(true);
  });

  it("takes either of Unit 2's two retired questions as the one that replaced them (edge case)", () => {
    // Unit 2 had *two* mcq challenges and now has one SAQ. Requiring both would punish a student who
    // was partway through when the content changed, for a reason they cannot see.
    for (const retired of [
      "unit-02-archive-strongest-evidence-coerced-labor",
      "unit-02-archive-strongest-evidence-mercantile-policy",
    ]) {
      expect(
        archiveChallengeSatisfied("unit-02-archive-colonial-crossroads-saq", complete(retired))
      ).toBe(true);
    }
  });

  it("grants nothing for work never done (edge case)", () => {
    expect(archiveChallengeSatisfied("unit-01-archive-atlantic-world-saq", {})).toBe(false);
    // An unrelated completion must not satisfy a different unit's challenge.
    expect(
      archiveChallengeSatisfied(
        "unit-02-archive-colonial-crossroads-saq",
        complete("unit-01-archive-claim-and-evidence-builder")
      )
    ).toBe(false);
    // An in-progress record is not a completion.
    expect(
      archiveChallengeSatisfied("unit-01-archive-atlantic-world-saq", {
        "unit-01-archive-claim-and-evidence-builder": { status: "in-progress" },
      })
    ).toBe(false);
  });

  it("names a real, current challenge as every retired id's replacement (edge case)", () => {
    // A typo here would silently do nothing — the map would just never match. Every replacement must
    // be a questId some unit or case actually points at today.
    const live = new Set([
      ...[UNIT_01, UNIT_02, UNIT_03].flatMap((unit) => [
        ...unit.archiveChallenges.map((challenge) => challenge.questId),
        ...unit.cases.filter((c) => c.archiveChallenge).map((c) => c.archiveChallenge.questId),
      ]),
    ]);
    const dangling = Object.entries(RETIRED_ARCHIVE_CHALLENGE_IDS)
      .filter(([, replacementId]) => !live.has(replacementId))
      .map(([retiredId, replacementId]) => `${retiredId} -> ${replacementId}`);
    expect(dangling).toEqual([]);
  });

  it("never lists a still-live questId as retired (edge case)", () => {
    const live = new Set([
      ...[UNIT_01, UNIT_02, UNIT_03].flatMap((unit) => [
        ...unit.archiveChallenges.map((challenge) => challenge.questId),
        ...unit.cases.filter((c) => c.archiveChallenge).map((c) => c.archiveChallenge.questId),
      ]),
    ]);
    const stillLive = Object.keys(RETIRED_ARCHIVE_CHALLENGE_IDS).filter((id) => live.has(id));
    expect(stillLive).toEqual([]);
  });
});

describe("the mission / Archive Room split", () => {
  it("gives every non-map case its own quest, and none to a map case (normal case)", () => {
    const wrong = [];
    for (const unit of [UNIT_01, UNIT_02, UNIT_03]) {
      for (const kase of unit.cases) {
        if (kase.route === "mission" && !kase.archiveChallenge) {
          wrong.push(`${kase.id}: mission with no quest`);
        }
        if (kase.route === "field" && kase.archiveChallenge) {
          wrong.push(`${kase.id}: map case with a mission quest`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it("keeps the Archive Room to written work and the missions to the swappable four (normal case)", () => {
    // The rule the split is for. The four types a teacher can swap through Manage Content
    // (QUEST_SLOT_TYPES in main.js) are mission work; SAQ and DBQ are what the Archive Terminal
    // opens. Without this, a unit-level challenge drifting back to mcq would quietly undo the split.
    const swappable = new Set(["mcq", "sequencing", "evidence-organizing", "hipp"]);
    const written = new Set(["saq", "dbq"]);
    const wrong = [];
    for (const unit of [UNIT_01, UNIT_02, UNIT_03]) {
      for (const challenge of unit.archiveChallenges) {
        if (!written.has(challenge.questType)) {
          wrong.push(`${unit.id} Archive Room: ${challenge.questType} belongs to a mission`);
        }
      }
      for (const kase of unit.cases.filter((c) => c.archiveChallenge)) {
        if (!swappable.has(kase.archiveChallenge.questType)) {
          wrong.push(`${kase.id}: ${kase.archiveChallenge.questType} belongs in the Archive Room`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it("does not give two missions in the same unit the same quest type (edge case)", () => {
    // The reported complaint behind the split was that every non-map case felt like the same one, and
    // five of the six were evidence-organizing. Scoped per unit, not globally: a student meets a
    // unit's missions together.
    const clashes = [];
    for (const unit of [UNIT_01, UNIT_02, UNIT_03]) {
      const types = unit.cases
        .filter((c) => c.archiveChallenge)
        .map((c) => c.archiveChallenge.questType);
      if (new Set(types).size !== types.length) clashes.push(`${unit.id}: ${types.join(", ")}`);
    }
    expect(clashes).toEqual([]);
  });
});
