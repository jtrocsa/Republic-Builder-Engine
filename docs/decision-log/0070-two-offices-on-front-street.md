# 0070 — Two offices on Front Street

**Phase 86 · 2026-08-17 · Accepted**

Unit 6's two interiors: the United States district land office and the Western Union office at
Cottonwood Junction. Fifth and sixth field interiors in the game, and the first pair whose
buildings shipped as facades in the phase immediately before.

Their brief was fixed in [`THE-MAP-PROGRAM.md`](../design/THE-MAP-PROGRAM.md) §5 and named as the
next task in `0069`'s own "what this does not do." Nothing here is a new engine surface: two
palettes, two generators, five wiring sites in `main.js`, two new characters and one new record.

---

## 1. Both doorsteps were already shut, and neither block knew it

`generate-railhead-tmj.js` stamps the land office at (18,10) and the telegraph office at (22,10),
and `doorCellOf()` puts their door cells at (19,12) and (23,12). Elias Fenn was posted at
(18.6, 12.3) and Rufus Ply at (22.6, 12.3) — four tenths and half a tile from their own thresholds.

**A door is an interaction and it competes for the same 1.45-tile reach a person does**, and
`nearestFieldInteraction()` answers with whoever is closest. Each of them was standing on his own
doorstep winning that sort from every approach. Neither room would have been enterable.

CLAUDE.md has recorded this rule since Canal Crossroads shipped it with an editor a tenth of a tile
from his own shop's threshold. This is the second time, and the difference is that here the fix was
also the right content decision rather than a compromise: a register works behind his counter and an
operator does not leave his key. Both men moved indoors, and moving them is what gave each room
somebody to put across from them.

Nothing in 1591 unit tests or 174 e2e tests would have caught it. The reach conflict is between a
door and an NPC, and `field-map-coordinates.test.js` measures NPC against NPC.

## 2. The land office is a counter with one gate, and that is the room

Everything in it is placed by which side of the counter it is on. Behind: the register's desk, the
plat table, the tract books with the office safe beside them, the press cupboard. In front: four
rows of bare floor, two plank benches and a writing desk.

**The gate is at the east end and the door is in the middle, deliberately.** A player who walks in
meets the counter head-on. Reaching Fenn — and therefore the receiver's receipt, which is anchored to
him and which every other record on this map leans against — means walking the length of the counter
and going round. A student who has walked round a counter to get that slip has done in the legs what
the mission is about.

The telegraph office puts its gate one step from its own door, and the contrast is the point. A land
office wanted you stopped; a telegraph office wanted your business in and out in ninety seconds. It
is the cheapest way this map has of saying that a counter is a choice somebody made rather than a
fact about buildings.

It is also forced by geometry, which is worth writing down so nobody "simplifies" it later. The reach
is 1.45 tiles and a body's collision is its feet, so with a counter blocking row 7 the closest a
player can stand is y = 7.6 and the closest a clerk behind it can stand is y = 6.22 — 1.38 tiles
apart, inside the reach by seven hundredths of a tile. A counter with no gate would put every
conversation in this room on the wrong side of a rounding error.

## 3. Three things measured rather than assumed

- **The Wild West pack has no interior floor and no interior door.** Eleven sheets; every horizontal
  surface on them is boardwalk with sand baked into its edges, or a street. The floor is
  `Auto-tile-A4-Walls-1` (3,10), through the same 5×5 parity tiling every ground block goes through.
  The door and sash windows are the ones the four existing interiors already use, off
  `19th Century European City/tile-B-04` — and that borrowing is worth defending rather than
  apologising for. A four-panel door and a double-hung sash in a two-year-old Kansas frame building
  came off a car from an eastern sash-and-door mill, because there was no mill here and there was a
  railroad. The one piece of these rooms that is not local is the piece that arrived by rail.
- **The A4 sheets are addressed through `SHARED_SHEETS`.** `Wild West/Auto-tile-A4-Walls-1.png` and
  `Medieval Tavern/Auto-tile-A4-Walls-1.png` are byte-identical by content hash, and naming both
  paths would make Vite bundle the same image twice. That rule has been written in
  `canonical-palette.js` since it was authored; these are the first two maps to consume it, so their
  glob paths deliberately do not match the pack the rest of Unit 6 is drawn from.
- **A flat repeating material only reads as a wall if it has a base rail.** The telegraph office was
  first built with a plain board wall, on the reasoning that a leased operating room would not be
  painted. Rendered at full size the room had no edges at all: board wall and board floor are the
  same species at the same value, and the vertical-versus-horizontal grain that looks like ample
  separation on a tile sheet disappears across fourteen rows. `richmond-counting-room.palette.js`
  names this defect in its own header, arrived at from the opposite direction — it took coursed grey
  masonry for flagstone. The fix is the same one: change the value, not just the pattern.

## 4. What the browser found that nothing else could

Two defects, both invisible to the whole suite, both one dev-server screenshot away:

- **The briefing still counted six records and put all of them out of doors.** `FIELD_COPY`'s guard
  test, added last phase, asserts that a map has an entry — it cannot know the entry is now wrong.
  There are seven records: five in the open, two behind the doors.
- **The register's name pill hung on the counter's own row**, and the rail draws on the overlay
  layer above it, so his label was cut in half by the balusters. One row north clears it and costs
  nothing, because rows 4–5 are open the width of the room.

The second is a class worth naming: **nothing in the game looks at where a character's name pill
lands.** `--cast-label-top` hangs it a fixed distance below the feet, and any `base`-solidity object
whose overlay row a character can stand on will draw over it. Two of the four rooms built before this
one have such objects.

## 5. Two new characters, and one of them cost two rolls

Only two, because Fenn and Ply were already in the cast. Each new one is an economic position the
outdoor map has no room for: **Ezra Holt**, buying the reserve in bulk on a Boston house's account
through eleven separate slips, which is precisely what the receipt cannot record; and **Milton
Sears**, who turns a herd standing in a pen into a number that arrived by wire an hour before the
cattle were counted. Sears is the other half of the drover on the far side of the line — the same
cattle, valued twice.

**Holt was generated twice and the reason is Meridian again.** The first roll came back a dark
blue-green frock coat and matching hat: 44% inside the teal hue band by pixel count on the south
rotation, 68% on the east — against a brief that had already said *absolutely no teal, turquoise or
cyan.* That is the third time in three phases this frame's reserved accent has had to be defended
(Phase 82 in a brief, Phase 85 in the art, this one in the art again), and the first time it happened
against a brief that named the colour. **Saying it in the negative is evidently not enough.** The
second brief named the coat's colour positively, twice, and banned green as well; it came back at
zero teal and zero green across all four cardinal rotations.

## 6. The seventh record

The land office's record already existed — the receiver's receipt moved indoors with the man who
writes it, at no cost, because it was anchored by NPC id rather than by coordinate. The telegraph
office had none, so it has a new one: **the operator's file of messages sent, 4 June 1873**.

Five messages priced by the word, and each of them is a different part of this map: a cattle
quotation from Kansas City, a grain quotation from Chicago, a press dispatch about the removal at
association rates, a land buyer wiring Boston for authority, and eight words at minimum charge asking
Topeka for a surgeon for a man hurt on the grade. The finding is what a price per word does to what a
place can afford to know about itself — and that the twenty-two-word press dispatch is word for word
what the Clarion prints, because after 1866 one company's wires carried one association's news to
every interior paper in the country.

It brings case-016 to seven records, the largest set in the game, and it lands in the
`what-the-rate-decides` lane, which balances the three lanes at 2/3/2.

## 7. What verified it

`npm run test` — 1591 unit assertions, including the interior flood-fill and the NPC-separation
sweep, both of which passed on the first wiring. `npm run validate:content` — 0 errors over 132
groups. `npm run test:e2e --workers=1` — 174 passed, with a new `railhead-interiors.spec.js` banking
the counter, the gate, the two doorsteps and the seven records across three surfaces, plus three new
visual baselines: Unit 6 shipped in Phase 85 with none at all, which left the one map in the game
whose whole composition is an argument as the only field surface nothing was watching. `npm run
build` clean, lint 0 errors, cspell clean.

And by eye in a browser, which is what found both defects in §4.

## What this does not do

- **No activities.** All seven records are still `activityRoute: null` and the case's slate — C,
  `interview · assembly · trace` — is unauthored. That is the whole of what is left before Unit 6
  matches Units 1–5, and it is next.
- **Nothing about the reveal.** Voss's line on this map still reports Meridian's operation as a fact
  she is puzzled by, and nothing here is named. Building the reveal is a canon decision with its own
  ADR, not a task that rides along with a room.
