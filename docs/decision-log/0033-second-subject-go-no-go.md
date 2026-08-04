# 0033 — Second-Subject Go/No-Go (Phase 50E)

Date: 2026-07-28

## Decision

**No-go.** Do not start `packs/<subject>/` extraction, a second subject pack, or any
multi-subject platform code right now. Continue building single-subject (APUSH/Chronicle)
depth. This is a written decision, not a code change — per the Phase 46-50 roadmap
(`docs/architecture/PHASES-46-50.md`), 50E's deliverable is this document, not a `packs/`
scaffold.

## Why this needed re-checking now

`docs/architecture/POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §10 lists the conditions that
should trigger revisiting subject-pack extraction, and two of its seven conditions have
since become true:

- _"A real teacher or second user needs an account."_ — True since Phase 22: real
  accounts, classrooms, submissions, evaluations, and manual grades exist and are live in
  Supabase (`supabase/migrations/0001_init.sql` onward, through `0012_assignments.sql` as
  of Phase 50D).
- _"`api/evaluate.js` gets wired to the frontend... would itself warrant revisiting the
  AI-grading boundary."_ — True since Phase 22: `sourceReader()`'s initial reading and the
  Archive Review SAQ block both call it via `evaluator-requests.js`/`evaluator-client.js`,
  and that boundary (formative feedback only, a teacher enters the real grade) has in fact
  already been revisited and re-affirmed repeatedly across Phase 22, 49A, and 49E.

Two of seven trigger conditions firing is a real signal worth stopping to re-examine, which
is what this document does — it is not itself evidence that the _specific_ system this
phase is about (`packs/<subject>/` extraction) should now be built.

## Re-examining every §10 condition against 2026-07-28 reality

| Condition                                                            | Status                                   | Notes                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A second real subject pack is approved and enters active development | **Not met**                              | No second subject (a different AP course, a different grade band, a non-APUSH history game) has been proposed, scoped, or named anywhere in this repo's docs or content. "Odysso" (the separate marketing site discovered during Phase 50C) implies second-subject intent exists at the _brand_ level, but zero code-level second-subject work exists. |
| A real teacher or second user needs an account                       | **Met** (since Phase 22)                 | Already responded to — real accounts/classrooms exist. This justified building `PlatformCore`-adjacent account code, which happened; it does not by itself justify subject-pack extraction, a separate concern.                                                                                                                                        |
| A real classroom pilot gets scheduled                                | **Unknown / not evidenced in this repo** | No decision-log entry, session report, or `PHASES-46-50.md` line documents a scheduled pilot with a real school/teacher. If one exists, it lives outside this codebase's paper trail — flag to the product owner to confirm one way or the other rather than assume.                                                                                   |
| New content work hits a map/collision-authoring wall                 | **Partially met, already responded to**  | The Riverbend and Common Cause Tiled rebuilds (`0029`-`0032`) were owner-directed scoped POCs in response to exactly this pressure, not blocked on this reassessment. The hand-coded-array approach has not been abandoned; Tiled composites onto it.                                                                                                  |
| Manual browser verification becomes repeatedly burdensome            | **Resolved**                             | Phase 29's Playwright suite (40 specs as of Phase 50D, including 20 visual-regression baselines) made this a non-issue.                                                                                                                                                                                                                                |
| An approved quest design requires branching dialogue                 | **Not met**                              | No branching-dialogue quest design has been approved; dialogue remains static.                                                                                                                                                                                                                                                                         |
| `api/evaluate.js` gets wired to the frontend                         | **Met** (since Phase 22)                 | As above — already revisited multiple times since, most recently by 49A/49E's "complete = submitted, not AI-graded" resolution, which _is_ the AI-grading-boundary re-examination this condition called for.                                                                                                                                           |

## The actual test for subject-pack extraction specifically

`packs/<subject>/` extraction only pays for itself once there is a second subject's real
content to extract _against_ — a second, concrete set of units/cases/quests that need the
engine to be subject-agnostic in ways it currently isn't. Today:

- All three shipped units (Unit 1 Caribbean, Unit 2 Colonial Crossroads, Unit 3 Common
  Cause) are APUSH content, real and cited, but still one subject.
- Every place `main.js` is subject-coupled by design (case-ID literals gating
  movement/interaction per `CLAUDE.md`'s Engine vs. content boundary section, the CED
  taxonomy added in Phase 49D, the Historical Thinking Skills categories) is coupling to
  APUSH specifically, not to "history" or "a subject" generically. Extracting a
  `packs/apush/` boundary today would mean guessing at the shape a hypothetical second
  subject needs, with no real second subject to validate the guess against — the same
  premature-generality risk `ARCHITECTURE-REVIEW-AND-SIMPLIFICATION.md` warned against for
  every other deferred system in this program.
- Building a second subject's worth of real, cited content (the actual expensive part —
  content velocity, not architecture, is named as the ongoing constraint at the end of
  Phase 49's roadmap entry) has never been attempted, so there's no lived experience yet of
  which parts of `main.js`/`quest-types/`/`content/schemas/` are genuinely reusable versus
  which look reusable but would need to change once a second subject's real requirements
  show up.

## What would flip this to a go

Any one of:

1. The product owner actually proposes a specific second subject (name the course/grade
   band) with intent to build it, not just discuss it hypothetically.
2. A real classroom pilot gets scheduled and that pilot's contract specifically requires
   multi-subject support (as opposed to just more APUSH content).
3. Chronicle's own APUSH content is judged "complete enough" (all 9 CED periods, not just
   Periods 1-3) that further investment there has genuinely diminishing returns, making a
   second subject the highest-value next move on its own merits — not a forcing function
   from outside, but a legitimate product judgment call once the ongoing constraint named
   in `PHASES-46-50.md` ("content velocity, not architecture") stops being the binding one.

Absent one of these, the next `docs/architecture/POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md`
revisit should be prompted by the same rule §10 already states: revisit when a condition
becomes real, not on a calendar schedule. This document is that revisit for 2026-07-28; the
verdict is unchanged from `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md`'s original "continue
deferring" call on subject-pack extraction specifically, even though two of the seven
conditions attached to the broader reassessment have since fired.

## Recommended next product milestone (unblocked by this decision)

Per `PHASES-46-50.md`'s own framing, Chronicle covers Periods 1-3 of the CED's 9 — the
highest-value next move remains expanding real APUSH content (Period 4 onward), the same
recommendation `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §7 made before Phase 46 even
started. Nothing about Phase 46-50's work changes that call; if anything, Phase 49's own
CED tagging (49D) now makes the remaining-periods gap machine-checkable (`ced.period` values
across all cases top out at 3).
