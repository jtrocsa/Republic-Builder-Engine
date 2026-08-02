# 0054 — Missions that hand themselves over

**Phase 71 · 2026-08-02 · Accepted**

Extends [0052](0052-making-the-missions-legible.md) (the instruction fields) and
[0053](0053-riverbend-on-the-engines.md) (Riverbend's three missions). Amends `0052` §2 on what a log
control is offered for, and §5 on the Mission Tracker's shape.

## Context

The owner played Case 1.01 and Riverbend end to end and reported four things. They are one complaint
with four surfaces: **the mission explains itself in the wrong place, at the wrong length, and the
world does not back the explanation up.**

> "for m1 … the 'how this works'. I want that information to be a separate screen first."
>
> "the instructions in this quest are still a little confusing because it says, there are no wrong
> people to ask … and then later, every one of the seven people knows one thing worth writing down
> which makes it sound like there is only one answer per person."
>
> "What's interesting is that it makes sense to ask each person all the questions and just collect
> all the information … I would just interact with one person and click through all the dialogue
> options and log all of them. That's not very fun."
>
> "why not just replace the elder name with the mission name and then the Open Notebook button is
> right below that and you can eliminate that extra UI you added"

## The finding this pass turns on

`SpeakerSchema.fallback` is required, is authored on all fifteen speakers across the two interviews,
and its own schema comment calls it _"what an unasked question gets."_ **Because every speaker
answered every question, not one of those fifteen lines could ever fire.** They were already written
in exactly the register the complaint asks for — _"She turns back to the row she was working," "He
looks at you, then at his feet."_ The mechanism for a sparse grid was built, authored against, and
unreachable.

So the third complaint is not a request for a new mechanic. It is a request to stop overriding one.

---

## 1. Mission Instructions is a screen, not a panel

`0052` §10 records the owner asking for "an instruction screen explaining the quest." That was
answered with a panel in the activity's copy column — beside the board it was meant to explain, where
a player already looking at the board does not read it. This is the same content given its own beat,
and framed the way the owner asked for: **an MMO quest hand-off.** The giver's portrait, their name
and role, the line they hand it over with, then what they want done.

**Deliberately not a new screen id.** The four engine keys already double as `VALID_SCREENS` entries
and as content's `activityRoute`, so a fifth would be a save-compatibility change buying nothing.
This is the activity screen's first state — the same call as the Entrance Hall being a room rather
than a screen (`0046`). It is gated on **`briefed`**, which joins `state` and `completed` on that
record's `progress.sourceActivities` entry; a pre-Phase-71 save reads `undefined`, sees the screen
once, and that is the intended migration.

**The giver resolves in three tiers, and none of them invents content.** Whoever `briefing.speaker`
names; failing that, whoever carries the record on the map; failing that, nobody — the plate shows the
engine's own mark over the record's name and says "Nobody handed you this one." `waldseemuller-map`
is the third tier and stays that way: a sheet found on a shore was handed over by no one.

`briefing` moved from `interview.js` into `COMMON_ACTIVITY_FIELDS`, since a mission with no giver
opens on a plate with nobody on it. Three lines were authored for the records that a person plainly
does hand over — Columbus's letter, Frethorne's letter, the wharf ledger.

**No new art.** `characterSheet()` already builds a `portrait` PNG for every character and throws at
boot if one is missing, so every field NPC has had a committed portrait all along.

**The Begin button sits in the giver's column, not under the instructions.** At 1366×768 — the
Chromebook this game is built for — a heading, an intro, three steps and a glossary put anything below
them off the bottom of the screen, and a continue button a player must scroll to find reads as a
screen that has hung. It also reads correctly there: you accept the job from the person offering it.

## 2. Three steps, capped at four

> "you are writing a lot of instructions, usually 5-6 bullets. so, one, condense this."

All six authored `howItWorks` lists are now three steps and a note, and `HowItWorksSchema.steps`
carries `.max(4)` so the rule holds for Units 3–5 rather than living in a document. A wall of
instructions is the same failure as no instructions, arrived at from the other side.

The two interviews also lose a real contradiction. "There are no wrong people to ask" and "every one
of the seven people knows one thing worth writing down" read as opposite claims. The owner's
replacement is the first step now, verbatim:

> **You may ask any question to any person. Consider their position.**

## 3. The interview grid is sparse, and that is the point

Measured before: **28 of 28** authored cells in Unit 1, **32 of 32** in Unit 2, with Unit 2's flat
answers averaging 31 words against 73 for its useful ones and exactly **one** of its 24 being a plain
"I can't help you." Nobody deflected, so there was nothing to read a person's position _for_, and
asking everyone everything was strictly dominant.

Now, per speaker: **one useful answer, two short deflections that mostly name who to ask, and one
question left unauthored so their fallback fires.** Unit 1 is 21 authored cells of 28; Unit 2 is 24
of 32. Flat answers average 15 words against 37 useful in Unit 1 — a gap a player can feel at a
glance.

**Six flat answers were trimmed rather than cut**, because they key the two audits' optional
observations and that cross-activity link is `0052` §8's whole cause-and-effect mechanism:
`columbus:grows`, `columbus:decides`, `taino-elder:gold`; `indentured-servant:passage`,
`wharf-clerk:land`, `settlement-burgess:owed`. No useful answer, closer or claim was touched — the
history is not being rewritten, only the deflections around it.

## 4. A fallback offers no log control

Falls straight out of §3, and closes a hole §3 opened. A fallback is a stage direction, not
testimony, so there is nothing in it to write down. `interviewAnswer()` now reports `authored`, the
field bubble draws no **Log this response** for an unauthored answer, and `actInterview`'s `log` verb
refuses one — the control is a hint and the reducer is the lock, the same discipline as the closer's
`disabled` attribute.

This makes the loggable surface 21 cells rather than 28, and makes a deflection read as what it is:
somebody with nothing for you.

## 5. The Mission Tracker is one block, with a bar

It was printing the same mission twice — once as the carrier NPC on the record row, once as a heading
below it — in a 232px panel.

- **The in-flight record's row takes the mission's name.** A record you have not opened still names
  the person carrying it, because that is what you can spot across the map; once you have it open you
  already know where it came from, and what you want back is what you are holding.
- **The name heading and its divider are gone.** The progress line and the notebook button remain.
- **The count is one string and there is a bar under it.** `<b>2</b> of 7` was three flex children
  under `space-between`, so a 232px panel put a gap either side of the number and the line read as
  three separate things. It is `2/7` with a filled track beneath.
- **The bar is CSS, not a generated asset.** The owner offered PixelLab credits; the panel narrows to
  200px under 1400px, so a bitmap bar would need slicing or accept blurring, and the tracker is UI
  chrome in the blue/gold material rather than part of the pixel-art world.
- **A TRACE gets no line and no bar.** It declares no `summary()` — a chain is not a count — which is
  the honest answer rather than a gap to fill.

Also fixed while in there: `.field-tracker__mission` had no horizontal padding, which is why the
notebook button was the only full-bleed control in the game.

## Consequences

- **`briefed` is a new persisted field**, per record, inside `progress.sourceActivities`. Absent on
  older saves, which is why it is read as falsy rather than merged in.
- **Every e2e path into an activity now passes through a screen.** `briefed(...)` in
  `tests/e2e/helpers/progress-seed.js` is the seed for specs that are not about the gate.
- **Two authoring rules are enforceable rather than documented**: `howItWorks` is capped by the
  schema, and `tests/unit/activity-content.test.js` now requires a sparse grid (at least two answers
  per speaker, at least one gap), a flat answer under 40 words, and any `briefing.speaker` to be a
  real NPC on that unit's map.
- **The assertion "every speaker answers every question" is inverted, not deleted.** Holding to it is
  what produced the problem, and the test file says so where the assertion used to be.
- Six activity baselines shifted, all in the copy column only; two were added for the new screen.

## Not done here

- **No new engine, no fifth activity kind**, and no NPC substrate fields.
- **No content for Units 3–5.** The standing queue (catalog §6 row 8) is untouched — 18 records still
  route to the plain reader.
- **No PixelLab spend and no new art.**
- The four pre-solved sequencing quests in Units 3–4, the Archive gate inversion, and the Archive Room
  all stay where they are.
