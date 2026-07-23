# Open-Source Reuse Decisions

**Status:** planning document, not yet implemented. No package was installed and no code was changed to produce this document. Research performed 2026-07-23 against live npm registry, GitHub, and Bundlephobia data. This document is **binding** for the four modernization planning docs it accompanies — [`FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md`](FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md), [`ASSET-PIPELINE-PLAN.md`](ASSET-PIPELINE-PLAN.md), [`TILED-RUNTIME-DATA-PLAN.md`](TILED-RUNTIME-DATA-PLAN.md), and [`../art/CHARACTER-SPRITESHEET-STANDARD.md`](../art/CHARACTER-SPRITESHEET-STANDARD.md) — when any of them disagree with a decision recorded here, this document wins.

## Why this document exists

The project owner set an explicit policy for all modernization work: **do not reinvent generic game-development systems that already have reliable open-source implementations, established standards, or official reference code.** Chronicle-specific code should be thin adapters and integration code, not reimplementations of solved problems. Custom implementation of a generic algorithm is acceptable only when *all* of the following hold:

- the behavior is genuinely Chronicle-specific, or available libraries are technically incompatible, unsafe, incorrectly licensed, or substantially larger than the problem;
- at least three realistic existing implementations were investigated;
- the rejection of each is documented with evidence;
- the custom implementation is smaller than the adapter an alternative would need;
- unit tests are included;
- the project owner explicitly approves the custom implementation.

Auditing the four existing planning docs against this bar found one clear violation: the pathfinding section of `FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md` rejected three libraries in a thin table and recommended hand-rolling A* on the reasoning that it's "roughly 80–120 lines" — precisely the justification the policy calls out as insufficient. Reading the repository for this review also surfaced a second, concrete instance already sitting in code: `scripts/assets/` (uncommitted, not yet part of any git history) hand-rolls a glob-pattern matcher, CSV escaping, and binary PNG/JPEG/GIF/SVG header parsers — see §7.

This document redoes the pathfinding evaluation with real evidence, and separately investigates every other capability the owner named, so every "build it ourselves" decision across the four docs rests on cited findings rather than assertion.

## 1. Reuse policy

Adopted for all modernization work, consistent with the existing precedent in `THIRD-PARTY-TOOLING-AUDIT.md` §17–19 (license table, "new dependencies land as devDependencies unless they ship to the browser bundle," "no dependency adopted speculatively," version-pinning conventions):

- Prefer permissive licenses: MIT, BSD, ISC, Apache-2.0. Anything else (copyleft, source-available, non-OSI-standard permissive licenses like BlueOak-1.0.0) requires an explicit, separately-flagged owner decision — never adopted by default.
- Record every adopted package's exact license in the decision table below.
- Never copy source code from a repository without verifying its license first.
- Preserve required copyright/attribution notices when a license requires them.
- Prefer `npm install` over copying source files, whenever a package is a reasonable fit.
- When adapting reference code (rather than installing a package) — for example, following CSS-Tricks' `steps()` sprite pattern or the official Tiled JSON spec — identify the source and describe what was changed, in a code comment at the point of use.
- Never copy proprietary Pokémon code, assets, maps, names, or leaked/disassembled game source into Chronicle. Pokémon may be referenced only as a gameplay/visual-behavior pattern, never as source material.
- Pin important dependencies to an exact or narrow version range and isolate them behind a Chronicle-owned adapter file.
- Keep third-party-specific APIs out of `main.js` — every dependency's only caller is its adapter.
- Design every adapter so the dependency is removable by replacing one file, never by touching gameplay code.

## 2. NPC pathfinding

### Candidates investigated

| Package | Repo | License | Version / published | Last real activity | Module format | Grid-native | Weighted terrain | Diagonal + corner-cut | Dynamic replanning | Tests | Size (min/gzip) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `pathfinding` (PathFinding.js) | [qiao/PathFinding.js](https://github.com/qiao/PathFinding.js) | MIT | 0.4.18, published 2016-05-10 | Repo touched 2024-06-20, but **no npm release since 2016**; 106 open issues | CJS/browser-script only, no `"exports"`/`"type"` | Yes (`PF.Grid`) | Partial — general per-node weighting is an **open, unmerged PR** ([#151](https://github.com/qiao/PathFinding.js/pull/151/files)) | Yes (`allowDiagonal`, `dontCrossCorners`) | None built-in | mocha/should.js suite exists, no published coverage | 21,166 B / 5,378 B |
| `easystarjs` (EasyStar.js) | [prettymuchbryce/easystarjs](https://github.com/prettymuchbryce/easystarjs) | MIT | 0.4.4, published 2020-10-18 | Repo touched 2024-01-23; 36 open issues; [Snyk: "could be considered discontinued"](https://snyk.io/advisor/npm-package/easystarjs) | CJS only | Yes | Yes (`setAdditionalPointCost`/`setTileCost`) | Yes | Async/callback-only, no built-in diff-replan helper | mocha suite exists, no published coverage | 8,137 B / 2,950 B (+ its own `heap` dep, ~9,217 B / 4,838 B) |
| `ngraph.path` (+ `ngraph.grid`) | [anvaka/ngraph.path](https://github.com/anvaka/ngraph.path) | MIT | 1.6.1, published 2025-11-18 | 2026-01-03, actively maintained (solo-maintainer project); 18 open issues | Real dual ESM/CJS (`"type":"module"`, conditional `exports`) | **No** — generic graph engine; a rectangular grid must be hand-built as nodes/links | Yes, via a custom `distance()` function on links | Not native — must be hand-wired during graph construction | Caller-owned | `/test` dir, `npm test` script | 7,476 B / 2,384 B |
| `astar-typescript` | [digitsensitive/astar-typescript](https://github.com/digitsensitive/astar-typescript) | MIT | 1.2.7, last publish ~2022 | 2023-04-26, stale 3+ years, 8 open issues | CJS only, no `"exports"` | Yes (0/1 array) | Yes, via weighted-grid mode | Yes | None built-in | Tests exist, no recent activity | Not on Bundlephobia; small single-file source |
| `fast-astar` | [sbfkcel/fast-astar](https://github.com/sbfkcel/fast-astar) | MIT | 2.0.2, published 2026-02-19 | Same date — days old at research time; 0 open issues, 144 stars | ESM (`"type":"module"`), zero declared deps, **ships a WASM binary** for its fast mode | Yes (`setWalkAt`/`isWalkableAt`) | Not documented — only binary walkable/blocked surfaced in the README | Yes (`rightAngle` option) | Grid-mutation methods exist, no built-in incremental replanner | `npm test`/`test:full`/`test:wasm` scripts, coverage not published | Not yet on Bundlephobia; WASM asset needs Vite-specific handling (`vite-plugin-wasm` or `?url`) |
| `@evilkiwi/astar` *(license-disqualified, noted for completeness)* | [evilkiwi/astar](https://github.com/evilkiwi/astar) | **GPL-3.0** | Active, last push 2025-07-08 | Active | TS/ESM | Yes, incl. optional elevation | Yes | Yes | Not addressed | Unknown | Small |

### Assessment against the approval criteria

- **≥3 candidates investigated**: six were (five real, one license-disqualified for completeness) — satisfied.
- **Rejection documented with evidence**: `pathfinding`/`easystarjs` are npm-stale (2016/2020) with the exact feature Chronicle needs (general weighted terrain) either unmerged or awkwardly async; `astar-typescript` is stale 3+ years; `fast-astar` is days-old, single-maintainer, undocumented on weighted terrain, and its WASM asset adds Vite-specific build complexity for a feature that isn't proven needed; `ngraph.path` is the only genuinely active, properly-packaged option but solves the wrong-shaped problem — it's a general graph engine, and the grid-construction adapter it requires (build nodes/links from the tile grid, hand-wire diagonal adjacency, rebuild on obstacle changes) is comparable in size and complexity to a purpose-built grid A*, which fails the "adapter must be smaller than the custom implementation" test in the other direction; `@evilkiwi/astar` is disqualified outright on GPL-3.0 licensing for a non-GPL commercial-education product.
- **Custom smaller than the adapter alternatives need**: yes, specifically versus `ngraph.path` — a grid-native A* against a boolean/weighted grid (which the codebase already builds from `rectsOverlap`/land-mask primitives) is smaller than constructing and maintaining a parallel graph representation.
- **Unit tests included**: required, tracked in the master plan's testing-strategy section (`tests/unit/` coverage against synthetic grids plus one real map's data).
- **Owner sign-off**: **not yet given** — tracked as an open item in §8.

### Decision

Hand-rolled grid A* in `apps/web/src/engine/npc-pathfinding.js` remains the right call, **with one change from the prior version of this plan**: use **`tinyqueue`** ([mourner/tinyqueue](https://github.com/mourner/tinyqueue), ISC, v3.0.0 published 2024-07-06, zero dependencies, 845 B / 454 B gzip, `"type":"module"`, maintained by Mapbox's Vladimir Agafonkin) for the binary-heap/priority-queue component, rather than hand-writing one. A binary heap is itself a solved, tiny, well-tested problem with a essentially-zero-cost, actively-maintained implementation available — hand-writing it inside `npc-pathfinding.js` would be exactly the kind of avoidable reinvention this policy targets, even though the A* search logic wrapped around it remains justified custom code. `heap-js` (BSD-3-Clause, 26,045 B / 5,176 B gzip) was also investigated and rejected as unnecessarily heavy for a simple min-heap use case; `js-priority-queue` was rejected as ~10 years stale.

## 3. Sprite animation

### Established pattern

CSS `background-position` stepped by the `steps()` timing function against a sprite-sheet image is a long-established, well-documented technique, not a gap libraries exist to fill. The clearest canonical reference is CSS-Tricks' **["Clever Uses for Step Easing"](https://css-tricks.com/clever-uses-for-step-easing/)**, which describes exactly this mechanism and calls sprite animation `steps()`'s most popular use case. MDN documents the underlying `steps()` syntax. Independent write-ups (Treehouse, kirupa.com, simurai.com, W3Bits) converge on the identical `@keyframes background-position` + `steps(N)` pattern. Josh W. Comeau's "Sprites on the Web" documents a close `object-position`-on-`<img>` variant and confirms `background-position` is the traditional method.

### Libraries investigated

| Package | License | Maintenance | Approach | Verdict |
|---|---|---|---|---|
| `jsprite` | ISC (npm listing) / MIT (repo — inconsistent) | v1.6.12, Apr 2021, ~5 yrs stale | JS interval/config-driven, not pure CSS | Rejected — ~3.4 MB unpacked for a config wrapper around the same frame-index math the adapter already has to write |
| `Sprite` (antonjb/Sprite) | MIT | **Archived June 2021**, unmaintained | CSS `background-position`, rAF-driven with `setInterval` fallback | Rejected — unmaintained, and architecturally it's the exact "rAF driving background-position" duplication the master plan's animation section explicitly avoids |
| `sprite-js` (kastsen/sprite-js) | Unclear | Low activity, minimal docs | JS sprite sheet lib | Rejected — unproven, no evidence of real maintenance |
| Canvas-based libs (`spritejs`, `spritesheet-js`, PixiJS sprite plugins) | Various | Mixed | Canvas rendering | Rejected — wrong rendering model; Chronicle is DOM/CSS, adopting a canvas library here would mean a second render pipeline |

### Decision

**Option C — native CSS, no dependency.** None of the investigated libraries offer real functionality (frame remapping, sheet packing, event hooks) beyond what a ~15–20 line CSS-class-toggling adapter (`resolveAnimationClass()`, already designed in `CHARACTER-SPRITESHEET-STANDARD.md`) already covers, and the closest philosophical match is archived. Cite the CSS-Tricks article by name in the adapter's code comment as the pattern being followed.

## 4. Tiled JSON parsing

### Official specification status

No official machine-readable JSON Schema exists for the Tiled JSON map format. [`mapeditor/tiled#4096`](https://github.com/mapeditor/tiled/issues/4096) ("Create JSON Schema for Tiled json format") has been open since November 2024 with no PR attached. The sole authoritative source is the prose reference at [doc.mapeditor.org/en/stable/reference/json-map-format](https://doc.mapeditor.org/en/stable/reference/json-map-format/) (mirrored on the project's [GitHub wiki](https://github.com/mapeditor/tiled/wiki/JSON-Map-Format)), which documents `layers[].type === "objectgroup"`, its `objects[]` array (rectangle/point/polyline/polygon/ellipse/text), and each object's `properties[]` array (`name`/`type`/`value` tuples) — exactly the subset `TILED-RUNTIME-DATA-PLAN.md`'s `objectsForLayer()` reads.

### Packages investigated

| Package | License | Maintenance | Usable without a TS build? |
|---|---|---|---|
| `tiled-types` (Chnapy) | MIT | v1.3.0, Feb 2021 — 5+ yrs stale, targets Tiled 1.4 (current is 1.11/1.12) | Ambient `.d.ts`, usable via JSDoc `@type` in principle, but outdated relative to current Tiled output |
| `@kayahr/tiled` | MIT | Only ever published one release, `v0.0.1`, Jan 2024 | Ships `.schema.json` files usable via JSDoc `@type`, but a single experimental snapshot doesn't meet a "maintained" bar |
| `@workadventure/tiled-map-type-guard` | **AGPL-3.0** | Active, part of a larger monorepo | Ships Zod runtime validators, usable from JS, but AGPL licensing and a transitive Zod dependency are real constraints for a small adapter need |
| `tiled-parser` | — | ~8 years stale (v0.1.2) | N/A |
| `pixi-tiledmap`, `@excaliburjs/plugin-tiled` | Various | Actively maintained | Tightly coupled to PixiJS/Excalibur rendering pipelines — wrong fit, would drag in unrelated engine dependencies |

### Decision

**Option C — continue raw `JSON.parse`, no dependency.** Tiled's JSON is already valid, well-specified JSON; `JSON.parse()` parses it correctly and completely, so a parser library adds nothing. No official schema exists to adopt. Every third-party type package is either stale (`tiled-types`, 2021), an effectively-unreleased single snapshot (`@kayahr/tiled`), or license-constrained (`@workadventure/...`, AGPL-3.0) — none meets the "maintained" bar, and Chronicle has no TypeScript build to consume ambient `.d.ts` files regardless. `objectsForLayer()`'s existing design (a ~15-line adapter reading `objectgroup` layers, written directly against the official prose spec) is the correct, evidence-backed choice, not an oversight. Cite `doc.mapeditor.org` as the source in the adapter's code comment.

## 5. Asset-pipeline tooling

| Capability | Package | License | Maintenance | ESM | Size | Verdict |
|---|---|---|---|---|---|---|
| Glob-string matching (`isMatch(path, pattern)`) | **`picomatch`** | MIT | v4.0.5, active, zero runtime deps | Dual ESM/CJS | ~3–4 KB | **Adopt** — exact fit for testing a literal `import.meta.glob("...")` string against candidate asset paths |
| (rejected alt.) | `micromatch` | MIT | v4.0.8, active (wraps picomatch + braces) | Dual | Heavier | Only needed if brace-expansion (`{png,jpg}`) is ever required — not today |
| (rejected alt.) | `minimatch` | **BlueOak-1.0.0** | v10.2.5, active | Dual | Small | Technically fine, but the license isn't on the MIT/BSD/ISC/Apache-2.0 preferred list — flag for owner sign-off if ever preferred over picomatch |
| (wrong tool) | `fast-glob` / `tinyglobby` | MIT | Active | Yes | — | Filesystem-walking globbers (pattern→files), not literal-string matchers — wrong shape for testing extracted glob strings against candidate paths |
| CSV generation with escaping | **`csv-stringify`** (`csv-stringify/sync`) | MIT | v6.8.1, active, part of `adaltas/node-csv`, 5.5M weekly downloads | `"type":"module"`, dual ESM/CJS exports | Small, no deps | **Adopt** — proper RFC 4180 quoting for a simple array-of-objects report, no streaming ceremony needed |
| (rejected alt.) | `papaparse` | MIT | Active | UMD/CJS + ESM wrapper | Larger | Parsing-focused, overkill for simple report generation |
| (rejected alt.) | `fast-csv` | MIT | Active, slower cadence | CJS-first | — | Streaming API is unneeded complexity here |
| Image metadata (dimensions) | **Sharp `.metadata()`** (already approved) | Apache-2.0 | Already adopted | — | — | **Adopt — no separate package needed.** Sharp's bundled libvips decoders cover PNG/JPEG/GIF/WebP/SVG; this replaces all hand-rolled binary header parsing |
| File-type/MIME detection | `file-type` | MIT | v22.0.1, active (sindresorhus) | ESM-only, requires Node ≥22 | — | Low priority — this repo's file extensions are already reliable (curated/build-controlled assets, not user uploads); revisit only if the pipeline ever ingests untrusted external assets |
| Bundle analysis | `rollup-plugin-visualizer` (already approved) | MIT | v7.0.1, active, 577+ dependents | — | — | **Reconfirmed** — `vite-bundle-visualizer` is a documented thin CLI wrapper around the same tool, adds no new capability. Note: 7.x requires Node ≥22, verify against the project's Node baseline before upgrading |
| Texture-atlas / spritesheet packing (future) | `maxrects-packer` | MIT | v2.7.3, active, TS-authored, dual CJS/ESM, ~12.4k weekly downloads | Yes | — | Preferred, when this becomes a real need — leanest option, just the packing algorithm, pairs with the already-approved Sharp for compositing |
| (deprioritized alt.) | `free-tex-packer-core` | MIT | v0.3.8, last release ~9 months ago | — | — | Wraps the same pinned `maxrects-packer` version but adds `jimp`/`tinify`/`mustache` — heavier dependency surface for the same core algorithm |
| (deprioritized alt.) | `spritesmith` | MIT | v3.5.1, ~132k weekly downloads (most adopted), older Node-Gyp-era toolchain | — | — | Most battle-tested, least actively evolved |
| Priority queue (for the pathfinding decision in §2) | **`tinyqueue`** | ISC | v3.0.0, active (Vladimir Agafonkin/Mapbox) | `"type":"module"` | 845 B / 454 B gzip | **Adopt** |
| (rejected alt.) | `heap-js` | BSD-3-Clause | Active | Dual | 26,045 B / 5,176 B gzip | Heavier than needed; keep for later only if richer heap operations (replace/clone) become necessary |
| (rejected alt.) | `js-priority-queue` | — | Last released ~10 years ago | — | — | Stale, avoid |
| Recursive directory listing | **`fs.readdirSync(dir, {recursive: true})`** (Node ≥20.1, built-in) | — | Node core | N/A | Zero | **Adopt** — zero-dependency replacement for hand-rolled `walkFiles()`. Caveats: does not follow symlinks; combining `recursive: true` with `withFileTypes: true` had bugs in early 20.x ([nodejs/node#48640](https://github.com/nodejs/node/issues/48640), [#51773](https://github.com/nodejs/node/issues/51773)) — verify the target Node version, or use `recursive: true` alone plus a `path.extname()` filter pass |
| Content hashing | Node `crypto.createHash("sha256")` (built-in) | — | Node core | N/A | Zero | **Already correct** — no change; `sha256File()` in `scripts/assets/lib/file-stats.js` already uses this |

## 6. Required decision table

One row per planned capability named by the owner, cross-referencing the fuller evaluation in §2–§5 above.

| Planned capability | Existing solution evaluated | Reuse decision | Chronicle-specific code still needed | Why |
|---|---|---|---|---|
| Asset inventory (enumerate/report on files under `apps/web/src/assets/`) | Node `fs.readdirSync(recursive:true)` (built-in); `fast-glob`/`tinyglobby` (rejected — wrong shape, see below) | Adopt Node built-in | Yes — the reference-scanning logic (which files are actually imported) is Chronicle-specific and stays hand-written | The traversal itself is a solved built-in problem; only Chronicle's own "is this file referenced" analysis is genuinely project-specific |
| Image metadata (width/height/format) | Sharp `.metadata()` (already approved dependency) | Adopt | No — Sharp covers PNG/JPEG/GIF/WebP/SVG directly | Hand-rolled binary header parsers (§7 below) duplicate exactly what an already-approved dependency does |
| Image optimization (resize/recompress) | Sharp (approved); `oxipng` (approved as external CLI, not npm — every npm wrapper is stale) | Adopt (both, per existing `ASSET-PIPELINE-PLAN.md`) | Yes — which files get which treatment (nearest-neighbor for pixel art vs. Lanczos for scans) is a Chronicle content decision | Sharp/oxipng do the compression; Chronicle decides what to compress and how |
| Spritesheet compositing (combine existing per-state PNGs into strips) | Sharp `.composite()` (approved) | Adopt | Yes — the frame-order/strip-layout convention is Chronicle-specific | No generic "combine these N images into a strip in this order" library is warranted for Sharp's own compositing primitive |
| Sprite frame animation (stepping through a sheet) | CSS `background-position` + `steps()` (established pattern, §3); `jsprite`/`Sprite`/`sprite-js`/canvas libs (all rejected, §3) | Option C — native CSS, no dependency | Yes — the small `resolveAnimationClass()`/`walkCycleProfile()` adapter | No maintained library adds real value over a ~15–20 line CSS-class adapter; closest match is archived |
| Tiled object-layer reading | Official Tiled JSON spec (no schema package exists, §4); `tiled-types`/`@kayahr/tiled`/`@workadventure/...` (all rejected, §4) | Option C — raw `JSON.parse` + thin adapter | Yes — `objectsForLayer()` | `JSON.parse` already fully parses the format; no maintained schema/parser package clears the bar |
| Collision-data conversion (Tiled objects → runtime collision) | N/A — Tiled has no built-in "convert to arbitrary engine collision" step; this is inherently an integration | No package applies | Yes — entirely Chronicle-specific, and explicitly **not** wired to runtime collision during the pilot (hand-coded arrays stay authoritative) | This is integration code by definition, not a reimplemented algorithm |
| NPC pathfinding | 6 candidates investigated, §2 | Hand-rolled A*, **pending owner sign-off** (§8) | Yes — `npc-pathfinding.js`, using `tinyqueue` for the heap | No actively-maintained library both fits the grid shape and clears the license/maintenance/size bar — see §2's evidence |
| Priority queue (used inside the A* implementation) | `tinyqueue` (adopt), `heap-js` (rejected — heavier), `js-priority-queue` (rejected — stale) | Adopt `tinyqueue` | No | A binary heap is a solved, tiny problem with a well-maintained near-zero-cost implementation available |
| Glob matching (test a glob string against a candidate path) | `picomatch` (adopt); `micromatch`/`minimatch` (deprioritized — heavier / non-standard license); `fast-glob`/`tinyglobby` (rejected — wrong shape) | Adopt `picomatch` | No | Exact `.isMatch(path, pattern)` fit for testing extracted `import.meta.glob(...)` literals |
| Content hashing | Node `crypto.createHash("sha256")` (built-in, already in use) | Already correct | No | Node's standard library is sufficient; no change needed |
| CSV report generation | `csv-stringify/sync` (adopt); `papaparse`/`fast-csv` (rejected — overkill/streaming-oriented) | Adopt `csv-stringify` | No | Proper RFC 4180 escaping for free, replaces hand-rolled `toCsv`/`csvCell` |
| Bundle analysis | `rollup-plugin-visualizer` (already approved); `vite-bundle-visualizer` (confirmed to be a thin wrapper around the same tool) | Reconfirm existing choice | No | No new capability from the alternative; stick with the already-approved tool |
| Texture-atlas/spritesheet packing (future, not yet needed) | `maxrects-packer` (preferred); `free-tex-packer-core` (deprioritized — heavier dep surface); `spritesmith` (deprioritized — older toolchain) | Defer — name `maxrects-packer` as the pick when the need arises | Not yet — no atlas need exists at current sprite/tile count | Real bin-packing only earns its keep once sprite/tile count grows; premature to adopt now |

## 7. Existing hand-rolled code found during this review

While reading the repository for this review, the already-coded (uncommitted) `scripts/assets/` tree was found to violate this policy in three concrete places:

- `scripts/assets/lib/file-stats.js` hand-rolls `readPngDimensions`/`readJpegDimensions`/`readGifDimensions` (binary header parsers) and a regex-based `readSvgDimensions` — all replaceable by Sharp's `.metadata()` (§5), which is already an approved dependency and covers every one of these formats.
- `scripts/assets/manifest.js` hand-rolls `toCsv`/`csvCell` (CSV escaping) — replaceable by `csv-stringify/sync` (§5).
- `scripts/assets/audit.js` hand-rolls `globToRegExp()` (a glob-string-to-RegExp converter, used to test extracted `import.meta.glob("...")` literals against candidate asset paths) — replaceable by `picomatch.isMatch()` (§5).
- `scripts/assets/lib/file-stats.js`'s `walkFiles()` (recursive directory listing) is replaceable by `fs.readdirSync(dir, {recursive: true})` (§5), though this one is lower priority since it's already a thin, correct wrapper around a built-in, not a reimplementation of an external algorithm.

Per explicit owner direction during this planning pass, **these are flagged here, not fixed** — fixing them is recommended as the first follow-up implementation task (§9).

## 8. Unresolved decisions requiring owner approval

- **Hand-rolled A* for NPC pathfinding** (§2): the evidence bar is now met, but the policy requires explicit owner sign-off before `apps/web/src/engine/npc-pathfinding.js` is implemented. Not yet given.
- **`tinyqueue` as an accepted micro-dependency** (§2, §5): recommended, not yet confirmed.
- **Whether to fix the `scripts/assets/` violations** (§7) as a near-term follow-up task, and when — recommended as the first implementation task (§9), not yet scheduled.
- **`minimatch`'s BlueOak-1.0.0 license** (§5): only relevant if `picomatch` turns out to be insufficient and brace-expansion via `minimatch` is later wanted — not a live decision today, `picomatch` is the recommendation.

## 9. Final recommendation — first implementation task

**Fix the three reuse violations already sitting in the uncommitted `scripts/assets/` code** (§7): replace `lib/file-stats.js`'s hand-rolled PNG/JPEG/GIF/SVG parsers with Sharp's `.metadata()`, `manifest.js`'s hand-rolled `toCsv`/`csvCell` with `csv-stringify/sync`, and `audit.js`'s hand-rolled `globToRegExp` with `picomatch.isMatch()`.

This is the task that best satisfies every one of the owner's stated goals for a first task:

- **Maximizes reuse** — deletes roughly 150 lines of hand-rolled binary-parsing/glob/CSV logic in favor of three small, well-maintained, permissively-licensed packages.
- **Contains the least custom generic logic** — what remains is Chronicle-specific integration only (which files to scan, which report sections to emit), never a reimplemented generic algorithm.
- **Has no gameplay risk** — `scripts/assets/` is Node-side dev tooling, never shipped to a player's browser.
- **Can be completely rolled back** — a single script tree, revertible with one `git` operation.
- **Validates the adapter-first approach** — proves the "thin adapter over a library" discipline on code that already exists today, at zero stakes, before the same discipline is applied to the higher-stakes pathfinding/animation/Tiled workstreams.

This is a separate, later implementation task — no code was changed to produce this planning document.
