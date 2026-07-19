# 0028 — Quest-Type Expansion (Sequencing, HIPP) and Mini-Games Layer

Date: 2026-07-11

## Decision

Extend the Phase 8 quest-type layer (`apps/web/src/quest-types/`) from two quest types to four, adding `generic/sequencing-quest.js` and `history/source-analysis-quest.js` (HIPP), and add a new, deliberately separate `apps/web/src/mini-games/` layer (`cargo-sorting.js`, `storm-navigation.js`) that is explicitly **not** rubric-scored. Stand up the project's 6-agent subagent team (`content-designer`, `map-implementer`, `content-validator`, `test-writer`, `code-reviewer`, `doc-sync`) in `.claude/agents/` as the standing workflow for future content/engine passes.

This is a project-owner-directed scope decision, executed overnight under an explicit standing prompt granting full autonomy — not a rediscovered architecture forcing function. It does not reopen any deferred system (Phaser, Tiled, `PlatformCore`, `WorldComposition`, accounts, classrooms, database work all remain untouched and deferred).

## Rationale

**Sequencing scoring is all-or-nothing** because the real AP historical-thinking rubrics score chronological reasoning as causal/developmental logic, not date recall — a near-miss ordering isn't "partially causally correct," so `gradeSequencingQuest` requires every item's position to match exactly, with no partial-credit scale invented.

**HIPP (Source Analysis) scoring is binary per HIPP dimension per document** because the real DBQ sourcing point is earned only by explaining _how or why_ a document's Historical situation/Intended audience/Point of view/Purpose is relevant to an argument — never for merely identifying it. The schema enforces this directly: exactly one explanation-linked `correct` option per tagged dimension, at least one `identificationOnly` distractor (factually correct, names the element, earns nothing) required per dimension, and an option can never be both `correct` and `identificationOnly`. Only 1-2 dimensions are tagged per document — not all four — matching the real rubric's practice of scoring what's actually arguable for a given source, not forcing every HIPP category onto every document.

**Mini-games are deliberately not rubric-scored** and live in a sibling folder, not inside `quest-types/`: Cargo Sorting and Storm Navigation exist purely as a pacing/reward break between earnest quest content, with no historical-thinking-skill schema, no correctness gating, and no currency/wallet/economy/leaderboard/multiplayer mechanic. Blurring this distinction would undermine the whole reason quest-types exist as a rubric-grounded layer in the first place.

## Notes

- `QUEST_TYPES` lookup (`apps/web/src/quest-types/index.js`) now has 4 entries; still a plain object literal, not a registry.
- Real Case 1.01 content was written for both new quest types (`UNIT_01_SEQUENCING_QUESTS`, `UNIT_01_SOURCE_ANALYSIS_QUESTS`) — see `docs/architecture/QUEST-TYPE-ARCHITECTURE.md` and the session report for the specific historical grounding and the honest note on identification-only-distractor authoring cost.
- Cargo Sorting's default trade goods (maize, cassava, cacao, cotton, gold ore, tobacco) were deliberately chosen to avoid Unit 2's triangular-trade goods framing — flagged explicitly for owner review in the session report.
- `main.js` was not touched by this phase, same as Phase 8 — the quest-type/mini-game layers remain unwired from the running game, verified instead via two dev-only preview harnesses (`apps/web/quest-type-preview.html`, `apps/web/mini-games-preview.html`) and a scripted Playwright pass.
- Full writeup: `docs/architecture/QUEST-TYPE-ARCHITECTURE.md` and `docs/architecture/session-reports/2026-07-11-overnight-quest-types-and-minigames.md`.
