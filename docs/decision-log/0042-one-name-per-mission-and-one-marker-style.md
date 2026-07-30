# 0042 — One name per mission, one marker style, one page height

**Status:** accepted · **Phase:** 59 · **Date:** 2026-07-30

Four defects from one playtest of Case 1.02, reported together because they are what the screen
actually looks like. Three are naming/UI-consistency rules that constrain future work; one is a
layout bug with a general fix.

## 1. A mission has exactly one name

**The problem.** Opening Case 1.02 from the Navigation Table showed a student four names for one
thing on two screens: the map marker said "Atlantic Routes" (`case.shortTitle`), the route panel
heading said "Case 1.02 — The Exchange Ledger" (`case.title`), the chip beside it and the primary
button both said "Atlantic Route Puzzle" (`case.mechanic` — "Open Atlantic Route Puzzle →"), and the
teacher's Manage Content wizard called it "The Exchange Ledger". Nothing was wrong individually;
together they made it unclear that all four referred to the same mission.

**The rule.** A mission's name is the name half of `case.title`, resolved through the teacher
override — `resolvedCaseName()` in `main.js`, beside the existing `resolvedCaseTitle()`. Everywhere
a student or a teacher sees a mission named, the string comes from `resolvedCaseName()` or
`resolvedCaseTitle()`. The case number ("Case 1.02", via `caseNumberLabel()`) is an eyebrow above
the name, never part of a heading that has to fit in a column.

Consequences, in the order a player meets them:

| Surface              | Before                               | After                                                               |
| -------------------- | ------------------------------------ | ------------------------------------------------------------------- |
| Map marker           | `shortTitle` — "Atlantic Routes"     | `resolvedCaseName()` — "The Exchange Ledger"                        |
| Route panel heading  | `case.title`, unresolved             | `resolvedCaseTitle()`                                               |
| Route panel chips    | location · **mechanic** · status     | location · status                                                   |
| Chronotravel button  | "Open Atlantic Route Puzzle"         | "Open The Exchange Ledger"                                          |
| Mission screen       | h1 "Case 1.02 — The Exchange Ledger" | kicker "Case 1.02 · Period 1 · 1491–1607", h1 "The Exchange Ledger" |
| Locked reason        | "Complete Caribbean to unlock…"      | "Complete The Atlantic Crossroads to unlock…"                       |
| Teacher mission card | `shortTitle`                         | `caseNumberLabel()`                                                 |

**`mechanic` is now teacher-side only.** It survives in content (schema-required) and in
`caseKindDetail()`'s help text on teacher screens, where "what kind of activity is this" is the
question being answered. It is not a name and must not be rendered as one on a student surface.

**`shortTitle` keeps one job:** the _place_, in Case 1.01's field flow ("← Back to Caribbean field",
"relaying the completed Caribbean record"). It is not rename-aware and must not be used where a
mission is being named — that was the original defect, since a teacher who renamed a mission saw the
old word on the map.

**Side effect worth knowing:** mission names are roughly twice the width of the place names they
replaced, so `.route-marker b` wraps (13ch) and `declutterMarkerPositions()` now also assigns each
marker a label side — left to right, each marker takes the slot below its dot unless a label is
already there, otherwise above. The function's remit was already "nudge for legibility, never touch
`mapPosition`"; this extends it from dots to labels.

## 2. An interactable object is marked one way

**The problem.** The Institute had grown three unrelated treatments for the same idea: the
Navigation Table was a `✦` medallion with a label under it (floating _below_ the table, not on it),
the Archive Room door was the same class with a `▤`, and the Preservation Case was a separate teal
pill with a `▣` and a `!` badge, sitting a full height above its anchor. Between them they were
~14 layered `!important` CSS blocks accumulated across many milestones, several of which existed
only to undo an earlier layer.

**The rule.** One class, `.hub-marker`, for every interactable object in either hub room. The marker
is a transparent rect laid over the object's **own painted tiles**, so what glows is the thing
itself; a label pill names it from above (below only where there is no row above it — the Main
Hall's north doorway sits on row 0). No glyphs and no `!` badge: proximity is already carried by the
near-state pulse and the "Press E · …" prompt.

The footprint comes from the generator stamp that painted the object, declared on the target as
`marker: { col, row, w, h }` and turned into pixels by `hubMarkerStyle()` — tile column _C_ spans
`[C*tile, (C+1)*tile)`, so the rect lands exactly on the art. **When an object moves in a generator,
its marker rect moves with it** — that is the coupling that makes this maintainable, and the reason
the marker is declared next to the interaction point rather than in CSS.

NPCs are deliberately _not_ folded in: a name under a character is conventional and reads
differently from an interactive object.

Restyle `.hub-marker` in place. Do not append an override layer further down `global.css` — that is
exactly how the three styles this replaced came to exist.

## 3. Walking between hub rooms must not move the page

**The problem.** The Archive Room's left column was four lines where the Main Hall's was fifteen (a
heading, a meta block and a full status panel), a page-height difference big enough to add or remove
the vertical scrollbar — which re-centres every `margin: 0 auto` shell by ~7px. Reported as "a
slight shift when I enter the Archive room and go back".

**The fixes, both kept.** The Archive Room gets the Main Hall's status panel in the same markup
(and thereby a readout it never had: how many of the unit's Archive Challenges are filed, via
`unitArchiveChallengeProgress()`). Independently, `html { scrollbar-gutter: stable }` reserves the
scrollbar's width on every screen, and `.hub-shell` gains the `min-height: calc(100vh - 58px)` floor
`.shell` always had. The first makes the two rooms _look_ like siblings; the second two make any
future height difference unable to move anything sideways.

Guarded by `tests/e2e/archive-room.spec.js`, which asserts the map's `x` and `width` are identical
in both rooms — the symptom itself, not a proxy for it.

## 4. Grid children need `min-width: 0` (again)

Case 1.02's "Place in" `<select>` is `flex: 1`, which leaves `min-width: auto`, and a `<select>`'s
automatic minimum size is the width of its longest `<option>` — "Reshaped Mobility, Warfare, and
Transport", ~285px — inside a ~212px card. It refused to shrink and painted over its neighbour. The
same failure mode is already fixed and commented twice in `global.css` (`.sequence-item-label`,
`.field-channel`); this is the third. The evidence grids also moved to a 340px track minimum so a
four-item quest reads as a 2×2 at every board width it renders in, instead of 3 + 1 with a hole, and
`missionScreen()` adopts the existing `.activity-shell--wide` preset with a heading size scoped to
the column it actually occupies.

Baselined as `mission-exchange-ledger` in the visual-regression suite — grid/flex sizing is what a
pixel baseline is for.
