# 0050 — The Mission Activity Catalog: what a mission can be, and how far a Chronicler reaches

Date: 2026-08-01

## Decision

Adopt `docs/design/MISSION-ACTIVITY-CATALOG.md` as the standing catalog of activity types a
Chronicle mission can be built from, and record three decisions it depends on:

1. **The record-only rule** — a Chronicler changes the record, never the event.
2. **Mission vs. Archive Commission** — two named groups with different jobs, and the required →
   optional inversion the second one implies.
3. **The Group A substrate is four optional content fields plus a lookup** — not an adopted dialogue
   runtime.

Nothing is implemented by this ADR. It is a design decision recorded ahead of the work, at the
project owner's direction ("first, let's design the log of mission type games we can use").

## Context

Fifteen missions across five units had converged on one shape — walk to a ✦, read the source, write
an answer. Measured on 2026-08-01: three bespoke map activities exist and **all three are Unit 1
only**, each hardcoded to a single source id; `activityRoute` is `null` on all 21 sources in Units
2–5; and the game's 70 field NPCs are 70 flat `text:` strings with no branching, no state, and no
reaction to anything the player carries.

The forcing question was the project owner's: the map puzzle in Unit 1 is fun, everything else is
"go talk to this person or thing and write your answer," and the game should be able to be _fun_ —
with characters who have personality and desire, who connect to each other, and where actions have
cause and effect.

## Rationale

### 1. Record-only, because it is the enabling constraint rather than a limit

The obvious tension — the Chronicler is not supposed to get involved in history, but a game needs
player agency — dissolves once you notice that **the record is the thing that is damaged.** That is
already the game's premise: the player is recruited because the historical record has become
unstable, and their job is to repair it.

So the player's leverage can be total within the informational layer while historical outcomes stay
fixed. Which evidence you obtain, who is willing to speak to you, what order you learn things in,
what you file, and what you preserve as a logged dissent are all genuinely consequential and all
genuinely the Chronicler's job. What happened, to whom, and when are not on the table.

The success criterion is a student who can say "I got a different record than my classmate because I
asked different people in a different order," and who would never say "I changed what happened."

Two alternatives were considered and rejected. **Errand-only agency** (NPCs have wants, nothing else
changes) was too thin to carry cause and effect. **Visible local consequence** (a scene resolves
differently as long as nothing load-bearing moves) would need a written off-limits list per case, and
carries a real risk of a student concluding they rewrote history — an unacceptable failure mode for
an AP course.

### 2. Mission vs. Archive Commission, and the inversion

The codebase blurs these, and the blur has a concrete symptom. At
[main.js:8987](../../apps/web/src/main.js#L8987):

```js
const unitReadyForReview = (unit) =>
  unit.cases.every((c) => isComplete(c.id)) && unitArchiveChallengesComplete(unit);
```

A unit's Archive Challenge is **required** and gates Archive Review. But the Archive Room's other
three surfaces — the Archive Rotation (a real Leitner system, `engine/spaced-repetition.js`), the
Skill Mastery Record, and the Preservation Case — are all optional practice that never gates
anything. The per-unit challenge is the odd one out.

The intended model is the inverse: **completing a unit unlocks an optional Commission**, rewarding
extra practice, a badge, and skill-mastery growth. That makes the Archive Room coherently one thing
— the practice wing — and it removes a hard gate that currently sits between a student and their
unit review.

It also settles a related question correctly. AP writing is **not** banished to the Archive Room; a
mission may absolutely ask for writing. The catalog's actual constraint (§5 rule 4) is that no
mission asks for extended writing _twice_ — today a single mission can ask in the source reader's
initial reading, again in an evidence-organizing reflection, and again in its quest.

**The inversion is decided here and deliberately not implemented.** It changes a progression gate,
and every existing save carries `progress.archiveChallenges` entries that must keep counting when it
lands. It needs its own pass with e2e coverage, and it should update the now-conditionally-wrong
comment at `apps/web/src/content/schemas/unit.schema.js:112-114` ("completing all of these is
required for unit completion") in the same commit.

Not renamed, and this is deliberate: `case.archiveChallenge` (singular, a _mission's_ quest slot) and
`unit.archiveChallenges[]` (plural, _Archive Room_ work) are confusingly close, but `unit.schema.js`
already records that those keys are read by the teacher content-selection pipeline, by every existing
save, and by two Supabase migration column names. Renaming them is a data change disguised as a
rename. The catalog defines clear prose vocabulary and leaves the keys alone.

### 3. The substrate is content fields, not a dialogue runtime

Group A of the catalog — the mechanics that actually deliver personality, desire and connection —
needs an NPC to be more than one string. It gets four optional fields: `topics` (what they'll speak
on), `want` (what makes them willing), `stance` (what they think of another named NPC on the same
map), and `knows` (lines that fire only if the player already carries a given record).

`ARCHITECTURE-QUICKREF.md` §8 defers inkjs on the grounds that "today's dialogue is one static line
per NPC, no branching need exists yet." **That reason is now out of date** and the quickref line is
amended accordingly — but a branching _need_ is not the same as needing a branching _runtime_. Four
optional fields plus a filter and a `Set` of unlocked topic ids on `progress` is a far smaller thing
than a scripting language with its own compiler, and it keeps dialogue in the same content files as
everything else the validator already checks. inkjs stays deferred; revisit only if authored dialogue
outgrows a flat topic list.

The fields are **optional** on purpose. 70 NPCs × 4 fields is a large authoring bill, and most of it
has to be historically defensible. An NPC with only `text` stays valid and behaves exactly as it does
today, so a mission fills them in for the three or four people it actually turns on.

### 4. A variety rule, because vocabulary alone will not hold

A catalog that is only a menu will be read once and forgotten, and Periods 6–9 will re-converge on
the default shape. So the catalog carries four binding rules for new units — three groups per unit,
no shared primary activity between adjacent units, at least one Group A entry per unit, and at most
one extended written response per mission.

Rule 3 is the load-bearing one. Groups B, C and D can all be built without any NPC becoming a person,
and if that happens the game ends up with more variety and still feels like a worksheet with a map
attached.

## Notes

- **A stale claim was corrected while writing this.** Decision log `0028` states the mini-games layer
  was left unwired from `main.js`. That was true at Phase 9 and is no longer: `main.js` imports both
  modules, there is a real `mini-games` screen with a card for each, a "Try a Mini-Game →" button on
  the Navigation Table, and an Author Mode toggle for the in-field Practice Check entry. The catalog
  records the current state and reframes Group D's open question as **placement** rather than wiring.
- **The five pre-solved sequencing quests** carried in `ARCHITECTURE-QUICKREF.md` §5 were re-checked:
  four are directly visible in `content/quests/` (one in Unit 2, one in Unit 3, two in Unit 4), with
  Units 1 and 5 correctly scrambled. The catalog lists fixing them as retrofit item 2 — it is a
  content edit, and one of the two cheapest items in the queue.
- **No removed system is reintroduced.** A4's "want" is a per-scene willingness flag — not an
  inventory, not a currency, not a reputation stat. Founder Paths, professions, Historian Skills and
  wardrobes stay out.
- **No dependency is adopted or un-deferred**, and no deferred architecture (`PlatformCore`,
  `WorldComposition`, `QuestEngine` registries) is reopened. Every mechanic in the catalog is
  buildable inside the existing `main.js` / `content/*.js` / `quest-types/` structure.
- Full catalog: `docs/design/MISSION-ACTIVITY-CATALOG.md`.
