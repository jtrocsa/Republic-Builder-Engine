# 0114 — The painting was of somewhere else

**Phase 115 · 2026-09-06 · Accepted**

The last routed finding from the Spine Review that was not a bug: **P10-6, "the game cannot decide
whether a non-field mission is a place you travel to or work you do at the Archive."** Part 10 sent
it here because which answer is right is a design decision. It turns out the game had already
answered it on three surfaces out of four, and the fourth had no picture to stand on.

---

## 1. The question, and the vote

Twenty-four cases ship in the eight playable units. **Eight walk a map. Sixteen do not** — one case
per unit walks, and the other two are a record and a quest about it. Both kinds go through
`goToCase()`, and until this phase both played the full Chronotravel warp: a two-second tunnel, a
painted plate, a place and a date, "Anchor holds", and a gold prompt reading "Follow the evidence →".

What the other surfaces say about the same sixteen cases:

| Surface                 | Says                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| Navigation Table button | **"Open The Exchange Ledger"** — not "Initiate Chronotravel"           |
| The Codex               | this case **has no field records**, it is worked at the Archive        |
| The way out             | a plain **`← Navigation Table`** back link, no recall, no transmission |
| The Chronotravel warp   | you have **arrived** at a place, on a date                             |

Three to one — four, if you count the design document the warp screen was built from, which lists
the transitions this game has and calls the second one _"a **warp / Chronotravel** to a field map
(from the Navigation Table)"_. Phase 88A wrote that down and then wired it to every case.

And `archiveChallengesScreen()`'s own comment, written when Phase 58 split the two
groups apart, had already drawn the line the other three were on: what belongs in the Archive Room
is "extended written responses a Chronicler composes at a desk … **not a mission with a place and a
date**." A mission has a place and a date. It does not follow that the player goes there.

## 2. What the painting actually shows

A plate is keyed by unit, and that file argued for it in a sentence that is simply not true: _"a
unit is one place and one era — Unit 1's three cases are all the 1493 Caribbean whether they route
to a field map or not."_ It is true of Unit 1, which is why nobody caught it. It is true of a unit
because a unit's **map** is one place, and only one case per unit is on that map.

Set the sixteen against the painting they opened on:

| The plate                                    | The card printed over it                          |
| -------------------------------------------- | ------------------------------------------------- |
| A Kansas cattle railhead, 1873               | Chicago, Illinois · 1893                          |
| A 1957 suburban boulevard, chrome-heavy cars | The United States Senate · 1 June 1950            |
| The same boulevard                           | Selma, Alabama, and the Capitol · 1965            |
| Wartime Richmond at dusk, a Confederate flag | Washington, D.C. · 1846–1861                      |
| An Erie Canal lock town                      | New Echota, Cherokee Nation (Georgia) · 1830–1838 |
| The immigrant wharf at Ellis Island, 1907    | The Western Defense Command · 1941–1944           |

**Two of the sixteen match** — Case 1.03 in the Spanish Caribbean and Case 3.02 in Philadelphia,
both of which happen to share their unit's map. On the rest the screen names one place over a
painting of another, and prints _"Anchor holds"_ underneath. On Unit 5 it does it to the decade as
well: a Confederate capital at war, captioned 1846–1861.

No amount of care fixes that, because the fix is sixteen more paintings, and
[`chronotravel-plates.js`](../../apps/web/src/content/chronotravel-plates.js) exists to explain why
there will not be sixteen more.

## 3. The sentence that was there all along

[`CHRONICLE-CANON.md`](../design/CHRONICLE-CANON.md) §2, rule 3:

> **The Navigation Table opens a passage through a _strong_ imprint.**

_Strong._ The canon has never said every surviving record opens a passage — it says the strong ones
do, which is the same rule that makes travel object-led rather than date-led two paragraphs later
("every map in the game is anchored to a document"). Eight documents in this game are anchored
strongly enough to stand on. The other sixteen are read.

That is the decision, and it needed no new fiction to take.

## 4. What changed

**`goToCase()` sends a case with no map straight to its own `route`.** The warp is now reached only
by a case whose route is `field`.

- The sound splits with it: the `chrono` sweep stays with the journeys, and opening a record plays
  `dialogue`, this game's generic two-note _opened_ cue, already used for a hub object that is not
  the trophy shelf.
- The screen id falls back the same way `leaveWarp()`'s does — `route || "archive"` — because
  `route` is authored content naming a screen, in both places.
- The Codex line, which was the surface telling the truth, now tells it accurately: it used to say
  the case was worked "out of what you have already filed", and a mission's quest is built from its
  own record rather than from the player's Codex. It reads _"This mission has no field records — it
  is read here at the Archive, from the record itself."_
- `warpArtUrls()` keeps its non-field branch. `currentScreen` is persisted, so a student who was
  mid-warp when this deployed resumes inside one, and `leaveWarp()` still hands them over correctly.
  There is a test for that path specifically.

**Chronotravel now happens eight times in the game instead of twenty-four**, and every one of the
eight opens on a painting of the ground the player is about to stand on. The ceremony is not
reduced by being rarer; that is the only thing that made it a ceremony.

The other arithmetic: the warp holds a player for `WARP_TUNNEL_MS + WARP_DWELL_MS` — 2000 + 2500 —
before the prompt it then waits on. **Sixteen of every twenty-four case openings just gave back four
and a half seconds of held screen**, in a program whose binding constraint is that clarity is paid
for by taking things away.

## 5. What did not change

- **The warp itself**, in every respect. Same screen, same two beats, same plate table, same key.
- **The back link.** `← Navigation Table` was always right for a case the player never left the
  Archive for, and it is now right for the stated reason rather than by accident.
- **`caseWhereAndWhen()` on the mission board.** A record has a place and a date; that line is about
  the record, and it was never a claim about where the player is standing.
- **The plate table's key.** Keyed by unit is correct — it is just correct for one case per unit,
  which is what the header now says.
- **No content was edited**, and no authored word changed.

## 6. Why nothing could see it

`tests/unit/chronotravel-plates.test.js` opens with _"a wrong plate is not an error at runtime. It
is a screen that shows the Caribbean on the way to Kansas."_ It then guards the table: every unit
has a plate, no plate names a unit that does not exist, every plate has its file, the directory and
the table agree. **All four read the table, and the table was never wrong.** The defect was in which
cases were pointed at it.

`warp-screens.spec.js` did assert the old behaviour, in a case named _"carries a non-map mission
too, and lands on its own screen"_, with the reasoning written out: _"the plate is the unit's era
rather than a picture of a map that this case does not have."_ It seeded **case-002** — one of the
two that nearly match. A guard that picks its own example picks the flattering one.

Three guards now:

1. `chronotravel-plates.test.js` pins **exactly one `route: "field"` case per unit**. That is what
   makes "keyed by unit" a true statement rather than a convenient one: two field cases would put
   one painting in front of two arrivals, and none would leave a painting nothing opens on.
2. `warp-screens.spec.js` drives **Case 6.02 from the Navigation Table** — the Chicago-behind-Kansas
   one — and asserts the mission board with no `[data-warp]` on the page. Driven from the table
   rather than seeded on a screen, because the claim is about which screen the button reaches.
3. The same file keeps the resumed-mid-warp path, so the branch left in `warpArtUrls()` has a reader.

Reverting the one-line route change fails guard 2 by name.

## 7. Still open

**P12-7** — `progress.unitComplete` and `progress.completedUnits` are written and read by nothing —
is now the last routed S3 in the repository. `0088` §5 states its condition: whoever next has real
cause to ask _which units has this student finished_ should use `completedUnits` and delete
`unitComplete`. This phase had no such cause and did not invent one.
