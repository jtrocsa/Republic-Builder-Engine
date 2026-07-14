# Next-Units Roadmap

A planning document, not a spec: what's left to make Unit 1 actually complete, what Unit 2
needs to leave placeholder status, and a rough structural shape for Unit 3+. No new game
content is authored here — this names the work and points at the right tool/agent for each
piece.

## 1. Unit 1: finish the two locked badge areas

Unit 1 ("The Atlantic Crossroads") ships three cases, but only `case-001` (Caribbean) is
playable. `UNIT_BADGES["unit-01"]` (`apps/web/src/main.js`) shows the other two as
explicitly locked-until-archived:

- `case-002` — **Atlantic** ("Atlantic Exchange Badge"): *"Exchange route record will appear
  after the Atlantic case is archived."*
- `case-003` — **Hispaniola** ("Hispaniola Empire Badge"): *"Empire and resistance record
  will appear after the Hispaniola case is archived."*

`docs/architecture/QUEST-TYPE-ARCHITECTURE.md` §6 already names this as the concrete next
content milestone, once quest-type wiring itself was done: *"build out the Atlantic or
Hispaniola badge area, now using these quest types where they fit instead of hand-duplicating
the pattern a fourth time."* That recommendation stands, with two things now different from
when it was written:

- **The four quest types have real UI now, not just wiring** — the Practice Check screen has
  progress states, keyboard access, and partial-credit feedback (see decision-log `0029`'s
  sibling UI-polish work this same session). New badge-area content built on these quest
  types inherits that UI for free.
- **The four-Cs taxonomy is a real enum now** — `SKILL_CATEGORIES` in
  `evidence-organizing-quest.js` (Comparison, Causation, Continuity and Change,
  Contextualization, Sourcing). Tag new Atlantic/Hispaniola evidence-organizing content with
  it from the start; see `docs/content-guide/skill-taxonomy.md`. This is also the natural
  place to finally get real Comparison and Causation examples into the game — Case 1.01's
  existing evidence-organizing quest has neither.

Don't hand-duplicate the older one-off patterns (`EMPIRE_EVIDENCE`/`EMPIRE_CONNECTIONS`,
`TRIANGLE_CARGO`, `REGION_EVIDENCE`) for new Atlantic/Hispaniola content — those predate the
quest-type layer and are exactly what it was built to stop duplicating a fourth time.

**Owner for this work:** the `content-designer` agent for the content itself (Zod-schema-
validated quest content, no `main.js`/engine changes); `map-implementer` only if Atlantic or
Hispaniola turns out to need genuine new explorable field space (confirm that's actually true
before invoking it — most badge-area content is likely to be practice-check-shaped activity
content, not a new map).

## 2. Unit 2: leave placeholder status

Unit 2 ("Riverbend Settlement") has two things that are *not* placeholder and one that is:

- **Real, not placeholder:** the field map. Since decision-log `0029`, both Unit 1 and Unit 2
  have real Tiled `.tmj` tile art (Unit 2's since the original Riverbend proof-of-concept,
  predating this session). Don't re-scope "Unit 2 needs a map" — it has one.
- **Real, not placeholder:** the quest-type/engine wiring pattern itself, which Unit 2's
  content can adopt directly (same `quest-types/` layer Unit 1 uses).
- **Placeholder, needs real work:** every actual historical fact, source, and prompt.
  `content/unit-02-campaign.js`'s own header comment is explicit: *"Every record below is a
  PLACEHOLDER: the shapes are final, the historical copy is not."* Sources, cargo cards,
  region evidence, and the review MCQ/SAQ all currently contain literal placeholder text, not
  real Period 2 (1607–1754, "Colonial Crossroads" per the file's own `title`) history.

Replacing the placeholder content needs the same rigor Unit 1's real content has: real
primary sources with real citations, HIPP-groundable prompts, and (per §1 above) four-Cs
tagging on any new evidence-organizing content from the start. This is squarely the
`content-designer` agent's job — it's described as drafting quest/unit content against the
existing Zod schemas without touching `main.js` or engine code, which is exactly the shape of
this task.

## 3. Unit 3+: rough shape only

Deliberately structural, not historical — no primary-source research happens in this
document. APUSH's period sequence puts **Period 3 (1754–1800, Revolution and Founding)**
immediately after Unit 2's Period 2 window, making it the natural next chronological unit
whenever Unit 2's real content work (§2) is far enough along to plan past it.

Suggested shape, matching Unit 1's own structure rather than inventing a new one:

- One flagship playable case (mirroring Case 1.01), plus a small number of locked/future
  companion badge areas (mirroring Atlantic/Hispaniola) — not a flat single-case unit, and
  not an open-ended number of cases either.
- A new badge-area name, chosen at authoring time to fit the Institute
  Archive/Chronotravel/Preservation Case narrative frame already established — not decided
  here.
- Real field art from day one if the case needs explorable space: check
  `apps/web/src/assets/tilesets/` for a tileset pack that actually fits the setting (the same
  inspect-before-committing discipline that made the Island survival choice work for Unit 1's
  tropical scene — don't default to whichever pack Unit 2 happened to use if the setting is a
  poor visual fit).

## 4. Regression-prevention: keep future content on the current toolkit

Two things landed this session that future content should build on, not regress past:

- **Four-Cs tagging** (`docs/content-guide/skill-taxonomy.md`) — any new
  evidence-organizing quest content should use `SKILL_CATEGORIES` from the start, not
  reintroduce free-text category names the way `"Sourcing and Situation"` existed before it
  was formalized.
- **Practice Check UI patterns** — new quest-type UI work should extend the
  unanswered/in-progress/partial/correct/incorrect state model and the keyboard-operable
  alternatives to drag-and-drop already built, rather than shipping a fifth quest type with
  no keyboard path to completion.

## 5. Candidate future quest types — not committed scope

`QUEST-TYPE-ARCHITECTURE.md` §5 already named and explicitly deferred four quest types beyond
the current set: **Thesis/argument-building**, **Causation-as-node-graph**,
**role-play/simulation**, and **SAQ/LEQ-as-quest-format**. Listing them here only to connect
them to *future units*, not to commit to building them:

- **Causation-as-node-graph** pairs naturally with a unit whose central question is
  explicitly causal (a Period 3 revolution-causes unit is a plausible fit).
- **Thesis/argument-building** pairs naturally with an SAQ/LEQ-heavy unit, and is also the
  most direct way to give **Comparison** a dedicated interaction shape — none of the four
  current quest types have a comparison/paired-contrast interaction today, which is part of
  why Comparison has no real content yet (§1).
- **Role-play/simulation** and **SAQ/LEQ-as-quest-format** have no obvious unit-specific pull
  yet; revisit when one emerges, not on a schedule.

None of these are scheduled work. Treat this section as a pointer for whoever plans the unit
these might attach to, not a queued task.

## 6. Adjacent low-effort latent value

`apps/web/src/mini-games/` (`cargo-sorting.js`, `storm-navigation.js`) is built, tested, and
completely unwired into `main.js` — explicitly non-rubric-scored pacing/reward content, not a
quest type. `QUEST-TYPE-ARCHITECTURE.md` §6 already flags it as "a separate, smaller
candidate for the same treatment whenever it fits a pacing beat." Worth wiring in opportunistically
alongside whichever future unit's content work has a natural pacing gap for it — not a reason
to open a dedicated phase on its own.
