# 0041 — A mission per case, a record that describes itself, and options you can read

Status: accepted · Phase 58 (parts 2, 3, 6, 7) · 2026-07-29

Three of these four are one-line causes with wide blast radii. The fourth is a structural split.

## Roads are packed earth, not sand

Phase 58's report: _"the 'path' that you are using for both the Riverbend and Caribbean is a sand
patch and it looks bad and unnatural. I would expect it to be dirt."_

Phase 55 generated all three path networks but left each map painting its roads in whatever ground
tile it already had. Caribbean's `road` was `sand.tropical` — literal beach sand, indistinguishable
from the beach ring the tracks ran beside — and Riverbend's was the fishing pack's wet-sand _shore
strip_, so every lane through the settlement read as a ribbon of riverbank laid across the commons.
Both read exactly as reported because that is what they were.

Both now point at a new canonical `path.packed.earth`: `Medieval Fantasy Town/2`'s brown pebbled
earth, the same block Philadelphia's wharf lane already used, added under a new key so the committed
GIDs of the map that already had it stay put. It is full-bleed, so it still tiles in any direction —
the property the whole generated network depends on, and the reason Island survival's own dirt pair
(which carries a baked-in grass edge down one side) has never been usable for a road.

**Verified by looking, not assumed.** Both maps were rendered with `assets:preview-map` and the road
checked against that map's own grass before committing. It sits darker and less saturated than both
the tropical and the temperate green, so a lane reads as a lane on either.

One consequence inside the Caribbean generator: "keep scrub off the tracks" tested the _sand_ gids,
which worked only because the road and the beach were the same tile. It tests `palette.road` now,
which is what it always meant.

## A record describes itself, on the record

_"Documents should have the creator, date, and record on them, not off to the side. Right now, the
documents are saying 'secondary context record' when often it's a primary source."_

`sourceVisual()` branched on `source.visual` and hardcoded a caption and a footer per branch.
`visual: "context"` is set on **9 of the 13 sources** across the three units, so nine records were
captioned "Secondary context record" and footed "Background evidence, not a Taíno-authored primary
source" — among them Patrick Henry's speech to the Second Virginia Convention, Dickinson's Farmer's
Letters, Pontiac's council speech, and the Virginia Company's instructions to Governor Yeardley.
Exactly one source in the game is either of those things.

The cause is a field doing two jobs. `visual` answers "how should this be laid out"; the caption was
reading it as "what kind of source is this". Every source already carries a `type` that says the
latter outright.

So the document now prints a masthead built from its own fields — type, then Creator / Date / Record
— and `visual` is left with the job it actually has: transcript blockquote, prose excerpt, or image
figure. Both hardcoded footers are gone. Where a source genuinely needs a caveat it belongs in that
source's own content, and `taino-context.feedback` already says so.

Creator/Date/Record also moved out of a `<dl>` in the reader's right-hand column onto the paper. They
describe the document, and a record that does not carry its own attribution is the first thing HIPP
sourcing asks a student to look at.

`tests/unit/source-visual.test.js` walks all 13 sources and asserts the caption is the source's own
type, that all three attribution fields appear on the document, and — naming both retired strings
literally — that no primary source is ever told it is background context.

## Multiple-choice options were rendering in the A/B/C/D badge's own type

_"Much of the multiple choice text in the missions is small and the UI looks bad. This is across all
the missions."_

Every option in every mission drew its answer text at `700 0.65rem "Cinzel"`, in gold, clipped to a
22px box. One selector and one span: `.choice span` is the badge rule shared with the Archive Review's
checkpoint, `renderMcqQuest()` wrapped each option's text in a bare `<span>`, and the only override
(`.quest-choices .choice span`) reset display and width but neither font nor colour.

Fixed at the markup, not only in CSS, so a future edit cannot silently reclaim the element: both call
sites emit `.choice-badge` and `.choice-text`, and the badge rule targets the class. The quest
renderer also gained the A/B/C/D badge it never had, so a mission's options and the Archive Review's
are now one control with one rule set — body-size text, a hover and `:focus-within` affordance on the
whole label rather than on the radio alone, and a gold selected state on both the row and its badge,
which nothing had before.

The Spanish-camp POV checkpoint keeps its own pre-`.choice` markup but gets matching size, spacing,
hover and selected treatment. It is multiple choice on a mission screen; looking like a different app
there is the same defect.

## Every non-map case is its own mission

_"I am a little confused here on case 1.03, 1.02, etc. Anything not a map. It says, open the Archive
Challenge. This then opens the same quest for me no matter what."_

Literally true. All six non-map cases carried `route: "archive-challenges"`, and Chronotravel landed
every one of them on `archiveChallengesScreen()`, which renders **every** case's quest in one list
merely reordered to put the traveled-to case first. Same heading, same list, same look from six
different doors — and five of the six were the same quest type on top of that.

### The rule

Settled with the user during planning, and now enforced by a test:

- **Nav Table missions** use the four teacher-swappable quest types — `mcq`, `sequencing`,
  `evidence-organizing`, `hipp` — the set Manage Content lets a teacher replace.
- **The Archive Room** holds the AP writing work: `saq`, `dbq`, and whatever else that group grows to.

### What changed

A new `route: "mission"` and a `missionScreen()` that renders the active case's own quest and nothing
else, framed by that case's title, central question, mechanic name, place and date. Grading,
completion, `unlockNext()`, skill outcomes and the teacher content-selection path all reuse
`archiveChallengeCard()` unchanged, so a mission is the same quest it always was, shown on its own.
Teacher-added questions are scoped to the case, where the shared list pooled the whole unit's.

`archiveChallengesScreen()` keeps only `unit.archiveChallenges[]`. Unit 3 was already right (SAQ +
DBQ); Unit 1's evidence-organizing claim board and Unit 2's two "strongest evidence" MCQs became real
SAQs built on sources those units already cite — Columbus's 1493 letter and Frethorne's 1623 letter,
the same already-covered-source convention Unit 3's SAQ uses for Dickinson's Letter II.

Two missions were re-typed so no unit has two of the same:

- **case-005** (Trade Route Plotter) becomes sequencing. A triangular voyage is genuinely ordered — a
  ship could not carry captives before it had traded for them, or sugar before it had sold them —
  which a sort cannot express. Every leg names the same real records the retired sort used.
- **case-009** (Appeal Ledger) becomes mcq, asking the comparison the case's own central question
  poses: what a formal petition let Prince Hall do that a private letter did not let Abigail Adams do.
  The retired sort asked which _form_ each record took, which both attributions already announce. It
  also stops borrowing the unit-level id it kept when it was promoted out of `archiveChallenges[]` in
  Phase 48D.

### Deliberately not done

- **A DBQ for Units 1 and 2.** Unit 3's has seven documents drawn from case-007's seven sources; Units
  1 and 2 have three sources each, so an honest DBQ needs new cited documents. That is a content pass
  with its own sourcing work, not a side effect of this one.
- **Re-homing the displaced quests as curated alternates.** A curated alternate must be the same type
  as the slot it replaces (`resolveQuestSlotWithType()`: "one static pool per type, so that branch
  never changes type"), and the only same-type slots left are in other cases, where a triangle-trade
  sort inside the Charter & Compact mission would be a semantically wrong swap offered to teachers.
  They stay in their arrays, unreferenced and documented. The custom-content path
  (`custom_content_items.slot_kind`, migration 0008) is not type-constrained, so they remain reachable
  by a future authoring pass.
- **Renaming `case.archiveChallenge` to `case.mission`.** The key is read by the teacher
  content-selection pipeline, by `progress.archiveChallenges` completion records in every existing
  save, and by two migrations' column names. Renaming it is a data change disguised as a rename.

### Save compatibility

`unitArchiveChallengesComplete()` matches on `questId`, so changing a unit's `archiveChallenges[]`
makes a save that had finished the old one read as incomplete — which silently re-locks the Archive
Review mid-unit, with nothing on screen to explain why.

`RETIRED_ARCHIVE_CHALLENGE_IDS` maps each retired id to the challenge it now satisfies, and the
Archive Room shows such a challenge as already restored rather than re-asking it. The student did the
work in front of them; re-locking a completed unit to make a content change tidy is the app breaking
its promise, not the student's problem. Nothing is granted for work never done — a save with no
completion simply does the new SAQ.

## Consequences

- `tests/unit/retired-archive-challenges.test.js` pins both halves of the save rule and three
  properties of the split: every non-map case has a quest and no map case does; the Archive Room holds
  only `saq`/`dbq` while missions hold only the four swappable types; and no unit has two missions of
  the same type. A unit-level challenge drifting back to `mcq` would quietly undo the split, and now
  fails instead.
- `archive-challenge.spec.js` plays each of the six missions through its own screen and asserts it
  shows one quest — its own — plus the converse for the Archive Terminal.
- The Navigation Table's button reads the mission's own mechanic; Manage Content's detail line says
  the mechanic rather than "Archive Challenge only", which described where a mission was rendered
  rather than what it is.
- `route: "archive-challenges"` is rejected by `UnitSchema` — a case still claiming it would render
  nothing, since `render()`'s switch has no branch that takes a case id.
