// Generic Tiled (.tmj) tile-layer compositor. Draws a Tiled JSON map's tile layers onto a
// <canvas>, resolving each tileset's GID range to a source rectangle in its spritesheet image.
// Scoped to orthogonal orientation, uncompressed tile-layer data, no flip/rotate flags (Tiled's
// default export shape) — that covers hand-authored maps exported from the desktop app.
// Handles, generically (not per-map hardcoded): empty cells, any number of tilesets, and
// per-tile animation. See docs/architecture/tiled-map-import-checklist.md for the authoring
// convention this expects (tileset images living under apps/web/src/assets/tilesets/).

const imageCache = new Map();

function loadImage(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  const promise = new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
  imageCache.set(url, promise);
  return promise;
}

function tilesetForGid(tilesets, gid) {
  for (let i = tilesets.length - 1; i >= 0; i -= 1) {
    if (gid >= tilesets[i].firstgid) return tilesets[i];
  }
  return null;
}

function tilesetImagePathTail(path) {
  const normalized = String(path).replace(/\\/g, "/");
  const marker = "assets/tilesets/";
  const index = normalized.indexOf(marker);
  return index === -1 ? normalized : normalized.slice(index + marker.length);
}

// Builds a resolveImageUrl(tileset) function from one or more Vite `import.meta.glob` results
// (each caller passes its own — see main.js). Matches by the path tail from "assets/tilesets/"
// onward, so it doesn't matter how many `../` segments Tiled wrote or how the map was exported
// on whatever machine — only that the image file lives under one of the globbed folders.
//
// Deliberately NOT a single always-on glob over the whole assets/tilesets/ tree: that tree is
// also where downloaded-but-unused art packs sit while they're being evaluated, and Vite bundles
// every file a glob matches into the production build whether or not it's ever drawn — an
// eager, unscoped glob would ship every pack in that folder in every build. Callers glob only
// the specific pack folders their maps actually reference.
export function createTilesetImageResolver(...globResults) {
  const byTail = new Map();
  for (const globResult of globResults) {
    for (const [key, url] of Object.entries(globResult)) {
      byTail.set(tilesetImagePathTail(key), url);
    }
  }
  return function resolveTilesetImage(tileset) {
    const tail = tilesetImagePathTail(tileset.image);
    const url = byTail.get(tail);
    if (!url) {
      throw new Error(
        `tiled-map-loader: no bundled asset for tileset image "${tileset.image}" ` +
          `(looked for apps/web/src/assets/tilesets/${tail}). Either the image hasn't been ` +
          `copied into apps/web/src/assets/tilesets/, or its pack folder isn't yet globbed by ` +
          `the caller — see docs/architecture/tiled-map-import-checklist.md.`
      );
    }
    return url;
  };
}

// Tiled stores per-tile animation as `tiles: [{ id, animation: [{ tileid, duration }, ...] }]`
// on the tileset, where `id`/`tileid` are local (0-based) tile ids within that tileset, not GIDs.
function animationIndexForTileset(tileset) {
  const index = new Map();
  for (const tile of tileset.tiles || []) {
    if (Array.isArray(tile.animation) && tile.animation.length > 0) {
      index.set(tile.id, tile.animation);
    }
  }
  return index;
}

function activeLocalId(animation, elapsedMs) {
  const total = animation.reduce((sum, frame) => sum + frame.duration, 0);
  if (total <= 0) return animation[0].tileid;
  let remaining = elapsedMs % total;
  for (const frame of animation) {
    if (remaining < frame.duration) return frame.tileid;
    remaining -= frame.duration;
  }
  return animation[animation.length - 1].tileid;
}

function animationIndexByTileset(tmj) {
  return new Map(tmj.tilesets.map((tileset) => [tileset, animationIndexForTileset(tileset)]));
}

// Pure (no canvas) resolution of "what to draw where" for one frame: walks every visible
// tile layer, skips empty cells, resolves each GID to its owning tileset (however many
// tilesets the map has) and source rect, and picks the animated frame active at elapsedMs.
// Exported so this logic — the actual hardening in this module — can be unit-tested without
// a real 2D canvas context, which the jsdom test environment doesn't provide.
export function tilesForFrame(tmj, elapsedMs = 0, animationByTileset = animationIndexByTileset(tmj)) {
  const tiles = [];
  for (const layer of tmj.layers) {
    if (layer.type !== "tilelayer" || !layer.visible) continue;
    for (let row = 0; row < layer.height; row += 1) {
      for (let col = 0; col < layer.width; col += 1) {
        const gid = layer.data[row * layer.width + col];
        if (!gid) continue; // 0 means "no tile here" — draw nothing, not a placeholder.
        const tileset = tilesetForGid(tmj.tilesets, gid);
        if (!tileset) continue;
        let localId = gid - tileset.firstgid;
        const animation = animationByTileset.get(tileset).get(localId);
        if (animation) localId = activeLocalId(animation, elapsedMs);
        const sx = (localId % tileset.columns) * tileset.tilewidth;
        const sy = Math.floor(localId / tileset.columns) * tileset.tileheight;
        const dx = col * tmj.tilewidth;
        // Anchor larger-than-grid tiles (e.g. 96px tiles on a 48px map grid) by their
        // bottom edge to the tile's grid cell, matching Tiled's own default tile alignment.
        const dy = (row + 1) * tmj.tileheight - tileset.tileheight;
        tiles.push({
          tileset,
          sx,
          sy,
          dx,
          dy,
          tilewidth: tileset.tilewidth,
          tileheight: tileset.tileheight,
        });
      }
    }
  }
  return tiles;
}

// resolveImageUrl(tileset) -> string. Build one with createTilesetImageResolver() above.
export async function renderTiledMap(canvas, tmj, resolveImageUrl) {
  const ctx = canvas.getContext("2d");
  canvas.width = tmj.width * tmj.tilewidth;
  canvas.height = tmj.height * tmj.tileheight;
  ctx.imageSmoothingEnabled = false;

  const images = await Promise.all(
    tmj.tilesets.map((tileset) => loadImage(resolveImageUrl(tileset)))
  );
  const imageByTileset = new Map(tmj.tilesets.map((tileset, index) => [tileset, images[index]]));
  const animationByTileset = animationIndexByTileset(tmj);
  const hasAnimation = [...animationByTileset.values()].some((index) => index.size > 0);

  function drawFrame(elapsedMs) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const tile of tilesForFrame(tmj, elapsedMs, animationByTileset)) {
      const image = imageByTileset.get(tile.tileset);
      ctx.drawImage(
        image,
        tile.sx,
        tile.sy,
        tile.tilewidth,
        tile.tileheight,
        tile.dx,
        tile.dy,
        tile.tilewidth,
        tile.tileheight
      );
    }
  }

  drawFrame(0);
  if (!hasAnimation) return; // No animated tiles: one static draw, same cost as before.

  const start = performance.now();
  const tick = (now) => {
    if (!canvas.isConnected) return; // Map screen left/unmounted: stop redrawing.
    drawFrame(now - start);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
