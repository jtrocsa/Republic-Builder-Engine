// Renders every built character side by side on one shared ground line, so the cast can be
// eyeballed as a system rather than one sprite at a time.
//
//   npm run assets:contact-sheet
//
// Writes reports/assets/character-contact-sheet.png (reports/ is gitignored). This is a build-time
// inspection tool: there is deliberately no in-game debug screen for it, because a comparison view
// that ships is a comparison view a student can reach.
//
// What to look for:
//   - every body the same height as the Director's, who is drawn first
//   - every pair of feet on the drawn ground line
//   - props (spear, hoe, basket, bow) overhanging the body without having shrunk it
//   - the four directions of one character agreeing with each other in size
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { CHARACTERS, DIRECTIONS } from "./character-manifest.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ASSETS = path.join(REPO_ROOT, "apps/web/src/assets");
const OUT = path.join(REPO_ROOT, "reports/assets/character-contact-sheet.png");

const ZOOM = 3;
const GAP = 4;
const LABEL_BAND = 10;

function stripPath(stem, direction) {
  return path.join(ASSETS, `${stem}-${direction}.png`);
}

/** Column 0 (the standing pose) of one strip, at the sheet's zoom. */
async function standingColumn(file, cell) {
  return sharp(file)
    .extract({ left: 0, top: 0, width: cell.width, height: cell.height })
    .resize(cell.width * ZOOM, cell.height * ZOOM, { kernel: "nearest", fit: "fill" })
    .png()
    .toBuffer();
}

async function main() {
  // The Director first — he is the reference every other body is measured against.
  const roster = CHARACTERS.map((c) => ({ key: c.key, stem: c.stem, columns: c.frames + 1 }));

  // The canonical canvas, read off a built strip rather than recomputed: one column wide, one
  // strip tall. If the canvas ever changes, this sheet follows it without being edited.
  const reference = roster[0];
  const meta = await sharp(stripPath(reference.stem, "down")).metadata();
  const cell = { width: meta.width / reference.columns, height: meta.height };

  const rowHeight = cell.height * ZOOM + LABEL_BAND + GAP;
  const colWidth = cell.width * ZOOM * DIRECTIONS.length + GAP * DIRECTIONS.length + GAP * 3;
  const perRow = 3;
  const rows = Math.ceil(roster.length / perRow);

  const width = colWidth * perRow;
  const height = rowHeight * rows + GAP;
  const composites = [];
  const rules = [];

  for (const [index, entry] of roster.entries()) {
    const col = index % perRow;
    const row = Math.floor(index / perRow);
    const originX = col * colWidth + GAP;
    const originY = row * rowHeight + GAP;

    for (const [d, direction] of DIRECTIONS.entries()) {
      composites.push({
        input: await standingColumn(stripPath(entry.stem, direction), cell),
        left: originX + d * (cell.width * ZOOM + GAP),
        top: originY,
      });
    }

    // The ground line: one pixel row under every cell in the band, drawn at the canvas ground row
    // so a floating character is immediately obvious.
    rules.push({
      left: originX,
      top: originY + cell.height * ZOOM,
      width: cell.width * ZOOM * DIRECTIONS.length + GAP * (DIRECTIONS.length - 1),
      height: 1,
    });
  }

  const lineBuffers = await Promise.all(
    rules.map((r) =>
      sharp({
        create: {
          width: r.width,
          height: 1,
          channels: 4,
          background: { r: 240, g: 205, b: 118, alpha: 255 },
        },
      })
        .png()
        .toBuffer()
    )
  );
  rules.forEach((r, i) => composites.push({ input: lineBuffers[i], left: r.left, top: r.top }));

  mkdirSync(path.dirname(OUT), { recursive: true });
  await sharp({
    create: { width, height, channels: 4, background: { r: 16, g: 26, b: 42, alpha: 255 } },
  })
    .composite(composites)
    .png()
    .toFile(OUT);

  console.log(`${roster.length} characters x ${DIRECTIONS.length} directions -> ${OUT}`);
  console.log(`cell ${cell.width}x${cell.height} at ${ZOOM}x`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
