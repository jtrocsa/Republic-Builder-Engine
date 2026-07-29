import { describe, it, expect } from "vitest";
import {
  tilesForFrame,
  createTilesetImageResolver,
  isOverlayLayer,
  selectLayers,
  hasOverlayLayers,
} from "../../apps/web/src/engine/tiled-map-loader.js";

function tileset({ firstgid, columns = 4, tilewidth = 48, tileheight = 48, tiles }) {
  return { firstgid, columns, tilewidth, tileheight, tiles };
}

describe("tilesForFrame", () => {
  it("skips empty (0) cells rather than drawing a placeholder (normal case)", () => {
    const tmj = {
      tilewidth: 48,
      tileheight: 48,
      tilesets: [tileset({ firstgid: 1 })],
      layers: [{ type: "tilelayer", visible: true, width: 2, height: 1, data: [0, 5] }],
    };
    const tiles = tilesForFrame(tmj);
    expect(tiles).toHaveLength(1);
    expect(tiles[0].dx).toBe(48); // the second cell (col 1), not the empty first one
  });

  it("resolves each GID against the correct tileset when a map has multiple tilesets (normal case)", () => {
    const tilesetA = tileset({ firstgid: 1, columns: 4 });
    const tilesetB = tileset({ firstgid: 100, columns: 8 });
    const tmj = {
      tilewidth: 48,
      tileheight: 48,
      tilesets: [tilesetA, tilesetB],
      layers: [
        // gid 5 -> tilesetA (localId 4); gid 101 -> tilesetB (localId 1)
        { type: "tilelayer", visible: true, width: 2, height: 1, data: [5, 101] },
      ],
    };
    const tiles = tilesForFrame(tmj);
    expect(tiles).toHaveLength(2);
    expect(tiles[0].tileset).toBe(tilesetA);
    expect(tiles[0].sx).toBe(0); // localId 4 % columns 4 = 0
    expect(tiles[0].sy).toBe(48); // floor(4 / 4) * 48
    expect(tiles[1].tileset).toBe(tilesetB);
    expect(tiles[1].sx).toBe(48); // localId 1 % columns 8 = 1
    expect(tiles[1].sy).toBe(0);
  });

  it("ignores hidden and non-tile layers (normal case)", () => {
    const tmj = {
      tilewidth: 48,
      tileheight: 48,
      tilesets: [tileset({ firstgid: 1 })],
      layers: [
        { type: "tilelayer", visible: false, width: 1, height: 1, data: [5] },
        { type: "objectgroup", visible: true, width: 1, height: 1, data: [5] },
      ],
    };
    expect(tilesForFrame(tmj)).toHaveLength(0);
  });

  it("picks the animated tile's active frame for the given elapsed time (normal case)", () => {
    const animatedTileset = tileset({
      firstgid: 1,
      columns: 4,
      tiles: [
        {
          id: 4,
          animation: [
            { tileid: 4, duration: 100 },
            { tileid: 6, duration: 100 },
          ],
        },
      ],
    });
    const tmj = {
      tilewidth: 48,
      tileheight: 48,
      tilesets: [animatedTileset],
      // gid 5 -> localId 4, the animated tile
      layers: [{ type: "tilelayer", visible: true, width: 1, height: 1, data: [5] }],
    };
    const firstFrame = tilesForFrame(tmj, 50); // 50ms into a 100/100ms cycle -> frame 0 (tileid 4)
    expect(firstFrame[0].sx).toBe(0); // localId 4 % 4 = 0
    expect(firstFrame[0].sy).toBe(48); // floor(4 / 4) * 48

    const secondFrame = tilesForFrame(tmj, 150); // 150ms -> wraps into frame 1 (tileid 6)
    expect(secondFrame[0].sx).toBe(96); // localId 6 % 4 = 2 -> 2 * 48
    expect(secondFrame[0].sy).toBe(48); // floor(6 / 4) * 48

    const wrapped = tilesForFrame(tmj, 250); // 250ms wraps (250 % 200 = 50) back to frame 0
    expect(wrapped[0].sx).toBe(0);
  });

  it("leaves a non-animated tile at the same frame regardless of elapsed time (boundary case)", () => {
    const tmj = {
      tilewidth: 48,
      tileheight: 48,
      tilesets: [tileset({ firstgid: 1, columns: 4 })],
      layers: [{ type: "tilelayer", visible: true, width: 1, height: 1, data: [5] }],
    };
    expect(tilesForFrame(tmj, 0)).toEqual(tilesForFrame(tmj, 99999));
  });
});

describe("overlay layers (walk-behind depth)", () => {
  function twoBandMap() {
    return {
      tilewidth: 48,
      tileheight: 48,
      tilesets: [tileset({ firstgid: 1 })],
      layers: [
        { type: "tilelayer", name: "ground", visible: true, width: 1, height: 1, data: [5] },
        { type: "tilelayer", name: "structures", visible: true, width: 1, height: 1, data: [6] },
        { type: "tilelayer", name: "overlay", visible: true, width: 1, height: 1, data: [7] },
      ],
    };
  }

  it("classifies a layer as overlay by its name prefix, case-insensitively (normal case)", () => {
    expect(isOverlayLayer({ name: "overlay" })).toBe(true);
    expect(isOverlayLayer({ name: "Overlay-Canopy" })).toBe(true);
    expect(isOverlayLayer({ name: "  overlay2 " })).toBe(true);
    expect(isOverlayLayer({ name: "ground" })).toBe(false);
    expect(isOverlayLayer({ name: "structures" })).toBe(false);
  });

  it("treats a nameless layer as below-player rather than throwing (edge case)", () => {
    expect(isOverlayLayer({})).toBe(false);
    expect(isOverlayLayer(undefined)).toBe(false);
  });

  it("does not misclassify a layer that merely contains the word overlay (edge case)", () => {
    // Only a prefix counts, so "structures-overlay-shadow" stays below the player.
    expect(isOverlayLayer({ name: "structures-overlay-shadow" })).toBe(false);
  });

  it("splits layers into below/overlay bands that partition the map (normal case)", () => {
    const tmj = twoBandMap();
    expect(selectLayers(tmj, "below").map((l) => l.name)).toEqual(["ground", "structures"]);
    expect(selectLayers(tmj, "overlay").map((l) => l.name)).toEqual(["overlay"]);
    expect(selectLayers(tmj, "all")).toHaveLength(3);
  });

  it("draws only the requested band, and the two bands sum to the whole map (normal case)", () => {
    const tmj = twoBandMap();
    const below = tilesForFrame(tmj, 0, undefined, "below");
    const overlay = tilesForFrame(tmj, 0, undefined, "overlay");
    const all = tilesForFrame(tmj, 0, undefined, "all");
    expect(below).toHaveLength(2);
    expect(overlay).toHaveLength(1);
    expect(below.length + overlay.length).toBe(all.length);
    // gid 7 -> localId 6 -> col 2, row 1 of a 4-column tileset
    expect(overlay[0].sx).toBe(96);
    expect(overlay[0].sy).toBe(48);
  });

  it("defaults to drawing every layer, so pre-overlay callers are unaffected (boundary case)", () => {
    const tmj = twoBandMap();
    expect(tilesForFrame(tmj)).toEqual(tilesForFrame(tmj, 0, undefined, "all"));
  });

  it("reports whether a second canvas is worth creating (normal case)", () => {
    expect(hasOverlayLayers(twoBandMap())).toBe(true);
    const noOverlay = twoBandMap();
    noOverlay.layers = noOverlay.layers.filter((l) => l.name !== "overlay");
    expect(hasOverlayLayers(noOverlay)).toBe(false);
  });

  it("does not count a hidden overlay layer as needing a canvas (edge case)", () => {
    const tmj = twoBandMap();
    tmj.layers[2].visible = false;
    expect(hasOverlayLayers(tmj)).toBe(false);
    expect(tilesForFrame(tmj, 0, undefined, "overlay")).toHaveLength(0);
  });
});

describe("createTilesetImageResolver", () => {
  const fakeGlob = {
    "../assets/tilesets/Medieval Fishing Village/tile-B-04.png": "/bundled/tile-B-04-hash.png",
    "../assets/tilesets/farm/3.png": "/bundled/farm-3-hash.png",
  };

  it("resolves a tileset image regardless of how many ../ segments Tiled authored (normal case)", () => {
    const resolve = createTilesetImageResolver(fakeGlob);
    const url = resolve({ image: "../../assets/tilesets/Medieval Fishing Village/tile-B-04.png" });
    expect(url).toBe("/bundled/tile-B-04-hash.png");
  });

  it("resolves the same image via a differently-nested relative path, by matching the tail (normal case)", () => {
    const resolve = createTilesetImageResolver(fakeGlob);
    const deepUrl = resolve({ image: "../../../../assets/tilesets/farm/3.png" });
    const shallowUrl = resolve({ image: "../assets/tilesets/farm/3.png" });
    expect(deepUrl).toBe(shallowUrl);
  });

  it("merges multiple globbed pack folders passed as separate arguments (normal case)", () => {
    const resolve = createTilesetImageResolver(
      { "../assets/tilesets/Medieval harbor/tile-B-03.png": "/bundled/harbor-b03-hash.png" },
      fakeGlob
    );
    expect(resolve({ image: "../../assets/tilesets/Medieval harbor/tile-B-03.png" })).toBe(
      "/bundled/harbor-b03-hash.png"
    );
    expect(resolve({ image: "../../assets/tilesets/farm/3.png" })).toBe("/bundled/farm-3-hash.png");
  });

  it("throws a clear, actionable error when the image isn't in any globbed folder (edge case)", () => {
    const resolve = createTilesetImageResolver(fakeGlob);
    expect(() => resolve({ image: "../../assets/tilesets/Nonexistent/ghost.png" })).toThrow(
      /no bundled asset/
    );
  });
});
