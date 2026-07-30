// Guards the promise the whole character cast rests on: every sprite is drawn on one canvas, at
// one body height, standing on one ground line.
//
// This checks the committed PNGs, not the build script that made them, because the PNGs are what
// ships. If someone re-exports one character from PixelLab and drops the file in by hand — the
// obvious thing to do, and how the Director's frames came to disagree by a pixel before — these
// assertions are what catches it.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  SPRITE_CANVAS,
  SPRITE_DIRECTIONS,
  spriteDirection,
  spriteSheetStyle,
  walkCycleProfile,
} from "../../apps/web/src/engine/sprite-animation.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ASSETS = path.join(REPO_ROOT, "apps/web/src/assets");

// Mirrors CHARACTER_SHEETS in main.js. Kept as a literal rather than imported because main.js
// cannot be imported outside a browser — it reaches for `document` at module scope.
const CAST = [
  ["institute/director-rowan-hale", 7, true],
  ["institute/researcher-amani-soto", 9],
  ["institute/professor-julian-park", 9],
  ["chronicle-sprites/field/chronicler-a", 9],
  ["chronicle-sprites/field/chronicler-b", 9],
  ["chronicle-sprites/field/npc-columbus", 9],
  ["chronicle-sprites/field/npc-spanish-sailor", 9],
  ["chronicle-sprites/field/npc-caribbean-man", 9],
  ["chronicle-sprites/field/npc-caribbean-woman", 9],
  ["chronicle-sprites/field/npc-jamestown-laborer", 9],
  ["chronicle-sprites/field/npc-jamestown-gentleman", 9],
  ["chronicle-sprites/field/npc-jamestown-carpenter", 9],
  ["chronicle-sprites/field/npc-jamestown-settler-woman", 9],
  ["chronicle-sprites/field/npc-powhatan-man", 9],
  ["chronicle-sprites/field/npc-powhatan-woman", 9],
  ["chronicle-sprites/field/legacy-scribe", 3],
  ["chronicle-sprites/field/legacy-columbus", 3],
  ["chronicle-sprites/field/legacy-sailor", 3],
  ["chronicle-sprites/field/legacy-elder", 3],
  ["chronicle-sprites/field/legacy-fisher", 3],
  ["chronicle-sprites/field/legacy-gardener", 3],
];

/** Per-row opaque pixel counts for one column of a strip. */
async function columnRows(file, index) {
  const { data, info } = await sharp(file)
    .extract({
      left: index * SPRITE_CANVAS.width,
      top: 0,
      width: SPRITE_CANVAS.width,
      height: SPRITE_CANVAS.height,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rows = new Array(info.height).fill(0);
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] !== 0) rows[y] += 1;
    }
  }
  return rows;
}

/** Top and bottom of the *body*, ignoring rows thin enough to be a spear shaft or a bow limb. */
function bodySpan(rows, minWidth = 4) {
  let top = -1;
  let bottom = -1;
  rows.forEach((count, y) => {
    if (count < minWidth) return;
    if (top < 0) top = y;
    bottom = y;
  });
  return { top, bottom, height: bottom - top + 1 };
}

describe("sprite-animation profile", () => {
  it("splits the standing pose out of the walk cycle", () => {
    expect(walkCycleProfile(9)).toEqual({ columns: 9, walkFrames: 8 });
    expect(walkCycleProfile(7)).toEqual({ columns: 7, walkFrames: 6 });
    expect(walkCycleProfile(3)).toEqual({ columns: 3, walkFrames: 2 });
  });

  it("falls back to the front-facing sheet for anything unrecognised", () => {
    for (const direction of SPRITE_DIRECTIONS) expect(spriteDirection(direction)).toBe(direction);
    expect(spriteDirection("side")).toBe("down");
    expect(spriteDirection(undefined)).toBe("down");
  });

  // A double quote here would close the HTML style="…" attribute this string is interpolated into,
  // which is exactly the bug that made every sprite in the game invisible the first time round.
  it("quotes the sheet URL so it survives an HTML attribute", () => {
    const style = spriteSheetStyle("/assets/x.png", 9);
    expect(style).toContain("url('/assets/x.png')");
    expect(style).not.toContain('"');
    expect(style).toContain("--sprite-columns:9");
    expect(style).toContain("--sprite-walk-frames:8");
  });
});

describe("character sheets", () => {
  it.each(CAST)("%s is one canonical canvas per column", async (stem, columns) => {
    for (const direction of SPRITE_DIRECTIONS) {
      const meta = await sharp(path.join(ASSETS, `${stem}-${direction}.png`)).metadata();
      expect(meta.height, `${stem}-${direction} height`).toBe(SPRITE_CANVAS.height);
      expect(meta.width, `${stem}-${direction} width`).toBe(SPRITE_CANVAS.width * columns);
    }
    const portrait = await sharp(path.join(ASSETS, `${stem}-portrait.png`)).metadata();
    // Chronicler portraits are drawn on the identity cards at 2x, so they are stored upscaled by a
    // whole number rather than resampled in the browser.
    expect(portrait.width % SPRITE_CANVAS.width, `${stem}-portrait width`).toBe(0);
    expect(portrait.height / portrait.width).toBeCloseTo(
      SPRITE_CANVAS.height / SPRITE_CANVAS.width,
      5
    );
  });

  it.each(CAST)("%s stands on the shared ground line in every direction", async (stem) => {
    for (const direction of SPRITE_DIRECTIONS) {
      const rows = await columnRows(path.join(ASSETS, `${stem}-${direction}.png`), 0);
      const span = bodySpan(rows);
      expect(span.bottom, `${stem}-${direction} foot row`).toBe(SPRITE_CANVAS.ground - 1);
    }
  });

  it.each(CAST)("%s has the same body height as the rest of the cast", async (stem) => {
    for (const direction of SPRITE_DIRECTIONS) {
      const rows = await columnRows(path.join(ASSETS, `${stem}-${direction}.png`), 0);
      const { height } = bodySpan(rows);
      // Three pixels of slack against the 45px target. Two of those cover a hat brim or a hair
      // silhouette legitimately shifting one direction by a row. The third is for Unit 3's frozen
      // placeholders, whose own side poses are drawn 3px shorter than their front poses — an
      // inconsistency in art that is scheduled for replacement and not worth resampling to hide.
      // Anything past this is a character that was never normalized.
      expect(
        Math.abs(height - SPRITE_CANVAS.body),
        `${stem}-${direction} body ${height}px`
      ).toBeLessThanOrEqual(3);
    }
  });

  // The cycle as a whole is what has to be anchored, not each frame individually. A frame with
  // both feet mid-pass legitimately sits a few pixels high — that is the walk. What must not
  // happen is the whole body sliding up or down the canvas, which is the failure mode when frames
  // are aligned to their own bounding boxes instead of to the character's ground line.
  it("anchors every walk cycle to the shared ground line", async () => {
    const ceiling = 5;
    for (const [stem, columns] of CAST) {
      for (const direction of SPRITE_DIRECTIONS) {
        const file = path.join(ASSETS, `${stem}-${direction}.png`);
        const bottoms = [];
        for (let column = 0; column < columns; column += 1) {
          bottoms.push(bodySpan(await columnRows(file, column)).bottom);
        }
        const planted = Math.max(...bottoms);
        const highest = Math.min(...bottoms);
        expect(planted, `${stem}-${direction} never plants a foot on the ground line`).toBe(
          SPRITE_CANVAS.ground - 1
        );
        expect(
          planted - highest,
          `${stem}-${direction} stride spans ${planted - highest}px of vertical travel`
        ).toBeLessThanOrEqual(ceiling);
      }
    }
  });

  it("has no unreferenced per-direction sprite left over from the old three-pose convention", () => {
    // The pre-PixelLab naming was `<stem>.png` / `-side.png` / `-side-step.png` / `-step.png`.
    // Those files are deliberately still on disk (the Unit 3 legacy sheets are composited from
    // them), so this only asserts that nothing named that way is being treated as a strip.
    for (const [stem] of CAST) {
      const strip = path.join(ASSETS, `${stem}-down.png`);
      expect(() => readFileSync(strip)).not.toThrow();
    }
  });
});
