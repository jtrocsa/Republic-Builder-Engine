# Part 5 — the Archive Room and the Navigation Table

The two surfaces the intro hands the player to, and the loop every case in the game goes through.
**Closed 2026-08-22.** Decisions in [`0080`](../decision-log/0080-the-hub-stops-contradicting-itself.md).

Parts 1–4 routed nothing here — the tour now leaves the player at the Archive Room door and Voss
leaves them at the Navigation Table, which is where this part's script starts. So this ran the
protocol in its intended order for the first time: **static audit before anything was played**, and
all twelve findings below came out of reading rather than out of an owner pass. That is the
program's own claim about itself being tested — that a part still produces fixes in a week nobody
plays — and it held.

---

## Findings

All `A` (static audit). No owner pass was run; nothing here needed one.

| №   | Sev | Cat            | Finding                                                                                                                                                                                                                                                                                             | Outcome                                                                         |
| --- | --- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | S2  | `broken`       | `nearestHubTarget()` was built on `Array#find`, so it answered with the first in-reach target in **declaration order**, not the nearest. `julian` is declared two entries above `table`, and his route's east stop (18.5, 9.4) sat 1.4 tiles from the Navigation Table — inside its 1.65 reach.     | Fixed. Sorts now, and his stop moved to 16.0.                                   |
| 2   | S2  | `broken`       | The Main Hall named Unit 1 in eight places. Its progress line divided `progress.completedCases.length` — a **global** count of every archived case — by a literal `3`, so a student in Unit 6 read "**18 / 3** Unit 1 cases archived".                                                              | Fixed. One shared `activeHubUnit()`.                                            |
| 3   | S2  | `broken`       | The Navigation Table's back link ran `home`, which calls `safeInstituteSpawn()` with its default (11.5, 9). The table is at (18.5, 8). Every open-and-close of the table moved the player seven tiles west of the object they had just walked to.                                                   | Fixed. `hub-return` leaves the player where they were.                          |
| 4   | S2  | `inconsistent` | The Archive Room's exit door rendered **two names at once**, about eighty pixels apart: the marker pill said "Leave Archive", the interact prompt said "Press E · Institute Foyer". The room it opens onto is called the Main Hall everywhere else, including by that same door's own `role`.       | Fixed. Both say "Main Hall", matching the door on the other side of it.         |
| 5   | S2  | `inconsistent` | Both hub rooms rendered `<h1>Institute Archive</h1>`. Walking through the door changed the kicker and not the headline.                                                                                                                                                                             | Fixed. The Archive Room is called the Archive Room.                             |
| 6   | S2  | `unclear`      | Six of the seven unit tabs — this screen's only route to any unit but the selected one — sat **below the fold**, and the page grew a 1001px scroll height against a 720px viewport to hold them. Measured, not estimated; see below.                                                                | Fixed. All seven visible, no page scroll.                                       |
| 7   | S2  | `inconsistent` | "Reset Unit 1 demo" wipes `completedCases`, `unlocked`, every response and all case evidence, for every unit. A Unit 6 student reading the label loses the year.                                                                                                                                    | Fixed. It says what it does.                                                    |
| 8   | S3  | `broken`       | The field screen carries **two controls that both claim to recall you**: the in-world beacon (`field-recall` — warp, notice, spawn at the table) and a back link labelled "← Recall to Institute" running `home` (instant cut, no notice, centre-room spawn). The second bypasses Phase 88A's warp. | **→ Part 6.** The field runtime is that part's subject, not this one's.         |
| 9   | S3  | `rough`        | Case-marker labels collide with the atlas's own place labels — "Empire's Formations" sits on "CARIBBEAN SEA". `declutterMarkerPositions()` declutters markers against each other and knows nothing about `view.labels`.                                                                             | **→ Part 11**, with the Codex and the badge case, as one atlas-legibility pass. |
| 10  | S3  | `rough`        | Both hub rooms' left columns still run past the fold at 768: the Codex button and the controls legend are below it in each.                                                                                                                                                                         | **→ Part 11.** Same column, same pass.                                          |
| 11  | S3  | `hollow`       | "Archive Challenges for this unit are still being cataloged" exists in three places and **all seven units have challenges**, so none of the three can render. One of them is dead twice over: the Archive Terminal's `dialogue()` never runs, because its `action` branch returns first.            | Kept. They are honest fallbacks for a unit authored without challenges.         |
| 12  | S3  | `inconsistent` | `CLAUDE.md` lists the units under their **cases'** names — "The Atlantic Crossroads" is case-001, "Common Cause" is case-007's `shortTitle`. The units are "The Atlantic World" and "Revolution and Founding".                                                                                      | Fixed in the same commit. It is the file every session reads first.             |

## The one worth reading twice

Finding 1 is the interesting one, and not because of the sort. **It survived because the click path
never had the bug.** `handleHubClick`'s `hub-interact` branch passes `target.dataset.target` straight
to `interactWithHubTarget()`, so clicking the Navigation Table's marker has always opened the
Navigation Table. Only `E` goes through `nearestHubTarget()`. A mouse never reproduces it, and the
professor is walking a circuit, so a keyboard reproduces it perhaps a third of the time.

The workaround is in the tree too: Julian's hub dialogue carries an **"Open Navigation Table →"**
button, which is the only NPC dialogue in the game with a shortcut to somewhere else. Somebody hit
this and built a way past it rather than finding it.

## What was measured

The unit tabs, in the browser, at the suite's own viewport — old left column reconstructed in-page so
the before number is real rather than estimated:

|        | page scroll height | h1 height | tabs below the fold |
| ------ | ------------------ | --------- | ------------------- |
| before | 1001px (vh 720)    | 173px     | **6 of 7**          |
| after  | 720px — no scroll  | 114px     | 0                   |

Three things bought that, and the cheapest was the biggest: the tab label dropped its `· Locked`
suffix, which three other things already said (the button is `disabled`, it renders at 0.45 opacity,
and the legend directly above it spells out "○ Teacher locked"). The date range moved to `title`
rather than out of the game.

## Play script

Twelve steps, opening on `?warp=hub` — the Main Hall, which is where the walk starts.
(`?warp=table` opens the Navigation Table _screen_ directly and skips steps 2–4, which is the half
of this part that is about walking to it.) Kept for the owner; steps 2, 5, 6, 9 and 11 are banked in
`tests/e2e/archive-navigation.spec.js`.

1. `?warp=hub` → the Main Hall, at the foyer entrance.
2. Read the left panel. _It names the unit you are actually in, and the case count is over that
   unit's own total._
3. Walk east down the south aisle to the dais. _Professor Park is on his circuit and stops short
   of it — he is never standing on the cell you interact from._
4. Stand at the table's south face and press **E**. _The table opens. Not the professor._
5. Click "← Main Hall". _You are standing where you left, still in reach — a second E reopens it._
6. Press **E**, then click each Period tab in turn. _All seven are on screen. The page never
   scrolls._
7. Pick a locked period. _It is visibly unavailable; hovering names the years._
8. Back to the hall, walk north through the Archive Room door.
9. Read the headline. _"Archive Room" — not the name the room you just left was using._
10. Walk to the Archive Terminal, press **E**. _Archive Challenges for the active unit._
11. "← Return to Archive Terminal", then walk to the south door. _The pill and the prompt say the
    same thing._
12. Press **E**. _Main Hall, standing just south of the door you came through._

## Routed onward

- **→ Part 6**: finding 8, the field's second recall control.
- **→ Part 11**: findings 9 and 10, both left-column/atlas legibility, as one pass.
- Nothing else is open.
