# Unit Testing

Status: Phase 2 of the near-term architecture sequence (`docs/architecture/ARCHITECTURE-QUICKREF.md` §6) — complete. This document explains what exists, why, and what deliberately doesn't exist yet.

## Why Vitest

Vitest and Zod are the only two dependencies the architecture review (`docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`) approved as adopt-now, no-POC-required. Vitest was chosen specifically (over Jest or node's built-in test runner) because:

- It reuses the Vite pipeline already configured for this project (`vite.config.js`), so it transforms `apps/web/src/main.js`'s ESM syntax, its `new URL(..., import.meta.url)` asset references, and its `import "./styles/global.css"` side-effect import the same way the real app does — no separate transform/mock config to maintain.
- It has a built-in jsdom integration, which this repo needs: `main.js` is browser-only code that reads `document`/`window`/`localStorage` at module scope.

Playwright remains deliberately deferred (per the review) — this phase is unit tests for pure/near-pure logic, not end-to-end browser automation.

## How to run tests

```
npm run test         # vitest run — single pass, CI-compatible, non-watch
npm run test:watch   # vitest — watch mode for local development
```

Config lives in `vitest.config.js` at the repo root (deliberately **not** merged into `vite.config.js`, per CLAUDE.md's "avoid modifying vite.config.js unless the task genuinely requires it"). It sets `environment: "jsdom"` (needed for `main.js`, see below) and scopes test discovery to `tests/unit/**/*.test.js`.

Test files import `describe`/`it`/`expect`/`beforeEach` explicitly from `"vitest"` rather than relying on Vitest's injected globals mode. This was a deliberate choice: `eslint.config.js` has no `describe`/`it`/`expect` globals declared, and enabling Vitest's global-injection mode would have required editing the shared ESLint config as a side effect of this task. Explicit imports keep `npm run lint` passing with zero config changes.

## What's covered, and why

All tests live under `tests/unit/`. 179 tests across 15 files (as of Phase 9, 2026-07-11) — deliberately targeted at pure logic rather than comprehensive DOM coverage; see "What remains untested" below.

### `tests/unit/chronicle-progress-store.test.js`

Tests `readProgress`/`saveProgress`/`resetProgress`/`hasSavedProgress` from `apps/web/src/engine/chronicle-progress-store.js` — already fully exported, no source changes needed. This is the save/progress merge logic the task prioritized: `readProgress()`'s defensive deep-merge-over-defaults is exactly the kind of logic that silently breaks in ways that are easy to miss by eye (e.g. a corrupted or legacy-shaped save silently reverting a field to its default instead of crashing). Covers: normal merge of a partial saved shape, invalid JSON in `localStorage` (the try/catch fallback), and a corrupted non-array `unlocked`/`completedCases` field being discarded rather than trusted — that last case is a direct regression guard: a real corrupted save could otherwise silently lock a player out of every case.

### `tests/unit/main-collision.test.js`

Tests `ellipse`, `isCaribbeanLand`, `footBoxFor`, and `rectsOverlap` — newly `export`ed from `apps/web/src/main.js`, otherwise untouched. These are the terrain/collision primitives CLAUDE.md's "Gameplay invariants (regression-prone areas)" section calls out by name, and the repository audit's collision system is the one with the longest history of hotfix milestones (3.4.1–3.4.15). All four functions are genuinely pure — no reliance on module-level `progress`/DOM state — which is exactly the "pure logic worth testing in place" the task asked for. Covers boundary behavior specifically: a point exactly on an ellipse's edge (inclusive `<=`), and two foot-boxes that only touch at an edge without overlapping (the strict `<`/`>` in `rectsOverlap` means adjacent-but-not-colliding boxes must not register as blocked — a real, easy-to-invert boundary condition).

### `tests/unit/main-badges-quests.test.js`

Tests `badgeRecordsForUnit` and `unlockNext` — also newly `export`ed from `main.js` — plus the newly-`export`ed `progress` binding, mutated directly from the test (ES module live bindings allow mutating an imported object's properties, just not reassigning the binding itself). These aren't strictly pure (they read/write module-level `progress`), but they're the badge/reward and quest-unlock calculations the task explicitly prioritized, and `main.js`'s existing "export functions in place, don't extract" pattern extends naturally to them. Covers: the OR condition in `case-001`'s badge-earned rule (completion OR evidence count ≥ 3 — pinned so a future refactor to AND doesn't silently relock the badge), idempotency of calling `unlockNext` twice for the same case, and calling `unlockNext` on the last case in a unit (no "next" case to push — the `if (next && ...)` guard).

## The `main.js` import-safety guard

Importing `main.js` at all (for any of the exports above) previously triggered full application boot as a module-level side effect: two `setInterval` NPC-patrol timers, ~15 `app.addEventListener`/`window.addEventListener` registrations, and a bare `render()` call that does a full `app.innerHTML` replace — all executing merely from `import`, with no explicit `init()` to opt out of. In a test environment with no `<div id="app">` in the DOM, `app` is `null` and several of these statements (`app.addEventListener(...)`, `app.innerHTML = ...`) would throw immediately on import.

The fix (`apps/web/src/main.js`, three sites) gates every one of those boot-time side effects on the existing `const app = document.querySelector("#app")` already being truthy:

- `if (app) setInterval(updateFieldNpcs, 80);` (was unconditional)
- `if (app) setInterval(updateInstituteNpcs, 120);` (was unconditional)
- The entire block of `app.addEventListener(...)`/`window.addEventListener(...)` registrations plus the trailing `render();` call is now wrapped in a single `if (app) { ... }`.

In the real app, `apps/web/index.html` always contains `<div id="app"></div>`, so `app` is always truthy there and this is a no-op — verified by starting `npm run dev` and confirming Vite serves and transforms `main.js` without error, and that `index.html`'s shell is unchanged. In a Vitest test file that imports `main.js` without first creating a `#app` element, `app` is `null`, so none of the guarded code runs: no leaked timers, no listeners registered against a nonexistent element, no premature `render()`.

This was the smallest change that made `main.js` import-safe. No functions were physically moved to make this work — per `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §7 item 5, the instruction was to export functions in place, not extract them, and that's what happened here: six `export` keywords added to existing function/`let` declarations (`ellipse`, `isCaribbeanLand`, `rectsOverlap`, `footBoxFor`, `badgeRecordsForUnit`, `unlockNext`, `progress`), plus the boot guard above.

## What remains intentionally untested

- **`isFieldBlocked`, `updateFieldPlayer`, the rAF movement loops, NPC patrol logic.** These compose the pure primitives above with module-level state (`progress.activeCaseId` via `activeFieldMap()`, live DOM nodes via `document.getElementById`) and are stateful/DOM-coupled rather than pure. The task's own instructions were explicit not to force tests around stateful DOM code merely to raise a test count — the primitives they're built from (`footBoxFor`, `rectsOverlap`, `isCaribbeanLand`) are covered instead.
- **Author Mode.** Already documented as non-functional (CLAUDE.md) — no behavior exists yet worth pinning with a test.
- **Content/screen-builder functions** (`fieldScreen()`, `archiveScreen()`, etc.). These return HTML template-literal strings for the app's own DOM-replace rendering; asserting on generated markup is brittle-by-construction and isn't the "pure logic" this phase targeted.
- **The procedural Web Audio engine.** No pure calculation to test — it's Web Audio API calls.

## Why physical extraction was deferred

`ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §7 item 5 and §9's risk register are explicit: extracting movement/collision/camera/NPC-patrol code out of `main.js` has no near-term payoff independent of a Phaser adoption that isn't scheduled, and the _only_ thing actually blocking unit testing was import-safety, not physical location. Adding `export` in place and a narrow `if (app)` boot guard solved the real problem (main.js wasn't testable at all) without the code-motion risk of a physical extraction — same reasoning CLAUDE.md's "Do not physically extract" instruction already states for this codebase.

## Next phase

Per `ARCHITECTURE-QUICKREF.md` §6, the next approved phase is Zod content-schema validation (`docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §11 step 3) — validating the existing live content shapes (`unit-01-campaign.js`, `unit-02-campaign.js`) in place and making `scripts/validate-content.js` real. Not started as part of this phase.
