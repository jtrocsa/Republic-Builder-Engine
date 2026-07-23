// Read-only file inspection helpers for the asset audit (scripts/assets/audit.js).
// Every function here only opens files for reading. Nothing here writes, moves, renames,
// deletes, resizes, or recompresses anything.
//
// Image dimension reads use Sharp's `.metadata()` and directory traversal uses Node's built-in
// `fs.readdirSync(..., { recursive: true })` rather than hand-rolled equivalents — see
// docs/architecture/OPEN-SOURCE-REUSE-DECISIONS.md §5/§7 for the reuse-policy research behind
// this. `fs.readdirSync`'s `recursive` option requires Node >=20.1 (the early-20.x
// `withFileTypes`-combination bugs, nodejs/node#48640 and #51773, are long fixed); this repo's
// own `engines` field in package.json (`^20.19.0 || >=22.12.0`, matching Vite 7's own
// requirement) already guarantees a safe version.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

export function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

/**
 * Recursively lists every file (not directory) under rootDir.
 * Returns absolute paths (when rootDir is absolute, which every caller in this script passes).
 * Silently skips a root that doesn't exist.
 */
export function walkFiles(rootDir) {
  let entries;
  try {
    entries = readdirSync(rootDir, { recursive: true, withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

export function fileSizeBytes(filePath) {
  return statSync(filePath).size;
}

export function sha256File(filePath) {
  const buffer = readFileSync(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return String(bytes);
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  const rounded = exponent === 0 ? String(value) : value.toFixed(2);
  return `${rounded} ${units[exponent]}`;
}

/**
 * Best-effort image pixel dimensions via Sharp's `.metadata()`. Returns null for files Sharp
 * can't read metadata from (unsupported/corrupt/non-image files, or a missing path) — callers
 * must treat null as "unknown", never as "0x0". Sharp's bundled libvips decoders cover PNG,
 * JPEG, GIF, WebP, and SVG (via librsvg) directly, which is every format this repo's asset tree
 * uses today plus more.
 */
export async function readImageDimensions(filePath) {
  try {
    const { width, height } = await sharp(filePath).metadata();
    if (!width || !height) return null;
    return { width, height };
  } catch {
    return null;
  }
}
