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

| Thing | Permanent home |
|---|---|
| Reusable JavaScript systems | `apps/web/src/engine/` |
| Feature-level UI | `apps/web/src/features/` |
| Campaign and unit content | `content/campaigns/` |
| Primary-source records | `content/library/primary-sources/` |
| Historical NPC records | `content/library/npcs/` |
| Historical place records | `content/library/locations/` |
| Images, maps, audio, icons | `assets/` |
| JSON schemas | `data/schemas/` |
| Project documentation | `docs/` |
| Build/import/validation scripts | `scripts/` |

## Important: stable, not frozen

Folders are intentionally stable. Changes are allowed only when they are documented in the decision log and migrated deliberately. Do not create a second folder simply because a new feature feels similar to an existing one.
