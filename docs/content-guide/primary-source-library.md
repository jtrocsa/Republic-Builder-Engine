# Primary Source Reference Library

## What this is

`apps/web/src/content/primary-source-library/` holds a syllabus-wide reference
catalog of AP U.S. History primary and visual sources, organized by unit
(Periods 1-9, matching the College Board CED). It was seeded from a
unit-by-unit priority source list (essential / very common / useful) plus a
condensed 50-highest-priority list and a set of named "common visual sources"
per unit.

Each unit file (`unit-0X-source-library.js`) exports:

- `UNIT_0X_SOURCE_LIBRARY_META` — period, years, label, and the unit's
  "most testable comparisons."
- `UNIT_0X_SOURCES` — text/document sources: `id`, `unit`, `priority`
  (`essential` | `very_common` | `useful`), `topPriorityRank` (1-50 or
  `null`), `title`, `creator`, `date`, `apushUse`, `excerpt`, `citation`,
  `externalUrl` (or `null` if no verified link was found).
- `UNIT_0X_VISUAL_SOURCES` — named visual sources (maps, cartoons,
  photographs) with `id`, `unit`, `title`, `description`, `citation`,
  `externalUrl`.

`primary-source-library/index.js` flattens all 9 units into
`ALL_PRIMARY_SOURCES` / `ALL_VISUAL_SOURCES` plus `getPrimarySourceById()` /
`getVisualSourcesForUnit()`-style lookups.

Validated by `buildPrimarySourcesSchema()` / `buildVisualSourcesSchema()` /
`UnitMetaSchema` in
`apps/web/src/content/schemas/primary-source-library.schema.js`, and wired
into `npm run validate:content` (schema conformance plus global id
uniqueness across all 9 units, same pattern as the existing case/source
cross-reference checks in `scripts/validate-content.js`).

## Why this is a separate shape from the live gameplay `Source` schema

`buildSourceSchema()` (`source.schema.js`) is the shape actually rendered by
`sourceReader()`/`codexScreen()` in `main.js`. It requires fields wired to a
specific built case's gameplay: `activityRoute` (a field-map activity
screen), `reconstruction` (a ledger-lane id defined per case), and
`investigationMode`/`investigationQuestId` (a specific quest). Only Units
1-3 have any case content built at all, so most of this library has no
gameplay to wire to yet — inventing placeholder `activityRoute`/
`reconstruction`/`investigationQuestId` values would just be fabricated
wiring to redo later. This library intentionally omits those fields.

Excerpts here are also deliberately short (1-3 sentences), matching the
in-game `excerpt` convention (see `unit-01-campaign.js`'s Columbus letter
entry) rather than full document text — both for consistency and because
several 20th-century sources (MLK's speeches, Malcolm X, Friedan, Carson,
etc.) are still under copyright and are represented here only as short,
attributed paraphrase/quotation for educational commentary, never full
reproductions.

### The optional `fullText` field

Text-source entries (not visual sources) may also carry an optional
`fullText` field: real, verbatim primary-source text, shown behind a "Show
Full Text" toggle in the Teacher Dashboard's Sources tab (as distinct from
`excerpt`, which is always a short paraphrase, never a quotation). This is
populated unit by unit, not all at once — a source with no `fullText` simply
falls back to linking out to `externalUrl` in that UI.

**Public-domain sources only, no exceptions.** `fullText` must never be
populated for a source that is still under copyright — this includes every
20th-century-or-later source named above (MLK, Malcolm X, Friedan, Carson,
etc.) and any other source without a clear, confirmed public-domain status.
For those, `fullText` stays unset permanently; `externalUrl` (or a citation
pointing to where to find the work) is the only "read the rest" path. When
adding `fullText` for a source that is long enough it wouldn't reasonably
fit on a page (a full letter, chronicle, or pamphlet), quote a real,
verbatim, self-contained passage rather than fabricating a shortcut or
inventing wording — never generate historical document text from memory;
verify it against an actual transcription (e.g. the Avalon Project, Fordham's
Internet History Sourcebooks, Library of Congress, Founders Online) before
adding it here. Unit 1's text sources (`unit-01-source-library.js`) are
populated this way as the working example — all pre-1600 and safely public
domain.

## How to use this when building a new unit's cases

1. When a new case's real content gets authored (following the pattern in
   `unit-01-campaign.js`/`unit-02-campaign.js`/`unit-03-campaign.js`), start
   by pulling relevant entries from this library instead of researching a
   source from scratch.
2. Copy the researched fields (`title`, `creator`, `date`, `excerpt`,
   `citation`, `externalUrl`) into a real `buildSourceSchema()`-shaped
   record in that unit's `CASE_XXX_SOURCES` array, then add the
   gameplay-specific fields this library doesn't have
   (`activityRoute`/`reconstruction`/`investigationMode`/
   `investigationQuestId`) as that case's actual mechanics are designed.
3. Write (or update) a per-unit prose manifest analogous to
   `unit-01-source-and-activity-records.md` documenting the final in-game
   source list once it's real content — this library is the research
   staging ground, not a replacement for that per-case documentation.
4. Visual sources named here have no bundled image asset yet — when one is
   actually added, follow `source-asset-contract.md`'s asset-placement
   convention (`apps/web/src/assets/documents/`, kebab-case filenames) and
   record the local asset path on the real in-game source record's
   `localAsset` field, the same way `unit-01-campaign.js`'s Waldseemüller
   map entry does.

## Source note

Seeded from a College-Board-aligned unit-by-unit source list; consult the
current AP U.S. History Course and Exam Description and released
free-response materials on AP Central before finalizing any new case's
sources, since the CED is the authoritative reference, not this file.
