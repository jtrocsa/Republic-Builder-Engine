# 0097 — A doorway is a column

**Phase 98.** Unit 8's two interiors: `fairmeadow-model-house.tmj` and
`fairmeadow-building-and-loan.tmj`, four new characters, and the last two of the unit's seven
records. Unit 8 now owes only its three activities.

Supersedes nothing. Follows `0094` (the content), `0095` (the art), `0096` (the map and the cast).

---

## 1. The pair is one argument, and it is a date

Every interior that shipped before these two was dressed out of `19th Century European City`:
panelled wainscot, herringbone parquet, sash windows, a longcase clock. Eight rooms, one idiom, and
it was right eight times because every one of those rooms was old when the player walked into it.

The Fairmeadow Rancher was finished this spring. Nothing in it has a previous owner, a patina or a
repair, and the sheet on the card table by its front door ends _you will not have to imagine
anything_. A room that reads as old reads as somebody else's, which is the one thing the sales
office cannot afford.

So the model house is the library's `Living room` pack — flat ivory paint, basketweave parquet,
patterned vinyl, a mint-green range and a mint-green refrigerator — and **the lending office two
miles away stays on the nineteenth-century sheets**, because a borough building and loan in 1957 was
an institution of the 1890s that had never had a reason to be refurnished. The fifty-year gap
between the two rooms is not set dressing. It is the finding:

> The newest room on the map contains nothing but a price. The oldest room on the map is where the
> price is decided.

That inverts Ellis Island's pair in the same way `0096` inverted its outdoor map.
`immigrant-port-inquiry-room.palette.js` put the best floor in the building under the person most
likely to be sent back; here the room with the plaster still drying is the one with no authority in
it at all.

**A consequence worth stating: this is the only interior pair in the game that does not share a
tileset resolver.** Merging them would work and would hand every one of the model house's 1.49 MB to
a player who only ever opens the office door. The office's own cost is zero — both its sheets arrive
with four rooms that already shipped.

## 2. Nothing was commissioned, and the reasoning is Phase 96's in reverse

The lending office went looking for a steel filing cabinet, on the reasoning that it is the single
object that dates an office to the twentieth century. `office/1.png` and `office/4.png` both have
good ones and **neither can be stamped**: office/4's are drawn overlapping each other, so a
whole-tile rect takes a slice of the neighbouring cabinet, and office/1's are drawn against an
opaque beige wall band with no alpha at all, so a rect takes the wall with them. Repacking office/1's
through `derived-objects.manifest.js` would have carried the wall into `derived/` along with the
cabinet.

`0095` established that a gap register entry has to name a thing before it can be commissioned. _A
steel office file_ names a thing. It could have been commissioned, for about four cents.

It was not, because **the room is better without it.** The record that lives on that desk says so
itself — `suburb-underwriting-checklist`'s own `record` line reads _kept on the mortgage officer's
desk, not in any file_. An association furnished with bound ledger volumes, a locked press cupboard
and a floor safe, and no filing cabinet anywhere, says the same date the cabinet would have said and
lands that sentence on the way past. The one object in the room that is younger than the room is a
clip of printed paper, and it is the object that decides.

So: **an entry may be commissionable and still be wrong to commission.** Phase 96's rule was that a
register entry must name a thing; this is its other half.

## 3. The defect the flood fill found three times running

The model house is **the only interior in the game with interior walls.** Eight rooms shipped before
it and every one is a single open space; this one has a cross-partition with four doorways and three
stubs off it, because the thing being sold is a plan and a visitor walked the partitions.

It took three passes to get the doorways right and **not one of them was caught by eye.** A
breadth-first flood from the entry cell on a half-tile lattice caught each:

| pass | openings         | what was sealed                                                                                                                                   |
| ---- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 4, 9, 10, 16     | the bath and the third bedroom — col 16 is a stub's own column, so the opening beneath it opened onto the stub                                    |
| 2    | 4, 9, 10, 14, 17 | still both — an opening needs an _open column above it_, and the tub occupied cols 13-14 down to the partition while the shelving occupied col 17 |
| 3    | 4, 9, 10, 15, 18 | nothing, once the east hall bench moved off col 18 and the coffee table off centre                                                                |

The rule that falls out, which nothing in this repo has needed until now:

> **A doorway is a column, not a gap.** A hole in a partition is only a door if the whole column
> above it is clear, all the way to the far wall of the room it serves.

And two more from the same passes. **A furniture arrangement that reads perfectly in a photograph
can seal a pocket**: the living-room suite closed a ring — sofa north, coffee table south, an
armchair either side — round two cells nothing could reach. **A run of cabinets and a run of
appliances that stop at different columns leave a slot between them**: the kitchen lost three cells
at col 4 the same way.

The cost of being the only room with interior walls is that it must be flood-filled after every
furniture move. That is now a line in the generator's header.

## 4. Two things the suite could not see, and one is now banked

**A blocked doorstep.** `CLAUDE.md`'s field-interior invariant says in as many words that nothing in
the suite catches this and a new interior's door cell must be checked by hand against the outdoor
cast. Phase 96 checked the cast. It did not occur to anybody to check the **furniture**, and Phase 97
had planted a street tree squarely across the model house's door cell — two tiles wide and three
tall, covering cols 22-23 for rows 6 to 8. The door still _worked_, because a player could reach it
side-on from the gap beside it, which is exactly the kind of half-broken that ships.

**A door row read by hand.** `FIELD_MAPS["unit-08"].interiors[...].door` for the lending office was
declared at row 25 by reading the generator's constants and doing the arithmetic in a comment. The
generator's own `FAIRMEADOW_FIELD_DOORS` says 26. Nothing caught it because the visual-regression
shots enter a room by setting `currentFieldRoom` directly and never touch a door.

Both are now covered by `tests/e2e/suburb-interiors.spec.js`, which **walks to both doors from the
street they open onto** — the one thing every interior spec before it deliberately does not do.
`port-interiors.spec.js` explains why they don't and the reasoning is sound; this file exists because
that reasoning left a hole two separate defects fell into on one map.

The generated `*_DOORS` export is the authority. Read it; do not recompute it.

## 5. Neither record is carried by a person

Unit 8's other five records are held by five of the eight people standing outdoors. These two are
`anchor: { object }` — a card table and a desk — and that is the only such pair in the game.

It is not a shortage of NPCs; there are four people in these two rooms. The terms sheet is a printed
stack anybody may take and the checklist is a loose clip of paper on somebody else's desk. **A
document you are handed, and a document you were never meant to read.** Anchoring either to a person
would turn both into a conversation, which is the one thing neither of them was.

The visible consequence is that each room draws a `.source-signal--world` marker rather than an NPC
badge, which is the inverse of every other interior.

## 6. A three-link chain, and one comment that was wrong

The checklist now carries `requiresSourceId: "suburb-neighborhood-appraisal"`, which is itself gated
behind the deed. That is the first three-link chain in the game, and the prompt demands it: it asks
the player to _read the appraisal's remarks on Feature 2 again_, which is not a question a person who
has not read them once can answer.

It was added because a comment claimed it already existed. The wiring comment in `main.js` was
written describing the gate as fact, the content had no such field, and the Mission Tracker
screenshot showed the record open. **The comment was right about the design and wrong about the
code**, and the honest repair was to make the code true rather than to soften the comment. Worth
recording only because the reverse — softening the comment — would have been quicker and would have
lost the chain.

## 7. What Unit 8 still owes

Three activities, slate B: `interview` · `discrepancy` · `trace`. Every `activityRoute` in
`unit-08-campaign.js` is still `null`. That is the last slice, and it closes the unit at parity with
the other seven.

## 8. Counts

- `fairmeadow-model-house.tmj` — 20x16, 43 collision rects, 3 sheets (1.49 MB, all new)
- `fairmeadow-building-and-loan.tmj` — 16x14, 18 collision rects, 2 sheets (already carried)
- four characters, 20 sprite files, zero teal on all four cardinals, first roll, no re-rolls
- twenty generated `.tmj` maps in the repository; ten field interiors
