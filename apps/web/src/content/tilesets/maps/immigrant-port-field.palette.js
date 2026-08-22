// Palette for immigrant-port-field.tmj (Unit 7's field map, the immigrant station).
// Setting: Ellis Island, in the Upper Bay off the New Jersey shore, 17 April 1907.
// Consumed by scripts/generate-immigrant-port-tmj.js.
//
// Unlike Riverbend, Canal Crossroads and Cottonwood Junction, **the place is real and named**. The
// station is the subject rather than the setting, so inventing a composite harbour would cost the
// one thing the map is for. The records on it are composites; the island is not.
//
// Six decisions are worth stating, because each was arrived at against the art and each changed
// the layout.
//
// 1. **The frontage is brick with a stone centre, and that is the library agreeing with the
//    history rather than a substitution being excused.** The real Main Building is red brick with
//    limestone trim and a taller entrance block; `19th Century European City/tile-B-01` has a
//    four-by-four pale-stone civic pavilion at `(4,4)` and four-wide red-brick terraces at
//    `(10,8)` and `(10,12)` whose rooflines sit two rows lower. Laid with a common base row, the
//    pavilion rises above a long brick wall — which is what the building does. What the pack
//    cannot give is the four domed corner towers, and nothing here pretends otherwise: the
//    pavilion has one clock tower instead. Registered in docs/architecture/art-and-map-style-guide.md.
//
// 2. **The paving is the route and the cobble is everything else.** The island is made ground —
//    fill dumped behind a seawall, twice enlarged — and it is cobbled like any working quay, with
//    cut flagstone laid only where people are walked: the landing stage to the wharf, the wharf to
//    the gate, the gate to the doors, and the one branch to the inquiry wing. A student can read
//    the whole procedure off the ground before anybody speaks. This is the opposite choice from
//    Cottonwood Junction, where every surface in town was the same dirt and the palette says so at
//    length; there the sameness was the finding, here the difference is.
//
//    Both surfaces are `19th Century European City/tile-B-05`, which is the third pair tried. The
//    Dock pack's own gravel and sand are a beach — pale, pebbled and grid-ruled at 48px — and its
//    cobble at `(14,0)` is the one Canal Crossroads already refused for the ground layer, because
//    it carries a fully clear top pixel row and a hairline of page background would run the whole
//    width of this map. `(14,4)` is worse than either and is not what its name says: taken as a
//    2x2 it reaches into row 15 and lays an ice-cream stand across the quay, twice per block.
//
// 3. **The rail is `19th Centruy European Dock/tile-B-04 (6,0)` and it can only run east-west.**
//    Every fence, railing and hoarding in 250 sheets is drawn face-on, so a north-south rail does
//    not exist and cannot be faked by rotation. The first plan for this map was a railed pen
//    running north to the doors — five tiles wide, the queue as architecture — and it is not
//    buildable. What is buildable is one line across the wharf with a single gate in it, which
//    turns out to be the better composition anyway: see the generator's header.
//
// 4. **The jetty pieces at `tile-B-06 (4,10)` and `(4,12)` are not decking, and the first pass
//    used them as if they were.** Each is a free-standing 2x2 landing-stage *sprite* — a deck with
//    a mooring post at all four corners and transparent margins all round — so laid by parity it
//    renders as a raft of separate slats with the bay showing between them, which is exactly what
//    the first preview drew. The two finger piers are `tile-B-04 (0,8)` plank decking instead: a
//    full-bleed floor texture, painted on the GROUND layer in place of the water, with a heavy
//    mooring post stamped at the head of each stage for the thing the sprite was wanted for.
//
// 5. **Nothing grows on this map except in pots.** The arrival side of the island in 1907 is
//    seawall, fill and paving; the lawns and the plane trees came later. `19th Century European
//    City/tile-B-05` has potted bays and planters, and those are the only planting here. A tree
//    line would be the same class of error as Cottonwood Junction's cactus — scenery from another
//    place, laid down because a map looked bare without it.
//
// 6. **`WWI Fleet/tile-B-01` is not used, and the forward slate said it would be.** The planned
//    entry named it for "steamship interior (riveted steel is correct here)", which is true and
//    beside the point: the brief's interiors are the inspection hall and the board of special
//    inquiry room, and neither is aboard a ship. No vessel is drawn at all — see the generator's
//    note on the empty slip.

import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "immigrant-port-field",
  period: 7,
  status: "live",
  map: "apps/web/src/content/maps/immigrant-port-field.tmj",
  // Two made surfaces, and the split is the map's argument — see note 2 in the header. The FIRST
  // entry is what `RoadNetwork` paints new spurs in, so a door the router has to reach gets
  // flagstone, which is right: a door on this island that people are walked through is on the
  // route by definition.
  road: ["paving"],

  // Ordered — reshuffling changes every GID in the committed .tmj.
  // Two of the five are already bundled: the Dock pack's quay sheet by Canal Crossroads, and the
  // City pack's facades by Canal Crossroads too. The other three are new to the build.
  sheets: [
    { path: "19th Centruy European Dock/tile-B-06.png", name: "european-dock-b06" },
    { path: "19th Centruy European Dock/tile-B-04.png", name: "european-dock-b04" },
    { path: "19th Centruy European Dock/tile-B-02.png", name: "european-dock-b02" },
    { path: "19th Century European City/tile-B-01.png", name: "european-city-b01" },
    { path: "19th Century European City/tile-B-05.png", name: "european-city-b05" },
  ],

  tiles: {
    // --- ground ---------------------------------------------------------------------------------
    /** The Upper Bay. Atlantic family, deliberately: this is salt water, not a river. */
    water: { ...CANONICAL["water.atlantic.deep"], h: 2, w: 2 },
    /** Inshore water, along the seawall and between the piers, where the bottom shows. */
    waterShallow: { ...CANONICAL["water.atlantic.shallow"], h: 2, w: 2 },
    /** The island itself: made ground, cobbled, the way the working half of any quay was. */
    cobble: { ...CANONICAL["stone.city.cobble"], h: 2, w: 2 },
    /**
     * The route. Large cut slabs — the surface a public building lays where the public walks.
     *
     * The City pack's rather than the Dock pack's, and the reason is alpha, not taste: the same
     * one Canal Crossroads records. `stone.dock.cobble` carries a fully clear top pixel row, and
     * on the ground layer a transparent pixel is a hole through to the page. This block is opaque
     * edge to edge, which matters over the long unbroken runs the route is made of.
     */
    paving: { ...CANONICAL["stone.city.slab"], h: 2, w: 2 },

    // --- the seawall and the water's edge --------------------------------------------------------
    /**
     * Dressed stone coping, laid along the whole quay edge and both sides of the ferry basin.
     *
     * On STRUCTURES over paving, never on the ground: it is 11% transparent with four clear pixel
     * rows along its top — a wall face drawn as a cut-out, not as terrain. Canal Crossroads drew a
     * black hairline down a hundred tiles of canal bank before this was understood.
     */
    quayCoping: tile("19th Centruy European Dock/tile-B-06.png", 4, 0, { h: 1, w: 4 }),
    /**
     * The landing stages: plank decking, laid on the GROUND layer in place of the water. See note
     * 4 in the header for the two tiles this is not.
     */
    pierDeck: tile("19th Centruy European Dock/tile-B-04.png", 0, 8, { h: 2, w: 2 }),

    // --- the Main Building -----------------------------------------------------------------------
    /**
     * The entrance pavilion: a pale ashlar civic block with a pedimented centre, three arched
     * ground-floor openings and a clock tower. Four by four, and the tower is the top two rows.
     *
     * The three arches are the whole reason this stamp and not one of the churches beside it on
     * the sheet: everybody on this map goes through a door in the middle of a symmetrical
     * frontage, and the art puts three of them where the eye expects one.
     */
    pavilion: tile("19th Century European City/tile-B-01.png", 4, 4, { h: 4, w: 4 }),
    /**
     * The wings. Two four-wide red-brick runs, alternated along the frontage so it reads as
     * repeating bays rather than as one wall printed eight times.
     *
     * Their roofline sits two rows below the pavilion's, which is what makes the centre block read
     * as taller. Both carry ground-floor doors, and on a building this size that is correct: the
     * Main Building had service and staff entrances the length of its front.
     */
    wingBrick: tile("19th Century European City/tile-B-01.png", 10, 8, { h: 2, w: 4 }),
    wingBrickAlt: tile("19th Century European City/tile-B-01.png", 10, 12, { h: 2, w: 4 }),
    /**
     * The one bay of the frontage that is a way in rather than a wall: a lower brick range with
     * its own chimneys and a plainer door, which is what tells a player at a glance that the
     * inquiry wing is enterable and the forty-four bays either side of it are not.
     *
     * This matters more in the next slice than in this one — an interior's doorstep gets a
     * `.hub-marker`-style label once `FIELD_MAPS["unit-07"].interiors` exists — but a door that
     * needs a label to be findable is a door drawn wrong.
     */
    wingEntrance: tile("19th Century European City/tile-B-01.png", 8, 12, { h: 2, w: 4 }),

    // --- the rail ----------------------------------------------------------------------------------
    /**
     * The line across the wharf: ornate wrought iron on a stone plinth. See note 3 in the header
     * for why it runs east-west and nothing else can.
     *
     * `base` solidity, so the plinth blocks and the ironwork above it goes to the overlay layer —
     * a player walks *behind* the rail's top row the way they walk behind a canopy. Stamped
     * `solid` it would be two tiles thick, which is a wall, and this is a fence.
     */
    rail: tile("19th Centruy European Dock/tile-B-04.png", 6, 0, { h: 2, w: 2 }),
    /** A plainer section, for the seawall rail where the ornate run would be showing off. */
    railPlain: tile("19th Centruy European Dock/tile-B-04.png", 6, 2, { h: 2, w: 2 }),
    /** The gate posts, one either side of the one opening in the rail. */
    gatePost: tile("19th Centruy European Dock/tile-B-04.png", 6, 8, { h: 2, w: 1 }),

    // --- the wharf's working plant -----------------------------------------------------------------
    /** The baggage shed: gabled, plank-built, double doors. Everything came off the barge into it. */
    baggageShed: tile("19th Centruy European Dock/tile-B-02.png", 2, 0, { h: 2, w: 2 }),
    /** A second, flat-roofed shed with the same doors — the coal and stores end of the wharf. */
    storesShed: tile("19th Centruy European Dock/tile-B-02.png", 2, 2, { h: 2, w: 2 }),
    /**
     * The steamship line's booth on the wharf.
     *
     * Drawn as a newsstand — a glazed kiosk with printed sheets pinned across its counter — which
     * is very close to what a line's shore office looked like and is the only small commercial
     * booth in the library. The sheets pinned to it are the point: this company's instructions to
     * its agents are one of the seven records.
     */
    lineBooth: tile("19th Century European City/tile-B-05.png", 8, 12, { h: 2, w: 2 }),
    /** Timber loading derrick at the quay edge, for the baggage the barges bring over. */
    dockCrane: tile("19th Centruy European Dock/tile-B-06.png", 8, 4, { h: 2, w: 2 }),

    // --- street furniture ---------------------------------------------------------------------------
    /** The wharf's lamps: plain iron standards, on the working side of the rail. */
    lampPost: tile("19th Centruy European Dock/tile-B-06.png", 8, 12, { h: 2, w: 1 }),
    /** The forecourt's: taller, ornate, on the side of the rail the money was spent. */
    lampOrnate: tile("19th Century European City/tile-B-05.png", 6, 4, { h: 2, w: 1 }),
    bollard: tile("19th Centruy European Dock/tile-B-06.png", 8, 0),
    bollardRoped: tile("19th Centruy European Dock/tile-B-06.png", 9, 1),
    /** A heavy timber mooring post, for the head of each finger pier. */
    mooringPost: tile("19th Centruy European Dock/tile-B-04.png", 6, 8, { h: 2, w: 1 }),
    /** A second, iron-banded one, so the four posts on the two stages are not one post four times. */
    mooringPostAlt: tile("19th Centruy European Dock/tile-B-04.png", 6, 9, { h: 2, w: 1 }),
    /** Iron benches, in the forecourt only. Nobody sits on the wharf side; there is nothing to sit on. */
    bench: tile("19th Century European City/tile-B-05.png", 8, 8, { h: 2, w: 2 }),
    benchAlt: tile("19th Century European City/tile-B-05.png", 8, 4, { h: 2, w: 2 }),
    /** The only planting on this island — see note 5. Clipped bays in tubs, either side of a door. */
    pottedBay: tile("19th Century European City/tile-B-05.png", 14, 2, { h: 2, w: 1 }),
    pottedBayAlt: tile("19th Century European City/tile-B-05.png", 14, 3, { h: 2, w: 1 }),
    planter: tile("19th Century European City/tile-B-05.png", 14, 0, { h: 2, w: 2 }),

    // --- baggage, and the cargo that is not baggage ---------------------------------------------------
    // The distinction is the whole reason both are here. Trunks, bundles and roped chests belong to
    // the people standing beside them; crates, barrels and sacks belong to the station. They are
    // stacked in different places and they are never mixed.
    trunk: tile("19th Centruy European Dock/tile-B-02.png", 12, 14),
    trunkAlt: tile("19th Centruy European Dock/tile-B-02.png", 12, 15),
    trunkRed: tile("19th Centruy European Dock/tile-B-02.png", 11, 14),
    bundleStack: tile("19th Centruy European Dock/tile-B-06.png", 10, 9),
    grainSack: tile("19th Centruy European Dock/tile-B-06.png", 10, 6),
    crate: tile("19th Centruy European Dock/tile-B-06.png", 10, 0),
    crateAlt: tile("19th Centruy European Dock/tile-B-06.png", 11, 1),
    barrel: tile("19th Centruy European Dock/tile-B-06.png", 10, 4),
    ropeCoil: tile("19th Centruy European Dock/tile-B-06.png", 11, 8),
    handCart: tile("19th Centruy European Dock/tile-B-06.png", 11, 13),
    /** A life ring on the quay edge. Small, and the only thing on this wharf drawn in red. */
    lifeRing: tile("19th Centruy European Dock/tile-B-02.png", 13, 4),
  },
};
