// Palette for richmond-field.tmj (Unit 5's field map, "The Fractured Republic").
// Setting: Richmond, Virginia, 1864 — one city, one year, no time-shifting.
// Consumed by scripts/generate-richmond-tmj.js.
//
// Five decisions here were made against the art rather than from the plan, and each one changed
// what the map is.
//
// 1. **This city is not a ruined city, and `war ruins` is on the sheet list anyway.** Both halves
//    of that matter, and the second half is a correction to an earlier draft of this file.
//
//    Richmond does not burn until 3 April 1865, in the evacuation fire its own government sets. In
//    1864 it is intact, overcrowded and overbuilt — its problem is that there is too much of it
//    standing and too many people in it. A shelled, rubble-strewn 1864 Richmond would be the same
//    class of error as staging the Bread Riot live, which was April 1863. So there is no bomb
//    damage anywhere on this map and there is nothing burnt inside the city limits.
//
//    But "no bomb damage" is not the same claim as "no ruins," and reading the pack properly is
//    what separated them. The catalog had `war ruins` sampled at 4 sheets of 27 and written off as
//    contemporary urban decay — concrete blocks, modern cars, graffiti — which sheets 1, 10, 20 and
//    25 genuinely are. Sheets 21 and 22 were among the twenty-one nobody had opened, and they are
//    timber, brick and stone cut-outs with nothing datable in them. Nine objects come off those two
//    sheets through `derived/richmond-ruins.png`, and every one of them is placed where the record
//    puts it rather than where a ruin would look good:
//
//      - The **cleared field of fire** at the north-east margin. The intermediate defence line
//        needed open ground in front of it, so the houses standing there came down and the woodlots
//        with them. A pulled-down house is not a shelled one — the frame is dismantled and lying,
//        the walls are stubs, and the brick and timber are stacked beside it, because both were
//        scarce enough to be worth carrying away. That is what `ruinTimberHouse`, `brickSalvage`,
//        `timberStack` and the two dead trees are doing up there, and it is the one place on the
//        map where the war has physically taken buildings away.
//      - **Brown's Island**, in the falls below Tredegar: the Confederate States Laboratory, wrecked
//        by the cartridge explosion of 13 March 1863. Roughly forty-five workers died, most of them
//        girls and young women, several as young as nine, many Irish immigrants from the Bottom.
//        `ruinStoneShell` is that building. It stands across water and cannot be reached, which is
//        the point: the player sees it from the quay and has to ask.
//      - **Firewood.** `cordwood` is not a ruin and is the most loaded object of the nine. Wood
//        passed $30 a cord in the winter of 1863-64 against a pre-war $4, and Richmond families
//        burned furniture and fence rails. A guarded stack beside the relief society says more about
//        the civilian city than rubble ever would.
//
//    What otherwise reads as war here is what the war actually put in the streets: impressment,
//    ration queues, a price board written over, ordnance stacked under guard, a hospital on the hill.
//
// 2. **The falls of the James are painted on the ground layer, not stamped over the water.** The
//    Dock pack's rocks at rows 6-7 carry their own water, painted in the same blue as this map's
//    river, so on `structures` they would lay a square of slightly different blue over the river —
//    the exact defect map-builder.js's `groundRect` doc warns about. On the ground they replace the
//    water and the seam falls where rock meets river, which is what a fall line looks like. This is
//    Canal Crossroads' lock decision run in the other direction, and the reason it is worth the
//    trouble is that the fall line is why Richmond is where it is: the head of navigation, the water
//    power that built Tredegar, and the reason the canal exists at all.
//
// 3. **`19th Century European City` fits this map better than any other it has dressed.** Canal
//    Crossroads flagged its mansard roofs and railed brick terraces as Second Empire and twenty
//    years late for 1845. For 1864 they are contemporary, and Richmond's real fabric — brick
//    commercial rows on Main and Cary, stuccoed government buildings, terraced houses climbing
//    Shockoe Hill — is close enough that the substitution barely needs flagging. What still needs
//    flagging is the Capitol, below.
//
// 4. **The Capitol is a registered substitution and the fit is closer than the catalog said.**
//    Jefferson's Virginia State Capitol is a Roman temple, and the library has no neoclassical
//    public building. `tile-B-01 (4,4)` is a Victorian civic block with a clock tower — but its base
//    carries a real columned pedimented portico, which is the Capitol's one defining feature and the
//    thing a student is meant to recognise. Registered in art-and-map-style-guide.md rather than
//    commissioned; the money went to the tents and the earthworks instead, which nothing in 250
//    sheets could stand in for at all.
//
// 5. **`Steampunk` is still a prop quarry, and this map takes three things from sheet 3.** The two
//    brick industrial frontages are Tredegar's rolling mill and its ordnance shop; the copper boiler
//    with its smokestack is the furnace. The locomotive at (14,6) is the depot's. Every gear,
//    airship, mecha, gauge and brass fitting on that sheet stays where it is — the same discipline
//    Canal Crossroads applied to sheet 1, from which this map takes exactly one object, the barge.
//
// No Confederate battle flag appears anywhere on this map, in any tile, by design. Nothing in the
// library draws one; nothing here would use it if it did. See docs/decision-log for the register
// rules governing Shockoe Bottom, Tredegar and the dock.

import {
  CanalWorks,
  CivilWarWorks,
  FarmBuildings,
  FarmTrees,
  RichmondRuins,
} from "../derived-objects.coords.js";
import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "richmond-field",
  period: 5,
  status: "live",
  map: "apps/web/src/content/maps/richmond-field.tmj",
  // Two made surfaces. Packed earth is what the spur router paints and what the yards and lanes are;
  // cobble is Broad Street, Lower Street, both bluff descents and the dock quay — the surfaces the
  // city actually paved, which is exactly the surfaces its money and its freight moved over.
  //
  // The plank decking of the three crossings is deliberately NOT in this list, unlike at Canal
  // Crossroads. It is not ground on this map: see the note on `plankDeck` below, and the generator's
  // crossing block. `tests/unit/map-path-network.test.js` reads road materials off the ground layer,
  // so naming a material that never lands there would be a claim the map does not keep.
  //
  // The FIRST entry is what new road gets painted in.
  road: ["dirt", "cobble"],

  // Ordered — reshuffling changes every GID in the committed .tmj.
  // Seven of the nine are already bundled by Canal Crossroads and Philadelphia and cost nothing
  // here. The two additions are Steampunk/3 (Tredegar and the depot) and the commissioned
  // derived/civil-war-works.png, which was generated for this map and has no other consumer yet.
  sheets: [
    { path: "Medieval Fantasy Town/2.png", name: "medieval-fantasy-town-2" },
    { path: "19th Centruy European Dock/tile-B-06.png", name: "european-dock-b06" },
    { path: "19th Century European City/tile-B-01.png", name: "european-city-b01" },
    { path: "Steampunk/1.png", name: "steampunk-1" },
    { path: "Steampunk/3.png", name: "steampunk-3" },
    { path: "derived/farm-trees.png", name: "derived-farm-trees" },
    { path: "derived/farm-buildings.png", name: "derived-farm-buildings" },
    { path: "derived/canal-works.png", name: "derived-canal-works" },
    // Appended last, deliberately: firstgid is assigned in this order, so a new sheet anywhere
    // earlier would renumber every GID already committed to richmond-field.tmj.
    { path: "derived/civil-war-works.png", name: "derived-civil-war-works" },
    { path: "derived/richmond-ruins.png", name: "derived-richmond-ruins" },
  ],

  tiles: {
    // --- ground: authored terrain blocks -------------------------------------------------------
    /**
     * The upper city's open ground: Capitol Square, the churchyards, the hospital hill. Richmond's
     * high ground was genuinely green — Capitol Square was a public park with a fence around it —
     * and it is what makes the drop over the bluff read at a glance, because nothing below the wall
     * is green.
     */
    grass: { ...CANONICAL["grass.colonial.plaza"], h: 2, w: 2 },
    /** Every spur the router lays, plus the yards behind the buildings. */
    dirt: { ...CANONICAL["path.packed.earth"], h: 2, w: 2 },
    /**
     * Broad Street, Lower Street, both bluff descents and the dock quay.
     *
     * Philadelphia's paving rather than the Dock pack's, for the reason Canal Crossroads recorded:
     * this block is 0% transparent edge to edge, where `stone.dock.cobble` carries a fully clear top
     * pixel row, and on the ground layer a transparent pixel is a hole through to the page.
     */
    cobble: { ...CANONICAL["stone.colonial.cobble"], h: 2, w: 2 },
    /**
     * The bottom's open ground — Shockoe's yards, Tredegar's cinder, the ground between the
     * warehouses. The same pack's warm cobble, two blocks along from the grey: a browner, khaki
     * stone that reads as paved industrial district against the blue-grey the streets are laid in,
     * so a street still reads as a street through the middle of it.
     *
     * This was the Dock pack's `path.dock.dirt` for one draft, and the preview render is what
     * killed it: that tile carries a transparent right and bottom edge, so on the ground layer it
     * drew a white grid line between every cell of the lower half of the city. Same defect the
     * palette header of Canal Crossroads records for `stone.dock.cobble`, and the same conclusion —
     * **ground comes from `Medieval Fantasy Town/2`, whose four terrain blocks are the only ones in
     * the library verified 0% transparent edge to edge.** Grass, grey cobble, warm cobble and packed
     * earth is the whole surface vocabulary of this map, and all four are on that one sheet.
     */
    lot: tile("Medieval Fantasy Town/2.png", 0, 2, { h: 2, w: 2 }),
    /** The James. Deep, and the Atlantic family, which is right for a tidal river at the fall line. */
    water: tile("19th Centruy European Dock/tile-B-06.png", 0, 0, { h: 2, w: 2 }),
    /**
     * The James River and Kanawha Canal — the same pack's inshore water, a shade lighter.
     *
     * Mixing two water families on one map is the mistake Canal Crossroads' header warns about, and
     * this is not that: these are two blocks of one family, and the canal drew its water from the
     * river a few miles upstream. A canal beside a river ought to read as the same water held still.
     */
    waterCanal: tile("19th Centruy European Dock/tile-B-06.png", 2, 0, { h: 2, w: 2 }),
    /**
     * The falls: a whole 2x8 reach of rock standing in broken water, laid end to end across the west
     * of the river. See note 2 in the header for why it is ground rather than structures.
     *
     * Taken as one strip rather than as three separate boulders, and that is the correction the
     * preview render forced. Every cell of rows 6-7 is fully opaque with its own water painted in,
     * and that water is about 7% lighter than any flat water block on the sheet — so three 2x2
     * boulders dropped into the river drew three visible lighter rectangles around themselves, which
     * is exactly the "different water in between the water" that map-builder.js's `groundRect` doc
     * warns about. Laid as a continuous reach the seam stops being three rectangles and becomes one
     * line, running where the water genuinely changes: this is the fall line, the head of
     * navigation, and the reason there is a city here at all. Broken shallows above it and smooth
     * tidewater below is what the James actually does.
     */
    fallsReach: tile("19th Centruy European Dock/tile-B-06.png", 6, 8, { h: 2, w: 8 }),
    /**
     * Plank decking on pilings: Mayo's Bridge, and the two canal footbridges. Mayo's was a timber
     * toll bridge on stone piers, which is what this draws.
     *
     * **Structures, not ground** — the reverse of Canal Crossroads' crossing, and measured rather
     * than assumed. That map's decking is opaque plank over its own pack's blue, so on the ground it
     * replaces the water and the seam vanishes. This one is 30% transparent: a platform on pilings
     * drawn as a cut-out with alpha above and below it, which on the ground layer punches a third of
     * a hole through to the page along the whole length of every crossing. Stamped `decor` over
     * water instead, the alpha shows the channel, which is what the edge of a bridge deck looks like.
     */
    plankDeck: { ...CANONICAL["wood.dock.deck"], h: 2, w: 2 },

    // --- the bluff, and the water's edges ---------------------------------------------------------
    /**
     * Dressed ashlar with a coping course. This map's hardest-working tile: it is the bluff's
     * retaining wall along row 17, and it is the coping on both banks of the canal and along the
     * quay.
     *
     * Goes on `structures`, never on the ground — it is 11% transparent with four fully clear pixel
     * rows along its top, a wall face drawn as a cut-out. Canal Crossroads put it on the ground once
     * and drew a black hairline down a hundred tiles of bank.
     */
    ashlarWall: tile("19th Centruy European Dock/tile-B-06.png", 4, 0, { h: 1, w: 4 }),
    /** A flight of stone steps with a handrail — the foot of each bluff descent. */
    stoneSteps: tile("19th Centruy European Dock/tile-B-06.png", 8, 6, { h: 2, w: 2 }),

    // --- Capitol & Government ---------------------------------------------------------------------
    /**
     * The Capitol. A columned pedimented portico under a clock tower — see note 4 in the header,
     * and the registered substitution in art-and-map-style-guide.md. Stands on Capitol Square,
     * which is the map's only genuinely open green.
     */
    capitol: tile("19th Century European City/tile-B-01.png", 4, 4, { h: 4, w: 4 }),
    /**
     * A stone-fronted office with a pedimented doorway and quoins. Richmond's departments worked out
     * of rented commercial buildings — the Treasury in the Custom House, the War Department in
     * Mechanics' Hall — so an ordinary office is the historically correct silhouette for a
     * government building here, not a palace.
     */
    officeStone: tile("19th Century European City/tile-B-01.png", 2, 0, { h: 2, w: 2 }),
    /** Brownstone with a plain door — the second department, and the provost marshal's. */
    officeBrick: tile("19th Century European City/tile-B-01.png", 2, 2, { h: 2, w: 2 }),
    /** Mansarded stone, the grandest house on the hill — requisitioned, like most of them were. */
    mansionStone: tile("19th Century European City/tile-B-01.png", 0, 0, { h: 2, w: 2 }),

    // --- Market & Civilian ------------------------------------------------------------------------
    church: tile("19th Century European City/tile-B-01.png", 4, 8, { h: 4, w: 2 }),
    /** A second, smaller church — Richmond had a great many, and they ran the relief societies. */
    chapel: tile("19th Century European City/tile-B-01.png", 6, 12, { h: 2, w: 2 }),
    /** Four joined shopfronts under one roofline. The market's frontage, in one stamp. */
    commercialTerrace: tile("19th Century European City/tile-B-01.png", 10, 4, { h: 2, w: 4 }),
    /** A brick terrace with front railings — the boardinghouses the refugees crowded into. */
    terraceBrick: tile("19th Century European City/tile-B-01.png", 8, 12, { h: 2, w: 4 }),
    /** A longer terrace, chimneys and all, for the blocks climbing the hill. */
    terraceLong: tile("19th Century European City/tile-B-01.png", 10, 8, { h: 2, w: 4 }),
    townhouseBrick: tile("19th Century European City/tile-B-01.png", 10, 0, { h: 2, w: 2 }),
    townhouseBrickAlt: tile("19th Century European City/tile-B-01.png", 10, 2, { h: 2, w: 2 }),
    /** Awninged, with goods stacked outside — the shopkeeper's, and the price board stands at it. */
    storeAwning: tile("19th Century European City/tile-B-01.png", 8, 8, { h: 2, w: 2 }),
    provisionStore: tile("19th Century European City/tile-B-01.png", 8, 10, { h: 2, w: 2 }),
    /** The barber's, and the free Black tradesmen's shopfront on the same row. */
    shopFront: tile("19th Century European City/tile-B-01.png", 0, 6, { h: 2, w: 2 }),

    // --- Shockoe Bottom ---------------------------------------------------------------------------
    // The register rule for this district is in the decision log and it governs the art too: nothing
    // here is theatrical. A slave-trading district looked like a commercial one, because it was one.
    /** An arched carriage entry beside a shopfront — a warehouse's loading door. */
    warehouseArch: tile("19th Century European City/tile-B-01.png", 2, 8, { h: 2, w: 2 }),
    /** Plain brick storehouses. Four of these front Cary Street, which is what Shockoe was. */
    warehouse: FarmBuildings.warehouse,
    grainStore: FarmBuildings.barn,
    /**
     * The trader's counting room: a brick commercial building with a plain door, no different from
     * the forwarding merchant two doors down. That likeness is the point, and it is why this
     * district gets an interior in place of a prop — the horror of it is that it was paperwork.
     */
    countingRoom: tile("19th Century European City/tile-B-01.png", 2, 4, { h: 2, w: 2 }),

    // --- Tredegar Iron Works ----------------------------------------------------------------------
    // Tredegar is three big sheds, a stack and an office at the gate — which is what a foundry is.
    // `Steampunk/3`'s two brick-and-timber frontages were cast as the rolling mill and the ordnance
    // shop for one draft, and the preview render is what corrected it: (12,8) is a gilded arcade with
    // brass columns and plate-glass arched windows, and (12,12) is a stone-and-timber inn. Both are
    // handsome and neither is an ironworks. The dark timber sheds already in `derived/` read as
    // foundry buildings without argument, so this map takes exactly two objects off that sheet —
    // the furnace and the locomotive — and leaves the buildings on it.
    /** A copper boiler under a tall smokestack. Tredegar's furnace, and the map's only chimney. */
    furnaceStack: tile("Steampunk/3.png", 8, 14, { h: 3, w: 2 }),

    // --- Hospital, and the depot in the bottom ------------------------------------------------------
    /**
     * A Chimborazo ward. Whitewashed frame with dormers and a stepped porch, which is what the real
     * ones were — one hundred and fifty of them on a hill, of which this map draws one and says so.
     */
    hospitalWard: FarmBuildings.meetinghouse,
    /**
     * The depot's locomotive.
     *
     * It stands in Shockoe Valley at the foot of the east bluff descent, not up on the hospital hill
     * where the plan's district sketch put it, and that is a correction rather than a convenience:
     * Richmond's depots were down in the bottom — the Virginia Central at Broad and 16th, the
     * Richmond & Petersburg across the river — because that is where the grades and the freight
     * were. A locomotive parked next to a hospital on a bluff would be the one thing on this map a
     * Richmonder would not recognise.
     */
    locomotive: tile("Steampunk/3.png", 14, 6, { h: 2, w: 2 }),
    depotOffice: FarmBuildings.houseBrown,
    /** The wards' overflow, and the refugee camp in the churchyard. Same tent, two meanings. */
    wallTent: CivilWarWorks.wallTent,
    /** Non-graphic by design: an empty cot outside a ward door, waiting. Never an occupied one. */
    hospitalCot: CivilWarWorks.hospitalCot,

    // --- City Edge: the defensive works at the north-east margin ------------------------------------
    // An edge treatment, not a seventh quarter — see the plan's correction 1. Richmond's real works
    // were miles out; this is the last checkpoint on the road, which is where a Chronicler would meet
    // them.
    rampart: CivilWarWorks.rampart,
    abatis: CivilWarWorks.abatis,
    fieldGun: CivilWarWorks.fieldGun,
    supplyWagon: CivilWarWorks.supplyWagon,
    checkpointHut: FarmBuildings.houseBrown,
    /** A chain slung between iron posts — the checkpoint's bar, and the ordnance yard's line. */
    chainPosts: tile("19th Centruy European Dock/tile-B-06.png", 14, 10, { h: 1, w: 2 }),
    /**
     * A house taken down, not knocked down. Frame dismantled and stacked askew, roof boards lying
     * where they were pulled, one wall still standing to about waist height.
     *
     * The distinction is the whole reason ruins appear on an 1864 map at all — see header note 1.
     * These stand only outside the line, on the ground cleared for a field of fire, and the salvage
     * stacked beside them is why: brick and seasoned timber in Richmond that winter were worth
     * carting into the city, and the army was pulling houses down anyway.
     */
    ruinTimberHouse: RichmondRuins.ruinTimberHouse,
    /**
     * A roofless masonry shell, two walls standing, the render gone off the stone.
     *
     * Stamped exactly once, on Brown's Island in the falls: the Confederate States Laboratory,
     * wrecked by the cartridge explosion of 13 March 1863. It is `decor` on water and stands where
     * no route can reach it, which is deliberate — this is a thing the player looks at across the
     * river from the quay, not a thing they walk up to. See header note 1 for who died in it.
     */
    ruinStoneShell: RichmondRuins.ruinStoneShell,
    /** Salvaged brick, stacked square for carting. Bricks were scarcer than the ground they lay on. */
    brickSalvage: RichmondRuins.brickSalvage,
    /** Broken stone and a splintered beam — what a chimney stack comes down as. */
    rubbleStone: RichmondRuins.rubbleStone,
    /** Sawn boards off a pulled-down house, stacked flat. Bound for the works, or for a stove. */
    timberStack: RichmondRuins.timberStack,
    /**
     * Cut cordwood, stacked. Not a ruin, and the most historically loaded object on the map:
     * firewood passed $30 a cord in the winter of 1863-64 against a pre-war $4, and Richmond
     * families were burning furniture and fence rails. It stands under guard by the relief society,
     * which is where a stack of it would have had to stand.
     */
    cordwood: RichmondRuins.cordwood,
    /** Lopped bare. The woodlots outside the line went for fuel, gabions and field of fire alike. */
    deadTree: RichmondRuins.deadTree,
    deadTreeSmall: RichmondRuins.deadTreeSmall,

    // --- the river and the canal's working plant ---------------------------------------------------
    /** Flat-decked cargo barge with a deck derrick. Moored, so `decor`: nothing to collide with. */
    cargoBarge: tile("Steampunk/1.png", 14, 4, { h: 2, w: 4 }),
    dockCrane: tile("19th Centruy European Dock/tile-B-06.png", 8, 4, { h: 2, w: 2 }),
    bollard: tile("19th Centruy European Dock/tile-B-06.png", 8, 0),
    bollardRoped: tile("19th Centruy European Dock/tile-B-06.png", 9, 1),
    lampPost: tile("19th Centruy European Dock/tile-B-06.png", 8, 12, { h: 2, w: 1 }),
    rowboat: tile("19th Centruy European Dock/tile-B-06.png", 12, 2, { h: 2, w: 2 }),

    // --- boards, and the notices on them -----------------------------------------------------------
    /**
     * Nothing but overlapping handbills. Commissioned for Canal Crossroads' Reform Square, and it
     * carries this map's price board for the same reason it carried that one: the record standing on
     * it is *layered*, notices pasted over notices in the same week by people arguing. In Richmond
     * that is a price written over three times in a month, a ration notice, a call for substitutes
     * and a list of deserters, and there is no tidier way to show a currency failing.
     * [derived, 1 col x 2 rows]
     */
    noticeBoard: { ...CanalWorks.noticeBoard },

    // --- street furniture and cargo -----------------------------------------------------------------
    fountain: tile("19th Century European City/tile-B-01.png", 14, 8, { h: 2, w: 2 }),
    bench: tile("19th Century European City/tile-B-01.png", 13, 8),
    benchAlt: tile("19th Century European City/tile-B-01.png", 13, 9),
    marketBarrow: tile("19th Century European City/tile-B-01.png", 12, 8),
    draughtHorse: tile("19th Century European City/tile-B-01.png", 12, 9),
    freightWagon: tile("19th Century European City/tile-B-01.png", 13, 6, { h: 1, w: 2 }),
    townWell: tile("Medieval Fantasy Town/2.png", 6, 8, { h: 2, w: 2 }),
    signpost: tile("Medieval Fantasy Town/2.png", 8, 14, { h: 2, w: 1 }),

    crate: tile("19th Centruy European Dock/tile-B-06.png", 10, 0),
    crateAlt: tile("19th Centruy European Dock/tile-B-06.png", 11, 1),
    barrel: tile("19th Centruy European Dock/tile-B-06.png", 10, 4),
    barrelAlt: tile("19th Centruy European Dock/tile-B-06.png", 11, 5),
    grainSack: tile("19th Centruy European Dock/tile-B-06.png", 10, 6),
    sackPile: tile("19th Centruy European Dock/tile-B-06.png", 10, 9),
    ropeCoil: tile("19th Centruy European Dock/tile-B-06.png", 11, 8),
    handCart: tile("19th Centruy European Dock/tile-B-06.png", 11, 13),
    /** Bar iron, stacked. Tredegar's product, and the ordnance yard's. */
    plankStack: tile("19th Centruy European Dock/tile-B-06.png", 12, 0, { h: 2, w: 2 }),

    // --- planting -----------------------------------------------------------------------------------
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
