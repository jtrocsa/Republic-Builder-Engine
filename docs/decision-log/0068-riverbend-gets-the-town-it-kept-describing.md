# 0068 — Riverbend gets the town it kept describing

**Phase 84 · 2026-08-17 · Accepted**

The Powhatan landing on `riverbend-field.tmj`: three yehakins, a drying rack, a staked hide and a
maize ground, drawn from the sheet [`0067`](./0067-the-gap-that-was-three-gaps.md) commissioned.
The pass that ADR named as next and deliberately did not do. No engine changed; one glob, one
palette, one generator section, one new test.

---

## The problem

Two Powhatan NPCs have worked the northwest shore since Phase 62 with no structures of their own,
because nothing in the tile library could draw one. Phase 83 closed that gap. What made it worth
doing immediately rather than filing is what the two of them say:

> Our canoes have carried corn and news between these **towns** since long before a ship found the
> mouth of this river.

> The corn the strangers ate through the winter grew in **our fields**.

There were no towns and there was no field. The dialogue was carrying the entire claim by itself,
on a map whose own argument is that the English settlement is not the only settlement in the frame —
and a player who looks where those two lines point found grass.

## 1. Three of the seven objects belong here, and the other four are the same error inverted

`indigenous-village.png` carries an earth lodge, a bark lodge, two tipis, a drying rack, a hide
stretcher and an agency stone hut. Only the bark lodge, the rack and the stretcher are on this map.

The earth lodge is a Missouri-valley form and the tipis are Plains. Reaching for either in 1620s
Virginia because it is on the Indigenous sheet is exactly the bohío substitution running in the
opposite direction — and it would be `0067` §2's own argument used against itself, since that
section permits reuse **only** where the construction is the same building. It is not, here.

`barkLodge` is stamped three times. A Powhatan town was rows of houses built the same way, so three
different silhouettes would be the wrong claim about it; the variety a map usually wants is the
wrong instinct in this one place.

## 2. The layout went around the people

Both NPCs' coordinates are unchanged. The man's circuit runs (11,7)↔(14,5.5) on the bank and the
woman's (12,11.5)↔(14.5,12.5) south of him, and every stamp is clear of both — including of the
cells the stops snap to.

That last clause is the one worth writing down, because the failure is silent. A stop that lands on
an occupied cell **snaps to the nearest open one** and the authored coordinate is simply lost, with
no error and no failing test unless the route stops reaching anything at all. Phase 62 chose those
four coordinates to keep two people from answering for each other; a lodge dropped carelessly would
have undone that and looked fine.

The corn goes the other way on purpose: the plot is placed so the woman is standing **in** it.
Crops carry no collision, so the one place an NPC may be overlapped by scenery is the scenery she
is described as tending.

## 3. Two things the landing deliberately does not get

**No `doors`.** Every other structure on this map is registered as a door so the router runs a spur
to it. A spur here would run the English settlement's dirt tracks up to a yehakin and annex the
landing onto its road network — a claim the unit spends three missions complicating. The landing has
its own ground and no path to it.

**No ornamental shrubs.** The 5% bush scatter is rose, berry and flowering lilac: an English cottage
garden's plants. One of them landed between the drying rack and a yehakin in the first render. The
landing rect is excluded now, because a shrub in that gap says the two grounds are the same ground.

`plotMaize` is a **flagged compromise** rather than a solved one: right crop, European rows, where a
Powhatan field was hills of maize intercropped with beans and squash. It is the same call the style
guide records for Canal Crossroads' Second Empire brick — manage the gap and say so — and a field in
the wrong arrangement is a smaller error than a woman describing a field that is not there.

## 4. The missing-glob trap fired a third time, so it is a test now

Adding a sheet to a palette also costs an `import.meta.glob` in `main.js`. Forgetting one is not a
missing-texture bug: `createTilesetImageResolver()` throws, the canvas never sets `data-rendered`,
and the **entire map** renders as an empty frame — which reads like a routing or a save failure and
gets debugged as one. It cost a test run here, and `CLAUDE.md` already said it had happened twice.

`tile-palettes.test.js` now checks every live palette's declared sheets against main.js's glob
literals, one case per map. It is a text scan by necessity — Vite requires a literal in
`import.meta.glob`, so the patterns cannot be imported and read at runtime. Verified by breaking the
path and watching it go red with a message that names the symptom.

## 5. The landing gets no visual baseline, deliberately

`field-riverbend` frames the spawn at (26,18); the landing is fourteen tiles upriver and outside the
shot. Getting the camera there would mean walking that distance with `walkTo()`, which steers and
shoves rather than pathfinds, and **a flaky screenshot is worth less than no screenshot.**

What does cover it: the glob test (the failure that actually occurred), `field-map-coordinates`
(both routes still reach their stops around the new collision rects), the existing Riverbend
baseline (the map still draws at all with a new tileset in its `.tmj` — which a missing glob would
break), and `scripts/assets/preview-map.js` for composition, reviewed by eye across two layouts.
The first was three isolated huts at the corners of an empty green; the spec says all of this where
the baseline would have been.

## What this does not do

- **No new NPC, no new dialogue, no new record.** The village is scenery for two people who were
  already there saying the things it illustrates.
- **Nothing for Unit 6.** The railhead still needs its cast, its `.tmj` and its three activities.
- **It does not close the longhouse or pueblo gaps**, and `barkLodge` is still not a substitute for
  either.
