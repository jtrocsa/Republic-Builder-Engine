#!/usr/bin/env node
// Read-only asset audit (Workstream 4 of docs/architecture/FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md).
//
// This script never modifies, compresses, resizes, moves, renames, or deletes any asset. It only
// reads files under apps/web/src/assets/, apps/web/dist/ (if present), and the source files that
// reference assets, then writes report files under reports/assets/.
//
// Usage: npm run assets:audit  (or: node scripts/assets/audit.js)

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import picomatch from "picomatch";

import {
  fileSizeBytes,
  formatBytes,
  readImageDimensions,
  sha256File,
  toPosixPath,
  walkFiles,
} from "./lib/file-stats.js";
import { toCsv, writeJsonReport, writeTextReport } from "./manifest.js";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../..");
const WEB_ROOT = path.join(REPO_ROOT, "apps", "web");
const SRC_ROOT = path.join(WEB_ROOT, "src");
const ASSET_ROOT = path.join(SRC_ROOT, "assets");
const DIST_ROOT = path.join(WEB_ROOT, "dist");
const CONTENT_MAPS_DIR = path.join(SRC_ROOT, "content", "maps");
const REPORTS_DIR = path.join(REPO_ROOT, "reports", "assets");

// Per-category size budgets (bytes). Conservative starting points per
// docs/architecture/ASSET-PIPELINE-PLAN.md — first-pass numbers, adjustable as real usage is
// observed. Category = the asset's top-level folder directly under apps/web/src/assets/.
const CATEGORY_BUDGETS_BYTES = {
  tilesets: 500 * 1024,
  documents: 2 * 1024 * 1024,
  "chronicle-sprites": 50 * 1024,
  institute: 50 * 1024,
  "mini-games": 20 * 1024,
  maps: 100 * 1024,
};
const DEFAULT_BUDGET_BYTES = 500 * 1024;

// Threshold used for "large source asset" / "large production asset" report sections.
const LARGE_ASSET_BYTES = 200 * 1024;

// Below this used-area ratio (bounding box of actually-referenced tile ids vs. full sheet area),
// a tileset image is flagged as a possible oversized-for-display candidate — see
// computeTmjTileUsage() below. This is a bounding-box approximation, not exact per-tile accounting.
const TILE_USAGE_RATIO_FLAG_THRESHOLD = 0.35;

function categoryFor(relativePosixPath) {
  const [first] = relativePosixPath.split("/");
  return first || "(root)";
}

function budgetFor(category) {
  return CATEGORY_BUDGETS_BYTES[category] ?? DEFAULT_BUDGET_BYTES;
}

// ---------------------------------------------------------------------------
// Step 1: enumerate every asset file on disk.
// ---------------------------------------------------------------------------

function collectAssetFiles() {
  return walkFiles(ASSET_ROOT).map((absolutePath) => {
    const relativePath = toPosixPath(path.relative(ASSET_ROOT, absolutePath));
    return { absolutePath, relativePath };
  });
}

// ---------------------------------------------------------------------------
// Step 2: parse source files for asset references.
//
// Three independent mechanisms actually make a file reach the browser in this codebase:
//   - `new URL("./relative/path", import.meta.url)` (direct, always a literal string here)
//   - `import.meta.glob("./relative/pattern", { ... })` (Vite glob — literal in every current
//     call site, but this parser supports `*`, `**`, `?` wildcards in case that changes)
//   - a CSS `url(...)` pointing at a relative path under assets/
// A fourth path — a `.tmj` map's `tilesets[].image` field — doesn't independently ship
// anything; the actual image only ships if some `import.meta.glob` call also matches it (see
// createTilesetImageResolver() in tiled-map-loader.js, matched by path tail). This script tracks
// tmj references separately so it can flag the rare case where a map references an image no
// glob call actually matches (which would be a runtime error, not just an audit nuance).
// ---------------------------------------------------------------------------

function listSourceFiles() {
  const all = walkFiles(SRC_ROOT);
  return all.filter((file) => {
    const rel = toPosixPath(path.relative(SRC_ROOT, file));
    if (rel.startsWith("assets/")) return false;
    if (rel.startsWith("assets/generated/")) return false;
    return rel.endsWith(".js") || rel.endsWith(".css");
  });
}

// Builds a matcher testing whether a candidate POSIX path satisfies a glob-pattern string (e.g.
// one extracted from a `import.meta.glob("...")` call in source). Replaces this file's former
// hand-rolled glob-to-RegExp converter with picomatch (MIT, already used transitively by
// Vite/Vitest in this repo) — see docs/architecture/OPEN-SOURCE-REUSE-DECISIONS.md §5/§7.
// Exported so tests can exercise real Chronicle glob patterns without running the full audit.
export function createGlobMatcher(globPosixPathPattern) {
  return picomatch(globPosixPathPattern);
}

const NEW_URL_RE = /new URL\(\s*["'`]([^"'`]+)["'`]\s*,\s*import\.meta\.url\s*\)/g;
const GLOB_RE = /import\.meta\.glob\(\s*["'`]([^"'`]+)["'`]/g;
const CSS_URL_RE = /url\(\s*["']?([^"')]+)["']?\s*\)/g;
const TMJ_RAW_IMPORT_RE = /from\s+["'`]([^"'`]+\.tmj)\?raw["'`]/g;

function scanSourceReferences(assetFilesPosix) {
  const directRefs = new Map(); // assetRelativePath -> Set(sourceFile)
  const globRefs = new Map(); // assetRelativePath -> Set(globPatternDescription)
  const cssRefs = new Map(); // assetRelativePath -> Set(sourceFile)
  const globPatterns = []; // { sourceFile, pattern, matchedCount }
  const wiredTmjFiles = new Set(); // absolute paths of .tmj files actually imported via `?raw`
  const warnings = [];

  const assetAbsSet = assetFilesPosix.map((a) => a.absolutePath);

  for (const sourceFile of listSourceFiles()) {
    const text = readFileSync(sourceFile, "utf8");
    const sourceDir = path.dirname(sourceFile);
    const sourceRel = toPosixPath(path.relative(REPO_ROOT, sourceFile));

    for (const match of text.matchAll(NEW_URL_RE)) {
      const specifier = match[1];
      const resolved = path.resolve(sourceDir, specifier);
      if (!resolved.startsWith(ASSET_ROOT)) continue;
      const rel = toPosixPath(path.relative(ASSET_ROOT, resolved));
      if (!existsSync(resolved)) {
        warnings.push(`${sourceRel}: new URL(...) references missing file "${specifier}"`);
        continue;
      }
      if (!directRefs.has(rel)) directRefs.set(rel, new Set());
      directRefs.get(rel).add(sourceRel);
    }

    for (const match of text.matchAll(GLOB_RE)) {
      const pattern = match[1];
      const resolvedPatternAbs = toPosixPath(path.resolve(sourceDir, pattern));
      const isMatch = createGlobMatcher(resolvedPatternAbs);
      let matchedCount = 0;
      for (const absoluteAssetPath of assetAbsSet) {
        if (isMatch(toPosixPath(absoluteAssetPath))) {
          matchedCount += 1;
          const rel = toPosixPath(path.relative(ASSET_ROOT, absoluteAssetPath));
          if (!globRefs.has(rel)) globRefs.set(rel, new Set());
          globRefs.get(rel).add(`${sourceRel} :: ${pattern}`);
        }
      }
      globPatterns.push({ sourceFile: sourceRel, pattern, matchedCount });
      if (matchedCount === 0) {
        warnings.push(`${sourceRel}: import.meta.glob("${pattern}") matched 0 files on disk`);
      }
    }

    for (const match of text.matchAll(TMJ_RAW_IMPORT_RE)) {
      const resolved = path.resolve(sourceDir, match[1]);
      if (existsSync(resolved)) {
        wiredTmjFiles.add(resolved);
      } else {
        warnings.push(`${sourceRel}: \`?raw\` import references missing file "${match[1]}"`);
      }
    }

    if (sourceFile.endsWith(".css")) {
      for (const match of text.matchAll(CSS_URL_RE)) {
        const specifier = match[1];
        if (specifier.startsWith("data:") || /^https?:\/\//.test(specifier)) continue;
        if (!specifier.includes("assets/")) continue;
        const resolved = path.resolve(sourceDir, specifier);
        if (!resolved.startsWith(ASSET_ROOT)) continue;
        const rel = toPosixPath(path.relative(ASSET_ROOT, resolved));
        if (!existsSync(resolved)) {
          warnings.push(`${sourceRel}: CSS url(...) references missing file "${specifier}"`);
          continue;
        }
        if (!cssRefs.has(rel)) cssRefs.set(rel, new Set());
        cssRefs.get(rel).add(sourceRel);
      }
    }
  }

  return { directRefs, globRefs, cssRefs, globPatterns, wiredTmjFiles, warnings };
}

// ---------------------------------------------------------------------------
// Step 3: .tmj map files — tileset image references, plus a tile-usage-ratio check that gives
// traceable evidence for "is this source image much larger than what the map actually draws
// from it" (audit requirement 12), derived from the map's own layer data, not guessed.
// ---------------------------------------------------------------------------

function clearTiledFlipBits(gid) {
  // Tiled reserves the top 3 bits of a 32-bit gid for horizontal/vertical/diagonal flip flags.
  return gid & 0x1fffffff;
}

function listTmjFilesOnDisk() {
  if (!existsSync(CONTENT_MAPS_DIR)) return [];
  return walkFiles(CONTENT_MAPS_DIR).filter((f) => f.endsWith(".tmj"));
}

// Only `.tmj` files actually reached via a `?raw` import in scanned JS source (see
// TMJ_RAW_IMPORT_RE above) are "live" — main.js's own comments confirm at least one `.tmj` on
// disk (sandy-island-demo.tmj) is unwired leftover content. Treating every `.tmj` file on disk as
// live would wrongly imply its tileset images are a runtime hazard when they're actually just
// dead-file noise, the same category of mistake this audit exists to avoid for images.
function scanTmjReferences(assetFilesPosix, wiredTmjFiles) {
  const tmjRefs = new Map(); // assetRelativePath -> Set(tmjFile)
  const tileUsage = []; // { tmjFile, tilesetImage, usageRatio, usedTiles, totalTiles, sizeBytes }
  const warnings = [];
  const assetByRelPath = new Map(assetFilesPosix.map((a) => [a.relativePath, a]));

  const onDisk = listTmjFilesOnDisk();
  const unwired = onDisk.filter((f) => !wiredTmjFiles.has(f));
  for (const f of unwired) {
    warnings.push(
      `${toPosixPath(path.relative(REPO_ROOT, f))}: exists on disk but is not imported via ` +
        `\`?raw\` by any scanned source file — treated as dead content, its tileset image ` +
        "references are not evaluated."
    );
  }

  for (const tmjFile of wiredTmjFiles) {
    const tmjRel = toPosixPath(path.relative(REPO_ROOT, tmjFile));
    let doc;
    try {
      doc = JSON.parse(readFileSync(tmjFile, "utf8"));
    } catch (error) {
      warnings.push(`${tmjRel}: could not parse as JSON (${error.message})`);
      continue;
    }
    const tilesets = Array.isArray(doc.tilesets) ? doc.tilesets : [];
    const layers = Array.isArray(doc.layers) ? doc.layers : [];

    // Union of every cleared (non-flip-bit) gid actually used across all tile layers.
    const usedGids = new Set();
    for (const layer of layers) {
      if (layer.type !== "tilelayer" || !Array.isArray(layer.data)) continue;
      for (const gid of layer.data) {
        if (gid !== 0) usedGids.add(clearTiledFlipBits(gid));
      }
    }

    for (let i = 0; i < tilesets.length; i += 1) {
      const tileset = tilesets[i];
      if (!tileset.image) continue;
      const resolved = path.resolve(path.dirname(tmjFile), tileset.image);
      if (resolved.startsWith(ASSET_ROOT)) {
        const rel = toPosixPath(path.relative(ASSET_ROOT, resolved));
        if (assetByRelPath.has(rel)) {
          if (!tmjRefs.has(rel)) tmjRefs.set(rel, new Set());
          tmjRefs.get(rel).add(tmjRel);
        } else {
          warnings.push(
            `${tmjRel}: tileset image "${tileset.image}" does not exist on disk (resolved ${rel})`
          );
        }
      }

      const { columns, tilecount, tilewidth, tileheight, imagewidth, imageheight, firstgid } =
        tileset;
      if (!columns || !tilecount || !tilewidth || !tileheight || !imagewidth || !imageheight) {
        continue;
      }
      const nextFirstgid = tilesets[i + 1]?.firstgid ?? Infinity;
      const localIdsUsed = [];
      for (const gid of usedGids) {
        if (gid >= firstgid && gid < nextFirstgid) {
          localIdsUsed.push(gid - firstgid);
        }
      }
      if (localIdsUsed.length === 0) continue;

      let minCol = Infinity;
      let maxCol = -Infinity;
      let minRow = Infinity;
      let maxRow = -Infinity;
      for (const localId of localIdsUsed) {
        const col = localId % columns;
        const row = Math.floor(localId / columns);
        if (col < minCol) minCol = col;
        if (col > maxCol) maxCol = col;
        if (row < minRow) minRow = row;
        if (row > maxRow) maxRow = row;
      }
      const usedWidthTiles = maxCol - minCol + 1;
      const usedHeightTiles = maxRow - minRow + 1;
      const usedArea = usedWidthTiles * tilewidth * (usedHeightTiles * tileheight);
      const totalArea = imagewidth * imageheight;
      const usageRatio = totalArea > 0 ? usedArea / totalArea : null;

      const rel = toPosixPath(path.relative(ASSET_ROOT, resolved));
      const sizeBytes = assetByRelPath.has(rel)
        ? fileSizeBytes(assetByRelPath.get(rel).absolutePath)
        : null;

      tileUsage.push({
        tmjFile: tmjRel,
        tilesetImage: rel,
        usedTileIds: localIdsUsed.length,
        totalTileIds: tilecount,
        usageRatio,
        sizeBytes,
      });
    }
  }

  return { tmjRefs, tileUsage, warnings };
}

// ---------------------------------------------------------------------------
// Step 4: scan the previous production build (apps/web/dist/), if present, and match its files
// back to source assets by SHA-256 content hash (Vite renames files with a content hash, so
// filename matching would be unreliable).
// ---------------------------------------------------------------------------

function scanDistBuild() {
  if (!existsSync(DIST_ROOT)) {
    return { exists: false, hashToDistPaths: new Map(), distFiles: [] };
  }
  const distFiles = walkFiles(DIST_ROOT).map((absolutePath) => {
    const relativePath = toPosixPath(path.relative(DIST_ROOT, absolutePath));
    return { absolutePath, relativePath, sizeBytes: fileSizeBytes(absolutePath) };
  });
  const hashToDistPaths = new Map();
  for (const file of distFiles) {
    const hash = sha256File(file.absolutePath);
    file.sha256 = hash;
    if (!hashToDistPaths.has(hash)) hashToDistPaths.set(hash, []);
    hashToDistPaths.get(hash).push(file.relativePath);
  }
  return { exists: true, hashToDistPaths, distFiles };
}

// ---------------------------------------------------------------------------
// Step 5: assemble one record per asset file, combining everything above.
// ---------------------------------------------------------------------------

// Async because readImageDimensions() (Sharp's `.metadata()`) is Promise-based — see
// docs/architecture/OPEN-SOURCE-REUSE-DECISIONS.md §5/§7. Every per-file entry's synchronous
// work (including the hashGroups mutation below) still runs in assetFiles' original order,
// since Array.prototype.map() invokes each async callback in order and each one runs
// synchronously up to its first `await`; only the dimensions read (the sole await per entry)
// happens out of order/in parallel across files, which is safe because nothing downstream
// depends on file-to-file ordering.
async function buildAssetRecords(assetFiles, references, tmjInfo, dist) {
  const hashGroups = new Map(); // sha256 -> [relativePath]

  const records = await Promise.all(
    assetFiles.map(async ({ absolutePath, relativePath }) => {
      const sizeBytes = fileSizeBytes(absolutePath);
      const sha256 = sha256File(absolutePath);
      const category = categoryFor(relativePath);
      const format = path.extname(relativePath).replace(/^\./, "").toLowerCase() || "(none)";

      if (!hashGroups.has(sha256)) hashGroups.set(sha256, []);
      hashGroups.get(sha256).push(relativePath);

      const referencedDirect = references.directRefs.has(relativePath);
      const referencedGlob = references.globRefs.has(relativePath);
      const referencedCss = references.cssRefs.has(relativePath);
      const referencedTmj = tmjInfo.tmjRefs.has(relativePath);
      const distMatches = dist.hashToDistPaths.get(sha256) ?? [];
      const confirmedInDist = distMatches.length > 0;

      let status;
      if (confirmedInDist) {
        status = "confirmed-shipped";
      } else if (referencedDirect || referencedGlob || referencedCss) {
        status = dist.exists ? "referenced-but-not-found-in-dist" : "referenced-dist-not-built";
      } else if (referencedTmj) {
        // A .tmj references this image, but no import.meta.glob call actually matches it — per
        // createTilesetImageResolver()'s design, that means it would throw at runtime if this map
        // is ever rendered. Distinct from plain "unreferenced" because it's not simply dead art.
        status = "tmj-references-but-no-glob-match";
      } else {
        status = "unreferenced";
      }

      const budgetBytes = budgetFor(category);
      const overBudget = sizeBytes > budgetBytes;
      const dimensions = await readImageDimensions(absolutePath);

      return {
        path: relativePath,
        category,
        format,
        sizeBytes,
        sizeHuman: formatBytes(sizeBytes),
        sha256,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        referencedDirect,
        referencedGlob,
        referencedCss,
        referencedTmj,
        referencingFiles: [
          ...(references.directRefs.get(relativePath) ?? []),
          ...(references.globRefs.get(relativePath) ?? []),
          ...(references.cssRefs.get(relativePath) ?? []),
          ...(tmjInfo.tmjRefs.get(relativePath) ?? []),
        ].sort(),
        confirmedInDist,
        distPaths: distMatches,
        status,
        overBudget,
        budgetBytes,
      };
    })
  );

  for (const record of records) {
    const group = hashGroups.get(record.sha256);
    record.duplicateGroup = group.length > 1 ? record.sha256 : null;
    record.duplicateOf = group.length > 1 ? group.filter((p) => p !== record.path) : [];
  }

  return records;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function buildSummary(records, dist, references, tmjInfo) {
  const totalBytes = records.reduce((sum, r) => sum + r.sizeBytes, 0);
  const shipped = records.filter((r) => r.confirmedInDist);
  const shippedBytes = shipped.reduce((sum, r) => sum + r.sizeBytes, 0);
  const unreferenced = records.filter((r) => r.status === "unreferenced");
  const unreferencedBytes = unreferenced.reduce((sum, r) => sum + r.sizeBytes, 0);

  const byDirectory = new Map();
  const byFormat = new Map();
  for (const r of records) {
    const dirKey = path.posix.dirname(r.path);
    if (!byDirectory.has(dirKey)) byDirectory.set(dirKey, { count: 0, sizeBytes: 0 });
    const dirEntry = byDirectory.get(dirKey);
    dirEntry.count += 1;
    dirEntry.sizeBytes += r.sizeBytes;

    if (!byFormat.has(r.format)) byFormat.set(r.format, { count: 0, sizeBytes: 0 });
    const formatEntry = byFormat.get(r.format);
    formatEntry.count += 1;
    formatEntry.sizeBytes += r.sizeBytes;
  }

  return {
    totalFiles: records.length,
    totalBytes,
    totalHuman: formatBytes(totalBytes),
    distExists: dist.exists,
    confirmedShippedFiles: shipped.length,
    confirmedShippedBytes: shippedBytes,
    confirmedShippedHuman: formatBytes(shippedBytes),
    unreferencedFiles: unreferenced.length,
    unreferencedBytes,
    unreferencedHuman: formatBytes(unreferencedBytes),
    byDirectory: [...byDirectory.entries()]
      .map(([dir, v]) => ({ dir, ...v, sizeHuman: formatBytes(v.sizeBytes) }))
      .sort((a, b) => b.sizeBytes - a.sizeBytes),
    byFormat: [...byFormat.entries()]
      .map(([format, v]) => ({ format, ...v, sizeHuman: formatBytes(v.sizeBytes) }))
      .sort((a, b) => b.sizeBytes - a.sizeBytes),
    referenceWarnings: [...references.warnings, ...tmjInfo.warnings],
  };
}

function writeInventoryReports(records, summary) {
  writeJsonReport(path.join(REPORTS_DIR, "asset-inventory.json"), {
    generatedAt: new Date().toISOString(),
    summary,
    assets: records,
  });

  const header = [
    "path",
    "category",
    "format",
    "sizeBytes",
    "sizeHuman",
    "width",
    "height",
    "sha256",
    "referencedDirect",
    "referencedGlob",
    "referencedCss",
    "referencedTmj",
    "confirmedInDist",
    "status",
    "overBudget",
    "duplicateGroup",
  ];
  const rows = records
    .slice()
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .map((r) => [
      r.path,
      r.category,
      r.format,
      r.sizeBytes,
      r.sizeHuman,
      r.width ?? "",
      r.height ?? "",
      r.sha256,
      r.referencedDirect,
      r.referencedGlob,
      r.referencedCss,
      r.referencedTmj,
      r.confirmedInDist,
      r.status,
      r.overBudget,
      r.duplicateGroup ?? "",
    ]);
  writeTextReport(path.join(REPORTS_DIR, "asset-inventory.csv"), toCsv(header, rows));
}

function writeLargestAssetsReport(records) {
  const sorted = records.slice().sort((a, b) => b.sizeBytes - a.sizeBytes);
  const lines = [
    "# Largest assets (all files, largest to smallest)",
    "",
    `Full machine-readable list: [asset-inventory.json](asset-inventory.json), [asset-inventory.csv](asset-inventory.csv).`,
    `This file shows the top ${Math.min(100, sorted.length)} of ${sorted.length} total files.`,
    "",
    "| # | Path | Size | Status | Dimensions |",
    "|---|---|---|---|---|",
  ];
  sorted.slice(0, 100).forEach((r, i) => {
    const dims = r.width && r.height ? `${r.width}x${r.height}` : "unknown";
    lines.push(`| ${i + 1} | \`${r.path}\` | ${r.sizeHuman} | ${r.status} | ${dims} |`);
  });
  writeTextReport(path.join(REPORTS_DIR, "largest-assets.md"), lines.join("\n"));
}

function writeUnreferencedReport(records) {
  const unreferenced = records
    .filter((r) => r.status === "unreferenced" || r.status === "tmj-references-but-no-glob-match")
    .sort((a, b) => b.sizeBytes - a.sizeBytes);
  const totalBytes = unreferenced.reduce((sum, r) => sum + r.sizeBytes, 0);

  const byDir = new Map();
  for (const r of unreferenced) {
    const dir = path.posix.dirname(r.path);
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir).push(r);
  }

  const lines = [
    "# Unreferenced assets",
    "",
    "Files under `apps/web/src/assets/` that no `new URL(...)`, `import.meta.glob(...)`, or CSS " +
      "`url(...)` call in the scanned source files matches, and whose content hash does not " +
      "appear in the current `apps/web/dist/` build (when a build exists). Per Vite's " +
      "`import.meta.glob` semantics, a file that isn't matched by some glob or direct import " +
      "never ships, regardless of which folder it happens to sit in.",
    "",
    `**Total: ${unreferenced.length} files, ${formatBytes(totalBytes)}.**`,
    "",
    "A status of `tmj-references-but-no-glob-match` means a `.tmj` map's tileset JSON names this " +
      "file, but no `import.meta.glob` call actually matches it — that map would throw at render " +
      "time if it were ever loaded (see `createTilesetImageResolver` in `tiled-map-loader.js`). " +
      "That's a latent-bug signal, not just unused art.",
    "",
  ];
  for (const [dir, files] of [...byDir.entries()].sort(
    (a, b) => b[1].reduce((s, r) => s + r.sizeBytes, 0) - a[1].reduce((s, r) => s + r.sizeBytes, 0)
  )) {
    const dirBytes = files.reduce((s, r) => s + r.sizeBytes, 0);
    lines.push(`## ${dir}/ (${files.length} files, ${formatBytes(dirBytes)})`, "");
    for (const r of files) {
      lines.push(
        `- \`${r.path}\` — ${r.sizeHuman}${r.status !== "unreferenced" ? ` (${r.status})` : ""}`
      );
    }
    lines.push("");
  }
  writeTextReport(path.join(REPORTS_DIR, "unreferenced-assets.md"), lines.join("\n"));
}

function writeDuplicatesReport(records) {
  const groups = new Map();
  for (const r of records) {
    if (!r.duplicateGroup) continue;
    if (!groups.has(r.duplicateGroup)) groups.set(r.duplicateGroup, []);
    groups.get(r.duplicateGroup).push(r);
  }
  const groupList = [...groups.values()].sort(
    (a, b) => b[0].sizeBytes * b.length - a[0].sizeBytes * a.length
  );
  const wastedBytes = groupList.reduce((sum, g) => sum + g[0].sizeBytes * (g.length - 1), 0);

  const lines = [
    "# Duplicate assets (exact SHA-256 content match)",
    "",
    `**${groupList.length} duplicate groups found, ${formatBytes(wastedBytes)} of redundant bytes** ` +
      "(size of all-but-one copy in each group). Detected by content hash, not filename, so " +
      "renamed or relocated copies of the same bytes are still caught.",
    "",
  ];
  if (groupList.length === 0) {
    lines.push("No exact-duplicate files found.");
  }
  groupList.forEach((group, i) => {
    lines.push(`## Group ${i + 1} — ${group[0].sizeHuman} each, ${group.length} copies`, "");
    for (const r of group) {
      lines.push(`- \`${r.path}\``);
    }
    lines.push("");
  });
  writeTextReport(path.join(REPORTS_DIR, "duplicate-assets.md"), lines.join("\n"));
}

function writeProductionAssetsReport(records, dist) {
  const lines = ["# Production (dist) assets", ""];
  if (!dist.exists) {
    lines.push(
      "No `apps/web/dist/` directory was found at audit time — run `npm run build` first if you " +
        "want this report to reflect a real production build. Every asset below is marked by " +
        "reference detection only (`referenced-dist-not-built`), not build confirmation."
    );
  } else {
    const shipped = records
      .filter((r) => r.confirmedInDist)
      .sort((a, b) => b.sizeBytes - a.sizeBytes);
    const shippedBytes = shipped.reduce((s, r) => s + r.sizeBytes, 0);
    lines.push(
      `**${shipped.length} source assets confirmed present in the current \`dist/\` build ` +
        `(by content hash), totaling ${formatBytes(shippedBytes)}.**`,
      "",
      "| Path | Size | Dist file |",
      "|---|---|---|"
    );
    for (const r of shipped) {
      lines.push(`| \`${r.path}\` | ${r.sizeHuman} | \`${r.distPaths.join(", ")}\` |`);
    }
    lines.push("");

    const unmatchedDist = dist.distFiles.filter((f) => !records.some((r) => r.sha256 === f.sha256));
    if (unmatchedDist.length > 0) {
      lines.push(
        "## dist/ files with no matching source asset by hash",
        "",
        "Expected for the JS/CSS bundle output — listed here only for transparency, not as a " +
          "problem:",
        ""
      );
      for (const f of unmatchedDist.sort((a, b) => b.sizeBytes - a.sizeBytes)) {
        lines.push(`- \`${f.relativePath}\` — ${formatBytes(f.sizeBytes)}`);
      }
      lines.push("");
    }
  }

  lines.push(
    "## Large source assets NOT currently shipped",
    "",
    "Present in `apps/web/src/assets/` above the 200 KB reporting threshold, but not referenced " +
      "(and, when a build exists, not present in `dist/`):",
    ""
  );
  const largeUnshipped = records
    .filter(
      (r) => r.sizeBytes > LARGE_ASSET_BYTES && !r.confirmedInDist && r.status === "unreferenced"
    )
    .sort((a, b) => b.sizeBytes - a.sizeBytes);
  if (largeUnshipped.length === 0) {
    lines.push("None found.");
  } else {
    for (const r of largeUnshipped) {
      lines.push(`- \`${r.path}\` — ${r.sizeHuman}`);
    }
  }

  writeTextReport(path.join(REPORTS_DIR, "production-assets.md"), lines.join("\n"));
}

function writeSummaryReport(records, summary, dist, tmjInfo) {
  const sorted = records.slice().sort((a, b) => b.sizeBytes - a.sizeBytes);
  const top20Repo = sorted.slice(0, 20);
  const top20Prod = records
    .filter((r) => r.confirmedInDist)
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .slice(0, 20);
  const largeUnshipped = records
    .filter(
      (r) => r.sizeBytes > LARGE_ASSET_BYTES && !r.confirmedInDist && r.status === "unreferenced"
    )
    .sort((a, b) => b.sizeBytes - a.sizeBytes);
  const duplicateGroups = new Set(
    records.filter((r) => r.duplicateGroup).map((r) => r.duplicateGroup)
  );
  const overBudget = records.filter((r) => r.overBudget).sort((a, b) => b.sizeBytes - a.sizeBytes);
  const tmjFlags = tmjInfo.tileUsage
    .filter(
      (t) => t.usageRatio !== null && t.usageRatio < TILE_USAGE_RATIO_FLAG_THRESHOLD && t.sizeBytes
    )
    .sort((a, b) => a.usageRatio - b.usageRatio);

  const lines = [
    "# Asset audit summary",
    "",
    `Generated ${new Date().toISOString()} by \`scripts/assets/audit.js\` (read-only — no asset ` +
      "was modified to produce this report).",
    "",
    "## Totals",
    "",
    `- **Total repository asset size:** ${summary.totalHuman} across ${summary.totalFiles} files ` +
      "(everything under `apps/web/src/assets/`).",
    `- **Total confirmed production asset size:** ${
      dist.exists
        ? summary.confirmedShippedHuman
        : "unknown — no `dist/` build present at audit time"
    }${dist.exists ? ` across ${summary.confirmedShippedFiles} files, confirmed by SHA-256 match against \`apps/web/dist/\`.` : ""}`,
    `- **Unreferenced (by source scan + dist check):** ${summary.unreferencedHuman} across ${summary.unreferencedFiles} files.`,
    `- **Duplicate groups (exact content match):** ${duplicateGroups.size}.`,
    `- **Files exceeding their category size budget:** ${overBudget.length}.`,
    "",
    "## 20 largest repository assets",
    "",
    "| Path | Size | Status |",
    "|---|---|---|",
  ];
  for (const r of top20Repo) {
    lines.push(`| \`${r.path}\` | ${r.sizeHuman} | ${r.status} |`);
  }

  lines.push("", "## 20 largest confirmed production assets", "");
  if (!dist.exists) {
    lines.push(
      "No `dist/` build was present at audit time — run `npm run build`, then re-run `npm run assets:audit`."
    );
  } else if (top20Prod.length === 0) {
    lines.push("No source assets matched anything in the current `dist/` build by content hash.");
  } else {
    lines.push("| Path | Size |", "|---|---|");
    for (const r of top20Prod) {
      lines.push(`| \`${r.path}\` | ${r.sizeHuman} |`);
    }
  }

  lines.push(
    "",
    "## Highest-value optimization targets",
    "",
    "Confirmed-shipped assets above their category budget, largest first — these are the files " +
      "actually reaching a player's browser today, so they're where a re-encode pass pays off " +
      "immediately (see `docs/architecture/ASSET-PIPELINE-PLAN.md`'s Workstream 4 for the " +
      "planned Sharp-based follow-up, not implemented by this audit):",
    ""
  );
  const shippedOverBudget = overBudget.filter((r) => r.confirmedInDist);
  if (shippedOverBudget.length === 0) {
    lines.push(dist.exists ? "None found." : "Unknown — no `dist/` build present at audit time.");
  } else {
    for (const r of shippedOverBudget) {
      lines.push(
        `- \`${r.path}\` — ${r.sizeHuman} (category budget: ${formatBytes(r.budgetBytes)})`
      );
    }
  }

  lines.push(
    "",
    "## Large files that do not currently ship",
    "",
    `${largeUnshipped.length} files above ${formatBytes(LARGE_ASSET_BYTES)}, present in the repo, ` +
      "unreferenced by any scanned source pattern, and (when a build exists) absent from `dist/`:",
    ""
  );
  if (largeUnshipped.length === 0) {
    lines.push("None found.");
  } else {
    for (const r of largeUnshipped.slice(0, 30)) {
      lines.push(`- \`${r.path}\` — ${r.sizeHuman}`);
    }
    if (largeUnshipped.length > 30) {
      lines.push(`- ...and ${largeUnshipped.length - 30} more — see unreferenced-assets.md.`);
    }
  }

  lines.push(
    "",
    "## Duplicate groups",
    "",
    `${duplicateGroups.size} groups of exact-content-match files — see ` +
      "[duplicate-assets.md](duplicate-assets.md) for the full listing."
  );

  lines.push(
    "",
    "## Tileset sheets with low tile-usage ratio",
    "",
    "For each `.tmj` map, the bounding box of tile ids its layer data actually references, " +
      "compared against the referenced tileset image's full pixel area. A low ratio means the " +
      "map only draws from a small region of a much larger sheet — the sheet is a real " +
      "oversized-for-display candidate, traceable directly to the map's own layer data (not a " +
      "guess). This is a bounding-box approximation (the used region may still contain gaps), " +
      "not exact per-tile accounting.",
    ""
  );
  if (tmjFlags.length === 0) {
    lines.push("None found below the reporting threshold.");
  } else {
    lines.push(
      "| Tileset image | Used / total tile ids | Approx. area used | Map | File size |",
      "|---|---|---|---|---|"
    );
    for (const t of tmjFlags) {
      lines.push(
        `| \`${t.tilesetImage}\` | ${t.usedTileIds} / ${t.totalTileIds} | ${(t.usageRatio * 100).toFixed(1)}% | \`${t.tmjFile}\` | ${formatBytes(t.sizeBytes)} |`
      );
    }
  }

  lines.push(
    "",
    "## Size by directory (top 15)",
    "",
    "| Directory | Files | Size |",
    "|---|---|---|"
  );
  for (const d of summary.byDirectory.slice(0, 15)) {
    lines.push(`| \`${d.dir}/\` | ${d.count} | ${d.sizeHuman} |`);
  }

  lines.push("", "## Size by format", "", "| Format | Files | Size |", "|---|---|---|");
  for (const f of summary.byFormat) {
    lines.push(`| ${f.format} | ${f.count} | ${f.sizeHuman} |`);
  }

  lines.push(
    "",
    "## Limitations in reference detection",
    "",
    '- Direct references are found by parsing `new URL("...", import.meta.url)`, ' +
      '`import.meta.glob("...")`, and CSS `url(...)` calls with a regex/string scan, not a real ' +
      "JS/CSS parser — a reference built from string concatenation or a dynamic variable " +
      "instead of a literal string would not be found. As of this audit, every such call site in " +
      "this codebase uses a literal string, so this is a theoretical gap, not a known miss.",
    "- `import.meta.glob` wildcard matching (`*`, `**`, `?`) is implemented and tested against " +
      "synthetic patterns, but every current call site in the codebase passes an exact literal " +
      "path (no wildcard characters) — there is nothing in this repo today that exercises the " +
      "wildcard path.",
    "- `.tmj` map files are parsed for `tilesets[].image` references and cross-checked against " +
      "glob matches, but this script does not parse Tiled object layers, so any future " +
      "object-layer asset reference (per `docs/architecture/TILED-RUNTIME-DATA-PLAN.md`) is out " +
      "of scope for this pass.",
    "- Some content files (e.g. `apps/web/src/content/unit-01-campaign.js`'s `localAsset` field) " +
      "hold a bare filename as metadata that isn't currently read by any runtime code and isn't " +
      "a `new URL`/glob/CSS reference — it is correctly excluded from the reference count, but " +
      "is worth a human's attention as possibly-intended-future-wiring, not flagged as an error " +
      "here.",
    '- "Confirmed shipped" relies on `apps/web/dist/` reflecting the current source tree — ' +
      (dist.exists
        ? "a `dist/` directory was present, but re-run `npm run build` immediately before " +
          "trusting these numbers if source assets changed since the last build."
        : "no `dist/` directory was present at audit time, so no asset in this run is `confirmed-shipped` — every reference-based status is a prediction, not a build fact.")
  );

  if (summary.referenceWarnings.length > 0) {
    lines.push("", "## Warnings encountered while scanning", "");
    for (const w of summary.referenceWarnings) {
      lines.push(`- ${w}`);
    }
  }

  writeTextReport(path.join(REPORTS_DIR, "asset-audit-summary.md"), lines.join("\n"));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!existsSync(ASSET_ROOT)) {
    console.error(`Asset root not found: ${ASSET_ROOT}`);
    process.exitCode = 1;
    return;
  }

  const assetFiles = collectAssetFiles();
  const references = scanSourceReferences(assetFiles);
  const tmjInfo = scanTmjReferences(assetFiles, references.wiredTmjFiles);
  const dist = scanDistBuild();
  const records = await buildAssetRecords(assetFiles, references, tmjInfo, dist);
  const summary = buildSummary(records, dist, references, tmjInfo);

  writeInventoryReports(records, summary);
  writeLargestAssetsReport(records);
  writeUnreferencedReport(records);
  writeDuplicatesReport(records);
  writeProductionAssetsReport(records, dist);
  writeSummaryReport(records, summary, dist, tmjInfo);

  console.log(`Asset audit complete.`);
  console.log(`  Total repository asset size: ${summary.totalHuman} (${summary.totalFiles} files)`);
  console.log(
    dist.exists
      ? `  Confirmed production asset size: ${summary.confirmedShippedHuman} (${summary.confirmedShippedFiles} files)`
      : `  Confirmed production asset size: unknown — no dist/ build found`
  );
  console.log(`  Unreferenced: ${summary.unreferencedHuman} (${summary.unreferencedFiles} files)`);
  console.log(`  Reports written to reports/assets/`);
  if (summary.referenceWarnings.length > 0) {
    console.log(`  ${summary.referenceWarnings.length} warning(s) — see asset-audit-summary.md`);
  }
}

// Only run main() when this file is executed directly (`node scripts/assets/audit.js` /
// `npm run assets:audit`), not when a test file imports its exported helpers — mirrors the
// existing `if (app) ...` boot-guard precedent in apps/web/src/main.js, which exists for the
// same reason: importing a module shouldn't trigger its real side effects.
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule) {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
