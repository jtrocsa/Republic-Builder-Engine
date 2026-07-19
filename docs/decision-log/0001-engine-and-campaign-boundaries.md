# Decision 0001 — Engine and Campaign Boundaries

**Status:** Accepted (rule); enforcement is partial — see "Current compliance" below.

> Repaired by the Prompt 5 documentation-housekeeping pass. This file was previously a verbatim placeholder stub ("Recovered placeholder file restored...") with no real content, despite being the decision `README.md` and `CLAUDE.md` both point to as the source of the project's founding architecture rule. What follows restates that rule (already stated elsewhere in the repo's own docs, not invented here) and — unlike the version that used to exist before this repo's docs were replaced — honestly records where the current code violates it, per `docs/architecture/CURRENT-REPOSITORY-AUDIT.md`.

## Decision

**Engine code never contains subject-specific facts.** The engine (movement, collision, screen routing, dialogue rendering, save/load, audio) must be reusable across any historical (or, longer-term, any subject) campaign without modification. Historical people, places, documents, dates, quest names, and prompts belong in content modules, never hard-coded into engine logic.

This rule exists so that Chronicle's AP U.S. History content is not structurally welded to the code that renders it — a second course, unit, or eventually subject should be addable as new content, not a fork of the engine.

## Canonical split (intent)

| Layer                             | Owns                                                          | Must not contain                           |
| --------------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| Engine (`apps/web/src/engine/`)   | Save/load, generic state-machine primitives                   | Any historical fact, NPC name, or quest ID |
| Content (`apps/web/src/content/`) | Historical people, places, documents, dates, prompts, rewards | Movement/collision/rendering logic         |
| `main.js` (today, transitional)   | Currently mixes both — see below                              | —                                          |

## Current compliance

This rule is **aspirational for the current vertical slice, not yet fully realized**. `docs/architecture/CURRENT-REPOSITORY-AUDIT.md` found the boundary is actively violated in `apps/web/src/main.js`: case-ID literals (e.g. `"case-001"`) are hard-coded directly into movement/interaction-gating code at multiple call sites, not merely referenced from content. This is a known, tracked issue, not a hidden one — don't assume the boundary is clean because this decision says it should be, and don't "fix" it opportunistically as a side effect of an unrelated task (see `CLAUDE.md`'s development-workflow expectations on small, focused changes).

Resolving this properly — e.g. via a `prerequisite`-style content field instead of literal case-ID branching — is documented as future `ContentRegistry`/`QuestEngine` work in `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md`, gated by the near-term scope in `docs/architecture/ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`. It is not scheduled as a standalone near-term task.

## Rationale

Without this boundary, every new unit or case risks becoming a copy-and-diverge of engine code rather than new content — the repository audit already found a concrete instance of exactly that risk materializing: up to four incompatible schemas exist today for the same three Case 1.01 primary sources, because content and the code that reads it were not kept cleanly separated as the project grew.
