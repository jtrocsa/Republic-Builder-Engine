# Next-Units Roadmap

A planning document, not a spec: what's left to make Unit 1 complete, what Unit 2 needed to leave placeholder status (now done), and a rough structural shape for Unit 3+. No new game content is authored here — this names the work and points at the right tool/agent for each piece.

## 1. Unit 1: complete with optional future expansion (DONE)

Unit 1 ("The Atlantic Crossroads") already ships three complete, playable cases via normal sequential progression (case-001 → case-002 → case-003), all with real, fully-cited historical content:

- `case-001` — **Caribbean** ("The Atlantic Crossroads") — fully playable, real primary sources and cited-historical content
- `case-002` — **Atlantic** ("Atlantic Exchange") — `exchangeLedgerScreen()`, fully playable, real primary sources and cited-historical content
- `case-003` — **Hispaniola** ("Hispaniola Empire") — `empireScreen()`, fully playable, real primary sources and cited-historical content

Unit 1 is feature-complete. Future optional expansion could add additional badge areas (fourth case and beyond) via new Practice Check quest content, using the `SKILL_CATEGORIES` enum introduced in Phase 12 — specifically to add real Comparison and Causation examples into practice quest sets (see `docs/content-guide/skill-taxonomy.md` for the current gap). This is optional and non-blocking.

**Optional owner for future expansion:** the `content-designer` agent if and when new Unit 1 badge-area content is authored (Zod-schema-validated quest content, no `main.js`/engine changes).

## 2. Unit 2: complete (DONE as of 2026-07-14)

Unit 2 ("Colonial Crossroads," Period 2: 1607–1754) has left placeholder status. All content is now real, cited historical material:

- **Case-004 (Riverbend Settlement):** Field-route case with six NPCs and three collectable source records (1618 Virginia Company charter establishing headright system, 1623 Richard Frethorne indentured-servant letter, 1630 wharf ledger). Real Practice Check content: 3 MCQ items (sourcing/framing/economics), 1 evidence-organizing quest (Causation, Sourcing, Continuity-and-Change skill tags), 1 sequencing quest (headright policy → bound labor → export economy chain), 1 HIPP source-analysis quest (audience/purpose reasoning on the Frethorne letter). All cited primary sources.
- **Case-005 (Triangle Ledger):** Trade-route puzzle mechanic. Six cargo/testimony records with real citations across the outbound, Middle Passage, and homeward legs — Royal African Company/Voyages-database outbound goods, Willem Bosman's 1705 account of the Gold Coast arms trade, Olaudah Equiano's Middle Passage testimony, the 1788 Brooks slave-ship diagram, a plantation invoice modeled on Elizabeth Donnan's documented pattern, and the Navigation Act of 1660's enumerated-commodities clause. Reconstructs triangular trade flow by source, then an MCQ checkpoint per record.
- **Case-006 (Charter & Compact):** Region-builder mechanic. Six colonial founding records with real citations — the Dedham Covenant (1636), the Massachusetts "Old Deluder Satan" Act (1647), a Virginia headright land patent pattern, a representative Chesapeake indenture agreement, William Penn's Frame of Government of Pennsylvania (1682), and a Pennsylvania Gazette flour-export notice — sorted into the societies that created them, then a student-written regional comparison reflection.
- **Unit-level Archive Review:** 6 MCQ items spanning all three cases' real content, plus an SAQ contrasting the Dedham Covenant against Richard Frethorne's letter.

All content validated via `npm run validate:content` (25/25 schema groups pass). Unit 2 is feature-complete and ready for classroom use.

## 3. Unit 3+: rough shape only

Deliberately structural, not historical — no primary-source research happens in this document. APUSH's period sequence puts **Period 3 (1754–1800, Revolution and Founding)** immediately after Unit 2's now-complete Period 2 window, making it the natural next chronological unit.

Suggested shape, matching Unit 1's own structure rather than inventing a new one:

- One flagship playable case (mirroring Case 1.01), plus a small number of locked/future companion badge areas (mirroring Atlantic/Hispaniola) — not a flat single-case unit, and not an open-ended number of cases either.
- A new badge-area name, chosen at authoring time to fit the Institute Archive/Chronotravel/Preservation Case narrative frame already established — not decided here.
- Real field art from day one if the case needs explorable space: check `apps/web/src/assets/tilesets/` for a tileset pack that actually fits the setting (the same inspect-before-committing discipline that made the Island survival choice work for Unit 1's tropical scene — don't default to whichever pack Unit 2 happened to use if the setting is a poor visual fit).

## 4. Regression-prevention: keep future content on the current toolkit

Two things landed this session that future content should build on, not regress past:

- **Four-Cs tagging** (`docs/content-guide/skill-taxonomy.md`) — any new evidence-organizing quest content should use `SKILL_CATEGORIES` from the start, not reintroduce free-text category names the way `"Sourcing and Situation"` existed before it was formalized.
- **Practice Check UI patterns** — new quest-type UI work should extend the unanswered/in-progress/partial/correct/incorrect state model and the keyboard-operable alternatives to drag-and-drop already built, rather than shipping a fifth quest type with no keyboard path to completion.

## 5. Candidate future quest types — not committed scope

`QUEST-TYPE-ARCHITECTURE.md` §5 already named and explicitly deferred four quest types beyond the current set: **Thesis/argument-building**, **Causation-as-node-graph**, **role-play/simulation**, and **SAQ/LEQ-as-quest-format**. Listing them here only to connect them to *future units*, not to commit to building them:

- **Causation-as-node-graph** pairs naturally with a unit whose central question is explicitly causal (a Period 3 revolution-causes unit is a plausible fit).
- **Thesis/argument-building** pairs naturally with an SAQ/LEQ-heavy unit, and is also the most direct way to give **Comparison** a dedicated interaction shape — none of the four current quest types have a comparison/paired-contrast interaction today, which is part of why Comparison has no real content yet (see `docs/content-guide/skill-taxonomy.md`).
- **Role-play/simulation** and **SAQ/LEQ-as-quest-format** have no obvious unit-specific pull yet; revisit when one emerges, not on a schedule.

None of these are scheduled work. Treat this section as a pointer for whoever plans the unit these might attach to, not a queued task.

## 6. Adjacent low-effort latent value

`apps/web/src/mini-games/` (`cargo-sorting.js`, `storm-navigation.js`) is built, tested, and now wired into `main.js` — explicitly non-rubric-scored pacing/reward content, not a quest type. Both games are fully playable and reachable via a "Try a Mini-Game →" button on the Navigation Table screen (`archiveScreen()`), routing to a `mini-games` screen with keyboard-operable controls, best-score persistence for Storm Navigation (`progress.miniGameScores`), and full replay capability. Worth extending opportunistically alongside whichever future unit's content work has a natural pacing gap for it — not a reason to open a dedicated phase on its own.
