# Tile Library Catalog

Per-sheet inventory of every file under [`apps/web/src/assets/tilesets/`](../../apps/web/src/assets/tilesets/) —
**250 sheets across 28 pack folders**, all 48×48px, all from the same commercial bundle (purchased 2026-07-10, full
usage rights held).

This file answers "what is actually on that sheet, and may I use it." It does **not** assign tiles to elements — that is
[`apps/web/src/content/tilesets/canonical-palette.js`](../../apps/web/src/content/tilesets/canonical-palette.js), which
names the one canonical tile per element, and the per-map palettes beside it. Read
[`art-and-map-style-guide.md`](art-and-map-style-guide.md) first for the rules; this is the reference table behind it.

## How this was produced

Every row was recorded by looking at the sheet, not inferred from its filename. Grid geometry and cell occupancy are
measured mechanically by `npm run assets:label` ([`scripts/assets/label-tilesheet.js`](../../scripts/assets/label-tilesheet.js)),
which writes a coordinate-labeled copy of a sheet to the gitignored `reports/assets/labeled/`:

```sh
npm run assets:label -- "Island survival/tile-B-01.png"   # one sheet
npm run assets:label -- --pack "Wild West"                # a whole pack
npm run assets:label -- --all                             # everything
```

Re-run it whenever you need coordinates; never guess a `(row, col)` from memory.

## Sheet formats

| format | dimensions | grid | what it is |
| --- | --- | --- | --- |
| **B-sheet** | 768×768 | 16 cols × 16 rows = 256 tiles | Objects, structures, terrain textures. The workhorse format. |
| **A4 sheet** | 768×720 | 16 cols × 15 rows = 240 tiles | RPG Maker wall/floor *texture* atlas — flat surfaces (wood, stone, metal, plaster, tile). |
| **off-grid** | varies | — | Not an integer number of 48px tiles. **Unusable**, see below. |

### On A4 sheets

These ship as RPG Maker autotile atlases, but [`tiled-map-loader.js`](../../apps/web/src/engine/tiled-map-loader.js)
treats every tileset as a plain uniform grid and reads plain GIDs out of the `.tmj` — so an A4 sheet works fine as a
16×15 grid of ordinary tiles. What we do **not** get is autotile edge-matching: corner and edge pieces must be picked
by hand or by generator logic, exactly as today. Nothing needs changing to use them; just don't expect Tiled to
auto-select edges.

### On off-grid sheets — 18 files, all unusable

`tiled-map-loader.js` resolves a tile as `sx = (localId % columns) * tilewidth`. On a sheet whose dimensions are not an
integer multiple of 48, that silently produces misaligned source rectangles — it draws garbage rather than failing, so
this is worth stating loudly:

| sheet(s) | dimensions | tiles at 48px |
| --- | --- | --- |
| `Green Apocalyptic 2/*.png` (all 13) | 2048×2048 | 42.67 × 42.67 |
| `Modern World/1.png` | 2048×2048 | 42.67 × 42.67 |
| `Modern Interiors/Tile-A2-11.png`, `Tile-A4-11.png` | 400×600 | 8.33 × 12.5 |
| `Modern Interiors/Tile-B-12.png` | 800×800 | 16.67 × 16.67 |
| `Modern Interiors/Tile-C-12.png` | 815×819 | 16.98 × 17.06 |

`Modern Interiors` was already rejected on exactly this basis in decision log `0030`; this catalog confirms the
measurement and extends the finding to `Green Apocalyptic 2` and `Modern World/1.png`.

## Verdict vocabulary

| verdict | meaning |
| --- | --- |
| `CANONICAL` | Supplies the one canonical answer for at least one element. Named by `canonical-palette.js`. |
| `SUPPORTING` | In the painted family and usable, but not the canonical source for anything. Draw from it freely for setting-specific props. |
| `BENCHED` | On disk, on grid, deliberately not used — off-style or no APUSH setting fits. Reason recorded per pack. |
| `UNUSABLE` | Off-grid; the loader cannot address it. Not a taste judgement. |

Benching is a documentation act. **Nothing in this catalog is deleted from disk.**

## Pack roster

**KEEP — the painted 48px family.** These mix cleanly on one map: Island survival, Medieval Fantasy Town, Medieval
Fishing Village, Medieval harbor, Medieval Tavern, 19th Century European City, 19th Centruy European Dock, Wild West,
Steampunk, Factory, Construction, war ruins, farm, office, University, Living room, Highway Rest Area, Modern Park,
WWI Fleet, WWI Military Equipment, modern military, Common Cause Philadelphia.

**BENCH.**

| pack | sheets | reason |
| --- | --- | --- |
| `Modern World` | 7 | Flat overworld/world-map art at region scale (mountains drawn as icons) — a different art language from the painted family, and it cannot share a map with them. `1.png` is additionally off-grid. |
| `Green Apocalyptic 1` | 13 | Painted and technically fine, but no APUSH setting is post-apocalyptic overgrowth. Its clean grass/tree/bush tiles are a salvage candidate if a modern-era map ever needs them — revisit rather than delete. |
| `Green Apocalyptic 2` | 13 | All off-grid at 2048². |
| `Modern Interiors` | 4 | All off-grid. Matches decision log `0030`. |
| `army` | 8 | Modern main battle tanks (M1 Abrams / Leopard / Bradley class). Anachronistic for anything before ~1980. |
| `Labratory` | 9 | Sci-fi cleanroom with keycard scanners. No APUSH setting. |

Note the folder names `19th Centruy European Dock` and `Labratory` are misspelled **on disk**. Paths in this repo must
match the filesystem exactly — do not "fix" them in code without renaming the folder, which would break every `.tmj`
and every `import.meta.glob` that references it.

---

## Per-sheet inventory

Grouped by pack, alphabetical. `grid` column omits the common cases: unmarked = 16×16 B-sheet; `A4` = 16×15 A4 sheet.

<!-- CATALOG:BEGIN -->

### The shared A4 sheets — 34 files, only 3 unique

Content-hash comparison across the whole library found exactly one duplication cluster, and it is a large one: the
three `Auto-tile-A4-*.png` sheets are **byte-identical wherever they appear**, shipped as filler inside 13 different
pack folders. Every other sheet in the library is unique.

| unique sheet | sha256 (first 12) | copies | contents |
| --- | --- | --- | --- |
| `Auto-tile-A4-Walls-1.png` | `7c8cecbffcba` | 7 | **Floor / horizontal surfaces.** Wood plank (4 tones), log floor, weathered grey plank, dark wood, riveted steel, rusted steel, brushed steel, corrugated metal, pale blue tile, cream tile, metal louver/grate panels, cracked concrete, grey stone brick, white tile, plaster, painted white, grid tile, cream stone, white brick. Every cell is full-bleed and usable. |
| `Auto-tile-A4-walls-2.png` | `96adf2ae89c3` | 14 | **Vertical wall surfaces, set A.** Blue-grey panel, cream panel, glazed window, grey stone block, plank door, blue-grey brick, rusted plate, yellow damask wallpaper, tan brick, red brick, corrugated rust, weathered green, wood plank wall. |
| `Auto-tile-A4-walls-3.png` | `4b6ea2224ff7` | 13 | **Vertical wall surfaces, set B.** Grey concrete, riveted metal door, white tile grid, dark wood panelling, white raised panel, green painted metal, hazard-stripe bulkhead, blue tile, cream/beige plaster, red brick, blue-grey panel, wood cabinet front. |

Because they are identical bytes at different paths, **a map must reference the canonical path only** — globbing
`Wild West/Auto-tile-A4-walls-2.png` from one map and `office/Auto-tile-A4-walls-2.png` from another makes Vite bundle
the same image twice. `canonical-palette.js` fixes one path per sheet; use it and this cannot happen.

Layout note: `-walls-2` and `-walls-3` are true RPG Maker A4 wall atlases, so most of their rows are transparent
"wall interior" padding. The usable full-bleed surface texture sits on roughly every third row (rows 2, 5, 8, 11, 14).
`-Walls-1` has no padding — all 240 cells are surfaces.

---

### 19th Centruy European Dock — 9 sheets · `CANONICAL`

Folder name is misspelled on disk ("Centruy"). Do not correct it in code without renaming the folder.

The single most valuable pack in the library for Chronicle: it covers Atlantic port scenes from Period 2 through Period
7, and its cargo sheets are a near-perfect match for the Columbian Exchange and Triangle Trade content that already
exists in Units 1–2.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | **Trade cargo.** Barrels (empty, and open showing grain/flour/salt/spices), crates (plain, labelled, FRAGILE, glass-packed), bound sacks, bales, shipping trunks, and a large block of **labelled commodity sacks including COFFEE, sugar and grain**. Plus rope coils, block-and-tackle pulleys, a **balance scale**, hand carts, anchors, a rolled map scroll, lantern, compass. | `CANONICAL` | 2–7 |
| `tile-B-02.png` | Dockside warehouse buildings (gabled roofs, plank and stone walls, workshop interiors), **timber cargo cranes**, trestle piers and scaffolding with ladders, cable spools, stacked lumber, chains, anchors, oil lanterns, life rings, buckets, mooring floats. | `CANONICAL` | 2–7 |
| `tile-B-03.png` | Fish-market stalls with striped awnings, display counters of fish/shellfish/lobster, iced trays, barrels and baskets of catch, folding stools, balance scales, nets, crates. | `SUPPORTING` | 2–7 |
| `tile-B-04.png` | **Masonry and decking textures** — dressed stone block, cut ashlar, rough fieldstone, cobble, and wood plank decking in four tones; plus stone curbs and steps, wrought-iron railings, wooden fencing, **mooring bollards and cleats**, rope coils, crates, barrels, gas street lamps, a wall clock and thermometer. | `CANONICAL` | 2–7 |
| `tile-B-05.png` | Dense cargo *stacks* — grouped barrels, crate piles, sack heaps, tarp-covered loads, labelled and stamped shipping crates, sea chests, coiled rope, anchors, nets. Composition pieces rather than single objects; ideal for filling a wharf. | `CANONICAL` | 2–7 |
| `tile-B-06.png` | **Coastal water and quay.** Open water into rocky shoreline with foam, submerged rock clusters, stone sea walls, **wooden piers and jetties**, two lighthouse variants, bollards, dock stairs and iron ladders, stone paving, cobble, gravel and packed-dirt ground, potted plants, grass tufts. | `CANONICAL` | 2–7 |
| `Auto-tile-A4-Walls-1.png` | Shared floor/surface atlas — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-2.png` | Shared wall atlas A — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-3.png` | Shared wall atlas B — see above. | `CANONICAL` | all |

### 19th Century European City — 8 sheets · `CANONICAL`

Georgian/Victorian masonry townscape. Reads convincingly as a 19th-century American city (Boston, Philadelphia, New
York) and its civic buildings are the best available stand-in for American statehouse/courthouse architecture.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | **Building facades**, multi-tile: townhouses and mansions (mansard, brick, stucco), storefronts with awnings and signage, continuous **row-house terraces**, a **clock-tower town hall**, four Gothic **church/cathedral** variants, plus horse-drawn carriages, market barrows, street lamps, benches, park trees, fountains, and a stone bridge. | `CANONICAL` | 4–7 |
| `tile-B-02.png` | Formal Victorian interior furniture — dining tables in many lengths, upholstered and carved chairs, sideboards, **glazed china cabinets**, **bookcases**, writing tables, occasional tables, benches. Reads as a parlour, committee room, or assembly-hall interior. | `CANONICAL` | 3–7 |
| `tile-B-03.png` | **Horse-drawn transport** — enclosed stagecoaches in six liveries, buckboards, flatbed and freight wagons, plus stable stalls, hay bins, barrel stacks, tack/saddle racks, gas lamps, a water trough. | `CANONICAL` | 3–6 |
| `tile-B-04.png` | **Interior floors** (herringbone and block parquet, inlaid medallion, chequer tile, patterned carpet, flagstone) and **wall treatments** (brick, stone, panelled wainscot); plus doors, sash and arched windows, dressers, armchairs, a marble **fireplace**, grandfather clock, chandelier, **filled bookshelves**, a **writing desk with quill and inkstand**, globe, framed portraits, mirrors, candelabra, **safes**, iron benches, mailbox, books and papers. | `CANONICAL` | 3–7 |
| `tile-B-05.png` | **City street surfaces** — red and grey herringbone brick, three cobblestone weights, cut flagstone, and setts; plus kerbs, kerb transitions, building plinths and storefront trim, **gas street lamps in eight variants**, a street clock, bollards, ornate iron benches, a fountain, newsstand, drain grates and manhole covers, planters, stone columns. | `CANONICAL` | 4–7 |
| `Auto-tile-A4-Walls-1.png` | Shared floor/surface atlas — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-2.png` | Shared wall atlas A — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-3.png` | Shared wall atlas B — see above. | `CANONICAL` | all |

### Construction — 8 sheets · `SUPPORTING`

A present-day construction site. Most of it is unambiguously modern (hydraulic excavators, porta-cabins, hi-vis
signage), so it serves Periods 8–9 only — **except `2.png`, which is almost entirely period-neutral raw material** and
is reusable much earlier.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `1.png` | Unfinished concrete-frame buildings, exposed floor slabs, rebar stubs, precast panels, concrete columns and pier caps. | `SUPPORTING` | 8–9 |
| `2.png` | **Raw building materials, mostly era-agnostic** — brick pallets and loose brick piles, sand and gravel heaps, stacked and palletised lumber, planks, cement sacks, concrete blocks, rebar bundles, wire coils, scaffold trestles, tarps, sheet glass. | `SUPPORTING` | 4–9 |
| `3.png` | Road-works kit: striped barriers, traffic cones, warning signs, orange safety mesh, steel road plate, timber hoarding, gantry poles. | `SUPPORTING` | 9 |
| `4.png` | Site accommodation — portable cabins and containers, porta-potties, wash station, timber hoarding, chain-link fencing and gates; plus a prop row of lumber, beams, brick, sandbags, toolboxes, cones, gas cylinders, generator, cement mixer, hand tools. | `SUPPORTING` | 8–9 |
| `5.png` | Larger site cabins and container offices, corrugated site fencing with vehicle gates, an electrical substation enclosure, concrete portal. | `SUPPORTING` | 8–9 |
| `6.png` | Heavy plant — **tower crane**, cement-mixer trucks, dump trucks, wheel loaders, tracked excavators, wheelbarrows, mobile scaffold towers, conveyors. | `SUPPORTING` | 9 |
| `7.png` | Structural steel frames and bracing, pallet racking, brick and lumber stacks, concrete columns, chain-link fence runs, spoil and gravel heaps, excavators. | `SUPPORTING` | 8–9 |
| `8.png` | Unfinished concrete high-rises, rebar cages, column stacks, brick piles, cement sacks, scaffold frames, spoil heaps, hand tools (shovels, saws, jackhammers), hard hats, toolboxes. | `SUPPORTING` | 8–9 |

### Factory — 6 sheets · `SUPPORTING`

Modern manufacturing. Robot arms and CNC machinery date most of it firmly to Period 9, but the **exterior shell,
asphalt, and brick smokestacks** are reusable for Period 6–7 industrialisation.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `1.png` | **Factory exterior** — corrugated and concrete industrial buildings, loading bays with roller shutters, precast perimeter wall and vehicle gates, external pipework, exterior stairs; plus **asphalt road with lane markings, concrete hardstanding, and packed dirt lot** ground textures, HVAC units, guardrails, ladders. | `CANONICAL` | 6–9 |
| `2.png` | Assembly lines and conveyors, industrial robot arms, stamping presses, CNC machines, control terminals, pressure vessels, parts shelving, crates, drums. | `SUPPORTING` | 9 |
| `3.png` | Pipework, valves, conduit bundles, HVAC ducting, oxygen/nitrogen tanks, **two brick smokestacks**, HIGH VOLTAGE cabinets, fire hydrants, hazard barriers, ladders, control consoles. | `SUPPORTING` | 6–9 |
| `4.png` | Chain-link and corrugated fencing, rusted plate, toolboxes and tool boards, ladders, industrial pendant lamps, fire extinguishers, CAUTION/HIGH VOLTAGE signage, extractor fans, floor grates, manhole, packing crates. | `SUPPORTING` | 8–9 |
| `5.png` | **Control room** — main operator console, gauge banks, indicator lamps, electrical cabinets, cable trays, workbenches, monitors, desks. | `SUPPORTING` | 9 |
| `6.png` | Industrial **interior surfaces** — stained and cracked concrete floor, tiled floor, floor grating, hazard-stripe edging; plus bulkhead doors, MAINTENANCE doors, chain-link partitions, generators, crates, barrels. | `SUPPORTING` | 8–9 |

### farm — 7 sheets · `CANONICAL`

Substantially more valuable than its prior one-line disposition suggested. The current style guide records this pack as
`KEEP-CONDITIONAL` for "exactly one crop-row tile," on the basis of a GID audit of Riverbend rather than a look at the
sheets. Having now looked: `2.png`, `6.png` and `7.png` are the best source in the whole library for **rural
North American vernacular** — clapboard farmhouses, weathered timber barns, split-rail fences, and the only convincing
temperate deciduous/pine/birch trees anywhere in the collection.

The modern intrusions are real but narrow and easy to avoid: tractors, pickup trucks and vans on `3.png`, the tractor on
`6.png`, and the red-barn-with-silo/windmill combinations on `2.png`/`7.png` which read late-19th-century at the
earliest.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `1.png` | **Crop plants at four growth stages each**, on transparent soil mounds — corn, carrot, cabbage, **cotton**, chili, tomato, strawberry, watermelon, potato, onion/garlic. The cotton row is the only cotton art in the library. | `CANONICAL` | 4–6 |
| `2.png` | **Farm buildings and yard** — red barns with silos, weathered timber barns, clapboard farmhouses (cream/red/blue/grey), sheds, outhouses, kennels, **log cabins**, stone well, pig pen, hay bales and loose straw, **split-rail and post-and-rail fences**, gates, shovels/pitchforks/rakes, buckets, milk churns, water pump, crates. | `CANONICAL` | 4–7 |
| `3.png` | Harvest produce icons, **blacksmith forge with anvil and hearth**, workbench and tool wall, hand tools (hammers, wrenches, saws, scythe, axe, sickle), sacks, hay bales, **tilled soil and wheat/corn crop rows** (this is the `local id 38` Riverbend already uses), scarecrows, fences, barn doors. Also modern tractors, pickups and vans — **do not use those**. | `CANONICAL` | 2–6 |
| `4.png` | Market produce in wooden crates — corn, carrot, cabbage, chili, garlic, strawberry, cauliflower, **cotton**, tomato, watermelon, potato. Pure stall-dressing. | `SUPPORTING` | 2–7 |
| `5.png` | **Market stalls** with striped awnings in many colourways, tiered produce displays, handcarts and barrows, balance scales, baskets, sacks, lantern, planters. Reusable well before the modern era if the brightest awning colours are avoided. | `SUPPORTING` | 2–7 |
| `6.png` | **Trees and terrain** — oak, autumn maple, pine, birch, apple, orange and cherry trees, flowering shrubs; full-bleed **grass, tilled row, wheat field, cobblestone and mud** ground textures; crop plots (cabbage, potato, sunflower, corn, pumpkin, berries); **split-rail, picket and stone-wall fencing**; scarecrow, tools, wheelbarrow, produce baskets, hay bales, well, shed, greenhouse, beehives, chicken coop. | `CANONICAL` | 2–9 |
| `7.png` | **Farmsteads at map scale** — clapboard houses in six colours, weathered barns, grain silos, **American farm windmills**, larger farmhouses, outbuildings. | `CANONICAL` | 5–7 |

### Highway Rest Area — 6 sheets · `SUPPORTING`

Present-day American roadside. Entirely Period 9, but it is the library's only source of **modern asphalt, road
markings, street furniture and contemporary vehicles**, so it carries any modern-era map on its own.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | **Modern road and paving** — asphalt with lane markings, crosswalks, parking bays and stall lines, concrete sidewalk pavers, kerbs; plus cars, benches, trash cans, vending machines, restroom block, street trees, guard rails, signposts, street lamps. | `CANONICAL` | 9 |
| `tile-B-02.png` | Gas-station canopy and pumps, convenience store, ATM, brick and timber strip-mall units, corrugated workshop garages with roller doors, restrooms, tarped sheds, chain-link, oil drums, tire stacks, dumpsters, parked vehicles. | `SUPPORTING` | 9 |
| `tile-B-03.png` | Convenience-store interior — stocked gondola shelving, refrigerated cases, coolers, checkout counters and registers, coffee machines, ATMs, water coolers, café seating, ice-cream freezer. | `SUPPORTING` | 9 |
| `tile-B-04.png` | **Street furniture** — park benches in many styles and colours, trash and recycling bins, street lamps in a dozen variants, security camera, US road signage (REST STOP, PARKING, NO OVERNIGHT), vending and coffee machines. | `CANONICAL` | 9 |
| `tile-B-05.png` | Filling station and garage — fuel pumps, tire racks and stacks, tool benches, oil drums, toolboxes, diagnostic console, parts shelving, jerry cans, filters and spark plugs, chain-link, rusted billboards and signposts, dry grass tufts. | `SUPPORTING` | 9 |
| `tile-B-06.png` | **Vehicles** — sedans, SUVs, pickups, box trucks, semi tractors and vans in many colours; plus asphalt road sections with lane markings and cracking, **desert sand and packed-dirt ground**, cacti and desert scrub, benches, pumps, roadside signage. | `SUPPORTING` | 9 |

### Island survival — 13 sheets · `CANONICAL`

The tropical pack, and the source already driving `caribbean-field.tmj`. Broader than its current use suggests: beyond
terrain it carries Age-of-Exploration props (a full galleon shipwreck, compass, chart scrolls) and a complete
thatched-hut settlement kit. Its fantasy content is narrow and clearly separable — the coloured gem/crystal deposits on
`tile-B-05`/`tile-B-06` are the only genuinely unusable material.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `1.png` | **The richest natural-terrain sheet in the library.** Beach-to-water shoreline transitions, marsh grass, cracked mud, coral shallows, boulder shores, dirt path through grass, lush grass, autumn leaf litter, stone slab, exposed tree roots, sandstone cliff, river with rocks; plus shipwreck, campfires, tents, bones, ferns, stumps, logs. | `CANONICAL` | 1–2 |
| `2.png` | Vegetation props on transparent ground — palms at many sizes, dead trees and stumps, driftwood, jungle bushes, tall-grass clumps, wildflowers, rock clusters, tide-pool rock, shells, starfish, coral in many colours, hermit crabs, hanging vines, mangrove roots, reeds and cattails, seaweed. | `CANONICAL` | 1–2 |
| `3.png` | More of the same vocabulary with different silhouettes — palms, dead trees, bushes, tall grass, wildflowers, boulders, driftwood, coral-encrusted rock, shells, starfish, crab, hanging lianas, hollow stumps, buttress roots, reeds, seaweed. | `SUPPORTING` | 1–2 |
| `4.png` | **Indigenous / settlement architecture** — round thatched hut (bohío), timber lodges, thatched-roof houses, fish-drying racks, clothes lines, watchtower, stone-ringed fire pits, stone ovens, canvas tents, **pointed-stake palisade and barricades**, log rafts, **timber jetties over water**, pig pen. This is `case-001`'s building source. | `CANONICAL` | 1–2 |
| `5.png` | **Age of Exploration props** — a full **galleon shipwreck**, barrels, crates, broken spars, anchors, a **mariner's compass**, **chart and map scrolls on stands**, chains, ruined stone lighthouse, rusted plate, timber fence, carved stone statues and stelae. | `CANONICAL` | 1–2 |
| `6.png` | Cleaner, larger versions of `4.png`'s settlement kit — round thatched huts, log cabins, thatched houses, fire pits, stone ovens, long palisade runs, stake barricades, drying racks, watchtower, log rafts, lean-tos. | `CANONICAL` | 1–2 |
| `7.png` | **Foraged food and resources** — coconuts, bananas, berries, mushrooms, water pools, fish, crabs, shells, oysters and mussels, herbs, nuts and acorns, cassava/yam roots, beehives, honey jars, flowers, fish-drying racks. Useful as Columbian-Exchange evidence dressing. | `SUPPORTING` | 1–2 |
| `tile-B-01.png` | **The canonical tropical terrain sheet.** Rows 0–3 sand (plain, fine, pebbled, footprints, dune, driftwood, shells, rocky shore); rows 4–7 water (turquoise shallow → mid → deep navy, coral, fish shoals, whitecaps, surf line); rows 8–11 land (grass, dry grass, dirt path with grass edges, rubble, volcanic rock and lava, mossy boulders, jungle canopy, palms); rows 12–15 props on transparent ground (palms, driftwood, rocks, bushes, coral, shells, campfire, rowboat, tent, buckets, barrels, crate, chest). | `CANONICAL` | 1–2 |
| `tile-B-02.png` | Bohío-style thatched huts and palisade fencing — the `case-001` structures layer. | `CANONICAL` | 1–2 |
| `tile-B-03.png` | Palms and tropical planting in very large variety, all on transparent ground, plus vine-draped rock faces. Pure vegetation dressing. | `SUPPORTING` | 1–2 |
| `tile-B-04.png` | **Containers and gear** — crates, chests (closed and open showing rope, tools, coconuts), spears, fish hooks and traps, nets, fishing rods, woven baskets in many shapes, produce baskets, firewood piles, barrels, sailcloth, hides and pelts, waterskins, pouches, clay jars, campfire tripods, drying racks. | `CANONICAL` | 1–2 |
| `tile-B-05.png` | Rock arches, cave and mine entrances, ore deposits, stalagmites, cave interiors with waterfalls and pools, sand dunes, timber boardwalks over sand. **The coloured gem/crystal deposits are fantasy-coded — do not use them.** | `SUPPORTING` | 1–2, 6 |
| `tile-B-06.png` | Boulder and rock formations, **copper and gold ore veins with mining tools** (pick, shovel, hammer), crystal cave interiors (again, avoid the gems), **large full-bleed shoreline gradient blocks** (sand → shallow → deep), driftwood, crates, barrels. | `SUPPORTING` | 1–2, 6 |

### Medieval Fantasy Town — 16 sheets · `CANONICAL` with hard exclusions

The largest pack, and the one needing the most care. Its **vernacular** half of the pack — half-timber and thatched
cottages, cobble and dirt roads, market stalls, wells, fences, tavern and inn interiors — is genuinely the best
available stand-in for 17th–18th-century colonial North America, and already carries both `riverbend-field.tmj` and
`common-cause-field.tmj`. Its **fantasy** half is unusable and must stay unused.

**Hard exclusions, restating and extending decision log `0032`:**

- **Signed buildings.** "Adventurer's Guild", "The Sword & Shield", "The Griffin's Rest", "Weapon Shop", "Armor Shop",
  "POTIONS" — a readable fantasy sign baked into the pixels is a worse anachronism than an unlabelled silhouette.
  Only unlabelled cottage/hall/church/watchtower art may be used.
- **Castles.** `12.png` and `17.png` are crenellated stone fortresses with conical-roofed towers, portcullises and
  drawbridges. There is no APUSH setting for these. Their palisade runs, stable, hay troughs and plain stone wall
  sections are the only salvageable parts.
- **Magic and arms.** `7.png` and `10.png`'s potion shelves, crystal balls, rune stones, wizard statues, heraldic
  banners and weapon/armour racks are all off-limits.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `1.png` | The pack's base sheet and Riverbend's dominant ground fill (local id 206 = grass). Grass and dirt-path ground, stone and half-timber buildings, castle towers and walls. | `CANONICAL` | 2–3 |
| `2.png` | **Ground textures** — grey cobblestone, dirt path, tilled soil, grass, and their edge transitions; plus **market stalls** (butcher, baker, produce, general), crates, barrels, sacks, handcart and wagon, **stone well**, signposts, **notice board**, **fountain**, timber and stone benches, picket and rail fencing. Case-007's plaza source. | `CANONICAL` | 2–4 |
| `3.png` | **Rural and agricultural** — stone and dirt roads, rail fences, stone walls, **wheat field with scarecrow**, haystacks, **stream and river with banks and timber bridges**, corn field, pumpkin/grape/cabbage plots, **windmill**, **timber barn**, well, **stone mill with water wheel**, log piles, sacks, tools. | `CANONICAL` | 2–4 |
| `4.png` | Buildings (thatched half-timber cottages, stone smithy, shopfronts, windmill, hall) and **interior room layouts** (tavern, bedroom, workshop, study, smithy) plus interior furniture. The top-left quadrant is a **composed sample map**, not a tile palette — take discrete tiles from the rest of the sheet instead. | `SUPPORTING` | 2–3 |
| `5.png` | Cobblestone plaza, dirt paths, grass, **church/chapel with steeple and cross**, stone towers, watchtower, bridge, blacksmith, shopfronts, castle gate. Case-007's assembly hall and chapel source. | `CANONICAL` | 2–4 |
| `6.png` | **Colonial interior** — tables, benches, cupboards, shelving with jars, straw beds, **fireplaces**, barrels, produce crates, **interior floor textures** (slate, tan tile, grey tile, wood plank, brick, cobble), **half-timber and stone wall sections with windows and doors**, stairs, ladders. | `CANONICAL` | 2–3 |
| `7.png` | Mostly fantasy — magic lamps, crystal balls, potion shelves, rune stones, wizard and knight statues, weapon racks, heraldic banners. **Salvageable only:** candelabras and wall torches, scrolls, books, quill pot, clay jars, sacks, lantern, hay bales, barrels. | `BENCHED` | — |
| `8.png` | **Buildings at map scale** — thatched cottages, half-timber and stone houses, a **church with steeple and cross**, windmill, market stalls, wells, fountains, timber bridges, crop fields, tree clusters, hedges, cobble roads. Also the signed shops and castle walls: **do not use those**. | `CANONICAL` | 2–4 |
| `9.png` | **Institutional interior, unexpectedly strong.** Reception desk with **ledger and quill**, **notice board with posted bills**, **chests of drawers / apothecary filing cabinets**, **hanging wall maps**, bookcases, armchairs, benches, stone fireplaces, **candle chandeliers**, dining tables, chests, crates, stoves, rugs, balustrades, cabinets. The best existing match for the Institute Archive's furniture. Skip the trophy shelves, weapon racks and heraldic banners. | `CANONICAL` | 2–4, hub |
| `10.png` | **Blacksmith and apothecary** — forge, anvil, tool bench, coal pile, ingots, bellows, tongs racks, knife tables, chests, clay jars, **drying herb racks**, **bookshelves with books and scrolls**, backpacks, workbenches, barrels. Skip the weapon racks, armour stand and potion shelves. | `SUPPORTING` | 2–4 |
| `11.png` | **Market stalls by trade**, each with a legible sign — FABRIC (cloth bolts), PRODUCE, MEAT, BREAD, GRAIN, HERBS, JEWELRY, POTTERY, **PELTS**. Fabric, grain, pottery and pelts are precisely the colonial trade goods Units 1–2 already deal in. Skip the WEAPONS stall. | `CANONICAL` | 2–4 |
| `12.png` | Castle walls, gatehouse, drawbridge and moat, round towers, arrow slits, portcullis. **Salvageable:** timber stable with hay stalls, rail fencing, haystacks, water and feed troughs, tack, barn doors and gates, cobble ground, plain stone wall, barrels. | `SUPPORTING` | 2–4 |
| `15.png` | **Inn / tavern interior** — half-timber walls, inn doors, bar back with bottles and books, stools, **bedrooms with quilted and four-poster beds**, nightstands, oil lamps, framed pictures, rugs, barrels, **stone fireplaces**, tables set with bread and roast, clay jugs, crates, wall tapestries, balustrades, stairs, benches. Skip the signed "Griffin's Rest" board and heraldic banners. | `CANONICAL` | 2–3 |
| `16.png` | A second **tavern interior** in the same idiom — half-timber upper walls, arched door, bar counter and stools, quilted beds, nightstands, tables and chairs, benches, stone fireplaces, tankards, barrels, food platters, clay jars, **chests**, stairs, balustrades. Colonial ordinaries and public houses are where a great deal of Period 2–3 politics happened; this is the sheet for them. | `CANONICAL` | 2–3 |
| `17.png` | Pure castle/fortress — curtain walls, conical-roofed towers, gatehouses, drawbridges, portcullis, stairs, a cannon emplacement, arched windows. **Salvageable:** the long pointed-palisade run and hay troughs. | `BENCHED` | — |
| `18.png` | A **complete composed sample village map** inside castle walls. Reference layout, not a tile palette. | `BENCHED` | — |

### Medieval Fishing Village — 4 sheets · `CANONICAL`

Small but dense. Supplies Riverbend's water and wharf today, and `tile-B-05` is the canonical temperate dock terrain
for the whole project.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | **Maritime gear** — rowboats and dories, ship hulls, plank rafts, nets with cork floats, rope coils, buoys, creels and fish traps, wicker baskets, **anchors, chains, shackles, cleats, capstan**, oars and gaffs, **furled and rigged sailcloth, blocks and pulleys**, barrels, crates, fish boxes, **fish-drying racks**, mallets, knives and tools, lanterns, rope spools, fish, shells, grain piles, timber pilings. | `CANONICAL` | 1–4 |
| `tile-B-02.png` | Fish crates and boxes, barrels (open, sealed, water-filled), drying racks with hanging fish, nets, rope, **lobster and crab pots**, driftwood, shells, seaweed, anchors, buoys, rowboats, plank piles. | `SUPPORTING` | 1–4 |
| `tile-B-04.png` | **Riverbend's water and dock sheet.** Stone quay paving (dry, wet, mossy), muddy shore, sand, **shingle/pebble beach**, **timber plank decking and piers in many configurations**, **calm blue water**, rope railings, rowboats, fish market stalls, timber shed, barrels, crates, rail fencing, lanterns, anchors, driftwood, signpost. | `CANONICAL` | 2–4 |
| `tile-B-05.png` | A second dock/shore composition sheet in the same idiom — more quay, decking, water, stalls and cottages. | `SUPPORTING` | 2–4 |

### Medieval Tavern — 8 sheets · `CANONICAL`

Currently dressing the Institute Archive Room and the onboarding hallway. Decision log `0030` recorded that choice as
deliberate, and it holds.

**Correction to the current style guide:** it names `tile-B-01.png` as the canonical "interior floor (stone/wood)"
source. That is wrong. A GID audit of `archive-room.tmj` shows its ground layer draws entirely from the
`firstgid: 513` range — **`tile-B-05.png`** — while `tile-B-01.png` and `tile-B-03.png` supply only the structures
layer. `tile-B-01.png` contains no floor textures at all. The flagstone/plank/sandstone floor tiles are on
`tile-B-05.png`.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | **Furniture only** — long tables (plain and set with tankards and bowls), benches, round tables, stools, carved chairs. No floor textures. | `CANONICAL` | 2–3, hub |
| `tile-B-02.png` | **Hearths and cooking** — stone and brick fireplaces, bread ovens, kitchen ranges with pots and pans, hanging pan racks, cauldrons on tripods, campfires, firewood, barrels. | `SUPPORTING` | 2–3 |
| `tile-B-03.png` | **Lighting and fittings** — hanging lanterns, candle chandeliers, wall sconces, **staircases**, benches, stools, **bottle and barrel shelving**, potted plants, rugs, bar counter, dish shelves, cabinets, stone fireplace, sacks, **timber partition screens**. Skip the heraldic banners. Supplies the Archive Room's shelving. | `CANONICAL` | 2–3, hub |
| `tile-B-04.png` | Food and drink dressing — meat cuts, vegetables, fruit baskets, bread, roast fowl, cheese, prepared dishes, tankards, jugs, bottles, glasses, goblets, barrels, sacks. | `SUPPORTING` | 2–3 |
| `tile-B-05.png` | **The floor sheet** — grey flagstone, wood plank, and tan sandstone-brick full-bleed floor textures along the bottom rows; plus bar counters, **barrels in many sizes**, crates, **woven baskets and grain sacks**, pantry shelving with jars, **stone hearth with cooking pots**, wall torches, long tables and benches. | `CANONICAL` | 2–3, hub |
| `Auto-tile-A4-Walls-1.png` | Shared floor/surface atlas — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-2.png` | Shared wall atlas A — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-3.png` | Shared wall atlas B — see above. | `CANONICAL` | all |

### Medieval harbor — 8 sheets · `CANONICAL`

Previously dismissed as "unused today, kept as a same-style extension source" — a significant under-read. `tile-B-04`
is the **only source of period sailing ships in the library**, and there is no substitute for it anywhere else.

One caveat: this pack's water and shoreline art (`tile-B-03`) is flatter and more saturated than Island survival's, so
the two should not share a coastline on the same map. Pick one per map.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | Timber docks and piers, stone quay, sand, dock stairs, crates on decking. | `SUPPORTING` | 1–4 |
| `tile-B-02.png` | Fish baskets, market stalls, salted and dried fish, fish barrels, nets, shells, produce crates, anchors, rods, sacks, buckets, rowboats and a sailing dinghy, timber jetty, tools, stools. | `SUPPORTING` | 1–4 |
| `tile-B-03.png` | **Water and shoreline** — turquoise and deep blue water, sand/water transition strips, an island form, timber piers with railings, **stone quay walls with a channel**, rowboats and single-masted boats, **red-and-white lighthouse**, harbour cottages, bollards, market stalls. Flatter/more saturated than Island survival — don't mix the two on one coastline. | `SUPPORTING` | 1–4 |
| `tile-B-04.png` | **Period sailing ships — the library's only source.** Rowboats and dories, **three-masted square-rigged galleons and carracks in several liveries**, **cargo barges**, single-masted sloops and luggers, **shipwrecks**, large merchant sailing vessels. Directly relevant to Case 1.01's crossing, Case 2.02's Triangle Ledger, and any Atlantic port scene. | `CANONICAL` | 1–4 |
| `tile-B-05.png` | **Harbour buildings** — half-timber and stone houses with slate roofs, **warehouses with loading cranes and dock frontage**, two **stone lighthouses**, a small stone blockhouse, **boatshed interiors with workbenches and a ship under construction**, forge, cottages. | `CANONICAL` | 1–4 |
| `Auto-tile-A4-Walls-1.png` | Shared floor/surface atlas — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-2.png` | Shared wall atlas A — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-3.png` | Shared wall atlas B — see above. | `CANONICAL` | all |

### Modern Park — 5 sheets · `CANONICAL`

Contemporary municipal park. Its **vegetation sheet is period-neutral** and is the best general-purpose tree and shrub
source in the library alongside `farm/6.png`; its ornate wrought-iron fencing and lamp standards read Victorian and
serve Periods 4–7 as well as Period 9.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | **Paving and ground** — flat mown grass, red and tan brick pavers, cobble, grey concrete slab, hedging, kerbs, steps. Flatter and lower-contrast than the historical packs' ground; keep it to modern maps. | `CANONICAL` | 9 |
| `tile-B-02.png` | **Fencing and street furniture** — ornate wrought-iron fences and gates in many patterns, plain railings, guard rails, chain barriers, bollards; **street lamps** from ornate Victorian standards to modern cobra-heads; park signage (maps, directories, rules, wayfinding); trash and recycling bins. The ironwork and Victorian lamps are reusable well before Period 9. | `CANONICAL` | 4–9 |
| `tile-B-03.png` | Benches, picnic tables, boulders, **ornamental ponds**, fountains, arched bridges, planters, trash cans, lamp posts. | `SUPPORTING` | 4–9 |
| `tile-B-04.png` | Playground equipment — roundabouts, swings, slides, climbing frames, monkey bars, tube slides. | `SUPPORTING` | 9 |
| `tile-B-05.png` | **Trees, shrubs and flowers** — oak, maple, birch, willow, pine, cherry and apple in summer and autumn dress; hedges, flowering shrubs, roses, tulips, sunflowers, irises, vine trellises, cattails and reeds, water lilies. Clean, period-neutral, and the widest tree selection in the library. | `CANONICAL` | 2–9 |

### office — 6 sheets · `CANONICAL`

**This pack closes the "modern institute interior" gap** the current style guide records as unfilled. `Modern
Interiors` was rejected for being off-grid; `office` is a clean 16×16 grid, in the painted family, and its
double-sided library shelving, filing runs and dark-panelled walls read exactly like a records institution.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `1.png` | Open-plan office — cubicle partitions, desks with computers, filing cabinets, water cooler, photocopier, conference table. | `SUPPORTING` | 9 |
| `2.png` | Cream plaster and grey carpet surfaces, desks, doors, sliding glass doors, elevator, coat rails, **overhead cabinet and counter runs**, office chairs in many colours, cupboards, filing cabinets, printers, water coolers, bookshelves, planters, desk lamps, whiteboards, framed art, conference tables, projector and screen. | `SUPPORTING` | 9 |
| `3.png` | Corridors with elevators, doors and city-view windows; **double-sided library shelving stacks**, desks with open books and papers, filing cabinets, coat racks, photocopiers, book piles, desk lamps, water cooler, palms and planters, conference tables, whiteboards, framed pictures, low bookcases, security cameras. **The archive-stacks tiles are the single best Institute Archive fit in the library.** | `CANONICAL` | 9, hub |
| `4.png` | **Dark wood-panelled office walls** with windows and elevator, framed pictures, filing cabinets, **bookcases with binders**, printers, charted whiteboards, desks in white/wood/dark finishes, water cooler, fridge, planters, meeting tables. The panelled walls give a "serious institution" reading the cream-plaster sheets do not. | `CANONICAL` | 9, hub |
| `Auto-tile-A4-walls-2.png` | Shared wall atlas A — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-3.png` | Shared wall atlas B — see above. | `CANONICAL` | all |

### University — 7 sheets · `SUPPORTING`

Modern school and campus. Period 9 only, but complete: classrooms, labs, cafeteria, dorms and campus exteriors.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | Dorm furniture — bunk and single beds, desks, lockers, wardrobes, sinks, shelving. | `SUPPORTING` | 9 |
| `tile-B-02.png` | Cafeteria — serving counters with trays and sneeze guards, registers, tables and chairs in many colours, **auditorium seating banks**, lockers, vending machines, refrigerated cases. | `SUPPORTING` | 9 |
| `tile-B-03.png` | **Science lab** — benches with sinks, glassware (flasks, beakers, test-tube racks), retort stands, analytical instruments, fume hoods, reagent cabinets, microscopes, centrifuges. Less sci-fi than the `Labratory` pack and therefore the better choice if a lab is ever needed. | `SUPPORTING` | 9 |
| `tile-B-04.png` | **Campus exteriors at map scale** — multi-storey concrete and brick school blocks, administration buildings, **running tracks with sports fields**, gymnasiums, entrance gates, bike shelters. | `SUPPORTING` | 9 |
| `tile-B-05.png` | **Classroom furniture** — desk-and-chair rows in many colours, long tables, **lecterns with AV**, projector screens and projectors, **green and black chalkboards** (clean and written), whiteboards, **lockers**, benches. | `CANONICAL` | 9 |
| `Auto-tile-A4-walls-2.png` | Shared wall atlas A — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-3.png` | Shared wall atlas B — see above. | `CANONICAL` | all |

### Steampunk — 11 sheets · `SUPPORTING`, narrowly

Sheets individually inspected: `1`, `2`, `3`, `5`. The rest are characterised from those and from the pack's evident
internal consistency — see the coverage note at the end of this file.

Calibrate expectations: this is a **genuine steampunk pack**, not "Victorian industrial." Gears, brass boilers,
airships and mecha are pervasive and disqualifying. But three narrow seams in it are genuinely valuable and have no
substitute elsewhere in the library:

1. **Paddle-wheel steamboats** (`1.png`) — Period 4's Mississippi and canal traffic.
2. **A steam locomotive and Victorian brick industrial frontage** (`3.png`) — Period 6.
3. **Scholarly instruments** (`5.png`) — brass telescopes, globes on stands, card-catalogue filing cabinets, chalkboard
   easels, carved Victorian desks. These are the best "19th-century institution" props available and matter for the
   Institute.

Use it as a **prop quarry, never as a map's base pack.**

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `1.png` | **Paddle-wheel steamboats**, early automobiles, a steam road-locomotive, hot-air balloon, brass and riveted floors, gas lamps, workbenches. | `CANONICAL` | 4, 6–7 |
| `2.png` | A **composed sample town map** — steampunk buildings, piped cobble streets, gas lamps, an airship, a mecha statue. Reference layout; heavily gear-coded. | `BENCHED` | — |
| `3.png` | **Brick and pipe industrial walls**, clock tower, gas lamps, cobblestone, factory windows, **steam locomotive**, Victorian brick buildings, market stalls, manhole covers. Gears are present but avoidable. | `CANONICAL` | 6–7 |
| `5.png` | **Study and laboratory interior** — carved Victorian desks and chairs, **card-catalogue filing cabinets**, **globes on stands**, **brass telescopes**, stone and riveted-copper walls, plank and metal floors, **chalkboard easel**, workbenches with glassware and instruments, gas lamps, gauges, ceiling fan. | `CANONICAL` | 4–7, hub |
| `4`, `6`–`11` | Steampunk machinery, gear assemblies, airship parts, brass fittings, mecha. Quarry for the occasional gas lamp or riveted surface; nothing canonical. | `SUPPORTING` | 6–7 |

### war ruins — 27 sheets · `SUPPORTING`

Sheets individually inspected: `1`, `10`, `20`, `25`.

Despite the name this is **contemporary urban decay**, not WWI or WWII. Its buildings are mid-century concrete
apartment blocks, its vehicles are modern cars and vans, and several sheets carry present-day graffiti. That said, the
era-flexible half of it — **rubble piles, collapsed brick walls with chimney stubs, cracked paving and asphalt, dead
trees, utility poles** — is a credible bombed-out 1940s European street once the cars and graffiti are excluded, and it
is the only ruin art in the library.

**Exclusions:** modern cars and vans, graffiti tiles, playground equipment, wheelie bins, satellite dishes.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `1.png` | Bombed brick walls **with modern graffiti**, military trucks, bulldozer, rubble piles, lumber stacks. Graffiti makes most of this unusable. | `SUPPORTING` | 9 |
| `10.png` | Abandoned apartment blocks with broken windows and balconies, cracked concrete walls, cracked asphalt, dead trees, overgrown grass, picket fence, dumpsters, wrecked modern vehicles, trash and sandbag piles, rubble, chain-link, bicycles. | `SUPPORTING` | 9 |
| `20.png` | **Cracked pavement, dirt and road ground textures**, rubble, brick piles, ruined houses and apartment blocks, asphalt roads, broken walls. The most era-flexible sheet in the pack. | `CANONICAL` | 8–9 |
| `25.png` | Damaged concrete apartment blocks, cracked concrete paving, dead trees, dry planters, **rubble piles and collapsed brick walls with chimney stubs**, benches, wrecked cars, chain-link, picket fence, **utility poles with wires**, trash bags. | `SUPPORTING` | 8–9 |
| `2`–`9`, `11`–`12`, `15`–`19`, `21`–`22`, `24`, `26`–`28` | Further ruined-building elevations, rubble variants, damaged interiors and street furniture in the same idiom. | `SUPPORTING` | 8–9 |

### Wild West — 14 sheets · `CANONICAL`

Sheets individually inspected: all `tile-B-01` through `tile-B-09` and `tile-B-11`. `tile-B-10` not individually
inspected.

The frontier pack, and unambiguously American. Covers Period 6's western towns, railroads and homesteads, and its
courthouse and bank interiors serve civic scenes in earlier periods too.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | Saloon interior — bar, tables, chairs, piano, spittoons, bottle shelving. | `SUPPORTING` | 5–6 |
| `tile-B-02.png` | **Western town frontages** — Saloon, Hotel, Bank, Sheriff, General Store, Blacksmith, stable; **dirt street and boardwalk ground**, cacti, water troughs, barrels, wagons, fences. | `CANONICAL` | 5–6 |
| `tile-B-03.png` | Office and jail interiors — desks with papers and lamps, **jail cells**, wanted posters, **bank teller counters**, safes, vaults with gold bars. | `CANONICAL` | 5–6 |
| `tile-B-04.png` | **Railroad** — train station, **straight/curved/crossing track pieces**, water towers, rolling stock; plus weapon and general stores, jail, saloon, stables, covered wagon, cacti, fences. The only rail art in the library. | `CANONICAL` | 6 |
| `tile-B-05.png` | Interiors — sofas, benches, ticket counters, wardrobes, bookshelves, beds, vanities, sinks. | `SUPPORTING` | 5–6 |
| `tile-B-06.png` | Barber, tailor, pharmacy, stagecoach station, well, wagon, saloon doors, cacti, signposts, a two-storey block. | `SUPPORTING` | 5–6 |
| `tile-B-07.png` | General-store fittings — shelving, counters, cash registers, gun racks, hay bales, saddles, wanted posters, troughs. | `SUPPORTING` | 5–6 |
| `tile-B-08.png` | **Barns, stables, corrals, fencing, log cabins, homesteads.** The homestead sheet — directly relevant to the Homestead Act and frontier settlement. | `CANONICAL` | 5–6 |
| `tile-B-09.png` | Barber chairs, vanities, apothecary cabinets, **writing desks with books, papers, inkwells and a typewriter**. | `SUPPORTING` | 5–7 |
| `tile-B-10.png` | Not individually inspected; same idiom as the surrounding sheets. | `SUPPORTING` | 5–6 |
| `tile-B-11.png` | Jail cells, wanted posters, gun racks, safes, **a judge's bench and courtroom desks with scales of justice**, beds, wood stoves, saloon bar, piano, poker tables. The courtroom furniture is the pack's most transferable content. | `CANONICAL` | 3–6 |
| `Auto-tile-A4-Walls-1.png` | Shared floor/surface atlas — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-2.png` | Shared wall atlas A — see above. | `CANONICAL` | all |
| `Auto-tile-A4-walls-3.png` | Shared wall atlas B — see above. | `CANONICAL` | all |

### WWI Fleet — 7 sheets · `SUPPORTING`

Sheets individually inspected: `tile-B-01`.

Steel warship interiors and fittings — boilers, machinery spaces, pipework, bunks, hatches, ladders, crates. Genuinely
useful for a Period 7 naval scene and, more broadly, as **industrial-era ship interior** for Period 6 steamship
passage. Emphatically **not** usable for Period 1–3 sailing vessels, which need timber, not riveted steel — use
`Medieval harbor/tile-B-04.png` for those.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | Engine room — boilers, machinery, pipework, bunk beds, crates, barrels, stairs, ladders, hatches. | `SUPPORTING` | 6–7 |
| `tile-B-02.png` – `tile-B-05.png` | Further warship compartments, deck fittings and naval equipment in the same idiom. Not individually inspected. | `SUPPORTING` | 7 |
| `Auto-tile-A4-walls-2.png`, `-3.png` | Shared wall atlases — see above. | `CANONICAL` | all |

### WWI Military Equipment — 7 sheets · `SUPPORTING`

Sheets individually inspected: `tile-B-01`.

WWI-era tanks, artillery and field equipment. Narrow: US Period 7 content rarely turns on armour, and there is no
trench or earthwork art here. Retained for a Period 7 Western Front scene if one is ever built.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` | WWI tanks. | `SUPPORTING` | 7 |
| `tile-B-02.png` – `tile-B-05.png` | Further period military equipment. Not individually inspected. | `SUPPORTING` | 7 |
| `Auto-tile-A4-walls-2.png`, `-3.png` | Shared wall atlases — see above. | `CANONICAL` | all |

### modern military — 7 sheets · `SUPPORTING`

Not individually inspected. Contemporary military base equipment; Period 9 at the earliest, and the `army` pack next to
it is already benched for the same anachronism. Verify before drawing on it.

| sheet | contents | verdict | periods |
| --- | --- | --- | --- |
| `tile-B-01.png` – `tile-B-05.png` | Contemporary military base fittings and equipment. | `SUPPORTING` | 9 |
| `Auto-tile-A4-walls-2.png`, `-3.png` | Shared wall atlases — see above. | `CANONICAL` | all |

### Common Cause Philadelphia — 1 sheet · `CANONICAL`

| sheet | grid | contents | verdict | periods |
| --- | --- | --- | --- | --- |
| `liberty-pole.png` | 1×3 @48 | The PixelLab-generated liberty pole for `case-007`. The only generated asset in the repo and the only element with no equivalent in any purchased pack. See decision log `0032`. | `CANONICAL` | 3 |

### Benched packs

Sampled to confirm the verdict, not catalogued per sheet.

| pack | sheets | sampled | finding |
| --- | --- | --- | --- |
| `Modern World` | 7 | `2`, `3`, `4`, `5` | Flat overworld/world-map art — terrain drawn as region tiles with mountains as icons, buildings as map symbols. A different art language entirely; cannot share a map with the painted family. `2.png` is a genuinely good **world-map terrain sheet** and is the one salvage candidate, if a Chronotravel destination-select map is ever built as art rather than UI. `1.png` is additionally off-grid. |
| `Green Apocalyptic 1` | 13 | `1-1` | Overgrown post-apocalyptic city — vine-covered buildings, wrecked cars, cracked asphalt, junk piles. No APUSH setting. Its clean grass, tall grass, trees and flowering bushes are a salvage candidate for a modern-era map. |
| `Green Apocalyptic 2` | 13 | — | All 2048×2048, off-grid. `UNUSABLE`. |
| `Modern Interiors` | 4 | — | All off-grid (400×600, 800×800, 815×819). `UNUSABLE`. Confirms decision log `0030`. |
| `army` | 8 | `tile-B-01` | Modern main battle tanks (Abrams/Leopard/Bradley class). Anachronistic before ~1980. Its three A4 sheets are the shared duplicates and remain usable via their canonical paths. |
| `Labratory` | 9 | `1` | Sci-fi cleanroom with keycard scanners and glass airlocks. No APUSH setting. If a lab is ever needed, `University/tile-B-03.png` is the grounded alternative. |

---

## Coverage note

Every pack in this catalog was opened and every verdict rests on looking at art, not at filenames. Coverage is **not**
uniform, and the tables say so per pack:

- **Fully inspected, sheet by sheet:** 19th Centruy European Dock, 19th Century European City, Construction, Factory,
  farm, Highway Rest Area, Island survival, Medieval Fantasy Town, Medieval Fishing Village, Medieval Tavern, Medieval
  harbor, Modern Park, office, University, Common Cause Philadelphia, and the three shared A4 sheets.
- **Sampled, with the sampled sheets named in the table:** Steampunk (4 of 11), war ruins (4 of 27), Wild West (10 of
  11), WWI Fleet (1 of 5), WWI Military Equipment (1 of 5), and the benched packs.
- **Not yet inspected:** `modern military` (5 sheets), `Wild West/tile-B-10.png`.

Every sheet named `CANONICAL` anywhere in this file was individually inspected. The un-inspected remainder is all
`SUPPORTING` or `BENCHED`, so nothing the palette depends on rests on an assumption. Run
`npm run assets:label -- --pack "<name>"` and fill a row in before promoting any of them.

<!-- CATALOG:END -->
