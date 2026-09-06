# Part 10 — The non-field missions

**Closed 2026-08-23.** Decision log
[`0089`](../decision-log/0089-a-mission-is-not-an-archive-challenge.md).

The last part of the program, and the only one with nothing routed into it. Fourteen of the
twenty-one cases are not walked: `route: "mission"` reaches `missionScreen()`, which frames that
case's own quest — one of the four teacher-swappable types — and nothing else.

**Fourteen, not ten.** The row this part was named in was written when there were five units; Units
6 and 7 added four more and nobody renumbered it. `main.js`'s Codex carries the same stale figure in
a comment. Both are corrected here.

---

## Findings

All `A` (static audit), and four of the seven measured in a browser across all fourteen missions
rather than read off the source. No owner pass was run.

| №     | S   | Category       | What                                                                                                                     | Outcome                                                                                |
| ----- | --- | -------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| P10-1 | S2  | `inconsistent` | **All fourteen missions announce themselves as "Archive Challenge complete"** — the one distinction that is load-bearing | Fixed. The card is told which of the two it is rendering.                              |
| P10-2 | S2  | `broken`       | A mission you finished yourself re-opens with the message written for a save that never answered it                      | Fixed. Two states, told apart by whether there is an answer.                           |
| P10-3 | S2  | `rough`        | Twelve of the fourteen print the date twice, side by side                                                                | Fixed. `caseWhereAndWhen()`, the helper Phase 90K already added.                       |
| P10-4 | S3  | `hollow`       | A finished mission's own work is saved and then shown nowhere                                                            | Routed → ADR `0091`. **Shipped in Phase 92**, read-only mode.                          |
| P10-5 | S3  | `unclear`      | The case number is missing from the kicker on twelve of the fourteen                                                     | **Fixed in Phase 105**, ADR `0104` — derived, no content changed.                      |
| P10-6 | S3  | `inconsistent` | The game cannot decide whether a non-field mission is a place you travel to or work you do at the Archive                | **Taken — Phase 115, `0114`.** Its cheap half — naming what unlocked — was fixed here. |
| P10-7 | S3  | `rough`        | Two places still say "ten of the twenty-one"                                                                             | Fixed in passing.                                                                      |

---

## The one worth reading twice

**P10-1 and P10-2 are one line of markup**, and it is worth quoting what a player who finished the
Bank War mission and came back to it actually sees:

> **The Bank War**
> Arrange the Bank War in the order in which each step made the next one possible. …
> _Archive Challenge complete — this collection has already been restored and preserved._

Three things are wrong in that sentence, and they are three different kinds of wrong.

**It calls a Mission an Archive Challenge.** `INVARIANTS.md` §34 is explicit that the two are
distinct and that the distinction is load-bearing — a mission is one case reached by Chronotravel
using the four swappable types; an Archive Challenge is a unit's `saq`/`dbq` at the Archive Terminal.
`archiveChallengeQuestCard()` is the shared core for both, and it hard-codes the Archive Challenge's
word into both of its completion strings. There is a test that fails if an SAQ is put in a case slot;
there was nothing checking what the screen then calls it.

**It is the migration message.** `alreadyComplete` exists to carry a save whose case was completed
before the Phase 58 split, when the quest behind it was never actually answered — hence "has already
been restored". But `missionScreen()` passes it `progress.completedCases.includes(kase.id)`, which is
true of **every** normally completed mission. So the affordance for old saves swallowed the ordinary
case, and a student who did the work is told their record was restored for them.

**"This collection"** is vocabulary that appears nowhere else in the game.

And underneath it, the thing that makes it more than copy: the player's answer **is in the save** —
`progress.questResponses` holds the order they arranged — and the screen returns 403 characters of
card with **zero quest controls**. It is stored and hidden. That half is P10-4 and does not get
fixed here: showing it means a read-only render mode across four quest types, which is a change to
the `QUEST_TYPES` contract, and this program fixes behaviour rather than shape. It shipped as
**Phase 92** — see decision log [`0091`](../decision-log/0091-the-answer-was-in-the-save-all-along.md).

---

## The rest

**P10-3.** `mission-meta` renders `location` and `date` as two chips. Twelve of the fourteen cases
already carry the date inside `location`, so they print "Washington, D.C. · 1816–1837" and then
"1816–1837". This is the same duplication the field screen's kicker had — Phase 90K extracted
`caseWhereAndWhen()` for it when the Preservation Case became a second consumer, and this is the
third. The two that genuinely need the append (case-005 "The Atlantic circuit", case-006 "The
thirteen colonies") are exactly the two the helper already handles.

**P10-5.** `caseNumberLabel()` derives the number from a `"Case N.NN — Name"` title prefix, and only
Unit 1's cases carry one — so twelve kickers read "Period 4 · 1800–1848" where Unit 1's read
"Case 1.02 · Period 1 · 1491–1607". Already on the quickref's known-outstanding list as an activity
eyebrow problem; the same root cause, now measured on the mission screen too. The fix is to number
Units 2–7's case titles or to stop the eyebrow trying, and both are content decisions.

**Taken in Phase 105 (decision log `0104`), and the routing above is the part worth keeping.** Those
two options are the only options if the number has to be authored, and it does not: a case's number
is its unit's number and its own position within that unit, both of which `caseNumberLabel()` already
had in reach. It derives the number now, all twenty-seven missions have one, and **no content was
edited**. The same empty string was reaching five other surfaces, each with a different fallback —
the activity eyebrow, two Codex listings and two teacher headers — so this closed the quickref's
known-outstanding activity-eyebrow item at the same time.

**P10-6.** Every case goes through `goToCase()`, so a non-field mission plays the full Chronotravel
warp onto its unit's painted plate, announcing a place and a date. The Codex, one screen away, says
of the same case: "This case has no field records — **it is worked from the Archive**, out of what
you have already filed." And the exit is a plain "← Navigation Table" — no transmission, no recall
warp, where a field case gets both. Three surfaces, three answers. Which one is right is a design
decision rather than a bug, and it goes to an ADR. Its cheapest true half is fixed here: nothing
told the player that finishing the mission had just unlocked the next case, which it had.

**Taken in Phase 115 (decision log `0114`), and the count above is what decided it.** Three
surfaces, three answers — but two of the three said the same thing, and so did the Navigation
Table's button, which reads "Open The Exchange Ledger" rather than "Initiate Chronotravel". The
warp was alone, and it had no picture to stand on: a plate is keyed by unit, so on sixteen of the
twenty-four cases it painted one place while the card named another. A Kansas cattle railhead under
"Chicago, Illinois · 1893"; a 1957 suburban boulevard under "The United States Senate · 1 June
1950"; wartime Richmond under a card reading 1846–1861. **Only a case with a map travels now**, which
is eight of the twenty-four, and canon rule 3 had licensed exactly that all along — the Navigation
Table opens a passage through a _strong_ imprint.

**P10-7.** `main.js`'s Codex comment reads "Ten of the twenty-one cases are non-map missions" and
this program's own ledger row was titled "The ten non-field missions". Both were written at five
units. It is fourteen.

---

## Play script

`?warp=table` opens the Navigation Table. Twelve steps.

1. Select **Case 1.02, The Exchange Ledger**, and press Chronotravel. → The warp plays and names a
   place and a date, exactly as it does for a walked case.

2. Read the eyebrow above the title. → "Case 1.02 · Period 1 · 1491–1607".

3. Read the chip under the summary. → One chip, a place and a date, and **the date appears once**.

4. Place one record in the wrong slot. → The line under the board tells you what to do next without
   telling you the answer.

5. Finish the mission correctly. → "**Mission** complete", not "Archive Challenge complete" — and it
   names the case that just unlocked.

6. Press "← Navigation Table" and re-enter the same mission. → It still says Mission complete, and it
   does **not** say your record "has already been restored" — you restored it.

7. Select **Case 1.03, Empire's Foundations**. → A different quest type from 1.02's.

8. Now go to Unit 4 and open **The Bank War** (case-011). → Its eyebrow has no case number, which is
   P10-5 and is expected until the content decision is taken.

9. Read its chip. → "Washington, D.C. · 1816–1837", with the year printed once.

10. Open **The Removal Message** (case-012), a HIPP mission. → Four dimensions, and a line that asks
    for how or why rather than naming.

11. Open the Codex from the hub side panel while a non-field case is active. → It says this case is
    worked from the Archive rather than showing an empty grid.

12. Walk to the Archive Terminal in the Archive Room. → Archive Challenges — the unit's written
    work — and **not** any of the fourteen missions above.
