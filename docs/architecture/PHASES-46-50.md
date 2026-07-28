# Phases 46–50 — Chronicle / Odysso Improvement Program

**Status:** Phase 46 in progress. This is the one living roadmap for this program — per Phase 46E, don't create a new stand-alone audit/roadmap document per pass; extend this file instead, and update `ARCHITECTURE-QUICKREF.md`'s one-line phase index when a phase closes.

## Context

Phases 23–44 were teacher-facing; Phase 45 was a gameplay CSS/test-infrastructure pass. The owner asked for five things in one program, with no end date — "improve this every hour of every day for the foreseeable future."

Four problems drove this plan, each verified against the repo, not inferred:

1. **Session cost was structurally wrong.** A usage report showed 91% of usage at >150k context, 70% from subagent-heavy sessions, 65% from the Playwright MCP server. The causes were measurable: `ARCHITECTURE-QUICKREF.md` was 232 lines but 172,761 bytes (~43k tokens) — §4/§5/§6 alone were 160 KB of phase changelog — and `CLAUDE.md` ordered every session and every subagent to read it first. A committed 11-spec Playwright suite with 20 visual baselines already existed (`npm run test:e2e`), but `CLAUDE.md` never mentioned it and still called Playwright "deferred," so browser verification was done by hand through the MCP server. A prior audit (`docs/architecture/AI-USAGE-AND-DEVELOPMENT-COST-AUDIT.md`, 2026-07-23) produced ten prose recommendations and zero config changes; 8 of 10 were never adopted and the QUICKREF had since grown. The repo had no `.claude/settings.json`, no permissions allowlist at all.

2. **The teacher UI was not professional.** The dashboard rendered an `h1` at up to 83px directly above 12px buttons (7×). Teacher surfaces used ~26 distinct font sizes against a 6-step token scale, and bare `<h2>`/`<h3>`/`<h4>` tags with no CSS rule at all fell back to UA-default DM Sans bold. Phase 44 built a token layer and a `c-*` primitive set, then never adopted it: `fieldMarkup()`, `pageHeaderMarkup()`, `sectionHeadMarkup()` had zero call sites; `btn()` had one. Mission-card buttons didn't align, and a 41-character badge wrapped to 2–3 lines while its sibling stayed a pill.

3. **The Navigation Table hid two thirds of the game.** Only 3 of 8 cases rendered markers, because `navigationTableVisible: false` was hard-coded on case-002/003/005/006/008. Every hidden case already had a real `mapPosition`, and `caseMarker()` already implemented a greyed-out `locked` state.

4. **Chronicle covers ~1/3 of APUSH; Odysso is a brochure.** Three units (Periods 1–3), 8 cases, 4 quest types. No SAQ quest type exists (20% of the exam, 30 raw points); no DBQ/LEQ student surface exists (40% combined) even though `api/_lib/rubrics.js` already implements their rubrics. Odysso is a static React marketing site with a placeholder sign-in and no backend.

**Standing constraints that do not relax.** No Phaser, inkjs, `WorldComposition`, `QuestEngine` registries, `WorldRuntime`, or `packs/<subject>/` without a concrete forcing function (`POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §10). No Founder Paths / professions / Historian Skills / wardrobes. No extracting movement/collision/camera from `main.js` for neatness. Every change leaves `npm run dev` player-visibly identical unless new behavior is the explicit goal.

**Sequencing rationale:** 46 first, because every later phase is cheaper once the context floor drops. 47 and 48 next — both are the owner's directly observed complaints, and both are largely already-built systems that need finishing rather than inventing. 49 and 50 open with a research sub-phase because the ask was to "research and consider"; the ranked lists in each are the starting position, not the conclusion.

---

# Phase 46 — Session Cost Discipline (enforced, not advisory)

**Goal:** cut the per-session context floor from ~50k to ~10k and stop paying for browser verification twice. The difference from the 2026-07-23 audit: every item is a config file or a moved/deleted line, not a paragraph of advice.

- **46A — Split the QUICKREF. DONE.** §4/§5/§6 (the phase-by-phase changelog) moved verbatim to `docs/architecture/PHASE-HISTORY.md`, an archive nothing is instructed to read. `ARCHITECTURE-QUICKREF.md` rebuilt as ≤150 lines of pure boundaries plus a one-line-per-phase index. **Measured: 172,761 bytes → 18,599 bytes (89% reduction, ~43k → ~4.6k tokens).**
- **46B — Rewrite `CLAUDE.md`'s verification and reading rules. DONE.** Replaced the "reproduce in the browser" instruction with an explicit verification ladder (targeted vitest → validate:content → `npm run test:e2e` → visual-regression → manual/MCP browser only for uncovered interactions, then banked as a new spec). Fixed the stale "Playwright is deferred" line. Added a "minimum required reading by task type" table. Removed the dangling `/verify` skill reference (no such skill exists). Added an explicit "don't spawn a subagent for a single-file edit" rule.
- **46C — Create the repo's Claude Code configuration. DONE.** Added a tracked `.claude/settings.json`: a permissions allowlist for routine read-only commands (`npm run test`/`test:e2e`/`lint`/`build`/`validate:content`/`format:check`, `git status`/`diff`/`log`, `wc`, `rg`/`grep`), and `deniedMcpServers: [{serverName: "playwright"}]` — the correct mechanism for gating a server regardless of where it's configured (verified against the real settings schema; `disabledMcpjsonServers` was the wrong key, since it only applies to servers declared in a project `.mcp.json`, which this repo doesn't have — Playwright is configured at user/global scope). Pixellab and Vercel MCP stay on, untouched. **Note: the MCP gate takes effect on the next session/`/config` reload, not retroactively within the session that added it.**
- **46D — Fix the subagent multiplier. DONE.** Fixed `.claude/agents/code-reviewer.md`, which still flagged Playwright (and implicitly Tiled) as deferred and would therefore have flagged legitimate e2e/map work as scope creep. The "when not to spawn a subagent" rule landed as part of 46B's CLAUDE.md rewrite rather than as a separate edit, since it's read from the same file every subagent inherits.
- **46E — Stop the audit-doc proliferation. DONE.** Moved 5 closed documents (`FOCUSED-MODERNIZATION-ROADMAP.md` — fully shipped, plus `PLAYWRIGHT-ADOPTION-PLAN.md`, `TEACHER-UI-ACCESSIBILITY-AUDIT.md`, `WORKFLOW-STATE-AUDIT.md`, `AUTHORING-SYSTEMS-AUDIT.md`) to `docs/architecture/archive/` with a one-line index (`archive/README.md`). This file (`PHASES-46-50.md`) is the one living roadmap going forward.

**Verification:** measured, not just asserted — QUICKREF byte count before/after recorded above. No application code was touched in this phase (docs + `.claude/` config only), so `npm run test`/`lint`/`build`/`validate:content` are unaffected by construction; confirmed via `git status` showing only doc/config files changed.

---

# Phase 47 — Professional Teacher Interface

**Goal:** one type scale, one card, one page header, one container width — a professional web app inside the existing navy/gold/parchment palette.

**Isolation strategy (load-bearing).** Teacher screens get a scope class `.c-app`, and — wherever cheap — stop emitting the shared gameplay class entirely rather than overriding it. `.completion-shell` and `.review-shell` are removed from teacher markup and replaced with `.c-page`. That deletes the conflict at the source instead of layering specificity on it.

| Selector | Verdict |
|---|---|
| `.completion-shell`, `.review-shell` | Don't touch. Stop emitting from teacher screens. Both are visual-regression baselines. |
| `.kicker`, `.btn*`, `.text-button`, `.back-link`, `.shell`, `.feedback`, `.unit-tab`, `.choice` | Fork via `.c-app` prefix only — additive overrides, never edits. |
| `.c-*` (global.css 182–511) | Free to extend — zero gameplay consumers. |
| `.manage-content-*`, `.source-pool-*`, `.case-kind-badge`, `.roster-table`, `.auth-shell`, `.manual-grade-entry` | Free to edit in place — teacher-only, zero baselines. |

There are zero teacher-screen visual baselines, so all 20 gameplay PNGs must stay byte-identical through Phase 47. That is the primary regression gate.

**Type scale — 7 tokens, one addition.** Keep the existing 6; add `--c-text-micro: 0.68rem`. Card/`h3` titles are `--c-text-body` at `700 var(--c-font-label)`, so no `--c-text-lead` is needed.

| Current cluster | → Token |
|---|---|
| 0.58 / 0.62 / 0.65 / 0.67 | `--c-text-micro` (0.68rem) |
| 0.68 / 0.70 / 0.72 / 0.75 / 0.76 | `--c-text-label` (0.72rem) |
| 0.78 / 0.80 / 0.82 / 0.85 / 0.87 / 0.88 / 0.90 | `--c-text-meta` (0.85rem) |
| 0.95 / 1.0 / 1.05 | `--c-text-body` (1rem) |
| 1.1 / 1.15 / 1.2 | `--c-text-section` (1.2rem) |
| `clamp(3rem,5vw,5.2rem)` | deleted from the teacher path — comes from `.completion-shell h1`, fixed by not emitting that class |
| bare `<h2>/<h3>/<h4>` UA defaults | fixed by a scoped element reset (`.c-app h1..h4, .c-app p, .c-app li`) — safe only because it's scoped |

### Sub-phases (not started)

- **47A** — Scope + type reset. Add `.c-app` block + `--c-text-micro` token; retune font sizes in `.manage-content-*`/`.source-pool-*`/`.case-*` bands; add `c-app` to teacher `<main>` class lists. Verify: visual-regression zero-diff.
- **47B** — Dashboard shell swap. `teacherDashboardScreen()`, `teacherUnitsTabMarkup()`, `teacherUnitAccessMarkup()`: `.completion-shell` → `.c-page`, h1 block → `pageHeaderMarkup()`, bare `<h2>` → `sectionHeadMarkup()`. Kills the 7× headline jump and the 820px container.
- **47C** — Mission card + one badge. `margin-top: 8px` → `auto` on `.manage-content-mission-card .btn`. `caseKindLabel()` returns short labels only; new `caseKindDetail()` renders the qualifier as secondary text. Replace `.case-kind-badge` with `chip()`.
- **47D** — One container, one header. `.c-page` at `--c-width-content` (1180px) is the only teacher container — do not introduce `.c-page--wide` (1480px) anywhere. `pageHeaderMarkup()` on all four entry points.
- **47E** — Forms + helper signature upgrades. `fieldMarkup()` needs `{placeholder, attrs, autocomplete, control, select}`; `pageHeaderMarkup()` needs a falsy-eyebrow guard plus `titleTag`/`backAction`; `btn()` needs `labelHtml`/`href`. Then convert `loginScreen()`, `joinScreen()`, `teacherClassroomsTabMarkup()`, `gradingScreen()`. Input `id`s must be preserved exactly (read by `getElementById`).
- **47F** — Sources tab consolidation onto the Units tab's native `<details>/<summary>` pattern.
- **47G** — Surface + dead-CSS sweep: fold four near-identical card surfaces onto `.c-card`/`.c-card--interactive`.

**Verification per sub-phase:** `npm run test:e2e -- visual-regression` zero-diff on all 20 gameplay baselines, `npm run test` 454/454, `lint`/`build` unchanged, plus a live pass at 1366×768 (the project's named Chromebook target). Add a teacher-screen smoke e2e spec so the next pass isn't hand-verified either.

*`.legend-locked` (emitted with no CSS rule) is fixed in Phase 48, not 47 — it's a gameplay selector inside `archiveScreen()` whose baseline 48 re-records anyway.*

---

# Phase 48 — The Full Mission Board

**Goal:** the Navigation Table shows all three missions per period, locked ones greyed out and explained, available as standard and changed only when a teacher edits that mission.

The rendering already supports this: `caseMarker()` computes `complete`/`available`/`locked`, `.route-marker--locked` exists, `declutterMarkerPositions()` already fans out overlapping markers, and every hidden case has a real `mapPosition`. **But unhiding alone would ship three bugs**, which is the real content of this phase:

1. `travelScreen()`'s timeout is `currentScreen = c?.route || "archive"` — an Archive-Challenge mission warps and dumps the student back on the Navigation Table.
2. `archiveChallengesScreen()` renders every case's challenge for the selected unit, and `goToCase()` never sets `selectedUnitId` — so traveling to case-005 lands on a page listing case-002…case-006.
3. `caseMarker()` puts `disabled` on locked markers, which kills `select-case` — a student can't even read what a locked mission is.

### Sub-phases (not started)

- **48A** — Unhide + route enum. Replace `CASE_ROUTES` with `["field", "archive-challenges"]` (naming the route after the screen id it dispatches to). Delete `navigationTableVisible: false` at the 5 content sites. Delete the visibility filter. Fix `goToCase()` to set `selectedUnitId`; order `archiveChallengesScreen()`'s cards so the traveled-to case is first. **Ships the headline requirement on its own.**
- **48B** — Route panel + locked affordance. Per-type CTA ("Initiate Chronotravel →" vs "Open Archive Challenge →"), keeping the warp for both. Drop `disabled` from locked markers (keep grey styling + `aria-disabled`); add an unlock-reason line to the Chronotravel button. Add the missing `.legend-locked` rule.
- **48C** — Teacher per-mission visibility toggle. Delete `navigationTableVisible` rather than repurposing it (global default vs. per-classroom opt-out are different layers). Use the existing `teacher-override-repository.js` generic `(contentId, fieldName, value)` store — no new table/schema.
- **48D** — Unit 3's third mission. Promote the existing unit-level bonus challenge (`unit-03-archive-appeal-form-comparison`, already authored and validated) to `case-009` with real case-level framing, rather than authoring new content from scratch. Fallback: ship Unit 3 with two markers and author case-009 separately if the quest is judged unsuitable standalone.

**Verification:** four e2e assertions in `tests/e2e/archive-challenge.spec.js` assert `toHaveCount(0)` for the hidden markers — invert, don't delete. Re-record the navigation-table visual baseline and manually inspect the Philadelphia marker cluster (case-007/case-008 share identical coordinates — the exact collision case `declutterMarkerPositions()` was written for and has never actually exercised).

---

# Phase 49 — Chronicle: highest-ROI moves as an APUSH game (not started)

**Research grounding:** the 2026 APUSH exam is fully digital in Bluebook with identical content/timing/rubrics to the paper exam — MCQ 40% / SAQ 20% / DBQ 25% / LEQ 15%; DBQ 7 points, LEQ 6, SAQ 3×1 ([College Board](https://apcentral.collegeboard.org/courses/ap-united-states-history/exam), [exam guide](https://apushscorecalculator.us/apush-exam-guide)). Spaced repetition carries a meta-analytic effect of d ≈ 0.78 across 21,415 learners, distributed-over-massed practice d ≈ 0.60 ([systematic review](https://asmepublications.onlinelibrary.wiley.com/doi/10.1111/tct.70353), [summary](https://www.justinmath.com/cognitive-science-of-learning-spaced-repetition/)).

Ranked by exam weight ÷ build cost:

- **49A** — A real SAQ quest type. 20% of the exam, 30 raw points, no quest type exists today. The rubric and evaluator wiring already exist.
- **49B** — Skill mastery, surfaced to the student. `SKILL_CATEGORIES` is real but tagged on evidence-organizing quests only — extend across all types, record per-attempt outcomes, add a mastery record screen.
- **49C** — "The Archive Rotation": a spaced-repetition daily loop reusing the existing MCQ/sequencing/HIPP pool as its item bank. Must respect the standing rule that progression never confers a graded-assessment advantage.
- **49D** — CED alignment tagging (Period/Key Concept/Theme/Historical Thinking Skill) surfaced on the teacher dashboard.
- **49E** — The DBQ capstone ("Chronicle Dossier"). 25% of the exam, biggest build, strongest pedagogy fit — scope after 49A proves the written-response pipeline end to end.

**Ongoing track:** Chronicle covers Periods 1–3 of 9; content velocity, not architecture, is the constraint.

---

# Phase 50 — Odysso: highest-ROI moves as a learning platform (not started)

**Research grounding:** SSO (Google/Microsoft), rostering (Clever/ClassLink), and LMS push (Google Classroom/Canvas/Schoology) are described as non-negotiable at K-12 scale ([EdTech Insiders](https://edtechinsiders.substack.com/p/the-new-era-of-k12-rostering-what), [Clever](https://www.clever.com/blog/2022/07/google-classroom-rostering)).

- **50A** — Turn on Google sign-in for teachers. Code already exists (`remote-auth-repository.js`) but no Google provider is configured in any Supabase project — close to free.
- **50B** — Kill the manual roster via Google Classroom import.
- **50C** — One identity across Odysso and Chronicle: point Odysso's placeholder sign-in at the same Supabase project.
- **50D** — Assignments with due dates + class outcome reporting.
- **50E** — Second-subject proof: a written go/no-go decision, not a `packs/` build — no forcing function exists yet per `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §10.

**Verification:** the claim/login/provision/reissue/evaluate/grade round trip and RLS cross-tenant isolation — outstanding since Phase 22, still the largest untested surface in the product.

---

## Program-level verification

Before every commit: `npm run test` (454 baseline), `npm run lint` and `npm run build` unchanged from baseline, `npm run validate:content` when content changed, `npm run test:e2e` including the 20 visual baselines at 1366×768, and a live pass on the specific interaction changed. Push to `main` after verification (standing permission; Vercel auto-deploys).
