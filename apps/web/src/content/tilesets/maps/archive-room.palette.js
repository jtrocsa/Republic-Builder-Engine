// Palette for archive-room.tmj — the Institute Archive Room, the present-day hub interior.
// Consumed by scripts/generate-archive-room-tmj.js.
//
// Why Medieval Tavern furniture dresses a present-day archive: decision log 0030. It is a
// deliberate, documented choice, not a placeholder. `Modern Interiors` was evaluated and
// rejected for a real technical reason (off-grid sheets the loader cannot address), and this
// catalog re-measured and confirmed that.
//
// Restyle candidate, NOT actioned here: office/3.png's double-sided library shelving and
// office/4.png's dark wood-panelled walls, plus 19th Century European City/tile-B-04.png's
// Victorian parquet and filled bookcases, would give the Institute a period-appropriate
// scholarly interior. That is a visual redesign with its own sign-off, not a side effect of
// naming tiles — see the catalog's `office` section.

import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "archive-room",
  period: null, // present-day hub
  status: "live",
  map: "apps/web/src/content/maps/archive-room.tmj",

  // Ordered — reshuffling changes every GID in the committed .tmj.
  sheets: [
    { path: "Medieval Tavern/tile-B-01.png", name: "medieval-tavern-b01" },
    { path: "Medieval Tavern/tile-B-03.png", name: "medieval-tavern-b03" },
    { path: "Medieval Tavern/tile-B-05.png", name: "medieval-tavern-b05" },
  ],

  tiles: {
    // Floor. Note these live on tile-B-05, not tile-B-01 — the style guide asserted tile-B-01
    // for a long time and a GID audit of this very map disproved it.
    stoneFloor: [
      CANONICAL["floor.archive.stone"],
      CANONICAL["floor.archive.stone.b"],
      CANONICAL["floor.archive.stone.c"],
      CANONICAL["floor.archive.stone.d"],
    ],
    // Warmer floor for the reading nook, for visual zoning.
    woodFloor: [
      CANONICAL["floor.archive.sandstone"],
      tile("Medieval Tavern/tile-B-05.png", 12, 9),
      tile("Medieval Tavern/tile-B-05.png", 13, 8),
      tile("Medieval Tavern/tile-B-05.png", 14, 9),
    ],

    /** Bottle/jar shelf, top-left of a 2x2 stamp — reads as archive shelving. */
    recordShelf: tile("Medieval Tavern/tile-B-03.png", 2, 8),
    /** Diamond rack, top-left of a 2x2 stamp — reads as an archive record rack. */
    recordRack: tile("Medieval Tavern/tile-B-03.png", 2, 10),
    /** Long plain dark-wood table, top-left of a 4-wide x 2-tall stamp. Deliberately not the
     *  tankard-covered tavern table — see the "avoid overtly tavern-specific props" rule. */
    readingTable: tile("Medieval Tavern/tile-B-01.png", 4, 8),
    wallTorch: tile("Medieval Tavern/tile-B-03.png", 1, 9),
    stool: tile("Medieval Tavern/tile-B-05.png", 11, 8),
  },
};
