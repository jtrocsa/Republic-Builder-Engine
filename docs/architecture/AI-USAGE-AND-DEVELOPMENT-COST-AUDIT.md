# AI Usage and Development-Cost Audit

**Status:** Point-in-time audit, 2026-07-23. Research and documentation only — no application code, dependencies, migrations, or `CLAUDE.md` edits were made in producing this document. Figures below are counts verified directly against the repository during this pass (line counts, file counts, commit stats); relative-cost ratings are qualitative judgments, not measured token/dollar totals, since no such measurements exist in this repo.

**Scope note:** this is a workflow-cost audit, not a code-quality audit. It does not evaluate whether Chronicle's architecture or content is good — only where the *process* of working on it in Claude Code burns more usage than the reliability payoff justifies.

## 1. Executive summary

Three concrete patterns account for most avoidable cost in Chronicle's current Claude Code workflow:

1. **Context-loading has crept past its own stated boundary.** `ARCHITECTURE-QUICKREF.md` is meant to be the short "read this first" document, but 93 of its 170 lines are now a dense phase-by-phase changelog covering all 27 development phases (several individual entries running 400–900+ words). Reading it "first," as instructed, now means reading nearly the whole project history. Combined with the other architecture docs (~1,618 lines), the two existing session reports (~170 lines), 31 decision-log entries (~80–90 lines each, often chaining through 2–3 prior entries), and an 8,000-line `main.js`, a routine task can pull in several thousand lines of required reading before any code is touched.
2. **Browser verification is 100% manual and never made permanent.** Playwright is an installed dependency with zero committed test artifacts (no config, no `tests/e2e/`), yet `docs/architecture/PLAYWRIGHT-ADOPTION-PLAN.md` documents at least 20 ad hoc manual passes across the project's history, which caught 5+ real bugs. Every one of those passes was re-derived by hand, from scratch, in its own session — genuinely valuable coverage, repeatedly re-paid for instead of banked once.
3. **Audit and roadmap documentation has proliferated rapidly and self-referentially.** Six stand-alone documents (`FOCUSED-UI-AND-MECHANICS-REUSE-AUDIT.md`, `TEACHER-UI-ACCESSIBILITY-AUDIT.md`, `WORKFLOW-STATE-AUDIT.md`, `AUTHORING-SYSTEMS-AUDIT.md`, `PLAYWRIGHT-ADOPTION-PLAN.md`, `FOCUSED-MODERNIZATION-ROADMAP.md`) were created on the same day this audit was requested, cross-referencing one another and repeating heavy per-item templated structure (the roadmap alone carries 10 items × ~10 metadata fields each). This is a live instance of the exact waste category this audit was commissioned to find — discovered while gathering evidence for it, not hypothesized.

None of this reflects unreliable work — the underlying engineering (subagent scoping, deterministic `validate:content`, single-pass Vitest, textual guardrails in `CLAUDE.md`) is generally sound. The waste is concentrated in *process overhead around* that work: what gets read before starting, what gets manually re-verified instead of banked, and how much gets written down per pass.

## 2. Highest-cost current workflows

- **Full architecture-doc reads before routine tasks.** `ARCHITECTURE-QUICKREF.md` alone now functions as a full changelog; reading it as directed ("read this first") already costs more than a boundary document should.
- **Full `main.js` reads.** At 7,981 lines / ~193 KB, even a "let me get oriented" read is expensive relative to grepping for the one function or screen actually in scope.
- **Ad hoc Playwright passes.** 20+ manual browser-verification passes across ~27 phases, none committed, each re-derived from a mental model of the flow rather than a saved script.
- **Large multi-system autonomous phases.** Phase 22 (accounts/classrooms/submissions/evaluation/content-overrides — 5 repositories, 5 API endpoints, new screens, auth flows, all in one pass) and the 2026-07-11 overnight run (4 new quest types + 2 mini-games + 6 subagents in one unattended session, which also grew reactively mid-run when code review flagged a second gap needing its own Playwright harness).
- **Repeated generation of heavily templated audit/roadmap docs.** Six such documents in a single day, each independently re-deriving and re-stating context the others already captured.

## 3. Low-cost workflows already working well

- **npm scripts are already narrow and deterministic**: `lint` (ESLint flat config), `format`/`format:check` (Prettier), `validate:content` (plain Node + Zod, scoped to exactly the 2 live content files plus 2 cross-reference checks), `test` (single-pass `vitest run`, CI-compatible). None of these need an LLM in the loop at all — they're already the cheap, deterministic path the audit is meant to protect.
- **Subagent scoping is mostly non-overlapping and includes an explicit hand-off**: `content-designer` and `map-implementer` each state when to defer to the other rather than both claiming the same content-vs-map territory.
- **Cheaper models already used where appropriate**: `content-validator` and `doc-sync` run on `haiku`, not `sonnet` — the two agents whose jobs are closest to "run a command and report plainly" are already on the cheap model.
- **`code-reviewer` is commit-gated, not per-diff** — its own description scopes it to "before any commit touching `main.js`, `repositories/`, or `quest-types/`," not every change.
- **`CLAUDE.md`'s textual guardrails already prevent some scope creep**: the explicit deferred-systems list (Founder Paths, professions, wardrobes), "don't extract movement/collision/camera code for architectural neatness," and "preserve the working game" all head off categories of unnecessary rework before they start.

## 4. Waste patterns

| Pattern | Evidence |
|---|---|
| QUICKREF read as a full changelog | 93 of 170 lines are a dense multi-phase narrative; the doc itself admits its own figures go stale between phases |
| `main.js` read in full for orientation | 7,981 lines / ~193 KB; most tasks need one function or screen, not the whole file |
| Playwright re-derived by hand every time | 20+ ad hoc passes, zero committed `.spec` files, zero `playwright.config.*` |
| Audit-doc proliferation | 6 new stand-alone docs created in one day, heavily cross-referenced, ~10-field templated boilerplate per roadmap item |
| Large multi-system autonomous phases | Phase 22 (5 systems at once); 2026-07-11 overnight run (4 quest types + 2 mini-games + 6 subagents, scope grew reactively mid-run) |
| Whole-file rewrites | `9a04857` rewrites `global.css` (+8,143/-8,003) inside a 120-file commit; `933aa04` "main.js cleanup" touches nearly every line (+3,298/-3,328) for a verbatim mechanical extraction |
| Stale doc figures forcing re-derivation | QUICKREF cites "7,677 lines as of Phase 27" vs. actual 7,981; `docs/development/UNIT-TESTING.md` cites "179 tests / 15 files" vs. actual 29 files / 4,610 lines — each stale figure either gets silently trusted (risk) or triggers a fresh grep/read to confirm (cost) |
| Decision-log narrative chaining | ~80–90 lines per entry, several explicitly re-read 2–3 prior entries before writing (e.g., decision-log 0031 states it re-read 0029 and 0030 first) |
| Session-report duplication | Only 2 exist across 27+ phases, and both nearly 1:1 duplicate their corresponding QUICKREF phase bullet — the same information maintained in two places for the only two phases that bothered |

## 5. Testing-cost analysis

The deterministic layer here is already well-designed: `validate:content` is scoped to exactly 2 files plus 2 cross-reference checks and runs outside any LLM; `vitest run` is single-pass and CI-compatible (29 files / 4,610 lines, covering quest types, mini-games, repositories, engine utilities). Neither needs to change.

The gap is entirely on the browser-verification side: because no Playwright suite is committed, **100% of interactive/visual verification cost is paid fresh, in-session, by an agent re-deriving the flow from memory of the code** — even for flows that have already been manually verified 5, 10, or 20 times across the project's history.

**Recommended staged sequence** (cheapest first, escalate only as needed):
1. Targeted `vitest` invocation scoped to the changed file/pattern (e.g. `vitest run tests/unit/quest-type-source-analysis.test.js`, not bare `vitest run`).
2. The affected test group (e.g. all `quest-types/*.test.js` if a shared contract changed).
3. `validate:content` only if content files changed — it's cheap enough that "only if relevant" is really the only gate needed.
4. `lint`/`build`/full `vitest run` only at milestone boundaries or when the change touches genuinely shared infrastructure (a screen-routing guard, a repository facade, a quest-type contract all four types implement).
5. A full manual browser journey only at milestone boundaries; a single targeted browser check (the one interaction actually changed) otherwise.

## 6. Subagent-cost analysis

| Agent | Model | Assessment |
|---|---|---|
| content-designer | sonnet | Correctly scoped to content files only; explicit hand-off to map-implementer for maps |
| map-implementer | sonnet | Correctly scoped to map/collision arrays only; explicit hand-off to content-designer |
| content-validator | haiku | Appropriately cheap model for a "run a command, report plainly" job |
| test-writer | sonnet | Reasonable scope (Vitest only, never touches engine behavior); ends by self-invoking a full test run as self-check |
| code-reviewer | sonnet | Read-only, correctly commit-gated rather than per-diff |
| doc-sync | haiku | Appropriately cheap model; scope (CLAUDE.md/UNIT-TESTING.md/decision-log numbering) is narrow and low-risk |

**Findings:**
- No evidence of unnecessary multi-agent fan-out for routine work — the one clear example of heavy subagent use (the 2026-07-11 overnight run using 6 subagents) matches a genuinely large, owner-authorized scope, not a routine task.
- `test-writer` and `content-validator` both end their runs by self-invoking a full command (`npm run test` / `npm run validate:content`) as their own self-check. This is redundant if the orchestrating session then re-runs the identical full command immediately afterward as part of its own verification — the check should be trusted once, not paid for twice.
- The haiku-for-cheap-agents pattern (content-validator, doc-sync) is worth extending to any future agent whose job is fundamentally "run a deterministic command and summarize the result" rather than "make a judgment call."

**Activation rules:**
- Use `content-designer`/`map-implementer` only when new content/maps are genuinely being authored — not for reading or reviewing existing content.
- Use `content-validator`/`test-writer` after content or logic changes, but trust their self-check instead of re-running the same command again immediately after.
- Use `code-reviewer` before commits touching `main.js`, `repositories/`, or `quest-types/` — not for every commit, and not with an "eight-angle" multi-pass review for a small, narrowly-scoped change (reserve multi-pass/parallel review for milestone-boundary or cross-cutting changes).
- Use `doc-sync` at the end of a work session, not mid-session per edit.
- Don't invoke all 6 agents in one pass unless the task is genuinely Phase-22/overnight-run scale (multi-system, owner-authorized, milestone-boundary).

## 7. Documentation-cost overhead

| Documentation type | Recommended cadence |
|---|---|
| Session report (`docs/architecture/session-reports/`) | Only at genuine milestone boundaries with a new architectural decision not already captured elsewhere — not for routine phases. Both existing reports nearly duplicate their QUICKREF bullet; that duplication is the failure mode to avoid going forward. |
| Decision log (`docs/decision-log/`) | Keep for real, load-bearing decisions (this is working as intended) — but favor short, terse pointers to prior entries over full re-narration of context already on record. |
| `ARCHITECTURE-QUICKREF.md` update | Required every phase boundary, but as a one-line index entry (number, title, pointer), not a paragraph. |
| Stand-alone audit/roadmap docs | Consolidate into one living roadmap document, updated in place, rather than a new file per pass. Today's 6-document cluster — each cross-referencing the others, each restating findings the others already contain — is the concrete example to not repeat. |
| Migration docs | Required for schema/migration changes (unchanged — this protects real architectural decisions and should not be cut). |

This audit does not recommend reducing documentation that protects architectural decisions (decision logs, migration docs) — the overhead identified is specifically in *changelog-shaped* and *audit-shaped* writing that restates already-known information rather than recording a new decision.

## 8. Context-loading recommendations

**Minimal required reading by task type:**

| Task type | Minimum reading |
|---|---|
| Small bug fix | `CLAUDE.md` + grep for the specific function/screen; no architecture docs |
| UI change | `CLAUDE.md` + grep the relevant screen-builder function in `main.js`; skip a full-file read |
| Content addition | `CLAUDE.md` + the relevant unit-content file + its Zod schema; skip `main.js` entirely if the change is pure content |
| Repository change | `CLAUDE.md` + the specific file in `repositories/` + its facade/caller |
| Schema change | `CLAUDE.md` + `apps/web/src/content/schemas/` + `docs/content/CONTENT-VALIDATION.md` |
| Migration | `CLAUDE.md` + the latest `supabase/migrations/*.sql` + the relevant session report if one exists for that system |
| Accessibility improvement | `CLAUDE.md` + the specific screen/element in question; no broad architecture read |
| Browser-only regression | `CLAUDE.md` + the specific interaction's code path; a targeted browser check, not a full journey |
| Architecture audit | `ARCHITECTURE-QUICKREF.md` (once trimmed) + `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` only, unless the task explicitly names other docs |

**Additional recommendations:**
- Use targeted `grep`/`glob` for a specific function or screen before reading a large file (`main.js`, a long doc) in full.
- Treat a stale-looking figure (a line count, a test count) as something to verify with one targeted `grep`/`wc`-equivalent, not as license to either blindly trust it or re-read the entire file to double-check.
- Once trimmed (see §13), `ARCHITECTURE-QUICKREF.md` should be the actual default context boundary — the one doc read by default, with everything else read only when cited by name in the task.

## 9. Prompt templates

Each template states the minimum files to read before acting; anything not listed should only be opened if the task turns out to need it.

**Small bug fix**
> Fix: [behavior]. Read `CLAUDE.md` and grep for [function/symbol]. Don't read architecture docs or `main.js` in full. Verify with the narrowest relevant test; browser-check only if the bug is visual/interactive.

**UI change**
> Change: [screen/element]. Read `CLAUDE.md` and the specific screen-builder function via grep. Don't read `main.js` end-to-end. Browser-check the specific interaction changed, not a full journey.

**Content addition**
> Add: [content]. Read `CLAUDE.md`, the target unit-content file, and its Zod schema. Skip `main.js` unless the content requires new rendering logic. Run `validate:content` after.

**Repository change**
> Change: [repository/facade]. Read `CLAUDE.md` and the specific file plus its direct caller in `main.js`. Run the targeted test file for that repository.

**Schema change**
> Change: [schema]. Read `CLAUDE.md`, `apps/web/src/content/schemas/`, and `docs/content/CONTENT-VALIDATION.md`. Run `validate:content` (always — it's cheap).

**Migration**
> Add migration: [purpose]. Read `CLAUDE.md`, the latest existing migration file for pattern, and any session report for the system being changed. Owner review before applying (migrations are not auto-applied).

**Accessibility improvement**
> Improve: [element/flow] for [assistive need]. Read `CLAUDE.md` and the specific element's markup/handler. No architecture-doc read required unless the gap is structural.

**Browser-only regression**
> Regression: [symptom]. Read `CLAUDE.md` and grep the specific interaction's code path first. Only open Playwright/manual browser verification if static reading doesn't resolve it — don't start with an exploratory walkthrough.

**Architecture audit**
> Audit: [system/question]. Read `ARCHITECTURE-QUICKREF.md` (trimmed) and `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` first. Open other architecture docs only if the audit's question specifically requires them — don't read the full architecture-doc set by default.

## 10. New default development workflow

1. Read `CLAUDE.md` + trimmed `ARCHITECTURE-QUICKREF.md` only.
2. Grep/glob for the specific target (function, screen, content file) rather than reading broadly.
3. Make the smallest targeted edit that satisfies the task.
4. Run the narrowest relevant Vitest invocation (single file or pattern).
5. Run `validate:content` only if content changed.
6. Run `lint`/`build`/full `vitest run` only if the change is broad or touches shared infrastructure, or at a milestone boundary.
7. Browser-check only the specific changed interaction, not a full player journey, unless at a milestone boundary.
8. Commit and push per the existing standing `main`-push permission, once verification is done.
9. Update `ARCHITECTURE-QUICKREF.md`'s index with one line only if a real phase boundary was crossed; skip writing a session report unless the phase is a genuine milestone with a new decision.

## 11. Exceptions requiring deeper verification

- **Movement/collision/camera/NPC-patrol code** — explicitly named in `CLAUDE.md` as the most regression-prone area in the codebase. Always browser-verify, regardless of how small the change looks.
- **`previewSession`/write-guard logic** — protects real student/teacher data from teacher-preview writes leaking through; always re-verify against the specific documented no-write scenario before/after any change nearby.
- **Schema/migration changes** — always run a full `validate:content` pass; it's cheap and deterministic regardless of change size, so there's no cost reason to skip it.
- **Milestone-boundary phases** — justify a full test suite, full lint/build, and a full manual browser journey; this is the one category where the more expensive verification is worth its cost.

## 12. Estimated relative savings

No token/dollar measurements exist in this repository, so savings are stated qualitatively, relative to current practice:

| Change | Relative savings | Effort | Risk |
|---|---|---|---|
| Trim QUICKREF to a true index | High — paid on every future task | Low | Low |
| Consolidate audit/roadmap docs into one living document | High — removes a currently-active, self-compounding cost | Low | Low |
| Commit the Playwright suite | High over time — removes 20+ recurring ad hoc passes | Medium (test-infra code) | Low |
| Narrow subagent self-check redundancy | Moderate | Low | Low |
| Staged test sequencing (targeted-first) | Moderate-high | Low | Low, if exceptions (§11) are honored |
| Bound autonomous-run scope by default | Moderate-high | Low | Low-moderate |

## 13. Immediate changes requiring no code

- Trim `ARCHITECTURE-QUICKREF.md`'s 93-line phase-history block to a one-line-per-phase index with pointers to decision-log/session-report entries for detail.
- Add a "minimum required reading by task type" section to `CLAUDE.md` (§8/§9 above).
- Stop creating new stand-alone audit/roadmap documents per pass; consolidate future findings into one living roadmap document, updated in place.
- Stop re-running a full command immediately after a subagent has already self-checked the same command.
- Verify a stale-looking figure via one targeted grep/count rather than a full-file re-read.
- Reserve session-report writing for genuine milestone-boundary phases with a new decision, not every phase.

## 14. Optional tooling changes

- **Commit the 11-scenario Playwright suite** already scoped in `docs/architecture/PLAYWRIGHT-ADOPTION-PLAN.md` (boot/onboarding, hub movement, Archive Room entry/exit, one field flow, one Investigation Challenge, one Archive Challenge, one Practice Check covering all 4 quest types, local-save persistence, preview-as-student no-write guard, one teacher content-edit flow, one legacy-save fallback). This converts a recurring manual cost into a one-time investment. Per that plan's own verdict, this needs owner sign-off before writing (it's real new test infrastructure, even though it touches no shipped code).
- **A tiny deterministic script** to auto-stamp `main.js`'s current line count and Vitest's current test/file count into `ARCHITECTURE-QUICKREF.md` and `docs/development/UNIT-TESTING.md`, removing the recurring "doc says X, reality says Y" verification cost at its source rather than relying on manual updates that lag behind reality.

## 15. Final policy

The following is a proposed addition for `CLAUDE.md` — **not applied to `CLAUDE.md` in this pass**, per the no-implementation constraint on this audit. The owner can add it directly if it looks right as written.

```
## AI usage and cost discipline

- Read `docs/architecture/ARCHITECTURE-QUICKREF.md` first; do not read other architecture docs, decision logs, or session reports unless the task specifically needs them.
- Use targeted grep/glob for a specific function or screen before reading large files (main.js, long docs) in full.
- Do not run exploratory Playwright by default; use it only for a genuinely unresolved failure, not routine verification of an already-covered flow.
- Run the narrowest relevant test (single file/pattern) before the affected group, before the full suite; reserve full-suite/full-build/full-browser-journey runs for milestone or shared-infrastructure boundaries.
- Do not invoke every subagent for routine work; match subagent scope to task scope, and don't re-run a full command an agent already self-checked.
- Do not create a session report for every small fix; reserve them for milestone-boundary phases with a genuinely new decision not already in the decision log.
- Do not rewrite unaffected files; prefer surgical edits at stable insertion points over full-file passes.
- Do not re-audit or re-verify settled dependencies/decisions already recorded in the decision log or QUICKREF.
- Ask before starting a broad autonomous run spanning more than one screen-family/repository/schema-family/migration.
- Report the exact commands run for verification, and state briefly why any full-suite/full-browser check was necessary when one is run.
```

## Required decision table

| Workflow | Current pattern | Relative credit cost | Reliability value | Waste risk | Recommended replacement | Expected savings | Risk |
|---|---|---:|---:|---:|---|---:|---:|
| Architecture-doc reading | Read QUICKREF + related docs near-fully each task | High | Moderate | High | Trim QUICKREF to true index; read only cited docs | High | Low |
| main.js reading | Full-file reads to "get oriented" | High | Low-Moderate | High | Targeted grep/glob for the function/screen in question | High | Low |
| Playwright verification | 20+ ad hoc manual passes, never committed | High | High (caught 5+ real bugs) | Moderate | Commit the 11-scenario suite from PLAYWRIGHT-ADOPTION-PLAN.md | High (long-run) | Low |
| Full unit-test runs | `vitest run` already single-pass/cheap | Low | High | Low | Prefer targeted file/pattern first, full run at milestones | Moderate | Low |
| Content validation | `validate:content`, 2-file deterministic Zod pass | Low | High | Low | Keep as-is | — | — |
| Subagent self-checks | test-writer/content-validator self-invoke full command | Moderate | Moderate | Moderate | Orchestrator trusts agent's self-check, doesn't rerun | Moderate | Low |
| Session-report writing | Written for 2/27+ phases, ~1:1 duplicates QUICKREF | Moderate | Low (duplicated) | High | Reserve for genuine milestone/new-decision phases only | Moderate | Low |
| Decision-log entries | ~80-90 lines, chains 2-3 prior logs for context | Moderate | High (real decisions) | Low-Moderate | Keep, but favor terse pointers over re-narration | Low-Moderate | Low |
| Audit/roadmap doc creation | 6 new stand-alone docs in one day, heavy templating | Very High | Moderate | Very High | Consolidate into one living roadmap, update in place | High | Low |
| Large multi-system autonomous phases | Phase 22 (5 systems), 2026-07-11 overnight (4 quest types + 2 mini-games + 6 agents) | Very High | High when scoped well | Moderate-High | Bound default scope to one screen-family/repo/schema-family/migration; require sign-off to exceed | Moderate | Low-Moderate |
| Whole-file rewrites | global.css full rewrite, main.js mechanical extraction touching every line | Moderate-High | Low (as a category) | High | Surgical edits at stable insertion points; only extract with a proven forcing function | Moderate | Low |
| Stale doc figures | QUICKREF/UNIT-TESTING.md counts stale vs. actual | Low-Moderate | Low | Moderate | Verify via targeted grep/wc instead of trusting or re-reading whole file | Moderate | Low |

## Required priority list

Ranked by expected impact, most valuable first.

1. **Trim `ARCHITECTURE-QUICKREF.md`'s 93-line phase-log to a true compact index.**
   Savings: Very high (paid every task). Reliability: unchanged/improved. Effort: Low. Code change: No. Instructions-only: Yes. Owner approval: No.
2. **Add a "minimum required reading by task type" section to `CLAUDE.md`.**
   Savings: High. Reliability: unchanged. Effort: Low. Code: No. Instructions-only: Yes. Approval: No.
3. **Stop creating new stand-alone audit/roadmap docs per pass; consolidate into one living roadmap.**
   Savings: High. Reliability: unchanged. Effort: Low. Code: No. Instructions-only: Yes. Approval: Recommended (documentation-practice change, low-stakes).
4. **Commit the 11-scenario Playwright suite already scoped in `PLAYWRIGHT-ADOPTION-PLAN.md`.**
   Savings: High over time. Reliability: improved. Effort: Medium. Code: Yes (test infra only). Instructions-only: No. Approval: Recommended.
5. **Stop redundant full-command reruns after a subagent already self-checked.**
   Savings: Moderate. Reliability: unchanged. Effort: Low. Code: No. Instructions-only: Yes. Approval: No.
6. **Default to targeted test/grep before full suite; full suite only at milestone boundaries.**
   Savings: Moderate-high. Reliability: unchanged if exceptions honored. Effort: Low. Code: No. Instructions-only: Yes. Approval: No.
7. **Reserve session-reports for genuine milestone/new-decision phases only.**
   Savings: Moderate. Reliability: unchanged. Effort: Low. Code: No. Instructions-only: Yes. Approval: No.
8. **Verify stale doc figures via targeted grep/wc, not full-file reads.**
   Savings: Moderate. Reliability: improved. Effort: Low. Code: No. Instructions-only: Yes. Approval: No.
9. **Bound autonomous/overnight runs to one screen-family/repo/schema-family/migration by default.**
   Savings: Moderate-high. Reliability: improved. Effort: Low. Code: No. Instructions-only: Yes. Approval: Needed only to exceed the bound.
10. **Add a tiny deterministic script to auto-stamp main.js/test-count figures.**
    Savings: Moderate. Reliability: improved (removes staleness at the source). Effort: Low-medium. Code: Yes (small script). Instructions-only: No. Approval: No.

## First recommendation

**Trim `ARCHITECTURE-QUICKREF.md`'s phase-history narrative down to a compact index.** Currently 93 of its 170 lines are a dense, paragraph-form changelog of all 27 development phases — several entries running 400–900+ words each — which means reading the doc "first," exactly as instructed, already costs nearly as much as reading the project's full history. Replacing that block with one line per phase (phase number, one-line title, a pointer to the decision-log or session-report entry that holds the real detail) restores the document to its intended purpose as a genuine context boundary. This is the single highest-leverage change identified: it is paid on literally every future session that starts by reading `ARCHITECTURE-QUICKREF.md`, touches exactly one file, requires no code, and needs no owner sign-off beyond the doc edit itself.
