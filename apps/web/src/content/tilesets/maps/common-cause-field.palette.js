// Palette for common-cause-field.tmj (Unit 3 / case-007, "The Common Cause").
// Setting: Philadelphia, 1770s. Consumed by scripts/generate-common-cause-tmj.js.
//
// The binding constraint on this map, from decision log 0032: no pack contains Georgian/Federal
// American civic architecture, so every building here is composited from Medieval Fantasy
// Town's UNLABELLED silhouettes. Its signed buildings ("Adventurer's Guild", "The Sword &
// Shield") are permanently off-limits — a readable fantasy-tavern sign baked into the pixel art
// is a worse anachronism than reusing an unlabelled shape. The assembly hall in particular
// reuses a signed building's roof and archway with the sign row swapped for plain stone wall.
//
// The liberty pole is the one element with no equivalent in any purchased pack, and the only
// PixelLab-generated asset in the repo.

import { CANONICAL, tile } from "../canonical-palette.js";

export default {
  id: "common-cause-field",
  period: 3,
  status: "live",
  map: "apps/web/src/content/maps/common-cause-field.tmj",

  // Ordered — reshuffling changes every GID in the committed .tmj.
  sheets: [
    { path: "Medieval Fantasy Town/1.png", name: "medieval-fantasy-town-1" },
    { path: "Medieval Fantasy Town/2.png", name: "medieval-fantasy-town-2" },
    { path: "Medieval Fantasy Town/5.png", name: "medieval-fantasy-town-5" },
    { path: "Medieval Fishing Village/tile-B-04.png", name: "medieval-fishing-village-b04" },
    {
      path: "Common Cause Philadelphia/liberty-pole.png",
      name: "common-cause-philadelphia-liberty-pole",
    },
  ],

  tiles: {
    // --- ground ---
    groundPlazaA: CANONICAL["stone.colonial.cobble"],
    /** Near-identical cobble, alternated with the above for light texture. */
    groundPlazaB: CANONICAL["stone.colonial.cobble.alt"],
    groundExterior: CANONICAL["grass.colonial.plaza"],

    // --- buildings: top-left anchors of multi-tile stamps, all unlabelled silhouettes ---
    /** 4x4. */
    printShop: tile("Medieval Fantasy Town/1.png", 0, 4),
    /** 4x4. */
    familyResidence: tile("Medieval Fantasy Town/1.png", 4, 0),
    /** 1 row x 4 cols — stairs and archway only. */
    statehouseSteps: tile("Medieval Fantasy Town/1.png", 8, 8),
    /** 4x4. Sign row deliberately replaced with plain stone wall by the generator. */
    assemblyHall: tile("Medieval Fantasy Town/5.png", 0, 8),
    /** 3 rows x 4 cols. */
    chapel: tile("Medieval Fantasy Town/5.png", 8, 4),
    /** 3 rows x 2 cols — the watchtower silhouette. */
    frontierDispatchPost: tile("Medieval Fantasy Town/5.png", 8, 12),
    /** 2 rows x 4 cols. */
    marketStalls: tile("Medieval Fantasy Town/2.png", 4, 0),
    /** 2x2. */
    townWell: tile("Medieval Fantasy Town/2.png", 6, 8),
    /** 2 rows x 4 cols. */
    wharf: tile("Medieval Fishing Village/tile-B-04.png", 8, 0),
    /** 1 col x 3 rows. The one generated asset in the repo. */
    libertyPole: tile("Common Cause Philadelphia/liberty-pole.png", 0, 0),
  },
};
