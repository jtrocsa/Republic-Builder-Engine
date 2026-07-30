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
export function spriteSheetStyle(url, columns) {
  const { columns: total, walkFrames } = walkCycleProfile(columns);
  // Single quotes around the URL, not double: this string is interpolated into an HTML
  // `style="…"` attribute, and a double quote inside it terminates the attribute early.
  return `--sprite-sheet:url('${url}');--sprite-columns:${total};--sprite-walk-frames:${walkFrames};`;
}
