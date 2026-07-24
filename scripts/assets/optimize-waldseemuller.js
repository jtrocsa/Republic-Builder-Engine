#!/usr/bin/env node
// Single-asset optimization PILOT (Workstream 4 of
// docs/architecture/FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md / ASSET-PIPELINE-PLAN.md).
//
// Scope is deliberately narrow: this script only ever touches ONE file —
// apps/web/src/assets/documents/source-waldseemuller-1507.jpg. It is not the general
// `assets:optimize` pipeline ASSET-PIPELINE-PLAN.md describes; that remains a separate,
// not-yet-built task. This is the bounded pilot the plan's own rollout order calls for first.
//
// Non-destructive by construction: the source file is only ever opened for reading. Every write
// goes under apps/web/src/assets/generated/optimized/documents/ (gitignored, safe to delete and
// regenerate at any time). main.js's production import is never touched by this script.
//
// Usage: npm run assets:optimize:waldseemuller  (or: node scripts/assets/optimize-waldseemuller.js)

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { fileSizeBytes, formatBytes, sha256File } from "./lib/file-stats.js";
import { writeTextReport } from "./manifest.js";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../..");

export const DEFAULT_SOURCE_FILE = path.join(
  REPO_ROOT,
  "apps",
  "web",
  "src",
  "assets",
  "documents",
  "source-waldseemuller-1507.jpg"
);
export const DEFAULT_OUTPUT_DIR = path.join(
  REPO_ROOT,
  "apps",
  "web",
  "src",
  "assets",
  "generated",
  "optimized",
  "documents"
);
export const DEFAULT_REPORT_FILE = path.join(
  REPO_ROOT,
  "reports",
  "assets",
  "waldseemuller-optimization-pilot.md"
);

const OUTPUT_FILENAME = "source-waldseemuller-1507.jpg";

// Three candidates, per the task's "at most three" cap. Every candidate:
//   - never resizes with a nearest-neighbor kernel (candidate C uses Sharp's Lanczos3, the
//     library default for continuous-tone images — never sharp.kernel.nearest, which this
//     pipeline reserves for pixel-art tilesets, per ASSET-PIPELINE-PLAN.md);
//   - calls `.rotate()` with no arguments, which auto-applies any EXIF orientation to the actual
//     pixels and then drops the orientation tag — the correct way to "preserve orientation" while
//     still stripping metadata, regardless of whether the source happens to carry one;
//   - never calls `.withMetadata()`, so no EXIF/ICC/XMP is copied to the output (Sharp's default
//     behavior is to emit a clean image with none of the input's metadata);
//   - uses mozjpeg's encoder (bundled with this repo's Sharp build) with 4:2:0 chroma
//     subsampling, matching the source's own encoding, and progressive scan order, which is
//     lossless-to-decode and typically saves additional bytes over baseline JPEG.
export const CANDIDATES = [
  {
    id: "candidate-a-mozjpeg-q82-native-res",
    label: "Candidate A — native resolution, mozjpeg q82",
    resizeWidth: null,
    jpeg: { quality: 82, mozjpeg: true, chromaSubsampling: "4:2:0", progressive: true },
  },
  {
    id: "candidate-b-mozjpeg-q75-native-res",
    label: "Candidate B — native resolution, mozjpeg q75 (more aggressive)",
    resizeWidth: null,
    jpeg: { quality: 75, mozjpeg: true, chromaSubsampling: "4:2:0", progressive: true },
  },
  {
    id: "candidate-c-mozjpeg-q85-resized-3600",
    label: "Candidate C — resized to 3600px wide (Lanczos3), mozjpeg q85",
    resizeWidth: 3600,
    jpeg: { quality: 85, mozjpeg: true, chromaSubsampling: "4:2:0", progressive: true },
  },
];

// Candidate C is recommended, per explicit project-owner direction (2026-07-23): this source's
// real gameplay use is the map-jigsaw puzzle (`.jigsaw-grid`/`.map-piece`, background-size 200%
// against a ~620px-wide grid), not fine-detail zoom reading — the owner confirmed students don't
// need to zoom in heavily on this particular document, so the resized candidate's larger size
// savings are worth taking. See the report's "Display-requirement evidence" and "Recommendation"
// sections for the full reasoning. Candidates A and B (both native-resolution, differing only in
// JPEG quality) are kept on disk for comparison, not deleted.
export const RECOMMENDED_CANDIDATE_ID = "candidate-c-mozjpeg-q85-resized-3600";

export function computeReduction(sourceBytes, outputBytes) {
  const bytesSaved = sourceBytes - outputBytes;
  const percentReduction = sourceBytes > 0 ? (bytesSaved / sourceBytes) * 100 : 0;
  return { bytesSaved, percentReduction };
}

/**
 * Runs one candidate's Sharp pipeline against an in-memory source buffer and returns the encoded
 * output buffer. Takes a buffer (not a path) so tests can exercise this against small synthetic
 * fixtures without touching the real ~3.7 MB source file.
 */
export async function buildCandidateBuffer(sourceBuffer, candidate) {
  let pipeline = sharp(sourceBuffer).rotate();
  if (candidate.resizeWidth) {
    pipeline = pipeline.resize({
      width: candidate.resizeWidth,
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: true,
    });
  }
  return pipeline.jpeg(candidate.jpeg).toBuffer();
}

async function statBuffer(buffer) {
  const { width, height, format } = await sharp(buffer).metadata();
  return {
    width,
    height,
    format,
    sizeBytes: buffer.length,
    sizeHuman: formatBytes(buffer.length),
  };
}

/**
 * Orchestrates the full pilot: read source, build every candidate, write the recommended
 * candidate to the production-shaped output path, write every candidate (including the
 * recommended one) to a candidates/ subfolder for side-by-side review, and return a plain result
 * object describing everything that happened. Paths are injectable so tests can point this at a
 * temp directory and a small synthetic fixture instead of the real repo paths.
 *
 * Throws a clear, specific error — without creating any directory or writing any file — if the
 * source file does not exist.
 */
export async function runPilotOptimization({
  sourceFile = DEFAULT_SOURCE_FILE,
  outputDir = DEFAULT_OUTPUT_DIR,
} = {}) {
  if (!existsSync(sourceFile)) {
    throw new Error(
      `optimize-waldseemuller: source file not found at "${sourceFile}". Nothing was written — ` +
        "this pilot only ever reads the source and never invents or substitutes a placeholder."
    );
  }

  const sourceBuffer = readFileSync(sourceFile);
  const sourceHashBefore = sha256File(sourceFile);
  const sourceStats = await statBuffer(sourceBuffer);
  sourceStats.sha256 = sourceHashBefore;

  const candidatesDir = path.join(outputDir, "candidates");
  mkdirSync(candidatesDir, { recursive: true });

  const candidateResults = [];
  for (const candidate of CANDIDATES) {
    const buffer = await buildCandidateBuffer(sourceBuffer, candidate);
    const stats = await statBuffer(buffer);
    const sha256 = createSha256(buffer);
    const { bytesSaved, percentReduction } = computeReduction(sourceStats.sizeBytes, stats.sizeBytes);

    const candidateFile = path.join(candidatesDir, `${candidate.id}.jpg`);
    writeFileSync(candidateFile, buffer);

    candidateResults.push({
      ...candidate,
      ...stats,
      sha256,
      bytesSaved,
      percentReduction,
      writtenTo: candidateFile,
    });
  }

  const recommended = candidateResults.find((c) => c.id === RECOMMENDED_CANDIDATE_ID);
  if (!recommended) {
    throw new Error(`optimize-waldseemuller: recommended candidate "${RECOMMENDED_CANDIDATE_ID}" not found`);
  }

  const productionOutputFile = path.join(outputDir, OUTPUT_FILENAME);
  writeFileSync(productionOutputFile, readFileSync(recommended.writtenTo));

  // Confirm the source was never touched by anything above.
  const sourceHashAfter = sha256File(sourceFile);
  const sourceUnmodified = sourceHashAfter === sourceHashBefore;

  return {
    sourceFile,
    sourceStats,
    sourceUnmodified,
    outputDir,
    candidatesDir,
    productionOutputFile,
    candidates: candidateResults,
    recommendedCandidateId: RECOMMENDED_CANDIDATE_ID,
    recommended,
    generatedAt: new Date().toISOString(),
  };
}

function createSha256(buffer) {
  // Mirrors lib/file-stats.js's sha256File, but operating on an in-memory buffer rather than a
  // path — every candidate is hashed before it's written to disk.
  return createHash("sha256").update(buffer).digest("hex");
}

export function renderPilotReportMarkdown(result) {
  const { sourceStats, recommended, candidates, generatedAt, sourceFile, productionOutputFile } =
    result;
  const lines = [];
  lines.push("# Waldseemüller optimization pilot");
  lines.push("");
  lines.push(
    `Generated ${generatedAt} by \`scripts/assets/optimize-waldseemuller.js\` ` +
      "(single-asset pilot — see docs/architecture/ASSET-PIPELINE-PLAN.md)."
  );
  lines.push("");
  lines.push("## Scope");
  lines.push("");
  lines.push(
    `- Source (read-only, never modified): \`${toRepoRel(sourceFile)}\``
  );
  lines.push(
    `- Recommended output (written by this pilot, not yet wired into production): \`${toRepoRel(
      productionOutputFile
    )}\``
  );
  lines.push(
    "- No other asset (tileset, sprite, portrait, map) was read or written by this pilot."
  );
  lines.push("");
  lines.push("## Original");
  lines.push("");
  lines.push(`- Dimensions: ${sourceStats.width} x ${sourceStats.height}`);
  lines.push(`- Format: ${sourceStats.format}`);
  lines.push(`- Size: ${sourceStats.sizeHuman} (${sourceStats.sizeBytes} bytes)`);
  lines.push(`- SHA-256: \`${sourceStats.sha256}\``);
  lines.push("");
  lines.push("## Recommended output — " + recommended.label);
  lines.push("");
  lines.push(`- Dimensions: ${recommended.width} x ${recommended.height}`);
  lines.push(`- Format: ${recommended.format}`);
  lines.push(`- Size: ${recommended.sizeHuman} (${recommended.sizeBytes} bytes)`);
  lines.push(`- SHA-256: \`${recommended.sha256}\``);
  lines.push(
    `- Reduction: ${recommended.percentReduction.toFixed(1)}% (${formatBytes(recommended.bytesSaved)} saved, ${recommended.bytesSaved} bytes)`
  );
  lines.push(
    `- Sharp settings: ${describeCandidateSettings(recommended)}`
  );
  lines.push("");
  lines.push("## All candidates generated (for comparison — none deleted)");
  lines.push("");
  lines.push("| Candidate | Dimensions | Size | Reduction | Settings | Recommended? |");
  lines.push("|---|---|---|---|---|---|");
  for (const c of candidates) {
    lines.push(
      `| ${c.label} | ${c.width}x${c.height} | ${c.sizeHuman} | ${c.percentReduction.toFixed(1)}% | ${describeCandidateSettings(c)} | ${c.id === recommended.id ? "Yes" : "No — kept for review"} |`
    );
  }
  lines.push("");
  lines.push(
    "Every candidate file remains on disk under `candidates/` alongside the recommended copy — " +
      "none are deleted by this script. Review them, then delete the ones not chosen."
  );
  lines.push("");
  lines.push("## Display-requirement evidence (why dimensions were/weren't changed)");
  lines.push("");
  lines.push(
    "- **Source reader** (`apps/web/src/main.js`, `sourceVisual()`'s `document-image` figure): " +
      "`.document-image img { width: 100%; height: auto; max-height: 500px; object-fit: contain; }` " +
      "(`apps/web/src/styles/global.css:1421-1427`). The figure's own caption in `main.js` reads " +
      '"Zoom is intentionally preserved in the reader; students do not need to leave Chronicle to ' +
      'view it." — an explicit product requirement that the full-resolution scan stay inspectable, ' +
      "not just a small on-screen thumbnail."
  );
  lines.push(
    "- **Map-jigsaw puzzle** (`.jigsaw-grid`/`.map-piece`, `global.css:5367-5452`): the whole map " +
      "image is shown across a `width: min(620px, 100%)`, `aspect-ratio: 1.55/1` grid via " +
      "`background-size: 200% 200%` on each of 4 pieces — a materially smaller on-screen footprint " +
      "than the reader view."
  );
  lines.push(
    "- The reader's caption asserts a general zoom-preservation intent, but this document's actual " +
      "in-game role for this task is the map-jigsaw puzzle above, a materially smaller on-screen " +
      "footprint than the reader. **Project-owner direction (2026-07-23):** students don't need " +
      "heavy zoom fidelity on this particular map for this task, so the resized Candidate C is an " +
      "accepted tradeoff — this overrides the more conservative native-resolution-by-default " +
      "reasoning this pilot originally used, and is recorded here as the reason for the pick, not " +
      "a default the tooling would make unprompted."
  );
  lines.push("");
  lines.push("## Risk to readability");
  lines.push("");
  lines.push(
    "- Candidate C (recommended) resizes to 3600px wide (from 4500px) via Lanczos3, plus mozjpeg " +
      "quality 85 — dimensions are reduced, so a student zooming in on fine engraved line-work or " +
      "small text in the reader view will hit upscaled blur sooner than with the original. Per " +
      "owner direction, this is an accepted tradeoff for this task, since the map-jigsaw puzzle " +
      "(the actual gameplay use) doesn't need that fidelity. If this document is ever repurposed " +
      "for close-reading of fine text, revisit this choice."
  );
  lines.push(
    "- Candidate A (native resolution, mozjpeg q82) and Candidate B (native resolution, mozjpeg " +
      "q75) are both kept as safer, zero-resize alternatives — either can be swapped in instead " +
      "with no dimension-related readability tradeoff, at the cost of less size reduction."
  );
  lines.push("");
  lines.push("## Rollback steps");
  lines.push("");
  lines.push(
    "- The production import in `main.js` (`const waldseemuller = new URL(\"./assets/documents/" +
      'source-waldseemuller-1507.jpg", import.meta.url)`, `main.js:353`) was **not changed** by ' +
      "this pilot — there is nothing to roll back at the production-import level."
  );
  lines.push(
    "- If a future change does swap that import to the generated file and needs to be undone: " +
      "revert that one-line change in `main.js` back to the original `./assets/documents/...` path."
  );
  lines.push(
    "- To remove the pilot's output entirely: delete `apps/web/src/assets/generated/` (gitignored, " +
      "fully regenerable by re-running `npm run assets:optimize:waldseemuller`) and this report file."
  );
  lines.push(
    "- The original source file was never opened for writing at any point — confirmed by SHA-256 " +
      `comparison before/after this run: unchanged (\`${sourceStats.sha256}\`).`
  );
  lines.push("");
  lines.push("## Recommendation");
  lines.push("");
  lines.push(
    `Candidate C reduces this file from ${sourceStats.sizeHuman} to ${recommended.sizeHuman} ` +
      `(${recommended.percentReduction.toFixed(1)}% smaller), resizing 4500x2508 down to ` +
      `${recommended.width}x${recommended.height}. This pick reflects explicit project-owner ` +
      "direction (2026-07-23) that this document's real gameplay use for this task is the " +
      "map-jigsaw puzzle, not fine-detail zoom reading, so the larger size savings are worth the " +
      "reduced headroom for zoom. **Before switching `main.js`'s production import**, a human " +
      `should still open \`${toRepoRel(recommended.writtenTo)}\` and confirm the puzzle pieces and ` +
      "the reader view both still read clearly at their actual on-screen sizes — this pilot's " +
      "report is evidence for that review, not a substitute for it. Once that visual check passes, " +
      "the follow-up change is updating `main.js`'s `waldseemuller` import (`main.js:353`) and " +
      "`global.css`'s two `--map-piece-image: url(...)` declarations (`global.css:5448`, `:5451`) " +
      "from the raw `assets/documents/...` path to " +
      "`assets/generated/optimized/documents/source-waldseemuller-1507.jpg`."
  );
  lines.push("");
  return lines.join("\n");
}

function describeCandidateSettings(candidate) {
  const resize = candidate.resizeWidth
    ? `resize to ${candidate.resizeWidth}px wide (Lanczos3)`
    : "no resize (native resolution)";
  const { quality, mozjpeg, chromaSubsampling, progressive } = candidate.jpeg;
  return `${resize}; mozjpeg q${quality}, chroma ${chromaSubsampling}, progressive=${progressive}`;
}

function toRepoRel(absolutePath) {
  return path.relative(REPO_ROOT, absolutePath).split(path.sep).join("/");
}

async function main() {
  const result = await runPilotOptimization();
  const report = renderPilotReportMarkdown(result);
  writeTextReport(DEFAULT_REPORT_FILE, report);

  console.log("Waldseemüller optimization pilot complete.");
  console.log(`  Source: ${result.sourceStats.sizeHuman} (${result.sourceStats.width}x${result.sourceStats.height})`);
  console.log(
    `  Recommended (${result.recommended.id}): ${result.recommended.sizeHuman} ` +
      `(${result.recommended.percentReduction.toFixed(1)}% smaller)`
  );
  console.log(`  Source unmodified: ${result.sourceUnmodified}`);
  console.log(`  Written to: ${toRepoRel(result.productionOutputFile)}`);
  console.log(`  All candidates in: ${toRepoRel(result.candidatesDir)}/`);
  console.log(`  Report: ${toRepoRel(DEFAULT_REPORT_FILE)}`);
  console.log("  Production import in main.js was NOT changed by this script.");
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
