# 0116 — The controls sat under the prose

**Phase 117 · 2026-09-06 · Accepted**

**P5-5 re-opened and closed for a second time.** The Navigation Table's period strip ran past the
bottom of the screen, which is what that finding said in the first place, in August, at five units.
It was fixed in Phase 90C and re-measured clear in Phase 107. Both of those measurements — and the
spec written to hold the fix — read the same state: **Unit 1 selected, two cases unlocked**, which
is the one state on this screen that cannot show the defect.

Phase 116 found it while measuring something else, and [`0115`](./0115-the-strip-had-four-states-and-drew-two.md)
§2 recorded it rather than fixing it, because it moves a committed baseline and wants its guard
strengthened in the same commit. This is that commit. What it also found is that **the strip was
not the worst thing below the fold on this screen.**

---

## 1. Both columns had the same defect, and it was not the strip's

`archiveScreen()` renders three columns. The left one ran:

> back link · kicker · `<h1>` · "Select a marker to read its route." · **the selected unit's guiding
> question** · the period strip · the ✦/✓/○ legend

and the right one ran:

> availability · case number and date · the mission's name · **the case summary** · place and status ·
> **Initiate Chronotravel →** · the locked reason · the evidence count · Try a Mini-Game → · the
> unit-close button

In both columns, everything a student came to press sat underneath a block of authored prose. And
that prose is **not the same length in every unit** — it has grown steadily, unit over unit, the
same drift the Beta Readiness plan already measured on the activity screens, where Unit 1's three
missions total 4,497 words against Unit 7's 11,380 for the same shape.

The case summary, first case of each unit, in words:

| Unit  | 1      | 2   | 3   | 4   | 5   | 6   | 7      | 8      |
| ----- | ------ | --- | --- | --- | --- | --- | ------ | ------ |
| Words | **18** | 34  | 37  | 44  | 42  | 53  | **77** | **79** |

Eighteen words is five lines in the route panel. Seventy-nine is sixteen.

## 2. What that put off the screen

Measured on the real screen with the whole course unlocked — every unit selected in turn, at both of
the sizes a student actually gets. `✗` is below the fold.

**1280×720**, the Chromebook target:

| Unit | Period tabs off | Legend    | Initiate Chronotravel | Try a Mini-Game |
| ---- | --------------- | --------- | --------------------- | --------------- |
| 1    | —               | 670       | 530                   | 613             |
| 2    | —               | 706       | 614                   | 697             |
| 3    | —               | 718       | 638                   | **722 ✗**       |
| 4    | —               | 704       | 638                   | **722 ✗**       |
| 5    | —               | 683       | 623                   | 707             |
| 6    | —               | **754 ✗** | 711                   | **794 ✗**       |
| 7    | **6**           | **861 ✗** | **815 ✗**             | **899 ✗**       |
| 8    | **4**           | **830 ✗** | **808 ✗**             | **892 ✗**       |

**1366×768**, where the baselines live: Unit 7 put **two tabs**, the legend and the Chronotravel
button below the fold; Unit 8 put the legend and the button below it. Everything through Unit 6 was
clear.

So the headline is not the strip. **On Units 7 and 8 the gold button that starts the mission — the
one control this screen exists to offer — was entirely below the fold at 1280×720 and clipped to its
top 22–29 pixels at 1366×768.** The middle column is a full-bleed painted map with a border round it;
nothing on the screen says there is anything underneath.

`archive-navigation.spec.js`'s "every unit tab is reachable without scrolling" asserts exactly the
thing the table above contradicts, and passed every run for nine phases. **A guard that picks its own
example picks the flattering one** — the third time in three phases, after the warp seeding one of
the two plates that nearly match ([`0114`](./0114-the-painting-was-of-somewhere-else.md) §6) and the
plate table testing every claim except the one that was wrong.

## 3. The rule

**Where a control sits does not depend on how long an author wrote.**

Each column now runs its navigation, then the legend that reads it, then its buttons, and the prose
trails. Concretely:

- The period strip and the ✦/✓/○ legend move **above** the guiding question. They move together,
  because the legend is what teaches the tick the strip started drawing last phase, and separating
  the two would undo that.
- The case summary moves to the **end** of the route panel, below every button, behind a hairline
  rule. It gets a class of its own, `.route-summary`, and that rule is the sentence: controls above
  it, description below.
- `.archive-copy` is pinned to the **top** of its grid row instead of centred in it. The row is as
  tall as the tallest of the three columns, which on the long units is the route panel — so a
  centred left column started 107px down on Unit 1 and 196px down on Unit 8, and **the period strip
  slid 89px out from under the cursor that had just clicked it.**

After, at both sizes, on all eight units:

| Thing                 | 1280×720            | 1366×768            |
| --------------------- | ------------------- | ------------------- |
| Strip, top edge       | **318, every unit** | **326, every unit** |
| Strip, bottom edge    | 446                 | 420                 |
| Legend, bottom edge   | 510                 | 458                 |
| Initiate Chronotravel | 383–436             | 390–436             |
| Try a Mini-Game       | 467–520             | 473–520             |

The strip is where it is because of the chrome and the heading above it and for no other reason. The
button that starts the mission clears the fold by 284px on the worst unit instead of missing it by 95.

## 4. What this costs

The guiding question and the case summary can now run below the fold, and on Units 7 and 8 they do —
the question by 23px on Unit 8 at 1280×720, and the summary by rather more. That is the trade, taken deliberately:
**prose scrolls, controls do not.** Both are still whole, still in the reading order they were
written for, and neither has changed by a word.

The page already scrolled before this change on seven of the eight units at 1280×720 and five of
them at 1366×768, for the same reason. What is different is what the scroll is now hiding.

## 5. What did not change

- **No authored word.** No content file is in this diff.
- **The atlas table and its markers**, in every respect.
- **The tick from Phase 116.** It costs no width and it still costs no width; the strip has the same
  rows and the same eight 73px pills it had.
- **`.route-panel`'s own centring**, and the grid's `align-items`. Only the left column's
  `align-self` changed, because only the left column carries navigation.
- **One baseline moved**: `archive-navigation-table`. The diff was opened and every difference in it
  is one of the three above. The other 60 baselines are untouched.

## 6. The guard

The old case stays exactly as it was, with a note saying which state it reads and that for nine
phases it was the only state anything looked at. Beside it, a new one walks **all eight periods at
both viewports** with the whole course unlocked, and asserts for each:

- no period tab's bottom edge past the window,
- the legend's bottom edge not past it,
- the Chronotravel button's not past it, named in the failure message by the mission it opens,
- the mini-game route's not past it,
- and, once at the end, that **the strip's top edge took exactly one value across all eight units** —
  which is the rule from §3 rather than a symptom of it.

Two details in it are load-bearing. It measures from `window.scrollTo(0, 0)`, because clicking a tab
that is below the fold makes Playwright scroll it into view, and every rect read after that is read
against a scrolled viewport — the exact state in which this defect looks like a pass. And the eight
unit ids are written out rather than derived from `UNITS`, for the same reason the tab count already
was: a list read off the thing under test cannot notice a unit arriving.

Reverted against the pre-phase tree it fails at 1280×720 on Unit 3 — the mini-game route, four units
earlier than anyone had looked — and at 1366×768 on Unit 7's period tabs.

## 7. What this leaves

Nothing routed is open. The finding this phase closes was the last one carried out of Phase 116, and
both ledgers are otherwise clear.

One thing is worth writing down rather than acting on: the case summary is rendered again, in full,
on the mission board the gold button leads to (`main.js`'s activity copy column) and a third time in
the Codex. Phase 109 spent a whole phase on that shape one screen over — "the column says it twice."
Whether the Navigation Table needs the summary at all is a content-shaped question, and this program
does not edit content.
