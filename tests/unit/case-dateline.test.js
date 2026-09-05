// A case says where and when it is set, once.
//
// `caseWhereAndWhen()` merges a case's `location` and its `date` into one dateline, and the merge
// exists because `location` is authored in two shapes. Most carry their own date already —
// "Ellis Island, New York Harbor · 17 April 1907" — and a few are a bare place, "The thirteen
// colonies", which needs the date appended. Printing both unconditionally is Spine Review P10-3:
// twelve of the fourteen non-field missions read "Washington, D.C. · 1816–1837" and then
// "1816–1837" beside it.
//
// The test it shipped with was `location.includes(date)` — a **proxy** for "does the location
// already say when?", and one that holds only while the two dates are the same string. Twenty-two
// of the twenty-seven cases satisfy both readings, so for eight units the proxy and the question
// were indistinguishable.
//
// Units 8 and 9 authored a third shape: a location carrying the *specific* date a document was
// signed or delivered, against a `date` field carrying the *span* the case covers. Two different
// true dates, neither containing the other, concatenated —
//
//     The United States Senate · 1 June 1950 · 1947–1954
//
// — on Unit 8's mission screen and in its Preservation Case, live, and on both of Unit 9's non-field
// cases waiting for the unit to ship.
//
// The e2e guard written for P10-3 walks all sixteen non-field missions and passes on it, because it
// asks whether a **year repeats** rather than whether there are two datelines. The helper and its
// own guard made the same assumption: that the duplication would be verbatim.
//
// So this reads the rule directly, and reads it off `loadChronicleContent()` — the same shape
// `scripts/validate-content.js` consumes, and the reason Unit 9 is covered here while it is
// deliberately absent from `main.js`'s `UNITS`. A guard keyed to the playable table could not have
// seen the two cases that have not shipped yet, which is decision log `0099`'s lesson and `0102`'s.
import { describe, expect, it } from "vitest";

import { caseWhereAndWhen } from "../../apps/web/src/main.js";
import { loadChronicleContent } from "../../apps/web/src/repositories/local-content-repository.js";

const ALL_CASES = Object.entries(loadChronicleContent()).flatMap(([unitKey, bundle]) =>
  (bundle.unit?.cases || []).map((kase) => [`${unitKey} ${kase.id}`, kase])
);

// The game's own dateline separator — the one `caseWhereAndWhen()` joins with.
const SEPARATOR = " · ";
const NAMES_A_YEAR = /\b\d{4}\b/;

const datelineSegments = (kase) =>
  caseWhereAndWhen(kase)
    .split(SEPARATOR)
    .filter((segment) => NAMES_A_YEAR.test(segment));

describe("every case says where and when, once", () => {
  it("finds every registered unit's cases, not just the playable ones (guards the sweep)", () => {
    // Nine units of content and eight in `UNITS`. If this ever drops to twenty-four the sweep has
    // quietly become a check on the playable table, which is the exact thing it exists not to be.
    expect(ALL_CASES.length).toBeGreaterThanOrEqual(27);
  });

  it.each(ALL_CASES)("%s names exactly one date (normal case)", (_label, kase) => {
    expect(
      datelineSegments(kase),
      `${kase.id} renders "${caseWhereAndWhen(kase)}" — location ${JSON.stringify(kase.location)} ` +
        `and date ${JSON.stringify(kase.date)} both name a time, so the mission chip, the field ` +
        `kicker and the badge card all print two datelines run together`
    ).toHaveLength(1);
  });

  it("still appends the date to a location that is only a place (edge case)", () => {
    // The other half, and the reason the fix is not "never append". Two cases are authored as a
    // bare place with no date in them at all, and they are the ones the merge was written for.
    const bare = ALL_CASES.map(([, kase]) => kase).filter(
      (kase) => !NAMES_A_YEAR.test(kase.location)
    );
    expect(bare.map((kase) => kase.id)).toEqual(["case-005", "case-006"]);
    for (const kase of bare) {
      expect(caseWhereAndWhen(kase)).toBe(`${kase.location}${SEPARATOR}${kase.date}`);
    }
  });

  it("leaves a location that already carries its date exactly as authored (edge case)", () => {
    // Twenty-two of the twenty-seven, and the behaviour that must not change: the location is the
    // whole dateline and the `date` field contributes nothing to what is drawn.
    for (const [, kase] of ALL_CASES) {
      if (!NAMES_A_YEAR.test(kase.location)) continue;
      expect(caseWhereAndWhen(kase)).toBe(kase.location);
    }
  });
});
