# 0079 — The intro stops looking unfinished

**Phase 90B. Accepted 2026-08-22.**

The other half of the owner playtest recorded in
[`0078`](./0078-the-intro-stops-repeating-itself.md). That phase fixed what the intro _did_; this
one fixes what it _looked like_. Closes the two findings Parts 1–4 deferred with named destinations
— see [`part-01-04-the-intro.md`](../playtest/part-01-04-the-intro.md), findings 2 and 5.

---

## 1. The Director scene shows a room instead of drawing one

The screen was six independent decorative layers: a letterhead ledger scrim, three blurred vertical
pillar glows, a double-ring instrument seal, four corner brackets, three monospace readouts
(`LINK VERIFIED`, `REC. 07734 · SER. AR-1`, and a clock counting the seconds since the screen
opened), and a layer that faded short historical phrases in and out at **rejection-sampled random
positions**. The owner's report was that it "feels like a rough draft".

That diagnosis was right and the cause is worth naming, because it is not "too much". It is that
**none of it was composed.** Text placed at a random point cannot be in relation to anything else
on the screen, so however faint it is, it always looks like it landed there by accident — and once
one layer reads as accidental the others get read the same way. Six deliberate layers would have
been fine. One random one was not.

`INSTITUTE_PLATE` — the painted Institute Archive establishing shot — has been in the bundle since
Phase 88A doing exactly one job, on the recall warp screen. It is the backdrop now. The whole
diorama is deleted: ~150 lines of CSS, the `AMBIENT_HISTORY_PHRASES` table, the decor loop with its
`setInterval` and growing timer array, and the `render()` lifecycle branch that started and stopped
it. **The corner brackets survive**, because they were framing the shot rather than competing with
it, and a painting wants a frame.

Two things this bought that were not the point but are worth recording: the two director baselines
no longer need a `mask` for the clock (a `setInterval` readout that `animations: "disabled"` could
not freeze), and the screen lost a timer that ran for as long as it was open.

### The layout consequences, which were the real work

- **The sprite is out of flow.** In flow it was a flex item sizing `.director-scene__stage`, so
  raising it to 62vh overflowed the stage, grew `.director-scene` past the viewport and pushed the
  absolutely-positioned bar — and the "Begin Orientation" button — below the fold. That is the
  exact failure the original `52vh` cap was chosen to avoid, and the cap was doing a job the
  positioning should have been doing. `position: absolute` means the height can be chosen for the
  composition instead of for the layout.
- **He stands on the painted floor, not on the stage's floor.** Against a flat backdrop those were
  the same place. Against a painting the stage's bottom edge is a foot above the boards, and he
  read as levitating over the map table. A negative offset puts his feet down and lets the dialogue
  box overlap his shins, which is the composition this screen was imitating in the first place.
- **`.director-extra-content` is scoped `:not(:empty)`, and that is load-bearing.** Every director
  screen renders that element; only `intro-protocol` fills it. Giving it padding and a background
  turned the other two screens' empty div into a dark bar under the title — and, less obviously,
  made it _report as visible to Playwright_, so `visual-regression`'s "wait for the protocol panel"
  loop fired on the welcome screen and wrote the wrong shot into `director-protocol-scene`. **An
  empty box with padding is a visible box.** Caught by looking at the baseline before accepting it.

## 2. Lit doorways, and the scope decision inside them

Light spilling onto the ground in front of a door, so an entrance reads as one from across the map
rather than only once the player is close enough for its label to fade in. Drawn with
`mix-blend-mode: screen`, the same additive technique `.institute-map::after` already uses, because
an opaque gradient reads as a decal stuck to the floor rather than as light.

**The scope is the decision.** 155 door cells already exist as generated `*_DOORS` arrays across the
seven `.blocks.js` files, and `main.js` imports none of them. The literal reading of "make all
doorway entrances" is to light all 155 — and it is wrong, because **only eight of them lead
anywhere**, one per field interior. A lit door is a promise. Lighting 147 facades that open onto
nothing teaches the player the signal, has them spend it on four dead doors, and stops them
believing it; the signal is then worth less than no signal.

**Ten doorways are lit**: those eight, plus the Institute's two — the Archive Room's, lit from both
sides, and the Entrance Hall's. Nothing enumerates them, which is the point: the treatment hangs off
`.field-door` and two `.hub-marker` ids, so the count tracks the interiors rather than a list that
can go stale. Unit 7's two rooms proved it the hard way — they shipped in Phase 89D while this phase
was in flight, and were lit the moment it pushed, without a line being added.

If the other buildings should feel occupied, that is window light — a different treatment with no
promise attached — and its own phase.

**Direction is a property of the wall, not of the door.** Every exit in the game is in its room's
south wall, so its light reaches _into_ the room; thrown south like an entrance it landed below the
floor and was clipped away by the world's `overflow`, which is what the first pass shipped and what
looking at the baselines caught.

Nine of the ten doors get their spill from a pseudo-element on an element they already have — a
`.field-door` button or a `.hub-marker` rect — so this costs no new markup. The tenth is the
Entrance Hall's doorway, which has no element because it is not an interaction: the Director walks
the player through it. That one gets a decorative span.

## What this deliberately did not do

- **No new art was generated.** The plate already existed. This phase spent nothing on PixelLab.
- **No `*_DOORS` import.** The arrays stay unread; lighting the ten openable doors needed none of
  them, and importing 155 cells to use six would have been the wrong shape for the wrong reason.
- **No change to collision or to the 1.45-tile door reach.** The spill is decoration over an
  existing target, so `CLAUDE.md`'s doorstep-NPC hazard is untouched.

## Verification

Unit 1761/1761 · lint 0 errors · `validate:content` clean · `build` clean · full `test:e2e`
serially.

**Ten visual baselines moved. Seven were opened and read**, chosen to cover every distinct
treatment once: both director scenes, the Main Hall (a hub door in a north wall), the Archive Room
(a hub door in a south wall), Canal Crossroads (an outdoor door), its print shop (an interior exit),
and the railhead outdoors and its land office. The three not opened — the canal boardinghouse and
the railhead's telegraph office, both interior exits, and nothing else in the railhead pair — are
the same two rules on the same two element types as baselines that were.

That review is not a formality here: it is what caught the empty-panel bar, the wrong-screen
protocol capture and the exit lights falling off the map, **none of which any assertion in the suite
would have failed on**. All three would have shipped behind a green run.

`institute-entrance-hall` did **not** move, and that is correct rather than suspicious: the room is
eighteen rows tall against a twelve-row frame and the baseline is captured at the south spawn, so
its doorway light is off-camera until the Director walks the player north to it.
