# 0106 — The name had the number in it

**Phase 107 · 2026-09-04 · Accepted**

`INVARIANTS.md` §35 has said since Phase 59 that a mission's number is an eyebrow above its name and
**never inside a heading**. Four student-facing headings held it anyway — the Navigation Table's
route panel, the field screen, the mission card's kicker and the Practice Check's own prose — and
three teacher ones. No heading does now, and the number rides in the eyebrow on every unit's route
panel and field header, where twenty-four of the twenty-seven cases had never had one at all.

The second half of `0104`. Directly enabled by it.

---

## 1. The rule contradicted itself, in one sentence

§35, as written:

> Every student- and teacher-facing surface that _names_ a mission uses `resolvedCaseName()` **or
> `resolvedCaseTitle()`**; the case number ("Case 1.02", via `caseNumberLabel()`) is an eyebrow above
> the name, never inside a heading.

The two clauses cannot both hold. `resolvedCaseTitle()` **is** the number joined to the name, so a
heading built from it violates the second clause while obeying the first. Seven did.

What hid it is the thing that hid `0104`: **the two functions differ only on Unit 1.** Only Unit 1's
three case titles carry a `"Case N.NN — "` prefix, so `resolvedCaseTitle()` and `resolvedCaseName()`
return the identical string for twenty-four cases out of twenty-seven. Pick the wrong one and
nothing looks wrong anywhere except the unit every student plays first.

## 2. What it looked like

The field screen at 1366×768, Case 1.01. Eyebrow **CARIBBEAN · 1493**; heading, in 40px display
type across three lines:

> **Case 1.01 —**
> **The Atlantic Crossroads**

The first full line of the largest text on the screen was the case number. Below it the guiding
question was pushed off the crop.

The Navigation Table — the screen every mission in the game is launched from — printed
`TEACHER UNLOCKED`, then a bare `1493`, then `<h2>Case 1.01 — The Atlantic Crossroads</h2>`. The
number was in the heading and nowhere else, on the one screen whose job is telling missions apart.

And the mission card said it twice. `missionScreen()`'s page kicker has read
`CASE 1.02 · PERIOD 1 · 1491–1607` since `0104`; the card below it opened
`CASE 1.02 — THE EXCHANGE LEDGER`.

## 3. Why this could not have been done before Phase 105

Because the number had nowhere else to go. `caseNumberLabel()` read the number off the title prefix
until `0104`, so it answered for three cases and returned `""` for the other twenty-four. Moving the
number out of a heading and into an eyebrow was only possible where the heading already had one —
which is to say, it was not possible.

`0104` derived the number from the case's position instead, and this is the change that became
available the moment it did. It is also **the gain that is not Unit 1's**: Units 2–8's route panels
printed a bare year and their field headers a bare place, because there was no number to give them.
All eight carry one now.

## 4. What `0104` saw and stopped at

Decision log `0104` §6 recorded, under "deliberately not done":

> The Manage Content headers still pair the number with `resolvedCaseTitle()` … It is a teacher
> surface, the Spine Review excludes those deliberately, and the duplication predates this phase.

That is right about those two headers and wrong about the class. `0104` found the duplication only
where the eyebrow **already** carried the number, which is true of exactly the two Manage Content
headers — and both are teacher surfaces, so the class looked like a teacher problem and was left.

The student surfaces show the opposite shape and were not looked at: their eyebrow carries the place
and the date, so there is no duplication to notice — the number is simply in the heading, on its own,
looking deliberate. **A defect that duplicates is easier to see than the same defect that does not**,
and finding the visible half is not the same as finding the class.

## 5. What changed

Seven headings now call `resolvedCaseName()`:

| surface                                                           | before                                                         | after                                                      |
| ----------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| Navigation Table route panel                                      | `1493` / **Case 1.01 — The Atl…**                              | **Case 1.01 · 1493** / The Atlantic Crossroads             |
| Field screen                                                      | `CARIBBEAN · 1493` / **Case 1.01 —…**                          | **CASE 1.01 · CARIBBEAN · 1493** / The Atlantic Crossroads |
| Mission card kicker                                               | `CASE 1.02 — THE EXCHANGE LEDGER`                              | `THE EXCHANGE LEDGER`                                      |
| Practice Check prose                                              | "grounded in Case 1.01 — The Atlantic Crossroads's own record" | "…in The Atlantic Crossroads's own record"                 |
| Manage Content mission card, locked-mission header, wizard header | number in the eyebrow **and** the heading                      | number in the eyebrow only                                 |

`resolvedCaseTitle()` stays, with four consumers and a doc comment that now says what it is for: a
full reference in prose or a label — two Manage Content status banners, the breadcrumb crumb, and the
atlas marker's `aria-label`. Never a heading.

The sentence in `resolvedCaseName()`'s own comment that licensed the mistake — _"Student-facing names
now all come from here or `resolvedCaseTitle()`"_ — is replaced. The **or** was the whole problem.

## 6. Two guards, because Unit 1 is the only unit that can fail

`tests/unit/main-case-numbering.test.js`, the file `0104` added, gains the rule as an assertion over
all twenty-seven cases: `resolvedCaseName()` must not begin with a case number. Plus one that puts
Unit 1's three back together — `caseNumberLabel()` + " — " + `resolvedCaseName()` must reconstruct
the authored title exactly, em dash and spacing included, which is what proves the split is a split
and not a trim.

`tests/e2e/mission-naming.spec.js` is new and holds the rendered half on three screens, with
`toHaveText` rather than `toContainText` throughout — the finding is eleven extra characters at the
front of a string, and a containment check passes on precisely the string it exists to reject. All
four cases were confirmed failing against `HEAD`'s `main.js` and passing against this one.

Its fourth case is the gain rather than the defect: Unit 4's route panel, which never carried a
number and now does.

## 7. Twenty-two baselines, and the seven that looked alarming

Eleven failed. `--update-snapshots` rewrote **twenty-two** — the same over-reach `0104` §4 hit, and
the reason that entry exists is that it happens every time. So all twenty-two were measured.

- **Ten** are one or two lines of text in a 10–22px band at the eyebrow's own row: `common-cause`,
  and the Fairmeadow, Railhead and Richmond groups with their interiors. 1,000–1,950 px each.
- **`field-caribbean`** is the left column only, 40,577 px, no shift — the heading lost
  `"Case 1.01 — "` and went from three display lines to two, lifting everything under it.
- **`archive-navigation-table`** is the route panel column, 36,247 px, for the same reason.
- **`mission-exchange-ledger`** and its filed twin are 1,330 px in a 7px band — the card kicker.
- **`practice-check-unanswered`** is the reflowed paragraph, 10,865 px.
- **Seven** — the Canal, Immigrant Port and Riverbend groups — changed across the **entire
  viewport**, 163k–288k px, which a text change has no business doing.

That last group is worth the paragraph. The eyebrow gained a line on all eighteen field surfaces, and
on those seven the copy column is the taller side of its row, so the row grew and **the map column
moved down exactly 7px**. Measured directly: Riverbend's viewport went from y 154 to y 161, Canal's
from 255 to 262, Caribbean's did not move at all. Re-cropping each new image 7px lower and comparing
against the old gives **0 differing pixels out of 380,000, on all seven** — a pure translation, with
nothing in the world changed. `#caribbeanWorld`'s transform is `translate(0px, 0px)` on both sides,
so the camera never moved either; the page did.

## 8. What was deliberately not done

- **The breadcrumb keeps the full title.** `Manage Content › Unit 1: … › Case 1.01 — The Atlantic
Crossroads` is a path, not a heading, and a breadcrumb crumb naming a thing in full is normal.
- **The atlas marker's `aria-label` keeps it too.** Its visible label has been `resolvedCaseName()`
  since Phase 59 and stays; the number in the accessible name helps rather than hurts.
- **No content edited**, again, and for the same reason as `0104`: Unit 1's prefixes are what let the
  derived number be checked against an authored one.
- **The field eyebrow now runs to three lines on the longer maps**, and that was left as it renders.
  It reads as a dateline, the hierarchy against a 40px heading is unambiguous, and shortening it
  means dropping either the place or the date from a line that Phase 90K deliberately composed.

## 9. Verification

`npm run test` — **2,127 passing** across 76 files, 2,102 before; the 25 new are the two numbering
rules across all twenty-seven cases. `npx playwright test mission-naming` — 4 passed, and all four
fail against `HEAD`'s `main.js`. `visual-regression`, `archive-navigation`, `non-field-missions`,
`practice-check` — 40 passed on the audited baselines. `field-recall`, `field-interiors`,
`record-and-checks`, `unit-05-missions`, `codex`, `riverbend-arc` — 27 passed. `validate:content` 0
errors, `lint` 0 errors and the 5 standing warnings, `format:check`, `cspell` and `build` clean.

**And by eye**, on the before-and-after crop that made the case: the Caribbean field header, where
the first full line of the biggest text on the screen used to be a case number.
