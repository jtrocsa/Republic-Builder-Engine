# Workflow & Screen-State Audit

**Status:** Point-in-time audit, 2026-07-23. Deep dive on Area 2 of `FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md`. Research only, no code changed.

## The current model, as it actually exists today

**`VALID_SCREENS`** (`main.js:1451-1486`) is a flat `Set` of 34 screen names: `institute`, `archive`, `travel`, `field`, `village-activity`, `columbus-activity`, `map-jigsaw`, `practice-check`, `mini-games`, `source`, `codex`, `reconstruction`, `ledger`, `ledger-success`, `founding`, `empire`, `upload`, `return-warp`, `review`, `completion`, `triangle`, `archive-challenges`, `investigation`, `intro-welcome`, `intro-briefing`, `intro-protocol`, `identity`, `intro-registration`, `intro-hallway`, `join`, `login`, `teacher-dashboard`, `grading`, `manage-content-case`.

Note: `"manage-content"` (the old standalone unit/mission-listing screen) is **not** in this list — confirmed via a code comment at `main.js:2692-2695` that it "was folded into the Teacher Dashboard's Units tab" at some undocumented point after Phase 27. Every prior architecture doc describing "two Manage Content screens" is stale on this specific point; see `FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md` §0 for the recommended documentation fix (out of this audit's own scope).

**Boot-time guard** (`main.js:1487-1491`):
```js
if (
  !VALID_SCREENS.has(progress.currentScreen) ||
  VOLATILE_SCREENS.has(progress.currentScreen) ||
  (progress.currentScreen === "travel" && !progress.activeCaseId)
) { /* redirect to a safe screen */ }
```
This single guard does three jobs at once: rejects any screen name that isn't in the current allowlist (handles the "`regions` screen was deleted" class of bug from Phase 19, and would handle the same class of bug for any future screen removal automatically — no per-screen migration code was needed when `regions` was removed, confirmed by the decision log's own account of that deletion), rejects screens explicitly marked volatile (ephemeral mid-flow states that shouldn't survive a reload), and special-cases `travel` needing a live `activeCaseId` to be meaningful. This is a real, working forward-compatible safety net, not just a one-off patch.

**`render()`**: a flat switch over `progress.currentScreen`, wrapped in a top-level `try/catch` that falls back to `instituteScreen()` on any render-time error — confirmed present (not just claimed) by direct read. This means a bug in one screen's render function degrades to "player lands back at the Institute" rather than a blank white screen or a thrown error the player can't recover from.

**`CLICK_HANDLER_GROUPS`** (`main.js:7522-7535`): 12 functions — `handleChromeClick`, `handleLandingClick`, `handleOnboardingClick`, `handleHubClick`, `handleFieldClick`, `handleSourceReaderClick`, `handlePuzzleScreenClick`, `handleReviewClick`, `handleAuthScreenClick`, `handleGradingScreenClick`, `handleManageContentClick`, `handleEvaluatorClick` — behind a first-match-wins loop in `handleAppClick()` (`main.js:7537-7571`). This is the Phase 13 decomposition of what used to be one ~570-line, ~50-branch dispatcher; each group function owns a disjoint set of `data-action` values (verified mutually exclusive at the time of that split, per the decision log). Two more group-style handlers exist outside this array for non-click events: a `change` listener (radio inputs, `<select>`s, text fields) and four native drag-and-drop listeners (`main.js:7993-7996`).

**`previewSession`** (`main.js:1610`, module-level `{active: false, snapshot: null}`): the one piece of screen-adjacent state that lives outside `progress`/`VALID_SCREENS` entirely. It's read at ~6 call sites (`main.js:1894, 1899, 5670, 6279, 6291, 7446`) to guard `save()`, the field's source-reading entry point, and the evaluator's submission-recording call. Entered via `enterContentPreview()` (`main.js:3562` area) which snapshots the current screen/state before navigating into the real student-facing field/Archive Challenges screen, and exited via a restore at `main.js:3588-3589` or the safety-net `home`/`archive-room` guard at `main.js:7446`.

## Does Chronicle need a formal state-machine library?

**No — not on current evidence.** The three things a library like XState or Zag.js would mainly contribute are already present in hand-rolled form: (1) an explicit valid-state allowlist (`VALID_SCREENS`), (2) a guard that redirects out of an invalid/stale state rather than crashing (the boot-time check above), and (3) a recovery path when a transition's own logic throws (the top-level render try/catch). No repeated illegal-transition bug is on record across 27 documented phases — the bugs that *were* found and fixed in this area (Phase 18's `navigationTableVisible` truthy-check bug, Phase 19's `regions`-screen-deletion fallback, Phase 24's `canPreview`/`enterContentPreview()` guard mismatch) were each **guard-logic** bugs (a condition checked incorrectly), not **missing-transition-table** bugs a formal FSM would have prevented by construction. A state-machine library would replace working code with a new abstraction to re-express the same 34 states and re-derive the same guards — the request's own instruction ("do not recommend a state-machine package unless it clearly prevents real current failure modes") is not met here.

**Where a smaller, event-driven improvement is worth considering**: `previewSession` living outside the `VALID_SCREENS`/`progress` model is the one place the workflow model shows real seams — it's a second, independently-guarded piece of "what mode is the app in" state, checked manually at each of its ~6 call sites rather than through one shared policy (e.g., a single `isReadOnlyPreview()` predicate used everywhere `save()`/`recordSubmission()` currently duplicate the `if (previewSession.active) return;` check). This is a **strengthen-in-place** candidate, not a rewrite: consolidate the repeated guard into one named predicate, don't introduce a new state-management layer.

## Screen restoration and route fallbacks — what's covered, what isn't

Covered, confirmed by direct read: stale/deleted screen names (boot guard), `travel` without an `activeCaseId` (boot guard), a render-time exception in any screen function (try/catch fallback), and `previewSession` cleanup on preview exit or a safety-net "Recall to Institute" click. Not exhaustively traced in this pass (would need a live browser/Playwright walkthrough, not a static read, since these are cross-screen sequencing questions): whether every one of the 34 screens has a symmetric "what if I reload here mid-flow" story — `VOLATILE_SCREENS` (referenced but not enumerated in this pass) is presumably where that answer lives; worth a dedicated read + a Playwright scenario (see `PLAYWRIGHT-ADOPTION-PLAN.md`'s "one legacy-save route fallback" suggested test) rather than asserting a gap here without evidence.

## Verdict summary (feeds the decision table in the main audit doc)

| System | Classification |
|---|---|
| `VALID_SCREENS` + boot-time redirect guard | Keep as-is |
| `render()` switch + top-level try/catch fallback | Keep as-is |
| `CLICK_HANDLER_GROUPS` dispatcher | Keep as-is |
| A formal state-machine/transition-table library | Defer — no forcing function found |
| `previewSession`'s repeated manual guard at ~6 call sites | Strengthen in place (one shared predicate) |
| Full route-restoration coverage across all 34 screens | Strengthen in place — add explicit test coverage (Playwright) rather than a new mechanism; no evidence of a gap serious enough to warrant a rewrite |
