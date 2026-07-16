# Art & Map Style Guide

Living reference for "what tile do we use for grass, for trees, for a colonial house" —
the canonical answer, not a menu of options. Read this before touching any `.tmj` or
adding a new tileset pack. Pairs with `docs/decision-log/0031-art-style-unification.md`
(the short dated decision record) and `docs/architecture/tiled-map-import-checklist.md`
(the technical export contract — this guide doesn't repeat that content, it tells you
which pack/sheet to point Tiled at).

## Purpose & scope

The problem this guide solves is **consistency of element identity**, not fidelity.
Chronicle's current tile art (`apps/web/src/assets/tilesets/`, 48×48px painted-pixel
packs) is already higher-fidelity than literal GBA-Pokémon chibi scale, and that's kept
— the goal is Pokémon's _discipline_ (one deliberate answer per element, reused
everywhere it applies), not its pixel count. Concretely: pick one canonical source for
each recurring visual element, per historical setting, and stop letting each map's
author re-decide "what does grass look like here" from scratch.

This guide covers the 9 tileset packs already in the repo (87 files, not "thousands" —
an early scoping assumption corrected during this planning pass). Sourcing or
generating new packs is explicitly **out of scope** for this guide; where no existing
pack fits, that's recorded in the Gap Register below and deferred to a future
asset-acquisition session.

## Canonical Element Dictionary

One row per recurring visual category. `CANONICAL` = the source of truth, use this
unless the per-setting table below says otherwise. `ACCEPTABLE` = usable but not ideal,
allowed until upgraded. `GAP` = no existing tile is a real fit; don't force one.

| Category                                                                                   | Canonical pack → sheet                                        | Status       | Notes                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ground/grass (general)                                                                     | _(setting-dependent — see per-setting table)_                 | —            | No single grass tile serves every era; each setting gets its own pick below.                                                                                                                                                                  |
| Sand/beach/coastline                                                                       | Island survival → `tile-B-01.png`                             | `CANONICAL`  | Tropical settings only. Has a full sand→shallow→deep water ring and an unused coastline autotile blob set (see Caribbean enrichment note).                                                                                                    |
| Water/ocean                                                                                | Island survival → `tile-B-01.png`                             | `CANONICAL`  | Tropical settings only; non-tropical water uses Medieval Fishing Village (below).                                                                                                                                                             |
| Coastal/dock water                                                                         | Medieval Fishing Village → `tile-B-04.png`                    | `CANONICAL`  | Temperate/colonial dock scenes (Riverbend).                                                                                                                                                                                                   |
| Path/dirt road                                                                             | Medieval Fantasy Town → `1.png` (grass/dirt path tiles)       | `ACCEPTABLE` | Currently doubles as Riverbend's base ground fill — see Riverbend row below; a dedicated colonial dirt-road tile hasn't been isolated yet.                                                                                                    |
| Trees/palms/tropical foliage                                                               | Island survival → `tile-B-01.png`                             | `CANONICAL`  | Palm variants, jungle canopy.                                                                                                                                                                                                                 |
| Terrain accents (rocks, driftwood, shells, coral)                                          | Island survival → `tile-B-01.png`                             | `CANONICAL`  | Bottom third of the sheet — currently almost entirely unused, see Caribbean enrichment.                                                                                                                                                       |
| Tropical/Indigenous architecture (thatched huts)                                           | Island survival → `tile-B-02.png`                             | `CANONICAL`  | Bohío-style huts, palisade fencing.                                                                                                                                                                                                           |
| Colonial/European timber-frame architecture                                                | Medieval Fantasy Town → `1.png`                               | `CANONICAL`  | Stone/half-timber Tudor buildings, castle towers/walls. Explicitly rejected in-code for Revolutionary Philadelphia (too European/fantasy-coded) — still fine for earlier New England colonial framing.                                        |
| Dock/maritime structure (wharf, lighthouse, boats)                                         | Medieval Fishing Village → `tile-B-04.png`                    | `CANONICAL`  | Wooden dock buildings, nets, lighthouse, rowboats.                                                                                                                                                                                            |
| Fencing/enclosure                                                                          | Island survival (tropical) / Medieval Fantasy Town (colonial) | `CANONICAL`  | Per-setting, matches the architecture pick above.                                                                                                                                                                                             |
| Market/village props (crates, barrels, tents, campfire)                                    | Island survival → `tile-B-01.png`                             | `CANONICAL`  | Tropical only; largely unused today (enrichment opportunity).                                                                                                                                                                                 |
| Cultivated field/crop rows                                                                 | farm → `3.png` (tile local id 38 only)                        | `ACCEPTABLE` | Confirmed by direct GID audit (see Riverbend row) — a single repeated tilled-soil/crop-row tile, not any vehicle. Keep the glob scoped to exactly this file.                                                                                  |
| Interior floor (stone/wood)                                                                | Medieval Tavern → `tile-B-01.png`                             | `CANONICAL`  | Reused for the Institute Archive Room — see per-setting note, this is a deliberate choice, not a placeholder.                                                                                                                                 |
| Interior furniture — archival/historical (shelving, tables, benches)                       | Medieval Tavern → `tile-B-01.png`, `tile-B-03.png`            | `CANONICAL`  | Use only shelving/table/bench/stool/torch pieces; avoid overtly tavern-specific props (beer mugs, wine racks framed as wine, drinking banners) that break the "archive record storage" reading.                                               |
| Modern institute interior (desks, terminals, filing)                                       | _none_                                                        | `GAP`        | `Modern Interiors` was evaluated and rejected (decision log `0030`) — its sheets aren't a uniform tile grid the loader can parse. Not re-opening this; Medieval Tavern's neutral furniture is the working solution (see Institute row below). |
| Revolutionary/Georgian colonial urban architecture (print shop, assembly hall, statehouse) | _none_                                                        | `GAP`        | Confirmed in-code (`main.js` ~788-795): no pack in the repo fits 1760s-70s Philadelphia. Primary entry in the Gap Register.                                                                                                                   |

## Per-setting palette assignments

Same category, different era — this is what keeps "grass" meaning one specific tile
_within_ a setting while letting settings look distinct from each other.

### Caribbean, 1492 (`case-001`, `caribbean-field.tmj`)

- Ground/grass: Island survival `tile-B-01.png` (jungle grass tile)
- Everything else: per the Canonical Element Dictionary's tropical rows above.
- Status: **matches the guide already** — no remediation needed, only optional
  enrichment (Phase 3 below).

### Riverbend, ~1620s New England (`case-004`, `riverbend-field.tmj`)

- Ground/grass: Medieval Fantasy Town `1.png` (this is the map's dominant base-fill
  tile today — confirmed by direct `.tmj` inspection, GID 463 = local id 206 in that
  sheet, tiled across nearly the entire ground layer).
- Water/dock: Medieval Fishing Village `tile-B-04.png` (GIDs 130/147/167/212).
- Buildings: Medieval Fantasy Town `1.png` (GIDs 421/437 in the structures layer).
- Cultivated field: farm `3.png`, tile local id 38 only (GID 551) — confirmed by
  GID audit to be a repeated ground-fill tile forming a rectangular field patch, not a
  vehicle placement. One additional farm tile (GID 560, local id 47) appears as a
  sparse repeated structures-layer accent, also non-vehicular.
- Status: **genre-consistent, but over-scoped in code** — see Phase 2 below. The
  farm-pack anachronism risk originally flagged in this planning pass turned out to be
  low once audited directly; the real issue is `main.js`'s glob for this map pulling
  in whole pack folders (`Medieval Fishing Village/**`, `Medieval Fantasy Town/**`,
  `farm/**`) when only one file from each is actually referenced.

### Institute Archive Room (present-day hub interior, `archive-room.tmj`)

- Floor/furniture: Medieval Tavern `tile-B-01.png` + `tile-B-03.png`, selectively
  (shelving, reading table, stool, corner torches) — **this is deliberate, documented
  in decision log `0030`**, not an unaddressed mismatch. `Modern Interiors` was
  directly evaluated and rejected for a real technical reason (its sheets aren't a
  uniform tile grid `tiled-map-loader.js` can parse), not overlooked.
- Status: **canonical as-is.** This planning pass originally flagged the Archive Room
  as a style mismatch before reading `0030` — that read is wrong. No remediation
  planned; the "modern institute interior" GAP row above exists so a future real asset
  can be dropped in without re-litigating this choice, but nothing is blocked on it.

### Common Cause, 1770s Philadelphia (`case-007`, no `.tmj` — CSS-drawn)

- No tile pack applies (see the Colonial urban GAP row above).
- Status: **stays CSS-drawn.** `commonCauseWorldMarkup()` renders buildings directly
  from `UNIT3_FIELD_BLOCKS` (`main.js` ~795-931), so the drawn footprint and the
  collision rects can never drift apart — a real, deliberate design property, not a
  placeholder to discard casually. Migrating to Tiled must preserve this guarantee
  when a matching pack is eventually available.

## Pack roster & disposition

| Pack                     | Files | Verdict                               | Use                                                                                                                                                                                      |
| ------------------------ | ----- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Island survival          | 13    | `KEEP-CANONICAL`                      | Caribbean (tropical terrain/architecture/props)                                                                                                                                          |
| Medieval Fishing Village | 4     | `KEEP-CANONICAL`                      | Riverbend (dock/maritime)                                                                                                                                                                |
| Medieval harbor          | 8     | `KEEP-CANONICAL` (unused today)       | Same visual family as Fishing Village/Tavern; no current map needs it, kept as a same-style extension source                                                                             |
| Medieval Tavern          | 8     | `KEEP-CANONICAL`                      | Institute Archive Room interior (selective furniture only)                                                                                                                               |
| Medieval Fantasy Town    | 16    | `KEEP-CONDITIONAL`                    | Riverbend ground/buildings; explicitly **not** valid for Revolutionary Philadelphia (too European/fantasy-coded, rejected in-code)                                                       |
| farm                     | 7     | `KEEP-CONDITIONAL`                    | Exactly one crop-row tile (`3.png` local id 38) for Riverbend cultivated fields; the vehicle/tool tiles are never used and shouldn't be                                                  |
| Modern Interiors         | 4     | `KEEP-CONDITIONAL` (currently unused) | Evaluated and rejected for the Archive Room per decision log `0030` (non-uniform tile grid); retained on disk in case a future pass finds a narrow use, not actively slated for anything |
| Green Apocalyptic 1      | 13    | `ARCHIVE-CANDIDATE`                   | No APUSH setting matches post-apocalyptic ruins; flagged for pruning, not deleted without separate sign-off                                                                              |
| Green Apocalyptic 2      | 13    | `ARCHIVE-CANDIDATE`                   | Same as above                                                                                                                                                                            |

## Fidelity & authoring rules

Non-negotiables restated here so map work doesn't regress; full detail lives in
`docs/architecture/tiled-map-import-checklist.md`:

- 48×48px tiles, orthogonal orientation, CSV tile-layer format, no flip/rotate.
- Tileset image resolution is a per-pack scoped `import.meta.glob`, **naming exact
  files**, never a whole-folder `/**` glob. This has regressed twice already: once
  causing a 117MB unused-art bundle (fixed, documented in the checklist), and once
  more subtly in Riverbend's current wiring (`Medieval Fishing Village/**`,
  `Medieval Fantasy Town/**`, `farm/**` all glob entire folders when each map only
  references one file per pack) — flagged for cleanup in Phase 2.
- Collision is always a separate hand-coded array in `main.js` (`FIELD_BLOCKS`-style
  rects or `isCaribbeanLand`-style predicates) — never derived from the `.tmj`, which
  carries visuals only.
- When a `.tmj` is generated by a script (`scripts/generate-caribbean-tmj.js`,
  `scripts/generate-archive-room-tmj.js`), treat the script as the source of truth and
  re-run it rather than hand-editing the JSON.

## Camera & dialogue conventions (documented as-is — deliberately not redesigned)

Both are explicitly invariant-protected in `CLAUDE.md`'s "Gameplay invariants" section,
sourced from real regressions across milestones 3.4.5–3.4.15:

- **Camera** (`.field-viewport`, pure function of player position, clamped/rounded
  transform) stays exactly as it is. The current top-down 48px framing already reads
  reasonably close to a Pokémon-style camera; retuning zoom/aspect for marginal visual
  gain isn't worth risking a protected invariant.
- **Dialogue** (`.field-speech-bubble`, anchored above the speaking NPC, no world
  transform reset) also stays exactly as it is. It is not a Pokémon-style full-width
  bottom text box, and that's a deliberate choice for this pass — any future "more
  Pokémon" restyle should work _within_ the anchored-bubble mechanic (border/type
  treatment, optional portrait chip) using the existing `--navy`/`--gold`/`--paper`
  palette tokens, not a structural change to how dialogue attaches to the world.

This was a live decision point during this planning pass, not an oversight — recorded
here so it isn't silently reopened later.

## Gap Register

The actual shopping list for a future asset-acquisition/upload session:

1. **Revolutionary/Georgian colonial urban architecture** (print shop, assembly hall,
   statehouse steps, chapel, market stalls) for Unit 3's Common Cause field
   (`case-007`, 1770s Philadelphia). No pack in the repo fits; confirmed in-code
   rejection of the closest candidate (Medieval Fantasy Town, too
   European/fantasy-coded). This is the one map with no real tileset today.

That's the only open gap. The Institute Archive Room's "modern interior" question,
originally expected to be a second gap, turned out to already have a working,
deliberate, documented answer (Medieval Tavern furniture reused as archive storage,
decision log `0030`) — not reopened by this guide.
