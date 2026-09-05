# Beta Readiness — ledger

A five-phase program taking Chronicle from content-complete to something a class of students can be
handed. Started 2026-09-05, from an owner playthrough the night before.

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

| Phase | ADR    | Name                                     | Status      | Closed     | Open |
| ----- | ------ | ---------------------------------------- | ----------- | ---------- | ---- |
| 109   | `0108` | The column says it twice                 | **closed**  | 2026-09-05 | —    |
| 110   | `0109` | Every action lands                       | not started | —          | —    |
| 111   | `0110` | The map says who                         | not started | —          | —    |
| 112   | `0111` | The field never adopted the escape hatch | not started | —          | —    |
| 113   | `0112` | Look at the room                         | not started | —          | —    |

### Phase 109 — measured

The program's own acceptance test is to open "The Question Nobody Asked" cold and count the words
actually on screen, in a browser, rather than estimate them from the content files.

| Surface                       | Before  | After   |
| ----------------------------- | ------- | ------- |
| Activity screen's copy column | **244** | **59**  |
| Whole board screen            | **566** | **381** |

---

## Carried in from the Spine Review

Both of that program's remaining S3s stay open and neither belongs to this one:

- **P10-6** — the game cannot decide whether a non-field mission is a place you travel to or work
  you do at the Archive. → an ADR, unwritten.
- **P12-7** — `progress.unitComplete` and `progress.completedUnits` are written and read by nothing.
  → carried, see `0088` §5.

**P0-5 is stale and needs no work.** It recorded the chrome eyebrow still reading "REPUBLIC BUILDER
ENGINE" on 2026-08-03. Verified 2026-09-05: the string survives in two source comments
(`chronicle-opening.defaults.js`, `unit.schema.js`) and on no rendered surface. Recorded here so the
next reader does not spend a session on it.

**P0-4 is probably still open** and is Phase 113's. The Codex aside clips its text and its "Open
Codex" button at 1280px; it was routed to Part 6 and Part 6 closed without taking it, which is the
same way P0-3 was routed to Part 8 and never arrived. All 61 visual baselines are 1366×768, so
nothing in the suite can see it.

---

## Out of scope — deliberately

- **Rewriting authored prose.** Owner's call: restructure and collapse, do not rewrite. The volume
  drift is real and measured — Unit 1's three missions total 4,497 player-facing words against Unit
  7's 11,380 for the same shape, and 67,024 across all twenty-four — but a copy pass is a content
  decision and a separate program.
- **Teacher surfaces.** Unchanged from the Spine Review's exclusion.
- **New content, new systems, new maps.** Unit 9 still owes a cast, two interiors and three
  activities, and its cast is still blocked on a PixelLab spend decision, not on this program.
