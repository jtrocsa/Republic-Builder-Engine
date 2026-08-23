# Part 11 — The Institute Archive

**Closed 2026-08-23.** Decision log
[`0087`](../decision-log/0087-three-cases-you-could-not-start.md).

What a Chronicler accumulates, and the screens that hold it: the Navigation Table's atlas, the
Codex, the Preservation Case and the two records behind it, and the status panel both hub rooms
carry. Part 5 walked these rooms; this part audits what is _in_ them.

Four S3s were routed here — **P5-9** and **P5-10** (atlas legibility and the hub's left column),
**P8-5** (the debrief's one-shot disclosures) and **P9-7** (the Codex forgetting its origin on a
reload). They are P11-5, P11-3, P11-2 and P11-6 below.

The first part of the program to produce an **S1**.

---

## Findings

All `A` (static audit), and three of the eight measured in a browser before being written down.
No owner pass was run.

| №     | S   | Category       | What                                                                                                                                                                                              | Outcome                                                                    |
| ----- | --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| P11-1 | S1  | `broken`       | **Three cases cannot be started.** Units 6 and 7 have no map view, so four of their six markers project outside an `overflow: hidden` atlas — and a marker click is the only way to select a case | Fixed. Two views, and a test that fails on the next missing entry.         |
| P11-2 | S2  | `hollow`       | (from P8-5) Every mission's liberties note and its flagged anomaly render in one place, behind a one-way flag                                                                                     | Fixed. Both file into the Codex entry.                                     |
| P11-3 | S2  | `unclear`      | (from P5-10) The hub status panel's own top edge is at y=593 of a 720px viewport — nothing in it is visible                                                                                       | Fixed. Panel top 593 → 346; nothing below the fold in either room.         |
| P11-4 | S2  | `inconsistent` | Two Archive screens still say "Sourcing Practice Check", which Phase 90H renamed one phase ago                                                                                                    | Fixed.                                                                     |
| P11-5 | S3  | `rough`        | (from P5-9) Case-marker labels are decluttered against each other and against nothing else                                                                                                        | Fixed. Each side scores its collisions; the cheaper one wins.              |
| P11-6 | S3  | `broken`       | (from P9-7) A reload on the Codex resets its origin and "← Return" leaves the Institute for the field                                                                                             | Fixed. `progress.codexOrigin`, the precedent `activeActivitySourceId` set. |
| P11-7 | S3  | `unclear`      | The Archive Rotation's empty state gives advice that is wrong in both of the states that reach it                                                                                                 | Fixed.                                                                     |
| P11-8 | S3  | `hollow`       | The Codex's "This case" is a heading and a note over an empty grid on the ten non-map cases                                                                                                       | Fixed.                                                                     |
| P11-9 | —   | —              | Nothing in the Preservation Case, the Skill Mastery Record or the rotation feeds a grade                                                                                                          | Checked and correct — see below.                                           |

---

## The one worth reading twice

**P11-1**, and it is the program's first S1.

The Navigation Table is the only screen that launches a case, and the only way to select one is to
click its marker: `unlockNext()` unlocks the next case without selecting it, and `select-unit` only
ever selects a unit's _first_. `.atlas-table` is `overflow: hidden`. So a marker outside its unit's
map view is not a cosmetic problem — it is a case with no way in.

`UNIT_MAP_VIEW` stops at `unit-05`. Units 6 and 7 fell through to the Atlantic box, and San
Francisco landed at left −24.9%, Manila at 196.3%. **Three of the game's twenty-one missions could
not be started**, and had not been since Unit 6 shipped in Phase 85.

The shape is one this file has recorded before in another table: **a per-unit table with a sane
fallback and no test.** CLAUDE.md already warns about it for `FIELD_COPY` — "forgetting one is
silent" — and the warning did not generalise on its own. It does now:
`navigation-table-views.test.js` reads the shipped units through the content repository, projects
every case, and fails on anything within 3% of an edge.

**A world map then showed what no other view could.** Four of the coastline file's 126 rings cross
±180, and each drew a 1px stroke straight across the table. The threshold that fixes it is safe
because the data has a cliff in it: seven segments at 358–360° of longitude, and the next largest
anywhere in the file is 9.0°.

---

## The thread nobody could re-read

**P11-2.** Six missions flag something on the record that should not be there, and they are one
thread rather than six curiosities: an altered entry in the Riverbend wharf book, then a corrected
broadside, a toll charged on next season's rate, a name washed out of a desertion list, a survey
variation dated 1934, and a literacy column ruled on a manifest — _ruled the way the Riverbend entry
was ruled_, every time.

All six rendered only on `missionDebriefScreen()`, behind a one-way `debriefed` flag. A player could
hold one link at a time and never two. They file into the Codex entry now, beside the liberties
note — which all twenty-one missions carry, and which is the game's honesty statement about its own
fiction.

The note is collapsed and the anomaly is not, deliberately: three bands of several lines each on
twenty-one records would bury the archive, and the anomaly is four lines and the thing a player came
back for.

---

## What was checked and found correct

- **P11-9.** The Preservation Case reads `completedCases`; the Skill Mastery Record aggregates
  `skillMastery`, which is a mirror of answers already given; the Archive Rotation writes only its
  own Leitner state and a cosmetic streak. None of the three unlocks anything, and none feeds a
  grade — which is the standing product rule that game progression never buys an advantage on
  assessment.

---

## Play script — 12 steps

Opens on `?warp=table` — the Navigation Table, with the Archive Room a walk away.

1. Open the Period 7 tab. → A world map: three markers, on three shores. No lines across it.

2. Click the Manila marker. → It selects, and the route panel's Chronotravel button carries that
   case. (Before this part it was at 196% and could not be clicked at all.)

3. Open Period 6 and click San Francisco. → The same. Three markers on a transcontinental map.

4. Go back to Period 1 and look at the Caribbean cluster. → "Empire's Foundations" hangs above its
   marker, clear of the CARIBBEAN SEA label under it.

5. Leave by "← Main Hall" and read the left column without scrolling. → The heading, the unit's
   name, your status panel, both counts, **Open Codex**, and the movement legend. All of it.

6. Walk north into the Archive Room and read that column. → The same, and the page does not scroll
   at all.

7. Press **Open Codex** from the side panel. → The Codex, with "This case" at the top.

8. Reload the page, then press "← Return". → **The Archive Room.** Not the field.

9. Open the Codex again and find a filed Riverbend record. → "Flagged for the Institute", the
   fourteen-hogsheads entry, and what the clerk's own hand says about it.

10. Open "The historical record" underneath it. → Three bands: documented, reconstructed, fiction.

11. Walk to the Preservation Case and open the Skill Mastery Record from it. → It calls the Practice
    Check by the name the button that opens it uses.

12. Open the Archive Rotation. → Either today's items, or "Nothing due today" — which no longer
    tells you to go and practise more.

---

## Routed onward

- **→ Part 12**: `arcClose`, the third thing the debrief shows once. It is about a **case**, and the
  Codex is a list of records grouped by unit — printing "what the three records make together"
  inside one of the three, with its two siblings beside it saying nothing, would misrepresent what
  it is. Part 12 owns the case close, and already has the `reconstruction` → `upload` → `review` →
  `completion` chain routed to it from Part 9.
