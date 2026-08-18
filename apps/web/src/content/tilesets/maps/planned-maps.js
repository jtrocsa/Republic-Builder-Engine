// The forward map slate: which sheets each future map will draw from, decided now.
//
// The point of this file is "no surprises." When a Period 7 tenement map finally gets built,
// nobody re-opens 250 sheets and re-decides what a street looks like — the pack selection is
// already made, already checked against the art-style rule, and the gaps are already known.
//
// SHAPE NOTE: the live maps each get their own `<id>.palette.js` file because a generator script
// imports exactly one. Planned maps have no generator to import them, so 22 near-identical stub
// files would be pure noise; they live here as one list instead. When a planned map is actually
// built, lift its entry into its own file, add `tiles: {...}` with verified coordinates, and
// flip `status` to "live".
//
// Deliberately NO tile coordinates here. A coordinate can only be chosen against a real map
// composition, and inventing one now would be a guess dressed up as a decision — exactly the
// failure mode this whole pass exists to end. What IS decided is the sheet selection.
//
// Every sheet named below is `CANONICAL` or `SUPPORTING` in docs/architecture/TILE-LIBRARY-CATALOG.md.
// Nothing from a benched pack appears here, and the palette integrity test enforces that.

/** Packs benched by the art-style rule. Referencing one of these is a test failure. */
export const BENCHED_PACKS = [
  "Modern World",
  "Green Apocalyptic 1",
  "Green Apocalyptic 2",
  "Modern Interiors",
  "army",
  "Labratory",
];

export const PLANNED_MAPS = [
  // ---------------------------------------------------------------------------- Period 1
  {
    id: "p1-indigenous-settlement",
    period: 1,
    status: "planned",
    intent:
      "A pre-contact Eastern Woodlands village: bark-and-mat lodges, drying racks, worked hides.",
    sheets: [
      "derived/indigenous-village.png", // arbor lodges, tipis, drying rack, hide stretcher
      "derived/farm-trees.png", // North American vernacular species
      "farm/1.png", // worked ground and field edges
    ],
    notes:
      "UNBLOCKED in Phase 83, and re-scoped in the same pass. This entry used to read 'a " +
      "pre-contact Indigenous North American settlement' with no people named anywhere in it, " +
      "which is the same flattening its own blocking gap existed to warn about: a map is one " +
      "people in one place, and 'North American' is not a place. It is now the Eastern " +
      "Woodlands, which is the culture area derived/indigenous-village.png actually covers. A " +
      "Haudenosaunee longhouse town or a Puebloan one is still blocked, and now says so under " +
      "its own gap id rather than hiding inside this one. Still missing for a fully furnished " +
      "build: a palisade, and cultivated ground that does not read as a European field.",
  },

  // ---------------------------------------------------------------------------- Period 2
  {
    id: "p2-atlantic-wharf",
    period: 2,
    status: "planned",
    intent: "An Atlantic port: cargo handling, the trade goods of the Columbian Exchange.",
    sheets: [
      "19th Centruy European Dock/tile-B-06.png", // water, quay, decking, ground
      "19th Centruy European Dock/tile-B-01.png", // cargo: labelled sugar/coffee/grain sacks
      "19th Centruy European Dock/tile-B-02.png", // warehouses, cranes, piers
      "Medieval harbor/tile-B-04.png", // square-rigged ships
    ],
    notes:
      "The strongest ready-made match in the library. tile-B-01's labelled COFFEE/sugar/grain " +
      "sacks and balance scales map directly onto Unit 2's Triangle Ledger content.",
  },
  {
    id: "p2-ship-hold",
    period: 2,
    status: "planned",
    intent: "Below decks on an Atlantic crossing.",
    sheets: [
      "Medieval harbor/tile-B-04.png", // timber hulls
      "Medieval Fishing Village/tile-B-01.png", // rigging, sailcloth, barrels, rope
      "Medieval Tavern/Auto-tile-A4-Walls-1.png", // plank floor
    ],
    notes:
      "Timber, not steel. WWI Fleet's engine-room sheets are riveted-steel industrial and are " +
      "wrong for any pre-industrial vessel — they are reserved for Period 6-7 steamships.",
  },

  // ---------------------------------------------------------------------------- Period 3
  {
    id: "p3-assembly-hall-interior",
    period: 3,
    status: "planned",
    intent: "A colonial assembly room / committee chamber.",
    sheets: [
      "19th Century European City/tile-B-02.png", // long tables, carved chairs, bookcases
      "19th Century European City/tile-B-04.png", // parquet floor, panelled walls, writing desk
      "Medieval Fantasy Town/16.png", // colonial tavern interior, for the public-house variant
    ],
    notes:
      "19th Century European City reads slightly late for the 1770s but is the closest formal " +
      "civic interior available. Its writing desk with quill and inkstand is the key prop.",
  },

  // ---------------------------------------------------------------------------- Period 4
  // `p4-canal-steamboat` was here and has been BUILT, as canal-crossroads-field — see that map's own
  // palette file. Its sheet selection survived the build with two corrections worth recording,
  // because both were only decidable against the pixels:
  //
  //   * Steampunk/1's usable content is the canal LOCK at (14,0) and the flat cargo BARGE at (14,4),
  //     not its paddle steamers — a mule-drawn canal boat is what an 1845 Erie town runs on, and the
  //     steamers on that sheet are brass-heavy besides. Still a prop quarry, still nothing else taken.
  //   * The Dock pack's water is the Atlantic family and wrong for a canal; the channel is painted in
  //     Medieval Fishing Village/tile-B-04's still blue instead, and the Dock pack earns its place on
  //     quay coping, bollards, derricks, cargo and cattails.
  {
    id: "p4-mill-town",
    period: 4,
    status: "planned",
    intent: "An early New England textile mill town.",
    sheets: [
      "Medieval Fantasy Town/3.png", // stone mill with water wheel, stream, bridges
      "Factory/3.png", // brick smokestacks
      "Medieval Fantasy Town/1.png", // worker housing
    ],
    notes:
      "Medieval Fantasy Town/3.png's water-wheel mill is the anchor, and canal-crossroads-field " +
      "now proves it out at (12,0) as a 4x4 stamp with its flume. Factory's modern robot and " +
      "CNC sheets are excluded; only the brick smokestacks carry back this far. Still distinct " +
      "from the canal town: a Lowell-style mill town is a company village, not a port.",
  },

  // ---------------------------------------------------------------------------- Period 5
  {
    id: "p5-plantation-south",
    period: 5,
    status: "planned",
    intent: "A cotton plantation: fields, quarters, the labour that produced the crop.",
    sheets: [
      "farm/1.png", // cotton plants at four growth stages
      "farm/6.png", // tilled rows, grass, split-rail fencing, trees
      "farm/2.png", // weathered barns, outbuildings, log cabins
      "Wild West/tile-B-08.png", // log quarters, corrals
    ],
    gap: "architecture.plantation.greatHouse",
    notes:
      "Fields and quarters are well covered. The Greek Revival great house is NOT — there is no " +
      "columned plantation house anywhere in the library. Build the map around the fields and " +
      "quarters, or commission the house. Exclude farm/3.png's tractors, pickups and vans.",
  },
  {
    id: "p5-civil-war-camp",
    period: 5,
    status: "planned",
    intent: "A Union or Confederate encampment.",
    sheets: [
      "derived/civil-war-works.png", // wall tent, rampart, abatis, field gun, supply wagon, cot
      "farm/6.png", // tilled rows, grass, split-rail fencing, trees
      "derived/farm-trees.png", // the tree line a camp is pitched under
    ],
    notes:
      "UNBLOCKED. The gap this carried — no period tents, artillery or earthworks anywhere in the " +
      "library — was closed by commissioning `derived/civil-war-works.png`, six objects generated " +
      "for Richmond's City Edge margin and its ward. A whole encampment map would want more than " +
      "six: a second tent silhouette so a camp street is not one roof repeated, a cook fire, and a " +
      "stand of arms. Those are extensions of an established sheet now, not a blocker.",
  },
  {
    id: "p5-courthouse-interior",
    period: 5,
    status: "planned",
    intent: "A courtroom — for a trial, hearing, or legal-argument case.",
    sheets: [
      "Wild West/tile-B-11.png", // judge's bench, scales of justice, courtroom desks
      "19th Century European City/tile-B-04.png", // parquet, panelled walls, bookcases
    ],
    notes:
      "Wild West's courtroom furniture is the pack's most transferable content and works well " +
      "before Period 5 too — it is the obvious source for any legal scene in Periods 3-6.",
  },

  // ---------------------------------------------------------------------------- Period 6
  {
    id: "p6-industrial-city",
    period: 6,
    status: "planned",
    intent: "A Gilded Age industrial city street.",
    sheets: [
      "19th Century European City/tile-B-05.png", // brick, cobble, flagstone, gas lamps
      "19th Century European City/tile-B-01.png", // row houses, town hall, churches
      "Steampunk/3.png", // brick industrial frontage, steam locomotive
      "Factory/1.png", // factory shell, asphalt, concrete
    ],
  },
  {
    id: "p6-frontier-town",
    period: 6,
    status: "planned",
    intent: "A western town on the frontier.",
    sheets: [
      "Wild West/tile-B-02.png", // town frontages, dirt street, boardwalk
      "Wild West/tile-B-06.png", // barber, pharmacy, stagecoach station
      "Wild West/tile-B-03.png", // sheriff's office, bank interior
    ],
  },
  {
    id: "p6-railroad",
    period: 6,
    status: "planned",
    intent: "The transcontinental railroad.",
    sheets: [
      "Wild West/tile-B-04.png", // track pieces, station, water towers — the only rail art
      "Wild West/tile-B-08.png", // trackside structures
      "farm/6.png", // trees and terrain
    ],
  },
  {
    id: "p6-homestead",
    period: 6,
    status: "planned",
    intent: "A Homestead Act claim on the plains.",
    sheets: [
      "Wild West/tile-B-08.png", // log cabins, barns, corrals
      "farm/7.png", // farmsteads, silos, American farm windmills
      "farm/6.png", // grass, tilled rows, split-rail fencing
    ],
  },

  // ---------------------------------------------------------------------------- Period 7
  {
    id: "p7-immigrant-port",
    period: 7,
    status: "planned",
    intent: "Arrival: an immigration reception hall and the wharf outside it.",
    sheets: [
      "19th Centruy European Dock/tile-B-06.png", // water, quay, decking
      "19th Centruy European Dock/tile-B-02.png", // warehouses, piers
      "19th Century European City/tile-B-04.png", // hall interior: benches, floor, walls
      "WWI Fleet/tile-B-01.png", // steamship interior (riveted steel is correct here)
    ],
  },
  {
    id: "p7-tenement-street",
    period: 7,
    status: "planned",
    intent: "A crowded urban tenement block.",
    sheets: [
      "19th Century European City/tile-B-01.png", // row-house terraces
      "19th Century European City/tile-B-05.png", // street surfaces, gas lamps
      "farm/5.png", // pushcart market stalls
    ],
    notes:
      "farm/5.png's awning stalls stand in for pushcart vendors; avoid its brightest awning " +
      "colourways.",
  },
  {
    id: "p7-wwi-front",
    period: 7,
    status: "planned",
    intent: "The Western Front.",
    sheets: [
      "WWI Military Equipment/tile-B-01.png",
      "war ruins/20.png", // cracked ground, rubble, ruined masonry
    ],
    notes:
      "Thin. There is no trench, duckboard or earthwork art in the library — only vehicles and " +
      "generic ruins. Build a rear-area or ruined-village scene rather than a trench line, or " +
      "commission art.",
  },
  //
  // The three entries below were filed under Period 8 until Phase 81. They are all 1929-1945,
  // which is Period 7 (1890-1945) — Period 8 begins in 1945. The `pN-` prefix in each id was
  // wrong with them. Nothing referenced these ids outside this file, so both were corrected
  // together rather than leaving the prefix disagreeing with the field.
  //
  {
    id: "p7-depression-street",
    period: 7,
    status: "planned",
    intent: "A Depression-era street: shuttered shops, breadline, relief office.",
    sheets: [
      "19th Century European City/tile-B-01.png", // building frontages
      "19th Century European City/tile-B-05.png", // street surfaces
      "war ruins/20.png", // cracked pavement and decay
    ],
    gap: "streetscape.midCentury",
    notes:
      "Partial gap. The result reads late-19th-century rather than 1930s. Acceptable stand-in; " +
      "strictly exclude war ruins' modern cars and graffiti tiles.",
  },
  {
    id: "p7-wwii-europe-ruins",
    period: 7,
    status: "planned",
    intent: "A bombed European street.",
    sheets: [
      "war ruins/20.png", // rubble, ruined masonry, cracked ground
      "war ruins/25.png", // collapsed brick walls, chimney stubs, utility poles
    ],
    notes:
      "The one setting `war ruins` genuinely fits, once its modern vehicles, graffiti, wheelie " +
      "bins and playground equipment are excluded.",
  },
  {
    id: "p7-war-factory",
    period: 7,
    status: "planned",
    intent: "Wartime industrial mobilisation.",
    sheets: [
      "Factory/1.png", // factory shell, loading bays, asphalt
      "Factory/3.png", // pipework, smokestacks
      "Construction/2.png", // era-agnostic material piles
    ],
    notes: "Exclude Factory/2.png and /5.png — robot arms and CNC machinery are Period 9.",
  },

  // ---------------------------------------------------------------------------- Period 8
  //
  // 1945-1980: the Cold War, civil rights, Vietnam, the Great Society. Phase 81 found this the
  // library's genuinely under-served period, not Period 7 — the three entries that used to sit
  // here were all pre-1945 and moved up, and `p8-suburb` came down from Period 9. The
  // nine-period coverage assertion in tile-palettes.test.js passed throughout, because it counts
  // periods rather than reading what the entries depict.
  //
  {
    id: "p8-suburb",
    period: 8,
    status: "planned",
    intent: "Postwar suburbia.",
    sheets: [
      "Highway Rest Area/tile-B-01.png", // asphalt, sidewalk, driveways
      "Modern Park/tile-B-05.png", // trees and planting
      "Living room/1.png", // domestic interior
    ],
    gap: "streetscape.midCentury",
    notes:
      "Reads contemporary, not 1950s. Flagged, acceptable. Was `p9-suburb` until Phase 81; " +
      "postwar suburbia is 1945-1980, and the covenants, FHA appraisals and GI Bill files that " +
      "make it a documentary-rich map are all Period 8.",
  },
  {
    id: "p8-campus",
    period: 8,
    status: "planned",
    intent: "A school or university campus.",
    sheets: [
      "University/tile-B-04.png", // campus exteriors, sports fields
      "University/tile-B-05.png", // classroom furniture, chalkboards
      "Modern Park/tile-B-05.png",
    ],
    notes:
      "Was `p9-campus` until Phase 81. Assigned to Period 8 because the campus is one of that " +
      "period's defining settings — sit-ins, SNCC, the Free Speech Movement, Kent State — and " +
      "because Period 8 needed the coverage. The sheets are era-agnostic and serve a Period 9 " +
      "campus unchanged, so this is an assignment rather than an exclusion.",
  },

  // ---------------------------------------------------------------------------- Period 9
  //
  // 1980-present. Deliberately thin: it is the CED's shortest period, and its settings overlap
  // Period 8's heavily — `p8-campus` and `p8-suburb` both serve a present-day map with no sheet
  // changes. Add here only when a Period 9 map needs something the two above cannot dress.
  //
  {
    id: "p9-modern-city",
    period: 9,
    status: "planned",
    intent: "A present-day city street.",
    sheets: [
      "Highway Rest Area/tile-B-01.png",
      "Highway Rest Area/tile-B-04.png", // street furniture, US signage
      "Highway Rest Area/tile-B-06.png", // vehicles
      "Modern Park/tile-B-01.png",
    ],
  },

  // ---------------------------------------------------------------------------- Meridian
  //
  // This entry replaced `institute-archive-restyle`, which named these same four sheets as a
  // candidate restyle of *Chronicle's* hub. Phase 79 reassigned them — see decision log 0062 and
  // docs/art/MERIDIAN-VISUAL-IDENTITY.md §2.
  //
  // The reason is worth keeping next to the sheet list, because the sheets on their own read like
  // an obvious Chronicle upgrade and someone will propose it again. Meridian is the rival
  // institute, and the art has to separate the two before any dialogue does. The separation the
  // concept plates settled on is resources and upkeep, not geometry: Chronicle converted an old
  // building and keeps mending it (the Medieval Tavern family — rustic wood, torch sconces,
  // stone), Meridian built theirs and can afford to (dark panelling, parquet, glazed cases,
  // gaslight). Spending these four sheets on Chronicle's hub would erase that distinction the
  // moment Meridian's first room ships, and Chronicle would have nothing left to be told apart by.
  //
  // So Chronicle keeping its tavern warmth is the point now, not the compromise the retired entry
  // recorded it as. Do not re-propose the hub restyle without re-opening 0062.
  {
    id: "meridian-interior",
    period: null,
    status: "candidate",
    intent:
      "A Meridian Institute interior: the rival organisation's own space, purpose-built and " +
      "recently, against Chronicle's converted-and-mended one.",
    sheets: [
      "office/3.png", // double-sided archive shelving stacks, ranked
      "office/4.png", // dark wood-panelled walls
      "19th Century European City/tile-B-04.png", // parquet and inlaid floors, bookcases, writing desk, globe
      "Steampunk/5.png", // card-catalogue cabinets, globes, brass telescopes, gas lamps
    ],
    gap: "prop.meridian.anchorRing",
    notes:
      "CANDIDATE, not scheduled. The four sheets cover every environment element in the concept " +
      "plates except three props, and all four are already CANONICAL in the tile catalog, so no " +
      "whitelist change is needed. `Steampunk` stays a prop quarry, never a base pack. " +
      "The registered gap is the anchor ring — nothing in 250 sheets is it, and it carries the " +
      "shared anchor-glass material that makes Meridian read as descended from Chronicle. Two " +
      "more props need commissioning but do not block a build: a circular map table larger than " +
      "Chronicle's 2x3 Navigation Table, and horizontal glass-topped chart cases (tile-B-04's " +
      "glazed cabinets are upright). See docs/art/MERIDIAN-ASSET-BRIEF.md §3 for sizes and " +
      "prompt guidance. Building the room is a separate decision with its own sign-off; naming " +
      "the tiles does not authorise doing it.",
  },
];

export default PLANNED_MAPS;
