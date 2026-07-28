# Playwright Adoption Plan

**Status:** Point-in-time plan, 2026-07-23. Deep dive on Area 5 of `FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md`. Research only — no test suite was created, no config was added, no dependency changed in producing this plan.

## The evidence, treated as real (per the task's own instruction)

Playwright (`^1.61.1`) is a real, installed root `package.json` devDependency, confirmed at `package.json:29`. Its installation trigger, per `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §5 (2026-07-10, quoted in full since it's the exact forcing-function language on record): *"While building the quest-type renderers (MCQ, evidence-organizing), no way existed to verify new UI actually renders or responds correctly — Vitest covers logic, not rendered output."* Every use since — confirmed by reading all four Playwright mentions across the binding docs and cross-checking against `ARCHITECTURE-QUICKREF.md`'s phase log, which documents a scripted Playwright pass in **at least 20 of its 27 phases** — has been an ad hoc, manually-run pass against the real dev server during an active session. Confirmed by `Glob`: **zero committed test artifacts exist today** — no `tests/e2e/` directory, no `playwright.config.*` anywhere in the repository.

Real bugs this ad hoc usage caught that `npm run test`/`lint`/`build`/`validate:content` did not, cited directly from the decision log:
- **Archive Room spawn collision** (Phase 14): a collision rect overlapping the room's own spawn point froze all movement — caught only by a scripted walkthrough.
- **`applyEvidencePlacement()` eviction bug** (Phase 16): silently enforced a 1-source-per-slot rule the schema never required, only surfaced once a real 2:1 evidence-organizing quest (case-006) was played through.
- **`navigationTableVisible` truthy-check bug** (Phase 18): a filter using truthy-check instead of `!== false` hid every Navigation Table marker except the one case that explicitly set the field — caught during live browser verification, not by any static check.
- **Sequencing drag-and-drop selector corruption** (second-wave pass): an unscoped `querySelectorAll("[data-sequence-item]")` matched each item 3× (once for the item, twice for its own ↑/↓ buttons), corrupting reorder — a pre-existing bug that predated the pass, never triggered because drag interaction hadn't been exercised by any automated check before.
- **`isChallengeQuestComplete`/`challengeQuestAnsweredAny`/`challengeQuestHint` gap** (second-wave pass): 3 of 4 new Investigation Challenges and case-003's new Archive Challenge would have been **permanently uncompletable** without a fix caught by both a live Playwright pass and an independent code-review pass — not by `test`/`lint`/`build`.
- **`canPreview`/`enterContentPreview()` guard mismatch** (Phase 27): a case with only addition-slot content showed an enabled Preview button that silently no-op'd on click.

This is an unusually strong, already-proven evidence base — not a hypothetical case for adopting Playwright, since it's already installed and has already caught 5+ real bugs across the project's own history. The only thing that has never happened is turning any of those 20+ passes into a **committed, rerunnable** test.

## Is there a forcing function to make it permanent now?

Per `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §10, the specific remaining trigger is: *"Manual browser verification becomes repeatedly burdensome, or regressions recur across full workflows despite it."* On the evidence above, this bar is arguably already met — the same category of bug (a completion-detection function that silently doesn't cover a new quest type, a filter that hides content for every case but one) has recurred more than once across phases, each time caught only by re-running the same kind of manual pass by hand. That said, this plan treats "adopt a small permanent suite" as the recommendation rather than declaring the forcing function definitively crossed — see `FOCUSED-MODERNIZATION-ROADMAP.md` for how this weighs against the other candidates for the single first-implementation task.

## Proposed smallest valuable permanent suite

Following the request's own suggested list, scoped to what's cheapest to write against **already-stable, already-repeatedly-exercised flows** (not brand-new features, which stay ad hoc-verified until they stabilize — consistent with how Playwright has always been used here):

1. **Boot and onboarding** — cold load → identity creation → lands on `institute`. Exercises the boot-time `VALID_SCREENS` guard from `WORKFLOW-STATE-AUDIT.md` incidentally.
2. **Main Hall movement** — keyboard movement + collision against `HUB_BLOCK_RECTS`, confirms camera stays a pure function of position (the project's own most-regression-prone invariant per `CLAUDE.md`).
3. **Archive Room entry and exit** — door transition, Terminal proximity-gated interaction, return to Main Hall (the exact class of bug Phase 14's spawn-collision freeze belonged to).
4. **One field movement/collision test** — a real field (Case 1.01 Caribbean), proximity-gated NPC interaction, dialogue open/close.
5. **One Investigation Challenge** — full walk → proximity "E" interact → challenge renders → answer → "Source Unlocked" → continue into `sourceReader()`. Covers the `isChallengeQuestComplete`-class bug directly.
6. **One Archive Challenge** — Terminal → challenge → drag-and-drop (or `<select>` fallback) → completion written to `progress.completedCases`.
7. **One Practice Check covering all four quest types** — MCQ, Sequencing, Evidence Organizing, HIPP, each graded live, `questResponses` persisted. Directly guards against `practiceCheckScreen()`'s and the challenge-helpers' status logic drifting apart (§3 of the main audit doc) — this test would fail loudly if a future edit to one system breaks parity with the other.
8. **Local save persistence** — full page reload mid-flow, confirm `localStorage` state (progress, questResponses) survives.
9. **Preview-as-student no-write protection** — enter preview, play through a Practice Check, exit, confirm the teacher's own `progress`/`submissions` were never touched (the `previewSession` guard from `WORKFLOW-STATE-AUDIT.md`).
10. **One teacher content edit/draft/publish flow** — sign in (dev fake-teacher shortcut), edit a question, confirm the "Saved as draft" note appears, publish, confirm the change reaches the real student-facing render.
11. **One legacy-save route fallback** — seed a `currentScreen` value that no longer exists (mirroring the real `regions`-deletion case from Phase 19), confirm the boot guard redirects cleanly rather than blank-screening.

Each of these is a **direct restatement of a manual pass already run and already documented** at least once in the decision log — this suite doesn't invent new coverage, it makes existing, already-proven-valuable coverage permanent and rerunnable. Not proposed: visual-regression screenshots or an accessibility-scanning tool (axe-core/Lighthouse CI) — per the request's own instruction to prefer Playwright's built-in capabilities first, and because no visual-regression bug has ever been the failure mode caught by any of the 20+ historical passes (every bug found was behavioral — collision, completion-detection, filter logic — not pixel drift).

## What this plan does not recommend

- **CI integration** (GitHub Actions or similar) — the request's decision-table rules require an existing forcing function per system; no CI pipeline exists in this repo today and none of the nine audit areas independently justify adding one. Running the 11-scenario suite locally before a push (the existing `npm run test`/`lint`/`build`/`validate:content` pre-push habit already described in `CLAUDE.md`) is sufficient until CI itself gets its own forcing function.
- **Visual regression tooling** (Percy, Chromatic) — no evidence any historical bug was a pixel-level regression; Playwright's own `toHaveScreenshot()` is available natively if a real case emerges later, no new dependency needed even then.
- **A separate accessibility-scanning pass** (axe-core) — already on the project's "consider later, not adopted" list per `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md`; the accessibility gaps this audit did find (Escape-key handling, the delete dialog) are specific and already enumerable by hand, not the kind of broad sweep an automated scanner adds unique value for at this scale.

## Adapter/module boundary

`tests/e2e/*.spec.js` (new directory, mirroring `tests/unit/`'s existing convention) + one `playwright.config.js` at the repo root pointing at `npm run dev`'s local server (Playwright's own `webServer` config option starts/stops it automatically — no separate CI-runner script needed). No change to `apps/web/src/` — this is purely new test infrastructure, addable and removable without touching shipped code, matching the "reversible" requirement for a first-implementation candidate.

## Verdict

**Adopt a focused library** — but it's already adopted; the actual proposal is "commit the suite," not "add the dependency." See `FOCUSED-MODERNIZATION-ROADMAP.md` for where this ranks against the other roadmap candidates for the single first-implementation task this pass recommends.
