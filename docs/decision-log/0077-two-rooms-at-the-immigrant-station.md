# 0077 — Two rooms at the immigrant station

**Phase 89D · 2026-08-22 · Accepted**

Unit 7's inspection hall and board of special inquiry room. The seventh and eighth field interiors,
the first pair whose doorsteps were kept clear a slice before either room existed, and the first
room in the game bigger than the frame it is drawn in.

The wharf shipped in Phase 89C (decision log [`0076`](0076-the-wharf-at-ellis-island.md)) with five
of the case's seven records held by people who work indoors. This is those five arriving, and the
Mission Tracker defect that came with them going away.

---

## 1. The hall is a switchback, and crossing it is the mission

Two iron railings across the room, each with exactly one gap, and **the gaps are at opposite ends**.
A player who walks in through the wharf door goes the length of the hall east, north through the
first gate, the length of it west, north through the second, and only then reaches the desks.

That is the Kansas land office's device — a counter with one gate at the far end, so the receipt
costs a walk round it — scaled up to a room whose whole subject is a queue. Decision log
[`0070`](0070-two-offices-on-front-street.md) argued it there as "a student who has walked round a
counter to get it has done in the legs what the mission is about." A person coming off a barge at
Ellis Island on this day spent between two and five hours between iron railings before anybody asked
them anything, and the one thing a 48px tileset can honestly say about that is: walk it.

The cast is distributed **along** the walk rather than gathered at the end, so every leg is paid for
and the order is the order a person met the building in. The surgeon is at the head of the line
before either rail; the matron is in the middle pen; the inspector, the interpreter and the money
exchange clerk are past the second gate.

**The rails are the same tile as the rail across the wharf outside** — `19th Centruy European
Dock/tile-B-04` (6,0), the ornate wrought iron on a stone plinth that keeps Ignacy Wozniak off the
landing stage. That is the point rather than an economy. The thing that separates a citizen from his
cousin outdoors and the thing that walks a passenger to a desk indoors are the same object, from the
same foundry, bolted down by the same government, and a player who has spent ten minutes leaning on
it outside meets it again the moment they come through the door.

## 2. The middle pen is empty, and that is arithmetic before it is taste

The first draft furnished all three bands. It does not work, and the reason generalises: **a pen
between two `base` rails is three rows deep, every object on these sheets is two rows tall, and a
body's foot box spans 0.38 tiles.** One 2×2 bench in a three-row pen therefore leaves a single
walkable lane 0.62 tiles wide as the only way across the middle of the room. The e2e walk stuck on
the second bench, which is what a player would have done.

So the pen is bare, and that is also the truth: it is where people stood between two railings
waiting to be called forward, and what fills it is people. The Kansas land office makes the same
argument for its own empty band and for the same second reason — the flood fill has to be able to
run its whole width.

## 3. The first room bigger than the frame

22×18 is 1056×864 against a field viewport of roughly 970×596. Every interior before this one fitted
inside the frame on at least one axis, so every one of them hit `updateFieldPlayer()`'s centring
branch and sat still. This one takes the follow-and-clamp branch on both axes — the same code path
the outdoor maps use, and still a pure function of player position.

It is meant to. The real registry room was two hundred feet by a hundred, the largest room most of
the people crossing it had ever stood in, and a room you cannot see the end of is the honest version
of that. The board of special inquiry room next door is 16×14 and centres, which is most of what the
two rooms have to say to each other.

## 4. Three chairs with nobody in them

A board of special inquiry was three inspectors, sitting together, deciding by majority, in private,
on the record — about four hundred cases a day across the station's boards. **None of the three is
drawn.** `scripts/assets/character-manifest.js` fixed the reason when the cast was generated in
Phase 89B and it holds: _a hearing that fits in a name pill is a hearing a player thinks they have
met._

So the table is stamped with its chairs, the chairs are empty, and the two people in the room are
the clerk who types the minute and the nineteen-year-old standing in front of it. The clerk is the
one who says what the room is for — the minute is the only part of the hearing that outlives it, and
he writes it out of the answers to twelve questions in about eleven minutes, and he is good at his
job.

**The hearing room is the nicest room in the building**, and that is the material doing the
argument. The registry floor is cold blue-grey slab under buff plaster; this is herringbone parquet
under panelled wainscot with a carpet on it. Nobody chose that as a cruelty and it is not drawn as
one — it is what a federal committee room looked like in 1907. The fact that the best floor in the
station is under the person most likely to be sent back is a finding, not staging.

## 5. A map preview is not a screenshot

The hall's floor took six blocks and the failure that mattered was invisible to the cheap tool.

Five candidates fell to the mistake `richmond-counting-room.palette.js` first recorded: **at 48px,
most "stone floor" blocks in these packs are walls.** `tile-B-04` (0,14) tiles a 22×18 room into a
brick-walled courtyard; the shared sheet's pale ashlar does it in a lighter colour; its cracked white
draws a ruin, which a seven-year-old federal building is not; the black-and-white terrazzo is so busy
it fights the cast.

The sixth is the interesting one. The shared sheet's pale grouted tile at (11,10) is the **most
accurate block on offer** — close to what the registry floor actually was — and it was chosen,
committed and rendered twice through `scripts/assets/preview-map.js`, which draws the `.tmj` on its
own against nothing. It looked right both times. It took the e2e visual baseline, which frames the
map inside the game's own deep-navy chrome, to show that twenty-two by eighteen tiles of white tile
with a hard grout grid reads as **graph paper**.

The floor is the large blue-grey slab instead: a public building's floor rather than that public
building's floor. Registered in `art-and-map-style-guide.md`, because the general rule is worth more
than the tile — **a preview answers "is the art laid out the way I intended"; only a screenshot
answers "is this a room I want to stand in".**

## 6. The doorstep rule cost nothing, because it was applied a slice early

CLAUDE.md's 2.5-tile clearance between a door cell and the nearest NPC has now shipped broken three
times — Canal Crossroads' editor, and both of Cottonwood Junction's. Nothing in the suite catches it:
the conflict is door-against-person and `field-map-coordinates.test.js` measures person against
person.

It cost nothing here, and the reason is worth keeping. Phase 89C posted the wharf's cast against the
two door cells at **(26, 4)** and **(38, 4)** while both rooms were still unbuilt, because
`doorCellOf()` derives a cell from a building's stamp and the buildings were already stamped. The
nearest outdoor character to either door is the aid society agent, whose wander disc keeps her 5.8
tiles clear at worst. **Where the previous two pairs of interiors opened by moving somebody off a
threshold, this pair opened by nobody having been put there.**

## 7. The Mission Tracker fix, which is the same edit as the rooms

Five of the seven records had no `sourcePoints` entry on any surface, so five rows in the Mission
Tracker named their own document titles instead of the person carrying them — the one outcome
`fieldObjectives()`'s own comment rules out. Anchoring them by `npc` id closed it, and the tracker
now reads as six names and one **Not yet available**:

> Inspector Harlan Mudge · Piotr Wieniawski · Dr. Aurelio Grasso · _Not yet available_ · Aldo Mancuso
> · Wilhelm Traube · Sol Bregman

The greyed row is the board minute, which carries `requiresSourceId: "port-ship-manifest-page"` — the
**only cross-surface lock in the game**. The hearing cannot be read until the manifest it is a
hearing about has been secured in the hall next door, which is also the order a person met them in.

`FIELD_COPY["unit-07"]` was rewritten from "two records on the wharf" to the full seven at the same
time. It was then rewritten again, shorter: the first version pushed the map ninety-five pixels down
the page, which the baseline caught and the preview could not have.

## 8. What this slice does not have

The three activities. Every one of the seven records still carries `activityRoute: null` and degrades
to the reader through `sourceActivityRoute()`, exactly as Unit 6's did between Phases 85 and 87.
`THE-MAP-PROGRAM.md` §2 gives this map **slate A — `interview` · `assembly` · `trace`** and §5 names
the three records they land on: the manifest page, the medical inspection card and the board minute,
in that order. That is the last thing Unit 7 is owed and the next phase.

No Meridian beat, unchanged from Phase 89C: `THE-FIELD-LIAISON.md` §4 puts Units 7–8 at "reluctant
alliance", which is Scene E and a canon decision of its own rather than something to fold into a unit
build.

---

**Verified:** 1,760 unit tests (68 files), including the interior suite, which enrolled both rooms
automatically and found a real defect on its first run — a 21-cell pocket at (14,2) in the hearing
room, walled in on four sides by the clerk's table, the east wall, the north band and the clock's own
case. `validate:content` clean at 144 groups. Build clean; lint 0 errors, 5 warnings (unchanged).
A new `port-interiors.spec.js` walks the switchback in both directions and both sides of the
cross-surface lock, plus two new visual baselines and one changed (the wharf, which now carries two
door markers and a tracker that names people).
