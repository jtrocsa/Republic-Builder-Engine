# Teacher UI & Accessibility Audit

**Status:** Point-in-time audit, 2026-07-23. Deep dive on Area 1 of `FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md` — see that document for the full decision table and cross-area synthesis. Research only, no code changed.

## Scope

Teacher Dashboard (`teacherDashboardScreen()`, `main.js:2164`), Manage Content Case (`manageContentCaseScreen()`, `main.js:3189`), Grading (`gradingScreen()`, `main.js:2369`), Join/Login (`joinScreen()`/`loginScreen()`, `main.js:1994`/`2018`), the Manage Content unit accordion, the delete-confirmation dialog, tooltips, status/loading/error states, save/publish feedback, keyboard navigation, `aria-live`, disabled states, and the "Previewing as student" banner.

## Screen-by-screen findings

### Teacher Dashboard (`main.js:2164-2205`, tab bodies at `2174-2180`)

Guarded by a role check (`!currentProfile || currentProfile.role !== "teacher"`) that renders a clean "Sign in as a teacher" fallback with a single CTA — this pattern repeats identically in `gradingScreen()`. Four tabs (`classrooms`/`assignments`/`sources`/`units`) selected via a `tabBodies` lookup object (`main.js:2174-2180`) — a clean, already-generic pattern (adding a 5th tab is one object entry, not a new branch). Error state: `teacherUiState.error` renders as `<p class="feedback error">` (`main.js:2186`) directly under the classroom-switcher buttons — consistent placement, no toast/snackbar mechanism exists or is needed at this data volume. Async load (`loadTeacherDashboardData()`, `main.js:2405-2422`) is a single `try/catch` setting `teacherUiState.error` on failure, called once on screen entry — no retry button, no loading spinner (the screen simply renders with whatever `teacherUiState` held before the fetch resolved, then re-renders after `render()` is called again at the end of the loader). This is adequate for the request-once-on-entry pattern used everywhere in Teacher Mode; it would not be adequate for a screen with frequent background refreshes, which none of these are.

### Manage Content Case (`manageContentCaseScreen()`, `main.js:3189`)

The most complex teacher screen. Structure per the Phase 26/27 decision-log entries (confirmed still accurate against current code): a per-source `<section>` with a collapsible "About this source" metadata block reusing `manageContentSectionMarkup()` (`main.js:2818`), a visually-locked Chronicler-prompt block, and every question grouped under its source via `manageContentQuestionEntryMarkup()` (`main.js:2812`). Editing happens in place — clicking "Edit" swaps the summary row (`manageContentCardSummaryMarkup()`, `main.js:2717`) for the authoring form (`manageContentAuthoringFormMarkup()`, `main.js:3137`) at the same list position, tracked via `isCardBeingEdited()` (`main.js:2705-2710`) checking either `auth.editingOfficialId` or `auth.editingCustomId` against the entry. This in-place-swap pattern avoids a separate modal/panel and keeps the editor's visual context — a reasonable choice, not a gap.

**Save/publish feedback**: a persistent "✓ Saved as draft — not visible to students until you publish" note renders under the swap control once a draft differs from published (per Phase 26's decision log, confirmed present in the read markup functions) — this was a deliberate fix for a previously-reported "does this dropdown do anything" complaint, and it works via plain conditional markup, no toast library needed.

**Delete confirmation** (`main.js:2754`): the one dialog-shaped UI in the entire app —
```
data-action="delete-custom-addition" ... type="button">Confirm delete</button>
data-action="cancel-delete-addition" ... type="button">Cancel</button>
```
A code comment at `main.js:1599` confirms this is deliberate: `"Confirm delete?" state, or null. The app has no window.confirm()`. This is a reasonable choice (native `window.confirm()` is unstyleable and blocks the render loop), but the replacement is two inline buttons with no focus management, no `Escape` handling, and no `aria-modal`/dialog semantics — a screen-reader or keyboard-only user gets no signal that a modal-shaped decision is being asked for. **See decision table row: replace with native `<dialog>` + `showModal()`, which gets focus-trap and Escape for free with near-zero code.**

### Grading (`gradingScreen()`, `main.js:2369-2402`)

Same signed-out guard pattern as Teacher Dashboard. Three states handled explicitly: no submission loaded yet (`"Loading submission…"` or `gradingUiState.error`, `main.js:2375`), a loaded submission with existing grades (`main.js:2377-2383`, mapped to `<article class="manual-grade-entry">` cards), and the grade-entry form itself (a plain `<label>`-wrapped `<input>`/`<textarea>` pair, `main.js:2397-2398`). `openGradingScreen()` (`main.js:2440-2457`) sets a loading-implicit state by rendering once before the async fetch resolves, then again after — same shape as the Teacher Dashboard loader, same lack of a spinner, same adequacy verdict.

### Join/Login (`joinScreen()`/`loginScreen()`, `main.js:1994-2036` and following)

Both use `authUiState.pending` to disable the submit button and swap its label to `"Please wait…"` (`main.js:2013`, `2032`, `2033`) — this is a real, correctly-implemented loading-state pattern, applied consistently to every submit button on both screens including the Google OAuth button. `authUiState.error`/`authUiState.info` render as the same `.feedback`/`.feedback.error` fragments used elsewhere. The password field (`passwordFieldMarkup()`, `main.js:1990-1992`) already has a working Show/Hide toggle with `aria-pressed="false"` wired to `data-action="toggle-password-visibility"` — a correct, if minimal, accessible pattern already in place, not a gap.

## Cross-cutting patterns

### `aria-live` usage — already broad, not absent

Grep-confirmed 17 occurrences of `aria-live="polite"` combined with `role="status"` across: all four Practice Check quest-type feedback blocks (`main.js:5540,5557,5560,5575,5580,5603,5604`), Archive/Investigation Challenge completion messages (`main.js:4829-4914`), and field dialogue bubbles (`main.js:5402`). This is a genuinely solid existing pattern — screen-reader users get live announcements for quest grading and dialogue exactly where it matters. **The gap is narrower than "no aria-live exists"**: the Manage Content save-feedback note ("✓ Saved as draft…") and the Teacher Dashboard/Grading `xUiState.error` blocks were not confirmed to carry `aria-live` in this pass — worth a follow-up grep before the first-implementation task ships, since a silently-appearing error message with no live-region announcement is a real (if narrower) gap in the same family as the ones already fixed elsewhere.

### Disabled states — consistent, no gaps found

32 occurrences of `disabled` across `main.js`. Every submit button gated on `authUiState.pending`/similar in-flight state uses it correctly (button disables + label changes, not just a visual dim). The "+ Add new question" buttons use `disabled` plus an explanatory `title=` tooltip (18 `title=` occurrences total in `main.js`) rather than silently hiding the control — matches the project's own stated house style (Phase 27: "matching the file's existing house style for a flagged, known gap").

### Tooltips — native `title=` only, no rich tooltip component

All 18 `title=` occurrences are native browser tooltips (hover-delay, no styling, no keyboard-accessible equivalent beyond focus+no-visual-cue). Adequate for the current usage (explaining why a button is disabled) but would not scale to a richer help-text need. No forcing function exists today for a real tooltip library (Floating UI, Tippy) — the current usage is simple enough that native `title=` is the right call per the request's own "evaluate native capabilities first" rule.

### Keyboard navigation and focus management

**Confirmed gap**: no `Escape`-key handling exists anywhere in `main.js` — the only `keydown`/`keyup` listeners (`main.js:8000-8001`) drive field/hub movement. This means: the delete-confirmation dialog, the "Previewing as student" banner, and field dialogue bubbles (which do have a close button, `data-action="field-dialogue-close"`, `main.js:5402`) all lack a keyboard-only dismissal path today. Tab order was not exhaustively traced in this pass (would need a live browser pass, not a static read) — flagged as a good candidate for the Playwright suite's "one teacher content edit/draft/publish flow" scenario to include a keyboard-only run.

### The "Previewing as student" banner (`previewSession`, `main.js:1610`)

Confirmed real and correctly guarded: `save()` (main.js's ~60+ call-site wrapper) and the evaluator's `recordSubmission()` call both check `previewSession.active` and no-op (`main.js:1894`, `5670`, `6279`, `6291`) so a teacher exploring the real field/Practice Check screens during preview can't write to their own account's progress or submissions. Exit is available via both the injected banner and the field's own "Recall to Institute" control (`main.js:7446`, a safety-net guard on `handleChromeClick`'s `home`/`archive-room` actions) — two independent exit paths, which is good redundancy, not duplication to clean up.

## Verdict summary (feeds the decision table in the main audit doc)

| System | Classification |
|---|---|
| `aria-live` coverage on quest/dialogue feedback | Keep as-is |
| Disabled-state + tooltip pattern | Keep as-is |
| Password Show/Hide toggle | Keep as-is |
| `previewSession` guard/exit paths | Keep as-is |
| Delete-confirmation dialog | Strengthen in place (native `<dialog>`) |
| Global Escape-key handling | Strengthen in place (one shared `keydown` branch) |
| Manage Content accordion (native `<details>` question) | Prototype before deciding |
| Loading/error state per teacher screen | Strengthen in place (shared helper — see main audit doc's Supabase section) |
