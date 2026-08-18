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
| 8    | Suburban corridor, 1957       | **B** | what a neighbour will say on the record                    |
| 9    | Campus archive, 1998          | **C** | who is allowed to hold the record                          |

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

**Units 3–5's activities shipped in Phase 81F** — nine missions across the three maps, running the
slates above. Three interviews now exist and none of them asks the same thing, which is the rule
that actually binds: Riverbend asks how one arrangement looks from eight positions inside it,
Philadelphia asks what a public position is made of, Richmond asks what testimony costs when the
government is writing it down. The right-hand column of §2's table is the half to author against.

### Unit 6 — the railhead. Kansas plains, 1873. Slate C.

A town that exists because a company decided it should: transient, stratified by contract, sitting
on land whose ownership is actively contested. Connected spaces: depot and freight platform,
telegraph office, land office, separate Irish and Chinese work camps, a homestead edge, cattle pens,
and the line the survey crosses. Interiors: the **land office** and the **telegraph office**.

Records: a **land-office patent** (who is entitled to what, on whose authority); a **railroad
payroll** (the same work priced differently by who does it); and a **boundary survey that disagrees
with the treaty text it cites**. The third is the map's spine, and the honest finding is not that
somebody lied — it is that the disagreement is itself the historical event.

**The map must not treat the West as empty land awaiting settlement.** Indigenous presence is
current and organised, not residual: named, speaking first, saying what is done to them and what
they intend. This is the same register rule Unit 5 applies to enslaved and impressed people, and it
is why `architecture.indigenous.northAmerican` is the highest-priority art commission in §6 — it is
a curriculum defect, not an art gap.

**The reveal lands here.** Meridian's first visible operation reads as humanitarian — a warning
given, a claim protected — and complicates who ends up with access to land, movement or a vote.

### Unit 7 — the immigrant port. 1907. Slate A.

A threshold place: dense, vertical, institutional, and organised entirely around sorting people. The
wharf outside and the reception hall inside. Interiors: the **inspection hall** and a **board of
special inquiry room**.

Records: a **ship's manifest page**; a **medical inspection card**; and a **board of special inquiry
transcript**. The interview asks what the official question fails to ask — the forms are the mission,
and the people answering them are being described by a vocabulary they did not choose.

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

### Unit 9 — the campus archive. 1998. Slate C.

The closing unit, and the one place the game's own thesis is the subject. Interiors: a **reading
room** and a **processing room**.

Records: a **FOIA response with redactions**; a **deed of gift restricting access to a donated
collection**; and a **digitised scan that differs from the original it claims to reproduce**. The
interview asks who is allowed to hold the record.

This is where the final decision belongs — controlled, destroyed, selectively released, or preserved
openly — because by then the player has spent nine units learning that the answer is not obvious.
`CHRONICLE-CANON.md` §7: the player's final problem is not which institution wins, it is who should
control access to historical evidence.

---

## 6. Art, in commission order

Ranked by what unblocks the most, working from what already exists — 140 character sheets, 250 tile
sheets across 28 packs, and the `derived-objects` packing pipeline.

1. **Unit 3's six Revolutionary-era characters.** Philadelphia is frozen on `legacy-*` placeholders
   and Phase 81F puts authored interview questions in those mouths.
2. **`architecture.indigenous.northAmerican`** — longhouse, pueblo, plains lodge. Blocking for Unit
   6 and a curriculum defect rather than an art gap. Island survival's bohío huts are
   Caribbean/Taíno-appropriate **only** and must never stand in as generic Native American art.
3. **Unit 6's cast** — the railhead's people.
4. **`streetscape.midCentury`** — unblocks Unit 8.
5. **`liaison-meridian`** — Voss's revealed costume, needed for Unit 6's reveal and not before.
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
