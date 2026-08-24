# 0089 — A mission is not an Archive Challenge

**Phase 90L · 2026-08-23 · Spine Review Part 10 — the non-field missions**

Part file: [`part-10-the-non-field-missions.md`](../playtest/part-10-the-non-field-missions.md).
Supersedes nothing. **Closes the Spine Review**, thirteen parts, started 2026-08-03.

---

## 1. One line of markup, three kinds of wrong

Fourteen of the twenty-one cases are not walked. `route: "mission"` reaches `missionScreen()`, which
frames that case's own quest and nothing else. Here is what a student who finished the Bank War
mission and came back to it saw:

> **The Bank War**
> Arrange the Bank War in the order in which each step made the next one possible. …
> _Archive Challenge complete — this collection has already been restored and preserved._

**It calls a Mission an Archive Challenge.** `INVARIANTS.md` §34 says the two are distinct and that
the distinction is load-bearing: a mission is one case reached by Chronotravel using the four
swappable types; an Archive Challenge is a unit's `saq`/`dbq` at the Archive Terminal.
`archiveChallengeQuestCard()` is the shared core for both and hard-coded the Archive Challenge's word
into both completion strings. `retired-archive-challenges.test.js` already fails if an SAQ is put in
a case slot — the **content** split was guarded and the **word the screen prints** was not, which is
the more visible half of the same rule.

**It is the migration message, shown to someone who did the work.** `alreadyComplete` exists to carry
a save whose case was completed before the Phase 58 split, when the quest behind it was never
actually answered — hence "has already been restored". `missionScreen()` passes it
`progress.completedCases.includes(kase.id)`, which is true of **every** normally finished mission.
The affordance for old saves swallowed the ordinary case, and had since Phase 58.

The fix is to tell the two apart by the thing that actually differs — whether there is an answer
behind the completion. `questAnsweredAny()` already answers that, and both sides are now tested,
because keeping the migrated case working is the whole reason the branch exists.

**"This collection"** is vocabulary that appears nowhere else in the game, and is gone.

## 2. What the screen still will not show

The player's answer **is in the save**. `progress.questResponses` holds the order they arranged, and
the completed card returns 403 characters with **zero quest controls**. It is stored and hidden — on
fourteen of twenty-one missions, with no Codex entry either, because the Codex holds field records
and says so.

Not fixed here, deliberately. Showing it means rendering a finished quest **read-only**, which none
of the four types can do: `renderQuest(type, quest, state)` has no disabled mode, and adding one is a
change to the `QUEST_TYPES` contract that all six types implement. Re-rendering it _editable_ is
worse than the current state, not better — grading is recomputed on every render, so a student who
changed a placed record would watch "complete" flip back to a hint while `completedCases` kept the
case archived, which is the same both-sides-disagree failure Phase 90F spent a whole part closing on
the activity engines.

So it is a real gap with a real fix, and the fix is a phase rather than a patch. **A read-only render
mode is the shape to build**, and building it also gives the Practice Check and the Archive
Challenges the same affordance for free.

## 3. Three surfaces, three answers about what a non-field mission is

Worth writing down because nothing is broken and the inconsistency is still real:

- `goToCase()` sends **every** case through `travel`, so a non-field mission plays the full
  Chronotravel warp onto its unit's painted plate and announces a place and a date.
- The Codex, one screen away, says of the same case: "This case has no field records — **it is
  worked from the Archive**, out of what you have already filed."
- The exit is a plain "← Navigation Table". No transmission, no recall warp, where a field case gets
  both.

Which of the three is right is a design decision about what these fourteen missions _are_, and it is
the owner's. Its cheapest true half is fixed here: finishing one now names the case it just opened.
`unlockNext()` has always unlocked the next case and never said so, and on a mission there is no
field to walk out of and no beam to watch — the only signal was a marker changing colour on a screen
the player had to go and find.

## 4. Ten, for two units

The row this part was named in — "The ten non-field missions" — was written when there were five
units. Units 6 and 7 added four more. The figure had propagated to `main.js`'s Codex comment,
`INVARIANTS.md` §33, `MISSION-ACTIVITY-CATALOG.md` §, and the quickref line written one phase ago;
all are corrected. Closed part files and earlier ADRs keep theirs, because they are records of what
was believed then.

It is the same failure mode as the tables in `0087` and `0088`, in prose rather than in code: **a
count is a claim, and a claim with no test drifts silently.** There is no reasonable test for a
number in a comment. There is a reasonable habit, which is to write "every case whose route is
`mission`" instead — which is what the new spec's own list is derived against.

## 5. The program is closed

Thirteen parts, 2026-08-03 to 2026-08-23. It produced one S1 (`0087` — three missions that could not
be started), and its recurring find across the last three parts was one shape: **a per-unit or
per-case table with an entry for the first unit or two, a sane-looking fallback, and no test.**
`UNIT_MAP_VIEW`, `UNIT_REVIEWS`, `UNIT_BADGES`, `FIELD_COPY`, `LIAISON_MAPS`,
`build-field-guide.js`'s four. Every one of them shipped working for Unit 1 and quietly wrong for
the rest, and not one of them ever failed.
