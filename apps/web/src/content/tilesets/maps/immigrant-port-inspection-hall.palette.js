// Palette for immigrant-port-inspection-hall.tmj — the registry floor of the immigrant station at
// Ellis Island, 17 April 1907. Consumed by scripts/generate-immigrant-port-inspection-hall-tmj.js.
//
// ## The room the whole unit is about
//
// Four of Unit 7's seven records are written in here, and the two that are not are about what
// happens in here. `THE-MAP-PROGRAM.md` §5 gives the map's interview one question — *what the
// official question fails to ask* — and this is the room where the official question is asked, at
// roughly two minutes a person, eleven thousand seven hundred and forty-seven times in the day the
// map is set on.
//
// The register rule that governed Shockoe Bottom and the Kansas land office governs it here too,
// and it is under the most pressure it has been under yet. **Nothing in this room is sinister.**
// There is no cage, no shadow, no locked door, no uniformed man with his hand raised. It is a large,
// clean, well-lit public hall with iron railings across it and a clock on the wall, and a student
// who walks in and thinks *this is just a government office* has understood the exhibit exactly.
// Every question asked at these desks was authorised by statute and asked in good faith. The
// finding is that the form decides, and the form has thirty lines and no room.
//
// ## One made surface, where the wharf had two
//
// Outside, the paving is the route and the cobble is everything else — the ground tells you the
// procedure before anybody speaks. Inside, that stops: the floor is one grey slab from wall to wall
// and it says nothing at all, because indoors the sorting is not done by where you are allowed to
// walk. It is done by an iron rail you are walked *between*, and by a man with a pen.
//
// So the hall's contrast is with the room next door instead. This is cold stone under buff
// plaster; the board of special inquiry room, twelve bays east, is herringbone parquet under
// panelled wainscot. **The nicest room in the building is the one where the decision is made**, and
// the pairing is deliberate in exactly the way the land office's whitewash against the telegraph
// office's dark board was.
//
// The floor took six blocks to settle, and the five it beat are worth recording because two
// different failure modes are hiding in them. The first is the one
// richmond-counting-room.palette.js caught taking coursed masonry for flagstone: **at 48px, most
// "stone floor" blocks in these packs are walls**. `tile-B-04` (0,14), which the boarding house
// lays in its kitchen, tiles a 22x18 room into a brick-walled courtyard; the shared sheet's pale
// ashlar at (13,14) does the same in a lighter colour; its cracked white at (12,12) draws a ruin,
// which a seven-year-old federal building is not; and `tile-B-04`'s black-and-white terrazzo at
// (14,8) is so busy it fights the cast for attention.
//
// The second only showed up in the game's own chrome, and is worth more than the first. The shared
// sheet's pale grouted tile at (11,10) is the most accurate block on offer — close to what the
// registry floor actually was — and twenty-two by eighteen tiles of it, inside a deep-navy page,
// reads as graph paper. **A map preview is not a screenshot.** The preview tool renders the .tmj
// on its own and this palette looked right there twice over; it took the e2e baseline, which frames
// the map in the game's chrome, to show what the room is actually like to stand in.
//
// So the floor is the large blue-grey slab instead: a public building's floor rather than that
// public building's floor, cool against the buff walls, in the game's own blue family, and dark
// enough that black ironwork reads across the whole room.
//
// ## The rail is the same rail
//
// `19th Centruy European Dock/tile-B-04` (6,0) — the ornate wrought iron on a stone plinth that
// runs across the wharf outside with one gate in it. Photographs of this room in 1907 show iron pipe
// railings dividing the registry floor into aisles; they were pulled out and replaced with benches
// in 1911, so a room set in 1907 has them and a room set four years later does not.
//
// Reusing the outdoor tile rather than finding an interior railing is the point rather than a
// saving. The thing that keeps Ignacy Wozniak off the wharf and the thing that walks Márton Szabó
// to a desk are the same object, bought from the same foundry, bolted down by the same
// government — and a player who has spent ten minutes leaning on it outside meets it again the
// moment they come through the door.
//
// ## What is deliberately not in here
//
// **No barred pen and no cell.** The detention rooms were upstairs and are not this room; drawing a
// cage on the registry floor would teach that the hall was a prison, which is the error the register
// rule exists to prevent.
//
// **No stairs.** The stairs of separation at the far end of the real room — admitted to the ferry,
// admitted to the railroad, detained — are the single most legible object in the building's history,
// and a flat door graph cannot draw one. CLAUDE.md is explicit that a field interior is never
// nested. What survives of the three-way split is the money exchange at the east end, which is where
// a person went once they had been let through.
//
// **No framed art.** tile-B-04's two paintings at (12,8) and (12,9) are the Mona Lisa and a
// Renaissance portrait, legible enough to name at 1x, and are barred from every map in this repo.
//
// Bundle cost: **zero**. All four sheets are already carried — the two City interior sheets by
// Canal Crossroads' and Richmond's four rooms, the shared A4 floor sheet by Cottonwood Junction's
// two, and the Dock sheet by the wharf this room opens off.

import { SHARED_SHEETS, tile } from "../canonical-palette.js";

const EU4 = "19th Century European City/tile-B-04.png";
const EU2 = "19th Century European City/tile-B-02.png";
const DOCK4 = "19th Centruy European Dock/tile-B-04.png";

export default {
  id: "immigrant-port-inspection-hall",
  period: 7,
  status: "live",
  map: "apps/web/src/content/maps/immigrant-port-inspection-hall.tmj",

  // Ordered — firstgid is assigned in this order and must not be reshuffled, or every GID in the
  // committed .tmj changes.
  sheets: [
    { path: SHARED_SHEETS.floors, name: "shared-a4-floors" },
    { path: EU4, name: "european-city-b04" },
    { path: EU2, name: "european-city-b02" },
    { path: DOCK4, name: "european-dock-b04" },
  ],

  tiles: {
    // --- floor and wall, as whole authored 2x2 blocks ---------------------------------------------
    /**
     * Large blue-grey slabs, wall to wall. Cool where the walls are warm, flat where half the
     * candidates were a wall in disguise, and dark enough to carry black ironwork the length of a
     * room this size. See the header for the five blocks it beat and what each one got wrong.
     * Tiles clean at 2x2 parity; 0.0% transparent, which matters over a floor this size. [measured]
     */
    floorSlab: tile(SHARED_SHEETS.floors, 8, 8, { h: 2, w: 2 }),
    /**
     * Buff plaster, the whole way round. Goes on `structures` over floor, never on `ground`: every
     * wall block on this sheet carries a fully transparent bottom pixel row, and on the ground layer
     * that is a 1px hole through to the page under every wall tile. Canal Crossroads drew that
     * hairline down a hundred tiles of canal bank before it was understood. [measured]
     */
    wallPlaster: tile(EU4, 4, 2, { h: 2, w: 2 }),

    // --- the way out and the light -----------------------------------------------------------------
    /** Panelled leaf. Two side by side are the wharf door, and the way back out. [measured] */
    door: tile(EU4, 6, 2, { h: 2, w: 2 }),
    /** Sash window, 1 col. The real hall was glazed on three sides and it mattered. [measured] */
    window: tile(EU4, 6, 11, { h: 2 }),

    // --- the rail ------------------------------------------------------------------------------------
    /**
     * The iron railing that divides the floor into aisles — the same tile, off the same sheet, as
     * the rail across the wharf outside. See the header.
     *
     * `base` solidity: the plinth blocks its ground-contact row and the ironwork above it lifts to
     * the overlay, so a person standing at the rail draws *behind* the thing they are leaning on.
     * Stamped `solid` it is two tiles thick, which is a wall, and this is a fence.
     * [live — drawn by immigrant-port-field.tmj]
     */
    rail: tile(DOCK4, 6, 0, { h: 2, w: 2 }),

    // --- the desks -------------------------------------------------------------------------------------
    /**
     * A registry desk: a long plain table, four columns of it, no chairs drawn. Inspectors worked
     * these standing, and the absence of a chair is accurate rather than an omission — the man is
     * on his feet for ten hours and so are you.
     *
     * Two of them, side by side across the north end, because the inspector and the interpreter
     * work the same line and neither of them is the other's assistant. [measured]
     */
    registryDesk: tile(EU2, 14, 0, { h: 2, w: 4 }),
    /**
     * The money exchange counter — a long sideboard with a flat top, which is what a franchise
     * counter in a federal building looked like.
     *
     * The exchange, the ticket office and the food concession were **private businesses operating
     * on government property**, and the commissioner's daily statement counts their takings in a
     * column beside the head tax. This is the only piece of furniture in the room that was making
     * somebody money. [measured]
     */
    exchangeCounter: tile(EU2, 10, 12, { h: 2, w: 2 }),
    /** The press of filed manifest sheets, behind the desks where they are put after. [measured] */
    manifestPress: tile(EU4, 10, 6, { h: 2, w: 2 }),
    /** The floor safe: the day's head tax, at two dollars a head, before it goes to Washington. */
    safe: tile(EU4, 12, 14),
    /**
     * A long-case clock, 1 col. The one piece of dressing in the room and the only one that argues:
     * an inspector had about two minutes a person, and the person being asked could see the clock.
     * [measured]
     */
    tallClock: tile(EU4, 10, 3, { h: 2 }),

    // --- the line ---------------------------------------------------------------------------------------
    /** A plain public bench, iron ends and slats. What a hall gives people to wait on. [measured] */
    bench: tile(EU4, 14, 2, { h: 2, w: 2 }),
    /** A second bench, a shade different, so a row of them is not one bench four times. [measured] */
    benchAlt: tile(EU4, 14, 4, { h: 2, w: 2 }),
    /**
     * A corded stack of travelling luggage. canal-print-shop.palette.js records rejecting this tile
     * for bales of printing paper because it "reads unmistakably as stacked travelling luggage" —
     * which is the whole reason it is here, on the one map in the game where that is the subject.
     * [measured]
     */
    luggage: tile(EU4, 12, 6, { h: 2, w: 2 }),
    /** Wall sconce, 1x1. [measured] */
    wallSconce: tile(EU4, 13, 11),
  },
};
