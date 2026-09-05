# 0107 — The duplication was not a repeat

**Phase 108 · 2026-09-04 · Accepted**

Unit 8's second mission printed its dateline as **"The United States Senate · 1 June 1950 ·
1947–1954"**. Two dates, both true, run together as one line. Two more were already authored the
same way in Unit 9 and were waiting for the unit to ship.

`caseWhereAndWhen()` asks the wrong question, and **the test written to catch this asks the same
wrong question** — both look for a repeat, and the duplication is not one.

---

## 1. The helper, and the question it means

A case declares `location` and `date`, and one line is drawn from the two:

```js
kase.location.includes(kase.date) ? kase.location : `${kase.location} · ${kase.date}`;
```

The merge exists because `location` is authored in two shapes and always has been. Twenty-two of
the twenty-seven cases carry their own date — `"Ellis Island, New York Harbor · 17 April 1907"` —
and two are a bare place, `"The thirteen colonies"`, which needs `date` appended. Printing both
unconditionally is Spine Review **P10-3**: twelve non-field missions read "Washington, D.C. ·
1816–1837" and then "1816–1837" beside it.

The question the merge means is **"does the location already say when?"**. What it asks is "does
the location contain _this_ date?" — a proxy, and one that holds only while the two dates are the
same string.

For eight units they were indistinguishable. Every location either contained the exact `date` or
contained no date at all, so the proxy and the question agreed on all twenty-four playable cases.

## 2. The third shape

Units 8 and 9 authored something the corpus had not seen: a location carrying the **specific** date
a document was signed or delivered, against a `date` carrying the **span** the case covers.

| case | `location`                                        | `date`    | printed                               |
| ---- | ------------------------------------------------- | --------- | ------------------------------------- |
| 8.02 | The United States Senate · 1 June 1950            | 1947–1954 | …Senate · 1 June 1950 · 1947–1954     |
| 9.02 | The Cow Palace, Daly City, California · July 1964 | 1964–1981 | …California · July 1964 · 1964–1981   |
| 9.03 | Moscow · 25 December 1991                         | 1983–1992 | Moscow · 25 December 1991 · 1983–1992 |

Neither string contains the other, so the proxy appended. Both are correct history — 1 June 1950 is
the day the Declaration of Conscience was delivered; 1947–1954 is the loyalty program the case is
about — and neither is wrong to have been authored. What is wrong is printing them as one dateline.

Only **8.02 is live**: Unit 9 is registered for validation and deliberately absent from
`main.js`'s `UNITS`. So the other two were caught before a student could see them, which is the
half of this that is worth more than the fix.

## 3. The guard made the same mistake

`tests/e2e/non-field-missions.spec.js` walks all sixteen non-field missions and holds P10-3 with:

```js
const years = meta[0].match(/\d{4}/g) || [];
expect(new Set(years).size).toBe(years.length);
```

That asks whether a **year repeats**. On case 8.02 the years are 1950, 1947 and 1954 — three
distinct numbers — so the assertion passed, every run, on the exact screen it was written to watch.

The helper suppresses only an identical date; the spec flags only an identical year. **Both assume
the duplication will be verbatim**, and the one shape that gets through is the one where the two
dates differ. A guard that shares its subject's assumption is not a second opinion.

## 4. What changed

One predicate:

```js
const LOCATION_NAMES_A_YEAR = /\b\d{4}\b/;
```

Naming a year is the whole test, because naming a year is the only thing `date` adds. Where the
location already names one, the `date` field contributes nothing to what is drawn — **already true
of twenty-two cases**, and this makes it true of the other three rather than changing what any of
the twenty-two render.

The three now print their own dateline and drop the span. That is the right half to keep: the chip
says where and when the case is _set_, and the span is the case's subject, which the mission
screen's own kicker already frames as `Case 8.02 · Period 8 · 1945–1980` and the summary states in
words. The two bare-place cases still append, and a test asserts they are exactly `case-005` and
`case-006` so the fix cannot quietly become "never append".

Three surfaces read this: the mission screen's meta chip, the field screen's kicker, and the
Preservation Case badge card. **The field kicker was never affected** — every field case is one of
the twenty-two — so the live damage was the mission chip and a badge card reading "Reasonable
Grounds Badge / The United States Senate · 1 June 1950 · 1947–1954", which renders whether the
badge is earned or locked.

## 5. Nine units, not eight

`tests/unit/case-dateline.test.js` reads `loadChronicleContent()`, which is keyed off `UNIT_IDS` —
**all nine registered units**, not the eight in `UNITS`.

That is the whole reason it sees 9.02 and 9.03. A guard keyed to the playable table could not have,
and would have gone green today and failed for the first time on the day Unit 9 shipped, which is
the worst possible moment. `0099` is the same lesson with `checkActivityRoutes()` stopping at
Unit 7, and `0102` is the sentence it produced: **key each guard to the table that answers its own
question.** This one asks about authored content, so it keys off the content registry.

The sweep guards itself too — `expect(ALL_CASES.length).toBeGreaterThanOrEqual(27)`, because an
`it.each` over an empty array passes silently and a content sweep that stops finding content is the
failure mode of every content sweep written this way.

## 6. What was deliberately not done

- **No content edited.** All three locations are correct as authored and all three `date` fields
  are correct as authored; the defect was in the join. Editing the content would also have fixed
  three cases and left the fourth author to rediscover it.
- **The badge card still says its place twice** — "Caribbean Badge" over "Caribbean · 1493", on six
  of the twenty-four. That is `shortTitle` doing its job (it means the _place_) next to a dateline
  that also opens with the place. It reads as a name above a caption, not as an error, and changing
  it is a design opinion rather than a defect.
- **`MISSIONS` in the e2e spec stays hand-written.** It is a sixteen-entry list that has been
  extended twice and is currently correct, and the rule it supports is now held by a unit test that
  derives its list. Deriving both is the same coverage twice.
- **The interior proximity gap was measured and left.** `crowdedPairs()` and the
  interactable-reach check run on the eight outdoor maps and on none of the ten interiors, though
  an interior declares exactly the fields an outdoor map declares. All ten are clean — but Unit 8's
  two rooms hold the only object-anchored records in the game, at **1.58 and 1.62 tiles** from
  their nearest NPC against a 1.55 bar. Three pixels of margin, unwatched, on the surface type
  Unit 9 builds next. Its own phase, not this one.

## 7. Verification

`npm run test` — **2,157 passing** across 77 files, 2,127 before; the thirty new are the rule over
all twenty-seven cases plus three shape assertions. Proved against the old predicate by flipping it
back: exactly four fail, and they are 8.02, 9.02, 9.03 and the "leaves the location as authored"
guard.

`npx playwright test non-field-missions` — 10 passed with the rewritten assertion, walking all
sixteen missions. `visual-regression` — 21 passed and **no baseline moved**, which is the expected
result and worth stating: the only string that changed belongs to a case no baseline photographs,
and every field surface was already on the suppressing side of the branch.

`validate:content` 0 errors, `lint` 0 errors and the 5 standing warnings, `format:check`, `cspell`
and `build` clean.
