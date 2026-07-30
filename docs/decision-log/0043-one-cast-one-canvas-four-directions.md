# 0043 — One cast, one canvas, four real directions

**Status:** accepted · **Phase 60** · supersedes the "generation parameters" half of
[`docs/art/CHARACTER-CAST-SPEC.md`](../art/CHARACTER-CAST-SPEC.md) and implements
[`docs/art/CHARACTER-SPRITESHEET-STANDARD.md`](../art/CHARACTER-SPRITESHEET-STANDARD.md).

## What was wrong

The cast was four art styles at five native resolutions, and only one character — Director Hale —
was real pixel art. Three consequences, all visible in the shipped game:

1. **Eighteen field NPCs shared six sprite sets across three centuries.** Philadelphia's town crier
   was drawn as Christopher Columbus; a colonial farmwife as a Taíno gardener. In a history game
   that is a content-accuracy defect, not a polish item.
2. **The player rendered ~24% taller than everyone standing next to them** — 83px against the
   Director's 67 — because four sprite boxes carried three different aspect ratios and
   `object-fit: contain` silently bound on a different edge for each.
3. **North and west were fakes.** `up` resolved to the _south_ sprite tinted 8% darker by a filter
   that a later `filter: none !important` had already killed, so north was simply south. `left` was
   the east art mirrored. "Animation" was two poses crossfading on a timer.

## Decisions

**One canonical canvas: 48×56, feet on row 49, standing body 45 rows.** Every character in the game
is normalized onto it. The eleven rows above the body are headroom for spears, bows, baskets and
walk-cycle stride, so a prop can never squash the body carrying it. `--cast-h: 83px` renders that
body at 67px — the height the Director has always drawn at, and now the height of the whole cast.

**Body height is what gets normalized, not the sprite's bounding box.** Measuring alpha bounds would
let the Caribbean man's raised spear and the Powhatan man's bow shrink their bodies below everyone
else's. The build measures body rows only — rows carrying at least four opaque pixels — so a shaft
one to three pixels wide cannot vote.

**Only genuine outliers are resampled.** Fourteen of the fifteen PixelLab characters land within
44-46px of each other, a spread that reads as ordinary variation in adult height; resampling any of
them by 0.96 would damage pixel art for no visible gain. Only the Powhatan woman is rescaled (40px →
45px), because PixelLab generated her on an 80px canvas while the rest of the cast got 88-96px —
that is a generation-parameter accident, not a design choice.

**Alignment is per direction, and the standing pose is aligned to the walk cycle.** PixelLab draws
each rotation independently and generates static rotations in a different pass from animations.
Columbus's north pose stands two source rows higher than his south one; his west rotation stands
three rows lower than any frame of his west walk. Both are pure integer translations to fix, and
both are visible if left alone — the first as a hop when turning, the second as a drop when
stopping.

**Four strips per character, columns `[standing, walk0 … walkN-1]`.** Column 0 is a real standing
pose drawn for that direction, so "keep facing the way you last walked" falls out of the frame
layout instead of being maintained by hand. Column counts travel with the character: PixelLab gave
Director Hale a 6-frame walk template and the rest of the cast an 8-frame one.

**No runtime mirroring anywhere.** The Powhatan woman is the one character PixelLab left without a
west walk cycle; her west strip is her genuine west rotation plus mirrored east frames, baked into
the file at build time. Regenerating the missing direction costs a generation and the subscription
quota is exhausted (46/40 used, $1.81 credit).

**Unit 3 is frozen, deliberately.** No Revolutionary-era characters exist in the account. Rather
than dress John Dickinson in Columbus's real 1492 doublet, Philadelphia's six NPCs keep the
placeholder art they already used, rebuilt onto the same canvas under `legacy-*` keys of their own.
Giving them separate keys is the whole point: without it, upgrading `columbus` reaches Philadelphia.

## The renderer

CSS `background-position-x` stepped by `steps()` over a horizontal strip — the technique
`CHARACTER-SPRITESHEET-STANDARD.md` chose over a second requestAnimationFrame loop, now implemented.
The frame maths is in **percentages**, not pixels: with the strip sized to `columns * 100%`, a
`background-position-x` of `100% * k / (columns - 1)` lands on column k whatever size the element
is. That is what lets one class serve both the 48×56 world sprites and the viewport-relative figures
in the onboarding hallway.

Three registries (`fieldNpcSprites`, `fieldSpriteAssets`, `instituteNpcSprites` — 45 loose paths in
three shapes, resolved by three near-identical functions) collapse into one `CHARACTER_SHEETS`.

## Placement

Unit 1 needed **one** change: the canoe worker stood five tiles from the nearest beach cell and four
and a half south of the nearest canoe while saying "The water is a road to us." He moved to the
north-lobe shore beside the village canoe. The other five Caribbean NPCs were already correctly
sited.

Unit 2 gained three NPCs: a **carpenter** at the barn's east corner, and a **Powhatan man and
woman** at a river landing on the open northwest shore, upriver of and well clear of the English
settlement.

## Known limitations

- **Riverbend has no Indigenous community zone and one cannot currently be built.**
  `content/tilesets/canonical-palette.js` registers `architecture.indigenous.northAmerican` as a
  library gap — "longhouse, pueblo, plains lodge — nothing fits" — and explicitly forbids reusing
  Island Survival's Taíno bohíos as generic "Native American." `planned-maps.js` carries
  `p1-indigenous-settlement` at `status: "blocked"` for the same reason. So the two Powhatan NPCs
  stand in open ground with no props of their own. That is a limitation of the tile library, not of
  the placement, and it needs a Powhatan river-landing prop set to fix.
- **Riverbend has no timber pile, sawpit, workbench or half-framed building.** The carpenter stands
  at the barn because the barn is the closest thing to a worksite that exists.
- **Three characters are shared.** Two Caribbean characters cover three Lucayan roles, and four
  Jamestown characters cover seven English ones. The minister and the burgess stand 4.1 tiles apart
  sharing the Gentleman sprite; their label pills distinguish them, and two well-dressed English men
  in a 1610s settlement is not historically wrong.
