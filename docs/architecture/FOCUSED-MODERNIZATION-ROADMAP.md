# Focused Modernization Roadmap

**Status:** Point-in-time roadmap, 2026-07-23. Synthesis of `FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md` and its four companion deep dives (`TEACHER-UI-ACCESSIBILITY-AUDIT.md`, `WORKFLOW-STATE-AUDIT.md`, `AUTHORING-SYSTEMS-AUDIT.md`, `PLAYWRIGHT-ADOPTION-PLAN.md`). Nothing in this document has been implemented — see each source doc for the evidence behind every ranking below.

## Ranked top 10

### 1. Consolidate quest-type status/hint derivation onto `QUEST_TYPES`
- **Why now**: two independent, already-disagreeing systems exist today (`main.js:1819-1848` vs. `main.js:5525-5609`) — this isn't a hypothetical risk, it's confirmed present duplication with a confirmed vocabulary mismatch (HIPP's `"partial"` status).
- **Visible to**: both — students see quest feedback text, teachers see the same logic reflected in Archive/Investigation Challenges.
- **Dependency or native**: native — add `isComplete`/`answeredAny`/`hint` to each of the 4 `quest-types/*.js` modules.
- **Expected code removed**: ~90 lines of duplicated per-type branching across two call sites.
- **Difficulty**: Low-medium.
- **Regression risk**: Low — all 4 quest-type modules have existing Vitest coverage to pin behavior before/after; both call sites (`practiceCheckScreen()`, `archiveChallengesScreen()`/`investigationScreen()`) are exercised by documented Playwright passes already.
- **Reversibility**: High — pure refactor, no schema/data change.
- **Prerequisite work**: None.
- **Testing required**: Extend each `quest-types/*.test.js` file with the 3 new functions; no new integration test needed beyond re-running the existing Playwright passes for Practice Check and Archive/Investigation Challenges.
- **Owner approval required**: No — matches an already-flagged, owner-visible gap (`ARCHITECTURE-QUICKREF.md`'s own Phase 19-20 note names this exact consolidation as unscheduled follow-up).
- **Recommended mode**: Auto.

### 2. Commit the Playwright suite (11 scenarios from `PLAYWRIGHT-ADOPTION-PLAN.md`)
- **Why now**: Playwright has caught 5+ real bugs across 20+ ad hoc passes with zero committed artifacts to show for any of them — the "convert proven manual value into rerunnable coverage" case is unusually strong and already evidenced, not speculative.
- **Visible to**: neither directly (dev-only infra) — but protects both student- and teacher-facing flows from regressions.
- **Dependency or native**: already-installed dependency (`playwright ^1.61.1`) — this is "start using what's already there," not a new adoption.
- **Expected code removed**: None (net-new test code) — but retires the need to re-derive the same 11 manual passes by hand every future session.
- **Difficulty**: Medium (11 scenarios, each needs real selectors/flows written once).
- **Regression risk**: Very low — pure addition, no `apps/web/src/` change.
- **Reversibility**: High — a `tests/e2e/` directory can be deleted with zero impact on the shipped app.
- **Prerequisite work**: None — `webServer` config can point at the existing `npm run dev`.
- **Testing required**: The suite is the test.
- **Owner approval required**: No — Playwright's use has been owner-directed/owner-visible in every phase already.
- **Recommended mode**: Plan (worth a short scope check before an 11-scenario suite is written in one pass, given the size).

### 3. Replace the hand-rolled delete-confirmation with native `<dialog>`
- **Why now**: it's the one modal-shaped UI in the app with no focus trap or Escape handling — a small, concrete, already-isolated accessibility gap.
- **Visible to**: teachers only (Manage Content's teacher-added-question delete).
- **Dependency or native**: native (`<dialog>`/`showModal()`).
- **Expected code removed**: Net roughly neutral line count, but removes a documented "the app has no `window.confirm()`" workaround comment (`main.js:1599`) in favor of the correct native primitive.
- **Difficulty**: Low.
- **Regression risk**: Low — one call site, already covered by a documented Playwright pass (Phase 26).
- **Reversibility**: High.
- **Prerequisite work**: None.
- **Testing required**: Re-run the existing delete-confirmation Playwright flow; add an Escape-to-cancel assertion.
- **Owner approval required**: No.
- **Recommended mode**: Auto.

### 4. Add global Escape-key handling for dialogue/preview-banner/dialog dismissal
- **Why now**: confirmed zero `Escape` handling anywhere in `main.js` — a real, verifiable keyboard-accessibility gap, cheap to close.
- **Visible to**: students (dialogue bubbles) and teachers (preview banner, item 3's dialog).
- **Dependency or native**: native — one `keydown` branch.
- **Expected code removed**: None (small addition).
- **Difficulty**: Low.
- **Regression risk**: Low — additive only, doesn't touch the existing movement `keydown`/`keyup` listeners.
- **Reversibility**: High.
- **Prerequisite work**: Best done alongside item 3, since a native `<dialog>` gets Escape for free and the shared listener only needs to cover the remaining cases (dialogue bubble, preview banner).
- **Testing required**: One Playwright assertion per dismissible surface.
- **Owner approval required**: No.
- **Recommended mode**: Auto.

### 5. Build the curated-alternate-content picker UI
- **Why now**: backend-complete since Phase 23, confirmed still unrendered anywhere — the cleanest "close a self-reported gap" item on the list, no new schema/migration needed.
- **Visible to**: teachers.
- **Dependency or native**: native (`<select>` populated from existing `contentUiState.slots[].alternatives`).
- **Expected code removed**: None (closes a gap, doesn't remove code) — but activates already-written, already-tested backend plumbing that's currently dead weight.
- **Difficulty**: Medium (touches the highest-traffic teacher screen, `manageContentCaseScreen()`).
- **Regression risk**: Medium — needs the same live Playwright verification every prior Manage Content phase has required.
- **Reversibility**: High (additive UI).
- **Prerequisite work**: None.
- **Testing required**: A live Playwright pass selecting a curated alternate, confirming the preview updates, confirming publish/revert both still work.
- **Owner approval required**: Recommended — this is real, visible teacher-facing UI, not a pure internal refactor; a quick check-in before building matches how every prior Manage Content UI pass in the decision log was scoped.
- **Recommended mode**: Plan.

### 6. Centralize the repeated teacher-screen async/error-state pattern
- **Why now**: 5 near-identical `try/catch → xUiState.error → render()` blocks and 5 near-identical `.feedback.error` markup fragments exist today — not broken, but real duplicated boilerplate.
- **Visible to**: teachers (error messages render identically either way, so no visible change for correct behavior — only the code shrinks).
- **Dependency or native**: native (one small helper function).
- **Expected code removed**: ~25 lines.
- **Difficulty**: Low.
- **Regression risk**: Low — pure refactor of already-correct logic; every site has an existing manual/Playwright-verified flow.
- **Reversibility**: High.
- **Prerequisite work**: None.
- **Testing required**: Re-run existing teacher-dashboard/grading/login Playwright passes.
- **Owner approval required**: No.
- **Recommended mode**: Auto.

### 7. Consolidate `previewSession`'s repeated manual guard into one shared predicate
- **Why now**: the same `if (previewSession.active) return;` check is duplicated at ~6 call sites — small but real duplication in a security-relevant guard (prevents teacher-preview writes from leaking into a real account).
- **Visible to**: teachers (invisible if correct — this is a safety-net refactor, not a feature).
- **Dependency or native**: native.
- **Expected code removed**: ~10 lines, but more importantly removes 6 places a future edit could accidentally miss one call site.
- **Difficulty**: Low.
- **Regression risk**: Low-medium — this guard protects real data-write safety, so needs careful re-verification (the exact "Preview as student no-write protection" Playwright scenario from item 2's suite) before/after.
- **Reversibility**: High.
- **Prerequisite work**: Best sequenced after item 2's Playwright suite exists, so the "no-write" guarantee has an automated check rather than only a manual one.
- **Testing required**: The Playwright scenario named above.
- **Owner approval required**: No.
- **Recommended mode**: Auto (after item 2).

### 8. Prototype native `<details>/<summary>` for the Manage Content unit accordion
- **Why now**: currently reimplements disclosure-widget behavior by hand; native would remove ~18 lines per instance, but Phase 26's decision log records a specific reason it wasn't used (`render()`'s full-markup-replacement model resets native `open` state on every re-render) — that constraint needs to be tested, not assumed still true.
- **Visible to**: teachers.
- **Dependency or native**: native.
- **Expected code removed**: ~18 lines if the prototype succeeds; zero if it doesn't (native disclosure state gets silently reset).
- **Difficulty**: Low to prototype, unknown to ship (depends on the prototype's result).
- **Regression risk**: Medium — `render()`'s full-replace model is load-bearing everywhere else; a fix scoped to only this one screen risks inconsistent behavior between screens if not done carefully.
- **Reversibility**: High (it's a prototype, not a commitment).
- **Prerequisite work**: None.
- **Testing required**: The prototype itself is the test — open state before/after re-render, with real user interaction in between.
- **Owner approval required**: No, for the prototype; yes, if the prototype succeeds and a real migration is proposed.
- **Recommended mode**: Plan (small, bounded prototype).

### 9. `aria-live` audit follow-up on save-feedback/error messages
- **Why now**: 17 confirmed correct uses exist already; this pass did not exhaustively confirm the Manage Content "Saved as draft" note and the teacher-screen `.feedback.error` blocks carry the same treatment — a narrow, cheap follow-up to close the loop on an otherwise-strong existing pattern.
- **Visible to**: students and teachers who use assistive technology.
- **Dependency or native**: native.
- **Expected code removed**: None (adds attributes, doesn't remove code).
- **Difficulty**: Low.
- **Regression risk**: Very low.
- **Reversibility**: High.
- **Prerequisite work**: A direct grep/read confirming the current state before changing anything (this pass flagged it as unconfirmed, not confirmed-absent).
- **Testing required**: Manual screen-reader spot-check (no automated aria-live test exists in the Playwright plan above; consider adding one if this becomes a recurring pattern).
- **Owner approval required**: No.
- **Recommended mode**: Auto.

### 10. Document the `manageContentScreen()` → Teacher Dashboard Units-tab consolidation
- **Why now**: every existing architecture doc still describes "two Manage Content screens," and the actual code has already moved past that — a documentation-only fix, but leaving it stale actively misleads the next session (exactly the failure mode `ARCHITECTURE-QUICKREF.md` itself warns against: "a stale quickref is worse than no quickref").
- **Visible to**: neither (internal documentation only).
- **Dependency or native**: N/A.
- **Expected code removed**: N/A (docs only).
- **Difficulty**: Trivial.
- **Regression risk**: None.
- **Reversibility**: N/A.
- **Prerequisite work**: None — the finding is already made in `FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md` §0.
- **Testing required**: None.
- **Owner approval required**: No.
- **Recommended mode**: Auto.

## Systems that must remain untouched

Per the binding docs, reaffirmed by this audit with no new counter-evidence found: movement/collision/camera/NPC-patrol logic in `main.js` (per `CLAUDE.md`'s explicit rule); Phaser/Tiled-as-authoring-pipeline; inkjs; `WorldComposition`/`QuestEngine` renderer-registry/`WorldRuntime`; full `packs/<subject>/` extraction; a formal state-machine library for screen routing (see `WORKFLOW-STATE-AUDIT.md` — the existing hand-rolled guards already cover what one would add); the Web Audio engine (`audio-engine.js`, small and adequate); native HTML5 drag-and-drop + its existing keyboard alternative (already solid).

## Libraries considered and rejected in this pass

- **XState / Zag.js** (screen-routing state machine) — no repeated illegal-transition bug on record; the 3 protections already present (allowlist, redirect guard, render-error fallback) cover what a formal FSM adds.
- **Howler.js / Tone.js** (audio) — `audio-engine.js` meets the "small, isolated, adequate" bar; no crossfade/mobile/testing complaint exists.
- **interact.js / SortableJS** (drag-and-drop) — native DnD already works and already has a keyboard fallback (Phase 12); a library would need an adapter larger than the ~30 lines it replaces.
- **A generic Zod-to-form generator** — Chronicle's authoring forms have real UI concerns (locked-vs-editable splits, source-text autofill, one-time-copy semantics) a generic generator can't express without an adapter as large as the current hand-written form.
- **A command-pattern undo/redo library** — the draft/publish model already gives a coarse, sufficient undo (revert to official / discard draft).
- **A rich-text editor** — no schema field anywhere stores HTML/markup content.
- **A tooltip library** (Floating UI, Tippy) — current usage (explaining disabled buttons) is fully served by native `title=`.
- **CI (GitHub Actions)** — no forcing function independently justifies it; local `npm run test`/`lint`/`build`/`validate:content` (+ the new Playwright suite, item 2) remains the pre-push habit.
- **Visual-regression / axe-core accessibility scanning** — no historical bug was pixel-level; the accessibility gaps found (Escape handling, one dialog) are specific and already hand-enumerable, not the kind of broad sweep a scanner adds unique value for yet.

## Installed dependencies that should be used more fully

- **Playwright** — installed, proven, zero committed suite (item 2 above is the fix).
- **Zod** — already drives runtime content validation and the authoring-form converter; not underused, but item 5 above extends its reach slightly further (the curated-alternate picker resolves through the same Zod-validated content objects).
- **Vitest** — already covers all 4 quest-type modules; item 1 above adds 3 new small pure functions per module, a natural extension of existing coverage, not a new testing surface.

## Concrete triggers for a bigger migration (React, Phaser, InkJS, or similar)

Restated from the binding docs, unchanged by this audit — no evidence found here that any of these thresholds have been crossed:
- **React or another UI framework**: would need a concrete case that `render()`'s full-markup-replace model is causing a *measured* bug or performance problem beyond the one narrow, already-isolated accordion-state question in item 8 — not met.
- **Phaser**: a second real map needing performance the current hand-coded terrain math can't deliver, or a real authoring bottleneck with the hand-coded collision-array approach — not met (3 real `.tmj` maps exist and work).
- **inkjs**: an approved quest design that actually needs branching dialogue with variables/rejoining branches — not met (every NPC line is still static).
- **A general content draft/publish/versioning pipeline** beyond the current classroom-scoped flat overrides — a second real content author (beyond the one owner-as-teacher account exercised so far) needing simultaneous-edit conflict resolution — not met.

## Migration and rollback strategy

Every item in the top 10 is independently reversible: items 1, 3, 4, 6, 7, 9 are pure refactors or additive fixes with no schema/migration/dependency change (git revert is sufficient rollback); item 2 is a new, deletable test directory; item 5 is additive UI wired to an already-existing, already-tested backend path (rollback = revert the UI commit, backend is unaffected); items 8 and 10 are a bounded prototype and a documentation fix respectively, with no shippable-code risk either way. No item in this roadmap requires a database migration, matching the request's own constraint on the first-implementation pick.

## Recommended first implementation

**Item 1: consolidate `practiceCheckScreen()`'s four hand-rolled quest-status blocks onto the `QUEST_TYPES` contract** (`isComplete`/`answeredAny`/`hint` added to each of the 4 quest-type modules, replacing both `main.js:1819-1848` and the inline duplication at `main.js:5525-5609`).

**Why this one, not items 2–7**: it is the only candidate that is simultaneously (a) a *confirmed, currently-live* correctness risk — two systems already disagree on HIPP's partial-credit vocabulary, not a hypothetical future drift — (b) fully covered by pre-existing automated tests (all 4 quest-type modules already have Vitest suites, so before/after behavior is pinned without writing new test infrastructure first), (c) explicitly named as an option in the task's own prompt ("Evaluate whether the existing `QUEST_TYPES` entries should own additional behavior such as `isComplete`, `answeredAny`, `hint`, `status`, `initialResponse`"), and (d) already flagged as unscheduled follow-up by the project's own `ARCHITECTURE-QUICKREF.md`, meaning it needs no fresh owner buy-in to start. Item 2 (Playwright suite) is valuable and evidenced but larger in scope (11 scenarios) and better sequenced as a **Plan**-mode task of its own rather than the single first pick; items 3/4/6/7/9 are all real but smaller/narrower wins that don't touch a currently-confirmed correctness bug the way item 1 does.

## Decisions requiring owner approval before proceeding

- **Item 5** (curated-alternate picker) — real, visible teacher-facing UI on the highest-traffic Manage Content screen; every prior UI change to this screen in the decision log was scoped via an owner check-in first.
- **Item 8** (native `<details>` prototype) — only if the prototype succeeds and a real migration is proposed; the prototype itself needs no approval.
- **Documentation Phase 28 entry** (correcting the `manageContentScreen()` consolidation and the stale line/test counts in `ARCHITECTURE-QUICKREF.md`) — low-stakes, but per `CLAUDE.md`'s own update rule, this is exactly the kind of thing that should be flagged rather than silently rewritten.
- Everything else in the top 10 (items 1, 2, 3, 4, 6, 7, 9, 10) is scoped narrowly enough, and grounded in evidence direct enough, to proceed without a separate approval gate — subject to the existing repo-wide rule that any player-visible change still gets a real `npm run dev` browser check before being called done.
