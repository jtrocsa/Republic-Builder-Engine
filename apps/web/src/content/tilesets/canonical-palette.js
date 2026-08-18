// The canonical answer for every recurring visual element in Chronicle's maps.
//
// The problem this solves: before this file existed, "what tile is grass" was re-decided inside
// each map's generator script as a local constant (see the SAND/GRASS_A/WATER_SHALLOW block that
// used to head scripts/generate-caribbean-tmj.js), with a comment noting the coordinates had been
// confirmed by eyeballing a grid-labeled crop in /tmp. That knowledge was unreusable and
// unverifiable. Now each element has one name, one home, and one coordinate.
//
// Pairs with:
//   docs/architecture/TILE-LIBRARY-CATALOG.md  — what is on each of the 250 sheets, and why a
//                                                 pack is canonical, supporting, or benched
//   docs/architecture/art-and-map-style-guide.md — the authoring rules
//   ./maps/*.palette.js                          — per-map palettes, which extend this one
//
// Coordinates are (row, col), 0-indexed, within the sheet's own tile grid — NOT global GIDs.
// Converting to GIDs is scripts/lib/palette-gids.js's job, because a GID only means anything
// relative to one map's tileset ordering.
//
// To find or check a coordinate, never guess:
//   npm run assets:label -- "Island survival/tile-B-01.png"
// writes a coordinate-labeled copy to the gitignored reports/assets/labeled/.

/**
 * One tile: a sheet path (relative to assets/tilesets/) plus its grid coordinate, and — for
 * multi-tile art — its footprint in tiles.
 *
 * The footprint lives here rather than at the generator's `gidRect(entry, h, w)` call site because
 * that duplication is what shipped the cut-off art in Phase 52: the palette recorded the size in a
 * JSDoc comment, the generator repeated it as literals, and nothing checked either against the
 * pixels. `farm/6.png`'s birch was declared 3x2 while the apple tree's crown started inside that
 * rect, so the birch stamp painted a slice of apple tree beside it. Stated once, next to the
 * coordinate, and verified against the art by tests/unit/tile-footprints.test.js.
 *
 * @param {number} [footprint.h] rows tall, default 1
 * @param {number} [footprint.w] columns wide, default 1
 */
export function tile(sheet, row, col, footprint) {
  const h = footprint?.h ?? 1;
  const w = footprint?.w ?? 1;
  return h === 1 && w === 1 ? { sheet, row, col } : { sheet, row, col, h, w };
}

// The three Auto-tile-A4 sheets are byte-identical across 13 pack folders (verified by content
// hash — see the catalog). Referencing two different paths to the same bytes would make Vite
// bundle the image twice, so exactly one path per sheet is canonical and lives here.
export const SHARED_SHEETS = {
  /** Floor / horizontal surfaces: wood, log, steel, tile, concrete, stone, plaster, brick. */
  floors: "Medieval Tavern/Auto-tile-A4-Walls-1.png",
  /** Vertical wall surfaces, set A. Usable rows are ~2, 5, 8, 11, 14; the rest is A4 padding. */
  wallsA: "Medieval Tavern/Auto-tile-A4-walls-2.png",
  /** Vertical wall surfaces, set B. Same row caveat. */
  wallsB: "Medieval Tavern/Auto-tile-A4-walls-3.png",
};

// Verification status of every coordinate below, so a later reader knows what to trust:
//
//   [live]    Drawn by a shipping map today. Extracted from the .tmj by GID audit, so it is
//             verified by the fact that the game renders it correctly right now.
//   [labeled] Read off a grid-labeled render of the sheet via `npm run assets:label`.
//
// Nothing here is unverified. An element with no confirmed coordinate is listed in GAPS instead.

export const CANONICAL = {
  // ---------------------------------------------------------------------------------------
  // WATER — five canonical answers, one per setting family. Never mix two families on one
  // coastline: Island survival and Medieval harbor in particular render water at visibly
  // different saturation and outline weight.
  // ---------------------------------------------------------------------------------------

  /** Caribbean/tropical, just offshore. Turquoise. [live: caribbean-field ground] */
  "water.tropical.shallow": tile("Island survival/tile-B-01.png", 4, 0),
  /** Caribbean/tropical, open water. Dark navy. [live: caribbean-field ground, 302 tiles] */
  "water.tropical.deep": tile("Island survival/tile-B-01.png", 4, 6),
  /** Temperate river/harbour water for colonial dock scenes. [live: riverbend-field ground] */
  "water.harbor.temperate": tile("Medieval Fishing Village/tile-B-04.png", 10, 6),
  /** Atlantic open ocean, deep blue. [labeled] */
  "water.atlantic.deep": tile("19th Centruy European Dock/tile-B-06.png", 0, 0),
  /** Atlantic inshore, lighter with visible seabed. [labeled] */
  "water.atlantic.shallow": tile("19th Centruy European Dock/tile-B-06.png", 2, 0),

  // ---------------------------------------------------------------------------------------
  // SHORE & SAND
  // ---------------------------------------------------------------------------------------

  /** Tropical beach sand, plain and uniform. [live: caribbean-field ground] */
  "sand.tropical": tile("Island survival/tile-B-01.png", 0, 0),
  /** Same sand with an embedded driftwood log, for sparse coastal texture. [live] */
  "sand.tropical.driftwood": tile("Island survival/tile-B-01.png", 0, 6),
  /** Same sand with scattered shells. [live] */
  "sand.tropical.shells": tile("Island survival/tile-B-01.png", 0, 8),
  /** Atlantic sand/water shoreline transition. [labeled] */
  "shore.atlantic.sand": tile("19th Centruy European Dock/tile-B-06.png", 0, 4),
  /** Atlantic rocky shoreline with boulders. [labeled] */
  "shore.atlantic.rocky": tile("19th Centruy European Dock/tile-B-06.png", 0, 12),
  /** Temperate muddy/shingle river shore. [live: riverbend-field ground] */
  "shore.temperate.mud": tile("Medieval Fishing Village/tile-B-04.png", 8, 1),
  /** Temperate wet-sand shore. [live: riverbend-field ground] */
  "shore.temperate.sand": tile("Medieval Fishing Village/tile-B-04.png", 9, 2),

  // ---------------------------------------------------------------------------------------
  // GRASS — one per setting. "Grass" is not one tile across the whole game; it is one tile
  // per setting, which is the entire point of this file.
  // ---------------------------------------------------------------------------------------

  /** Tropical/jungle grass. [live: caribbean-field ground, 313 tiles — the dominant fill] */
  "grass.tropical": tile("Island survival/tile-B-01.png", 8, 0),
  /** Second tropical grass, for light non-repeating variation. [live: caribbean-field] */
  "grass.tropical.alt": tile("Island survival/tile-B-01.png", 9, 0),
  /** Dry tall-grass tuft on sand, reads as a Pokémon-style grass patch. [live: caribbean-field] */
  "grass.tropical.tuft": tile("Island survival/tile-B-01.png", 11, 2),
  /** Colonial temperate grass. [live: riverbend-field ground, 784 tiles — the dominant fill] */
  "grass.colonial": tile("Medieval Fantasy Town/1.png", 12, 14),
  /** Colonial grass as used outside the Philadelphia plaza. [live: common-cause-field ground] */
  "grass.colonial.plaza": tile("Medieval Fantasy Town/2.png", 0, 6),

  // ---------------------------------------------------------------------------------------
  // DIRT & PATHS
  // ---------------------------------------------------------------------------------------

  // Tropical dirt path, as a left/right pair with a baked-in grass edge down the outside of each.
  //
  // **No consumer, and do not add one for a road.** These were live on caribbean-field until Phase 55
  // and are the reason that island's only path could ever be a single north-south strip: an
  // east-west run with an edge-baked tile is impossible. Roads are now painted in a full-bleed
  // material tiled by parity, which runs in any direction — see scripts/lib/paths.js. Kept listed
  // because the coordinates are verified and the pair is still the right answer for a *deliberately*
  // vertical, grass-flanked lane; it is the wrong answer for a network. [labeled]
  "path.tropical.left": tile("Island survival/tile-B-01.png", 9, 4),
  "path.tropical.right": tile("Island survival/tile-B-01.png", 9, 5),
  /**
   * Packed earth, full-bleed — top-left quadrant of a 2x2 block. **The road material for every
   * generated path network in the game**, tropical and temperate alike.
   *
   * Phase 55 generated all three networks but left each map painting them in whatever ground tile it
   * already had: Caribbean's roads were `sand.tropical` (literal beach sand) and Riverbend's were the
   * fishing pack's wet-sand shore strip. Both read exactly as reported — a patch of sand dropped on
   * grass — because that is what they were. This is a brown, pebbled earth that tiles in any
   * direction and sits darker and less saturated than either map's grass, so a lane reads as a lane
   * against both. [live: caribbean-field + riverbend-field + common-cause-field ground]
   */
  "path.packed.earth": tile("Medieval Fantasy Town/2.png", 0, 4),
  /**
   * Colonial dirt road, and a variant.
   *
   * **No consumer.** Tagged `[live: riverbend-field ground]` for a long time and it was never true
   * after Phase 52 — that map imports no canonical entries at all and does not name
   * `Medieval Fantasy Town/1.png` among its sheets. Kept listed because the coordinates are verified;
   * `path.packed.earth` above is the entry to reach for. [labeled]
   */
  "path.colonial.dirt": tile("Medieval Fantasy Town/1.png", 10, 4),
  "path.colonial.dirt.alt": tile("Medieval Fantasy Town/1.png", 11, 4),
  /** Packed sand/dirt lot, dockside. [labeled] */
  "path.dock.dirt": tile("19th Centruy European Dock/tile-B-06.png", 12, 10),
  /** Loose gravel. [labeled] */
  "path.gravel": tile("19th Centruy European Dock/tile-B-06.png", 12, 13),

  // Cultivation used to be listed here as two `farm/3.png` entries tagged
  // `[live: riverbend-field]`. Both claims were stale: Phase 52 dropped farm/3 from the map, and
  // Phase 53 rebuilt Riverbend's fields from `farm/6`'s authored 2x2 planted blocks, which are
  // declared in riverbend-field.palette.js rather than here — they are one map's crop rotation,
  // not a cross-map canonical material.

  // ---------------------------------------------------------------------------------------
  // STONE, PAVING & MASONRY
  // ---------------------------------------------------------------------------------------

  /** Colonial cobblestone plaza. [live: common-cause-field ground, 576 tiles] */
  "stone.colonial.cobble": tile("Medieval Fantasy Town/2.png", 0, 0),
  /** Colonial cobble variant. [live: common-cause-field ground] */
  "stone.colonial.cobble.alt": tile("Medieval Fantasy Town/2.png", 1, 0),
  /** 19th-century city street: red herringbone brick. [labeled] */
  "stone.city.brick.red": tile("19th Century European City/tile-B-05.png", 0, 0),
  /** 19th-century city street: grey running-bond brick. [labeled] */
  "stone.city.brick.grey": tile("19th Century European City/tile-B-05.png", 0, 4),
  /** 19th-century city street: cream flagstone. [labeled] */
  "stone.city.flagstone": tile("19th Century European City/tile-B-05.png", 0, 8),
  /** 19th-century city street: large pale stone slab. [labeled] */
  "stone.city.slab": tile("19th Century European City/tile-B-05.png", 0, 10),
  /** 19th-century city street: grey cobblestone. [labeled] */
  "stone.city.cobble": tile("19th Century European City/tile-B-05.png", 0, 12),
  /** Dockside rounded cobblestone. [labeled] */
  "stone.dock.cobble": tile("19th Centruy European Dock/tile-B-06.png", 14, 0),
  /** Dockside cut flagstone. [labeled] */
  "stone.dock.flagstone": tile("19th Centruy European Dock/tile-B-06.png", 14, 4),
  /** Stone quay / sea wall course. [labeled] */
  "stone.quay.wall": tile("19th Centruy European Dock/tile-B-06.png", 4, 0),

  // ---------------------------------------------------------------------------------------
  // TIMBER DECKING
  // ---------------------------------------------------------------------------------------

  /** Wide plank dock decking. [labeled] */
  "wood.dock.deck": tile("19th Centruy European Dock/tile-B-06.png", 4, 10),
  /** Colonial wharf plank, as used at Riverbend. [live: riverbend-field structures] */
  "wood.wharf.plank": tile("Medieval Fishing Village/tile-B-04.png", 4, 12),

  // ---------------------------------------------------------------------------------------
  // INTERIOR FLOORS
  //
  // Note: the Institute Archive Room's floor comes from Medieval Tavern tile-B-05, NOT
  // tile-B-01. The style guide asserted tile-B-01 for years; a GID audit of archive-room.tmj
  // disproved it (its whole ground layer sits in the firstgid:513 = tile-B-05 range).
  // ---------------------------------------------------------------------------------------

  /** Grey flagstone, top-left of a 2x2 block. Both Institute interiors' main floor.
   *  [live: archive-room + institute-hall + hallway ground] */
  "floor.archive.stone": tile("Medieval Tavern/tile-B-05.png", 13, 0),
  /** Second flagstone cell of the same 2x2 block. [live: hallway ground] */
  "floor.archive.stone.b": tile("Medieval Tavern/tile-B-05.png", 13, 1),
  /** Flagstone accent. [live: hallway ground] */
  "floor.archive.stone.c": tile("Medieval Tavern/tile-B-05.png", 14, 2),
  /** Flagstone accent. [live: hallway ground] */
  "floor.archive.stone.d": tile("Medieval Tavern/tile-B-05.png", 15, 4),
  /**
   * The name says "sandstone" and the art is plank **wood** — a misnomer inherited from before this
   * file existed. The tan cut-stone floor the name implies is `floor.institute.sandstone` below.
   *
   * **No live consumer.** It was kept solely because archive-room.palette.js referenced it; Phase 58
   * rebuilt that room on `floor.institute.wood`, which is the same material one block lower and
   * correctly named. Retained as a catalog entry, not as a tile to reach for.
   */
  "floor.archive.sandstone": tile("Medieval Tavern/tile-B-05.png", 12, 8),
  /** Warm plank flooring for Institute interiors — the Main Hall's foyer runner and table dais.
   *  Same material family as the (misnamed) entry above, one block lower on the sheet.
   *  [live: institute-hall ground] */
  "floor.institute.wood": tile("Medieval Tavern/tile-B-05.png", 13, 8),
  /** Tan cut-stone floor — the Main Hall's Preservation Case alcove. Genuinely a third material,
   *  not a warmer grey: needed so the hall's three zones read apart. [live: institute-hall ground] */
  "floor.institute.sandstone": tile("Medieval Tavern/tile-B-05.png", 12, 12),

  // ---------------------------------------------------------------------------------------
  // INTERIOR WALLS
  //
  // Only the flat surface rows of the A4 wall sheets. Rows 0-2, 5-7 and 10-12 of those sheets
  // are the RPG-Maker corner/edge blob set, which this project has no autotiler for — and needs
  // none, because a full-bleed material paves an arbitrary shape correctly on its own. Stamping a
  // blob-set cell would draw a fragment of wall trim floating on the floor.
  // ---------------------------------------------------------------------------------------

  /** Wood-panelled interior wall, Institute/tavern family. [live: institute-hall ground] */
  "wall.interior.plank": tile("Medieval Tavern/Auto-tile-A4-walls-2.png", 3, 8),
  /** Grey masonry interior wall, same family. [live: institute-hall ground] */
  "wall.interior.stone": tile("Medieval Tavern/Auto-tile-A4-walls-2.png", 3, 6),

  // ---------------------------------------------------------------------------------------
  // DOCK & MARITIME PROPS
  // ---------------------------------------------------------------------------------------

  /** Mooring bollard. [labeled] */
  "prop.dock.bollard": tile("19th Centruy European Dock/tile-B-06.png", 8, 0),
  /** Timber cargo crane. [labeled] */
  "prop.dock.crane": tile("19th Centruy European Dock/tile-B-06.png", 8, 4),
  /** Stone lighthouse, unlit. [labeled] */
  "prop.dock.lighthouse": tile("19th Centruy European Dock/tile-B-06.png", 6, 4),
  /** Shipping crate. [labeled] */
  "prop.cargo.crate": tile("19th Centruy European Dock/tile-B-06.png", 10, 0),
  /** Cargo barrel. [labeled] */
  "prop.cargo.barrel": tile("19th Centruy European Dock/tile-B-06.png", 10, 4),
  /** Bound commodity sack. [labeled] */
  "prop.cargo.sack": tile("19th Centruy European Dock/tile-B-06.png", 10, 6),

  // ---------------------------------------------------------------------------------------
  // CITY STREET FURNITURE
  // ---------------------------------------------------------------------------------------

  /** Gas street lamp. [labeled] */
  "prop.city.lamp": tile("19th Century European City/tile-B-05.png", 6, 0),
  /** Ornate iron bench. [labeled] */
  "prop.city.bench": tile("19th Century European City/tile-B-05.png", 8, 8),
  /** Public fountain. [labeled] */
  "prop.city.fountain": tile("19th Century European City/tile-B-05.png", 6, 15),
  /** Stone bollard. [labeled] */
  "prop.city.bollard": tile("19th Century European City/tile-B-05.png", 5, 8),
};

// Elements with no acceptable tile anywhere in the library. Recorded so a map author stops and
// asks rather than forcing a bad fit, and so a future asset purchase has a shopping list.
// See the Gap Register in art-and-map-style-guide.md for the reasoning behind each.
export const GAPS = [
  // `architecture.indigenous.northAmerican` stood here as ONE entry covering longhouse, pueblo and
  // plains lodge. That was the register committing in miniature the error it exists to prevent:
  // three culture areas filed as one line can never close, and treating them as one job is the
  // same reasoning that made a Caribbean hut look like an acceptable stand-in. Split in Phase 83
  // into the buildings it was actually naming. The bohio rule is unchanged and binds all of them:
  // Island survival's huts are Caribbean/Taino-appropriate ONLY.
  //
  // The arbor-frame bark-and-mat lodge is CLOSED — commissioned as derived/indigenous-village.png
  // (earth lodge, bark lodge, two tipis, drying rack, hide stretcher, and the agency stone hut the
  // Indian Office built beside one). ONE object serves the Powhatan yehakin and the Kanza bark
  // lodge, and that is not the bohio substitution in another coat: those two are the same building
  // by the same method — saplings bent into a barrel frame under bark or woven mats — where a
  // conical tropical thatch hut is a different structure. See the manifest entry for the sourcing.
  "architecture.indigenous.longhouse", // Haudenosaunee multi-family longhouse: elm-bark clad,
  // sixty to two hundred feet, with the repeated interior bays that are what make it a longhouse
  // rather than a long hut. indigenous-village.png's `barkLodge` is the same cladding at a
  // twelfth the length and is NOT a substitute for it.
  "architecture.indigenous.pueblo", // Ancestral Puebloan and Rio Grande adobe: stacked storeys,
  // roof-ladder access between them, vigas projecting through the wall face. Nothing in 250
  // sheets is masonry of this kind, and the desert packs are landform — buttes and canyons with
  // no architecture in them at all.
  // `military.civilWar.camp` was here, and is CLOSED — commissioned as derived/civil-war-works.png
  // (wall tent, rampart, abatis, field gun, supply wagon, hospital cot). See the manifest entry for
  // what was generated and for the one object, the chevaux-de-frise, that was dropped.
  // Not partial — absent. The library has no cattle sprite of any kind: Wild West draws a corral
  // as a finished enclosure and the one animal on its sheets is a horse inside a stable frontage,
  // so railhead-field ships its stock pens empty in the shipping season. Registered in Phase 86.
  "livestock.cattle",
  "architecture.plantation.greatHouse", // Greek Revival columned house. Fields and quarters are
  // covered (farm + Wild West tile-B-08); the great house is not.
  "streetscape.midCentury", // 1950s-specific. Highway Rest Area / Modern Park read contemporary.
  "architecture.antebellum.commercialStreet", // Greek Revival storefronts and vernacular brick
  // blocks, c. 1820-1850. 19th Century European City/tile-B-01 is the library's only masonry
  // commercial street, and its mansard roofs and railed terraces are Second Empire — twenty years
  // late for 1845. Partial; canal-crossroads-field manages it by keeping the brick for the six
  // buildings a boomtown would genuinely have built in brick and using repacked clapboard for the
  // rest. Registered here in Phase 81: the Gap Register in art-and-map-style-guide.md has carried
  // this row since Canal Crossroads shipped, but it was never mirrored into this array, so the
  // two sources of truth disagreed on how many gaps exist.
  // --- Meridian Institute props (Phase 79, decision log 0062) ---------------------------------
  // The rival institute's interior is covered by office/3, office/4, 19thC tile-B-04 and
  // Steampunk/5 — see `meridian-interior` in maps/planned-maps.js. These three props are what
  // those four sheets cannot supply. Sizes and prompt guidance in docs/art/MERIDIAN-ASSET-BRIEF.md.
  "prop.meridian.anchorRing", // Concentric brass rings around a disc of pale cyan anchor glass.
  // Nothing in 250 sheets is this, and it is the object carrying the shared material that makes
  // Meridian read as descended from Chronicle — so it blocks a faithful build rather than merely
  // impoverishing one. Two states: improvised on a floor stand (2x2), installed on a dais (3x4).
  "prop.meridian.mapTable", // Circular council table, 3x5. Deliberately larger than Chronicle's
  // 2x3 `navigationTable` (Island survival/5) — reusing that one collapses the faction read at
  // the single prop a player is most likely to compare.
  "prop.meridian.chartCase", // Horizontal glass-topped case lit from within, 2x1, two or three
  // variants. 19thC tile-B-04's glazed cabinets are upright furniture and read as a library;
  // these are what make a room read as an evidence archive.
];

/** Every distinct sheet path this palette references. Used by the palette integrity test. */
export function sheetsReferencedBy(palette) {
  return [...new Set(Object.values(palette).map((entry) => entry.sheet))].sort();
}
