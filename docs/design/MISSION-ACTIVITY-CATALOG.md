# The Mission Activity Catalog

The standing log of activity types a Chronicle mission can be built from.

**Read this before designing any new mission, and before adding a unit for Periods 6–9.** §5's
variety rule is binding on new units; §6 is the retrofit list for the five that already shipped.

Companion ADR: `docs/decision-log/0050-mission-activity-catalog.md` records _why_ the two rules in
§1 and §2 exist. This file is the catalog itself.

---

## 0. Why this document exists

Fifteen missions across five units have converged on one shape:

> Walk to a ✦. Read the thing. Write an answer. Repeat.

That is a defensible skeleton — it is genuinely how a historian works — but as a _game_ it makes
the map a hallway between buttons. Nothing on the walk matters. The people standing on it have
nothing to say beyond one line each, and nothing they say depends on anything the player has done.

The measured state, verified against source on 2026-08-01:

| Layer                        | What actually exists                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rubric-scored quest types    | 6 — `mcq`, `sequencing`, `evidence-organizing`, `hipp`, `saq`, `dbq` (`quest-types/index.js`)                                                          |
| Bespoke map activities       | **3, Unit 1 only** — `village-activity`, `columbus-activity`, `map-jigsaw`                                                                             |
| `activityRoute` in Units 2–5 | `null` on every source, all 21 of them                                                                                                                 |
| Field NPCs                   | **70 flat `text:` strings.** No branching, no state, no reaction to what the player carries                                                            |
| Mini-games                   | 2, real and reachable — `cargo-sorting`, `storm-navigation` (see §4 Group D; the "unwired" note in decision log `0028` describes Phase 9 and is stale) |
| Shared closer                | Reconstruction Table — the same drag-record-to-lane on all five maps                                                                                   |

The three bespoke activities are each hardcoded to one source id — `mapJigsawScreen()` opens with
`sourceById("waldseemuller-map")`. None of the three is reachable from any unit but the first.

**The gap this catalog fills:** there is no vocabulary for "what kind of thing a mission is," so
every new mission defaults to the one shape that already exists. §4 is that vocabulary.

---

## 1. Two groups, and what each is for

These are different things and the codebase currently blurs them. Use these words.

### Mission

**The investigation.** Reached by Chronotravel from the Navigation Table; rendered either as a
walkable field map or by `missionScreen()`. Required — it carries unit progression.

A mission is where the game is a game: you go somewhere, the place has people in it, you come back
with something. **AP writing is allowed in a mission.** The problem was never that missions contain
writing; it is that writing is the _only_ verb most of them have.

### Archive Commission

**The practice wing.** Reached from the Archive Terminal in the Archive Room. **Optional**, and
unlocked _by_ finishing a unit rather than required to finish one. Rewards extra practice, a badge,
and growth in the Skill Mastery Record (`progress.skillMastery`).

The Archive Room already has most of this: the Archive Rotation (a real 5-box Leitner system,
`engine/spaced-repetition.js`), the Skill Mastery Record, and the Preservation Case are all
optional practice surfaces that never gate anything. The per-unit challenge is the one piece that
does not currently fit that description.

### The inversion this implies

Today, at [main.js:8987](../../apps/web/src/main.js#L8987):

```js
const unitReadyForReview = (unit) =>
  unit.cases.every((c) => isComplete(c.id)) && unitArchiveChallengesComplete(unit);
```

A unit's Archive Challenge is **required** — it gates the Archive Review button. Under the model
above it should be the reverse: completing the unit _unlocks_ the Commission, which is then
optional. See ADR `0050` §3. **Not changed by this document** — it is a progression gate with
existing saves behind it, and it needs its own pass.

### The naming trap — document it, do not rename it

- `case.archiveChallenge` (**singular**) is a _mission's_ quest slot. Nothing to do with the Archive
  Room.
- `unit.archiveChallenges[]` (**plural**) is _Archive Room_ work.

The keys cannot be renamed. `unit.schema.js` records why: they are read by the teacher
content-selection pipeline, by `progress.archiveChallenges` in every existing save, and by two
Supabase migration column names. Renaming is a data change disguised as a rename. Write around it.

---

## 2. The rule that keeps all of this safe

> ### A Chronicler changes the record, never the event.
>
> An activity **may** change: which evidence you obtain, who is willing to speak to you, what order
> you learn things in, what your filed record says, and what dissent is logged against it.
>
> An activity **may never** change: what happened, to whom, or when.
>
> If a mechanic requires a historical figure to act differently _because the player was there_, it
> is out of scope.

This reads like a limit. It is actually the thing that makes the catalog work, because of the
corollary:

**The record is the thing that is damaged.** That is the premise the game already ships — the
player is recruited because the historical record has become unstable. So the player's leverage is
real, consequential, and the entire point of their job, without ever being counterfactual. Cause
and effect lives in the informational layer: who you ask first, what you show them, what you file,
and what you preserve as a dissent.

A student should finish a mission able to say "I got a different record than my classmate because I
asked different people in a different order" — and never "I changed what happened."

### Applying the rule

| Allowed                                                            | Not allowed                                                |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| An NPC refuses to speak until you return something they dropped    | An NPC decides not to sign a petition because you asked    |
| Two accounts conflict and you choose which to file                 | Your choice determines which account was historically true |
| A record is damaged and you reconstruct it from corroboration      | You author a clause the document never contained           |
| Asking A first means B tells you something they otherwise wouldn't | Asking A first changes where B is standing tomorrow        |

---

## 3. The substrate — what Group A needs first

Not an activity. The prerequisite for every entry in Group A, and the single highest-leverage
change in this document.

An NPC today is a name, a sprite, coordinates, a behaviour kind, and **one `text` string**. Four
content fields turn that into a person:

| Field    | What it holds                                                     | Enables |
| -------- | ----------------------------------------------------------------- | ------- |
| `topics` | What they will speak on if asked about it                         | A1, A3  |
| `want`   | What makes them willing — a thing, a message, a piece of news     | A4      |
| `stance` | What they think of another **named NPC on the same map**          | A1, A5  |
| `knows`  | Lines that fire only if the player already carries a given record | A2      |

All four are content-shaped lookups over data the NPC tables already hold. The runtime is a filter
and a `Set` of unlocked topic ids on `progress`, not a dialogue virtual machine.

**This deliberately does not reopen inkjs.** `ARCHITECTURE-QUICKREF.md` §8 defers it on the grounds
that "today's dialogue is one static line per NPC, no branching need exists yet." That reason is now
out of date — but a branching _need_ is not the same as needing a branching _runtime_, and four
optional fields plus a filter is a much smaller thing than a scripting language with its own
compiler. Revisit inkjs only if authored dialogue outgrows a flat topic list.

**Authoring cost is the real constraint.** 70 NPCs × 4 fields is a lot of writing, and most of it
must be historically defensible. Mitigation: the fields are **optional**. An NPC with only `text` is
still valid and behaves exactly as it does today. Fill them in for the three or four people a
mission actually turns on, not for everyone on the map.

---

## 4. The catalog

Groups are named for the verb the player is actually performing. **A mission should be identifiable
by its group in one sentence** — if it isn't, it's probably drifting back toward the default shape.

Cost is rough engineering effort: **S** = reuses something that already exists, **M** = a new screen
plus a content shape, **L** = new engine capability.

---

### Group A — Talk

**Does not exist today in any form.** This is where "personality, desire, connecting to each other,
cause and effect" actually lives. Everything here depends on §3.

#### A1 · Testimony Chain

- **The player does** — talks to someone who points them at someone else. "Ask the clerk, he keeps
  the book." Talking to A opens a topic on B that was not available before.
- **Fun because** — you're following a thread instead of clearing a checklist. The map becomes a
  conversation graph, and the order you walk it is yours.
- **Trains** — corroboration; the habit of asking who else would know.
- **Reuses** — the existing proximity/dialogue loop entirely. Needs `topics` + `stance`.
- **Cost** — S. **Fits** — any map with 5+ NPCs. Riverbend and Richmond are the strongest.

#### A2 · Corroborate / Contradict

- **The player does** — carries a record they already hold to another person. That person confirms
  it, disputes it, or **declines to comment** — and the refusal is itself recorded as evidence. The
  player marks each claim corroborated / disputed / single-source.
- **Fun because** — your evidence becomes a tool you use on people, not a list you accumulate. It is
  the first mechanic in the game where walking back across the map is worth doing.
- **Trains** — sourcing and corroboration: the actual DBQ skill, practiced instead of described.
- **Reuses** — `progress` evidence state, the dialogue bubble. Needs `knows`.
- **Cost** — M. **Fits** — every unit. **Strongest single entry in this catalog.**

#### A3 · Ask the Right Question

- **The player does** — instead of receiving one line, chooses among 3–4 question stems drawn from
  HIPP (situation / audience / purpose / point of view). A weak stem gets a shrug or a deflection;
  the right one gets the quote worth filing.
- **Fun because** — it is a skill check that feels like a conversation rather than a quiz, and being
  brushed off is informative instead of punishing.
- **Trains** — HIPP, as dialogue. **This is the direct replacement for "write a short paragraph."**
- **Reuses** — the `hipp` quest type's existing distractor discipline, including its
  `identificationOnly` convention (an option that names the right thing and earns nothing).
- **Cost** — M. **Fits** — any mission with a named creator to interrogate.

#### A4 · The Errand / The Want

- **The player does** — something small and local for someone who won't otherwise open up: return a
  dropped tally stick, carry a message across the map, tell them what the other one said.
- **Fun because** — it gives every NPC a desire, and it gives the map a reason to be walked that
  isn't "the next ✦ is over there."
- **Trains** — nothing directly. It is the connective tissue that makes A1–A3 read as a place rather
  than a menu, and that is a legitimate job.
- **Guardrail** — an errand changes **willingness**, never **outcome**. See §2.
- **Cost** — M. **Fits** — one per map, at most. This is seasoning, not a meal.

#### A5 · Whose Account Do You File?

- **The player does** — hears two incompatible descriptions of the same event, files one as the
  record, and preserves the other as a logged dissent with a stated reason.
- **Fun because** — a real choice with no clean answer, and the game remembers both.
- **Trains** — historiography and contextualization; that evidence conflicts is the normal case, not
  an error state.
- **Reuses** — the Reconstruction Table's filing metaphor.
- **Cost** — M. **Fits** — any unit with a genuine documented dispute. Unit 5's Richmond is rich in
  these.

---

### Group B — Do

Map-native object mechanics. The map stops being scenery.

#### B1 · Fragment Assembly

- **The player does** — reassembles a damaged visual source from pieces.
- **Fun because** — tactile, immediately legible, and the reveal is the payoff.
- **Trains** — reading a visual source for what it can and cannot evidence.
- **Reuses** — **already built.** `mapJigsawScreen()` + `MAP_PIECES` + the `.jigsaw-board` CSS. It is
  hardcoded to `sourceById("waldseemuller-map")`; generalizing it to any source with an image gives
  every unit a visual-source activity.
- **Cost** — S. **Fits** — any unit with a map, chart, broadside, or engraving.
- **Cheapest real win in this document.**

#### B2 · Fill the Gap

- **The player does** — receives a record with a clause missing and reconstructs it by choosing among
  candidates supported to different degrees by the other records they hold.
- **Fun because** — **it is the game's own premise as a mechanic.** The player was recruited because
  the record is damaged; nothing currently lets them repair one.
- **Trains** — evidence-based inference, and the discipline of not inventing what the evidence
  doesn't support (one candidate should always be plausible, unsupported, and wrong).
- **Guardrail** — the true clause must be historically attested. The player recovers it; they do not
  author it.
- **Cost** — M. **Fits** — every unit. **Best thematic fit in the catalog.**

#### B3 · The Form

- **The player does** — completes a real documentary form (a canal toll receipt, an impressment
  requisition, a payroll, a ward register), then answers what the form does **not** record.
- **Fun because** — filling in a bureaucratic form is quietly satisfying, and the omission is the
  punchline.
- **Trains** — who the record counted, and who it was designed not to see.
- **Reuses** — Units 4 and 5's composite documents **already are exactly these forms** (decision log
  `0049`). The content exists; only the interaction is missing.
- **Cost** — M. **Fits** — Units 4 and 5 immediately; any administrative-record period after.

#### B4 · The Tally / Survey

- **The player does** — counts what is actually on the map (people by category, buildings, goods),
  then compares their count against the official document's count and identifies who is missing.
- **Fun because** — it makes the map itself the puzzle. The NPCs standing around become data.
- **Trains** — the same omission skill as B3, arrived at by the player's own observation rather than
  by being told. Unit 5's own reconstruction lane is literally named "who the record counted."
- **Cost** — M. **Fits** — Unit 5 first; any census/muster/payroll context.
- **Note** — the count must be stable. Routed NPCs move, so tally targets should be `station` kind or
  counted by category rather than by position.

#### B5 · Route Plot

- **The player does** — draws a movement across the Navigation Table's atlas: a trade circuit, a
  canal leg, a march, a forced migration.
- **Fun because** — spatial and legible, and the atlas already looks like it wants to be drawn on.
- **Trains** — causation and geography; that movement has direction, sequence, and cost.
- **Reuses** — `engine/geo-projection.js` (`landPathD`, `projectPoint`), already imported by
  `main.js`, plus `navigation-table-views.js`.
- **Cost** — M. **Fits** — Case 1.02 is _named_ "Atlantic Route Puzzle" and is currently an
  evidence-organizing quest. Also Unit 4's canal, and any Great Migration content in Periods 7–8.

#### B6 · Overlay

- **The player does** — lays a period map over the terrain and finds where the two disagree.
- **Fun because** — the discrepancy is the discovery, and it is visual rather than verbal.
- **Trains** — point of view in a visual source; that a map is an argument.
- **Cost** — M (L if it needs real georeferencing). **Fits** — Units 1 and 2; any frontier or
  territorial-claim content.

---

### Group C — Sort

Cheap. Reuses drag machinery already in `main.js`.

#### C1 · Reconstruction Table

Exists, on all five maps. **Keep it** — it is a good closer and the filing metaphor is right. The
problem is that it is the _only_ closer. Once a mission's primary activity comes from Group A or B,
the Reconstruction Table can stay as the ending without being the whole middle.

#### C2 · Sequencing

Exists as a quest type. Carries a live defect: `renderSequencingQuest()` renders items in authored
array order and never shuffles, so a quest whose items are written `position: 0,1,2,3,4,5` **opens
already solved** and grades the student correct for touching nothing.

Unit 1 and Unit 5 author theirs scrambled. Units 2, 3 and 4 do not — four are directly visible in
`content/quests/`, and `ARCHITECTURE-QUICKREF.md` §5 records five counting alternates. **A
sequencing quest must be authored out of order.** Keep each item's `position` correct and its place
in the array wrong.

#### C3 · Spot the Alteration

- **The player does** — compares three versions of one document and identifies which was altered, and
  what the alteration was for.
- **Fun because** — pure deduction, fast, and it rewards close reading of small differences.
- **Trains** — purpose and audience; that documents are edited for reasons.
- **Cost** — S. **Fits** — any unit with a document that genuinely exists in variant printings.

---

### Group D — Break

Arcade pacing. **Never scored, never gates progress, never appears on a graded surface, stays out of
`quest-types/`.** Decision log `0028` establishes this split deliberately, and it should hold.

`cargo-sorting` and `storm-navigation` are **real and reachable**: `main.js` imports both, there is a
`mini-games` screen with a selection card for each, a "Try a Mini-Game →" button on the Navigation
Table, and an Author Mode toggle for the in-field Practice Check entry point.

So Group D is not a build task. The open question is **placement** — currently a break is something
you go to a separate screen for. A pacing break is more valuable when it arrives inside a mission,
between two heavy pieces of analysis, than when it sits behind a button on a menu.

---

## 5. The variety rule

This is the clause that makes this document a governance log rather than a wish list. **Binding on
new units.**

1. **Each unit's three missions must draw from three different groups.**
2. **No two adjacent units may share a primary activity.**
3. **Every unit ships at least one Group A entry** — or its map is a hallway again.
4. **No mission may ask for extended writing twice.** One written response per mission is the cap;
   extended AP writing belongs in an Archive Commission or in a single deliberate mission slot, not
   scattered across a source reader, a reflection, _and_ a quest.

Rule 3 is the important one. Groups B, C and D can all be built without any NPC ever becoming a
person, and if that happens the game will have more variety and still feel like a worksheet with a
map attached.

---

## 6. Retrofit shortlist for Units 1–5

Ordered by payoff per unit of work. None of this is scheduled; it is the queue to draw from.

| #   | Change                                                                          | Group | Cost |
| --- | ------------------------------------------------------------------------------- | ----- | ---- |
| 1   | Generalize `map-jigsaw` off `waldseemuller-map` so any unit can use it          | B1    | S    |
| 2   | Fix the pre-solved sequencing quests in Units 2–4 (author them out of order)    | C2    | S    |
| 3   | Case 1.02 "Atlantic Route Puzzle" → an actual route plot                        | B5    | M    |
| 4   | Units 4/5's composite documents → fillable forms with an omission question      | B3    | M    |
| 5   | Unit 5's "who the record counted" lane → a real tally against the ward register | B4    | M    |
| 6   | Substrate fields on Richmond's cast, then Corroborate/Contradict as the pilot   | A2    | M    |

Items 1 and 2 are small enough to do in a single pass and would measurably widen what Units 2–5 ask
of a student without any new engine capability.

---

## 7. What this document deliberately does not do

- **It does not implement anything.** No mechanic here exists yet beyond the ones marked as already
  built.
- **It does not change the Archive gate.** §1's inversion is decided in ADR `0050` and left for its
  own pass, because it touches progression and existing saves carry `progress.archiveChallenges`
  entries that must keep counting.
- **It does not adopt inkjs**, Phaser, or any new dependency. See §3.
- **It does not rename `archiveChallenge`/`archiveChallenges`.** See §1.
- **It does not restore any removed system.** Founder Paths, professions, Historian Skills and
  wardrobes stay out. In particular, A4's "want" is a per-scene willingness flag — **not** an
  inventory, not a currency, and not a reputation stat.
