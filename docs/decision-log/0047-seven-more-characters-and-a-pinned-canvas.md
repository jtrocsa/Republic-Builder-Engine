# 0047 — Seven more characters, and a canvas that stopped being a derived number

**Phase 64.** Status: accepted. Supersedes nothing; extends `0043-one-cast-one-canvas-four-directions.md`.

## Context

Seven characters were generated in the PixelLab account — a Caribbean child and a Spanish expedition
scribe for Unit 1, and a blacksmith, two soldiers, an African man and an indentured laborer for
Unit 2 — each with all eight static rotations and a complete four-direction, eight-frame
`v3:walking` cycle. Nothing in the repo knew about them. No new generation was needed or possible:
the subscription quota reads `generations_remaining: 0`, and this phase spends none of it.

Two of the seven fixed art the game was already apologising for in its own comments. Unit 1 had an
NPC named **"Spanish scribe"** wearing the Spanish _sailor_ sheet, three tiles from the actual
sailor — the source comment read "No scribe was generated; the common seaman is the only
period-correct Castilian in the cast." Unit 2's **"Indentured field servant"** wore the generic
`jamestown-laborer` sheet, shared with the river fisher. Both are now themselves.

The rest addressed a thinness in the maps where the history is thickest. Riverbend is the 1619
Chesapeake: it had four fenced crop plots and exactly one person working any of them, no smith, and
no watch. Three of its plots were painted ground nobody had ever stood in.

## Decisions

### 1. The shared sprite canvas is pinned, not derived

`canonicalCanvas()` in `scripts/assets/build-character-sheets.js` sized the canvas from the widest
and tallest member of the whole cast. That was correct exactly once — at Phase 60, when the cast
was imported in one pass and 48×56 fell out of it.

It is not correct now, because 48×56 stopped being a derived number the moment anything else
depended on it. `SPRITE_CANVAS` states it, `global.css` computes `--cast-w`/`--cast-h` from it, and
`tests/unit/character-sheet-geometry.test.js` asserts every committed strip against it. Under the
old behaviour, adding one character with a long prop would silently resize **all 105 existing
PNGs**, invalidate the CSS tokens, and require re-banking 20 visual baselines — as a side effect of
an unrelated addition.

That is exactly what this phase would have triggered: the new cast wants **width 52**, because the
watchman shoulders a musket that reaches 50px across its source frame.

So the measured canvas is now _reported_ and the pinned one is _built on_. The build prints

```text
note: cast wants width 52; pinned to 48x56 ground 49. Overhanging props will clip.
```

and writes 35 new files, leaving the other 105 byte-identical (verified: `git status` showed 35
untracked and zero modified). Roughly a pixel of musket barrel clips at each edge — invisible at
1:1 against 48px tiles, and a far smaller loss than resampling the entire cast to accommodate one
prop. If the canvas should ever genuinely change, `SPRITE_CANVAS` is now the single deliberate place
to change it, with everything downstream re-banked on purpose.

Pinning required a second change: `sharp.composite()` **rejects** a negative offset or an input
larger than its destination rather than cropping, so a pinned canvas would have crashed the build
instead of clipping. New `placeInCell()` clips each frame to its cell first, which is what turns
"this character is too wide" from a build failure into a few clipped pixels.

### 2. Two soldiers, three posts

The two soldier sheets carry the same PixelLab prompt as their account name and are told apart only
by id and by silhouette — one in a tricorn with a musket held low, one shouldering a long musket in
a brown coat. The contact sheet confirmed they read as two different men, so both shipped rather
than one being posted three times.

They are `station`s, not routes, and that is the point: a watch is _posted_. Each faces what it is
there to watch — the field gate south of him, the landward road north of him, the river west of him.

### 3. Field workers are confined to their fields

`angolan-laborer` and `field-servant-south` are routes whose two stops are the ends of their own
plot's rows, inside fences, reaching no road. This mirrors the existing `indentured-servant` in the
pumpkin bed: they are walking the rows, not going anywhere.

### 4. The 1619 line says what the record says, and stops

`angolan-laborer` is ambient dialogue only — deliberately **not** wired into
`UNIT2_FIELD_SOURCE_POINTS`, so no content schema, evidence count or `validate:content` group
changes. The line names Ndongo, Luanda, and the trade for victuals at Point Comfort, sets him beside
the English servant counting down seven years, and then does not resolve his own status — because
the 1619–1620 muster rolls do not. Making it an assessed evidence source would have meant asserting
a resolution the sources withhold, which is the opposite of the HIPP reasoning the game teaches.

### 5. The blacksmith stands next to a building, not next to invented scenery

There is no forge, anvil or bellows tile in any palette this project owns — the trades props and
`military.civilWar.camp` are registered gaps in `canonical-palette.js`. Rather than invent scenery,
he is posted beside the storage shed at the south edge of the village, off its door cells. This is
the same constraint the carpenter's own comment recorded at Phase 60, handled the same way.

## What was not done

- **No new PixelLab generations.** Quota is zero; all seven already existed.
- **No new evidence/source points**, no content-file changes, no `validate:content` run needed.
- **No map regeneration** and no changes to `SPRITE_CANVAS` or the cast CSS tokens.
- **No visual baselines re-banked** — and this is not an oversight. `visual-regression.spec.js`
  deliberately hides `[data-npc]` on every field screen ("never pixel-stable between two consecutive
  frames"), so field baselines do not cover NPC appearance at all. All 20 passed untouched. Sprite
  coverage lives in `character-directions.spec.js` instead, which asserts every NPC resolves the
  intended sheet.

## Verification

- `--measure` printed `canvas 48x56, ground row 49`; `git status` confirmed 35 new PNGs, zero
  modified. Contact sheet reviewed by eye: 28 characters on one ground line.
- `npm run test` — 924 passed. `npm run lint` clean on every changed file. `npm run build` passes.
- `npm run test:e2e` — 76 passed, on five of eight full runs; see the flake note below, which is
  the honest version of that number.
- Looked at both maps in a real browser at 1366×768: the child reads as a child beside the village
  fire, the watchman and blacksmith stand where intended at correct scale with feet planted.

### One test was restructured, and one spec pair updated

`character-sheet-geometry.test.js`'s walk-cycle anchor check was a single case looping the whole
cast — the most expensive assertion in the file, decoding every column of every direction. At 28
characters it overran vitest's default 5s budget under full-suite load (it passed in isolation,
which is the worst way for it to fail). It is now `it.each(CAST)` like its three siblings: each
character gets its own budget, and a failure names the character in the title.

`npc-behaviour-field.spec.js` hard-coded "the minister is the one person authored to stand still."
With five stationed NPCs that assumption is gone; the spec now names the stationed set explicitly
and scales its in-motion bar to the mobile cast, so **adding stationary watch posts cannot make it
easier to pass**.

### The e2e suite is timing-flaky, and this phase adds load to it

Measured over eight full runs during this phase: **five came back 76/76; three failed once each,
on a different test every time** (`powhatan-man is reachable on foot`, then twice `field: each
direction plays its own walk cycle`). Every one of them passed in isolation immediately after.

This is a pre-existing structural property, not a defect introduced here. `playwright.config.js`
sets `fullyParallel: true` with **no `retries`** (default 0), so every CPU-timing-sensitive
assertion is one scheduling spike from red — and the affected specs' own comments already say so
("passing serially and failing under six parallel workers"; "a flake about the test's stamina, not
about the map"). The decisive evidence that the map is fine is that `walkToNpc` — documented as a
greedy two-axis walker "without needing a real pathfinder" — also fails to reach
`indentured-servant`, an NPC this phase only re-skinned and never moved.

What this phase does contribute is **load**: Riverbend went from 9 ticked NPCs to 15 and the
Caribbean from 6 to 7, so the suite sits nearer that cliff than it did. Every new anchor is proven
land-valid, collision-clear and route-reachable by the real pathfinder in
`field-map-coordinates.test.js`, which is deterministic and does not depend on wall-clock timing.

**Recommended, not done here:** set `retries: 1` in `playwright.config.js`. It is the standard
remedy for exactly this and would make the suite's signal trustworthy again, but it is shared test
infrastructure and a judgement call about masking genuine failures, so it belongs to whoever owns
that decision rather than to a character-import phase.
