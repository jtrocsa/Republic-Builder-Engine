# The Map Program

Which map every remaining unit gets, which engines it runs, what it asks, and where the frame story
touches it — decided once, for all nine units, rather than one map at a time.

Written in Phase 81D. Pairs with [`MAP-NARRATIVE-STRUCTURE.md`](./MAP-NARRATIVE-STRUCTURE.md), which
says what a map is _for_; this file says which maps we are actually building.

---

## 1. Why this is one document and not seven decisions

Because the engine slates cannot be chosen locally. `MISSION-ACTIVITY-CATALOG.md` §5 rule 2 forbids
two adjacent units running the same three engines, so every unit's slate constrains its neighbours
in both directions. Unit 6's slate was recorded as "provisional… settled when [Units 3–5's] is" for
exactly this reason, and Units 3–5 were never slated — so the whole run from 3 to 9 was one
constraint problem that nobody could solve a piece at a time, and four maps' worth of decisions had
been deferred rather than made.

Phase 81A's amendment to rule 3 is what makes it solvable. While every unit was required to ship a
Group A entry and `interview` was the only Group A engine, there were **three** legal slates out of
four combinations, and a "variety rule" that mandated the same engine nine times running. With rule
3 relaxed to a condition, the fourth slate opens and the rotation below has room to breathe.

---

## 2. The slates

Four engines, three per unit, four legal slates:

| Slate | Engines                            |
| ----- | ---------------------------------- |
| **A** | interview · assembly · discrepancy |
| **B** | interview · discrepancy · trace    |
| **C** | interview · assembly · trace       |
| **D** | assembly · discrepancy · trace     |

| Unit | Place                         | Slate | What its interview asks                                    |
| ---- | ----------------------------- | ----- | ---------------------------------------------------------- |
| 1    | Caribbean shore, 1493         | **A** | _shipped_ — four topics put to seven people (breadth)      |
| 2    | Riverbend settlement, 1622    | **B** | _shipped_ — one civic question, answers stratify by status |
| 3    | Philadelphia, 1767            | **C** | public position against private interest                   |
| 4    | Canal Crossroads, 1830s       | **D** | — none; see below                                          |
| 5    | Richmond, 1864                | **A** | testimony given to a regime that is writing it down        |
| 6    | Railhead, Kansas plains, 1873 | **C** | who is entitled to be here, and on whose paper             |
| 7    | Immigrant port, 1907          | **A** | what the official question fails to ask                    |
| 8    | Suburban corridor, 1957       | **B** | _shipped_ — what a neighbour will say on the record        |
| 9    | Campus archive, 1998          | **C** | _content shipped_ — who is allowed to hold the record      |

**Adjacency holds throughout** — no unit repeats its neighbour's three.

### The question axis is what actually carries the rule

Any two of the four slates share at least one engine, and three of them share `interview`. That is
forced arithmetic, not a scheduling failure, so a rotation that varies engines while asking the same
_shape_ of question every time satisfies the letter of rule 2 and defeats its purpose. Phase 70
established the working version when it slated Riverbend: two units may both run an INTERVIEW
provided they ask different things with it. The right-hand column above is therefore the binding
half of this table, not a note on it.

### Unit 4 is the map with no interview, and that is a real debt

Rule 3 existed because Groups B, C and D can all be built without a single NPC becoming a person,
and a unit that lets that happen has more variety and still plays like a worksheet with a map
attached. Canal Crossroads is the best candidate to carry the trade:

- It is a **document-manufacturing town** — a printing office and a boardinghouse are two of its
  four interiors, and its records are composite documentary forms already.
- Its canal is **literally a route**, which is what TRACE is for.
- Its story is what the paperwork says about people who do not stay long enough to be asked.

The debt is paid in authored companion dialogue and a scripted beat on that map, per amended rule 3
— not by hoping nobody notices. **If it plays as a hallway, the rotation moves**, and shipping Units
3–5 before 6–9 is what keeps that recoverable.

**Shipped in Phase 81F, and the debt cost something concrete.** A DISCREPANCY's evidence column is
normally gated by `asked:<npc>:<question>` tokens minted from an interview's logged answers, so two
players audit the same record holding different evidence. With no interview on the map there is
nothing to mint one, so every observation in Canal Crossroads' audit is `requires: null` — and each
is therefore held to a stricter standard instead: on the record's own page, said by somebody
standing on the outdoor map, or established by the mission before it. Nothing in that column is
evidence a player might not have. Whether that reads as a design or as a flat panel is the question
to put to the first playtest of that map.

---

## 3. Geography

`MAP-NARRATIVE-STRUCTURE.md` §4: across nine units the settings must differ in scale, density,
climate and social organisation, and a run of four street grids is a pacing failure even when each
is historically sound.

> shoreline → settlement → city → canal town → besieged city → **railhead → port → suburb → campus**

Every proposed setting draws on sheets already vetted in `planned-maps.js`, and none of the four is
a street grid of the same kind as any other: an open plain, a working waterfront, a low-density
residential corridor, and an institutional campus.

---

## 4. The frame, and how little of it there is

A map carries **at most two** Chronicle-frame details. The budget below is one Voss beat plus the
unit's single anomaly — which is the whole allowance, deliberately, so that a student who finishes a
map has learned a period rather than a plot.

| Unit | Voss beat                                                | Second clue        |
| ---- | -------------------------------------------------------- | ------------------ |
| 1–2  | trusted helper — _shipped_, and test-enforced            | the unit's anomaly |
| 3    | arrives before being assigned                            | "                  |
| 4    | steers the player away from exactly one clue             | "                  |
| 5    | recognises a piece of Meridian equipment a beat too fast | "                  |
| 6    | **the reveal**                                           | "                  |
| 7    | reluctant alliance against a client-funded operation     | "                  |
| 8    | the client network becomes undeniable                    | "                  |
| 9    | alignment, selected by `liaisonTrust`                    | "                  |

Every 3–5 beat must have an innocent reading available at the time. A clue the player can only read
one way is not a clue — it is the reveal arriving early.

**Voss stands on all five authored maps as of Phase 81E**, and rungs 3–5 of the table above are
authored — one dialogue line each, which is the whole of a map's Voss budget. Philadelphia: she came
through ahead of the assignment. Canal Crossroads: she talks the player out of exactly one thing,
chosen to be the subscription board, which carries no record — so the steer costs a student nothing
and the tell is that a list of who paid for what is precisely where her own stated method would
send them. Richmond: she names anchor glass that is not Chronicle's before anyone has told her, and
hangs a lantern on having done it, which is what keeps both readings live.

`field-liaison.test.js` now scopes to all five units, and its Meridian ban with it — one rung
stricter than §4 of [`THE-FIELD-LIAISON.md`](./THE-FIELD-LIAISON.md), whose "Units 5–6" reveal band
would permit the word in Unit 5. The reveal lands in Unit 6 by the author's decision, so the test
enforces the decision rather than the older band.

Placement was solved against the real collision data rather than by eye, because a stationed body
is fed into the nav grid as `occupied` and is a wall to the player: each post is off both of its
spawn's cardinals, off the road network, at least two tiles clear of every other NPC's territory
(whole walked route paths included), clear of every interior door, and verified not to re-plan any
existing route. `field-map-coordinates.test.js` re-checks the first four on every run and
`field-liaison.spec.js` walks a player to each post in a browser.

---

## 5. Units 6–9

Each is one field case plus two non-map cases, per the shipped convention. Records follow Units 4–5's
composite-document rule (decision log `0049`): nobody standing on a loading platform is carrying a
federal statute, so a map's records are the paperwork that actually existed there, each citation
saying so in its own first sentence. The canonical documents live in `content/primary-source-library/`
— **already written for all four units, 159 cited records** — and feed the missions and Archive
Challenges rather than the map.

**Units 3–5's activities shipped in Phase 81F, Unit 6's in Phase 87 and Unit 7's in Phase 89E** —
fifteen missions across five maps, running the slates above, and every authored field map in the
game has three. Five interviews exist and none of them asks the same thing, which is the rule that
actually binds: Riverbend asks how one arrangement looks from eight positions inside it,
Philadelphia asks what a public position is made of, Richmond asks what testimony costs when the
government is writing it down, Cottonwood Junction asks what entitles a person to be standing here
and on whose paper, and Ellis Island asks what the official question fails to ask. The right-hand
column of §2's table is the half to author against.

**Unit 6 is also where an interview first names people standing indoors.** Two of its eight speakers
are in the land office, which is where the record the mission opens from is anchored — so the door
has to be opened before the interview exists at all, and the cost to the player is nothing they were
not already paying. See decision log `0071` §4 for the test that had to be widened to allow it.

### Unit 6 — the railhead. Kansas plains, 1873. Slate C.

A town that exists because a company decided it should: transient, stratified by contract, sitting
on land whose ownership is actively contested. Connected spaces: depot and freight platform,
telegraph office, land office, a graders' camp, a homestead edge, cattle pens, the hide yard, and
the Kanza village on the far side of the line. Interiors: the **land office** and the **telegraph
office**.

Records: a **land-office patent** (who is entitled to what, on whose authority); a **railroad
payroll** (the same work priced differently by who does it); and a **boundary survey that disagrees
with the treaty text it cites**. The third is the map's spine, and the honest finding is not that
somebody lied — it is that the disagreement is itself the historical event.

**1873 is not an arbitrary year, and the Phase 83 art commission is what established that.** The
Kanza were forced out of Kansas on 4 June 1873 under a bill Congress passed at the urging of
railroad and town-site speculators, and their reservation was resold to non-Native buyers in
160-acre tracts. So the land office is selling the reservation, the survey is the instrument that
made it sellable, and the payroll and the cattle pens are the industry the sale was for. Those
three records are one transaction seen from three desks — which is what the unit already wanted
them to be, except that it is now a documented transaction rather than a plausible one.

The graders' camp is Irish, German and Black: Civil War veterans and immigrant labour. An earlier
draft of this brief put a **Chinese camp** here as well, and that is wrong by half a continent —
that workforce was the Central Pacific's, and the Union Pacific and its Kansas branches hired none
of it. Removed rather than corrected in place, because there is no version of it that belongs on
this map.

**The map must not treat the West as empty land awaiting settlement**, and after the correction
above that is a statement about composition rather than a caution. Indigenous presence is current
and organised, not residual: named, speaking first, saying what is done to them and what they
intend — the same register rule Unit 5 applies to enslaved and impressed people. The village is a
village, earth lodges and bark lodges with a working camp beside it, not an encampment adjacent to
a town; and the people in it are in the middle of being removed rather than already gone.

**The agency stone huts are on this map and they are the cheapest thing on it.** The government
built 138 one-room limestone houses for the Kanza at Council Grove in 1862. The Kanza declined to
live in square rooms and stabled animals in them, and in 1866, while they were away on the winter
hunt, settlers stripped the doors and window sashes and left them unusable. A player walks past a
house built for somebody who did not want it, wrecked by the people who did. Nothing has to explain
it, and nothing should.

**The reveal lands here, and it shipped in Phase 88** (decision log `0072`). Meridian's first
visible operation reads as humanitarian — a warning given, a claim protected — and complicates who
ends up with access to land, movement or a vote: a woman in a good coat gave the Kanza headmen the
appraisal figures before their own agent did. **The operation is on this map and the conversation is
not.** Voss reports it here as a fact she cannot place; she explains it in the Institute Main Hall,
standing at the Navigation Table with the Director in the room, because what she is confessing to is
what she has been doing with filed evidence.

### Unit 7 — the immigrant port. 1907. Slate A.

A threshold place: dense, vertical, institutional, and organised entirely around sorting people. The
wharf outside and the reception hall inside. Interiors: the **inspection hall** and a **board of
special inquiry room**.

Records: a **ship's manifest page**; a **medical inspection card**; and a **board of special inquiry
transcript**. The interview asks what the official question fails to ask — the forms are the mission,
and the people answering them are being described by a vocabulary they did not choose.

**The wharf shipped in Phase 89C** (decision log `0076`), and the brief's "organised entirely around
sorting people" is drawn as one iron rail across it with exactly one gate — deliberately the inverse
of Cottonwood Junction's line, which is walkable on purpose. **Both interiors shipped in Phase 89D**
(decision log `0077`), and the same sentence of the brief is drawn twice more: the inspection hall
takes that rail indoors, doubles it, and puts the two gates at opposite ends, so the room is a
switchback a player walks rather than a space they cross. The hearing room does the opposite and is
mostly floor.

**The three activities shipped in Phase 89E** (decision log `0081`), and Unit 7 is complete. Its
interview is the fifth, and the first that could not be built the usual way: the other four are put
to people the record is thin about, and the move each teaches is find who is missing. This form has
twenty-nine columns and a field for the colour of your eyes, so the eight people are there to supply
what it gets wrong while filling every column. The mission is called Column Thirty, and there are
twenty-nine.

Three things about the build worth carrying to Units 8 and 9. **It is the first interview with a
Field Notebook cap** — eight accounts gathered, three kept, and a closer whose correct option names
two of the eight — so the right answer filed on the wrong three reads as unsupported, a state no
interview could reach before. **Half this unit's cast works indoors**, the highest share in the
program, and one speaker is in the _second_ room, which is as far as `fieldNpcById()`'s resolution
across `fieldSurfaces()` has been asked to reach. And **the DISCREPANCY was ordered last by the
content rather than by the authoring**: the board minute carries `requiresSourceId:
"port-ship-manifest-page"`, the only cross-surface lock in the game, so `arcClose` is authored on
the medical key and on the minute and on neither the manifest nor anything else — and on this map
that gate does a second job, because an audit's evidence column is minted from the interview's
logged answers and without the gate it could open empty.

**One warning for Units 8 and 9, and it cost a rebuild.** Unit 7 was authored against a prose
summary of the table above rather than the table. `unit-07-campaign.js` shipped in Phase 89 saying
"slate A — `interview` · `assembly` · `trace`", which is **slate C's** line; §5's own Unit 7 block
and `ARCHITECTURE-QUICKREF.md` §6 both copied it, and Phase 89E built the trace before checking.
The tell was the rule this section states two paragraphs above: Cottonwood Junction is slate C, so a
slate-C Unit 7 repeats its neighbour's three, which "adjacency holds throughout" forbids outright.
**Read the slate off the table. Nothing in the test suite checks it** — `validate:content` cross-
checks a route against its activity's `kind` and has no opinion about which three engines a unit
should be running.

### Unit 8 — the suburban corridor. 1957. Slate B.

Low density, new construction, and a story that is entirely in the paperwork. Interiors: a **model
home** and a **lending office**.

Records: an **FHA-style neighbourhood appraisal**; a **deed carrying a restrictive covenant**; and a
**GI Bill loan file**. This is the strongest documentary-form map in the program — the discrimination
is legible, written down, and signed, which is exactly what DISCREPANCY and TRACE are for. The
interview asks what a neighbour will say on the record, and the sparse grid does real work: the
useful answer is rarely the willing one.

Period 8 is the library's genuinely under-served period (Phase 81A), and `streetscape.midCentury` is
its registered gap.

**The content shipped in Phase 95** (decision log `0094`), one phase ahead of the map as Units 3
through 7 each did. The unit is **Grounds for Refusal**, and the three briefed records are the three
the slate lands on: the deed carrying the covenant takes the INTERVIEW, the neighbourhood appraisal
the DISCREPANCY, the guaranteed-loan file the TRACE. Four more open in the reader — the model house's
terms sheet, the lending office's underwriting checklist, a township minimum-lot amendment and a
neighbours' handbill.

**The three missions shipped in Phase 99** (decision log `0098`), and **Unit 8 is complete** — all
eight units at parity, twenty-four missions on eight maps. One thing from it is worth carrying to
Unit 9, and it is about the right-hand column of §2's table rather than the engine list. Unit 8's
interview and Unit 7's are the two closest questions in the program: _what the official question
fails to ask_ and _what a neighbour will say on the record_. They are distinct, and the difference
had to be **written down rather than assumed** — the first is about a form that gets somebody wrong,
the second about a form that has no field for the thing everybody agrees on. When two units'
questions are that close, say in the content file how they differ, or the next author reads the
engine list and thinks the rule is satisfied.

**Both interiors shipped in Phase 98** (decision log `0097`). One rule from them generalises to every future room and nothing in the repo had needed it
before, because the model house is the first interior anywhere with **interior walls**: **a doorway is
a column, not a gap.** A hole in a partition is only a door if the whole column above it is clear to
the far wall of the room it serves — an opening under a wall stub opens onto the stub, and an opening
with a bathtub or a bookcase in the column above it opens onto furniture. Three passes, none caught by
eye, all three caught by a breadth-first flood from the entry cell. **Flood-fill a room with interior
walls after every furniture move**, which is a cost only rooms of this shape pay.

The pair's other lesson is about the two rooms rather than one: **when a unit's argument is a date,
put it in the tilesets.** The model house is the `Living room` pack and the lending office is the
nineteenth-century sheets every other interior uses, and the fifty-year gap between two rooms two
miles apart is the finding — the newest room contains nothing but a price and the oldest is where the
price is decided.

**The map shipped in Phase 97** (decision log `0096`), with a cast of eight, and Unit 8 is walkable.
Two decisions on it are worth carrying to Unit 9. **The composition inverts its neighbour's**, which
is the same rule as the engine slate one section up: Ellis Island was built around a line the player
cannot cross and this one is built around a line nothing stops them at, because that is what the unit
is about. And **the old road still crosses the expressway at grade** — grade separation arrives with
the interchange and the interchange arrives later — which is why the two halves are one map at all.
Owed: two interiors and three activities.

**The art shipped in Phase 96** (decision log `0095`), which is the slice between the content and
the map. `p8-suburb` is unblocked: its houses and cars are commissioned, and its road, kerbs,
sidewalk, driveways, lawn, planting and both interiors come out of packs the old gap entry had
listed as failures. One flagged substitution remains and it is the corner building — the lending
office takes `Highway Rest Area/tile-B-02`'s brick strip units with the modern glazing and signage
kept off camera, which is the same stand-in `p7-depression-street` makes.

Two things about that authoring worth carrying to Unit 9. **The place had to be composite where Ellis
Island was real**, and the interview is what decided it: eight invented people saying on the record
what they will and will not say, about a real named town, is an accusation against a real address.
And **the map's central finding is a rating rather than a slur.** The 1938 Underwriting Manual said
outright that a neighbourhood holds its value when properties "continue to be occupied by the same
social and racial classes"; that sentence came out between 1947 and 1950 and the ratings it produced
did not change. So the audit cannot work by finding a word. It works by reading forty years of
remaining economic life on one side of a new highway and fifteen on the other — which is harder than
any other map's central finding, and is the reason this one is called the strongest documentary-form
map in the program.

### Unit 9 — the campus archive. 1998. Slate C.

The closing unit, and the one place the game's own thesis is the subject. Interiors: a **reading
room** and a **processing room**.

Records: a **FOIA response with redactions**; a **deed of gift restricting access to a donated
collection**; and a **digitised scan that differs from the original it claims to reproduce**. The
interview asks who is allowed to hold the record.

**The content shipped in Phase 100** (decision log `0099`) as "What Is Kept", set at a composite
state university in a north-eastern Ohio valley city twenty years after its steelworks closed. One
thing about the brief above is worth recording, because it was decided by writing the records rather
than by planning them: **the three named records rank, and they rank in the order nobody expects.**
The FOIA response is the _weakest_ of the three — a numbered exemption, an obligation since 1996 to
state which one at the place in the record, thirty days to appeal, and a judge who may read the
withheld pages in chambers. The deed of gift is the strongest, because it needs no number and no
reason and binds successors. And the bad scan beats both, because nobody decided anything: an edition
reset, a publisher's file copy, a discard policy and a scanner setting. Whoever builds the map should
keep that ranking legible in the geography — the thing with an appeals procedure is the thing
everybody blames.

Two further decisions carried from Unit 8's build and worth keeping. The place is **composite**, for
`0094` §2's reason and more sharply here: eight invented people saying on the record what a stranger
is entitled to see would be an accusation against a real named university. And the two missions are
`sequencing` and `evidence-organizing` — the thick pair, which balances the quest-type ledger at
6/6/3/3 across the nine units and was what the content wanted anyway.

Owed: art reconnaissance, the map and the cast, two interiors, three activities.

This is where the final decision belongs — controlled, destroyed, selectively released, or preserved
openly — because by then the player has spent nine units learning that the answer is not obvious.
`CHRONICLE-CANON.md` §7: the player's final problem is not which institution wins, it is who should
control access to historical evidence.

---

## 6. Art, in commission order

Ranked by what unblocks the most, working from what already exists — 140 character sheets, 250 tile
sheets across 28 packs, and the `derived-objects` packing pipeline.

1. ~~**Unit 3's six Revolutionary-era characters.**~~ **Shipped in Phase 82** — generated, built,
   and the `legacy-*` path removed with them. It went first because 81F had just put authored
   interview questions in those six mouths.
2. ~~**`architecture.indigenous.northAmerican`.**~~ **Shipped in Phase 83, in part, and the entry it
   was written against no longer exists.** One gap covering longhouse, pueblo and plains lodge was
   three culture areas filed as one job, which is the register making the mistake it was written to
   stop. It is now two registered gaps — Haudenosaunee longhouse, Puebloan adobe — and the
   arbor-frame bark-and-mat lodge is closed: `derived/indigenous-village.png`, seven objects. It
   unblocked more than the railhead: a yehakin is the same building as the Kanza bark lodge, so one
   object serves both, and **Phase 84 built Riverbend's Powhatan landing** — empty ground since
   Phase 62 for exactly this reason.
3. **Unit 6's cast** — the railhead's people.
4. ~~**`streetscape.midCentury`**~~ — **Shipped in Phase 96, and the entry it was written
   against no longer exists.** It named three packs and a decade rather than a thing, which is the
   same defect `architecture.indigenous.northAmerican` had at #2 above and the same fix: an entry
   that describes a _tone_ can never close. Split by reconnaissance into two objects that were
   genuinely absent — **the twentieth-century house**, of which the library had none at all, and
   **the automobile**, of which it had none between about 1910 and the present — and a long list of
   ground, planting, fencing, poles and interiors that was never missing. Six objects into
   `derived/suburban-tract.png`: three house plans that differ by where the car goes, two saloons
   and an estate. What survives is one honest row, the twentieth-century American commercial block,
   and it belongs to Period 7 as much as Period 8.
5. ~~**`liaison-meridian`**~~ — Voss's revealed costume. **Built in Phase 88**, by editing the
   shipped character into a second _state_ rather than generating a second character; see
   `MERIDIAN-VISUAL-IDENTITY.md` §6 for why that distinction is the whole job.
6. **The three Meridian props** — the anchor ring is blocking, but nothing is scheduled to build
   `meridian-interior`; these wait on that decision.

Phase 80b's rules bind every character job: **three garment layers is more than 45 pixels of body
can hold**, and a new character is checked against **whoever stands nearest them**, not against the
cast list — that is how a Meridian coat came back reading as Dr. Soto's silhouette while satisfying
every rule written down.

---

## 7. What this document does not do

- **It does not schedule anything.** Build order was 81E (Voss on the shipped maps) then 81F
  (activities for Units 3–5), and **both have shipped**; Units 6–9 are designed here and built later.
- **It does not settle Unit 4's trade.** The no-interview slate is a decision with a stated fallback,
  not a certainty.
- **It does not resolve anything on `CHRONICLE-CANON.md` §9's deferred list** — the Original Drift
  incident, Voss's biography and final allegiance, and the closing scene all stay unwritten. §5's
  Unit 9 records are a setting for the final decision, not the decision.
- **It does not make every unit a link in one chain.** Most units are a place with a real historical
  problem that a Chronicler is sent to record. The frame is why the player is standing there; it is
  not what the unit is about.
