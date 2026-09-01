// Every mission has a number, and the number is the one its title claims.
//
// `caseNumberLabel()` used to read the number off a `"Case N.NN — "` prefix that only Unit 1's three
// titles carry, so it returned `""` for twenty-four of the twenty-seven cases. It never failed
// anything: all six call sites have a fallback, so a missing number showed up as the map's place
// name in one place, the mission's own name in another, and simply nothing in a third. Spine Review
// P10-5 measured it on the mission screen and routed it to the content queue as a choice between
// numbering twenty-four titles by hand and dropping the eyebrow.
//
// Phase 105 derives it instead — unit number plus position within the unit — which is what makes the
// second test below possible, and the second test is the interesting one. Unit 1's titles still
// carry their authored prefixes, so there are two independent statements of the same three numbers
// in the repository, and this holds them together. If the derivation is ever wrong about where a
// case sits, Unit 1 says so.

import { describe, expect, it } from "vitest";

import { UNITS, caseNumberLabel } from "../../apps/web/src/main.js";

const ALL_CASES = UNITS.flatMap((unit) =>
  unit.cases.map((kase) => [`${unit.id} ${kase.id}`, kase])
);

describe("every mission carries a case number", () => {
  it("finds the registered units and their cases (normal case)", () => {
    // The list this file iterates. An `it.each` over an empty array passes silently, and a numbering
    // test that quietly stops checking is the same defect it exists to catch.
    expect(UNITS.length).toBeGreaterThanOrEqual(8);
    expect(ALL_CASES.length).toBe(UNITS.length * 3);
  });

  it.each(ALL_CASES)("%s has one (normal case)", (_label, kase) => {
    expect(
      caseNumberLabel(kase),
      `${kase.id} has no case number, so its mission kicker opens on the period instead and its ` +
        `activity eyebrow carries the engine name with nothing in front of it`
    ).toMatch(/^Case \d\.\d\d$/);
  });

  it("numbers each unit's cases 01, 02, 03 in order (edge case)", () => {
    for (const unit of UNITS) {
      const expected = unit.cases.map(
        (_kase, index) => `Case ${Number(unit.id.slice("unit-".length))}.0${index + 1}`
      );
      expect(unit.cases.map(caseNumberLabel), `${unit.id} numbers out of order`).toEqual(expected);
    }
  });

  it("agrees with the numbers Unit 1's titles were authored with (normal case)", () => {
    // The only three cases whose number is written down twice. `"Case 1.01 — The Atlantic
    // Crossroads"` is content; `caseNumberLabel()` computes `"Case 1.01"` from position. They are
    // derived from different things and must land on the same string.
    const authored = UNITS[0].cases
      .map((kase) => kase.title.match(/^(Case \d\.\d\d)\s*—/)?.[1])
      .filter(Boolean);
    expect(authored, "Unit 1's titles no longer carry their prefixes").toHaveLength(3);
    expect(UNITS[0].cases.map(caseNumberLabel)).toEqual(authored);
  });

  it("returns nothing for a case no unit contains (edge case)", () => {
    // The one honest empty answer: a case outside every registered unit is a case no screen can
    // reach, and the call sites' fallbacks are what render then.
    expect(caseNumberLabel({ id: "case-999" })).toBe("");
  });
});
