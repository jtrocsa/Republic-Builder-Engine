# 0138 — The sweep

**Phase 139 · 2026-09-12 · Accepted**

The last phase of the audit programme: dead CSS out, and the unit suite stops standing up a DOM it
does not need. Two of the audit's three items here did not survive being measured, and one of them
turned up a real defect that gets its own phase.

---

## 1. Dead CSS — 68, not 92, and the difference is the method

The audit reported ~90 dead classes out of 815. Both of those numbers are wrong, and they are wrong
the same way: **a scan over the raw file picks class-shaped tokens out of comments and URLs.**

- `googleapis` came back as a "dead class". It is inside
  `@import url("https://fonts.googleapis.com/css2?…")` — the `.googleapis` in a hostname.
- `signal-1`, `signal-2`, `signal-3` came back as dead. They appear **only in two comments**, both
  of which say those classes were removed in Phase 56. The detector was reading the removal notice
  as evidence of the thing.

Reading selectors instead of text: **761 distinct classes**, not 815. Of those, 89 have no literal
mention in any `.js` or `.html`, and **21 of those are built by interpolation** —
`field-world--${map.id}`, `field-npc--${npc.group}`, `route-marker--${state}`,
`hub-marker--label-${side}`, `warp-screen--${kind}`, `is-${row.availability}` — leaving **68
genuinely dead**.

The dead families are the CSS-drawn Caribbean scene the Tiled rebuild replaced (`spanish-ship`,
`sail-one`, `ship-shadow`, `scene-person--*`, `scene-bohio--*`, `village-scene--*`), the ten-piece
jigsaw (`map-piece--p1`…`p10`, `map-slot--p1`…`p10`, `jigsaw-*`, `piece-tray--ten`), the retired
foyer (`foyer-*`, `hub-zone*`, `institute-home`/`-copy`/`-scene`) and six unused `c-*` primitives.

### What was removed, and the one shape that needed care

**134 rule blocks** where every selector part is dead, and **9 selector lists** where a dead part sat
beside a live one. The second kind matters: `.reconstruction-board label, .connection-builder label`
cannot have the whole block removed, only the dead half of the list. A part is dead if **any** class
in it is dead — `.case-field--living .pathing` can never match once `.pathing` is gone, even though
`.case-field--living` is live.

**377,921 → 354,344 bytes; 12,594 → 11,585 lines.** The built stylesheet goes 194.52 kB → 177.92 kB
raw, 40.36 kB → 36.36 kB gzipped.

**All 61 visual baselines are unchanged**, which is the proof the classes were dead: a rule that
still matched something would have moved a screenshot. And **zero comments were orphaned** by the
removal — the count of comment blocks followed by nothing but another comment went _down_, 33 → 30.

### The comments that went with the blocks

Removing a block takes any comment immediately above it, so **13 comments went too**. Every one was
read rather than assumed, and all thirteen are notes about the era being removed: prior-removal
notices for these same families (".sandbank/.grassland removed (Phase 45D dead-CSS sweep)"),
consolidation breadcrumbs, and jigsaw/Caribbean design notes ("Remove the ugly black puzzle lines",
"Move the puzzle interaction to a believable cartographer station by the ship").

Two needed checking, because they name a class that is still **live**: _".source-signal--world
(min-width/transform) and its b/small font sizes here were superseded and are now in the single
consolidated block near the top of this file (Phase 56)."_ Both were standalone breadcrumbs that
happened to sit above an `.arrival-cove` rule. They point at the consolidated block, and that block
**carries its own ten-line explanation** of the same design — so the pointer is redundant with its
destination and nothing is lost.

## 2. The duplicate-selector consolidation: measured, and deliberately not done

The audit reported 36 selectors declared more than once. A naive count says 146. **Media-aware, and
after the dead families are gone, it is 49 selectors across 74 redundant blocks.**

It is not consolidated here, and that is a judgement rather than an omission. Merging redeclarations
changes cascade order, the baselines cover 61 screens rather than every state, and this file's own
comments record that several of these stacks were _already_ deliberately consolidated once
("Consolidated from 6 chronologically-layered hotfix redeclarations…"). CLAUDE.md's standing
guidance for this area is to restyle in place rather than append a layer — which is advice about how
the stacks got here, not a mandate to flatten them now. It needs a forcing function and a screen-by
-screen review, not a sweep.

**Reading one of them found a real defect**, which is §4.

## 3. The fixed `waitForTimeout` sleeps: the premise does not hold

The audit flagged ~26 of the suite's 30 fixed sleeps as waiting on a CSS transition or a `steps()`
cycle, convertible to `expect.poll`. Reading them, most are not that at all:

- **Sampling windows**, where the duration _is_ the measurement —
  `character-directions.spec.js` samples distinct sprite frames over a window (its own comment
  explains why counting frames cannot alias), `npc-idle-breathing` observes 700 ms of breathing,
  `scene-walk-cycle` samples a walk. These are the same shape as `holdKey()` and
  `npc-behaviour-field`'s `SAMPLE_MS`, which the audit already granted are legitimate.
- **An assertion about a non-event.** `arrival-scroll.spec.js:147` waits 300 ms and then asserts the
  page did **not** scroll. There is no settled state to poll for; a fixed wait is the correct
  instrument.
- **Typewriter cadence** — `intro-sequence`, `liaison-intro`, `meridian-reveal` press keys 30–80 ms
  apart to drive a typewriter, which is timing, not waiting.

What is left is a handful of generic "let the page settle" waits in `empty-panels` and
`horizontal-clipping`, which loop over heterogeneous screens with no single element to wait on.
Tightening those is as likely to add flakes as remove them, for about five seconds a run.

**Not converted.** Recorded so nobody re-derives it.

## 4. What reading the duplicates turned up

`.recall-beacon` is declared five times, and one of them is:

```css
.recall-beacon {
  left: 410px !important;
  top: 545px !important;
}
```

`recallBeacon()` positions that button from each map's authored `recall` coordinate, as an **inline
style** — and an `!important` declaration in a stylesheet beats a non-important inline style.
Measured in the browser on Unit 1: the game writes `left:1056.0px;top:1152.0px`, and the computed
value is **410px / 545px**.

That is its own phase, not a line in a sweep whose gate is that no baseline moves. See `0139`.

## 5. The unit suite stops standing up 48 DOMs it does not need

`vitest.config.js` set `environment: "jsdom"` for every file. **32 of 80 need one.** The other 48 are
pure-function tests — geometry, quest grading, content shape — that never touch `document`.

Default is `node` now, and the 32 files that need a DOM declare it themselves with a
`// @vitest-environment jsdom` docblock. That direction is deliberate: the cheaper thing is the
default, and a file that wants more asks for it where the cost is visible to whoever adds the next
one.

Three runs each, same machine, back to back:

|                       | wall clock                  | environment setup |
| --------------------- | --------------------------- | ----------------- |
| `jsdom` for all 80    | 40.32 / 40.53 / 40.39 s     | 206–210 s         |
| `node` + 32 annotated | **28.41 / 28.39 / 28.50 s** | **82–83 s**       |

**A 30% cut on the most-run command in the repo**, with 2,387 tests passing either way.

---

## Verification

`npm run check` clean — 2,387 unit tests across 80 files, ESLint 0 errors and the same 5 pre-existing
warnings, cspell, `validate:content` at 169 groups. `npm run build` clean. **All 61 visual baselines
unchanged**, and the full Playwright suite run because a stylesheet change can reach anything:
**379 passed, 1 failed, 1 flaky** in 19.5m.

No test referenced a removed class: the three hits for `pathing` across `tests/e2e/` are the English
word in three comments about the walker.

### The one failure, chased rather than retried

`intro-sequence.spec.js`'s _"the Entrance Hall escort never teleports the player onto the Director"_.
It is a **per-frame** assertion — no single frame may move the player more than 2.5x the walk speed
allows — and its own comment calls that multiplier "slack for a stalled frame", so it is exactly the
shape that a 19-minute two-worker run can push over.

Not taken on that reasoning alone. **40 consecutive passes** on the current stylesheet
(two runs of `--repeat-each=20 --retries=0`), against one failure in the eight-repeat run before
those. And the change cannot reach it: the only removed line mentioning `hub-player` is four lines of
**comment** saying those rules were folded into a consolidated block in Phase 45B, and the four live
`.hub-player` rules and `.institute-map--hallway` are all still in the file.
