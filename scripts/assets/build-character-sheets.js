// Builds Chronicle's character sprite sheets from the PixelLab cast.
//
//   node scripts/assets/build-character-sheets.js --fetch     download source frames into the cache
//   node scripts/assets/build-character-sheets.js --measure   report per-character content bounds
//   node scripts/assets/build-character-sheets.js             build the strips + portraits
//
// Output, per character, into apps/web/src/assets/:
//   <stem>-down.png  <stem>-up.png  <stem>-left.png  <stem>-right.png    walk strips
//   <stem>-portrait.png                                                  one south standing pose
//
// A strip is one horizontal row of equal-width columns: [stand, walk0 … walkN-1]. Column 0 is the
// direction's static rotation, so a character that stops walking holds a real standing pose facing
// the way it last travelled. Frame counts differ per character (Director Hale is 6, everyone else
// 8), which is why the column count travels with the character rather than being a constant.
//
// ── Why this does not call scripts/assets/normalize-sprite-frames.js ─────────────────────────────
// That script crops *each frame to its own* alpha bounding box before bottom-aligning it. For a
// two-pose idle/step group that is the right fix (it is what stopped the Director's feet drifting
// a pixel per step). For a walk cycle it is destructive: snapping every frame to a shared bottom
// and centre removes exactly the sub-pixel body motion the animation consists of, and a frame with
// a lifted foot would be pushed down onto the ground line.
//
// So this script measures the alpha bounds of every frame of a character *together*, takes the
// union as one crop window, and extracts that identical rect from every frame. Relative motion
// survives; the ground line is shared because the window is shared. Same goal, opposite mechanism,
// and the right one for multi-frame art.
import { Buffer } from "node:buffer";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

import sharp from "sharp";

import { SPRITE_CANVAS } from "../../apps/web/src/engine/sprite-animation.js";

import {
  CHARACTERS,
  COMPASS,
  DIRECTIONS,
  LEGACY_CHARACTERS,
  frameUrl,
  rotationUrl,
} from "./character-manifest.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ASSETS = path.join(REPO_ROOT, "apps/web/src/assets");
const LEGACY_DIR = path.join(ASSETS, "chronicle-sprites/field");
const CACHE = path.join(REPO_ROOT, "reports/pixellab-cache");

/**
 * A frame's opaque pixels, as per-row and per-column counts plus the raw alpha box. Counts are
 * what make it possible to tell a body apart from a prop: a torso is 8-20px wide on every row it
 * occupies, a spear shaft or a raised bow is one to three.
 */
async function scan(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rows = new Array(info.height).fill(0);
  const xs = [];
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] === 0) continue;
      rows[y] += 1;
      xs.push(x);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  xs.sort((a, b) => a - b);
  return {
    rows,
    box: { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
    // The median is used rather than the mean because it is what makes prop-independent centring
    // work: a spear adds a few dozen pixels off to one side, which drags a mean but barely moves a
    // median through several hundred body pixels.
    medianX: xs[Math.floor(xs.length / 2)],
  };
}

/** Rows carrying at least `minWidth` opaque pixels — i.e. body rows, not prop rows. */
const BODY_ROW_WIDTH = 4;
function bodySpan(rows, minWidth = BODY_ROW_WIDTH) {
  let top = -1;
  let bottom = -1;
  for (let y = 0; y < rows.length; y += 1) {
    if (rows[y] < minWidth) continue;
    if (top < 0) top = y;
    bottom = y;
  }
  return top < 0 ? null : { top, bottom, height: bottom - top + 1 };
}

function unionBounds(boxes) {
  const left = Math.min(...boxes.map((b) => b.left));
  const top = Math.min(...boxes.map((b) => b.top));
  const right = Math.max(...boxes.map((b) => b.left + b.width));
  const bottom = Math.max(...boxes.map((b) => b.top + b.height));
  return { left, top, width: right - left, height: bottom - top };
}

// ---- source frames -----------------------------------------------------------------------------

function cachePath(character, compass, index) {
  const name = index === null ? `${compass}-stand.png` : `${compass}-${index}.png`;
  return path.join(CACHE, character.key, name);
}

async function download(url, target) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
}

/**
 * Minimal zip reader — walks the central directory, inflating stored and deflated entries.
 *
 * Here rather than a dependency because it is the only archive this repo ever opens, and it opens
 * exactly one shape: PixelLab's character download. Twenty lines beats a package.
 */
function unzip(buffer) {
  const files = new Map();
  for (let i = 0; i < buffer.length - 4; i += 1) {
    if (buffer.readUInt32LE(i) !== 0x02014b50) continue; // central directory file header
    const nameLength = buffer.readUInt16LE(i + 28);
    const name = buffer.toString("utf8", i + 46, i + 46 + nameLength);
    const offset = buffer.readUInt32LE(i + 42);
    const method = buffer.readUInt16LE(offset + 8);
    const compressed = buffer.readUInt32LE(offset + 18);
    const start = offset + 30 + buffer.readUInt16LE(offset + 26) + buffer.readUInt16LE(offset + 28);
    const raw = buffer.subarray(start, start + compressed);
    files.set(name, method === 0 ? raw : zlib.inflateRawSync(raw));
  }
  return files;
}

/**
 * One zip per character holding every rotation and every animation frame, addressed by character id
 * alone.
 *
 * The per-frame CDN URLs above need a separate animation UUID for each direction, and those UUIDs
 * only exist for the cast imported before Unit 4 — PixelLab stopped surfacing them and everything
 * generated since was downloaded this way instead. So a character with no `walk` ids is not
 * missing data: it is on the newer route, and this is the only way back to its source art if the
 * cache is ever cold. Which is the whole reason the ids live in this file at all.
 */
const BULK_DOWNLOAD = (id) => `https://api.pixellab.ai/mcp/characters/${id}/download`;

async function fetchBulk(character) {
  const response = await fetch(BULK_DOWNLOAD(character.id));
  // PixelLab answers 423 while any job on the character is still running, so the endpoint doubles
  // as a completion check — a character fetched too early is not a failed one.
  if (response.status === 423) throw new Error(`${character.key}: generation still running`);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${character.key}`);
  }
  const files = unzip(Buffer.from(await response.arrayBuffer()));
  const state = JSON.parse(files.get("metadata.json").toString("utf8")).states?.[0];
  if (!state) throw new Error(`${character.key}: archive has no character state`);
  // A character can hold more than one animation group, so which one to build from is stated
  // rather than guessed. Most of the Unit 4/5 cast carries two: an abandoned v3 walk whose back
  // view drifts several pixels up the canvas over the cycle, and the template walk that replaced
  // it. Taking "the first group" would pick between them by whatever order the archive happens to
  // list, which is how a character silently ships the broken cycle.
  const groups = Object.entries(state.frames?.animations ?? {});
  const group = character.walkGroup
    ? groups.find(([name]) => name === character.walkGroup)
    : groups[0];
  if (character.walkGroup && !group) {
    throw new Error(`${character.key}: no animation group named ${character.walkGroup}`);
  }
  const [, byDirection] = group ?? [null, {}];
  for (const direction of DIRECTIONS) {
    const compass = COMPASS[direction];
    const stand = cachePath(character, compass, null);
    mkdirSync(path.dirname(stand), { recursive: true });
    writeFileSync(stand, files.get(state.frames.rotations[compass]));
    (byDirection[compass] ?? []).forEach((source, n) => {
      writeFileSync(cachePath(character, compass, n), files.get(source));
    });
  }
}

async function fetchAll() {
  const waiting = [];
  for (const character of CHARACTERS) {
    if (!character.walk) {
      // A character whose jobs are still running is reported and skipped rather than aborting the
      // run. Importing a cast is incremental by nature — several are always still generating — and
      // a throw here would discard every download that came after it in the list.
      if (!existsSync(cachePath(character, "south", null))) {
        try {
          await fetchBulk(character);
        } catch (error) {
          if (!/still running/.test(error.message)) throw error;
          waiting.push(character.key);
          continue;
        }
      }
      console.log(`fetched ${character.key} (bulk)`);
      continue;
    }
    for (const direction of DIRECTIONS) {
      const compass = COMPASS[direction];
      const stand = cachePath(character, compass, null);
      if (!existsSync(stand)) await download(rotationUrl(character, compass), stand);
      if (!character.walk[compass]) continue;
      for (let n = 0; n < character.frames; n += 1) {
        const target = cachePath(character, compass, n);
        if (!existsSync(target)) await download(frameUrl(character, compass, n), target);
      }
    }
    console.log(`fetched ${character.key}`);
  }
  if (waiting.length) {
    console.log(`\nstill generating, re-run to collect: ${waiting.join(", ")}`);
  }
}

/**
 * Every source frame of one character, as { direction, column, buffer }. Column 0 is the standing
 * rotation. A character with `mirrorWestFromEast` has no west walk animation in PixelLab, so its
 * west moving columns are its east frames flipped — done here, in the asset, so that nothing
 * mirrors at runtime and the rest of the cast stays honest four-direction art.
 *
 * That flag is the whole test, deliberately. It used to be inferred from a missing `walk` id, which
 * worked only while every character carried four of them: the Unit 4/5 cast arrives through
 * fetchBulk() with no ids at all, and the inference would have quietly mirrored east onto all four
 * directions for twenty characters whose real north and west art was sitting in the cache.
 */
async function sourceFrames(character) {
  const frames = [];
  for (const direction of DIRECTIONS) {
    const compass = COMPASS[direction];
    frames.push({
      direction,
      column: 0,
      buffer: readFileSync(cachePath(character, compass, null)),
    });
    const mirrored = character.mirrorWestFromEast && compass === "west";
    const from = mirrored ? "east" : compass;
    for (let n = 0; n < character.frames; n += 1) {
      let buffer = readFileSync(cachePath(character, from, n));
      if (mirrored) buffer = await sharp(buffer).flop().png().toBuffer();
      frames.push({ direction, column: n + 1, buffer });
    }
  }
  return frames;
}

// ---- measurement -------------------------------------------------------------------------------

/**
 * Everything about one character's geometry, in source pixels:
 *
 *   window   the union of every frame's alpha box — the shared crop rect. Shared, so the frames
 *            keep their relative motion; union, so no prop is ever clipped.
 *   body     the height of the standing pose measured across body rows only. This, not the window,
 *            is what gets normalized between characters, because the window is inflated by
 *            whatever a character happens to be holding and by how far its limbs swing.
 *   stance   per direction, the lowest body row and the median opaque column of that direction's
 *            standing pose. Alignment is per direction rather than per character because PixelLab
 *            draws each rotation independently: Columbus's north pose stands two source rows
 *            higher than his south one, which would make him hop when he turned around. Since a
 *            direction is its own strip file, aligning them separately costs nothing and is a
 *            pure integer translation — no resampling.
 *   body     the height of the standing pose measured across body rows only. This, not the window,
 *            is what gets normalized between characters, because the window is inflated by
 *            whatever a character happens to be holding and by how far its limbs swing.
 */
async function measure(character) {
  const frames = await sourceFrames(character);
  const boxes = [];
  for (const frame of frames) {
    const s = await scan(frame.buffer);
    if (s) boxes.push(s.box);
  }

  let body = 0;
  const stance = {};
  for (const frame of frames.filter((f) => f.column === 0)) {
    const s = await scan(frame.buffer);
    const span = bodySpan(s.rows);
    body = Math.max(body, span.height);
    // The median rather than the box centre: a spear adds a few dozen pixels off to one side,
    // which drags a mean or a bounding box but barely moves a median through a body's worth of
    // pixels. That is what keeps a prop from deciding where the body sits.
    stance[frame.direction] = { ground: span.bottom, centreX: s.medianX };
  }

  return { character, frames, window: unionBounds(boxes), body, stance };
}

/**
 * How far a character's body height may differ from the cast target before it is rescaled.
 *
 * Twenty-one of the twenty-two land within 44-47px of each other — a 6.5% spread that reads as
 * ordinary variation in height, and rescaling any of them by 0.96 would resample the art for no
 * visible gain. Only the Powhatan woman is a real outlier at 40px, because PixelLab generated her
 * on an 80px canvas while the rest of the cast got 88-96px. Correcting a generation-parameter
 * accident is worth one resample; equalising natural height differences is not.
 */
const BODY_TOLERANCE = 0.06;
const TARGET_BODY = 45;

async function measureAll() {
  const measured = [];
  for (const character of CHARACTERS) measured.push(await measure(character));

  for (const entry of measured) {
    const ratio = TARGET_BODY / entry.body;
    entry.scale = Math.abs(ratio - 1) <= BODY_TOLERANCE ? 1 : ratio;
    entry.scaled = {
      width: Math.max(1, Math.round(entry.window.width * entry.scale)),
      height: Math.max(1, Math.round(entry.window.height * entry.scale)),
    };
    // Per direction: how far the crop window extends above that direction's ground line, and how
    // far below it. The canvas is built from the largest of each across the whole cast, so every
    // character's feet land on one row and no prop or stride overflows.
    entry.place = {};
    for (const direction of DIRECTIONS) {
      const { ground, centreX } = entry.stance[direction];
      entry.place[direction] = {
        above: Math.round((ground - entry.window.top) * entry.scale),
        below: Math.round((entry.window.top + entry.window.height - 1 - ground) * entry.scale),
        offsetX: Math.round((centreX - entry.window.left) * entry.scale),
      };
    }
  }
  return measured;
}

/**
 * One canvas for the entire cast: tall enough for the highest prop and the deepest walk-cycle dip,
 * wide enough for the widest reach, with the ground line on one fixed row. Because it is shared,
 * a body of N source pixels renders at the same on-screen height for every character, and CSS
 * needs no per-character or per-map compensation.
 *
 * ── Why the result is pinned rather than used as measured ────────────────────────────────────────
 * The 48x56 canvas this derived when the cast was first imported did not stay a derived number: it
 * is now a shipped contract. `SPRITE_CANVAS` states it, global.css computes `--cast-w`/`--cast-h`
 * from it, and tests/unit/character-sheet-geometry.test.js asserts every committed strip against
 * it. So letting one new character widen it does not just affect that character — it silently
 * rewrites all 100-odd existing PNGs at a new size and invalidates the CSS tokens and 20 visual
 * baselines along with them.
 *
 * A soldier's raised pike is exactly the kind of thing that would do it, and clipping a few pixels
 * off a pike tip is a far smaller loss than resizing the whole cast to accommodate it. So the
 * measured canvas is reported, and the pinned one is what gets built on. If a genuine reason to
 * change the canvas ever arrives, change `SPRITE_CANVAS` deliberately and re-bank everything
 * downstream — don't let a new character decide it.
 */
function measuredCanvas(measured) {
  const all = measured.flatMap((m) => DIRECTIONS.map((d) => ({ m, p: m.place[d] })));
  const above = Math.max(...all.map(({ p }) => p.above));
  const below = Math.max(...all.map(({ p }) => p.below));
  const halfWidth = Math.max(...all.flatMap(({ m, p }) => [p.offsetX, m.scaled.width - p.offsetX]));
  return {
    width: halfWidth * 2,
    height: above + below + 1,
    ground: above,
    body: TARGET_BODY,
  };
}

function canonicalCanvas(measured) {
  const wanted = measuredCanvas(measured);
  const canvas = {
    width: SPRITE_CANVAS.width,
    height: SPRITE_CANVAS.height,
    ground: SPRITE_CANVAS.ground - 1,
    body: TARGET_BODY,
  };
  const over = [];
  if (wanted.width > canvas.width) over.push(`width ${wanted.width}`);
  if (wanted.height > canvas.height) over.push(`height ${wanted.height}`);
  if (wanted.ground > canvas.ground) over.push(`ground row ${wanted.ground}`);
  if (over.length) {
    console.warn(
      `note: cast wants ${over.join(", ")}; pinned to ` +
        `${canvas.width}x${canvas.height} ground ${canvas.ground}. Overhanging props will clip.`
    );
  }
  return canvas;
}

/**
 * Where one direction's frames sit on the shared canvas, as two placements: one for the walk cycle
 * and one for the standing pose.
 *
 * Two, not one, because PixelLab generates a character's static rotations and its walk animation in
 * separate passes and does not place the body identically in both. Columbus's west rotation stands
 * three pixels lower in its source frame than any frame of his west walk cycle — align everything
 * to the rotation and he rises three pixels the moment he starts walking; align everything to the
 * cycle and he sinks three pixels the moment he stops.
 *
 * So the walk frames share one offset, taken from the most-planted frame in the cycle, which
 * preserves every bit of the stride's relative motion. The standing frame then gets its own offset
 * so that its feet land on that same line. Both are measured on the *scaled* bitmaps rather than
 * predicted from source coordinates: predicting means rounding `sourceRow * scale`, which lands a
 * pixel off about half the time for any non-integer scale.
 */
async function placements(standing, walking, canvas) {
  const footprint = async (buffer) => {
    const s = await scan(buffer);
    return { centreX: s.medianX, bottom: bodySpan(s.rows).bottom };
  };
  const stand = await footprint(standing);
  const cycle = await Promise.all(walking.map(footprint));
  // The frame whose feet reach lowest is the one actually standing on the ground; the others are
  // mid-stride and belong above it.
  const plant = Math.max(...cycle.map((c) => c.bottom));
  const centres = cycle.map((c) => c.centreX).sort((a, b) => a - b);
  return {
    walk: {
      left: canvas.width / 2 - centres[Math.floor(centres.length / 2)],
      top: canvas.ground - plant,
    },
    stand: { left: canvas.width / 2 - stand.centreX, top: canvas.ground - stand.bottom },
  };
}

// ---- build -------------------------------------------------------------------------------------

/** Crop one frame to the character's shared window, then nearest-neighbour scale it. */
async function normalizeFrame(buffer, window, scaled) {
  return sharp(buffer)
    .ensureAlpha()
    .extract(window)
    .resize(scaled.width, scaled.height, { kernel: "nearest", fit: "fill" })
    .png()
    .toBuffer();
}

/**
 * One frame's composite arguments for its cell of a strip, clipped to the cell.
 *
 * Needed because the canvas is pinned (see canonicalCanvas): a frame whose prop reaches past the
 * shared canvas would otherwise be handed to sharp at a negative offset or at a size larger than
 * its destination, and sharp rejects both outright rather than cropping. Clipping here is what
 * turns "this character is too wide" from a build crash into a few clipped pixels of pike.
 */
async function placeInCell(buffer, at, canvas) {
  const { width: w, height: h } = await sharp(buffer).metadata();
  const cropLeft = Math.max(0, -at.left);
  const cropTop = Math.max(0, -at.top);
  const left = Math.max(0, at.left);
  const top = Math.max(0, at.top);
  const width = Math.min(w - cropLeft, canvas.width - left);
  const height = Math.min(h - cropTop, canvas.height - top);
  if (width <= 0 || height <= 0) return null;
  const clipped = cropLeft > 0 || cropTop > 0 || width < w || height < h;
  const input = clipped
    ? await sharp(buffer).extract({ left: cropLeft, top: cropTop, width, height }).png().toBuffer()
    : buffer;
  return { input, left, top };
}

function blankCanvas(canvas) {
  return sharp({
    create: {
      width: canvas.width,
      height: canvas.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });
}

async function buildCharacter(entry, canvas) {
  const { character, frames, window, scaled } = entry;
  const columns = character.frames + 1;
  const written = [];

  const wheres = {};
  for (const direction of DIRECTIONS) {
    const ours = frames.filter((f) => f.direction === direction);
    const normalized = new Map();
    for (const frame of ours) {
      normalized.set(frame.column, await normalizeFrame(frame.buffer, window, scaled));
    }
    const where = await placements(
      normalized.get(0),
      [...normalized.entries()].filter(([c]) => c > 0).map(([, b]) => b),
      canvas
    );
    wheres[direction] = where;
    const strip = blankCanvas({ width: canvas.width * columns, height: canvas.height });
    const composites = [];
    for (const frame of ours) {
      const at = frame.column === 0 ? where.stand : where.walk;
      const placed = await placeInCell(normalized.get(frame.column), at, canvas);
      if (!placed) continue;
      composites.push({
        input: placed.input,
        left: frame.column * canvas.width + placed.left,
        top: placed.top,
      });
    }
    const target = path.join(ASSETS, `${character.stem}-${direction}.png`);
    mkdirSync(path.dirname(target), { recursive: true });
    await strip.composite(composites).png({ palette: true, dither: 0 }).toFile(target);
    written.push(target);
  }

  // The portrait is the same normalized south standing pose on the same canvas, kept as its own
  // single-frame file because several surfaces draw a character as a still image rather than as an
  // animated sprite: the onboarding Director scene, hub dialogue portraits, the hallway walk, the
  // village-activity cutscene and the Chronicler selection cards. Those must not be handed a strip.
  const stand = frames.find((f) => f.direction === "down" && f.column === 0);
  const portrait = blankCanvas(canvas).composite(
    [
      await placeInCell(
        await normalizeFrame(stand.buffer, window, scaled),
        wheres.down.stand,
        canvas
      ),
    ].filter(Boolean)
  );
  const portraitTarget = path.join(ASSETS, `${character.stem}-portrait.png`);
  const scaleUp = character.portraitScale ?? 1;
  const buffer = await portrait.png().toBuffer();
  await (
    scaleUp === 1
      ? sharp(buffer)
      : sharp(buffer).resize(canvas.width * scaleUp, canvas.height * scaleUp, {
          kernel: "nearest",
          fit: "fill",
        })
  )
    .png({ palette: true, dither: 0 })
    .toFile(portraitTarget);
  written.push(portraitTarget);

  return written;
}

/**
 * Unit 3's six placeholder characters, rebuilt into the same strip format so the game has exactly
 * one renderer. Their source art has only a down pose and a right-facing side pose, each with one
 * step frame, and no north pose at all — so `up` reuses the down art and `left` is the flipped side
 * art, which is precisely what the old renderer did with them. This changes nothing about how Unit
 * 3 looks; it only stops six 1492 Caribbean and Spanish sprites from being handed to Philadelphia
 * in 1767 once the real Unit 1 art lands on those keys.
 */
async function buildLegacy(canvas) {
  const written = [];
  for (const legacy of LEGACY_CHARACTERS) {
    const read = (suffix) => readFileSync(path.join(LEGACY_DIR, `${legacy.source}${suffix}.png`));
    const poses = {
      down: [read(""), read(""), read("-step")],
      up: [read(""), read(""), read("-step")],
      right: [read("-side"), read("-side"), read("-side-step")],
      left: [read("-side"), read("-side"), read("-side-step")],
    };

    const boxes = [];
    let body = 0;
    const stance = {};
    for (const [direction, buffers] of Object.entries(poses)) {
      for (const [column, buffer] of buffers.entries()) {
        const s = await scan(buffer);
        boxes.push(s.box);
        if (column !== 0) continue;
        const span = bodySpan(s.rows);
        if (direction === "down") body = span.height;
        stance[direction] = { ground: span.bottom, centreX: s.medianX };
      }
    }
    const window = unionBounds(boxes);
    const scale = canvas.body / body;
    const scaled = {
      width: Math.max(1, Math.round(window.width * scale)),
      height: Math.max(1, Math.round(window.height * scale)),
    };

    const legacyWheres = {};
    for (const direction of DIRECTIONS) {
      const normalized = [];
      for (const buffer of poses[direction]) {
        let frame = await normalizeFrame(buffer, window, scaled);
        if (direction === "left") frame = await sharp(frame).flop().png().toBuffer();
        normalized.push(frame);
      }
      const where = await placements(normalized[0], normalized.slice(1), canvas);
      legacyWheres[direction] = where;
      const strip = blankCanvas({ width: canvas.width * 3, height: canvas.height });
      const composites = [];
      for (const [column, frame] of normalized.entries()) {
        const at = column === 0 ? where.stand : where.walk;
        const placed = await placeInCell(frame, at, canvas);
        if (!placed) continue;
        composites.push({
          input: placed.input,
          left: column * canvas.width + placed.left,
          top: placed.top,
        });
      }
      const target = path.join(ASSETS, `chronicle-sprites/field/${legacy.key}-${direction}.png`);
      await strip.composite(composites).png({ palette: true, dither: 0 }).toFile(target);
      written.push(target);
    }

    const portraitTarget = path.join(ASSETS, `chronicle-sprites/field/${legacy.key}-portrait.png`);
    await blankCanvas(canvas)
      .composite(
        [
          await placeInCell(
            await normalizeFrame(poses.down[0], window, scaled),
            legacyWheres.down.stand,
            canvas
          ),
        ].filter(Boolean)
      )
      .png({ palette: true, dither: 0 })
      .toFile(portraitTarget);
    written.push(portraitTarget);
  }
  return written;
}

// ---- entry point ---------------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--fetch")) {
    await fetchAll();
    return;
  }

  const measured = await measureAll();
  const canvas = canonicalCanvas(measured);

  if (args.includes("--measure")) {
    console.log(
      `canvas ${canvas.width}x${canvas.height}, ground row ${canvas.ground}, ` +
        `body ${canvas.body}px\n`
    );
    console.log("key                       cols  window   body  scale   above (per direction)");
    for (const entry of measured) {
      const w = entry.window;
      const above = DIRECTIONS.map((d) => entry.place[d].above).join(",");
      console.log(
        `${entry.character.key.padEnd(24)} ${String(entry.character.frames + 1).padStart(4)}` +
          `  ${`${w.width}x${w.height}`.padEnd(8)} ${String(entry.body).padStart(4)}` +
          `  ${entry.scale.toFixed(3)}  ${above}`
      );
    }
    return;
  }

  console.log(`canvas ${canvas.width}x${canvas.height}, ground row ${canvas.ground}`);

  let count = 0;
  for (const entry of measured) {
    const written = await buildCharacter(entry, canvas);
    count += written.length;
    console.log(
      `${entry.character.key.padEnd(24)} scale ${entry.scale.toFixed(3)}  ${written.length} files`
    );
  }
  const legacy = await buildLegacy(canvas);
  count += legacy.length;
  console.log(`legacy (unit 3)          ${legacy.length} files`);
  console.log(`\nwrote ${count} files onto a shared ${canvas.width}x${canvas.height} canvas`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
