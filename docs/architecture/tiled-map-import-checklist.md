# Tiled export checklist

How to export a map you've hand-built in the Tiled desktop app so it drops into this repo and
renders correctly, without needing back-and-forth. This is the authoring contract the loader
(`apps/web/src/engine/tiled-map-loader.js`) is written against — follow it and a new map should
just work.

## 1. Map settings (set these before you start building, not after)

- **Orientation:** Orthogonal.
- **Tile layer format:** CSV (uncompressed). Tiled defaults to Base64/zlib for some project
  templates — the loader reads plain `data: [gid, gid, ...]` arrays, not compressed strings.
  Map Properties → Tile Layer Format → **CSV**.
- **Map size:** 40 columns × 24 rows, tile size 48×48px, to match the existing field viewport
  (`FIELD_GRID` in `main.js`). A different size will still render (the canvas is scaled to fit
  its container via CSS), but the world will look stretched relative to how collision/NPC/source
  coordinates are authored, so don't change this without also revisiting those.
- **Don't use flip/rotate** on placed tiles (horizontal/vertical/diagonal flip flags) — not
  currently read by the loader; a flipped tile will draw using its unflipped source rect.

## 2. Tileset images

- Copy the tileset image file(s) into `apps/web/src/assets/tilesets/<PackName>/` in this repo
  **before** you point Tiled's tileset at them. Tiled will happily reference an image anywhere on
  your machine, but the loader can only resolve images that are physically checked into that
  folder.
- In Tiled's tileset editor, browse to that copied file. Tiled will write whatever relative path
  it computes (e.g. `../../assets/tilesets/PackName/sheet.png`) into the `.tmj` — you don't need
  to hand-edit this. The loader matches by the path tail after `assets/tilesets/`, so it doesn't
  matter how many `../` segments Tiled writes or what machine authored it.
- Multiple tilesets on one map are fine — any number, any mix of tile sizes (a larger tile, e.g.
  96px art on a 48px map grid, is anchored to the bottom edge of its grid cell, matching Tiled's
  own oversized-tile convention).
- **New pack folder you haven't used before:** tell me the folder name after exporting. The
  image resolver is scoped per pack folder (see "why" below) rather than globbing all of
  `assets/tilesets/`, so a brand-new folder needs one line added where the map is wired up in
  `main.js`. Reusing an already-referenced pack folder needs no code change at all.
  - _Why scoped, not automatic-for-everything:_ `assets/tilesets/` also holds downloaded packs
    that aren't used by any real map yet. An unscoped "bundle anything in this folder" glob
    pulled all of them into the production build — 117MB of unused art in one measurement during
    this work — so the loader only bundles the pack folders a map's wiring actually globs.

## 3. Animated tiles (optional)

- Use Tiled's built-in Tile Animation Editor (right-click a tile in the tileset view → _Tile
  Animation Editor_) to add frames and per-frame durations. No special naming or per-tile code
  is needed — the loader reads the standard `tiles[].animation` array Tiled writes and animates
  any tile that has one, generically.
- A map with zero animated tiles renders exactly as before: one static draw, no extra
  per-frame redraw loop, no performance cost from this feature existing.

## 4. Export

- File → Export As → **`.tmj`** (Tiled's JSON format — not `.tmx`, the XML format).
- Save it into `apps/web/src/content/maps/<map-name>.tmj` in this repo (matching the
  `riverbend-field.tmj` convention).

## 5. What to tell me afterward

- The `.tmj` file's path (or confirm you saved it into `content/maps/` directly).
- Whether any tileset image is under a **pack folder not already referenced** by an existing map
  (see §2) — if so, name the folder.
- Anything you intended to be walkable/blocked, if it isn't obvious from the art (e.g. "the dock
  planks are walkable, the water isn't") — the `.tmj` only carries visuals; collision is still
  authored separately as a hand-coded block/land-check array in `main.js`, the same as every
  other map in this repo.

## Out of scope / not checked by anything else

- `.tmj` files are **not** validated by `npm run validate:content` — that pipeline is Zod
  schemas for Unit content (quests, sources, NPCs), a separate concern from map art.
- Nothing here validates that a `.tmj`'s declared `width`/`height`/`tilewidth`/`tileheight` match
  `FIELD_GRID` — mismatches will render (scaled to fit) but should be caught by looking at it,
  not by a passing build.
