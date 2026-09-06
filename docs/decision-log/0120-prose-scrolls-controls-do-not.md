# 0120 — Prose scrolls, controls do not

**Phase 121 · 2026-09-06 · Accepted**

Phase 117 fixed the Navigation Table and wrote the rule down in one sentence: **where a control sits
does not depend on how long an author wrote.** It gave that rule one guard, on that one screen.

The survey behind this program found that **two of the eleven student-facing screens have any fold or
clipping assertion at all**, and only the Navigation Table is measured at both sizes a student gets.
This phase measured the other nine, at 1280×720 and 1366×768, on worst-case content.

It found the same defect twice more — on the playing screen and on the screen every mission opens
with, which between them are where a student spends nearly all of their time.

---

## 1. What the suite could and could not see

Three structural facts, all of them true before this phase and none of them written down:

- **`playwright.config.js` sets no viewport at all**, so every spec that does not override it runs at
  Playwright's 1280×720 default — while the 54 viewport baselines are recorded at 1366×768, the
  project's named Chromebook target. Both are sizes students get. Only `archive-navigation.spec.js`
  tested both.
- **No CSS breakpoint exists between 1220px and 1400px.** Every size the game ships at falls inside
  one unbroken layout regime, and the next breakpoint down never fires on target hardware.
- The suite **records content sitting below the fold in seven separate spec comments** and then
  baselines those elements individually to step around it. That is the correct way to baseline a tall
  element and it is not a measurement of whether the element should be tall.

## 2. The map was centred against the prose beside it

`.case-field--living` was `align-items: center`. The middle column is the playable map; the left
column is the case's own kicker, name, question and `copy.intro` — and `copy.intro` is authored per
unit. So the map was centred against a row whose height is an authoring decision.

Measured at 1280×720, with the frame 517px tall in every case:

| Unit             | left column | frame top | frame visible |
| ---------------- | ----------- | --------- | ------------- |
| 1 · Caribbean    | 543         | **131**   | 517 / 517     |
| 3 · Philadelphia | 678         | 180       | 517 / 517     |
| 5 · Richmond     | 988         | 336       | 384 / 517     |
| 8 · Fairmeadow   | 1098        | 390       | 330 / 517     |
| 7 · Ellis Island | 1191        | **437**   | **283 / 517** |

A **306px slide** across the eight maps, and on the unit with the most ground to walk the student met
a map that was **45% below the fold** — under prose, on a screen whose middle column is a painted
world that gives no hint it continues.

`align-items: start`. One line. The frame's top edge now takes **one value, 100, on every unit at
both sizes**, with the whole frame visible on all of them — the same shape as Phase 117's result for
the period strip.

Two earlier `align-items: center` declarations are superseded and neither should be "fixed" instead;
the comment in the CSS says so, because three layered `.case-field--living` blocks is exactly the
condition `INVARIANTS.md` already warns about for `.hub-marker`.

## 3. The status line nobody could see

`#fieldNotice` is the field's only answer to a refused interaction — _"Move closer to interact with
X."_ `CLAUDE.md` gives it its own invariant: a status line, and an attempt that lands must clear the
line left by one that missed.

It was the **last child of that same authored column**. Provoked the way a player provokes it, by
clicking somebody out of reach, at 1280×720:

| Unit             | line's bottom edge | fold |                 |
| ---------------- | ------------------ | ---- | --------------- |
| 1 · Caribbean    | 720                | 720  | on the edge     |
| 5 · Richmond     | 1165               | 720  | **445px under** |
| 8 · Fairmeadow   | 1275               | 720  | **555px under** |
| 7 · Ellis Island | 1368               | 720  | **648px under** |

On five of the eight maps a student clicks a person, nothing appears to happen, and the game's
explanation is half a screen below anything they can see.

The line moved **above** the guiding question rather than merely above `copy.intro`, and that second
step is the one that matters. Placed after the question it cleared the fold everywhere — but by 34px
on Ellis Island, and that margin was still a function of how long the question was, which is the
defect rather than a fix of it. Above the question its position depends only on the case name:
**313–385px on all eight maps at both sizes**, a 72px spread, clearing the fold by 335px in the worst
case. It is `hidden` when empty, so on the screen a player usually sees, nothing moved at all.

The `.field-legend` sentence — "Look for a ✦ …" — was moved to the end of the column rather than
kept above the prose. The Mission Tracker on the map already prints `✦ go here · ✓ secured · ·
locked`, on by default, in the place the marks actually appear; the column's copy is the fuller
version of the same teaching and is reference, not status. **No authored word changed and none was
deleted.**

## 4. The button that starts the mission, again

`0054` put "Begin the mission →" in the giver's column rather than under the instructions, and its
comment says exactly why: _"a heading, an intro, three steps and a glossary put anything below them
off the bottom of the screen, and a click-to-continue control a player has to scroll to find is a
screen that looks stuck."_

That was right. Then the thing it was protecting the button from grew in the other column instead. A
giver's line runs from **nothing at all** on Case 1.01 to **683 characters** at Ellis Island — 133px
of quote against 486px — and the button sat under it:

| Mission                         | quote | button's bottom | at 1280×720     |
| ------------------------------- | ----- | --------------- | --------------- |
| `taino-context`                 | 133   | 544             | clear by 176    |
| `richmond-tredegar-payroll`     | 298   | 708             | clear by **12** |
| `railhead-construction-payroll` | 462   | 873             | **153px under** |
| `port-medical-inspection-card`  | 486   | 915             | **195px under** |

The button is placed against the portrait and the caption now, which are fixed, and the line follows
it. Across the six missions sampled above and below its bottom edge is **411px on five of them and
429 on the sixth**, at both widths, clearing the fold by 291–357px; the guard's eight — one per unit,
each unit's worst — all clear it. The `0054` comment is kept unedited beside it, because it is still
the reason the button is in that column at all.

## 5. What was measured and accepted

The bar is Phase 117's and not "nothing below the fold". A surface a student works down is supposed
to scroll. Measured at both sizes and deliberately left alone:

- **The Practice Check** (4,159px at 1280) and **the Archive Review** (2,868px) — multi-question
  forms. Every input below the fold is a question the student has not reached yet.
- **The activity board's closer** — 667px down on Ellis Island's interview. It is the control that
  finishes the mission, and it sits under the board the mission is played on. The board is visibly
  long and Phase 109 put the objective line at the top, so the screen says what it is waiting for
  where the student is looking.
- **The Codex, the debrief, the warp screens and all three Institute rooms** — nothing below the
  fold at either size.

## 6. The guard

`tests/e2e/fold-and-controls.spec.js`, at both sizes: the map frame opens whole and at one value on
all eight units, and the status line is on screen on all eight when the game writes one.

For Mission Instructions it walks **one mission per unit and the choice is computed rather than
listed** — the one whose `briefing.line` is longest. That is not a proxy: on this screen
`missionGiver()` is called with no overrides and returns `line: activity.briefing.line`, so the
string measured is the string rendered. A mission authored longer tomorrow becomes the one walked the
day it ships, with nothing to update in the spec. It runs at 1280×720 only, because the button's
distance from the top of the document measured identical at both widths and 720 is the smaller
viewport, so the wider one tests a strictly weaker claim.

Both cuts are stated in the file, because the failure this program keeps meeting is a guard that
picks its own example — P5-5 was closed twice against the one state that could not show it.

## 7. The fix made the walker slower, and that had to be paid for

Showing the whole map on every unit means **more of the map is composited every frame**. Richmond went
from 384 of its frame's 517 pixels on screen to all 517. Under worker contention the frame rate drops
further than it used to, and one walk in the suite turned out to have been living on that margin: the
counting-room walk — six tiles, in the narrowest room in the game — went from **0 failures in 5 runs
to 1 in 5**.

It was worth chasing rather than retrying, because the first three explanations were all wrong. The
world state is byte-identical before and after: same nav grid, same open cells, same positions, no
console error. The walk passes in isolation, at one worker, and at two workers with any instrumentation
added — which is the signature of a timing margin rather than a logic defect, and is also why
measuring it took several attempts that each made it pass.

The cause is `walkTo`'s **70ms minimum burst**, which Phase 119 set as "at least something" against a
page running 40+ fps. At the frame rate two contended workers now drop to, 70ms is about one frame,
and a burst that renders one frame can move less than `PROGRESS_TILES` — which the loop reads as a
stall, and four of those strand a leg. The floor is 150ms now: two or three frames even at 15fps, and
a fifth of the 700ms default, so it changes nothing about a burst that had room to be longer anyway.
Back to 0 failures in 5, and all 24 tests across the eight walker-heavy specs pass.

**No slider was turned on the thing being measured.** `PROGRESS_TILES`, `maxStalls` and `maxReplans`
are untouched; what changed is how long a burst is held, which is the input the frame rate eats.

## 8. What this leaves

**The `.field-tracker` contradiction is recorded and not chased.** `global.css` argues the panel must
be 232px wide because "at 208px the header wrapped", and thirty lines down overrides it to **200px
below 1400px** — both in the same Phase 57 commit — so the width the comment defends has never
applied on any screen a student owns. The header carries `white-space: nowrap` inside a parent with
`overflow: hidden`, so the failure mode today would be a silent clip rather than the wrap the comment
describes.
