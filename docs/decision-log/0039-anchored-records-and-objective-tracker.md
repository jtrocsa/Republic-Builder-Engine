# 0039 — Records belong to people and objects, and the player can see what's left

Status: accepted · Phases 56–57 · 2026-07-29

## Context

Two problems, one cause: the field told the player almost nothing about what a case was asking of
them.

**A source was a card on the grass.** Each record rendered as a 42px rounded box permanently
captioned "Source", positioned at a coordinate in the world with nothing underneath it. On the
Philadelphia map that meant seven captioned boxes floating over a plaza. It marked a _spot_ rather
than a _thing_, and it gave the player no reason to talk to anybody: the NPCs said one line each and
were otherwise decoration.

**Nothing said what to complete.** The only progress signal in the field was the number on the "Open
Codex" button. "How many records are there, which have I got, and where is the next one" was
answerable only by walking the whole map and reading every card.

Meanwhile every source in the content already carried a `creator` — Pontiac, John Dickinson, Phillis
Wheatley, Prince Hall, Abigail Adams — and several NPCs already had dialogue pointing straight at a
record ("read the charter before you judge who benefits", "ledgers remember what people forget").
The information to fix both problems was already in the data.

## Decision

### A source point declares an anchor

```js
"riverbend-charter": { anchor: { npc: "settlement-minister" }, label: "Company charter", … }
"commoncause-hall-petition": { x: 36, y: 10.2, anchor: { object: "Statehouse petition table" }, … }
```

An **npc anchor** means a person carries the record. There is no world marker at all: a ✦ badge rides
on that NPC's sprite, reading its position from the live patrol state every frame so it follows them
around. Walking up and pressing `E` plays their line, and the speech bubble then offers the record.
The two-step is the point — routing straight to the source on `E` would skip the line, which is the
whole reason for putting a record on a person.

An **object anchor** keeps explicit coordinates and names a real stamped prop that the map generator
places at the same cell. A point with no anchor still renders a marker; nothing forces migration.

### One person, six objects on the Philadelphia map — a historical constraint

A record can only be anchored to a person on a map where that person actually was. Dickinson wrote
and published the Farmer's Letters in Philadelphia, so the "printer's apprentice" becomes **John
Dickinson**, standing outside the print shop, speaking in his own voice about the distinction his
letters actually drew. The other six creators were demonstrably elsewhere: Henry spoke in Richmond,
Wheatley and Prince Hall were in Boston, Abigail Adams wrote from Braintree, Dunmore proclaimed from
Virginia, Pontiac spoke at a council near Detroit.

So their records sit on the thing that carried them _into_ Philadelphia — a printed broadside on a
notice board, a petition on the statehouse table, a dispatch on the wharf clerk's table, a letter
received at a correspondence desk. Which is how a Chronicler would actually have encountered them.
Five new props stamped, one new palette entry (`documentTable`).

Worth stating plainly for future content work: the "go and find Patrick Henry" hook is only available
on a map set where the figure was. A Virginia map could carry Henry; a Boston map could carry Wheatley
and Hall. Faking their presence in Philadelphia to get the hook would be the wrong trade.

### The marker is a glyph, not a card

30px, circular, ✦ to recover and ✓ once secured, with the record's name appearing only when the player
is close. Getting there required consolidating **six** chronologically-layered
`.source-signal--world` redeclarations — 138px wide, then 126px, then 86x52, then 42x42 twice, four
border radii, three label positions, every one `!important` — into a single rule, the same methodology
as the `.field-npc` consolidation in Phase 45B.

Also retired: the `.signal-1/2/3` positional classes. They existed only so `updateFieldProximityUi()`
could query a marker by index, which silently pointed at the wrong marker whenever a record was gated
out of the render; `data-source` does it correctly. Their only styling was a per-index z-index and a
`scale(0.92)` on two of three — leftover tuning that rendered three identical markers at two sizes.

### Records to Recover

An always-visible checklist pinned inside the field viewport, collapsible to its header, persisted on
`progress.settings.trackerCollapsed`. Three states, each readable without reading the words: gold
pulsing ✦ = go here, struck-through green ✓ = secured, grey `·` = not yet available. Rows name **the
thing to walk to** — "John Dickinson", "Statehouse petition table" — not the source's long historical
title, which is what the Codex is for.

It is a sibling of `.caribbean-world`, not a child. That div is the one `updateFieldPlayer()`
translates, so anything inside it scrolls away with the camera.

**The Case 1.01 ordering gate moved out of the marker.** It used to live inline inside
`fieldSourceSignal()` as an early `return ""`, making it the marker's private business; the tracker
would have had to re-derive it and could then disagree with the map about what is locked. It is now an
exported `sourceAvailability()` with both readers going through it, unit-tested.

## Three bugs found while browser-checking this

Each one is the kind that a compile and a unit run both pass.

1. **`.field-npc em { display: none !important }` hid every NPC badge.** It was styling a 230px speech
   bubble drawn _inside_ the NPC button, superseded years ago by the separate `.field-speech-bubble`
   aside — and hidden rather than deleted, which is why an `<em>` was a safe-looking choice for the
   badge. Both the dead styling and the `display: none` are gone.
2. **A mid-field reload resumed on the wrong map's spawn.** `fieldMovement` is ephemeral and its
   module-level default is Unit 1's spawn (28,22); `resetFieldPosition()` ran on Chronotravel, on
   recall and on case reset, but not on boot. A student reloading mid-investigation in Unit 2 or 3
   resumed at another map's coordinates, where nothing guarantees the cell is walkable. Now guarded at
   boot, next to `resetFieldPosition()` itself — it cannot go beside the Archive Room's equivalent
   guard further up the file, because `activeFieldMap()` reaches a `const` arrow declared below that
   point and calling it there is a temporal-dead-zone error that takes the whole app down.
3. **Six `safeInstituteSpawn()` call sites passed dead coordinates**, and this one was introduced by
   Phase 54 and missed. They passed the literals `(7, 9)` and `(16, 9)` — the _painted_ Main Hall's
   spawn and its Navigation Table approach. The tiled rebuild moved the furniture out from under both,
   putting `(7, 9)` inside the "sealed record chest" rect, and `safeInstituteSpawn()` does not
   validate. So arriving from the onboarding hallway, and every Recall to Institute, would have landed
   the player unable to move in any direction — on a screen every session passes through. All six now
   either take the function's default or derive from a `HUB_TARGETS` coordinate.

## Consequences

- New guards. `tests/unit/source-availability.test.js` and `tests/unit/field-objectives.test.js` pin
  the gate and the row derivation. `tests/unit/field-map-coordinates.test.js` gains a Main Hall
  section that walks every `HUB_TARGETS` reach and asserts every spawn entry point is clear of
  geometry — the assertion that would have caught bug 3 the day it shipped. `HUB_GRID`,
  `HUB_BLOCK_RECTS` and `HUB_TARGETS` are exported in place for it, per CLAUDE.md.
- New specs. `field-source-anchors.spec.js` and `field-objective-tracker.spec.js`, banked from the
  manual pass that found bugs 1 and 2 rather than left as a manual pass.
- `walkToNpc()` in the e2e helpers replaces the timed `holdKey` walks in the three specs that cross a
  field. It reads both positions each step, moves along the larger axis, and switches axes when a
  burst produces no movement — so it routes around a building and stops when the game's own
  `.is-near` appears. This also fixes the suite's two long-standing intermittent failures, which
  passed serially and failed under six parallel workers because a fixed hold covers a different
  distance at a different frame rate.
- `field-map-coordinates.test.js`'s source-point assertions now skip NPC-anchored points: those have
  no x/y, and their carrier is already covered by the NPC and patrol-waypoint checks. A new assertion
  catches the opposite failure — an anchor naming an NPC id that does not exist, which would strand a
  record with neither a marker nor a badge.
- `field-movement-dialogue.spec.js`'s collision assertion stopped naming "garden (x1:17.6, y1:5.1,
  x2:22.8, y2:7.8)", coordinates from two map rebuilds ago that exist nowhere. It also now steps clear
  of the elder first: `isFieldBlocked()` collides the player with NPCs, and `walkToNpc()` deliberately
  parks them against her.
