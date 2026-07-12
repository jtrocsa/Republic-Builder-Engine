# Content Validation

Status: Phase 3 of the near-term architecture sequence (`docs/architecture/ARCHITECTURE-QUICKREF.md` §6) — complete. This document explains what's validated, why, what's deliberately out of scope, and why.

## Active content formats

Chronicle has (per `docs/architecture/CURRENT-REPOSITORY-AUDIT.md`) up to four incompatible schemas for the same historical-source content across the repository. This phase validates the **one that's actually live**:

- `apps/web/src/content/unit-01-campaign.js` — real Unit 1 content: `BRAND`, `UNIT_01`, `CASE_001_SOURCES`, `EXCHANGE_RECORDS`, `EMPIRE_EVIDENCE`, `EMPIRE_CONNECTIONS`, `REVIEW`.
- `apps/web/src/content/unit-02-campaign.js` — live but placeholder Unit 2 content, same shapes: `UNIT_02`, `CASE_004_SOURCES`, `CASE_004_LANES`, `TRIANGLE_LEGS`, `TRIANGLE_CARGO`, `REGION_RECORDS`, `REGION_EVIDENCE`, `UNIT_02_REVIEW`.

Not validated at the time this phase was written, because they were dead/dormant (per the repository audit, confirmed via import-graph trace — nothing in `main.js` read them). Both have since been deleted in the dead-code-removal pass (`docs/migrations/DEAD-CODE-REMOVAL.md`), so this is now historical context, not a current scope note:

- `apps/web/src/content/chronicle-case-001.js` — orphaned, incompatible field names for the same three Case 1.01 sources. **Deleted.**
- `content/campaigns/chronicle/` + `content/library/` — a dormant JSON content pipeline, a fourth schema for the same content. **Deleted.**

Also out of scope, deliberately: `apps/web/src/content/chronicle-opening.defaults.js` and `chronicle-identity.defaults.js`. These are freeform onboarding/UI copy (nested strings for briefing screens, identity-creation labels, etc.) with no ids, answer indexes, cross-references, or quest structure — none of the required-validation categories in this phase's scope apply to them, and writing a rigid schema around prose copy would be exactly the kind of forced, low-value validation the task asked to avoid.

## Schemas added

All under `apps/web/src/content/schemas/` (a new directory; matches the location the architecture review's revised folder structure names for this purpose):

| File                          | Validates                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unit.schema.js`              | `BrandSchema` (BRAND), `UnitSchema`/`CaseSchema` (UNIT_01/UNIT_02 shape — required ids/titles, `mapPosition`, a `route` enum, duplicate case ids within a unit)                                                                                                                                                                                                                 |
| `source.schema.js`            | `buildSourceSchema()`/`buildSourcesSchema()` (CASE_001_SOURCES/CASE_004_SOURCES — required fields, a real-URL check on `externalUrl`, an optional `reconstructionIds` constraint on the `reconstruction` field, duplicate source ids)                                                                                                                                           |
| `exchange-record.schema.js`   | `ExchangeRecordSchema`/`ExchangeRecordsSchema` (EXCHANGE_RECORDS — answer-index bounds against `choices.length`, duplicate ids)                                                                                                                                                                                                                                                 |
| `empire.schema.js`            | `EmpireEvidenceSchema`/`EmpireEvidenceListSchema` (EMPIRE_EVIDENCE) and `buildEmpireConnectionsSchema()` (EMPIRE_CONNECTIONS — `from`/`to` must reference a real evidence id)                                                                                                                                                                                                   |
| `review.schema.js`            | `ReviewSchema` (REVIEW/UNIT_02_REVIEW — mcq answer-index bounds, and an saq rubric-total check, see below)                                                                                                                                                                                                                                                                      |
| `unit02-activities.schema.js` | `CaseLaneSchema`/`CaseLanesSchema` (CASE_004_LANES), `TriangleLegSchema`/`TriangleLegsSchema` (TRIANGLE_LEGS), `buildTriangleCargoSchema()` (TRIANGLE_CARGO — `leg` must reference a real leg id, answer-index bounds), `RegionRecordSchema`/`RegionRecordsSchema` (REGION_RECORDS), `buildRegionEvidenceSchema()` (REGION_EVIDENCE — `region` must reference a real region id) |
| `cross-reference.js`          | Small validation helpers (`runSchema`, `checkUniqueGlobalIds`) shared by the script and its tests — not Zod schemas themselves, but the glue that turns `safeParse()` results into the group/id/path/message shape the script prints, and the one check no single content file's schema can see on its own (global id uniqueness across both units).                            |

Every array-of-records schema rejects duplicate `id`s within its own array using `.superRefine()`. Cross-references that need to know about _another_ array's ids (empire connections → evidence ids, triangle cargo → leg ids, region evidence → region ids, and case-004 sources' `reconstruction` → lane ids) are schema **factories** (`buildX(validIds)`) — the caller supplies the valid-id list from the sibling array it already loaded, so the check stays inside a single `safeParse()` call rather than a second manual pass.

## The `local-content-repository.js` wrapper

`apps/web/src/repositories/local-content-repository.js` was created. It has exactly one real caller: `scripts/validate-content.js`. It does not move or duplicate content — `loadChronicleContent()` just re-imports the same named exports `main.js` already imports directly from `content/unit-01-campaign.js` and `content/unit-02-campaign.js`, and groups them into one object so the validation script can load "all active content" in one call. `main.js` was **not** changed to use it — it keeps its existing direct imports, so this phase makes zero changes to how the live app loads content.

This matches the architecture review's own suggested near-term folder structure (`repositories/local-content-repository.js — thin wrapper around today's content imports`, §10 of `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`) and its rule for when to build one: only if it has an immediate real caller. It does — the validation script.

## Validation command

```
npm run validate:content
```

Runs `scripts/validate-content.js` under plain `node` (not Vite/Vitest). The script:

1. Loads all active content via `loadChronicleContent()`.
2. Runs each group through its Zod schema with `safeParse()` (never throws; collects issues).
3. Runs the two cross-file checks that need to see across both units at once (see below).
4. Prints a per-group `ok`/`FAIL` line, then a flat list of errors (each with the content group, the record's `id` where derivable, the Zod field path, and the schema's message) if anything failed.
5. Exits `0` on success, `1` on any failure. Never writes to a content file.

Current result against real content: **all 17 groups pass, 0 errors.** No content corrections were needed — every existing case, source, MCQ, and cross-reference in `unit-01-campaign.js`/`unit-02-campaign.js` was already internally consistent.

## Cross-reference checks

Beyond what an individual array's own schema can see:

- **Global case-id uniqueness across both units.** `main.js`'s `caseById()`/`unitForCase()` search across `UNITS = [UNIT_01, UNIT_02]`, not within one unit — so a case id repeated between `UNIT_01.cases` and `UNIT_02.cases` would silently make one of them unreachable. Checked via `checkUniqueGlobalIds()`.
- **Global source-id uniqueness across both cases' source arrays.** `main.js`'s `sourceById()` searches `CASE_001_SOURCES` and `CASE_004_SOURCES` together (`main.js:1112-1114`) — same reasoning, same helper.
- **Empire connections → empire evidence ids**, **triangle cargo → triangle leg ids**, **region evidence → region ids**, and **case-004 sources → case-004 lane ids** are all checked, but via schema factories (see above) rather than a separate script-level pass, since each only needs to see one sibling array.

## Known limitations

- **The validator only reaches plain-data content files, not `main.js`'s embedded content dictionaries.** `main.js` hard-codes several more content-shaped dictionaries directly in the engine file — `FIELD_NPCS`/`UNIT2_FIELD_NPCS` (NPC definitions and dialogue), `FIELD_SOURCE_POINTS`/`UNIT2_FIELD_SOURCE_POINTS` (map coordinates for source pickups), `FIELD_NPC_PATROLS` (patrol coordinates), `UNIT_BADGES` (badge/reward records), and `RECONSTRUCTION_LANES["case-001"]` (case-001's Record Reconstruction lane ids, hard-coded inline rather than sourced from a content file the way case-004's `CASE_004_LANES` is). These are real, in-scope-sounding content per the task's own "NPC definitions / Dialogue / Coordinates / Rewards" categories, but **importing `main.js` from a plain `node scripts/validate-content.js` process doesn't work**: `main.js`'s first line is `import "./styles/global.css"`, and it also references assets via `new URL(..., import.meta.url)` — both are Vite-transform-dependent syntax that only resolves under Vite's (or Vitest's) module pipeline, not plain Node's ESM loader. Reaching them would require either running the validator through Vite/vite-node (a new tool this phase wasn't scoped to adopt) or extracting those dictionaries out of `main.js` into content files (an out-of-scope structural move per this task's explicit constraints). Documented here rather than worked around.
- **`RECONSTRUCTION_LANES["case-001"]`'s lane ids aren't cross-checked against `CASE_001_SOURCES[].reconstruction`.** Direct consequence of the limitation above — case-001's lane list lives only in `main.js`. Case-004's equivalent (`CASE_004_SOURCES[].reconstruction` against `CASE_004_LANES`) _is_ checked, because both live in the content file.
- **`main.js:2749`'s hard-coded `expected` evidence-ordering array for the `check-empire` handler isn't cross-checked against `EMPIRE_EVIDENCE`'s order.** This is a real, already-documented risk (`CURRENT-REPOSITORY-AUDIT.md` §22's risk register: "Duplicate source-of-truth for 'correct' evidence ordering") — same root cause as the limitation above, main.js isn't reachable from this validator.
- **No content-level `prerequisite` field exists to validate.** The audit found case-001's "secure `taino-context` before other sources unlock" rule is implemented as a literal `if (caseId === "case-001")` check duplicated across three `main.js` call sites, not expressed as data anywhere. There's nothing in content for a schema to check yet; a `prerequisite` field would need to be added to source content and then read by `main.js` before this becomes checkable — out of scope for this phase.
- **The saq rubric-total check is a soft regex heuristic, not a structured field.** `REVIEW.saq.rubric`/`UNIT_02_REVIEW.saq.rubric` are freeform prose, not `{ totalPoints: 3 }`. The schema looks for the pattern `"N points total"` and compares `N` to `saq.prompts.length`; rubric text phrased differently (e.g. UNIT_02_REVIEW's "one point per part") is left unchecked rather than forced into a pattern it doesn't use.
- **`api/_lib/rubrics.js`'s real APUSH SAQ/DBQ/LEQ rubrics are not validated.** Per `CLAUDE.md`, `api/evaluate.js` + `api/_lib/rubrics.js` are a real but entirely disconnected AI-grading backend — not called from anywhere in the frontend today. Not "active content" by this task's own definition; left alone.

## Deferred content-model work

Unchanged from `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`: no `packs/chronicle/` extraction, no universal cross-subject content schema, no `Organization`/`School`/`Classroom`/`WorldBlueprint`/`MapTemplate`/`TeacherWorld`/publication-versioning models. Those remain documented future direction in `PLATFORM-ARCHITECTURE-PROPOSAL.md`, not built here.

## Next phase

Per `ARCHITECTURE-QUICKREF.md` §6, the next approved phase is wrapping `chronicle-progress-store.js` behind a thin `local-progress-repository.js` (`ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` §11 step 4 — a small, ~4-line wrapper per the review's corrected complexity estimate, not the original proposal's overbuilt persistence layer). Not started as part of this phase.
