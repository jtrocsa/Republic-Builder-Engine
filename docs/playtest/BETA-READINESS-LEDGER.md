# Beta Readiness — ledger

A five-phase program taking Chronicle from content-complete to something a class of students can be
handed, plus the one pass its last phase routed forward. Started and finished 2026-09-05, from an
owner playthrough the night before.

**This is the only file to read for program state.** A phase's reasoning lives in its ADR; this
ledger holds status and counts and never finding text. Modelled on
[`PLAYTHROUGH-LEDGER.md`](./PLAYTHROUGH-LEDGER.md), which ran the Spine Review, and carrying two of
its rules forward because that program broke each of them at least once: **a deferred finding must
name a destination**, and **a phase's row is updated in the same commit as its fix.**

---

## The binding constraint

> **Every clarity gain is paid for by removing text elsewhere. Net visible words on any playing
> screen must go down, not up.**

Owner's call, 2026-09-05, on being offered an objective line, head markers and a ticking checklist:
_"I don't want the playing screen to get more complex and have more text everywhere, but I do agree
that more clarity is good."_ Head markers are graphics. The objective line and the checklist replace
text rather than joining it. **A phase that adds a panel has failed this program even if the panel
is good.**

The second standing rule, from the same conversation: **loud action, honest judgment.** Every
_action_ gets an unmissable signal — this counted, this did not, this person still has something.
The historical _conclusion_ keeps the three-state closer it already has. Nothing calls a student's
reading of a source wrong outside that closer, because
[`CHRONICLE-VOCABULARY.md`](../design/CHRONICLE-VOCABULARY.md) §2 defines "Not enough evidence" as
_a finding, not a failure_, and that is the pedagogy rather than a wording preference.

---

## Status

| Phase | ADR    | Name                                     | Status     | Closed     | Open |
| ----- | ------ | ---------------------------------------- | ---------- | ---------- | ---- |
| 109   | `0108` | The column says it twice                 | **closed** | 2026-09-05 | —    |
| 110   | `0109` | Every action lands                       | **closed** | 2026-09-05 | —    |
| 111   | `0110` | The map says who                         | **closed** | 2026-09-05 | —    |
| 112   | `0111` | The field never adopted the escape hatch | **closed** | 2026-09-05 | —    |
| 113   | `0112` | Look at the room                         | **closed** | 2026-09-05 | —    |
| 114   | `0113` | The eye cannot find what is not drawn    | **closed** | 2026-09-05 | —    |

Phase 114 is the routed S3 from 113 rather than a sixth phase of the programme: the outdoor half of
the same sweep, taken up the same day. Nothing from this programme is open.

### Phase 109 — measured

The program's own acceptance test is to open "The Question Nobody Asked" cold and count the words
actually on screen, in a browser, rather than estimate them from the content files.

| Surface                       | Before  | After   |
| ----------------------------- | ------- | ------- |
| Activity screen's copy column | **244** | **59**  |
| Whole board screen            | **566** | **381** |

### Phase 110 — what changed, counted

| Surface                                                    | Before            | After             |
| ---------------------------------------------------------- | ----------------- | ----------------- |
| Interview log receipts carrying the right mark             | 0 of 3            | **3 of 3**        |
| Authored answers whose receipt said "secured" untruthfully | **104** of 156    | 0                 |
| Engines that say something on a wrong choice               | 1 of 4 (ASSEMBLY) | **4 of 4**        |
| Missions where a wrong choice was red and silent           | **11** of 24      | 0                 |
| Activity cues that distinguish landing from missing        | none — one cue    | `secure` / `flat` |

**No ✗ was introduced** and none should be. The game's three marks are `✓` secured, `✦` available,
`·` nothing here, taught by the Mission Tracker's own legend; a deflection is a legal move that
returns honest nothing, not a wrong answer.

### Phase 111 — what changed, counted

| Surface                                      | Before                | After                        |
| -------------------------------------------- | --------------------- | ---------------------------- |
| Interviews whose cast is visible on the map  | 0 of 7                | **7 of 7**                   |
| People badged on an open Caribbean interview | 1 (the record holder) | **every speaker**            |
| Words added to the playing screen            | —                     | **none**                     |
| Mission Tracker progress                     | one filled proportion | **one pip per thing wanted** |

Both halves honour the binding constraint by construction: a badge is a graphic, and the pips
replaced the bar in the space it already had.

### Phase 112 — what changed

Two defects, one sentence: **the field never took something the hub already had.** Both proved by
reverting the fix and watching the new test go red.

| Defect                                                       | Was                                   | Now                         |
| ------------------------------------------------------------ | ------------------------------------- | --------------------------- |
| Player placed inside a body (interior exit, restored save)   | **locked** — every direction refused  | walks out                   |
| NPC steps into the 0.06-tile band between the two foot boxes | ~3px snag on thin air                 | harmless                    |
| Diagonal held against a wall                                 | legs at 3.65 while body moves at 2.58 | measured, 0.426s not 0.301s |

**Facing before collision is deliberate and stays** — turning to face a wall without moving is how a
player aims every proximity interaction in the game.

### Phase 113 — what a pair of eyes found

Ten field interiors rendered **with the cast visible**, which no visual baseline has ever shown.

| Finding                                                         | Outcome                               |
| --------------------------------------------------------------- | ------------------------------------- |
| Two staff pills overlapping in the lending office               | fixed — clerk restaged                |
| A 300px role running off the frame in the inspection hall       | fixed — pills wrap, capped at 4 tiles |
| Interiors had no rect-in-bounds and no rect-backed-by-art guard | both added, **both clean on all 10**  |
| Spine Review **P0-4** (Codex aside clips at 1280)               | **stale** — measured, does not clip   |
| Spine Review **P0-5** (chrome says REPUBLIC BUILDER ENGINE)     | **stale** — no rendered surface       |

**Bodies clearing does not make labels clear.** The coordinate suite measures NPC-versus-NPC at 1.5
tiles; a name pill is about 2.1 tiles wide. The two staff were posted exactly two tiles apart, on
purpose, with a comment saying so.

**Routed to Phase 114 and closed there.** The eight outdoor maps were not swept with the cast
visible. Both defects found here were interior-scale and about labels, and `0096` §5's four outdoor
render defects were all caught by this same method one map at a time — which argued for the outdoor
sweep being its own pass rather than the tail of this one.

### Phase 114 — what the eye missed

Eight outdoor maps rendered **whole**, at 1:1, with the cast visible; then the same maps measured
against the `.field-world-overlay` canvas, which is exactly the art drawn above the cast.

| Finding                                                            | Outcome                                  |
| ------------------------------------------------------------------ | ---------------------------------------- |
| Riverbend's third watchman standing inside a maple                 | fixed — 76% of body, 98% of name, unseen |
| Fairmeadow's Broad Street resident, both label lines cut by a pine | fixed — moved onto the brick             |
| Common Cause opening with the player's head across a name          | fixed — wanderer's disc moved off spawn  |
| Richmond's refugee "inside" a bush                                 | **withdrawn** — she is in front of it    |
| Four more readings between 0.1% and 31.5%                          | observed and accepted                    |

**The eye cannot find what is not drawn.** Two of Riverbend's three watchmen are labelled and
legible; the third was not on the map at all, and the sweep listed two. An absence has no shape.
The by-eye method fails on exactly the defects that are total.

**A rule kept in a table only protects what the table contains.** Emery Voss is posted "3 tiles clear
of the free tradesman's disc" by her own comment. The spawn got 0.74 tiles, because the player is not
in the NPC table.

Banked as `tests/e2e/cast-legibility.spec.js` — eighteen surfaces, caps set from the measured spread,
stations asserted and movers reported. All three fixes proved by reverting each and watching it fail
by name.

---

## Carried in from the Spine Review

Neither of that program's remaining S3s belonged to this one. One has since been taken:

- **P10-6** — the game cannot decide whether a non-field mission is a place you travel to or work
  you do at the Archive. **Closed 2026-09-06 as Phase 115, decision log `0114`.** Three of the four
  surfaces already said "work you do at the Archive"; the fourth was the Chronotravel warp, and its
  plate is keyed by unit, so on sixteen of twenty-four cases it painted one place under the name of
  another — a Kansas railhead behind "Chicago, Illinois · 1893". Only a case with a map travels now.
- **P12-7** — `progress.unitComplete` and `progress.completedUnits` are written and read by nothing.
  → carried, see `0088` §5. **The last routed S3 in the repository.**

**P0-5 is stale and needs no work.** It recorded the chrome eyebrow still reading "REPUBLIC BUILDER
ENGINE" on 2026-08-03. Verified 2026-09-05: the string survives in two source comments
(`chronicle-opening.defaults.js`, `unit.schema.js`) and on no rendered surface. Recorded here so the
next reader does not spend a session on it.

**P0-4 is stale too.** It recorded the Codex aside clipping its text and its "Open Codex" button at
1280px, and it was routed to Part 6, which closed without taking it — the same way P0-3 was routed
to Part 8 and never arrived. Measured by Phase 113 at 1280: `scrollHeight === clientHeight` at 561,
`overflow-y: visible`, and the button's bottom edge 260px clear of the fold. Identical at 1366.
Something else fixed the thing and only the finding survived.

---

## Out of scope — deliberately

- **Rewriting authored prose.** Owner's call: restructure and collapse, do not rewrite. The volume
  drift is real and measured — Unit 1's three missions total 4,497 player-facing words against Unit
  7's 11,380 for the same shape, and 67,024 across all twenty-four — but a copy pass is a content
  decision and a separate program.
- **Teacher surfaces.** Unchanged from the Spine Review's exclusion.
- **New content, new systems, new maps.** Unit 9 still owes a cast, two interiors and three
  activities, and its cast is still blocked on a PixelLab spend decision, not on this program.
