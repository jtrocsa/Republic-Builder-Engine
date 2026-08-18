# 0067 — The gap that was three gaps

**Phase 83 · 2026-08-17 · Accepted**

Seven map objects commissioned into `derived/indigenous-village.png`, closing the arbor-frame
bark-and-mat lodge and splitting the register entry that had carried it. Ranked first among the open
commissions in [`THE-MAP-PROGRAM.md`](../design/THE-MAP-PROGRAM.md) §6 and the one item blocking
Unit 6. No engine changed, and no map is built yet.

---

## The problem

`architecture.indigenous.northAmerican` had been in the gap register since the tile library was
first catalogued. It is the only entry the style guide calls a **curriculum defect rather than an
art gap**, because `THE-MAP-PROGRAM.md`'s rule that the railhead must not treat the West as empty
land is a statement about what is drawn on a map, not about what an NPC says. Nothing in 250 sheets
depicts North American Indigenous architecture, and Island survival's bohíos are Caribbean and Taíno
and may not stand in.

It blocked `p1-indigenous-settlement` outright, and it had a second casualty nobody had filed: since
Phase 62, Riverbend's two Powhatan NPCs have stood on open grass with no props of their own, with a
comment in `main.js` explaining that a community zone there could not be built.

## 1. The register was making, in one line, the mistake it existed to prevent

The entry read "longhouse, pueblo, plains lodge — nothing fits."

Those are three culture areas. Filing them as one job says that the thing missing from the library
is _Native American architecture_, which is the same move as reaching for a bohío and one row above
it in the same document. It is also unclosable by construction: no commission can ever satisfy an
entry that means three unrelated buildings, so the register would have carried it for as long as the
project ran and called that accuracy.

It is now two entries — **Haudenosaunee longhouse** and **Puebloan adobe** — each naming a building
and saying what it needs. The third was commissioned. The bohío rule is unchanged and binds all
three.

`p1-indigenous-settlement` had the same defect and got the same fix. Its intent read "a pre-contact
Indigenous North American settlement," which names no people, and "North American" is not a place. It
is now scoped to the Eastern Woodlands, which is the culture area the new sheet actually covers, and
its status moves from `blocked` to `planned`.

## 2. One object serves the yehakin and the Kanza bark lodge, and that is not the bohío error

This is the load-bearing judgment in the phase, so the test is worth stating plainly.

A yehakin is saplings bent and lashed into a barrel frame, clad in bark or woven mats, with a smoke
hole at the centre of the roof. The Kanza's bark lodge is that building, by that method. They are
one structure, and one sprite is honest for both. A Caribbean conical thatch hut is a _different
structure_, which is why it never was a stand-in and still is not.

**The test for reusing a building across peoples is whether it is the same construction — not
whether the peoples are both Indigenous.** The old register entry failed that test in the direction
of lumping; refusing to let one sprite serve Riverbend and the railhead would fail it in the
direction of scruple, and would leave the Powhatan landing empty for no reason at all.

So the commission pays for itself twice, and the second payment is on a **shipped** map.

## 3. Researching the commission moved the unit

Unit 6 was already dated 1873 and already had a land office, a boundary survey and a railroad
payroll. It did not have the event those three records are three views of.

The Kanza were forced out of Kansas on 4 June 1873, under a bill Congress passed at the urging of
railroad and town-site speculators, and their reservation was resold in 160-acre tracts. The land
office is selling the reservation. The survey is the instrument that made it sellable. The payroll
and the cattle pens are the industry the sale was for. That is a documented transaction where the
brief previously had a plausible one, and it cost one search.

Two corrections to that brief fell out of the same reading, and both are in
`THE-MAP-PROGRAM.md` now:

- **The map had nowhere for the presence it required.** The connected-spaces list ran depot,
  telegraph, land office, work camps, homestead, cattle pens — and the paragraph directly beneath it
  demanded that Indigenous presence be current and organised. Commissioning architecture for a space
  the map does not have would have been decoration. The village is on the list now.
- **The "Chinese work camp" is wrong by half a continent.** That workforce was the Central
  Pacific's; the Union Pacific and its Kansas branches hired none of it. Removed rather than
  corrected in place, because there is no version of it that belongs on this map. The graders' camp
  is Irish, German and Black.

**The agency stone hut** came out of the same reading and is the object I would keep if I could keep
one. The Indian Office built 138 one-room limestone houses for the Kanza at Council Grove in 1862;
they declined to live in square rooms and stabled animals in them, and in 1866, while they were away
on the winter hunt, settlers stripped the doors and window sashes. It is generated with its frames
still in place and the openings black, which is what that sentence looks like. A player walks past a
house built for somebody who did not want it, wrecked by the people who did, and nothing on the map
has to explain it.

## 4. The misses rhyme with the chevaux-de-frise

Three objects took four rolls, and both failure modes were the generator's prior beating the
request.

The bark lodge came back a smooth **barrel**, then a planked tube, then a green-thatched hut on sawn
posts. "Barrel" fetches a container and "bark" fetches nothing. What worked was the sourced
description read out flat: a frame of bent saplings wrapped in woven mat panels with the rib poles
showing through.

The stone hut came back **half-timbered** on the first roll — the Medieval Fantasy Town silhouette
this repo bans by name — and on the third with a circular shop emblem on the gable, which is that
same failure wearing a sign.

So the chevaux-de-frise rule holds and generalises: **name the construction, never the thing.** It
is now stated that way in the style guide rather than as a note about one abandoned object.

## 5. What verified it

- `tests/unit/tile-palettes.test.js` — 50 assertions, and the two that matter here are that every
  gap a planned map declares is registered, and that a `blocked` map has a gap and no sheets. The
  split would have failed the first if `p1` had not been repointed.
- `node scripts/assets/pack-objects.js --check` — the packed sheet matches the manifest.
- **By eye at 4×, against a 45px reference bar**, twice: once to accept or reject each roll, once to
  confirm the packed sheet clips nothing on the 48px grid. There is no cheaper tier for this. The
  visual baselines cannot see it either way, and nothing renders these objects yet.

## What this does not do

- **No map is built.** Unit 6 has no `.tmj`, and Riverbend's village zone is not placed — that map
  has to be regenerated, and this phase only removes the reason it could not be.
- **No longhouse and no pueblo.** Both are still registered, and `barkLodge` is explicitly _not_ a
  substitute for either — same cladding at a twelfth the length is not the same building, which is
  the whole argument of §2 running the other way.
- **Nothing about Unit 6's cast**, which is now the highest-ranked open commission.
