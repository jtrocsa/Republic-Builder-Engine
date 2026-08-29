// Which sprites get repacked onto a clean 48px grid, and where they come from.
//
// A sprite belongs here when its art in the source pack crosses tile boundaries, so no whole-tile
// rect can draw it without either clipping it or catching its neighbour. `farm/6.png`'s tree row
// is the clearest case: the oak's crown runs 6px into the maple's first column, the birch's rect
// picks up 19px of the apple tree, and the apple tree's own left edge falls outside the rect it
// was given. That is why the shipped maps showed trees cut down the middle with a slice of a
// different, fruiting tree floating beside them.
//
// Each object is found by flood-filling the connected art from a seed cell. If two sprites
// physically touch, that fill runs past `limit` and the build fails with a message telling you to
// pin the sprite with an explicit `box: [x1, y1, x2, y2]` in source pixels instead — read one off
// `npm run assets:label -- "<Pack>/<sheet>.png"`.
//
// Regenerate with `npm run assets:pack-objects`; check with `--check` in CI.

export const DERIVED_OBJECTS = [
  {
    // The library's best deciduous and orchard trees, and the only ones with North American
    // vernacular species. Used by Riverbend (Unit 2) and Philadelphia (Unit 3).
    from: "farm/6.png",
    out: "farm-trees.png",
    objects: [
      { name: "treeOak", seed: [1, 1], limit: { height: 4, width: 4 } },
      { name: "treeMaple", seed: [1, 4], limit: { height: 4, width: 4 } },
      { name: "treePine", seed: [1, 6], limit: { height: 4, width: 3 } },
      { name: "treeBirch", seed: [1, 8], limit: { height: 4, width: 3 } },
      { name: "treeApple", seed: [1, 10], limit: { height: 4, width: 4 } },
      { name: "treeOrange", seed: [1, 13], limit: { height: 4, width: 4 } },
      { name: "treeCherry", seed: [1, 15], limit: { height: 4, width: 3 } },
      // Smaller orchard and ornamental stock, for hedgerows and dooryards.
      { name: "saplingApple", seed: [4, 0], limit: { height: 3, width: 3 } },
      { name: "saplingBlossom", seed: [4, 3], limit: { height: 3, width: 3 } },
      { name: "saplingLilac", seed: [4, 6], limit: { height: 3, width: 3 } },
      { name: "bushRose", seed: [5, 0], limit: { height: 2, width: 2 } },
      { name: "bushBerry", seed: [5, 1], limit: { height: 2, width: 2 } },
      { name: "bushFlowering", seed: [5, 4], limit: { height: 2, width: 2 } },
    ],
  },
  {
    // Clapboard housing and outbuildings — the strongest rural North American vernacular in the
    // library, and the reason Riverbend and Philadelphia stopped borrowing fantasy-town
    // silhouettes. The sheet packs them tightly enough that several overlap.
    from: "farm/7.png",
    out: "farm-buildings.png",
    objects: [
      { name: "houseRed", seed: [3, 3], limit: { height: 4, width: 4 } },
      { name: "houseYellow", seed: [3, 5], limit: { height: 4, width: 4 } },
      { name: "houseBlue", seed: [7, 7], limit: { height: 4, width: 4 } },
      { name: "houseBrown", seed: [5, 5], limit: { height: 4, width: 4 } },
      { name: "houseCream", seed: [1, 5], limit: { height: 4, width: 4 } },
      { name: "meetinghouse", seed: [2, 13], limit: { height: 5, width: 5 } },
      { name: "barn", seed: [5, 9], limit: { height: 5, width: 5 } },
      // The grey painted-clapboard block. Philadelphia's civic buildings come from here rather
      // than from Medieval Fantasy Town's silhouettes: a two-storey sash-windowed clapboard
      // reads as a 1770s statehouse or counting house, where a half-timbered guild hall with a
      // baked-in fantasy sign never could. See decision log 0036.
      // Pinned, not seeded: this column of the sheet is one continuous painted mass — the grey
      // block's roof runs into the red barn above it, so a flood fill from anywhere inside it
      // swallows both and hits the sheet's right edge. Boxes read off the label render.
      { name: "statehouse", box: [578, 386, 764, 553] },
      { name: "townhouseGrey", box: [578, 571, 764, 768] },
      { name: "warehouse", seed: [1, 9], limit: { height: 5, width: 5 } },
    ],
  },
  {
    // The library's only churches. Both sit isolated on transparent background, unlike the rest
    // of this sheet — its taverns and guild halls carry readable fantasy signage and are barred
    // from Chronicle's maps entirely.
    from: "Medieval Fantasy Town/5.png",
    out: "town-civic.png",
    objects: [
      // Pinned: the two churches abut with a ~6px gutter, so a flood fill from either one runs
      // into the other. Boxes read off a column/row ink profile of the region.
      { name: "churchSteeple", box: [195, 384, 286, 576] },
      { name: "chapel", box: [293, 386, 380, 575] },
    ],
  },
  {
    // One sprite, and the only reason this spec exists is `scale`. The brass mariner's compass is
    // drawn 2x2 — 96px, about the height of the player — so as a floor prop it stood in the Main
    // Hall's main east-west aisle at roughly human size, which is both a collision the playtest
    // report flagged and a joke about the size of a compass. At 1x1 it is an instrument sitting on
    // the Navigation Table, which is where it belongs.
    from: "Island survival/5.png",
    out: "institute-artifacts.png",
    objects: [
      {
        name: "compassSmall",
        seed: [6, 8],
        limit: { height: 2, width: 2 },
        scale: { rows: 1, cols: 1 },
      },
    ],
  },
  {
    // The Institute's seating, and the first art in this repo that was made for it rather than
    // borrowed. The Medieval Tavern pack draws every 1x1 prop to fill its 48px tile whatever the
    // object is, so its stool is painted 45px tall — exactly the height of a character's standing
    // body, which is what the playtest screenshot circled. Nothing smaller exists to swap to: every
    // furniture cell on that sheet measures 42-48px.
    //
    // So these were generated to size instead. The canvas is what sets the scale — a stool drawn on
    // a 96x26 strip comes out 19px, a quarter-body, without anything being downscaled afterwards —
    // and the palette is forced from the Medieval Tavern stool they stand beside, so they belong to
    // the same room. See docs/decision-log/0045.
    //
    // Cut by explicit box rather than by seed: the source sheet is laid out by hand and the boxes
    // are the layout, so a flood fill would only be re-deriving what is already known.
    from: "Chronicle Institute/furnishings.png",
    out: "institute-furnishings.png",
    objects: [
      { name: "stool", box: [0, 8, 18, 27] },
      { name: "stoolAlt", box: [24, 8, 43, 27] },
      { name: "lowBench", box: [48, 14, 180, 27] },
    ],
  },
  {
    // Unit 4's commissioned props — the second batch of art made for this game rather than borrowed,
    // after the Institute's seating above. Every one of these is a measured library gap, not a
    // preference. What was actually searched for and not found, sheet by sheet:
    //
    //   press        the nearest thing anywhere is `19th Century European City/tile-B-04` (10,11),
    //                which is a writing desk with a quill on it
    //   typeCase     nothing in any pack is a compositor's case
    //   stove        every hearth in the library is a masonry fireplace; an 1845 shop is heated by
    //                a cast-iron box stove, and B-02 (8,14) — the first candidate — turned out to
    //                render as a small wall dresser
    //   paperStack   B-04 (12,6) was tried and reads unmistakably as stacked travelling luggage
    //   ropeBed      no bed exists in any pack. `Living room` is a modern kitchen pack and
    //                `Medieval Tavern` has none, which Phase 0 already recorded
    //   washTub      no laundry anywhere, and a boardinghouse ran on taking in washing
    //   noticeBoard  the outdoor square currently uses Medieval Fantasy Town (6,14), a fantasy
    //                quest board, for this map's one object-anchored record
    //
    // Scale is the canvas, exactly as with the Institute's seating — but read the other way round.
    // A hand press is drawn 102px against the cast's 45px body, which sounds like the stool mistake
    // inverted until you measure what it stands beside: this pack paints a 6ft wardrobe at ~90px and
    // a bookcase the same, so its furniture runs about 2x a body whatever its real height. A press
    // two tiles wide and three tall belongs to that family and would look shrunken at the true ratio.
    //
    // Cut by explicit box: reports/_review/compose-commission.mjs lays the generated objects out
    // bottom-aligned with an 8px gutter and prints these boxes, so the layout is known rather than
    // rediscovered by a flood fill.
    from: "Chronicle Commissions/canal-crossroads.png",
    out: "canal-works.png",
    objects: [
      { name: "press", box: [8, 0, 86, 102] },
      { name: "typeCase", box: [94, 35, 174, 102] },
      { name: "stove", box: [182, 26, 234, 102] },
      { name: "paperStack", box: [242, 41, 310, 102] },
      { name: "ropeBed", box: [318, 12, 374, 102] },
      { name: "washTub", box: [382, 17, 462, 102] },
      { name: "noticeBoard", box: [470, 24, 516, 102] },
    ],
  },
  {
    // Unit 5's commissioned props, and the one entry here that closes a gap the style guide had
    // carried since the library was first catalogued. `military.civilWar.camp` was registered
    // because the WWI packs are the wrong war by fifty years and `army`/`modern military` are wrong
    // by a century — Island survival's canvas tents were the only near-miss in 250 sheets and they
    // read as castaway shelters. That gap blocked `p5-civil-war-camp` outright. These six close it.
    //
    // What each one is for, on a map that is a city rather than a camp: the tent, the rampart and
    // the abatis are the City Edge margin treatment along Richmond's north-east road; the field gun
    // and the supply wagon are the ordnance and the depot; the cot furnishes the Chimborazo ward.
    //
    // **The chevaux-de-frise was commissioned and dropped, after five rolls.** Three of them came
    // back a picket fence and one a palisade: the model reads "a beam with sharpened stakes driven
    // through it" as fencing, however the request is phrased, and a fence on a fortification line is
    // worse than no object at all. The rampart and the abatis already carry the edge, and of the
    // three obstacles the chevaux-de-frise is the one that reads least legibly at 48px anyway. If it
    // is ever wanted, generate it as a *shape* — crossed poles threaded on a beam, a row of X's —
    // rather than by naming the thing.
    //
    // `abatis` is the one object here whose name was decided by the render rather than the prompt.
    // The roll that produced it was asking for a barricade of several felled trees and returned one
    // trunk bristling with branches — which is precisely what a single abatis element is, so it took
    // that name and gets stamped two or three in a row for a run. Read it as timber, not as milled
    // work: it has bark, branch stubs and a root flare.
    //
    // Scale follows the canal sheet's rule — the canvas is the scale — but these are outdoor objects
    // and the reference is different. Buildings in this library run 94-183px and trees 129-142px
    // against a 45px body, so a tent at 98px reads as a small structure a person stoops into, and a
    // gun at 81px long as a field piece rather than a siege one. The cot is deliberately smaller than
    // `canal-works.png`'s `ropeBed` (44x78 against 56x90): a folding camp cot is narrower and lower
    // than a rope bedstead, and the two beds in this game should not be the same object twice.
    //
    // Cut by explicit box, printed by reports/_review/compose-commission.mjs, as above.
    from: "Chronicle Commissions/civil-war-works.png",
    out: "civil-war-works.png",
    objects: [
      { name: "wallTent", box: [8, 6, 106, 78] },
      { name: "rampart", box: [114, 56, 218, 78] },
      { name: "abatis", box: [226, 9, 330, 78] },
      { name: "fieldGun", box: [338, 15, 419, 78] },
      { name: "supplyWagon", box: [427, 3, 510, 78] },
      { name: "hospitalCot", box: [518, 0, 562, 78] },
    ],
  },
  {
    // `war ruins`, read properly. The catalog had it sampled at 4 sheets of 27 and written off as
    // contemporary urban decay — concrete apartment blocks, modern cars, graffiti — and on that
    // reading Richmond 1864 excluded the pack outright, because the city does not burn until
    // April 1865 and a ruined 1864 Richmond is the wrong year by one.
    //
    // Sheets 21 and 22 were among the 21 never opened, and they are a different pack from the one
    // the catalog describes: cut-outs on transparency, roughly half of each sheet, drawn as
    // timber, brick and stone rather than concrete. Nothing in the set below carries a date.
    //
    // What they are for is the point. **None of this is bomb damage** — 1864 Richmond has no such
    // thing. Every object here is something Richmonders did to their own city, and each is placed
    // on the map only where the record puts it:
    //
    //   ruinTimberHouse   the intermediate defence line needed a clear field of fire, so the
    //   ruinStoneShell    houses standing in it came down and the woodlots with them. A pulled-
    //   deadTree          down house is not a shelled one: the frame is dismantled and lying,
    //   deadTreeSmall     the walls are stubs, and the material is stacked beside it, because
    //   brickSalvage      brick and timber were scarce enough to be worth carrying away.
    //   timberStack
    //   rubbleStone
    //
    // One object was cut here after it was packed, and the reason is worth keeping. Sheet 21
    // (10,14) looked in the grid render like crossed timbers on a shadow — which is precisely the
    // shape the note above says the abandoned chevaux-de-frise should have been generated as, and
    // finding it already drawn was too neat to doubt. Rendered into the map and cropped at 5x it is
    // a **fallen telegraph pole**: what read as shadow is four snapped wires hanging off two
    // crossarms. The catalog even lists "utility poles with wires" among this pack's contents. So
    // the chevaux-de-frise still does not exist in this library, and the earlier conclusion stands
    // unchanged. The general lesson is the one this map has now learned four times: the labelled
    // grid tells you where a sprite is, and only the render tells you what it is.
    //
    //   cordwood          not a ruin at all, and the most historically loaded object in the set.
    //                     Firewood in Richmond passed $30 a cord in the winter of 1863-64 against
    //                     a pre-war $4, and families burned furniture and fence rails. A guarded
    //                     stack of it beside the relief society says more about the civilian city
    //                     than any amount of rubble would.
    //
    // `ruinStoneShell` carries one further job: on Brown's Island, in the falls below Tredegar,
    // it is the Confederate States Laboratory, wrecked by the cartridge explosion of 13 March
    // 1863. About forty-five workers died, most of them girls and young women, several as young
    // as nine, many of them Irish immigrants from the Bottom. It is across water and unreachable
    // on purpose — the player sees it from the quay and asks what it is.
    from: "war ruins/21.png",
    out: "richmond-ruins.png",
    objects: [
      { name: "ruinTimberHouse", seed: [8, 1], limit: { height: 3, width: 5 } },
      { name: "ruinStoneShell", seed: [8, 5], limit: { height: 3, width: 5 } },
      { name: "brickSalvage", seed: [6, 2], limit: { height: 3, width: 3 } },
      { name: "rubbleStone", seed: [6, 0], limit: { height: 3, width: 3 } },
      { name: "timberStack", seed: [6, 10], limit: { height: 3, width: 3 } },
      { name: "deadTree", seed: [2, 8], limit: { height: 3, width: 3 } },
      { name: "deadTreeSmall", seed: [4, 0], limit: { height: 3, width: 3 } },
      {
        name: "cordwood",
        from: "war ruins/22.png",
        seed: [11, 14],
        limit: { height: 3, width: 3 },
      },
    ],
  },
  {
    // The register's oldest and worst entry, closed in part. `architecture.indigenous.northAmerican`
    // has blocked `p1-indigenous-settlement` since the library was first catalogued, and it is the
    // one gap the style guide calls a curriculum defect rather than an art gap: Island survival's
    // bohios are Caribbean/Taino and reusing them as generic "Native American" flattens distinct
    // cultures into one wrong image. Unit 6 cannot be built around it, because THE-MAP-PROGRAM's
    // rule that the railhead must not treat the West as empty land is a statement about what is
    // drawn on the map, not about what an NPC says.
    //
    // **Researching the commission moved the unit.** The Kanza were forced out of Kansas on 4 June
    // 1873 under a bill Congress passed at the urging of railroad and town-site speculators, and
    // their reservation was resold in 160-acre tracts. Unit 6 was already dated 1873 and already
    // had a land office, a survey and a payroll; it now has the transaction those three records
    // are three views of. See THE-MAP-PROGRAM.md's Unit 6 brief.
    //
    // **`barkLodge` is why this entry pays for itself twice.** A yehakin is saplings bent and
    // lashed into a barrel frame under bark or woven mats, with a smoke hole at the centre of the
    // roof; the Kanza's bark lodge is the same building by the same method. So one object serves
    // Riverbend and the railhead honestly — and that is not the bohio error in another coat,
    // because a Caribbean conical thatch hut is a *different structure* where these two are the
    // same one. Riverbend's two Powhatan NPCs have stood in open grass with no props since Phase
    // 62, with a comment in main.js saying exactly why. This unblocks them.
    //
    // **`agencyStoneHut` is the one object here that is not Indigenous architecture**, and it is on
    // this sheet because it stood in the village. The Indian Office built 138 one-room limestone
    // houses for the Kanza at Council Grove in 1862. They declined to live in square rooms and
    // stabled animals in them; in 1866, while they were away on the winter hunt, settlers stripped
    // the doors and window sashes. It is generated with its frames still in place and the openings
    // black, which is what that sentence looks like. Nothing on the map needs to explain it.
    //
    // Three objects took four rolls each and the misses rhyme. `barkLodge` came back a smooth
    // barrel, then a planked tube, then a green-thatched hut on sawn posts — the word "barrel"
    // fetches a container and the word "bark" fetches nothing at all. What worked was the sourced
    // description read out flat: a frame of bent saplings wrapped in woven mat panels with the rib
    // poles showing through. `agencyStoneHut` came back half-timbered on the first roll — the
    // Medieval-Fantasy-Town silhouette this repo bans by name — and on the third with a circular
    // shop emblem on the gable, which is the same failure wearing a sign. The rule from the
    // chevaux-de-frise holds and generalises: **name the construction, never the thing.**
    //
    // Scale follows the civil-war sheet. Against a 45px body and a library that draws buildings at
    // 94-183px: the earth lodge is 81px of ink and forty feet across, so it reads low and wide; the
    // tipi is the tallest object here at 122px because a tipi is roughly three times a person; and
    // the agency hut at 79px is deliberately the smallest building on the map, which is what a
    // sixteen-by-twenty-foot one-room house is.
    //
    // Cut by explicit box, printed by reports/_review/compose-commission.mjs.
    from: "Chronicle Commissions/indigenous-village.png",
    out: "indigenous-village.png",
    objects: [
      { name: "earthLodge", box: [8, 41, 144, 122] },
      { name: "barkLodge", box: [152, 46, 276, 122] },
      { name: "tipi", box: [284, 0, 360, 122] },
      { name: "tipiSmall", box: [368, 28, 410, 122] },
      { name: "agencyStoneHut", box: [418, 43, 524, 122] },
      { name: "dryingRack", box: [532, 58, 606, 122] },
      { name: "hideStretcher", box: [614, 39, 693, 122] },
    ],
  },
  {
    // Unit 8's commission, and the one that came out of an art reconnaissance rather than out of a
    // map build. `streetscape.midCentury` had been in the gap register since the library was first
    // catalogued, reading "1950s-specific — Highway Rest Area / Modern Park / Living room read
    // contemporary." That is a statement about *tone*, and tone is not commissionable: it named
    // three packs and a decade instead of naming a thing, so no job could ever close it. Reading it
    // against a real map turned it into two objects that are genuinely absent and a long list that
    // was never missing at all — see decision log 0095 for the split.
    //
    // **The tract house is the one that blocked the map.** The library's whole residential stock is
    // 17th-19th-century clapboard (farm/7), Second Empire terraces (19th Century European City),
    // frontier false-fronts (Wild West) and ruined concrete apartment blocks (war ruins). There is
    // no house of the twentieth century anywhere in 250 sheets, and a subdivision without houses is
    // not a subdivision.
    //
    // **Three plans, and what varies between them is where the car goes.** That is not decoration.
    // Levitt's Bucks County models of 1952-58 were one house sold as several, and the difference a
    // buyer chose between was a carport, an attached garage, or neither — so a street of these three
    // is what the record actually looked like, and one plan stamped eight times would read as a
    // rendering fault rather than as a tract.
    //
    // **The cars close the other half.** Highway Rest Area carries about forty vehicles and every
    // one of them is contemporary; Steampunk's is a brass-era runabout. Between roughly 1910 and the
    // present the library had no automobile at all, so Periods 7 and 8 both drove nothing. Three
    // bodies at one scale: two saloons and an estate.
    //
    // Scale is the thing this commission got wrong twice before it got it right, and the record is
    // worth keeping because the failure was invisible in the preview. Asked for a "long low" house
    // on a wide canvas, the generator returns a 195x55 slab — correct proportions, and a roof ridge
    // level with a 45px body's head. It only shows up when the sprite is dropped on real library
    // ground beside a real character, which is what reports/_recon/scene.mjs was written to do. The
    // library's own small one-storey buildings measure 93x96 and 89x144, so the houses here sit at
    // 85-100px and read as buildings. The cars at 128-147px are shorter than the library's 144px
    // contemporary sedan on purpose: none of that fleet may appear on this map, so the cars are
    // scaled to the houses they park at rather than to a fleet that is excluded by era.
    //
    // Two misses, and they rhyme with the chevaux-de-frise. "L-shaped" fetched a steep-roofed
    // cottage with a chimney twice running, because the generator answers the plan shape with a
    // house-shaped prior and ignores the adjective. And every early car came back a **show car** —
    // pinched waists, separate fenders, open cabins — because "chrome", "fins" and "seen from
    // directly above" together are a hot-rod render, whatever decade is named. What worked was
    // asking for the *plainness*: matte, few highlights, a flat rectangular roof panel between a
    // windscreen band and a rear-window band. Name the construction, never the thing.
    //
    // The foundation shrubs baked into all three houses are kept deliberately. They trim as part of
    // the sprite, and a 1957 house without foundation planting is the odd one — but note that they
    // are grass-green, so these three belong on lawn and nowhere else.
    //
    // Cut by explicit box, printed by reports/_recon/compose-commission.mjs.
    from: "Chronicle Commissions/suburban-tract.png",
    out: "suburban-tract.png",
    objects: [
      { name: "houseCarport", box: [0, 62, 194, 146] },
      { name: "houseGarage", box: [203, 61, 384, 146] },
      { name: "houseDriveway", box: [393, 47, 584, 146] },
      { name: "sedanTwoTone", box: [593, 19, 644, 146] },
      { name: "sedanDarkGreen", box: [653, 15, 704, 146] },
      { name: "stationWagon", box: [713, 0, 766, 146] },
    ],
  },
];
