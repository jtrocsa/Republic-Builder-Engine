# Architecture Review and Simplification — Skeptical Pass

Status: review and planning only. No application code, dependencies, or files were changed. Reviewed against `docs/architecture/CURRENT-REPOSITORY-AUDIT.md`, `docs/architecture/THIRD-PARTY-TOOLING-AUDIT.md`, and `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md`, all read in full, plus one direct repository re-check (below) that overturned a specific claim in the proposal.

## 1. Overall verdict

The proposal is directionally correct and better-researched than most greenfield architecture documents — the domain boundaries are the right ones, the content-inheritance model is genuinely the simplest correct answer, and the Phaser/Tiled isolation discipline is real, not just stated. But it is **sized for a team, not for one developer**, and it commits real design effort to systems (PlatformCore identity/classrooms, World Composition's AI-generation pipeline, a 7-repository persistence layer) that have zero current user, zero current forcing function, and zero current pain. It also contains at least one factual overstatement about migration risk that a five-minute grep disproves (below). **Verdict: keep the domain vocabulary and the content-inheritance model as the long-term map; cut the near-term plan to roughly a third of what was proposed, and do not build anything beyond Progress/Content repositories, Vitest, and Zod until a second subject pack or a second real user actually exists.**

## Direct answers to the review questions

1. **Abstractions genuinely required now**: a thin wrapper around `chronicle-progress-store.js` (call it `ProgressRepository` or don't bother naming it), Zod schemas for the content that already exists, and `export` statements on the `main.js` functions worth unit-testing. That's it.
2. **Abstractions that can wait**: everything else — `PlatformCore` (Identity/Classroom/Enrollment), `WorldComposition` (blueprints/AI-generation/publishing), the `WorldRuntime` event-contract layer, the `ActivityRenderer` registry, `AuthRepository`/`ClassroomRepository`/`SubmissionRepository`/`WorldRepository`/`AssetRepository`.
3. **Proposed "packages" that should remain folders**: all of them — the original proposal never actually proposed separate npm packages/workspaces (good, already correct), but its _conceptual_ domain names (`QuestEngine`, `WorldRuntime`, etc.) should stay as informal folder/vocabulary groupings, not formalized into interface files, abstract base classes, or a DI container. Plain functions in plainly-named folders are enough at this scale.
4. **Models unnecessary in the first release**: `Organization`, `School`, `WorldBlueprint`, `GeneratedDraft`/`GenerationRequest`, `Template` (beyond "the course itself"), `MapTemplate`, `Skill`, `Item`, `Cosmetic`, `ClassroomAnalytics`/`StudentAnalytics`, `ManualGrade`/`TeacherFeedback` — all correctly marked "Deferred" in the original proposal's own tables, but still fully modeled in table form, which is itself the overbuild (see §3).
5. **Database concepts that can remain local**: literally all of them — no database exists, none should be stood up, `§9` of the proposal is already correctly scoped as "sketch, not implemented." No change needed there.
6. **Teacher-customization concepts that are premature**: the entire `TeacherWorld` → `PublicationVersion` → `Submission.publicationVersionId` versioning chain. What's _not_ premature: making the two currently-broken Author Mode fields (`main.js:1134-1136`) actually save somewhere (§9 below).
7. **World-composition concepts that should be delayed**: all of it, full stop, until a second subject pack is a real, funded, in-progress project rather than a hypothetical in a product-vision paragraph.
8. **Does the override model need simplification?** No — the field-level-override-plus-snapshot-at-publish design (original proposal §15) is already the simplest correct answer to the stated durability requirements. Don't touch the _model_; just don't build the machinery around it yet (§7 above).
9. **Does the runtime registry need simplification?** Yes — there is currently one runtime (DOM/CSS-transform rendering) and zero proven second adapters. A "registry" implies at least two things to switch between; build the interface when the Phaser POC actually produces a second adapter worth switching to, not before.
10. **Does the activity registry need simplification?** Yes, same reasoning — `main.js`'s existing `check-*` handler pattern already works and is what a solo developer can hold in their head; don't replace it with a registry indirection until Teacher Mode actually needs to render pack-declared activity types dynamically.
11. **Are stable IDs and versioning handled correctly?** Mostly, with one real gap: "Pack Version" is described as "git tag/commit today" with no concrete mechanism — that's hand-waved, not designed. Fix: a plain `version` string field in a pack manifest, bumped by hand, git history as provenance only — a five-minute decision the original document deferred without needing to.
12. **Does the architecture preserve the working game?** Yes, by explicit design (every phase's acceptance criteria require identical player-visible behavior) — this is a genuine strength, not a gap.
13. **Can migration phases be made smaller?** Yes, substantially — see §11 (revised sequence). The original Phase 3 ("extract all field/hub movement, collision, camera, and NPC-patrol logic from `main.js`") is one high-risk phase where it should be several independently-committable, independently-testable slices — or, better, not physically moved at all until Phaser actually replaces it (§3, §9 below).
14. **Are acceptance criteria measurable?** Mostly yes — "app plays identically," "lint passes," "`packs/chronicle/` imports nothing outside `content-registry`" are all genuinely checkable. One that isn't: Phase 6's "editing a Quest title actually persists and reflects in a published version" bundles three unproven systems (override model, publish pipeline, versioning) into one acceptance test — too coarse to tell you which part broke if it fails.
15. **Is the architecture still accidentally APUSH-specific anywhere?** Mostly no — the `structured-response` base type / SAQ-DBQ-LEQ-as-pack-extension split is genuinely neutral. One soft spot: the Evaluation Strategy narrative leans so heavily on `api/_lib/rubrics.js`'s existing APUSH rubric logic as the _only_ worked example that a future implementer could accidentally hard-code APUSH assumptions into the `hybrid` strategy's function signature itself rather than keeping it parametric over arbitrary rubric dimensions. Worth a one-line guardrail note, not a redesign.
16. **Does it accidentally force every subject to use maps?** No — `runtimeRequirements.exploration` is correctly optional in the pack manifest, and the second-subject test explicitly walks through a no-Phaser pack. This is handled correctly; no change needed.
17. **Is Phaser appropriately isolated?** Yes — confined to `experiments/` until proven, content/progress/quest ownership explicitly kept outside it, event-emission (not direct state mutation) specified. This is one of the proposal's strongest sections; preserve it as-is.
18. **Is Tiled appropriately isolated?** Yes, same reasoning — stable-ID anchor convention, explicit "Tiled never owns quest prompts/rubrics/etc." boundary. Preserve as-is. One nitpick: the normative language ("every interactive Tiled object carries...") reads more committed than a not-yet-proven tool warrants — soften to conditional phrasing until the POC succeeds (§6 below).
19. **Is Teacher Mode realistically scoped?** The _field list_ (text/prompts/sources/vocabulary/rubrics/due-dates/unlock/visibility/rewards) is realistic. The _machinery_ behind it (full `TeacherWorld`/`PublicationVersion` model) is not realistic for a first pass — see §6, §9.
20. **Can a second subject pack be added without copying Chronicle?** On paper, yes — the second-subject test (original §22) is a legitimate, specific walkthrough, not hand-waving. In practice, this can't actually be verified until Phase 4 (content unification) and Phase 6 (Teacher Mode) are done for real, which is exactly why "packs/chronicle/ imports nothing outside content-registry" as a literal grep-able check (already proposed) is the right verification — keep it, but don't treat the essay itself as proof.
21. **Tools to adopt immediately**: Vitest, Zod. (Unchanged from the tooling audit and the original proposal — both already got this right.)
22. **Tools requiring proof of concept**: Playwright (recommended, not blocking — downgraded from the original proposal's "hard gate before Phase 3," see §9), Phaser 4 + Tiled (real value, but no urgency — see §3), inkjs (see next answer).
23. **Tools that should be deferred**: Phaser 4 + Tiled, inkjs, and everything the tooling audit already put in consider-later/rejected. inkjs specifically deserves a harder look than the original proposal gave it: today's dialogue is **one static line per NPC with zero branching** — inkjs solves a problem (branching narrative) that doesn't exist as a concrete requirement yet. Defer its POC indefinitely until an actual quest design needs a branch, not speculatively.
24. **Tools that add more complexity than value right now**: Phaser + Tiled, ranked here rather than under "adopt now," precisely because their proof-of-concept cost (learning two new tools, building an isolated experiment, writing a POC-specific Playwright test) doesn't pay for itself until there's a second map or a real performance/maintainability complaint about the current hand-rolled terrain math — which the audit didn't find.
25. **Is the proposed Claude Code infrastructure realistic?** Yes, and it's the one part of the tooling audit that was already appropriately conservative — most new agents/skills were already marked "premature," and the ones marked "adopt now" (a hook running lint/validate-content, a migration-verifier checklist) are cheap and genuinely useful. No change recommended there.
26. **Can the plan reduce repeated repository scans and credit usage?** Not as currently structured — three long documents (this review makes four) is a lot for a future Claude Code session to load before making a one-line change. Concrete recommendation: add a short, living `docs/architecture/ARCHITECTURE-QUICKREF.md` (current phase, what's done, what's next, three sentences max per item) that a session reads _first_, falling back to the long documents only when it needs deep rationale. Not built here (out of scope for this review), but named as the single highest-leverage follow-up.

## 2. Strongest parts

- **Content inheritance model** (field-level `TeacherOverride` patches, resolved and snapshotted once at publish time into an immutable `PublicationVersion`). This is already the minimal design satisfying every stated durability requirement — full forks and naive copy-on-write were correctly rejected with real reasoning, not just listed as options.
- **Phaser/Tiled isolation discipline.** The proposal never lets Phaser own quest content, save state, or navigation, and the map-anchor stable-ID convention directly closes a real bug pattern the repository audit found three times in `main.js` (case-ID literals hard-coded into interaction-gating code). This is the proposal's best defense against repeating the project's own worst historical mistake.
- **The neutral-core / pack-extension split for activity types** (`structured-response` as the universal parent, SAQ/DBQ/LEQ as Chronicle-declared extensions). This is a genuinely elegant answer to "don't hard-code APUSH types into universal core," and it's specific enough to implement, not just asserted.
- **The second-subject test**, because it's a specific walkthrough with a specific pack manifest sketch, not a paragraph of hand-waving — and because it converts into a literal, checkable acceptance criterion (`grep` for stray imports) rather than staying an essay.
- **Grounding the tooling audit in verified, dated facts** (Phaser 4.1/"Salusa" and Phaser Editor v5 both confirmed shipped April 2026 via direct web search, not assumed from training data) — this matters because getting Phaser's version status wrong would have silently invalidated every downstream Phaser-related recommendation.
- **Tool rejections were evidence-based, not vibes-based.** Yarn Spinner was rejected specifically because its official JS/web runtime isn't shipped yet (verified), not because it's unpopular; H5P-as-core was rejected for a specific state-ownership conflict, not blanket dismissal. This addresses the review's own "rejecting useful tools without evidence" concern — it doesn't apply here.

## 3. Overbuilt areas

- **Seven top-level domains for a single-developer, single-user, single-pack codebase.** `PlatformCore`, `ContentRegistry`, `WorldComposition`, `QuestEngine`, `WorldRuntime`, a 7-interface `Repositories` layer, and `Packs` is a lot of new proper-noun vocabulary to hold in your head — and every one of them is a folder Claude Code has to be told about (or rediscover) before making almost any change. A request as small as "make Columbus's dialogue longer" today is a one-line edit; under the full proposed structure it risks becoming "which of seven domains owns this line" busywork.
- **Five fully-modeled data-model tables (Identity/Content/Composition/Student-State/Teacher-Operations, ~50+ rows) when most rows are marked "Deferred."** Documenting `Organization`/`School`/`WorldBlueprint`/`GeneratedDraft`/`MapTemplate` in full schema-table detail for concepts with zero current behavior is designing for a hypothetical future requirement — precisely what this project's own `CLAUDE.md` says not to do. A one-line mention ("will need an Organization/School model once a district-level customer exists — not designed yet") carries the same information at a fraction of the maintenance cost.
- **A 7-repository persistence layer when only one repository (`Progress`) wraps anything real.** `AuthRepository`, `ClassroomRepository`, `SubmissionRepository`, `WorldRepository`, and `AssetRepository` would all be interface-plus-mock-implementation scaffolding around concepts with no real behavior behind them yet — this is exactly the kind of "hard-to-debug indirection" and "duplicate systems" risk the review was asked to check for. Building five empty-shell repositories now means five more places a future "where does this actually happen" search has to look, for zero present payoff.
- **World Composition's AI-generation machinery** (`WorldBlueprint`, `GenerationRequest`, `GeneratedDraft`, `ContentOrigin`) is fully modeled around a product-vision _example prompt_ ("create a five-unit Spanish world..."), not a real, scheduled feature. This is the single clearest instance of designing for a hypothetical.
- **The original Phase 3 ("extract all field/hub movement, collision, camera, and NPC-patrol logic out of `main.js` into a `runtime/` domain") overstates both its necessity and, per the correction below, one of its siblings overstates its own risk.**

## 4. Missing areas

- **No fallback plan if the Phaser POC fails or is rejected.** The original document never says what happens to the runtime-extraction work if Phaser doesn't pan out — worth one explicit sentence: the existing hand-rolled movement/collision system is permanently fine to keep if Phaser isn't adopted; extracting it into testable modules is valuable independent of Phaser (see §7's simplified recommendation, which makes this moot by not extracting prematurely at all).
- **No update mechanism for the architecture documents themselves as phases complete.** Three (now four) long documents will silently go stale exactly the way `CLAUDE.md` itself was found to be stale in the original repository audit, unless something is done about it. See the `ARCHITECTURE-QUICKREF.md` recommendation (§1, review question 26).
- **No concrete pack-version mechanism**, just "git tag/commit today" — a real gap, small to fix (§1, review question 11).
- **No explicit statement that not every "Deferred" model needs to exist even at Phase 7** — the original document implies Phase 7 (PlatformCore skeleton) builds Identity/Classroom for real (even if mocked); this review recommends Phase 7 not happen at all until there's a concrete forcing function, which the original document didn't consider as an option (it only offered "now" vs. "deferred until Phase 7," not "deferred indefinitely until justified").

## 5. High-risk assumptions

- **That extracting movement/collision/camera code out of `main.js` is valuable on its own, independent of Phaser adoption.** It isn't, particularly — the code works today, has no test coverage either way, and the _safety_ benefit of testing it doesn't require physically moving it (§9). Treating extraction as a near-term phase assumes a payoff that doesn't actually exist yet.
- **That a 7-repository interface layer will be needed roughly as designed once a backend is chosen.** Plausible, but unverified — the shape of `AuthRepository`/`ClassroomRepository` will very likely depend on whatever auth provider gets picked (Supabase Auth vs. Firebase Auth vs. custom have meaningfully different session/token models), so designing their interface now risks getting it wrong and having to redesign anyway, for no benefit gained by designing early.
- **That the "structured-response" neutral base type will actually accommodate a genuinely different subject's assessment shape** (a chemistry lab report, a Spanish oral exam) without turning into an APUSH-shaped abstraction with extra parameters bolted on. This is asserted, not proven — the second-subject test is a good thought experiment but the real test is building the second pack, which hasn't happened.
- **That Phase 6's bundled acceptance criterion (override model + publish pipeline + versioning, all working together in one test) is achievable in one phase for one developer.** More likely this needs to be three separable milestones, tested independently, per §11.

## 6. Tooling concerns

- **The original proposal treats prototype-tier tool conventions (Tiled anchor rules, Ink-file dialogue format) with more normative confidence than an unproven tool warrants.** Section 13 of the proposal states "every interactive Tiled object carries exactly one of..." — correct in spirit, but should read as "if the Tiled POC succeeds, adopt this convention" rather than settled fact. This is the concrete instance of "treating prototype decisions as final decisions" the review was asked to check for. Fix: soften to conditional language, keep the design (it's good design), just don't let the phrasing outrun the evidence.
- **Playwright's positioning as a hard gate ("Phase 3 cannot begin without it") inherits urgency from a phase this review recommends cutting.** Once runtime extraction is deferred indefinitely (§9), Playwright becomes "valuable, adopt when convenient" rather than a blocking dependency — which actually makes it _more_ likely to get adopted soon, not less, since there's no large scary phase attached to it anymore.
- **inkjs was correctly evidenced as better than Yarn Spinner for this project (§1, review answer 23), but the original proposal didn't ask the more basic question: is a branching-dialogue library needed at all yet?** Today's dialogue is one line per NPC. This is a "solving a problem you don't have" risk, not a "wrong tool" risk.
- **No new concern with the tooling audit's own adopt-now/reject lists** — Vitest and Zod remain correctly minimal; the rejections (Yarn Spinner, H5P-core, Spine, LDtk, TexturePacker) remain well-evidenced and are reaffirmed here unchanged.

## 7. Simplifications

1. Collapse the seven proposed domains into effectively **two real folders for now**: `repositories/` (Progress + Content only) and everything else stays inside `main.js`/`content/` exactly where it already lives, just with `export` keywords added and Zod validation layered on top. `PlatformCore`, `WorldComposition`, `QuestEngine`, `WorldRuntime`, `packs/` remain **documented future direction in this proposal, not created as folders**, until something concrete needs them.
2. Trim every "Deferred" row in the original data-model tables down to a one-line mention in an appendix instead of a fully-specified table row — the information (that these concepts exist and roughly what they'd cover) is preserved; the maintenance burden of keeping detailed, unused schemas in sync with a changing mental model is not.
3. Do not build `AuthRepository`, `ClassroomRepository`, `SubmissionRepository`, `WorldRepository`, or `AssetRepository`. Name them in this document as known-future-work; build none of them until their first real caller exists.
4. Correct Phase 2's risk/complexity rating. Direct re-check of `main.js` (this review) found `readProgress` is called once (`:854`), `saveProgress` directly twice (`:858`, `:893`, inside the boot guard, before the `save` wrapper exists), and the `save` wrapper itself once (`:1128`) — every other mutation site calls the wrapper, not the store. **Wrapping the progress store behind a thin repository interface touches four lines, not "~60+ call sites."** Downgrade from Medium to Low complexity/risk.
5. Do not physically move field/hub movement, collision, camera, or NPC-patrol code out of `main.js` near-term. Add `export` to the specific functions worth unit-testing (collision math, badge logic) and test them in place. Only physically extract this code if/when a proven Phaser adapter is actually replacing it — extraction-for-its-own-sake is pure code-motion risk with no near-term functional payoff.
6. Defer the Phaser 4 + Tiled POC and the inkjs POC. Neither blocks any near-term value once #5 removes the artificial urgency. Revisit both only when a concrete need appears (a real second map, or a quest design that needs branching dialogue).
7. Shrink Teacher Mode's first real milestone to: make the two existing broken `data-copy` fields (`main.js:1134-1136`) actually persist somewhere real (even a flat local JSON blob keyed by field path — the `TeacherOverride` _shape_ from the original proposal is fine, just skip building `TeacherWorld`/`PublicationVersion`/`ClassroomPublication` around it until there's a second draft-vs-published distinction that actually matters, i.e., until there's more than one developer/author touching content).
8. Soften Tiled's anchor-convention language (§6) from normative to conditional, pending its POC.

## 8. Deferred systems

Everything not explicitly kept in §7: `PlatformCore` (Identity/Auth/Organization/School/Classroom/Enrollment), `WorldComposition` (Blueprint/Template-catalog/Generation/Publishing-pipeline/Versioning), the `ActivityRenderer`/`WorldRuntime` registries, `AuthRepository`/`ClassroomRepository`/`SubmissionRepository`/`WorldRepository`/`AssetRepository`, the full `TeacherWorld`→`PublicationVersion` chain, Phaser 4 + Tiled adoption, inkjs adoption, the future database (already correctly unimplemented), billing/subscriptions/marketplace (already explicitly out of scope). None of this is wrong to have designed — it's the correct long-term map — it's wrong to build before a concrete forcing function exists.

## 9. Revised minimum viable architecture

```
Keep exactly as-is today:
  main.js                — gains `export` on functions worth unit-testing; otherwise untouched
  content/*.js            — stays in place; gains Zod validation, not a directory move
  engine/chronicle-progress-store.js  — stays; gains a 4-line wrapper, not a rewrite

Add:
  repositories/local-progress-repository.js   — thin wrapper (the only repository built now)
  repositories/local-content-repository.js    — thin wrapper around today's content imports
  content-schemas/*.schema.js                  — Zod, validates existing content shapes in place
  tests/unit/                                  — Vitest, targets main.js's newly-exported functions
  tests/e2e/                                   — Playwright, added when convenient (not blocking)

Delete (confirmed dead in the repository audit, zero risk):
  apps/web/src/features/*                      (orphaned island, 2 dead Author Modes)
  apps/web/src/content/chronicle-case-001.js   (3rd incompatible schema)
  apps/web/src/engine/player/player-profile-store.js  (duplicate of progress store data)
  content/campaigns/ + content/library/         (dormant, 4th incompatible schema)
  assets/ (root, all .gitkeep)                  (unused, contradicts where real assets live)

Fix (small, real, currently-broken):
  main.js's two Author Mode data-copy fields — wire them to actually save (repositories/local-teacher-override-store.js,
  a flat field-path-patch JSON blob — same shape as the original proposal's TeacherOverride, none of the
  surrounding publish/version machinery)

Documented, not built (this proposal remains the map for when these are justified):
  platform-core/, world-composition/, quest-engine/, runtime/, packs/, the other 5 repositories, Phaser, Tiled, inkjs
```

## 10. Revised folder structure

```
apps/web/src/
  main.js                        # unchanged location; more exports for testability
  content/
    unit-01-campaign.js          # unchanged location
    unit-02-campaign.js          # unchanged location
    schemas/                     # NEW — Zod schemas validating the above, in place
  engine/
    chronicle-progress-store.js  # unchanged
  repositories/                  # NEW — only these two files exist here for now
    local-progress-repository.js
    local-content-repository.js
    local-teacher-override-store.js   # backs the Author Mode fix (§7 item 7)
tests/
  unit/                          # NEW — Vitest
  e2e/                           # NEW — Playwright, non-blocking
docs/architecture/
  ARCHITECTURE-QUICKREF.md       # RECOMMENDED (not built by this review) — short living summary, see §1 Q26
```

Everything from the original proposal's larger tree (`platform-core/`, `content-registry/`, `world-composition/`, `quest-engine/`, `runtime/`, `packs/`, `teacher-tools/`, `dev-tools/`, `experiments/phaser-tiled-poc/`) remains valid **future** structure — do not pre-create these as empty folders. The repository audit already found the cost of that exact pattern: `apps/web/src/features/{assessment,codex,character-creation}/` are empty `.gitkeep` folders today that a future reader has to investigate and discover are nothing. Don't add more of those.

## 11. Revised migration sequence

| #   | Goal                                                                                                                                                  | Complexity                                  | Blocking dependency | Notes                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Housekeeping: fix `CLAUDE.md`'s stale claims, rebuild the 3 placeholder-stub docs, fix the duplicate/missing decision-log numbers                     | Low                                         | None                | Cheap, immediate value, do first                                                                                                                                   |
| 2   | Add Vitest; `export` and test a handful of pure functions in `main.js` (collision math, badge logic, save-merge logic) — no code moves                | Low                                         | None                | This is the real regression-safety win; extraction was never required to get it                                                                                    |
| 3   | Add Zod schemas validating existing content in place; make `scripts/validate-content.js` real                                                         | Low                                         | None                | Independent of #2, can happen in parallel                                                                                                                          |
| 4   | Wrap `chronicle-progress-store.js` behind `local-progress-repository.js` (4 lines, per the corrected finding in §7 item 4)                            | Low (downgraded from the original's Medium) | None                | Trivial once you know it's 4 lines, not 60                                                                                                                         |
| 5   | Delete confirmed-dead code: `features/`, `chronicle-case-001.js`, `player-profile-store.js`, `content/campaigns/`, `content/library/`, root `assets/` | Low                                         | None                | Zero risk — nothing imports any of it (verified in the repository audit's import-graph trace)                                                                      |
| 6   | Fix the two broken Author Mode fields with a minimal local override store                                                                             | Medium                                      | #3, #4              | The first genuinely new user-facing behavior; the only phase from the original plan kept close to its original shape, deliberately shrunk in scope                 |
| 7   | _(stop and reassess)_                                                                                                                                 | —                                           | —                   | Playwright, Phaser+Tiled, inkjs, PlatformCore, World Composition, and everything else are **not scheduled** — revisit only when a concrete forcing function exists |

This collapses the original 8 phases into 6 concrete, low-risk steps plus an explicit stop point, instead of a plan that reaches all the way to a mocked multi-tenant platform skeleton.

## 12. Go / no-go recommendation for each original phase

| Original phase                                         | Recommendation                                                                                                                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 1 — Foundations                                  | **GO**, unchanged                                                                                                                                                                                |
| Phase 2 — Persistence abstraction                      | **GO**, rescoped from Medium to Low complexity (§7 item 4)                                                                                                                                       |
| Phase 3 — Extract runtime-generic logic from `main.js` | **NO-GO as scoped.** Replace with "export functions in place, don't move them" (§7 item 5, §11 step 2)                                                                                           |
| Phase 4 — Content model unification                    | **CONDITIONAL GO** — do the Zod-validation part now (§11 step 3); defer the directory-move/`packs/chronicle/` restructuring until there's a second pack to justify the shape                     |
| Phase 5 — Phaser + Tiled POC                           | **NO-GO for now.** Isolated and low-blast-radius if it does happen, but no urgency exists; don't schedule it                                                                                     |
| Phase 6 — Teacher Mode consolidation                   | **CONDITIONAL GO** — do the minimal two-field fix (§11 step 6); no-go on the full `TeacherWorld`/`PublicationVersion`/publish-pipeline machinery until more than one person is authoring content |
| Phase 7 — PlatformCore skeleton                        | **NO-GO.** Explicitly premature; revisit only when a second real subject pack or a second real user exists, not on a schedule                                                                    |
| Phase 8 — Deferred/future                              | Unchanged — correctly already out of scope                                                                                                                                                       |

## 13. Required prototypes

- **Playwright** — recommended, not blocking. Worth doing whenever convenient since it's low-cost and generically useful, but nothing in the revised sequence (§11) requires it first.
- **Phaser 4 + Tiled** — deferred indefinitely. Not required until a concrete map/terrain problem exists that today's ellipse-based collision can't handle.
- **inkjs** — deferred indefinitely. Not required until a quest design actually needs branching dialogue (today's dialogue is one static line per NPC).

## 14. Approved initial dependencies

Vitest, Zod. (Unchanged from the tooling audit and the original proposal — both already got this right, and nothing in this review changes it.)

## 15. Deferred dependencies

Playwright, Phaser 4, Tiled, inkjs. All real, all eventually worth adopting, none needed to make near-term progress.

## 16. Rejected dependencies

Unchanged from the tooling audit, reaffirmed here: Yarn Spinner (unshipped official web runtime), H5P-as-platform-core (dual state-ownership conflict), Spine (no skeletal-animation need), LDtk (Tiled has the better Phaser integration), TexturePacker (no measured atlas need). Also reaffirmed as consider-later, not adopted: Storybook, Phaser Editor v5, Sentry, GitHub Actions CI, axe-core/Lighthouse CI.

## 17. Final recommended implementation order

1. Fix `CLAUDE.md` + the 3 placeholder-stub docs + the decision-log numbering gap (cheap, immediate).
2. Add Vitest; export and test a handful of pure `main.js` functions in place.
3. Add Zod schemas for existing content, in place; make `validate-content.js` real.
4. Wrap `chronicle-progress-store.js` behind a 4-line `local-progress-repository.js`.
5. Delete the confirmed-dead code (`features/`, `chronicle-case-001.js`, `player-profile-store.js`, dormant `content/campaigns`+`content/library`, root `assets/`).
6. Fix the two broken Author Mode fields with a minimal local override store.
7. **Stop.** Reassess against real usage — a second subject pack, a real teacher, or a real classroom deployment — before touching Phaser, Tiled, inkjs, PlatformCore, or World Composition. When that reassessment happens, `docs/architecture/PLATFORM-ARCHITECTURE-PROPOSAL.md` remains the correct long-term map; this review is the near-term gate in front of it, not a replacement for it.

Optionally, as the single highest-leverage non-code follow-up: write a short `docs/architecture/ARCHITECTURE-QUICKREF.md` (current step from the list above, three bullet points on what's done/next, pointers into the longer documents) so future Claude Code sessions can orient in one file read instead of four.
