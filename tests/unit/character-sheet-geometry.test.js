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

import { footBoxFor } from "../../apps/web/src/engine/geometry.js";
import {
  CYCLE_BOUNDS,
  FOOT_ANCHOR,
  SPRITE_CANVAS,
  SPRITE_DIRECTIONS,
  spriteDirection,
  spriteSheetStyle,
  walkCycleProfile,
  walkCycleSeconds,
} from "../../apps/web/src/engine/sprite-animation.js";

// main.js reaches for `document` at module scope, so hubFootBoxFor() cannot be imported here.
// Mirrored rather than skipped: the whole point of the FOOT_ANCHOR assertions is that the two
// numbers agree, and a mirrored copy that drifts is caught by the hub coordinate tests, which do
// import the real one.
const hubFootBoxFor = (x, y) => ({ x1: x - 0.28, x2: x + 0.28, y1: y - 0.06, y2: y + 0.44 });

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
  ["chronicle-sprites/field/npc-caribbean-child", 9],
  ["chronicle-sprites/field/npc-spanish-scribe", 9],
  ["chronicle-sprites/field/npc-jamestown-laborer", 9],
  ["chronicle-sprites/field/npc-jamestown-gentleman", 9],
  ["chronicle-sprites/field/npc-jamestown-carpenter", 9],
  ["chronicle-sprites/field/npc-jamestown-settler-woman", 9],
  ["chronicle-sprites/field/npc-powhatan-man", 9],
  ["chronicle-sprites/field/npc-powhatan-woman", 9],
  ["chronicle-sprites/field/npc-jamestown-blacksmith", 9],
  ["chronicle-sprites/field/npc-jamestown-soldier", 9],
  ["chronicle-sprites/field/npc-jamestown-watchman", 9],
  ["chronicle-sprites/field/npc-jamestown-african-man", 9],
  ["chronicle-sprites/field/npc-jamestown-servant", 9],
  ["chronicle-sprites/field/npc-canal-boat-captain", 9],
  ["chronicle-sprites/field/npc-canal-lock-keeper-woman", 9],
  ["chronicle-sprites/field/npc-textile-mill-worker", 9],
  ["chronicle-sprites/field/npc-abolitionist-printer", 9],
  ["chronicle-sprites/field/npc-abolitionist-lecturer", 9],
  ["chronicle-sprites/field/npc-market-farmer", 9],
  ["chronicle-sprites/field/npc-haudenosaunee-diplomat", 9],
  ["chronicle-sprites/field/npc-canal-boardinghouse-keeper", 9],
  ["chronicle-sprites/field/npc-canal-irish-laborer", 9],
  ["chronicle-sprites/field/npc-jacksonian-editor", 9],
  ["chronicle-sprites/field/npc-german-cooper", 9],
  ["chronicle-sprites/field/npc-canal-mule-driver", 9],
  ["chronicle-sprites/field/npc-richmond-dock-laborer", 9],
  ["chronicle-sprites/field/npc-slave-trade-clerk", 9],
  ["chronicle-sprites/field/npc-confederate-official", 9],
  ["chronicle-sprites/field/npc-richmond-hospital-worker", 9],
  ["chronicle-sprites/field/npc-richmond-shopkeeper", 9],
  ["chronicle-sprites/field/npc-richmond-seamstress", 9],
  ["chronicle-sprites/field/npc-tredegar-ironworker", 9],
  ["chronicle-sprites/field/npc-confederate-private", 9],
  ["chronicle-sprites/field/npc-richmond-free-black-barber", 9],
  ["chronicle-sprites/field/npc-richmond-relief-society-woman", 9],
  ["chronicle-sprites/field/npc-richmond-government-messenger", 9],
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

  it("emits a cycle only when a speed is given", () => {
    expect(spriteSheetStyle("/x.png", 9)).not.toContain("--sprite-cycle");
    expect(spriteSheetStyle("/x.png", 9, 3.65)).toContain("--sprite-cycle:0.301s");
  });
});

describe("walkCycleSeconds", () => {
  it("makes the legs keep up with the ground", () => {
    // Faster travel, shorter cycle. Inverse proportion is the whole contract — this is what the
    // flat 0.72s could not do, and why the player glided while NPCs skated.
    expect(walkCycleSeconds(3.65)).toBeLessThan(walkCycleSeconds(1.35));
    expect(walkCycleSeconds(1.35)).toBeLessThan(walkCycleSeconds(0.6));
  });

  it("puts the game's two real speeds where they belong", () => {
    // FIELD_SPEED 3.65 reads as a run, FIELD_NPC_SPEED 1.35 as a walk. The gap between them is
    // the thing the player actually sees when they cross a settlement.
    expect(walkCycleSeconds(3.65)).toBeCloseTo(0.301, 3);
    expect(walkCycleSeconds(1.35)).toBeCloseTo(0.815, 3);
  });

  it("clamps rather than producing an absurd cycle at either extreme", () => {
    expect(walkCycleSeconds(50)).toBe(CYCLE_BOUNDS.min);
    expect(walkCycleSeconds(0.01)).toBe(CYCLE_BOUNDS.max);
  });

  it("survives a standing character without poisoning the animation shorthand", () => {
    // Read while `.is-walking` is off, this still has to be a valid <time>.
    for (const value of [0, -1, undefined, NaN, Infinity]) {
      expect(walkCycleSeconds(value)).toBe(CYCLE_BOUNDS.max);
    }
  });
});

describe("FOOT_ANCHOR", () => {
  // Where a character's feet are DRAWN has to be where the game tests that it can stand, or the
  // sprite overlaps geometry that collision is correctly holding it clear of. Until Phase 61 the
  // hub's anchor was 0.70 tiles against a foot box spanning -0.06 to 0.44 — not merely off-centre
  // but entirely outside the box, which is how the Institute staff came to stand on the south wall.
  //
  // The bar is "inside the box, near its middle" rather than an exact midpoint, because the field
  // box is deliberately asymmetric about its foot line: footBoxFor() puts 0.18 tiles above and 0.20
  // below, giving a little extra depth downhill.
  it.each([
    ["field", footBoxFor, FOOT_ANCHOR.field],
    ["hub", hubFootBoxFor, FOOT_ANCHOR.hub],
  ])("draws %s feet inside the collision foot box", (_surface, boxFor, anchor) => {
    const box = boxFor(10, 10);
    expect(anchor).toBeGreaterThan(box.y1 - 10);
    expect(anchor).toBeLessThan(box.y2 - 10);
    const centre = (box.y1 + box.y2) / 2 - 10;
    expect(Math.abs(anchor - centre)).toBeLessThanOrEqual(0.02);
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
  //
  // One case per character rather than one case for the cast: this is the most expensive
  // assertion in the file — every column of every direction is decoded and scanned row by row —
  // and as a single case its cost grew with the cast until it overran vitest's default 5s budget.
  // Split, each character is measured against its own budget, and a failure names the character in
  // the test title instead of only in the message.
  it.each(CAST)("%s anchors its walk cycle to the shared ground line", async (stem, columns) => {
    const ceiling = 5;
    for (const direction of SPRITE_DIRECTIONS) {
      const file = path.join(ASSETS, `${stem}-${direction}.png`);
      const bottoms = [];
      const silhouettes = [];
      for (let column = 0; column < columns; column += 1) {
        const rows = await columnRows(file, column);
        bottoms.push(bodySpan(rows).bottom);
        // Travel is measured on the silhouette — the lowest row carrying any ink at all — while
        // the plant below stays on body rows. Two measures because they answer two questions.
        // "Does a frame stand on the line" is about the build's own anchoring, which uses body
        // rows, so it has to be read the same way. "Does the body slide up the canvas" is about
        // where the character *touches the ground*, and a foot is legitimately narrower than the
        // 4px a body row needs: mid-stride, a woman in an ankle-length skirt shows one lifted foot
        // and a couple of pixels of the other, so the body measure stops finding feet and reports
        // the hem or the torso instead. That read the seamstress as sliding 6px while her actual
        // silhouette moved 2 — a walk cycle failing review for having a long skirt.
        silhouettes.push(bodySpan(rows, 1).bottom);
      }
      const planted = Math.max(...bottoms);
      const travel = Math.max(...silhouettes) - Math.min(...silhouettes);
      expect(planted, `${stem}-${direction} never plants a foot on the ground line`).toBe(
        SPRITE_CANVAS.ground - 1
      );
      expect(
        travel,
        `${stem}-${direction} stride spans ${travel}px of vertical travel`
      ).toBeLessThanOrEqual(ceiling);
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
