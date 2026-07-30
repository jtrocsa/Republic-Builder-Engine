// Frame geometry for Chronicle's character sprite sheets.
//
// Pure and DOM-free, in the same spirit as geometry.js: it describes where frames are, and the
// caller decides what to do about it. The renderer itself is CSS — a `background-position-x`
// stepped by a `steps()` timing function over a horizontal strip, the technique documented in
// CSS-Tricks' "Clever Uses for Step Easing" and chosen over a second requestAnimationFrame loop in
// docs/art/CHARACTER-SPRITESHEET-STANDARD.md. Keeping the numbers here rather than inline in
// main.js is what lets tests/unit/character-sheet-geometry.test.js check the built PNGs against
// the same constants the game reads.

/**
 * The canonical character canvas, in source pixels. Every strip column is exactly this size, and
 * every character in the cast is normalized onto it by scripts/assets/build-character-sheets.js.
 *
 *   body    the height of a standing adult body — the number that is actually held constant across
 *           the cast. It is smaller than the canvas because the canvas also has to hold whatever a
 *           character is carrying: a raised spear, a bow, a hoe over one shoulder.
 *   ground  rows from the top of the canvas down to and including the row the feet stand on. The
 *           remaining rows below it are headroom for walk frames whose stride dips below the
 *           standing foot line.
 */
export const SPRITE_CANVAS = Object.freeze({ width: 48, height: 56, ground: 50, body: 45 });

/** Strip directions, matching the `facing` values main.js already stores for players and NPCs. */
export const SPRITE_DIRECTIONS = Object.freeze(["down", "up", "left", "right"]);

/**
 * How far below a character's world anchor its feet are drawn, in tiles, per surface.
 *
 * These are not free parameters: each one is the centre of that surface's collision foot box, so
 * the ground the character is drawn standing on is the ground the game tests against. `field` is
 * the midpoint of geometry.js's `footBoxFor` (y+0.40 … y+0.78) and `hub` is the midpoint of
 * main.js's `hubFootBoxFor` (y-0.06 … y+0.44).
 *
 * They differ because the two surfaces put the anchor in a different place on the body, which is
 * a wart worth knowing about rather than one worth unifying — the field box is validated against
 * three maps' collision rects and the hub box against two rooms', and re-centring either would
 * mean re-tuning every one of them.
 *
 * Before Phase 61 this lived as two hand-tuned pixel values in CSS with no stated relationship to
 * the collision boxes, and the hub's had drifted a full tile: characters were drawn 1.02 tiles
 * below and 0.50 tiles right of where the game thought they stood, which is why the Institute
 * staff appeared to be standing on the south wall.
 */
export const FOOT_ANCHOR = Object.freeze({ field: 0.58, hub: 0.19 });

/**
 * Ground covered by one complete walk cycle, in tiles.
 *
 * The one number that ties leg speed to travel speed. It is a *look* constant, not a physical
 * one — at 48px tiles and a 45px body the cast would be sprinting at Olympic pace if you took the
 * world's scale literally, which is true of the whole genre. What it has to do is make the feet
 * appear to push the ground: too low and characters run in place, too high and they skate.
 */
export const STRIDE_TILES = 1.1;

/** Slowest and fastest a cycle may play, whatever the speed asks for. */
export const CYCLE_BOUNDS = Object.freeze({ min: 0.24, max: 1.0 });

/**
 * Seconds for one walk cycle at a given ground speed, so a character's legs match its travel.
 *
 * Every character was animating at a flat 0.72s before Phase 61 regardless of how fast it moved,
 * which put the player at a 1.3-tile stride (gliding) and field NPCs at 0.05 (skating on ice, the
 * defect that prompted this). Deriving it means a walking NPC and a running player can share one
 * keyframe and both look right.
 *
 * Returns the slow bound for a standing character rather than Infinity: the value is only read
 * while `.is-walking` is set, but a non-finite duration in a CSS custom property would poison the
 * animation shorthand for the frame between starting to move and the next tick.
 */
export function walkCycleSeconds(tilesPerSecond) {
  if (!Number.isFinite(tilesPerSecond) || tilesPerSecond <= 0) return CYCLE_BOUNDS.max;
  const seconds = STRIDE_TILES / tilesPerSecond;
  return Math.min(CYCLE_BOUNDS.max, Math.max(CYCLE_BOUNDS.min, Number(seconds.toFixed(3))));
}

/** Facing → strip direction, defaulting anything unrecognised to the front-facing sheet. */
export function spriteDirection(facing) {
  return SPRITE_DIRECTIONS.includes(facing) ? facing : "down";
}

/**
 * Column layout of one strip: column 0 is the standing pose, columns 1…walkFrames are the cycle.
 *
 * Splitting the standing pose out of the cycle is what makes "keep facing the way you last walked"
 * fall out for free — stopping means playing no animation, which leaves column 0 showing, and
 * column 0 is a real standing pose drawn for that direction rather than an arbitrary walk frame.
 *
 * `columns` varies by character: PixelLab generated Director Hale with a 6-frame walk template and
 * the rest of the cast with an 8-frame one, and Unit 3's frozen placeholders have 2.
 */
export function walkCycleProfile(columns) {
  const total = Math.max(2, Math.round(columns));
  return { columns: total, walkFrames: total - 1 };
}

/**
 * The custom properties one sprite element needs. The CSS does the rest: it sizes the background to
 * `columns` frames wide and steps `background-position-x` across the walking columns.
 */
export function spriteSheetStyle(url, columns, tilesPerSecond) {
  const { columns: total, walkFrames } = walkCycleProfile(columns);
  // Single quotes around the URL, not double: this string is interpolated into an HTML
  // `style="…"` attribute, and a double quote inside it terminates the attribute early.
  const cycle =
    tilesPerSecond === undefined ? "" : `--sprite-cycle:${walkCycleSeconds(tilesPerSecond)}s;`;
  return `--sprite-sheet:url('${url}');--sprite-columns:${total};--sprite-walk-frames:${walkFrames};${cycle}`;
}
