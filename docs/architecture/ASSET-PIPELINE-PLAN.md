# Asset Pipeline Plan

**Status:** planning document, not yet implemented. Part of [`FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md`](FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md)'s Workstream 4. Verified against the repo as of 2026-07-23.

**Reuse policy:** [`docs/architecture/OPEN-SOURCE-REUSE-DECISIONS.md`](OPEN-SOURCE-REUSE-DECISIONS.md) is binding for every reuse-vs-build decision below — see its §5 for the full glob/CSV/image-metadata/atlas-packing/priority-queue research, and its §7 for a real violation of this policy found already sitting in the (uncommitted) `scripts/assets/` code this plan describes.

## Current state (verified)

`apps/web/src/assets/` is organized into `tilesets/` (98 files across 11 pack folders plus a loose root spritesheet), `chronicle-sprites/` (49 files), `institute/` (10 files), `mini-games/` (6 files), `maps/` (1 file), and `documents/` (1 file). Cross-referencing what `main.js` actually globs (5 `createTilesetImageResolver()` call sites, `main.js:218-349`) against what's on disk:

- **What actually ships today:** `documents/source-waldseemuller-1507.jpg` at **3,724,894 bytes (~3.7 MB)**, plus a handful of referenced tileset pack images in the 0.6–1.2 MB range — e.g. `tilesets/Medieval Fantasy Town/4.png` (~1.2 MB), `tilesets/Island survival/tile-B-01.png` (~1.1 MB). All `chronicle-sprites/` and `institute/` character art is trivially small (240 bytes–1.8 KB each) — not a size concern.
- **What sits in the repo but is not referenced anywhere in `main.js`, and per Vite's `import.meta.glob` semantics therefore does not ship:** `tilesets/spritesheet.png` at **~28 MB**, and entire pack folders — `Green Apocalyptic 1`, `Green Apocalyptic 2` (several files each in the 4–6 MB range), `Medieval harbor`, `Modern Interiors`, `Sandy Island`. This is a repo-hygiene and accidental-inclusion-risk problem (a future careless broad glob could pull one of these into production), not a current production-bundle-size problem.
- `package.json`'s existing scripts (`dev`, `build`, `preview`, `validate:content`, `lint`, `format`, `format:check`, `test`, `test:watch`) include nothing for asset auditing, optimization, or bundle analysis.
- `scripts/` at the repo root already contains one-off Node scripts (`generate-*-tmj.js`) and one PowerShell script (`resize-sandy-island-spritesheet.ps1`) that shells out to an external image tool — this is the existing precedent this plan's scripts follow, not a new pattern.
- The repo's `.gitignore` has no assets-related entries at all today (only `node_modules/`, `dist/`, `.env*`, `coverage/`, `.vscode/*.log`, `.playwright-mcp/`).
- **`scripts/assets/audit.js`, `manifest.js`, and `lib/file-stats.js` already exist in the working tree (uncommitted)** as of this 2026-07-23 revision — the `assets:audit` npm script below is real and runs today, not merely planned. Reviewing that already-written code against the reuse policy in `OPEN-SOURCE-REUSE-DECISIONS.md` found it diverges from this very document's own File Layout section (below), which always specified `lib/file-stats.js` as a thin "Sharp metadata (width/height/format) wrapper" — the actual code instead hand-rolls binary PNG/JPEG/GIF header parsers and a regex-based SVG reader, plus a hand-rolled CSV writer (`manifest.js`) and glob matcher (`audit.js`). See "Found during this review" below.

## Tool evaluation

| Tool | Purpose | License | Maintenance | Decision |
|---|---|---|---|---|
| **Sharp** | Resize, reformat, PNG palette/compression pass | Apache-2.0 | Actively maintained, extremely widely used (tens of millions of weekly downloads) | **Adopt** as a real devDependency — the pipeline's baseline tool |
| **oxipng** | Lossless PNG optimization | MIT/Apache-2.0 (the underlying Rust project) | The Rust project itself is actively maintained; **every npm wrapper package is stale** (multiple wrapper packages sitting at years-old versions with negligible download counts) | **Do not add an npm dependency.** Shell out to an externally-installed `oxipng` CLI binary if present on `PATH`; skip with a warning if not. Optional power-tool, never build-blocking — mirrors this repo's existing `resize-sandy-island-spritesheet.ps1` precedent of shelling out to an external tool rather than vendoring a wrapper package |
| **picomatch** | Test a glob-pattern string against a candidate path (e.g. does an extracted `import.meta.glob("...")` literal match a given asset file) | MIT | v4.0.5, active, zero runtime deps | **Adopt** as a real devDependency for `audit.js` — replaces the hand-rolled `globToRegExp()` already sitting in that file. See `OPEN-SOURCE-REUSE-DECISIONS.md` §5/§7 |
| **csv-stringify** (`csv-stringify/sync`) | CSV report generation with correct escaping | MIT | v6.8.1, active, part of `adaltas/node-csv` | **Adopt** as a real devDependency for `manifest.js` — replaces the hand-rolled `toCsv`/`csvCell` already sitting in that file. See `OPEN-SOURCE-REUSE-DECISIONS.md` §5/§7 |
| **maxrects-packer** | Texture-atlas / spritesheet packing | MIT | v2.7.3, active, TS-authored, dual CJS/ESM | **Name for later, don't adopt now.** Workstream 1's first-generation sprite sheets are simple 2-frame horizontal strips built by a custom Sharp compositor (see `docs/art/CHARACTER-SPRITESHEET-STANDARD.md`) — real bin-packing only earns its keep once sprite/tile count grows enough to need it. Revised 2026-07-23 to prefer this over `free-tex-packer-core`: both wrap the same packing algorithm, but `free-tex-packer-core` also pulls in `jimp`/`tinify`/`mustache` for a heavier dependency surface with no benefit for Chronicle's simple-strip use case — see `OPEN-SOURCE-REUSE-DECISIONS.md` §5 |
| **rollup-plugin-visualizer** | JS bundle-size analysis (Vite's build is Rollup under the hood) | MIT | Actively maintained | **Adopt** as a devDependency, gated behind `process.env.ANALYZE === "true"` in `vite.config.js` so it never runs on normal builds. Note: recent versions require Node.js ≥ 22 — verify against the actual Node version in use before adding, since `package.json` has no `engines` field today to already enforce this |

`rollup-plugin-visualizer` is a **diagnostic tool for JS bundle weight** — it does not shrink anything, and should not be conflated with the image-asset-size problem this pipeline otherwise targets. The audit already established the JS bundle itself is not an engine-dependency-weight problem (11 total dependencies, none game-engine-related); this tool exists to keep that true as the codebase grows, not to fix a current JS-size issue.

## Found during this review: hand-rolled code that should use the tools above

The already-written (uncommitted) `scripts/assets/` code hand-rolls three things this plan's own File Layout section always intended to be library-backed:

- **`lib/file-stats.js`** hand-rolls `readPngDimensions`/`readJpegDimensions`/`readGifDimensions` (binary header parsers) and a regex-based `readSvgDimensions`, instead of the Sharp `.metadata()` wrapper this document's File Layout section (below) always specified. Sharp is already an approved dependency and its bundled libvips decoders cover PNG/JPEG/GIF/WebP/SVG directly.
- **`manifest.js`** hand-rolls `toCsv`/`csvCell` (CSV escaping) instead of `csv-stringify/sync`.
- **`audit.js`** hand-rolls `globToRegExp()` (converts an extracted glob-pattern string to a RegExp and tests it against candidate paths) instead of `picomatch.isMatch()`.

Per explicit owner direction, these are **flagged here, not fixed, in this planning pass** — fixing them is recommended as the first implementation task; see `OPEN-SOURCE-REUSE-DECISIONS.md` §9 and the "recommended first implementation task" section of `FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md`.

## File layout

```
scripts/assets/
  audit.js                 # read-only: unreferenced files, largest files, format breakdown, duplicate detection
  build-sprite-sheets.js   # Workstream 1's compositor (Sharp) — composites existing per-state PNGs into strips
  optimize.js              # Sharp palette/compression pass over shipped images; optional oxipng CLI shell-out
  manifest.js              # shared manifest read/write helpers, used by the three scripts above
  lib/
    file-stats.js          # sha256 content hash, byte size, Sharp metadata (width/height/format) wrapper
```

This mirrors the existing `scripts/` convention (flat, purpose-named Node scripts, `.js` not TypeScript, run via npm scripts rather than a build-plugin abstraction) rather than introducing a new tooling paradigm.

## npm scripts

Added to root `package.json`'s `"scripts"` block:

| Script | Command | Purpose |
|---|---|---|
| `assets:audit` | `node scripts/assets/audit.js` | Read-only report: unreferenced files (cross-referenced against `main.js`'s glob calls), largest files by byte size, format breakdown, content-hash duplicate detection |
| `assets:build` | `node scripts/assets/build-sprite-sheets.js` | Runs Workstream 1's sprite-sheet compositor, writes to `generated/sprite-sheets/`, updates the manifest |
| `assets:optimize` | `node scripts/assets/optimize.js` | Sharp resize/reformat/compress pass on shipped images, optional oxipng CLI pass if available, writes to `generated/`, updates the manifest |
| `build:analyze` | `ANALYZE=true vite build` | Production build with `rollup-plugin-visualizer` active |

## Generated output convention

New directory: **`apps/web/src/assets/generated/`** — gitignored (a new `.gitignore` entry, since none exists today for assets), created fresh by `assets:build`/`assets:optimize`, never committed. Source originals (`chronicle-sprites/`, `institute/`, `maps/`, `documents/`, `tilesets/`) stay exactly where they are and are never rewritten in place — every script in this pipeline only ever **reads** from the existing source tree and **writes** to `generated/`. This keeps the pipeline fully non-destructive and trivially re-runnable; deleting `generated/` and re-running the scripts always reproduces the same output from the same source.

```
apps/web/src/assets/
  generated/                    # new, gitignored
    sprite-sheets/               # Workstream 1 output
      chronicler-a-down.png
      ...
    optimized/                   # Workstream 4 output
      documents/
        source-waldseemuller-1507.jpg
      tilesets/
        Medieval Fantasy Town/4.png
        ...
    manifest.json
```

`main.js` would eventually import from `generated/optimized/...` instead of the raw source path for the specific files the optimizer processes — that specific call-site swap is a small, separate follow-up change once the pipeline is built and its output has been visually spot-checked, not part of this planning document.

## Manifest JSON shape

One entry per generated file, plus a top-level timestamp:

```json
{
  "generatedAt": "2026-07-23T00:00:00.000Z",
  "assets": [
    {
      "filename": "source-waldseemuller-1507.jpg",
      "category": "optimized-document",
      "width": 3200,
      "height": 2400,
      "format": "jpg",
      "fileSize": 1834219,
      "contentHash": "sha256:...",
      "sourceFile": "apps/web/src/assets/documents/source-waldseemuller-1507.jpg",
      "productionFile": "apps/web/src/assets/generated/optimized/documents/source-waldseemuller-1507.jpg"
    }
  ]
}
```

- `sourceFile` is an array, not a single string, for `category: "sprite-sheet"` entries — compositor output combines multiple source PNGs (e.g. an idle file and a step file) into one sheet.
- `contentHash` (sha256 of the file bytes) is what `assets:audit` uses to detect duplicate files across the source tree independent of filename.
- `productionFile` is the exact repo-relative path that would actually be imported once `main.js` is updated to use it — this is what makes the manifest useful for verifying "did the swap actually happen" later, not just "did the pipeline run."

## Audit behavior — what it warns about

- **Unreferenced files:** any file under `apps/web/src/assets/` not matched by any `import.meta.glob` pattern found in `main.js` — this is what surfaces the 28 MB `spritesheet.png` and the unused `Green Apocalyptic 1`/`2`/`Sandy Island`/`Modern Interiors`/`Medieval harbor` packs by exact path and byte count.
- **Oversized-for-display warning:** flags a shipped asset whose actual pixel dimensions are far larger than the dimensions it's ever rendered at (a check against known usage — e.g. a 48×48 sprite slot never needs a multi-hundred-pixel source file).
- **Size-budget warning:** flags any file entering `generated/` (i.e., a file that would actually ship) that exceeds a defined per-category byte budget — set conservatively at first (e.g. 500 KB for a tileset image, 2 MB for a full-page document scan) and adjustable as real usage patterns are observed.
- **Duplicate detection:** any two files sharing a `contentHash` are flagged, regardless of filename or location.
- **dist/ guard:** `assets:audit` also checks that no file under `apps/web/src/assets/` (source, unoptimized) larger than the size budget appears in a prior `dist/` build output, as a safety net against a future accidental broad glob shipping something like the 28 MB file.

## Concrete before/after reasoning, tied to real numbers

| Asset | Current size | Tool | Realistic result |
|---|---|---|---|
| `documents/source-waldseemuller-1507.jpg` (shipped) | 3.7 MB | Sharp re-encode | ~1.5–2.5 MB, no visible quality loss for an archival document scan |
| `tilesets/Medieval Fantasy Town/4.png` (shipped) | ~1.2 MB | Sharp palette optimization | 20–50% smaller — tile art is inherently low-color-count, a strong fit for palette/indexed PNG compression |
| `tilesets/Island survival/tile-B-01.png` (shipped) | ~1.1 MB | Sharp palette optimization | 20–50% smaller, same reasoning |
| Any of the above, additionally | — | Optional oxipng CLI pass on top of Sharp's output | Another ~5–15% lossless savings, for whoever has the binary installed locally |
| `tilesets/spritesheet.png` (unreferenced, doesn't ship) | 28 MB | `assets:audit` flag | Repo-hygiene fix (flag for removal or archival), not a production-size fix — it doesn't currently ship |
| `Green Apocalyptic 1`/`2`, `Sandy Island`, `Modern Interiors`, `Medieval harbor` packs (unreferenced, don't ship) | several MB each | `assets:audit` flag | Same — repo-hygiene fix, and reduces future accidental-inclusion risk from a careless broad glob |

## What this pipeline does not do

It does not resize or reformat pixel-art sprite/tile images with anything other than nearest-neighbor-safe operations — Sharp's resize calls for pixel art use `kernel: "nearest"`; portraits, scans, and background illustrations use Sharp's default (Lanczos) resampling instead, since nearest-neighbor scaling would visibly degrade continuous-tone art. It does not convert pixel-art images to WebP/AVIF (format conversion is only considered for non-pixel-art images, and only if a real browser-support/quality tradeoff review shows it's worth doing — not proposed as a default here). It does not touch `apps/web/src/assets/generated/`'s equivalent for JS code — that's what `build:analyze` is for, kept deliberately separate. It does not remove or rewrite any source file in place.
