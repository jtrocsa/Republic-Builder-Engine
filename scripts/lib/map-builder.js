// Shared machinery for the .tmj generators: the three depth layers, terrain-block tiling,
// solidity-aware stamping, and the collision rects that fall out of it.
//
// Two things moved in here in Phase 53, both because keeping them per-generator produced the
// defects the maps shipped with:
//
// 1. **Terrain is a 2x2 block, not a tile.** These packs author ground as 96x96 blocks — four
//    quadrants that only read as continuous texture in their authored arrangement. Caribbean
//    picked randomly between two quadrants of one block, which is what made its ground read as
//    patchwork, and it dropped single quadrants of the *sand* driftwood and shell blocks onto
//    grass as "accents", which is what put hard tan squares in the middle of a green field and
//    sliced every log in half. `groundBlock()` tiles a block by parity; decoration is a prop.
//
// 2. **Collision comes from the stamp.** It used to be a hand-written rect array in main.js kept
//    in sync with these scripts by eye, with the matching rect written in a trailing comment on
//    every stamp() call. A building's rect covered only its ground-contact row — right for a tree
//    trunk, wrong for a house, which is why the player could walk onto roofs and render pasted on
//    a facade. Now a stamp declares what it *is* and the rect is derived:
//
//      solid  buildings and other things you cannot enter. The whole footprint blocks.
//      base   trees, palms, poles. Only the ground-contact row blocks; every row above is lifted
//             to the overlay layer, so the player walks behind the canopy.
//      decor  ankle-height scatter. Nothing blocks; the player walks over it.
//
// See docs/decision-log/0036-generated-collision-and-derived-object-sheets.md.

const TILE = 48;

export class MapBuilder {
  constructor({ width, height, gid, gidRect, tilesets }) {
    this.width = width;
    this.height = height;
    this.gid = gid;
    this.gidRect = gidRect;
    this.tilesets = tilesets;
    this.ground = new Array(width * height).fill(0);
    this.structures = new Array(width * height).fill(0);
    this.overlay = new Array(width * height).fill(0);
    this.blocks = [];
  }

  inBounds(col, row) {
    return col >= 0 && col < this.width && row >= 0 && row < this.height;
  }

  index(col, row) {
    return row * this.width + col;
  }

  setGround(col, row, tileGid) {
    if (!this.inBounds(col, row)) return;
    this.ground[this.index(col, row)] = tileGid;
  }

  /**
   * Paints one cell of a terrain block, picking the quadrant that keeps the block's authored
   * arrangement continuous across the map. `block` is the palette entry for the block's top-left
   * quadrant, declared with its footprint (usually `{ h: 2, w: 2 }`).
   *
   * Picking a quadrant at random instead — which is what "grassA or grassB, 18% of the time" was
   * doing — tiles four cells that were drawn to sit together in a fixed arrangement, and reads as
   * a visible quilt rather than as ground.
   */
  groundBlock(col, row, block) {
    const h = block.h ?? 1;
    const w = block.w ?? 1;
    const quadrant = {
      sheet: block.sheet,
      row: block.row + (((row % h) + h) % h),
      col: block.col + (((col % w) + w) % w),
    };
    this.setGround(col, row, this.gid(quadrant));
  }

  /**
   * Paints a multi-tile entry onto the ground layer at an exact anchor, no parity tiling.
   *
   * For art that is a floor rather than an object: a pier deck, a paved quay, a moored rowboat
   * whose own water is painted into the tile. Those cannot go on `structures` — they are opaque
   * to their borders, so stamping them above the ground lays a hard-edged square of a slightly
   * different blue over the river, which is precisely the "different water in between the water"
   * the shipped maps showed. On the ground layer they replace the water instead of covering it,
   * and the packs draw them in the same water tone, so the seam disappears.
   */
  groundRect(col, row, entry) {
    const h = entry.h ?? 1;
    const w = entry.w ?? 1;
    const gids = this.gidRect(entry);
    for (let r = 0; r < h; r += 1) {
      for (let c = 0; c < w; c += 1) {
        if (gids[r][c]) this.setGround(col + c, row + r, gids[r][c]);
      }
    }
  }

  /**
   * Paints one quadrant of an authored block onto `structures`, with no collision.
   *
   * For overlay terrain: crop rows, planted beds, ground cover that has its own see-through gaps
   * and therefore needs real ground beneath it. `farm/6`'s planted plots are drawn this way — a
   * bed of soil with plants standing above it, transparent between the stems — so laying them
   * straight onto the ground layer shows the page background through every field.
   */
  decorBlock(col, row, block) {
    if (!this.inBounds(col, row)) return;
    this.structures[this.index(col, row)] = this.blockGidAt(col, row, block);
  }

  /** The gid a terrain block would paint at this cell, without painting it. */
  blockGidAt(col, row, block) {
    const h = block.h ?? 1;
    const w = block.w ?? 1;
    return this.gid({
      sheet: block.sheet,
      row: block.row + (((row % h) + h) % h),
      col: block.col + (((col % w) + w) % w),
    });
  }

  /**
   * Draws a small prop on the overlay layer, above whatever is already stamped at that cell.
   *
   * `stamp()` writes to `structures`, one tile per cell, so stamping a thing *onto* another thing
   * replaces it — a compass placed on the Navigation Table's top would punch a transparent hole in
   * the table and show the floor around it. The overlay layer is a second canvas the loader draws
   * above the player and NPC sprites, so a prop put there composites over the furniture instead.
   *
   * Only for cells the player can never stand on (a `solid` object's own footprint). Anywhere else,
   * overlay art would draw over the player.
   */
  overlayStamp(col, row, entry, label) {
    const h = entry.h ?? 1;
    const w = entry.w ?? 1;
    const gids = this.gidRect(entry);
    for (let r = 0; r < h; r += 1) {
      for (let c = 0; c < w; c += 1) {
        const cc = col + c;
        const rr = row + r;
        if (!this.inBounds(cc, rr)) continue;
        if (!gids[r][c]) continue;
        this.overlay[this.index(cc, rr)] = gids[r][c];
      }
    }
    return { col, row, height: h, width: w, label };
  }

  occupied(col, row) {
    if (!this.inBounds(col, row)) return true;
    const i = this.index(col, row);
    return this.structures[i] !== 0 || this.overlay[i] !== 0;
  }

  /**
   * Stamps a palette entry at (col, row) — its top-left cell — and records the collision it
   * implies.
   *
   * @param {object} entry   palette entry; its `h`/`w` footprint is the whole size story
   * @param {"solid"|"base"|"decor"} solidity
   * @param {string} [label] shows up in the generated blocks file and the preview overlay
   */
  stamp(col, row, entry, solidity, label) {
    const h = entry.h ?? 1;
    const w = entry.w ?? 1;
    const gids = this.gidRect(entry);

    // A `base` object is drawn above the player everywhere except its ground-contact row, so
    // walking north of a tree puts the player behind its canopy. A `solid` object never needs
    // that: its whole footprint blocks, so the player can never stand behind it in the first
    // place, and lifting it would only let it cover a player standing to one side.
    const baseRow = row + h - 1;
    for (let r = 0; r < h; r += 1) {
      for (let c = 0; c < w; c += 1) {
        const cc = col + c;
        const rr = row + r;
        if (!this.inBounds(cc, rr)) continue;
        const tileGid = gids[r][c];
        if (!tileGid) continue;
        const target = solidity === "base" && rr !== baseRow ? this.overlay : this.structures;
        target[this.index(cc, rr)] = tileGid;
      }
    }

    if (solidity === "solid") {
      this.blocks.push({
        x1: col,
        y1: row,
        x2: col + w,
        y2: row + h,
        kind: label || "structure",
      });
    } else if (solidity === "base") {
      // Feet collide with the base, not the canopy — the Pokemon-style physics layer. The rect
      // starts partway down the row so the player's feet can overlap the very top of the trunk
      // cell without being stopped a full tile short of it.
      this.blocks.push({
        x1: col,
        y1: baseRow + 0.4,
        x2: col + w,
        y2: baseRow + 1,
        kind: label || "base",
      });
    }
    return { col, row, height: h, width: w, baseRow };
  }

  /**
   * Moves a preferred coordinate to the nearest cell satisfying `wanted`, searching outward in
   * square rings.
   *
   * Shore props — a canoe drawn up on the sand, a barrel landed off a boat, a crate on the quay —
   * are only ever meaningful *relative to the coastline*, and every one of these maps draws its
   * coastline from a curve rather than from a transcribed outline. Hand-picking their coordinates
   * is how Phase 52 ended up with canoes beached in open grass and a hay bale floating in the
   * Delaware. Deriving them from the same curve that painted the shore is the fix.
   */
  snapTo(col, row, wanted, maxRadius = 8) {
    for (let radius = 0; radius <= maxRadius; radius += 1) {
      for (let dr = -radius; dr <= radius; dr += 1) {
        for (let dc = -radius; dc <= radius; dc += 1) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== radius) continue;
          const c = col + dc;
          const r = row + dr;
          if (!this.inBounds(c, r)) continue;
          if (wanted(c, r)) return [c, r];
        }
      }
    }
    return [col, row];
  }

  /** A collision rect with no art of its own — a cliff edge, a locked doorway. Use sparingly. */
  block(rect) {
    this.blocks.push(rect);
  }

  tileLayer({ data, id, name, locked = false }) {
    return {
      data,
      height: this.height,
      id,
      ...(locked ? { locked: true } : {}),
      name,
      opacity: 1,
      type: "tilelayer",
      visible: true,
      width: this.width,
      x: 0,
      y: 0,
    };
  }

  toTmj() {
    const layers = [
      this.tileLayer({ data: this.ground, id: 1, name: "ground" }),
      this.tileLayer({ data: this.structures, id: 2, name: "structures", locked: true }),
    ];
    // The name matters: tiled-map-loader.js routes any layer named "overlay*" to a second canvas
    // stacked above the player and NPC sprites.
    if (this.overlay.some(Boolean)) {
      layers.push(this.tileLayer({ data: this.overlay, id: 3, name: "overlay", locked: true }));
    }
    return {
      compressionlevel: -1,
      height: this.height,
      infinite: false,
      layers,
      nextlayerid: layers.length + 1,
      nextobjectid: 1,
      orientation: "orthogonal",
      renderorder: "right-down",
      tiledversion: "1.12.2",
      tileheight: TILE,
      tilesets: this.tilesets,
      tilewidth: TILE,
      type: "map",
      version: "1.10",
      width: this.width,
    };
  }

  /**
   * The collision module that main.js imports in place of the old hand-written rect arrays.
   * Sorted so a layout change produces a readable diff rather than a reshuffle.
   *
   * `doors`, when given, is emitted as a second export. Nothing in the running game reads it; it
   * exists so tests/unit/map-path-network.test.js can assert the property this whole pipeline is for
   * — that every door a generator declared has road within reach of it — against exactly the cells
   * the generator used, rather than against a guess about which collision rects are buildings.
   *
   * `roads` is emitted as a third, and unlike `doors` the running game *does* read it: engine/
   * npc-routing.js costs a road cell a quarter of what it costs to cross open ground, which is what
   * sends a routed NPC down the high street instead of diagonally over the crop beds. Membership
   * has to come from the network's own record rather than from the ground tile — Riverbend paves its
   * roads in the same shore sand as its riverbank, so reading it back off the tiles would file the
   * whole beach as road. RoadNetwork was already keeping that record for the spur router.
   */
  toBlocksModule(mapId, generatorPath, { doors, roads } = {}) {
    const sorted = [...this.blocks].sort(
      (a, b) => a.y1 - b.y1 || a.x1 - b.x1 || a.kind.localeCompare(b.kind)
    );
    const num = (n) => (Number.isInteger(n) ? `${n}.0` : `${n}`);
    const lines = [
      `// GENERATED by ${generatorPath} — do not edit by hand.`,
      "//",
      "// One rect per stamped object, derived from the stamp itself rather than transcribed from",
      "// it. Before Phase 53 this was a hand-maintained array in main.js and the generator wrote",
      "// the matching rect in a trailing comment on every stamp() call; buildings carried only a",
      "// ground-contact row, so the player could walk onto their roofs.",
      "//",
      "// Buildings block their whole footprint. Trees and poles block only their base row and put",
      "// everything above it on the map's overlay layer, so the player passes behind the canopy.",
      "",
      `export const ${mapId} = [`,
    ];
    for (const rect of sorted) {
      lines.push(
        `  { x1: ${num(rect.x1)}, y1: ${num(rect.y1)}, x2: ${num(rect.x2)}, ` +
          `y2: ${num(rect.y2)}, kind: ${JSON.stringify(rect.kind)} },`
      );
    }
    lines.push("];");
    if (doors) {
      const sortedDoors = [...doors].sort((a, b) => a.row - b.row || a.col - b.col);
      lines.push("");
      lines.push("// The cell each building is entered from — below the centre of its front row.");
      lines.push("// Every one of these must have road within reach; see the test named above.");
      lines.push(`export const ${mapId.replace(/_BLOCKS$/, "_DOORS")} = [`);
      for (const door of sortedDoors) lines.push(`  { col: ${door.col}, row: ${door.row} },`);
      lines.push("];");
    }
    if (roads) {
      // [col, row] pairs rather than objects, eight to a line: this is the largest of the three
      // exports by an order of magnitude, and a hundred `{ col: n, row: n }` literals per screen
      // makes a layout diff unreadable.
      const cells = [...roads]
        .map((key) => key.split(",").map(Number))
        .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      lines.push("");
      lines.push(
        "// Every cell the road network owns — the authored trunk plus the spurs the router"
      );
      lines.push(
        "// laid to each door. Read at runtime by engine/npc-routing.js, which prefers these"
      );
      lines.push("// cells so a routed NPC walks the road rather than cutting across the fields.");
      lines.push(`export const ${mapId.replace(/_BLOCKS$/, "_ROADS")} = [`);
      for (let index = 0; index < cells.length; index += 8) {
        const row = cells
          .slice(index, index + 8)
          .map(([col, cellRow]) => `[${col}, ${cellRow}]`)
          .join(", ");
        lines.push(`  ${row},`);
      }
      lines.push("];");
    }
    lines.push("");
    return lines.join("\n");
  }
}

/**
 * Deterministic per-cell hash in [0,1).
 *
 * The obvious `(col * a + row * b) % m` scatter this replaces produces visible diagonal banding
 * once a map is large enough — at 56x36 it laid a regular lattice across the whole island rather
 * than reading as natural scrub. Mixing the coordinates before taking the remainder breaks the
 * alignment while staying fully reproducible (no RNG, same output every run).
 */
export function hash01(col, row, salt) {
  let h = (col + 1) * 374761393 + (row + 1) * 668265263 + salt * 2246822519;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Picks one of `choices` deterministically for this cell. */
export function pick(choices, col, row, salt) {
  return choices[Math.floor(hash01(col, row, salt) * choices.length)];
}
