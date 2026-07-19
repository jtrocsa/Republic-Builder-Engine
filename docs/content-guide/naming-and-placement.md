# Naming and Placement

> Repaired by the Prompt 5 documentation-housekeeping pass. This file was previously a verbatim placeholder stub ("Recovered placeholder file restored...") with no real content. What follows describes how content is actually named and placed today, verified against `docs/architecture/CURRENT-REPOSITORY-AUDIT.md` — not the aspirational canonical-homes table from the original README, which the audit found does not match reality (most concretely: the root `assets/` tree is placeholder-only, and the real assets live under `apps/web/src/assets/`, the inverse of what that table claimed).

## Where live content actually lives

- **Campaign/unit content that `main.js` actually imports**: `apps/web/src/content/*.js` — hand-authored JS modules exporting plain objects/arrays (`BRAND`, `UNIT_01`, `CASE_001_SOURCES`, `EXCHANGE_RECORDS`, `EMPIRE_EVIDENCE`, `REVIEW`, and the Unit 2 equivalents). This is the one schema that's actually live — treat it as canonical when adding Case 1.01 content.
- **Binary source assets** (scans, images): `apps/web/src/assets/documents/`. Use lower-case kebab-case filenames, e.g. `source-waldseemuller-map-1507.jpg`. Each asset file should have a corresponding source record in `apps/web/src/content/`.
- **Sprites, maps, audio**: `apps/web/src/assets/`, organized by kind (`chronicle-sprites/`, `institute/`, `maps/`), referenced from `main.js` via `new URL(..., import.meta.url)` — never a bare string path.
- **Docs**: `docs/`, split into `decision-log/` (numbered ADRs), `architecture/` (cross-cutting design), `content-guide/` (this folder — content-authoring conventions), and `vertical-slice/` (per-case player-facing summaries).

## Source-record contract (what every source needs, regardless of which unit)

Per `docs/content-guide/source-asset-contract.md`:

- a readable excerpt, transcription, or locally bundled image/scan (never an external-link-only source);
- title, creator, date, source type, provenance, and citation;
- a student prompt that appears _before_ explanatory feedback;
- an optional external archive link for verification, never the only way to access the evidence.

Interpretive visuals must be labeled as interpretive, never presented as primary sources. Secondary context is labeled and revealed after a student's initial response when used as feedback (see `docs/content-guide/unit-01-source-and-activity-records.md`).

## Folders that no longer exist — do not recreate them

As of the dead-code-removal pass (`docs/migrations/DEAD-CODE-REMOVAL.md`), the following were confirmed dead (zero imports, zero real callers) and deleted. They're listed here only so a future session doesn't waste time looking for them or reintroduce them:

- `content/campaigns/` and `content/library/` at the repo root — a dormant, unread JSON-native schema. `main.js` never imported this tree.
- `apps/web/src/content/chronicle-case-001.js` — a dead, third schema for the same three Case 1.01 sources, with incompatible field names from the live file.
- `apps/web/src/features/` — an orphaned, unreachable second implementation of onboarding/field/case-player content, with its own (also dead) content shapes.
- Root `assets/` — was placeholder-only (`.gitkeep` files). Real assets live under `apps/web/src/assets/`.

## One schema is canonical now

The repository audit previously found up to four different field-name vocabularies describing the same three Case 1.01 primary sources; three of those four (the dead `chronicle-case-001.js`, the dormant JSON tree, and the `content/library/*.template.json` skeletons) have since been deleted (see above). The live `unit-01-campaign.js`/`unit-02-campaign.js` shape is the only one left — match it when authoring new content.

## Stability note

Folders are intentionally stable. Don't create a second folder because a new feature feels similar to an existing one — and per `CLAUDE.md`'s "Current architecture direction" section, don't pre-create empty folders for a future architecture phase either. The `apps/web/src/features/{assessment,codex,character-creation}/` `.gitkeep`-only folders are the cautionary example of exactly that mistake.
