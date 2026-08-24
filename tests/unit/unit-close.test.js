import { describe, it, expect, beforeEach } from "vitest";
import {
  UNITS,
  progress,
  badgeRecordsForUnit,
  unitReviewFor,
  arcCloseForDebrief,
} from "../../apps/web/src/main.js";
import { loadChronicleContent } from "../../apps/web/src/repositories/local-content-repository.js";
import { unitContentKey } from "../../apps/web/src/content/unit-registry.js";

// Spine Review Part 12 — the unit close. Three of this part's four S2s were the same failure
// wearing different clothes: a per-unit table with an entry for Units 1 and 2, a sane-looking
// fallback for the other five, and no test. `UNIT_MAP_VIEW` (Phase 90I) and `FIELD_COPY` before it
// were the same shape, which is why these assertions are written against `UNITS` itself rather
// than against a list of unit ids somebody has to remember to extend.

const content = loadChronicleContent();

describe("every shipped unit has a badge for every case (P12-3)", () => {
  beforeEach(() => {
    localStorage.clear();
    progress.completedCases = [];
    progress.caseEvidence = {};
  });

  it.each(UNITS.map((unit) => [unit.id, unit]))(
    "%s has one badge per case, each named for its own case (normal case)",
    (_id, unit) => {
      const badges = badgeRecordsForUnit(unit);
      expect(badges).toHaveLength(unit.cases.length);
      expect(badges.map((badge) => badge.id)).toEqual(unit.cases.map((kase) => kase.id));
      badges.forEach((badge, index) => {
        expect(badge.label).toBe(unit.cases[index].shortTitle);
        expect(badge.title).toContain(unit.cases[index].shortTitle);
        expect(badge.icon).toBeTruthy();
      });
    }
  );

  // P12-5: `description` renders in both states, and the two hand-written ones this replaced said
  // the badge "will appear after the … case is archived" — printed under the word "Preserved".
  it.each(UNITS.map((unit) => [unit.id, unit]))(
    "%s describes each badge in terms that are true whether or not it is earned (regression case)",
    (_id, unit) => {
      badgeRecordsForUnit(unit).forEach((badge) => {
        expect(badge.description).toBeTruthy();
        expect(badge.description).not.toMatch(/will appear|once you|after the/i);
      });
    }
  );

  it("returns no badges for something that is not a unit (invalid/missing data)", () => {
    expect(badgeRecordsForUnit({ id: "unit-does-not-exist" })).toEqual([]);
    expect(badgeRecordsForUnit(undefined)).toEqual([]);
  });
});

describe("a unit's Archive Review is its own or none (P12-1)", () => {
  // The defect: every reader ended `|| REVIEW`, so the five units with no authored review rendered
  // Unit 1's under their own heading — questions about the Atlantic World titled "A House Divided".
  it.each(UNITS.map((unit) => [unit.id, unit]))(
    "%s resolves to its own authored review, or to null (normal + boundary case)",
    (id, unit) => {
      const authored = content[unitContentKey(id)]?.review ?? null;
      expect(unitReviewFor(unit)).toBe(authored);
      expect(unitReviewFor(id)).toBe(authored);
    }
  );

  it("resolves nothing for a unit id that does not exist (invalid/missing data)", () => {
    expect(unitReviewFor("unit-99")).toBeNull();
    expect(unitReviewFor(undefined)).toBeNull();
  });

  // The reason the fallback was load-bearing: `submit-review` is the only caller of
  // unlockNextUnit() outside Teacher Mode, so a unit that cannot be reviewed could not be closed.
  // `closeUnit()` is now the shared end of both paths — this pins that every unit has one of them.
  it("leaves every unit with a way to close — a review of its own, or the record button", () => {
    const withoutReview = UNITS.filter((unit) => !unitReviewFor(unit)).map((unit) => unit.id);
    expect(withoutReview).toEqual(["unit-03", "unit-04", "unit-05", "unit-06", "unit-07"]);
  });
});

describe("the case arc close survives whichever mission ends the case (P12-4)", () => {
  // `missionDebriefScreen()` read `activity.arcClose` directly. Exactly one of the three missions in
  // Units 2, 4, 5, 6 and 7 has none authored, so a player who filed that one last saw no arc at all
  // — the case-level payoff, and one ordering in three.
  // One field case per unit, so `sources` is that case's records and `activities` is keyed by
  // record id. A record with no entry there opens the reader rather than a mission.
  const missionsOf = (unitId) => {
    const unit = content[unitContentKey(unitId)];
    return (unit?.sources || [])
      .map((source) => ({ source, activity: unit.activities?.[source.id] }))
      .filter((row) => row.activity);
  };
  const unitsWithAnArc = UNITS.map((unit) => [unit.id, missionsOf(unit.id)]).filter(
    ([, missions]) => missions.some((row) => row.activity.arcClose)
  );

  it("finds units to check at all (guard against a vacuous pass)", () => {
    expect(unitsWithAnArc.map(([id]) => id)).toEqual([
      "unit-02",
      "unit-03",
      "unit-04",
      "unit-05",
      "unit-06",
      "unit-07",
    ]);
  });

  it.each(unitsWithAnArc)(
    "%s resolves an arc close from every one of its three missions (regression case)",
    (_id, missions) => {
      expect(missions).toHaveLength(3);
      missions.forEach(({ source, activity }) => {
        const resolved = arcCloseForDebrief(source.id, activity);
        expect(resolved?.established, `${source.id} resolves no arc close`).toBeTruthy();
      });
    }
  );

  it("still says nothing for a case with no arc close authored anywhere (boundary case)", () => {
    // Unit 1's three missions have none, and that is a content gap rather than this bug — the
    // resolver must not invent one from another case.
    missionsOf("unit-01").forEach(({ source, activity }) => {
      expect(arcCloseForDebrief(source.id, activity)).toBeNull();
    });
  });
});
