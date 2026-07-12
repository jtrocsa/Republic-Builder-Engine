# Republic Builder Engine — Foundation v0.1

This is the permanent, content-first repository foundation for **Republic Builder**, a reusable historical RPG engine.

The first campaign is **Chronicle**, an AP U.S. History experience. The first playable vertical slice is:

- **Unit 1 — Period 1: 1491–1607**
- **Case 1.01 — The Atlantic Crossroads**

## What this repository is for

- Stable folder conventions that do not get improvised from feature to feature.
- A clean separation between reusable game systems and historical campaign content.
- A single canonical location for every primary source, image, audio file, map, NPC record, and assessment template.
- Case folders that reference shared content instead of duplicating it.

## Start here

1. Read [`docs/architecture/repository-map.md`](docs/architecture/repository-map.md).
2. Read [`docs/content-guide/naming-and-placement.md`](docs/content-guide/naming-and-placement.md).
3. Read [`docs/vertical-slice/case-1-01-atlantic-crossroads.md`](docs/vertical-slice/case-1-01-atlantic-crossroads.md).
4. Read [`docs/decision-log/0001-engine-and-campaign-boundaries.md`](docs/decision-log/0001-engine-and-campaign-boundaries.md).

## Architecture rule

**Engine code never contains APUSH-specific facts.**

The engine renders systems such as dialogue, evidence, maps, Codex entries, and assessments. Chronicle content supplies the historical people, places, documents, dates, prompts, and rewards.

## Canonical homes

As of the dead-code-removal pass (`docs/migrations/DEAD-CODE-REMOVAL.md`), this table reflects what's actually live — the old table listed several paths (`content/campaigns/`, `content/library/`, root `assets/`, `apps/web/src/features/`) that were dormant/orphaned scaffolding and have since been deleted.

| Thing                            | Permanent home                                                         |
| --------------------------------- | ----------------------------------------------------------------------- |
| Reusable JavaScript systems      | `apps/web/src/engine/`                                                 |
| Campaign and unit content        | `apps/web/src/content/` (`unit-01-campaign.js`, `unit-02-campaign.js`), quest content under `apps/web/src/content/quests/` |
| Reusable quest-type renderers (rubric-scored: MCQ, Sequencing, Evidence Organizing, Source Analysis/HIPP) | `apps/web/src/quest-types/generic/`, `apps/web/src/quest-types/history/` — see `docs/architecture/QUEST-TYPE-ARCHITECTURE.md` |
| Mini-games (pacing/reward only, NOT rubric-scored) | `apps/web/src/mini-games/` (flat, no subfolders) |
| Images, maps, audio, icons       | `apps/web/src/assets/`                                                 |
| JSON schemas                     | `data/schemas/`, `apps/web/src/content/schemas/`                      |
| Project documentation            | `docs/`                                                                 |
| Build/import/validation scripts  | `scripts/`                                                              |

## Important: stable, not frozen

Folders are intentionally stable. Changes are allowed only when they are documented in the decision log and migrated deliberately. Do not create a second folder simply because a new feature feels similar to an existing one.
