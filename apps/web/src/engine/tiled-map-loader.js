// Minimal Tiled (.tmj) tile-layer compositor for the Riverbend Tiled proof of concept.
// Draws a Tiled JSON map's tile layers onto a <canvas>, resolving each tileset's GID range
// to a source rectangle in its spritesheet image. Scoped to what the POC map actually uses
// (orthogonal orientation, uncompressed tile-layer data, no flip/rotate flags).

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

// resolveImageUrl(tileset) -> string, lets the caller map a tmj-relative "image" path
// to a bundler-resolved asset URL without this module knowing about Vite.
export async function renderTiledMap(canvas, tmj, resolveImageUrl) {
  const ctx = canvas.getContext("2d");
  canvas.width = tmj.width * tmj.tilewidth;
  canvas.height = tmj.height * tmj.tileheight;
  ctx.imageSmoothingEnabled = false;

  const images = await Promise.all(
    tmj.tilesets.map((tileset) => loadImage(resolveImageUrl(tileset)))
  );
  const imageByTileset = new Map(tmj.tilesets.map((tileset, index) => [tileset, images[index]]));

  for (const layer of tmj.layers) {
    if (layer.type !== "tilelayer" || !layer.visible) continue;
    for (let row = 0; row < layer.height; row += 1) {
      for (let col = 0; col < layer.width; col += 1) {
        const gid = layer.data[row * layer.width + col];
        if (!gid) continue;
        const tileset = tilesetForGid(tmj.tilesets, gid);
        if (!tileset) continue;
        const image = imageByTileset.get(tileset);
        const localId = gid - tileset.firstgid;
        const sx = (localId % tileset.columns) * tileset.tilewidth;
        const sy = Math.floor(localId / tileset.columns) * tileset.tileheight;
        const dx = col * tmj.tilewidth;
        // Anchor larger-than-grid tiles (e.g. 96px tiles on a 48px map grid) by their
        // bottom edge to the tile's grid cell, matching Tiled's own default tile alignment.
        const dy = (row + 1) * tmj.tileheight - tileset.tileheight;
        ctx.drawImage(
          image,
          sx,
          sy,
          tileset.tilewidth,
          tileset.tileheight,
          dx,
          dy,
          tileset.tilewidth,
          tileset.tileheight
        );
      }
    }
  }
}
