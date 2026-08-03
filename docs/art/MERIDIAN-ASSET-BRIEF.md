# Meridian Asset Brief

What Meridian needs built, what the library already covers, what has to be commissioned, and what it
costs. Written in Phase 79 from five concept plates; decision log `0062`.

[`MERIDIAN-VISUAL-IDENTITY.md`](./MERIDIAN-VISUAL-IDENTITY.md) is the _why_ and stays the authority
on look. This file is the _what_, and it is the file a later art phase executes from. Neither one
generates anything: §6 of the identity doc carries the standing rule — **do not generate until the
character direction is approved** — and it still stands.

Read [`CHARACTER-CAST-SPEC.md`](./CHARACTER-CAST-SPEC.md) before ordering a character and
[`../architecture/art-and-map-style-guide.md`](../architecture/art-and-map-style-guide.md) before
ordering a prop. This file does not restate either.

---

## 1. The constraint to internalise first

The concept plates are painterly renders of tall rooms. **The game is a 48px top-down tile world**
seen from a low overhead camera, with a 48×56 character canvas and a 45px standing body.

The plates' strongest quality is vertical — mezzanine galleries, vaults, arches, chandeliers,
ceiling height. **None of it survives the camera.** What translates is:

- **Floor plan** — one long axis, symmetrical, stations ranked either side of it.
- **Floor pattern** — the inlaid compass rose and meridian lines are the single highest-value
  element in the plates, because a floor is the one large surface a top-down camera shows in full.
- **Prop density and matching** — Meridian reads wealthy because its furniture matches and repeats,
  not because its ceilings are high.

Brief the plates for materials and arrangement. Never for elevation.

## 2. What the library already covers

Every environment element in the plates except three has a sheet on disk today. All four packs below
are already `CANONICAL` in [`TILE-LIBRARY-CATALOG.md`](../architecture/TILE-LIBRARY-CATALOG.md) and
inside the approved painted 48px family, so **no pack whitelist change is needed and none should be
proposed.**

| Element in the plates                                                                    | Sheet                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| Dark wood-panelled walls                                                                 | `office/4.png`                              |
| Archive shelving stacks, double-sided, ranked                                            | `office/3.png`                              |
| Parquet, block, inlaid-medallion and chequer floors                                      | `19th Century European City/tile-B-04.png`  |
| Filled bookcases, writing desk with inkstand, safes, grandfather clock, marble fireplace | `19th Century European City/tile-B-04.png`  |
| Glazed upright cabinets, committee seating, sideboards                                   | `19th Century European City/tile-B-02.png`  |
| Card-catalogue cabinets, globes on stands, brass telescopes, carved desks, gas lamps     | `Steampunk/5.png`                           |
| Riveted-copper wall, gauges, workbenches with glassware (the improvised plate)           | `Steampunk/5.png`                           |
| Wall surfaces / autotile                                                                 | `office/Auto-tile-A4-walls-2.png`, `-3.png` |

Two standing rules apply and are not relaxed here. **`Steampunk` is a prop quarry, never a base
pack** — its gears, airships and mecha are disqualifying everywhere except the narrow seam sheet `5`
sits in. And `office/3` is described by the catalog as _"the single best Institute Archive fit in the
library"_, which is exactly why it is being spent on Meridian rather than on Chronicle — see
`MERIDIAN-VISUAL-IDENTITY.md` §2's closing paragraph.

## 3. What must be commissioned

Three props, one mark, one character. In priority order.

Sizing reference, from the style guide: library buildings run 94–183px, trees 129–142px, and
interior furniture about 2× a body — all against the **45px standing body**. Do not size a new prop
against the Institute's stool, which is painted to fill its tile and is not in proportion to
anything.

### 3.1 The anchor ring — the one that matters

Nothing in 250 sheets across 28 packs is this. It carries `MERIDIAN-VISUAL-IDENTITY.md` §2's shared
material — anchor glass, pale cyan, **never recoloured per faction** — so it is simultaneously the
most visible Meridian object and the one that has to read as Chronicle's technology developed
further. Get this wrong and the whole descended-from-Chronicle idea has nowhere to live.

**Two states**, matching §7's arc:

| State          | Footprint | Reads as                                                                        |
| -------------- | --------- | ------------------------------------------------------------------------------- |
| **Improvised** | 2×2 tiles | A brass ring on a floor stand, about 1.5× a person. Assembled, not built in.    |
| **Installed**  | 3×4 tiles | Set into the room's end wall on a stepped dais. Monumental against a 45px body. |

**Prompt shape, not object name.** The chevaux-de-frise precedent in
`derived-objects.manifest.js` is the warning: five rolls, three came back a picket fence, because the
generator answered the noun rather than the description. Describe **concentric brass rings around a
disc of pale cyan glass, ruled with fine meridian lines** — the geometry — rather than asking for a
portal, a gate or a time machine, all three of which have strong and wrong priors.

### 3.2 The great circular map table

Chronicle's Navigation Table is `Island survival/5` at **2×3 tiles**, and it is the object a player
has walked to more than any other in the game. Meridian's council table is the prop most likely to be
compared against it, so reusing Chronicle's collapses the faction read at the worst possible place.

**3×5 tiles** — deliberately larger than Chronicle's 2×3, because "Meridian can afford it" is the
whole distinction §2 now turns on and this is where a player can actually see the difference. A dark
hardwood ring with a brass rail, a teal inlaid map surface, and a small lit instrument at the centre.

### 3.3 Glass-topped chart cases

`19th Century European City/tile-B-04`'s glazed cabinets are **upright** furniture. The plates want
horizontal cases lit from within, and they are what makes a room read as an evidence archive rather
than as a library.

**2×1 tiles**, two or three variants so a ranked run does not read as one tile repeated — the same
reasoning that gives `institute-hall.palette.js` four cabinet fronts.

### 3.4 The insignia — five deliverables

Specified in full at `MERIDIAN-VISUAL-IDENTITY.md` §5 and not restated. Two notes on execution:

- **Only #1 is generated.** #2–#5 are derived from it by subtraction, not redrawn. Five independent
  generations produce five marks that do not look like the same organisation.
- **Test at sprite scale first** (12–16px) and work upward. This is §5's own warning and it is the
  most commonly ignored instruction in this whole document.

The insignia is **not a tile** and does not go through the object-packing pipeline below unless and
until it appears as a map prop. Its first consumers are documents and interface headers.

### 3.5 Emery Voss — two sheet keys

`liaison` and `liaison-meridian`, per
[`../design/THE-FIELD-LIAISON.md`](../design/THE-FIELD-LIAISON.md) and
`MERIDIAN-VISUAL-IDENTITY.md` §6. The fifth concept plate is the costume reference, and §6's
"Reading the costume plate" subsection records the two corrections it needs — **mid-length
asymmetrical coat, and no held props** — before anything is ordered.

Design the **revealed** state first and cover it up to produce the Chronicle-facing one. Doing it the
other way round produces two characters who happen to share a haircut.

## 4. The pipeline for the three props

Already exists; follow it rather than inventing a path. Precedent:
`Chronicle Commissions/civil-war-works.png`, six objects, which closed the Civil War camp gap.

1. Generate → save to `apps/web/src/assets/tilesets/Chronicle Commissions/meridian-works.png`.
2. Add an entry to
   [`../../apps/web/src/content/tilesets/derived-objects.manifest.js`](../../apps/web/src/content/tilesets/derived-objects.manifest.js)
   using **explicit `box:` cuts, not flood-fill seeds** — both shipped commissions use boxes printed
   by `reports/_review/compose-commission.mjs`, so the layout is known rather than rediscovered.
3. `npm run assets:pack-objects` → `apps/web/src/assets/tilesets/derived/meridian-works.png`.
4. `npm run assets:measure` for each footprint; `tests/unit/tile-footprints.test.js` fails the build
   if a declared footprint drifts from the pixels.

**The canvas is the scale.** A generated object is drawn to fill the canvas it is given, so the
canvas is how you set the size — there is no separate scale argument at generation time.
`pack-objects.js` has a `scale` option for the rescue case (it is how the 2×2 brass compass became
the 1×1 instrument sitting on Chronicle's table), but reaching for it means the canvas was wrong.

**Registering the sheet is a separate step and it is the one that gets forgotten.** A palette naming
`derived/meridian-works.png` also needs its `import.meta.glob` added in `main.js` beside the others;
`createTilesetImageResolver()` throws on a missing one and the whole map renders as an empty frame.
That has now happened twice.

## 5. Cost

The account's subscription allowance is exhausted, billing falls back to credit at **~$0.02/job**,
and the account caps at **8 concurrent jobs**.

| Item                  | Jobs  | Note                                                        |
| --------------------- | ----- | ----------------------------------------------------------- |
| Anchor ring, 2 states | 4–6   | Budget for re-rolls. This is the hardest prompt in the set. |
| Circular map table    | 2–3   |                                                             |
| Chart cases           | 2–3   | Two or three variants, not one.                             |
| Insignia              | 3–5   | #1 generated; #2–#5 derived by subtraction.                 |
| Emery Voss, 2 states  | ~10   | 1 create + 1 per direction per state.                       |
| **Total**             | 21–27 | **≈ $0.45–0.55**                                            |

The generation spec is fixed by the shipped pipeline and must not be re-derived — `size: 40` (a body
height, **not** the canvas; 88 is wrong), `view: low top-down`, `single color black outline`,
`detailed shading`, `high detail`, `heroic` proportions, and walks from the `walking-8-frames`
**template, never `v3`**. Canvas is a pinned 48×56, feet on row 49, 45-row standing body. Director
Hale is the style anchor and **must not be regenerated**.

## 6. Sequencing

1. **Insignia first.** It is the cheapest, it gates the early-unit partial-mark clue, and both the
   props and the costume want to carry it. Ordering a coat before the mark exists means ordering the
   coat twice.
2. **The anchor ring next**, because it is the highest-risk prompt and everything about Meridian's
   spaces is arranged around it. If it cannot be made to work, that is a fact worth learning before
   any room is laid out.
3. **Voss** once the character direction is signed off — §6's standing rule, and also just economics.
4. **Table and cases last.** They are furniture; they can be ordered against a real room composition
   rather than in the abstract, which is the same reason `planned-maps.js` refuses to declare tile
   coordinates ahead of a map.

**No room is built from this file.** `meridian-interior` sits in `planned-maps.js` as a `candidate`
with its sheets chosen and its gap registered, and building it is a separate decision with its own
sign-off — exactly the status the entry it replaced carried, for exactly the same reason.
