# Authoring & Content-Management Systems Audit

**Status:** Point-in-time audit, 2026-07-23. Deep dive on Area 4 (+ Area 3's quest-type duplication, since Practice Check and this editor share `QUEST_TYPES`) of `FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md`. Research only, no code changed.

## What exists today — confirmed by direct read

**`apps/web/src/engine/custom-content-authoring.js`** (475 lines, direct read) is a pure, DOM-free, network-free module: `fields object in → {ok, content|errors} out`. It converts Manage Content's structured authoring-form fields into real content objects validated against the **exact same Zod schemas** the rest of the app already uses (`buildSourceSchema`, `McqQuestSchema`, `SequencingQuestSchema`, `EvidenceOrganizingQuestSchema`, `SourceAnalysisQuestSchema`, `ExchangeRecordSchema` — all imported directly from the live schema/quest-type modules, not duplicated copies). This is a genuinely well-built adapter: list-shaped fields (MCQ choices, sequencing items, evidence sources, HIPP prompts) are structured row arrays addressed positionally, ids are generated via a local `slugify()`/`shortId()` pair rather than requiring a persisted synthetic id, and the module's own header comment documents a real, non-obvious invariant (sequencing's authored row order is shuffled before storage, because an already-sorted array would give the answer away — `position` stays the real answer key). A source's engine-wiring fields (`visual`, `activityRoute`, `investigationMode`, etc.) are deliberately *not* exposed as form fields — they're carried forward unchanged from the source being edited, which correctly keeps a teacher from being able to break field-jigsaw routing or Investigation Challenge gating through a text form.

**`remote-content-selection-repository.js`** (362 lines, the largest repository file) resolves a slot (source, or any of `{mcq, sequencing, evidence-organizing, hipp, ledger-record}`) to either its official content, a curated alternate, or a custom-authored replacement/addition, via an in-memory cache switchable between `"published"` and `"draft"` — this is the mechanism "Preview as student" uses to show draft content without touching what a real student sees.

**`custom_content_items`** (Supabase table, migration `0008`) stores both `mode: 'replacement'` (edits an existing official question — rides the existing draft/publish lifecycle) and `mode: 'addition'` (a net-new question with no official slot to attach to — owns its own `status` directly) rows, with RLS mirroring the existing teacher-full-CRUD/student-published-only split used elsewhere.

## The three confirmed gaps — status of each, verified against current code, not assumed from the decision log

### 1. Curated-alternate picker — still missing

`contentUiState.slots[].alternatives` (curated-alternate metadata) is computed by `loadManageContentCaseData()` for every slot kind, per the Phase 27 decision-log note. This pass did not find any rendering of that array in `manageContentCaseScreen()`'s current markup functions (`manageContentCardSummaryMarkup`, `manageContentGroupBodyMarkup`, `manageContentAuthoringFormMarkup` — none reference `.alternatives`). **Confirmed still open.** This is the cleanest gap in the whole authoring system: the backend has carried this data since Phase 23, the UI is a missing `<select>`, and the write path (`setDraftSelection` with `alt_kind: 'curated'`) already exists and is exercised by other flows. No new schema, no new migration, no new repository method — purely a rendering gap.

### 2. "Add new question" — correctly disabled, not silently broken

Confirmed: both "+ Add new question" buttons render `disabled` with an explanatory `title=` tooltip, matching the pattern documented in Phase 27. The root cause (also re-confirmed by direct read, not assumed): `archiveChallengesScreen()` iterates `unit.cases.filter(c => c.archiveChallenge)` and `practiceCheckScreen()` iterates `PRACTICE_CHECK_QUESTS[caseId]` — both are static, official-content-only lists that structurally cannot discover a `mode: 'addition'` row, since an addition has no official `questId` to be found by either list. This is a real architectural gap (a genuinely new question needs both render paths taught to merge in resolved addition rows), correctly triaged as **out of scope for a UI-focused pass** rather than half-fixed. Recommend it stay deferred until it's scoped on its own — attempting it inside a smaller pass risks the exact kind of "shipped but unreachable" state the `apps/web/src/features/*` dead-code episode (deleted in Phase 5) already illustrates the cost of.

### 3. SAQ quest type — does not exist, correctly reflected in the UI

No `saq` entry exists in `QUEST_TYPES` (`apps/web/src/quest-types/index.js`) — confirmed by direct read of the object literal (exactly 4 keys: `mcq`, `sequencing`, `evidence-organizing`, `hipp`). The authoring type picker shows SAQ as visibly disabled with "not available yet" rather than omitting it — correct, matches the same disabled-with-explanation pattern as gap #2's buttons. Building a real SAQ quest type is real, scoped work (a 5th `quest-types/` module, a schema, `render`/`grade` functions) — not a reuse-audit finding, since nothing generic would solve "APUSH SAQ rubric scoring" better than Chronicle's own existing HIPP/rubric-grounded pattern.

## Should Zod schemas drive more of the form UI?

**Partially, and it already does more than a first glance suggests.** `custom-content-authoring.js` already validates every submitted form against the live schema before accepting it (`issuesToMessages()` turns Zod's `error.issues` into per-field messages) — the form isn't bypassing validation, it's just not **generating its field list** from the schema. A schema-driven form generator (e.g., deriving `<input>`/`<select>` markup directly from a Zod shape) was evaluated conceptually: rejected for now, because Chronicle's forms aren't generic key-value objects — they have real UI concerns a pure schema can't express (the "copy in an existing source's text" autofill picker, the locked-vs-editable field split, the one-time-copy-not-live-link semantics) that a generic Zod-to-form library would need an equally large adapter layer to express, likely larger than the current hand-written `manageContentAuthoringFormMarkup()`. This is a **defer**, not a reject — revisit if a 3rd+ content type's form starts repeating the same custom layout logic verbatim.

## Undo/redo and autosave — not present, and no forcing function found

No undo/redo exists for authoring-form edits (a wrong edit is corrected by re-editing, not by a command-pattern history stack) and no autosave exists (edits become a draft only on an explicit save action, per the draft/publish model itself). Evaluated against the request's suggested candidates: a command-pattern undo/redo library was rejected — the draft/publish model already gives a coarse "undo" (revert to official / discard an unpublished draft) that covers the actual risk (accidentally publishing a bad edit to students), and Chronicle's forms are edited one field-group at a time with an explicit save step, not a live-typing document where keystroke-level undo matters. No rich-text editor is needed — confirmed by reading the schema shapes: every text field in every quest-type schema is plain string content (prompts, excerpts, citations), never markup/HTML, so a rich-text editor would be solving a problem Chronicle's content doesn't have.

## Verdict summary (feeds the decision table in the main audit doc)

| System | Classification |
|---|---|
| `custom-content-authoring.js`'s Zod-validated form↔content conversion | Keep as-is |
| Curated-alternate picker UI | Strengthen in place — render the existing `alternatives` data (see main audit doc's decision table) |
| "Add new question" render-path gap | Defer — real fix needs both `archiveChallengesScreen()` and `practiceCheckScreen()` extended, larger than this audit's first-implementation bar |
| SAQ quest type | Defer — real content-engine work, not a reuse-audit finding |
| Schema-driven generic form generator | Defer — no 2nd/3rd content type is repeating enough layout logic yet to justify the adapter |
| Undo/redo | Defer — draft/publish model already covers the real risk |
| Rich-text editor | Reject — no content in the schema is ever HTML/markup |
