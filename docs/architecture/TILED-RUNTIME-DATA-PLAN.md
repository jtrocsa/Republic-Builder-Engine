# Tiled Runtime Data Plan

**Status:** planning document, not yet implemented. Part of [`FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md`](FOCUSED-GAME-SYSTEM-MODERNIZATION-PLAN.md)'s Workstream 3. Verified against the repo as of 2026-07-23.

**Reuse policy:** [`docs/architecture/OPEN-SOURCE-REUSE-DECISIONS.md`](OPEN-SOURCE-REUSE-DECISIONS.md) is binding for the reuse-vs-build decision below — see its §4 for the full research (official-schema status, third-party type/parser packages investigated and rejected).

## Current state (verified)

Tiled `.tmj` files are used **only for visual tile-layer art today** — collision, spawn points, patrol paths, and every other piece of gameplay-relevant map data is hand-coded separately in `apps/web/src/main.js` and kept in sync with the Tiled art by convention, not by code. `apps/web/src/engine/tiled-map-loader.js` (182 lines) exports `createTilesetImageResolver`, `tilesForFrame`, and `renderTiledMap`; every one of them only reads layers where `layer.type === "tilelayer"` (`tilesForFrame`'s guard: `if (layer.type !== "tilelayer" || !layer.visible) continue;`). **There is no code path anywhere in this repo that reads a Tiled object layer.** If a `.tmj` file had one today, it would be silently ignored.

Per `docs/architecture/ARCHITECTURE-QUICKREF.md`, Tiled is "no longer fully deferred" for this narrow tile-art-rendering pattern (4 live maps use it today: Riverbend, Caribbean, Archive Room, Common Cause), but that is explicitly **not** license for a bigger Tiled-authoring pipeline or for collision to move off hand-coded data — the current, binding stance is "collision stays hand-coded." This plan is designed to fit inside that stance: it adds Tiled object-layer data as a **parallel, validated data source**, not as a runtime replacement for hand-coded collision, in this pass.

## Pilot map: Riverbend (`apps/web/src/content/maps/riverbend-field.tmj`, case-004)

Chosen because it is the simplest of the three field maps to validate against, and because its hand-coded counterparts are all small and self-contained:

- **Map facts (verified from the file):** 40×24 tiles, 48×48px tile size, orthogonal orientation, exactly 2 layers today — `ground` (id 1) and `structures` (id 2), both `type: "tilelayer"`. **Zero object layers exist**, and `nextobjectid: 1` confirms no Tiled object has ever been placed in this file.
- **Corresponding hand-coded arrays/functions in `main.js`:**
  - `UNIT2_FIELD_BLOCKS` (`main.js:844-851`) — 6 collision rectangles (`meetinghouse`, `dwelling one`, `dwelling two`, `well`, `tobacco rows`, `wharf crates`).
  - `isRiverbendLand()` (`main.js:958-965`) — a rectangular clearing bound (`x: 2.2–37.8`, `y: 2.2–21.8`) with a river cutout (`x: 29.5–33.5`) and one bridge crossing (`y: 11.0–13.2`).
  - `UNIT2_FIELD_NPCS` (`main.js:852-914`) — 6 NPCs with spawn coordinates.
  - `UNIT2_FIELD_NPC_PATROLS` (`main.js:915-952`) — 6 NPCs × 4-waypoint loops.
  - `UNIT2_FIELD_SOURCE_POINTS` (`main.js:953-956`) — 3 interaction points (`riverbend-charter`, `riverbend-letter`, `riverbend-ledger`).
  - `FIELD_MAPS["unit-02"]` (`main.js:1117-1128`) — `spawn: {x:20.0, y:12.0}`, `recall: {x:17.0, y:12.4}`.

## Object layers designed

| Layer name | Object type | Properties | Riverbend pilot content |
|---|---|---|---|
| `collision` | rectangle × 6 | `kind` (string) | Mirrors `UNIT2_FIELD_BLOCKS` 1:1, carrying its existing `kind` values (`"meetinghouse"`, `"dwelling one"`, `"dwelling two"`, `"well"`, `"tobacco rows"`, `"wharf crates"`) |
| `walkable` | rectangle × 3 | `role`: `"walkable-bounds"` \| `"obstacle-water"` \| `"walkable-bridge"` | Outer clearing rect (2.2–37.8, 2.2–21.8), river rect (29.5–33.5, full height), bridge cutout rect (29.5–33.5, 11.0–13.2) — reproduces `isRiverbendLand()`'s exact `!inRiver || onBridge` logic as data instead of code |
| `player-spawn` | point × 2 | `role`: `"spawn"` \| `"recall"` | `(20.0, 12.0)` and `(17.0, 12.4)`, matching `FIELD_MAPS["unit-02"]` |
| `npc-spawn` | point × 6 | `npcId` (string) | One per `UNIT2_FIELD_NPCS` entry (`settlement-minister`, `indentured-servant`, `settlement-burgess`, `settlement-goodwife`, `river-fisher`, `wharf-clerk`) |
| `npc-patrol-path` | polyline × 6 | `npcId` | Mirrors `UNIT2_FIELD_NPC_PATROLS`'s six 4-waypoint arrays exactly — Tiled polylines are already an ordered point list, so this is a direct 1:1 shape match with zero translation logic needed |
| `interaction-triggers` | point × 3 | `interactionId`, optional `reach` | Mirrors `UNIT2_FIELD_SOURCE_POINTS`'s 3 entries (`riverbend-charter` at 12.2,6.4; `riverbend-letter` at 13.0,16.2; `riverbend-ledger` at 35.4,11.9) |
| `camera-bounds` | rectangle × 1 | `role: "camera-bounds"` | Full map rect (0,0 to 40,24) — a no-op migration for this map, since the camera already bounds to the full map today; still authored so the schema is exercised end-to-end |

Not authored for the Riverbend pilot — schema decided now for cross-map consistency, intentionally left unpopulated because nothing in Riverbend's current design needs them (following this repo's own precedent of deciding a field's shape ahead of a feature that uses it, e.g. `unit.archiveChallenges[]`, which existed as a schema field before any unit populated it):

| Layer name | Object type | Properties | Purpose |
|---|---|---|---|
| `npc-patrol-region` | rectangle/polygon | `npcId`, `role: "patrol-region"` | Feeds Workstream 2's bounded-wander mode — no NPC in Riverbend currently wanders |
| `dialogue-triggers` | point/rectangle | `dialogueId`, optional `once` | A genuinely new zone-entry capability, not a migration of anything existing |
| `doors-exits` | rectangle/point | `targetScreen`, `targetSpawn` | Generalizes the Archive Room's door pattern — Riverbend has no door today |
| `quest-triggers` | point/rectangle | `questId`, `questType` | Generalizes the existing `investigationMode`/`investigationQuestId` pointer pattern already used in the unit campaign content files |
| `terrain-cost` | rectangle/polygon | `cost` (number) | Feeds Workstream 2's A* pathfinding as a per-cell weight; defaults to uniform cost 1 everywhere until a map actually needs variable terrain (e.g. mud, deep water passable-but-slow) |

## `tiled-map-loader.js` extension — additive only

New exported function, alongside the existing three exports, that reads object-layer data without touching any existing tile-rendering code path:

```js
// apps/web/src/engine/tiled-map-loader.js — new export.
// Does not touch tilesForFrame()'s existing
// `if (layer.type !== "tilelayer" ...) continue` guard — reads the same tmj.layers
// array from a different angle, for a different layer type.
export function objectsForLayer(tmj, layerName) {
  const layer = tmj.layers.find((l) => l.type === "objectgroup" && l.name === layerName);
  if (!layer) return [];
  return layer.objects.map((obj) => ({
    ...obj,
    properties: Object.fromEntries((obj.properties || []).map((p) => [p.name, p.value])),
  }));
}
```

This is pure and DOM-free — unit-testable exactly like the existing `tilesForFrame()` (no canvas or real browser environment needed), following the same "small, additive, single-purpose export" pattern the module already uses. `renderTiledMap()` itself is untouched; nothing about the pilot changes how the map's *visuals* render.

## Why raw `JSON.parse`, not a library

Per the project owner's reuse-first policy ([`OPEN-SOURCE-REUSE-DECISIONS.md`](OPEN-SOURCE-REUSE-DECISIONS.md)), this design was checked against real alternatives rather than assumed:

- **No official JSON Schema exists for the Tiled format.** [`mapeditor/tiled#4096`](https://github.com/mapeditor/tiled/issues/4096) ("Create JSON Schema for Tiled json format") has been open since November 2024 with no PR attached. The only authoritative source is the prose reference at [doc.mapeditor.org/en/stable/reference/json-map-format](https://doc.mapeditor.org/en/stable/reference/json-map-format/), which `objectsForLayer()` above is written directly against.
- **Third-party type definitions were investigated and rejected**: `tiled-types` (MIT, but stale since Feb 2021 and targets an old Tiled version), `@kayahr/tiled` (MIT, but only ever published one `0.0.1` release in Jan 2024 — a single experimental snapshot, not a maintained package), `@workadventure/tiled-map-type-guard` (ships real Zod validators, but AGPL-3.0-licensed and pulls in Zod transitively for a need this small).
- **Third-party parser packages were investigated and rejected**: `tiled-parser` (~8 years stale), `pixi-tiledmap`/`@excaliburjs/plugin-tiled` (actively maintained, but tightly coupled to PixiJS/Excalibur rendering pipelines — adopting either would drag in an unrelated rendering engine as a dependency for a project that renders its own tile art via a hand-rolled Canvas2D compositor).
- **`JSON.parse()` (a browser/Node built-in) already fully and correctly parses Tiled's JSON output** — there is nothing for a parser library to add. This makes Option C (continue raw `JSON.parse`, thin adapter, no dependency) the evidence-backed choice, not an unexamined default: `objectsForLayer()`'s ~15 lines are Chronicle-specific integration code (which layer, which properties matter to this game), not a reimplementation of Tiled's own format.

## Fallback and validation strategy

**Hand-coded collision stays authoritative at runtime throughout this pilot.** `main.js` keeps reading `UNIT2_FIELD_BLOCKS` and calling `isRiverbendLand()` exactly as it does today — this plan does not wire `objectsForLayer()`'s output into any runtime collision or NPC-patrol code path. This matches the `map-implementer` subagent's existing stance that Tiled-derived art generators are kept in sync with hand-coded collision data manually, not the other way around (the same convention already documented at `main.js:967-971` for the Common Cause map).

Two safety nets validate the *data*, without ever making it load-bearing:

1. **A new Vitest parity test, `tests/unit/riverbend-collision-parity.test.js`.** Loads `riverbend-field.tmj`, calls `objectsForLayer(tmj, "collision")`, converts each object's Tiled pixel coordinates (dividing by `tmj.tilewidth`, 48) into the same world-unit coordinate space `UNIT2_FIELD_BLOCKS` already uses, and asserts the two rectangle sets match. This fails loudly the moment either the `.tmj` file or the hand-coded array is edited without the other during the transition period — the exact kind of drift risk this workstream is designed to surface early rather than let compound silently.
2. **A dev-only visual overlay page, `apps/web/tiled-collision-preview.html`.** Follows the same non-build-entry preview-page pattern this repo already uses (`tiled-preview.html`, `quest-type-preview.html`, `mini-games-preview.html` — none of these are wired into the production build or `npm run dev`'s main entry). Draws Tiled-derived rectangles (one color) over hand-coded rectangles (a contrasting outline) on top of the rendered Riverbend map, for quick human visual confirmation that the two data sources actually line up with the painted art, not just with each other numerically.

## Scope discipline

Only `riverbend-field.tmj` is touched by this pilot. The other four maps already wired into `tiled-map-loader.js` — `caribbean-field.tmj`, `archive-room.tmj`, `hallway.tmj`, `common-cause-field.tmj` — are not converted, and `sandy-island-demo.tmj` (already orphaned, not referenced by `main.js`) is untouched. If the pilot succeeds — the parity test passes and the visual overlay confirms alignment — extending the same object-layer schema to additional maps is a natural follow-up, but is explicitly **not** scheduled as part of this plan; each additional map is its own future decision, not an automatic next step.

## What this workstream does not do

It does not make `main.js` read collision from Tiled at runtime. It does not remove or deprecate any hand-coded array. It does not touch NPC movement math (Workstream 2 is a separate, later workstream that would eventually *consume* this data, once trust is established via the parity test). It does not convert any map besides Riverbend. It does not add a general-purpose Tiled-authoring pipeline, a `QuestEngine` renderer registry, or any of the other explicitly-deferred `WorldComposition`-era systems named in `docs/architecture/ARCHITECTURE-QUICKREF.md`.
