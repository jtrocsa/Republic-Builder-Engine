// Palette for canal-crossroads-field.tmj (Unit 4's field map, "Canal Crossroads").
// Setting: a fictional but grounded Erie Canal boomtown in upstate New York, 1845.
// Consumed by scripts/generate-canal-crossroads-tmj.js.
//
// Four decisions here are worth stating, because each of them was arrived at against the art
// rather than from the plan, and each one changed the plan.
//
// 1. **The canal's water is Medieval Fishing Village's, not the Dock pack's.** The brief called
//    for a muddy working ditch, and the library has no such tile: the Dock pack's `(2,4)-(3,5)`
//    "muddy water" — the one the reconnaissance pass identified — turns out to be a *diagonal
//    bank-to-water corner*, not a fill, so parity-tiling it lays alternating bands of mud and
//    water down the channel. What it does have is a flat, still, faintly-chevroned blue at
//    `Medieval Fishing Village/tile-B-04 (15,0)`, already live on the Philadelphia map and already
//    in the bundle. A canal reads from its *edges*, not its hue, so the channel is lined on both
//    banks with the Dock pack's dressed stone coping instead, and the still water does the rest.
//    Still water is also simply true of a canal in a way that a river tile would not be.
//
// 2. **The lock is real art and it is the crossing.** `Steampunk/1 (14,0)` is a stone lock chamber
//    with twin timber gates, iron strapping, a brass winding gear and an access ladder — drawn
//    head-on, 2 rows x 4 cols, with its own water painted in below the gates. That last part is
//    why it goes on the *ground* layer via `groundRect()` and not on `structures`: stamped above
//    the water it would lay a square of a brighter blue over the canal, which is the exact defect
//    map-builder.js's `groundRect` doc warns about. On the ground it replaces the water, and the
//    seam falls where stone meets water, which is what a lock looks like. The channel is pinched
//    to exactly the lock's two rows so the piece spans it edge to edge.
//
// 3. **`19th Century European City` is a flagged substitution, and it is used sparingly.** Its
//    mansard roofs and railed brick terraces are Second Empire — twenty years late for 1845. It is
//    still the library's only masonry commercial street, so it dresses the bank, the print office,
//    the Market Street block and the immigrant terraces, while the rest of the town is the
//    period-right clapboard already repacked into `derived/farm-buildings.png`. A canal boomtown
//    that is mostly timber with a few new brick blocks going up is both what the art supports and
//    what the history says. Registered in docs/architecture/art-and-map-style-guide.md.
//
// 4. **`Construction/2.png` was considered and dropped.** The plan named it as what would make the
//    boomtown read unfinished. Read at full size, its distinctive content is *steel* scaffolding,
//    galvanised pipe, cement sacks and concrete block — none of which exist in 1845 — and its
//    period-safe content (lumber, brick pallets, sand) is already covered by
//    `Medieval Fantasy Town/3`'s log stacks and sawhorse and the Dock pack's plank stacks. One
//    fewer megabyte in the bundle for no loss.
//
// `Steampunk` remains a prop quarry only: the lock and the cargo barge, and nothing else. Every
// gear, airship, mecha, automobile and brass fitting on that sheet stays where it is.

import { FarmBuildings, FarmTrees, TownCivic } from "../derived-objects.coords.js";
import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "canal-crossroads-field",
  period: 4,
  status: "live",
  map: "apps/web/src/content/maps/canal-crossroads-field.tmj",
  // Three made surfaces, where the other maps have one — and the list is the honest description, not
  // a convenience. Packed earth is the streets, because an 1845 boomtown's streets were mud and the
  // money went into the canal. Paving is the canal banks and the basin quay, which is where the money
  // went and reads as it. Plank decking is the crossing over the water. All three are road in the
  // only sense tests/unit/map-path-network.test.js measures — ground a person walks from one building
  // to another on — and if the paving were left out of this list, sixteen quayside doors would look
  // stranded and the north half of the town would look cut off from the south.
  //
  // The FIRST entry is the one new road gets painted in: it is what the generator hands to
  // `RoadNetwork`, so every spur the router lays is packed earth.
  road: ["dirt", "cobble", "plankBridge"],

  // Ordered — reshuffling changes every GID in the committed .tmj.
  // Five of the nine are already bundled by other maps and cost nothing here: MFT/2 and MFV B-04
  // by Philadelphia, and all three derived sheets by Philadelphia and Riverbend.
  sheets: [
    { path: "Medieval Fantasy Town/2.png", name: "medieval-fantasy-town-2" },
    { path: "Medieval Fantasy Town/3.png", name: "medieval-fantasy-town-3" },
    { path: "Medieval Fishing Village/tile-B-04.png", name: "medieval-fishing-village-b04" },
    { path: "19th Centruy European Dock/tile-B-06.png", name: "european-dock-b06" },
    { path: "19th Century European City/tile-B-01.png", name: "european-city-b01" },
    { path: "Steampunk/1.png", name: "steampunk-1" },
    { path: "derived/farm-trees.png", name: "derived-farm-trees" },
    { path: "derived/farm-buildings.png", name: "derived-farm-buildings" },
    { path: "derived/town-civic.png", name: "derived-town-civic" },
  ],

  tiles: {
    // --- ground: authored terrain blocks -------------------------------------------------------
    /** Everything not street, quay or water. */
    grass: { ...CANONICAL["grass.colonial.plaza"], h: 2, w: 2 },
    /** Market Street, the towpath, the turnpike, and every spur the router lays. */
    dirt: { ...CANONICAL["path.packed.earth"], h: 2, w: 2 },
    /**
     * The basin quay and both canal banks — the only paved surfaces in town, because they are the
     * ones that paid.
     *
     * Philadelphia's paving rather than the Dock pack's, and the reason is alpha, not taste: this
     * block is 0% transparent edge to edge, where `stone.dock.cobble` carries a fully clear top
     * pixel row. On the ground layer a transparent pixel is a hole through to the page, and the
     * bank rows are 100 tiles of continuous edge for a hairline to run along.
     */
    cobble: { ...CANONICAL["stone.colonial.cobble"], h: 2, w: 2 },
    /** The canal. Flat, still, faintly chevroned. See note 1 in the header. */
    water: tile("Medieval Fishing Village/tile-B-04.png", 15, 0, { h: 1, w: 8 }),
    /**
     * Dressed stone coping, laid along both banks for the canal's whole length.
     *
     * This is the tile that makes the channel read as cut rather than found. Cols 0-3 of row 4 are
     * continuous ashlar with a pilaster; col 7 is a stone-to-timber transition and is deliberately
     * outside the block.
     *
     * Goes on the STRUCTURES layer over paving, not on the ground, because it is 11% transparent
     * with four fully clear pixel rows along its top and most of one along its bottom — a wall face
     * drawn as a cut-out, not as terrain. The first pass of this map put it on the ground and drew a
     * black hairline down 100 tiles of canal bank.
     */
    quayCoping: tile("19th Centruy European Dock/tile-B-06.png", 4, 0, { h: 1, w: 4 }),

    // --- canal furniture ---------------------------------------------------------------------
    /**
     * The lock chamber and its gates. See note 2 in the header.
     *
     * Stamped `decor` over water for the same reason as the coping: its top eight pixel rows are
     * clear, so on the ground layer the upper pound of the lock is a hole. Over water they show the
     * canal, which is what is actually above a set of gates. Its own painted water below the gates
     * is opaque and a shade brighter than the channel, which reads as churn at the sill.
     */
    canalLock: tile("Steampunk/1.png", 14, 0, { h: 2, w: 4 }),
    /**
     * Plank decking with pilings, over this pack's own blue — the same water the channel is painted
     * in, so it composites without a seam. Two rows of the four-row pier, which is exactly the
     * pinched channel's width.
     */
    plankBridge: tile("Medieval Fishing Village/tile-B-04.png", 8, 2, { h: 2, w: 2 }),

    // --- the canal's working plant ---------------------------------------------------------------
    /** Flat-decked cargo barge with a deck derrick. Moored, so `decor`: nothing to collide with. */
    cargoBarge: tile("Steampunk/1.png", 14, 4, { h: 2, w: 4 }),
    /** Timber loading derrick on the basin quay. */
    dockCrane: tile("19th Centruy European Dock/tile-B-06.png", 8, 4, { h: 2, w: 2 }),
    bollard: tile("19th Centruy European Dock/tile-B-06.png", 8, 0),
    bollardRoped: tile("19th Centruy European Dock/tile-B-06.png", 9, 1),
    lampPost: tile("19th Centruy European Dock/tile-B-06.png", 8, 12, { h: 2, w: 1 }),

    // --- Workshop & Mill --------------------------------------------------------------------------
    /**
     * The flour mill: a stone mill house with a timber flume pouring into its wheel pit. The whole
     * reason the district is where it is — it stands on the canal bank drawing off a mill race.
     */
    flourMill: tile("Medieval Fantasy Town/3.png", 12, 0, { h: 4, w: 4 }),
    /** The textile workshop — a plain three-bay shed, the biggest roof in the district. */
    textileWorkshop: FarmBuildings.warehouse,
    blacksmith: FarmBuildings.houseBrown,
    cabinetmaker: FarmBuildings.houseRed,

    // --- Market Street ------------------------------------------------------------------------
    /** Four joined shopfronts under one roofline — the commercial block, in one stamp. */
    commercialTerrace: tile("19th Century European City/tile-B-01.png", 10, 4, { h: 2, w: 4 }),
    /**
     * The free bank, chartered under New York's 1838 Free Banking Act — pedimented doorway, stone
     * steps, quoins. The Second Bank was dead by 1836; this is what replaced it, and it is better
     * content besides, because it lets a banker argue about the Bank War's aftermath rather than
     * gesture at it.
     */
    freeBank: tile("19th Century European City/tile-B-01.png", 2, 0, { h: 2, w: 2 }),
    /** The partisan Jacksonian sheet. Two display windows and a dark sign band. */
    printOffice: tile("19th Century European City/tile-B-01.png", 2, 6, { h: 2, w: 2 }),
    generalStore: tile("19th Century European City/tile-B-01.png", 0, 6, { h: 2, w: 2 }),
    /** Awninged, with a sandwich board out front. */
    tavern: tile("19th Century European City/tile-B-01.png", 8, 8, { h: 2, w: 2 }),
    /** Brownstone with a plain door — the weigh-lock office and the commission merchant both. */
    officeBrick: tile("19th Century European City/tile-B-01.png", 2, 2, { h: 2, w: 2 }),
    /** An arched carriage entry beside the shopfront — the forwarding merchant. */
    forwardingHouse: tile("19th Century European City/tile-B-01.png", 2, 8, { h: 2, w: 2 }),
    /** Dormered brick with a gas lamp against it — the reform press. */
    reformPress: tile("19th Century European City/tile-B-01.png", 8, 4, { h: 2, w: 2 }),
    /** Dormered brick with an awning and goods stacked outside. */
    provisionStore: tile("19th Century European City/tile-B-01.png", 8, 10, { h: 2, w: 2 }),

    // --- Reform Square ----------------------------------------------------------------------------
    church: TownCivic.churchSteeple,
    /** The public meeting hall — clapboard, dormers, a stepped portico. */
    meetingHall: FarmBuildings.meetinghouse,

    // --- Immigrant Quarter ------------------------------------------------------------------------
    /** A four-house brick terrace with front railings. */
    terrace: tile("19th Century European City/tile-B-01.png", 8, 12, { h: 2, w: 4 }),
    boardinghouseYellow: FarmBuildings.houseYellow,
    boardinghouseBlue: FarmBuildings.houseBlue,
    cottageRed: FarmBuildings.houseRed,
    cottageBrown: FarmBuildings.houseBrown,
    /** The canal-side tavern and boardinghouse — striped awning, right on the towpath. */
    canalTavern: tile("19th Century European City/tile-B-01.png", 2, 4, { h: 2, w: 2 }),

    // --- Canal Basin ------------------------------------------------------------------------------
    warehouse: FarmBuildings.warehouse,
    /** A second storehouse silhouette, so the basin frontage is not three copies of one roof. */
    grainStore: FarmBuildings.barn,
    lockHouse: FarmBuildings.houseBrown,

    // --- Farm & Turnpike Edge ---------------------------------------------------------------------
    barn: tile("Medieval Fantasy Town/3.png", 9, 12, { h: 3, w: 4 }),
    hayShed: tile("Medieval Fantasy Town/3.png", 10, 8, { h: 2, w: 3 }),
    outbuilding: tile("Medieval Fantasy Town/3.png", 13, 8, { h: 3, w: 2 }),
    farmhouse: FarmBuildings.houseCream,
    tollgateHouse: FarmBuildings.houseBrown,
    haystack: tile("Medieval Fantasy Town/3.png", 10, 2, { h: 2, w: 2 }),
    /** Split-rail fencing, two tiles per section. */
    fenceRail: tile("Medieval Fantasy Town/3.png", 0, 3, { h: 1, w: 2 }),

    // --- street furniture and market ------------------------------------------------------------
    /** Where the temperance pledge and the anti-abolition warning go up against each other. */
    noticeBoard: tile("Medieval Fantasy Town/2.png", 6, 14, { h: 2, w: 2 }),
    townWell: tile("Medieval Fantasy Town/2.png", 6, 8, { h: 2, w: 2 }),
    bench: tile("Medieval Fantasy Town/2.png", 11, 12, { h: 1, w: 2 }),
    signpost: tile("Medieval Fantasy Town/2.png", 8, 14, { h: 2, w: 1 }),
    /** Trestle table strewn with open documents — what an object-anchored record sits on. */
    documentTable: tile("Medieval Fantasy Town/2.png", 12, 10, { h: 2, w: 2 }),
    stallProduce: tile("Medieval Fantasy Town/2.png", 4, 8, { h: 2, w: 2 }),
    stallDryGoods: tile("Medieval Fantasy Town/2.png", 6, 6, { h: 2, w: 2 }),
    stallButcher: tile("Medieval Fantasy Town/2.png", 4, 0, { h: 2, w: 2 }),

    // --- haulage --------------------------------------------------------------------------------
    /**
     * A draught horse in harness. The plan asked whether a canal mule needed commissioning; it does
     * not — this is the library's working animal and the substitution is the same class as every
     * other on this map. There is no mule anywhere in 250 sheets.
     */
    draughtHorse: tile("19th Century European City/tile-B-01.png", 12, 9),
    /** Horse and covered wagon, for the turnpike. */
    coveredWagon: tile("19th Century European City/tile-B-01.png", 13, 6, { h: 1, w: 2 }),
    /** Produce barrow under a striped awning. */
    marketBarrow: tile("19th Century European City/tile-B-01.png", 12, 8),
    handCart: tile("19th Centruy European Dock/tile-B-06.png", 11, 13),

    // --- cargo, and the enlargement works ---------------------------------------------------------
    // The Erie enlargement ran 1836-1862, so in 1845 this town is a building site as much as a
    // port. The lumber, planks and sawhorse are that; the crates and sacks are the freight.
    crate: tile("19th Centruy European Dock/tile-B-06.png", 10, 0),
    crateAlt: tile("19th Centruy European Dock/tile-B-06.png", 11, 1),
    barrel: tile("19th Centruy European Dock/tile-B-06.png", 10, 4),
    barrelAlt: tile("19th Centruy European Dock/tile-B-06.png", 11, 5),
    grainSack: tile("19th Centruy European Dock/tile-B-06.png", 10, 6),
    sackPile: tile("19th Centruy European Dock/tile-B-06.png", 10, 9),
    ropeCoil: tile("19th Centruy European Dock/tile-B-06.png", 11, 8),
    plankStack: tile("19th Centruy European Dock/tile-B-06.png", 12, 0, { h: 2, w: 2 }),
    lumberPile: tile("Medieval Fantasy Town/3.png", 14, 12),
    lumberPileAlt: tile("Medieval Fantasy Town/3.png", 14, 13),
    sawhorse: tile("Medieval Fantasy Town/3.png", 14, 14, { h: 1, w: 2 }),
    timberStack: tile("Medieval Fantasy Town/3.png", 13, 13),
    farmSacks: tile("Medieval Fantasy Town/3.png", 13, 12),

    // --- planting -----------------------------------------------------------------------------
    treeOak: FarmTrees.treeOak,
    treeMaple: FarmTrees.treeMaple,
    treeBirch: FarmTrees.treeBirch,
    treeCherry: FarmTrees.treeCherry,
    bushRose: FarmTrees.bushRose,
    bushFlowering: FarmTrees.bushFlowering,
    /** Bank planting. A canal edge with nothing growing on it reads as a swimming pool. */
    cattails: tile("19th Centruy European Dock/tile-B-06.png", 15, 14),
    reeds: tile("19th Centruy European Dock/tile-B-06.png", 14, 14),
  },
};
