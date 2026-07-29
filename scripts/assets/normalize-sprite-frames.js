// Normalizes a set of character sprite frames onto one shared canvas with a common baseline.
//
// Why this exists: PixelLab exports characters with roughly 40% transparent padding around them
// for animation headroom, so an exported frame is much larger than the character and renders
// visibly smaller than tightly-cropped art inside a shared `object-fit: contain` box. The fix
// applied during the last Director swap was to autocrop each frame to its own alpha bounding
// box — and that script was never committed, which is half the reason the Director's three
// frames currently disagree with each other: 30x46 facing down, 21x46 facing side, 21x45 for
// the side step. A 1px height difference between the two side frames makes the character's feet
// drift a pixel up and down on every step of the walk flipbook.
//
// Per-frame autocropping is the bug, not the fix. This script instead measures the alpha bounds
// of ALL the frames together, then places each one on an identical canvas, horizontally centred
// and bottom-aligned, so the character's feet land on the same row in every frame.
//
// Usage:
//   node scripts/assets/normalize-sprite-frames.js <out-dir> <frame.png> [frame.png ...]
//   node scripts/assets/normalize-sprite-frames.js --in-place <frame.png> [frame.png ...]
//   node scripts/assets/normalize-sprite-frames.js --size=48x64 <out-dir> <frame.png> ...
//
// Frames passed in one invocation form one group and share a canvas. Run it once per character,
// passing every pose that character has, so all of its frames agree.
import { mkdirSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";

/** Tight bounding box of non-transparent pixels, or null if the frame is fully transparent. */
async function alphaBounds(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] === 0) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function parseSize(arg) {
  const match = /^--size=(\d+)x(\d+)$/.exec(arg);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

async function main() {
  const args = process.argv.slice(2);
  const inPlace = args.includes("--in-place");
  const sizeArg = args.find((a) => a.startsWith("--size="));
  const explicitSize = sizeArg ? parseSize(sizeArg) : null;
  if (sizeArg && !explicitSize) {
    console.error(`bad --size value: ${sizeArg} (expected --size=WxH, e.g. --size=48x64)`);
    process.exit(1);
  }
  const positional = args.filter((a) => !a.startsWith("--"));
  const outDir = inPlace ? null : positional.shift();
  const frames = positional;

  if (frames.length === 0 || (!inPlace && !outDir)) {
    console.error(
      "usage: node scripts/assets/normalize-sprite-frames.js [--size=WxH] <out-dir|--in-place> <frame.png>..."
    );
    process.exit(1);
  }

  const bounds = [];
  for (const file of frames) {
    const box = await alphaBounds(file);
    if (!box) {
      console.error(`${file}: fully transparent, nothing to normalize`);
      process.exit(1);
    }
    bounds.push({ file, box });
  }

  // One canvas for the whole group: wide enough for the widest pose, tall enough for the
  // tallest. Measuring across the group is the entire point — measuring per frame is what
  // produces frames that disagree.
  const canvas = explicitSize || {
    width: Math.max(...bounds.map((b) => b.box.width)),
    height: Math.max(...bounds.map((b) => b.box.height)),
  };

  if (!inPlace) mkdirSync(outDir, { recursive: true });

  for (const { file, box } of bounds) {
    if (box.width > canvas.width || box.height > canvas.height) {
      console.error(
        `${file}: content is ${box.width}x${box.height}, larger than the ${canvas.width}x${canvas.height} canvas`
      );
      process.exit(1);
    }
    const cropped = await sharp(file).ensureAlpha().extract(box).toBuffer();
    const out = await sharp({
      create: {
        width: canvas.width,
        height: canvas.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: cropped,
          // Horizontally centred, bottom-aligned: the feet land on the same row in every frame,
          // which is what stops a walk cycle bobbing vertically by a pixel.
          left: Math.floor((canvas.width - box.width) / 2),
          top: canvas.height - box.height,
        },
      ])
      .png()
      .toBuffer();
    const target = inPlace ? file : path.join(outDir, path.basename(file));
    await sharp(out).toFile(target);
    console.log(
      `${path.basename(file)}  content ${box.width}x${box.height} -> canvas ${canvas.width}x${canvas.height}`
    );
  }
  console.log(
    `normalized ${frames.length} frame(s) onto a shared ${canvas.width}x${canvas.height} canvas`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
