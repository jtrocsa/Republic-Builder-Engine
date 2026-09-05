# 0112 — Look at the room

**Phase 113 · 2026-09-05 · Accepted**

The last phase of the Beta Readiness program, and the only one whose method is deliberately a pair of
eyes. `tile-footprints.test.js` says in its own header that clipped art is _"NOT reliably
decidable"_, and `visual-regression.spec.js` hides every NPC before every screenshot — so **no
baseline in this repository has ever shown a name pill, a character over a prop, or a body standing
on furniture.** Ten field interiors were rendered with the cast visible and looked at.

Two real defects, two guards the interiors never had, and two Spine Review findings that turn out to
be stale. See [`BETA-READINESS-LEDGER.md`](../playtest/BETA-READINESS-LEDGER.md).

---

## 1. Bodies clearing does not make labels clear

The lending office posts its two staff **exactly two tiles apart**, and the comment beside the second
one says so approvingly. That clears the coordinate suite's NPC-versus-NPC bar of 1.5 tiles with room
to spare.

A name pill is about **2.1 tiles wide**. "Counter clerk" and "Mortgage officer" overlapped, on almost
exactly the same line, in the one room where the two people are the whole point of the room.

This is the family `INVARIANTS.md` already names — _nothing in the game looks at where a character's
name pill lands_ — on an axis it does not: the recorded hazard is a pill against a `base`-solidity
overlay row, and this is a pill against another pill. **The measurement that exists is of bodies, and
the thing that collides is labels.**

Fixed by moving the clerk three tiles west along her own counter rather than by narrowing anything.
Two candidate positions were rejected by the coordinate suite before that — `(2.5, 6.0)` stands her
in a wall, which is the new interior guard in §3 doing its job on the first thing that asked it.

## 2. A pill could be as wide as its label wanted

`.field-npc span` carried `white-space: nowrap`, so Ellis Island's _"Surgeon, Public Health and
Marine-Hospital Service"_ rendered as a single 300px bar and **lost its last word off the right edge
of the frame** on entering the inspection hall.

It wraps now, capped at four tiles. Two things worth writing down.

**`width: max-content` is load-bearing, not tidiness.** The pill is absolutely positioned inside a
48px-wide NPC button, so dropping `nowrap` on its own makes it shrink-to-fit against _that_ — and the
first render of the fix wrapped every label in the game to two or three words a line, including
"Mortgage officer". Caught by re-capturing and looking, which is this phase's whole method.

**It bounds the overhang and cannot remove it.** A pill is centred on its body, so a body standing at
the frame's edge overhangs by half the pill's width whatever that width is — and two of the ten
rooms show a sliver of a pill belonging to somebody just off-camera. That is ordinary camera
behaviour, the body is a tile or two away, and walking toward it resolves both. Observed and
accepted, not fixed.

## 3. Two guards the interiors never had

The outdoor maps and both hub rooms have been checked for **rects in bounds and non-degenerate** and
for **every rect backed by drawn art** for phases. The ten field interiors had neither: their block
was traversal-shaped only — size, land mask, entry, exit, no sealed pocket, people clear of the
furniture — which asks whether a room can be _walked_ and never whether its walls are where its walls
are _drawn_.

Both now run per interior. **Both came back clean across all ten**, which is a result rather than a
null one: it was assumed and is now known. An interior's solid things are spread over more layers
than an outdoor map's single `structures`, so the art check asks whether _any_ tile layer has paint
in the cell rather than naming one. Proved by injecting an out-of-bounds rect — ten failures, one per
room — and it carries a non-vacuity assertion, because a filter over an empty list passes and a room
that had somehow lost its walls would otherwise sail through both guards saying nothing.

## 4. Two Spine Review findings that are stale

Both were recorded on 2026-08-03 and neither needs work. Recorded here so nobody spends a session
re-finding them.

- **P0-5** — "the chrome eyebrow still reads REPUBLIC BUILDER ENGINE". The string survives in two
  source comments and on no rendered surface.
- **P0-4** — "the Codex aside clips its text and its Open Codex button at 1280px". Measured at 1280:
  `scrollHeight === clientHeight` at 561, `overflow-y: visible`, and the button's bottom edge sits
  260px clear of the fold. Identical at 1366. It was routed to Part 6 and Part 6 closed without
  taking it, which is the same way P0-3 was routed to Part 8 and never arrived — but in this case the
  thing itself has since been fixed by something else, and only the finding survived.

## 5. What this phase could not check, and what nothing can

**The changed CSS reaches every field map and no visual baseline can see it**, because they all hide
`[data-npc]` first. The pill rule was therefore verified the only way available: by re-capturing the
two rooms and looking at them. That is the third time this program has run into the same limit, and
it is worth stating plainly as a standing property rather than as a complaint — **the baselines are a
check on the world, never on the cast, and anything about a character is a by-eye check by
construction.**

Nine of the ten interiors were looked at individually; the tenth was captured. The outdoor maps were
not swept in this pass — the two defects found were both interior-scale and both about labels, and
`0096` §5's four outdoor render defects were all caught by exactly this method one map at a time,
which is the argument for doing outdoor maps as their own pass rather than as the tail of this one.
Routed to the ledger.
