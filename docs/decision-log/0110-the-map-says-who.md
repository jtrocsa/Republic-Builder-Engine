# 0110 — The map says who

**Phase 111 · 2026-09-05 · Accepted**

Seven of the twenty-four missions are interviews of six to eight people, and the map said nothing
about which bodies on it were part of one. Their instruction is "ask any question to any person";
the only way to find out who was listening was to walk up to all of them. The cast wears the badge
the record carriers have worn since Phase 56, and the Mission Tracker's progress bar became one pip
per thing the mission wants.

Third phase of the Beta Readiness program — see
[`BETA-READINESS-LEDGER.md`](../playtest/BETA-READINESS-LEDGER.md).

---

## 1. The one the owner asked for by name

Given four ways to make a mission's goal clearer, the owner took all of them and then wrote the
sentence that decides how: _"I don't want the playing screen to get more complex and have more text
everywhere, but I do agree that more clarity is good and quest markers above peoples' heads can be
good."_

That is not a contradiction, it is a constraint, and it is the program's binding rule stated from the
owner's side. Head markers are **graphics**. So the marker half is done in full, and the "ticking
checklist" half had to be found somewhere other than in words.

## 2. Nothing new is drawn

`fieldNpcButton()` has badged whoever is carrying a record since Phase 56 — `✦` while it is
available, `✓` once secured — and `.npc-source-badge` already styles both: gold and pulsing for the
first, green and still for the second. That is the "go and find Patrick Henry" signal the field
already had, and an interview's cast wants the player to answer the same question, "have I been to
them yet?"

So they get the same element, the same two marks and the same meaning. **No new class, no new CSS, no
new glyph.** `interviewSpeakerStatus()` returns `sourceAvailability()`'s own two strings for exactly
that reason: a second vocabulary for the same question is the synonym proliferation
`CHRONICLE-CANON.md` §8 forbids.

Three details that had to be decided rather than fallen into:

- **Secured means a useful answer logged, not having been spoken to.** Everything else in this engine
  counts `logged` rather than `asked`, and a player who heard a deflection and walked away has
  gathered nothing. A green badge there would be the head-badge version of the receipt Phase 110 had
  just finished fixing.
- **A carried record wins, and a locked one falls through.** Whoever holds a record keeps its badge;
  but a person whose record is not yet available may still be in the interview, and the honest mark
  is the one about the thing the player can do now.
- **The badge is `aria-hidden`**, so the state reaches a screen reader through the button's own
  accessible name — "has not been asked yet" / "account secured" — the same way the Mission Tracker's
  rows already carry theirs.

The badges appear only once the record that briefs the questions has been opened, which is
`liveFieldInterview()`'s existing rule and the right one: before that the cast genuinely has nothing
to be asked.

## 3. A checklist made of no words

The literal reading of "a ticking checklist" is a step list in the Mission Tracker, and it is the one
thing this phase was told not to build: the tracker is a 232px panel the owner had already called too
wordy, and three steps per mission is three more lines on the playing screen.

The tracker was already carrying a progress bar — a single filled proportion. It is now **one pip per
thing the mission wants**, first `done` of them filled. Same element, same space, no words at all,
and it answers the question a player standing on a map actually has: not "how far along am I" but
"how many more". That is the "collect five flowers" clarity the owner described, and it fits inside
the constraint rather than against it.

The pips flex rather than taking a fixed width, so a four-leg trace and a thirteen-slot reconstruction
both fill the same panel and a long board degrades to thinner pips instead of overflowing.

**It only works at all because of Phase 109.** A pip needs a count, and until three weeks of this
program ago only INTERVIEW reported one — seventeen of the twenty-four missions had no ratio to draw.

## 4. What was deliberately not done

- **No step list, and no new panel.** See §3.
- **The objective line was already there.** The plan called for one on the map; the tracker's
  progress line is it, and it needed nothing. Adding a second would have been the exact failure the
  program's rule names.
- **No badge for ASSEMBLY, DISCREPANCY or TRACE.** Their work is on a board rather than distributed
  across a cast, so there is nobody to mark and nothing a player has to search the map for.
- **The badge count is not asserted globally.** Several interior specs pin an exact
  `.npc-source-badge` count; those seed no live interview and are unaffected, and pinning a global
  count would make every future interview's cast a test failure.

## 5. The cost that had to come back out

The first version asked `liveFieldInterview()` for the answer inside `fieldNpcButton()`, which runs
**once per NPC per render** — nine times on Riverbend — and that function walks every source in the
case and asks each one's engine whether it is complete. A render-path cost multiplied by the cast,
introduced by a feature whose whole purpose is a two-character badge.

It is resolved once by the caller now and passed down. Worth recording for two reasons beyond the
arithmetic. The first is that the comment written at the time **described the problem accurately and
did not fix it** — it said the wrapper existed because the resolver was expensive per NPC, which is
true and was not a reason to keep calling it per NPC.

The second is what the fix turned up next to it: the call site was `map.npcs.map(fieldNpcButton)`,
so `Array#map` was already handing the **array index** to any second parameter the function grew.
Adding one with a default would have silently bound `live` to `0`, `1`, `2`. It is an arrow now.

## 6. What is not covered, and is worth knowing

**No visual baseline shows either change.** All 21 passed untouched: no baseline seeds a mission in
flight, so none has ever rendered the tracker's bar, and none seeds an open interview, so none has
ever rendered a speaker badge. That is `visual-regression.spec.js`'s own header warning — _a baseline
not moving is not evidence a change did not reach that map_ — landing for the second time in this
program. Both changes are proved in `field-source-anchors.spec.js` and `activity-engines.spec.js`
instead, the second measuring the pips' rendered widths rather than only their count.
