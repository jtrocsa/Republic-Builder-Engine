# 0139 — The beacon was not where it looked

**Phase 140 · 2026-09-12 · Accepted**

On all eight field maps, the Recall to Archive beacon was drawn between **16.0 and 23.5 tiles** from
the only place it could be pressed. Walk to the one you can see, click it, and the game says
"Move closer to interact with the recall beacon." The place that works has no marker on it.

Four lines of CSS, shipped before the beacon's position was data.

---

## 1. How it happened

`recallBeacon()` places the button from each map's authored coordinate, as an **inline style**:

```text
style="left:${(recall.x * grid.tile).toFixed(1)}px;top:${(recall.y * grid.tile).toFixed(1)}px"
```

`global.css` carried, under a comment about something else entirely:

```css
.recall-beacon {
  left: 410px !important;
  top: 545px !important;
}
```

**An `!important` declaration in a stylesheet beats a non-important inline style.** So the beacon
was painted at world (410, 545) on every map, and `isNearRecallBeacon()` — which reads
`FIELD_MAPS[unit].recall` — went on measuring to somewhere else entirely.

Measured in the browser rather than reasoned about. On Unit 1 the game writes
`left:1056.0px;top:1152.0px` and the computed value is `410px / 545px`. Across all eight:

| unit    | authored     | drawn      | apart                   |
| ------- | ------------ | ---------- | ----------------------- |
| unit-01 | (1056, 1152) | (410, 545) | 886px — **18.5 tiles**  |
| unit-02 | (1152, 936)  | (410, 545) | 839px — 17.5 tiles      |
| unit-03 | (1152, 768)  | (410, 545) | 775px — 16.1 tiles      |
| unit-04 | (1368, 989)  | (410, 545) | 1056px — 22.0 tiles     |
| unit-05 | (1176, 605)  | (410, 545) | 768px — 16.0 tiles      |
| unit-06 | (1512, 792)  | (410, 545) | 1129px — **23.5 tiles** |
| unit-07 | (744, 1272)  | (410, 545) | 800px — 16.7 tiles      |
| unit-08 | (1368, 605)  | (410, 545) | 960px — 20.0 tiles      |

The reach is **1.55 tiles**.

## 2. What a player got

The click is gated at `handleFieldClick`, and correctly so — a world control the player cannot
reach must refuse. So pressing the visible beacon produced `fieldTooFarNotice("the recall beacon")`.

Two details make it worse than a dead button:

- **It lights up.** The `is-near` class is computed from the authored coordinate too, so the beacon
  glowed while the player stood sixteen or more tiles away from it, and stayed dark when they were
  standing on it.
- **The place that works is unmarked.** Nothing is drawn at the authored tile, so there is no way to
  discover it.

Nobody was ever stranded: the chrome `← Recall to Archive` back link carries the same `field-recall`
action and is deliberately ungated — CLAUDE.md's rule that "the back link must never be gated" is
what kept this from being a soft-lock. The world object was simply decorative, on every map, for as
long as the rule has been there.

**And on Unit 1 the beacon was not even on screen.** At the spawn framing, world (410, 545) sits off
the top-left of the camera window; the authored tile is six tiles left and two down from the player,
comfortably in frame. So the baseline that has stood for this map showed no beacon at all, and
nobody read that as a defect.

## 3. The fix, and why it was not found by looking at the beacon

One rule deleted. The comment that replaces it states the invariant — **the beacon's position is
data, and nothing in this file may set its `left`/`top`.**

It was found by **reading the duplicate-selector list from `0138` §2**, not by testing the beacon.
`.recall-beacon` is declared five times, four of them `!important` overrides stacked on the base
rule, and reading what the stack actually resolved to is what surfaced it. That is worth recording
because the consolidation those duplicates suggest was _declined_ in the same phase — and the value
of looking at them turned out to be the reading, not the merging.

## 4. The guard walks; it does not measure

Asserting `getComputedStyle(beacon).left === FIELD_MAPS[unit].recall.x * 48` would restate the rule
inside the test, which is what `0093` forbids. It would also pass on a beacon nobody can reach.

`tests/e2e/recall-beacon.spec.js` asks the player's question instead, on all eight maps: **walk to
the beacon as drawn, and let the game's own `is-near` say whether the walk arrived.** `walkTo`
targets `.recall-beacon`, so it plans a route to where the beacon is _painted_; `is-near` reads the
_authored_ coordinate. If those two ever diverge again, the walk arrives at the paint and the game
still says no.

Watched fail with the override restored — all three sampled maps at _"the walker never got inside
the beacon's reach"_ — and green on the fix, 8/8. It presses the beacon afterwards and asserts the
warp screen, so a beacon that is reachable but inert also fails.

An anti-vacuity line pins that the beacon is not at the origin: a stylesheet that collapsed it to
(0,0) would make the walk trivially succeed from the spawn.

## 5. Eight baselines moved, and every one was reviewed

The eight outdoor field maps. **The ten interiors did not move**, which is the right blast radius —
`recallBeacon()` returns `""` indoors.

Reviewed rather than blind-accepted, and not only by eye: each diff's differing pixels were measured
into a bounding box, and all eight are **a single compact region about 82×52 px** — a beacon glyph
and its label — at 35–78% density, with nothing else changed anywhere on any map.

| baseline               | differing px | box                               |
| ---------------------- | ------------ | --------------------------------- |
| field-caribbean        | 1,703        | 82×52                             |
| field-riverbend        | 1,525        | 81×53                             |
| field-common-cause     | 1,094        | 82×17 (clipped by the frame edge) |
| field-canal-crossroads | 1,631        | 82×53                             |
| field-richmond         | 1,361        | 82×41                             |
| field-railhead         | 1,621        | 82×52                             |
| field-immigrant-port   | 1,730        | 83×53                             |
| field-fairmeadow       | 1,519        | 81×53                             |

Three were also opened and read: on Caribbean the beacon appears six tiles left and two down from
the player; on Fairmeadow it appears on the township road two tiles away; on Ellis Island at the
head of the landing stage. In each case it is now where "Recall to Archive" belongs.

---

## Verification

`npm run check` clean — 2,387 unit tests across 80 files, ESLint 0 errors and the same 5 pre-existing
warnings, cspell across 609 files, `validate:content` at 169 groups. `npm run build` clean. The 8
new e2e tests pass on all eight maps; the 21 visual tests pass against the updated baselines, and a
clean re-run confirms nothing else moved.
