# 0087 — Three cases you could not start

**Phase 90I · 2026-08-23 · Spine Review Part 11 — the Institute Archive**

Part file: [`part-11-the-institute-archive.md`](../playtest/part-11-the-institute-archive.md).
Supersedes nothing. Closes the four S3s routed here from Parts 5, 8 and 9.

---

## 1. An S1, and the silent fallback under it

The Navigation Table is the only screen in the game that launches a case, and **clicking a marker is
the only way to select one**: `unlockNext()` unlocks the next case without selecting it, and
`select-unit` only ever selects a unit's _first_. `.atlas-table` is `overflow: hidden`.

`UNIT_MAP_VIEW` stopped at `unit-05`. Units 6 and 7 fell through to `DEFAULT_MAP_VIEW`, which is the
Atlantic — west −95° to east 15°. Measured in the browser, at the suite's own viewport:

| Case                           | left       | inside the box |
| ------------------------------ | ---------- | -------------- |
| case-016 · the Kansas railhead | **−1.4%**  | no             |
| case-017 · Chicago             | 6.7%       | yes            |
| case-018 · San Francisco       | **−24.9%** | no             |
| case-019 · Ellis Island        | 19.1%      | yes            |
| case-020 · Manila              | **196.3%** | no             |
| case-021 · San Francisco       | **−25.0%** | no             |

Three of those markers are nowhere on screen and cannot be clicked, so **case-018, case-020 and
case-021 could not be started at all** — three of the game's twenty-one missions, shipped that way
with Unit 6 in Phase 85 and Unit 7 in Phase 89C.

Nothing failed. A missing view is a sane default for a missing _framing_ and a silent one for a
missing _entry_ — the same shape as `FIELD_COPY`'s fallback, which CLAUDE.md already warns about in
those words. The fix is two entries and a test that makes the next omission loud:
`tests/unit/navigation-table-views.test.js` projects every shipped unit's cases through its own view
and fails on anything within 3% of an edge. It reports the four markers above, to a tenth of a
percent of what the browser measured.

**Unit 6 gets a transcontinental box** — a unit about a continent being written onto paper, whose
three cases are a Kansas railhead, Chicago and San Francisco. **Unit 7 gets a world map**, because
Ellis Island, Manila and San Francisco do not fit in anything narrower and `projectPoint()` is a
plain linear map with no wrap. That is the unit's own argument rather than a technical concession:
the terms of belonging were being set on three shores at once.

## 2. What the world map then showed

Two 1px lines straight across the map, at about 65°N and 16°S.

Four of `land-coastlines.json`'s 126 rings cross ±180 — Eurasia, Antarctica, Fiji and Wrangel Island
— and each carries one segment that travels the full width of an equirectangular world view.
`.atlas-land` is stroked, so each drew a line. Invisible on every box that stops short of the
antimeridian, which was every view the game had.

`landPathD()` now passes half the viewport down as a seam width, and `ringToPathD()` splits a ring
wherever a single segment exceeds it, leaving a split ring unclosed — the segment that would close
it _is_ the seam. The fill is unaffected either way, since SVG closes a filled subpath implicitly;
it was only ever the stroke.

**The threshold is safe because the data has a cliff in it**, which is worth recording rather than
asserting: seven segments at 358–360° of longitude, and the next largest anywhere in the file is
**9.0°**. Half a viewport is nowhere near either. The regression test runs the real coastlines
through a real full-globe box and fails if any drawn segment crosses the seam.

## 3. Both halves of what the debrief was keeping

Part 8's finding 5, routed here. All twenty-one missions declare a `historicalRecord` — "Chronicle
takes real liberties. Here is which is which." — and six declare an `anomaly`. Both rendered in
exactly one place, `missionDebriefScreen()`, behind a one-way `debriefed` flag. A student met each
of them once and could never get back to it.

Both now file into the Codex entry, which is where a filed record durably lives. Two lines in
`ENTRY_FIELDS`, two in `fileToCodex()`'s descriptor, and existing saves pick them up on their next
boot because `backfillCodex()` rebuilds every entry and keeps only `filedAt`.

**The anomaly is the one that mattered more**, and it is not what the finding emphasised. The six of
them are a single thread: an altered entry in the Riverbend wharf book, and then a corrected
broadside, a toll on next season's rate, a name washed out of a desertion list, a survey variation
dated 1934, and a literacy column ruled on a manifest — _ruled the way the Riverbend entry was
ruled_, every time. That is the Meridian arc's evidence trail, and a player could only ever hold one
link at a time.

**The liberties note is collapsed and the anomaly is not.** Three bands of several lines each on
every one of twenty-one records would bury the archive they are filed in, so it is a native
`<details>` — the same disclosure the Manage Content tabs already use, no state and no script. The
anomaly is four lines and it is the thing a player came back for.

**`arcClose` and `debrief.established` stay where they are**, and the reasons differ.
`codexFiling.summary` already _is_ a compressed `established`, authored for this surface. An
`arcClose` is about a **case**, and the Codex is a list of records grouped by unit: printing "what
the three records make together" inside one of the three, with the other two sitting beside it
saying nothing, would misrepresent what it is. Routed to Part 12, which owns the case close.

## 4. The panel nobody could see

Part 5's finding 10 said the Codex button and the controls legend were below the fold. Measured, it
was worse: in the Main Hall the status panel's own **top edge** sat at y=593 of a 720px viewport, so
nothing in it was visible on arrival, and the page scrolled to 1109px.

Four things came out, and each is defensible without the fold as an argument:

- **The Main Hall's instruction paragraph** — "Walk through the Institute with arrow keys or
  WASD…" — is a controls legend, and the panel below it carries the other one.
- **The Archive Room's** names the Archive Terminal and the doorway, both of which are labelled
  markers that have named themselves since Phase 59.
- **Both badge-case notes** tell the player to walk to the Preservation Case / Archive Terminal.
  Same thing again.
- **`.hub-meta`'s unit line** printed "Unit N · Title" directly above a panel whose role line says
  "Active researcher · Unit N".

Plus one layout call, precedented by Part 5's own fix to the Navigation Table's heading: an
`h1` sized `clamp(3.2rem, 5vw, 5.7rem)` was 119px of a 291px status column.

What went back in is the unit's **title**, which is live state; what came out to pay for it is the
static per-room subtitle, which is one decorative sentence that has not changed since the room
shipped. Same trade as Phase 90H's `progressHint`: copy standing where state belongs.

|                     | panel top | panel bottom | page scroll | below the fold                    |
| ------------------- | --------- | ------------ | ----------- | --------------------------------- |
| Main Hall before    | 593       | 1065         | 1109        | Codex button, both counts, legend |
| Main Hall after     | **346**   | 716          | 760         | **nothing**                       |
| Archive Room before | 572       | 1022         | 1066        | Codex button, both counts, legend |
| Archive Room after  | **327**   | 675          | **720**     | **nothing**                       |

The Archive Room now clears Part 5's own bar exactly: no page scroll at all.

## 5. Three smaller things

- **Two Archive screens still said "Sourcing Practice Check."** Phase 90H renamed that screen to
  "Practice Check" — the same three words as the button that opens it — and swept the screen itself
  without sweeping what points at it. This is the phase-after-the-rename miss, and it is the reason
  a rename is worth grepping rather than editing.
- **The Archive Rotation's empty state gave wrong advice twice.** It said the rotation was "pulled
  from records you've already secured" and told the player to go and do a Practice Check first. The
  pool is every unlocked case's items whether they have been seen or not — `unlocked` always
  contains case-001, so a cold boot serves Unit 1's items immediately — and the state that actually
  reaches this screen is _everything is scheduled for a later day_, where more practice is precisely
  what does not help.
- **The Codex's "This case" was a heading over an empty grid** on the ten non-map cases, which
  declare no `sources` at all. It says which of the two empties it is now.

## 6. Marker labels stop landing on place names

Part 5's finding 9. `declutterMarkerPositions()` decluttered markers against each other and against
nothing else, so "Empire's Foundations" printed across CARIBBEAN SEA. It takes the view's own
`labels` now, and each side of a marker scores its own collisions with the cheaper one winning.

**Ties go to `below`, and the tie is the case that matters.** The marker-versus-marker gap is 140
units and deliberately conservative — the Caribbean's markers sit half that far apart — so on a
world map it was pushing Ellis Island's label up onto NORTH AMERICA to avoid a neighbour it was 134
units from and would never have touched. Where one side is clear and the other is not, this is
exactly what it was before.

A marker label has two sides and no other freedom, so this cannot resolve every case. What it can do
is stop choosing the colliding one.

## 7. Verification

- `npm run test` — 73 files, 1836 tests, all passing (8 new: four in a new
  `navigation-table-views.test.js`, four on the projection's seam).
- `tests/e2e/institute-archive.spec.js` — eight new cases, one per finding, **all eight confirmed
  failing against `4d571cf`** before the fix was kept.
- `npm run validate:content`, `npm run lint` (0 errors, the standing 5 warnings), `npm run build`,
  `npx prettier --check`, `npx cspell` — clean.
- 90 e2e tests across fifteen specs at `--workers=2`, plus the full `visual-regression` file. Two
  existing assertions were updated rather than worked around, both on copy this phase changed on
  purpose: `.hub-meta`'s unit line, and the rotation's empty-state wording.
- **Six visual baselines changed and each was measured.** `archive-navigation-table` is 1.14% of
  pixels inside rows 421–588 and columns 438–562 — one label pill moving from below its marker to
  above it, which is §6. `institute-entrance-hall` is 0.45%, confined to its left column: that room
  keeps its own smaller `h1` override, so only the line-height and margin reached it.
  `codex-cross-references` grew by a single pixel of height. `codex-filed` grew 221px, which is §3's
  two new blocks, and was read. The two hub rooms changed by 22–23% and were read.
