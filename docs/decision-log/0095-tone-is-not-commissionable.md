# 0095 — Tone is not commissionable

**Phase 96 · 2026-08-28 · Accepted**

Six map objects commissioned into `derived/suburban-tract.png`, closing the half of
`streetscape.midCentury` that was real and deleting the half that never was. Ranked fourth among the
open commissions in [`THE-MAP-PROGRAM.md`](../design/THE-MAP-PROGRAM.md) §6 and the one item
blocking Unit 8's map. No engine changed, no content changed, and no map is built yet.

Second slice of **Candidate B**, after Phase 95 authored the unit's content (`0094`).

---

## 1. The entry could not have closed, and the reason is worth stating plainly

`streetscape.midCentury` had been in the gap register since the tile library was first catalogued.
It read:

> 1950s-specific. Highway Rest Area / Modern Park / Living room read contemporary. Partial;
> acceptable stand-in, flagged.

That names **three packs and a decade.** It does not name a building, an object or an animal, and
there is no job anybody could have ordered that would satisfy it — "make the 1950s exist" is not a
commission, it is a mood. The register would have carried that row until the project ended and
called it accuracy.

This is the same defect `architecture.indigenous.northAmerican` had, one row above, and `0067` §1
already wrote the general rule for it: **a register entry that describes a category can never
close.** What this phase adds is the other half of that rule. `0067`'s entry failed by naming three
things at once. This one failed by naming **no** thing at all — by describing a _tone_. Both are
unclosable, and the same test catches both: read the entry and ask what would arrive in the parcel.

## 2. What reconnaissance actually found

The method was the cheap one: take a real map — Unit 8's subdivision, August 1957, already authored
in Phase 95 — walk its object list, and check each item against the pixels rather than against the
catalog's prose.

**Two things are absent from 250 sheets across 28 packs:**

- **A house of the twentieth century.** The library's entire residential stock is 17th–19th-century
  clapboard (`farm/7`), Second Empire terraces (`19th Century European City`), frontier false-fronts
  (`Wild West`) and ruined concrete apartment blocks (`war ruins`). There is nothing built after
  about 1890 that a family lives in. This is the one thing that genuinely blocked the map: a
  subdivision with no houses is not a subdivision.
- **A car.** `Highway Rest Area` carries about forty vehicles across `tile-B-01` and `tile-B-06` and
  **every one of them is contemporary** — crossovers, box vans, semi tractors. `Steampunk/1`'s is a
  brass-era runabout. Between roughly 1910 and the present the library has no automobile at all, so
  Period 7 and Period 8 both drove nothing.

**And a long list is not missing, including several items the deleted entry named as failures.**
Asphalt, lane markings, kerbs, sidewalk slabs and driveway concrete (`Highway Rest Area/tile-B-01`);
mown lawn and concrete slab (`Modern Park/tile-B-01`); street trees, hedges and foundation planting
(`Modern Park/tile-B-05`); picket fencing (`farm/6`); utility poles with wires (`war ruins/25`);
lumber, brick pallets, cement and gravel for the lots still being built (`Construction/2`); the model
house's interior (`Living room/1`); the lending office's (`office/4`).

Those packs do read contemporary — **in their furniture.** `Highway Rest Area` is full of vending
machines, ATMs, wheelie bins and branded storefronts. The correct response to that is an exclusion
list, which is a line in a map's palette header, not a gap in a register. `p8-suburb` carries one
now.

`war ruins` was the one unexplored reserve worth checking, because `0049` found two of its
twenty-one unopened sheets to be a different pack from the one the catalog describes — that is where
`derived/richmond-ruins.png` came from. All twenty-five content sheets were surveyed here and the
answer is no: every one of them is damaged, and Fairmeadow's entire premise is that nothing on it
is.

**One honest row survives**, and it turned out to belong to two periods rather than one: the
**twentieth-century American commercial block**, the flat-parapet one- or two-storey building with a
plate-glass shopfront under a signboard fascia. `19th Century European City/tile-B-01` is Second
Empire and `Highway Rest Area/tile-B-02` is a strip mall; the library holds nothing between them.
`p7-depression-street` had been pointing at the mid-century entry for a 1930s main street — wrong by
twenty years — and what it actually lacks is exactly what Fairmeadow's lending office lacks. It
points there now.

## 3. What varies between the three houses is where the car goes

Not a colourway. Levitt's Bucks County models of 1952–58 were one house sold as several, and the
difference a buyer chose between was a **carport, an attached garage, or neither** — so
`houseCarport`, `houseGarage`, `houseDriveway` is what the record looked like rather than three paint
jobs. It also solves the composition problem: a tract is the same house repeated, and one plan
stamped eight times down a street reads as a rendering fault rather than as a subdivision.

The cars are two saloons and an estate, at one scale, because a driveway on this map is where a
mortgage ends up.

## 4. The scale error was invisible in the preview, and cost two rounds

This is the part to carry forward.

Asked for a **"long low"** house on a wide canvas, the generator returns a 195×55 slab. The
proportions are right — a ranch house _is_ long and low — and the thumbnail looks correct. Dropped on
real library ground beside a real character it is a house whose **roof ridge is level with a 45px
body's head**, which is not a house, and no amount of looking at it on a grey field would have said
so.

`reports/_recon/scene.mjs` was written for exactly this: composite the candidate onto the map's real
grass, kerb and road with `director-rowan-hale-idle-down` standing beside it, at 2×. The numbers to
check a new building against are the library's own small one-storey buildings — `Highway Rest
Area/tile-B-06`'s roadside block at **93×96** and `tile-B-01`'s restroom at **89×144**. The three
houses here sit at 85–100px and read as buildings.

The cars are deliberately **shorter** than the library's own 144px contemporary sedan (128–147px).
None of that fleet may appear on this map — it is the reason the cars were commissioned — so they are
scaled to the houses they park at rather than to vehicles that are excluded by era.

## 5. The misses rhyme with the chevaux-de-frise, a third time

- **"L-shaped" fetched a steep-roofed cottage with a chimney, twice.** The generator answers the
  plan shape with a house-shaped prior and drops the adjective. The second roll came back as a
  perfectly good _different_ house, so it was kept under the name the render earned — the same move
  the manifest records for `abatis`.
- **Every early car came back a show car** — pinched waist, separate fenders, open cabin, a hot-rod
  render whatever decade was named. The culprit was the combination of "chrome", "fins" and "seen
  from directly above", each of which is individually accurate and collectively a magazine cover.
  What worked was asking for the **plainness**: matte, few highlights, a flat rectangular roof panel
  between a windscreen band and a rear-window band.
- One roll came back a **solid grey rectangle**, which is at least a cheap failure to spot.

**Name the construction, never the thing.** Third phase running.

## 6. What was deliberately not done

- **No map, no cast, no interiors, no activities**, and `main.js` is untouched. Unit 8 is still
  absent from `UNITS` and still lands a player on the wrong continent if registered early — `0075`.
  The map is the next slice.
- **No `Chronicle Commissions` catalog entry.** `TILE-LIBRARY-CATALOG.md` documents the purchased
  packs; the three prior commissions are not in it either, and the manifest is where a derived
  sheet's provenance lives.
- **No commercial-block commission.** It is a real registered gap and the strip-mall substitution is
  acceptable at the distance this map uses it. Commissioning a building for a room the player does
  not enter would be decoration, which is `0067` §3's own test.
- **Nothing for `p7-depression-street` beyond repointing it.** Its gap string had to change because
  the one it named was deleted; correcting Period 7's slate is Period 7's phase.
- **No `import.meta.glob` in `main.js`.** The sheet is not drawn by anything yet. That registration
  is the step `MERIDIAN-ASSET-BRIEF.md` §4 warns has been forgotten twice, and it belongs to the map
  build, where a missing one renders the whole map as an empty frame.

## 7. Verification

`node scripts/assets/pack-objects.js` — six sprites packed, nothing clipped on the 48px grid,
confirmed by eye at 2×. `tests/unit/tile-footprints.test.js` and `tests/unit/tile-palettes.test.js` —
122 assertions, including the two that bind here: every gap a planned map declares is registered, and
every declared footprint matches the pixels. `npm run assets:audit` — the packed sheet is 43 KB
against the tilesets category's 500 KB budget. Full `npm run check` and `npm run build` clean.

**By eye at 2× and 4×, against a 45px reference body on the map's own ground**, three times: once to
accept or reject each roll, once to catch the scale error the first two rounds shipped, once to
confirm the packed sheet clips nothing. There is no cheaper tier for this and the visual baselines
cannot see it either way — nothing renders these objects yet.
