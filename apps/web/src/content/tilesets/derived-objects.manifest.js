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
];
