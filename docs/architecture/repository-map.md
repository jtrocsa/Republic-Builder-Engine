# Repository Map

> Repaired by the Prompt 5 documentation-housekeeping pass. This file was previously a verbatim placeholder stub ("Recovered placeholder file restored...") with no real content. The tree below is drawn directly from `docs/architecture/CURRENT-REPOSITORY-AUDIT.md` (§2), which was verified against actual source, not against prior documentation claims — treat that document as authoritative if this map ever drifts out of date, and re-run a repository scan rather than trusting either document blindly.

For the short version of "what's current, what's next," read `docs/architecture/ARCHITECTURE-QUICKREF.md` first.

## Live vs. dead vs. dormant

| Status      | Meaning                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **LIVE**    | Imported (directly or transitively) by `apps/web/index.html` → `apps/web/src/main.js`, and actually exercised by normal gameplay. |
| **DEAD**    | Present on disk, not imported by anything reachable from `index.html`. Confirmed via a full import-graph trace.                   |
| **DORMANT** | Not imported by the app, but represents a deliberately-parked future format (e.g. the JSON content pipeline), not abandoned code. |

## Annotated tree

```
Republic-Builder-Engine/
├── apps/web/                          [LIVE — the actual running app]
│   ├── index.html                     minimal shell: <div id="app"> + <script src="/src/main.js">
│   ├── src/
│   │   ├── main.js                    ~2,930 lines — LIVE, owns nearly everything (routing, movement,
│   │   │                              collision, dialogue, audio, mini-games, Author Mode, HTML rendering)
│   │   ├── styles/global.css          LIVE — one screen-block per screen
│   │   ├── content/
│   │   │   ├── unit-01-campaign.js    LIVE — real Unit 1 content
│   │   │   ├── unit-02-campaign.js    LIVE — placeholder Unit 2 content ("Riverbend Settlement"),
│   │   │   │                          reachable in the running app but not historically accurate yet
│   │   │   ├── chronicle-opening.defaults.js   LIVE — imported by main.js
│   │   │   ├── chronicle-identity.defaults.js  LIVE — imported by main.js
│   │   │   ├── chronicle-case-001.js  DEAD — orphaned, a second/incompatible schema for the same 3 sources
│   │   │   └── cases/case-atlantic-crossroads.preview.js   DEAD — only used by the orphaned features/ island
│   │   ├── engine/
│   │   │   ├── chronicle-progress-store.js     LIVE — the one real save/load layer
│   │   │   ├── content/author-content-store.js DEAD — generic, unused
│   │   │   └── player/player-profile-store.js  DEAD — separate unused profile store
│   │   ├── features/                  DEAD — a complete, orphaned second implementation of the
│   │   │   │                          onboarding→field→case-player loop (confirmed unreachable from index.html)
│   │   │   ├── chronicle-institute/chronicle-institute.js   own Author Mode implementation #2
│   │   │   ├── chronicle-identity/chronicle-identity.js     own Author Mode implementation #3, own tile map
│   │   │   ├── case-player/atlantic-crossroads-preview.js   own case-player loop
│   │   │   └── {assessment,codex,character-creation}/       .gitkeep only, never built — don't
│   │   │                                                     reuse this pattern for new future folders
│   │   └── assets/                    LIVE — real sprites/maps/documents (62 files), referenced via
│   │                                  `new URL(..., import.meta.url)`
│   └── dist/                          build output (gitignored)
├── api/                                LIVE ON DISK, WIRED TO NOTHING — a real serverless AI-grading
│   ├── evaluate.js                    handler (Claude-Haiku-backed), plus real APUSH HIPP/SAQ/LEQ/DBQ
│   └── _lib/rubrics.js                rubrics. Nothing in main.js calls it. It's why @anthropic-ai/sdk
│                                       is a production dependency despite the frontend being client-only.
├── content/                            DORMANT — main.js never reads this tree
│   ├── campaigns/chronicle/            campaign.json/unit.json/case.json + activities/assessments;
│   │                                   every status field self-declares placeholder/vertical-slice status
│   └── library/                        primary-sources/npcs/locations *.template.json skeletons
├── assets/                             PLACEHOLDER ONLY — `.gitkeep` files, no real assets live here
├── data/schemas/                       one example JSON instance, not yet a real JSON Schema
├── data/sample-saves/                  one sample save-shape JSON
├── docs/                                mixed real docs + a small number of former placeholder stubs
│                                       (see `docs/architecture/CURRENT-REPOSITORY-AUDIT.md` §14 for the
│                                       accounting; the stubs found there have since been repaired)
├── scripts/validate-content.js         stub — logs "not implemented yet"; real implementation is
│                                       documented future work, not current behavior
├── tests/                               empty aside from `.gitkeep` — no tests exist yet
├── package.json                        single package, no workspace tooling
├── vite.config.js                      root: "apps/web"
└── eslint.config.js                    real flat config, working (`npm run lint`)
```

## What actually runs

`apps/web/index.html` mounts `apps/web/src/main.js` into a single `#app` div. `main.js` imports only `./styles/global.css`, the two campaign content modules, the two `chronicle-*.defaults.js` content modules, and `chronicle-progress-store.js`'s three exports. Everything else described above (`features/`, `chronicle-case-001.js`, the dormant JSON `content/` tree, `api/`) is real code sitting alongside the running app, not part of it — don't assume any of it is reachable without checking `main.js`'s actual `import` statements first.

## Where things are headed

The canonical-homes table this file previously implied (engine/features/content split cleanly enforced, one content schema, a wired-up grading backend) is the **target state**, not today's state. See `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md` for the full future folder structure and `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` for what's actually approved to build near-term. Do not pre-create the future folders that proposal describes (`platform-core/`, `world-composition/`, `quest-engine/`, `runtime/`, `packs/`, etc.) — see `CLAUDE.md`'s "Current architecture direction" section.
