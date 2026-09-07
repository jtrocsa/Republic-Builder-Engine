# 0122 — A name is not part of the body

**Phase 123.** Two defects in the same twenty pixels of screen, both visible in the game's first five
minutes, both found by watching the Institute rather than by reading the repository. The owner cannot
play through the game at the moment and asked for exactly this: _"you can kinda see things … little
things like that. Right? Like, you can see what the bugs are."_

---

## 1. What a person watching sees

The tutorial's escort walks the player up behind Director Hale and stops. His name pill is under his
feet and the player is standing on it, so the word reads **"Dire——r Hale"** — a hole punched through
the middle of it by the player's own body. It stays that way through everything he says next, and it
happens on **every scripted walk in the game**, because a follower ends a walk a gap behind the
leader by construction.

Then, at the other end of the same room, every name in the Institute is hanging about half a tile
too low — out on the open floor rather than under the person it belongs to — near enough to the next
row that Dr Soto's name lands on the face of whoever walks the aisle beneath her, which on the tour
is the Director.

Neither of these is a rare state. The first is where a scripted walk always ends. The second was true
of every frame of the Institute since Phase 62.

---

## 2. The pill was inside the body it names

`.field-npc` and `.hub-npc` each carry a `transform` and a `z-index`, so **every body is its own
stacking context**. A name pill emitted as a child of one could never be drawn above another body,
whatever z-index it was given — there is no number that climbs out of a stacking context.

And the player is above the cast on both surfaces: 80 over 70 in the field, 42 over 28 in the
Institute. The pill hangs below the feet. Standing south of somebody is how you talk to somebody who
is facing you. So the ordinary act of walking up to a person put your body through their name.

Measured through the tutorial's own tour, beat by beat, as the percentage of a pill's box covered by
the player's body — which is the only body in the Institute that draws above a name:

| beat  | the player's body over a name        |
| ----- | ------------------------------------ |
| 0     | 57.3% of "Director Hale"             |
| 1     | 55.8% of "Director Hale"             |
| 4     | 93.3% of "Dr. Soto"                  |
| 15    | 20.7% of "Dr. Soto"                  |
| 16    | 64.7% of "Dr. Soto"                  |
| 19    | 32.2% of "Director Hale"             |
| 20–23 | **71.9% of "Director Hale", parked** |

The last row is where the tour ends, and it stays there until the player walks away.

Two further beats overlapped and are deliberately **not** in that table. At beats 2–3 and 15 the
Director's body crossed 49.3% and then 91.2% of Dr Soto's pill — but the four Institute staff share
one z-index and she is emitted after him, so there her **label** won and covered his face instead.
That is the same collision from the other side, it is not what this phase fixes, and it is in §7.

Out on the map the same thing happens on arrival: walking up to the Taíno gardener on Case 1.01 put
the player's body over **25.9%** of her name.

**The fix is one rule and it is not a feel change.** Nothing about collision, movement or where
anybody stands has moved; only which pixels win. `main.js` now emits the pill as a **sibling** of the
body rather than a child, wearing the body's own class list, and the sibling sits at z-index 85.

Copying the class list is the load-bearing part. Thirteen layered rules style this pill as
`.field-npc span:not(.character-sprite):not(.cast-shadow)` — a _descendant_ selector — plus
`.field-npc--taino span` and the two faction colours beside it, plus `.field-npc.is-near span` and
`.field-npc.is-talking span`. Every one of them matches the pill in its new home **unchanged**, and
none of that cascade had to be re-derived. This file has been paid for by guesses about that cascade
before (`0119`: two rules dead for a full phase, found by measuring in a browser).

85 is deliberate: above the player's 80 and **below the world's overlay layer at 90**. A name clears
every body and is still drawn behind the canopy it is standing under — which is the thing
`cast-legibility.spec.js` measures, and the thing that found the watchman inside the maple in Phase 114. Raising names above the overlay would have made that guard moot rather than passing.

---

## 3. And it hung in the wrong place, because a variable substitutes where it is declared

`--cast-foot` is how far below a character's anchor its feet are drawn, and it is **a per-surface
number**: 0.58 of a tile in the field, where the sprite sits low in a 55×79 button, and 0.19 in the
Institute, where it sits in a 48×56 one. A name is meant to hang a fixed 8px under the feet on both.

That was written once, at `:root`:

```css
--cast-foot: calc(var(--tile) * 0.58);
--cast-label-top: calc(50% + var(--cast-foot) + 8px);
```

**A custom property substitutes at the point of declaration, not at the point of use.** The
`var(--cast-foot)` inside `--cast-label-top` resolved against `:root`'s 0.58 once, and every element
in the document inherited that finished number. `.hub-npc`'s override to 0.19 has never had any
effect on it — not once, from Phase 62 to Phase 123.

The comment above the declaration said the opposite, in as many words:

> because --cast-foot differs per surface the same expression puts it below the sprite in the field
> (+35.8px from the anchor) and in the hub (+17.1px) without either surface knowing about the other.

It put both at +35.8. In the field that is right. In the Institute the feet are at +9.12, so every
name hung **26.7px — over half a tile — below the person it named.**

This is the same shape as Phase 122's false comment about `updateInstitutePlayer(speed)`, and it is
worth naming as a shape: **a comment that argues for a mechanism is not evidence the mechanism runs.**
Both of these were sentences a reader would have to disbelieve on purpose to check.

The fix moves the expression to the two rules that use it, so `var(--cast-foot)` resolves on an
element that has the surface's value:

```css
top: calc(50% + var(--cast-foot) + 8px);
```

Measured after: the Institute's names sit at **anchor + 17.1px** and the field's at **+35.8px** —
the two numbers the old comment claimed and only ever delivered one of. **The field did not move.**

---

## 4. The guard, and why it is measured in pixels

`tests/e2e/cast-nameplates.spec.js`, four tests.

Three assert the drop — every name on the Main Hall, the Entrance Hall and the Caribbean hangs 8px
under _that surface's_ feet — read off the rendered boxes rather than off the declaration, which is
the whole point when the defect was a declaration that read correctly and resolved wrong.

The fourth asserts the layer, and it is measured in pixels because **nothing cheaper is honest**:

- Reading `getComputedStyle(plate).zIndex` back would pass on a stylesheet that says 85 and a page
  that draws 28 — a stacking context in a parent, a later `!important`, an `isolation: isolate` on
  some ancestor — and it restates the rule instead of observing it, which is the line `0093` drew for
  the dev probes.
- `elementFromPoint` respects `pointer-events`, and the two things most likely to be drawn over a
  name are the player, which is `pointer-events: none` on purpose, and the plate itself, which is
  `none` for the same reason. It would answer about clicks and be read as an answer about paint.

So it screenshots the patch where a body and a name overlap **four times** — both layers, the name
alone, the body alone, and the bare room with neither — counts the pixels where the name and the body
would each paint over the bare room, and asks which of the two single-layer renders the composite is
nearer to on each of them.

Each of those four renders is there because a cheaper version was tried and measured:

| what it asked                                               | name on top | name underneath |
| ----------------------------------------------------------- | ----------- | --------------- |
| how much the whole pill changes when bodies are hidden      | 11.8        | 21.2            |
| the same, clipped to the overlap                            | 11.8        | 29.3            |
| share of contested pixels won, without the bare-room render | 88.2        | 75.1            |
| **share of contested pixels won**                           | **88.8**    | **17.6**        |

The first three are two-and-a-half-fold gaps at best, and a threshold inside one of them would have
been a guess — the second row is the version that **passed with the fix reverted**, which is exactly
the vacuity this repo keeps paying for. A sprite is mostly transparent, so a body drawn over a name
only repaints the narrow part of the patch that is actually a body; without the bare-room render the
count was dominated by pixels no body was contesting.

The threshold is 60, a third of the way up a five-fold gap. It is deliberately not 100: a pixel the
name wins is 96% pill and 4% of whatever is behind it, because the pill's background is
`rgba(4, 31, 43, 0.96)`, and the Institute's dark teal is close enough to the player's navy coat that
the pill's antialiased border can land nearer the body. Those edges are the whole of the missing 11.

The escort's arrival is reached **by watching for the state, not by counting beats** — the test
advances until a body actually covers a name, and fails loudly if that never happens. Both
anti-vacuity gates are explicit: the overlap must be at least 400px², and the two layers must
contest more than 200 pixels of it.

---

## 5. What each guard showed red

Every one was run against the defect it exists for, by reverting only that fix:

| guard                                           | with the fix | with it reverted   |
| ----------------------------------------------- | ------------ | ------------------ |
| Main Hall / Entrance Hall name drop             | 17.1px       | 35.8px, both rooms |
| Caribbean name drop                             | 35.8px       | 35.8px — unchanged |
| "a body standing on a name does not repaint it" | 88.8% won    | 17.6% won          |

The Caribbean row is the one worth reading twice: the field is the surface the broken expression
happened to be right about, so its guard is a **control**, not a check. It says the fix moved the
Institute and left the field where it was.

`cast-legibility.spec.js` also had to move, and that is a result rather than a chore: it read the pill
off `el.querySelector("span:not(.character-sprite):not(.cast-shadow)")` inside the body, which is now
empty. It reads the plate instead, and a body without one is reported as `missing` rather than thrown
on — so the twenty surfaces it already walks now also assert that **every job on every surface has a
name attached to it**. All twenty pass, hub pills 18.7px higher than they were.

---

## 6. What this says about Phases 118–123

Phases 118–121 were four consecutive audits the repository ran on itself — coverage, geometry,
layout, folds. Phase 122 came from eleven minutes of the owner watching the opening cutscene, and
found three defects. Phase 123 came from screenshotting that same opening with the cast on screen,
and found two more, one of which had been true since Phase 62 and was contradicted by its own
comment.

The pattern is not that the audits were wrong. It is that **all four asked questions a machine can
ask, and none of them could ask whether a thing looks right.** Every committed visual baseline hides
`.hub-npc`/`[data-npc]` before it fires, so no automated check in this repository had ever looked at
a room with people in it — `0112` said so and said the answer was to look. Two phases of looking have
now out-produced four of auditing.

The standing recommendation in `ARCHITECTURE-QUICKREF.md` §6 — that the next piece of work should
come from someone playing the game — is not weakened by this. It is the argument for it.

---

## 7. What was not done

- **Object markers are still under bodies.** `.hub-marker` sits at z-index 22, below the cast at 28,
  so at the tour's last beat the Director's hat covers the first word of the "Archive Room" door
  label. `.source-signal--world` is at 75 — above the NPCs at 70, deliberately, with a comment saying
  so — and still below the player at 80. Both are the same rule as this phase's, and both were left
  alone on purpose: a marker is a frame **and** a label in one element, and its frame _should_ be
  under a body standing on it. Splitting them is the same surgery this phase did for the cast, and it
  belongs to whoever needs it rather than to a phase about names.
- **A name can still land on somebody else's face.** Dr Soto's pill covers the Director's head as the
  tour walks the aisle a row beneath her; the fix moved the pill up 18.7px and did not separate them.
  That is an authoring question — where a route is walked relative to where somebody is posted — and
  `CLAUDE.md` already records that pill-against-pill and pill-against-body have no test and should not
  get a clever one. The coordinate suite holds a route 1.5 tiles clear of a station; **a scripted
  scene's walk is not in that suite**, and this is the first case that would have wanted it.
- **The "!" proximity indicator and the record badge stay inside the button.** Both sit above the
  head rather than below the feet, which is the side a body stands on, so neither has the defect.
- **The player does not breathe.** `chronicler-a` and `chronicler-b` are the only characters in the
  Institute without `idleColumns`, so the player stands frozen beside four staff who are all playing
  an idle cycle. That is a PixelLab commission and therefore a spend decision, which is the owner's
  — the same wall Unit 9's cast is behind (`0101` §7).
- **The body overlap from Phase 122 is still the owner's call.** A player may stand 0.517 tiles from
  an NPC's anchor and overlap their sprite by about 56%; `INVARIANTS.md` records the three foot boxes
  as deliberate and says narrowing one is a feel change across every surface, not a bug fix. This
  phase deliberately changed nothing about it — and note that the two are independent: names being
  legible is now true whatever the owner decides about distance.
