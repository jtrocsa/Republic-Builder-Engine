# 0062 — What Meridian actually looks like

**Phase 79 · 2026-08-03 · Accepted**

Five concept plates arrived for the Meridian Institute the day after `0061` wrote Meridian into
canon. They contradict the visual identity that ADR shipped, on its central table. This records the
revision, and why the art wins.

**No engine code, no content and no art changed in this phase** — the deliverable is two documents,
three edits to existing ones, and a reassigned entry in the planned-map slate. Same shape as `0061`,
which is appropriate: this is that document being corrected by the first real look at its subject.

---

## The problem

`MERIDIAN-VISUAL-IDENTITY.md` §2 separated the two institutes by the **housing** around the shared
anchor glass, and gave the columns like this:

|         | Chronicle                               | Meridian                                 |
| ------- | --------------------------------------- | ---------------------------------------- |
| Housing | Brass, bronze, wood, archival case work | Dark iron, oxidized copper, dark leather |
| Cut     | Circular, layered, set into a frame     | Thin geometric strips, directional       |
| Form    | Fixed, heavy, repaired                  | Folding, rotating, portable              |
| Reads   | Old and cared for                       | New, exact, made to be carried           |

The plates show Meridian with **all four** of the terms in the Chronicle column: brass and bronze
throughout, monumental layered circular rings, fixed and heavy, and archives full of accumulated
paper. Every distinguishing term the table assigned to Meridian — dark iron, thin strips, portable,
new — is either absent or secondary.

Two things were wrong, and only one of them is the plates' fault.

**The table described a Chronicle that does not exist.** Chronicle's shipped hub is the **Medieval
Tavern** family: rustic wood shelving, torch sconces, stone, small rooms — `institute-hall.tmj`,
`archive-room.tmj` and `hallway.tmj`, all three on the same sheets since Phase 54, and there is no
brass case work anywhere in it. §2 invented a warm brass Chronicle in order to contrast it against a
cold iron Meridian, and neither half was drawn from anything. That is the failure mode of writing a
comparative art brief before either side has art: the contrast is chosen for legibility on the page
rather than measured against a surface, and it comes out as a pair of adjectives rather than a pair
of institutions.

**And the doc's own §1 was right where §2 was wrong.** §1 says Meridian is _"elegant, practical,
historically conscious, and slightly ahead of Chronicle."_ The plates are exactly that. §2's cold
angular Meridian was never a good expression of "slightly ahead" — it was an expression of
"antagonist," which is a different and worse idea.

## The decision

**The art outranks the description.** That was the owner's direction and it is the right way round
for a document written before any art existed. `0061` shipped Meridian as canon with an explicit
status ledger precisely so that provisional things could be revised cheaply; the visual identity had
**zero implementation surface** — no source, no content, no assets, no CSS tokens, no tests — so
revising it costs nothing but the writing.

### 1. The separation is resources and upkeep, not geometry

The replacement:

|             | Chronicle                                       | Meridian                                            |
| ----------- | ----------------------------------------------- | --------------------------------------------------- |
| Materials   | Rustic wood, stone, tavern shelving, torchlight | Dark panelling, parquet, glazed cases, gaslight     |
| Scale       | Small rooms, furniture against the walls        | Halls, mezzanines, stations out on the floor        |
| Instruments | Few, fixed, repaired, one to a room             | Many, matched, ranked, a monumental one on the axis |
| Upkeep      | Visibly mended and made do with                 | Maintained, polished, specified                     |
| Reads       | Somebody's old building, put to work            | Purpose-built, and recently                         |

**Chronicle converted an old building; Meridian built theirs.** Both use circular, layered,
brass-framed instruments — the shared ancestry `0061` §5 called load-bearing is now carried by the
form being _the same_, with Meridian's newer, larger and better funded.

This is a harder line to draw than warm-brass-against-cold-iron and it is the better one. The two
are the same institution one generation apart, and a player should be uneasy about which of them
they are standing in before any dialogue tells them. A Meridian built out of villain materials
answers that in the first frame and throws away the only thing the shared ancestry was for — which
is also `CHRONICLE-CANON.md` §7's writing rule (_"Meridian is never generically evil"_) arriving in
the art, where it had only ever been stated about dialogue.

It also costs nothing to implement: the new Chronicle column is a description of what is already on
disk, so no shipped tile changes.

### 2. What the plates did not touch

Re-checked against all five, and unchanged:

- **§2's shared-glass rule.** Anchor glass reads pale cyan in every plate, so `--c-glass` still
  aliases `--c-info` (`#7ee6ec`) and is never recoloured per faction. `0061` §5 called this the
  load-bearing decision and it survives the revision intact — the plates in fact strengthen it,
  because the ring housings differ while the glass does not.
- **§3's separation caution.** Meridian's teal must stay darker and more desaturated than
  Chronicle's bright `#7eddd6` accent. The plates obey it comfortably.
- **§5's insignia ladder** and **§6's sprite contract** — canvas, `size: 40`, `walking-8-frames`.
- **§7's five spaces and their arc.** The plates sample three points on it without having been
  asked to, which is the strongest evidence in this phase that the story and the art are describing
  the same organisation.

### 3. Three palette tokens changed, one was renamed

None were shipped, so this is a revision to a proposal. `--c-meridian-deep` warms from a green-black
to a brown-black; `--c-meridian-fabric` takes the coat navy and the muted sea green it used to hold
moves to a new, honestly-named `--c-meridian-lining`; and `--c-meridian-copper` is **renamed
`--c-meridian-brass` and brightened**, because polished-not-oxidized is the whole "Meridian built
theirs" signal — a Meridian whose fittings are going green cannot pay for its own upkeep, which is
Chronicle's characterisation, not theirs.

The hexes are read off compressed renders and the doc says so: sample from the plates when the
tokens are actually written into `global.css`.

### 4. The sheet reassignment, which is the only code-adjacent change

`planned-maps.js` carried `institute-archive-restyle` — `office/3` + `office/4` +
`19th Century European City/tile-B-04` + `Steampunk/5`, a candidate restyle of **Chronicle's** hub
into a scholarly interior, and the closure of the "modern institute interior" gap the style guide
had carried since `0030`.

**That sheet set is Meridian's look.** Spending it on Chronicle would erase the table in §1 above the
moment Meridian's first room ships, and Chronicle would have nothing left to be told apart by. The
entry is retired and `meridian-interior` carries the same four sheets, at the same `candidate`
status, with the reasoning written next to the sheet list because the sheets alone read like an
obvious Chronicle upgrade and someone will propose it again.

Three Meridian props are newly registered gaps: the **anchor ring** (nothing in 250 sheets across 28
packs is it, and it carries the shared material, so it blocks a faithful build rather than merely
impoverishing one), a **circular map table** at 3×5 — deliberately larger than Chronicle's 2×3
`navigationTable`, which is the single prop a player is most likely to compare — and **horizontal
glass-topped chart cases**, because `tile-B-04`'s glazed cabinets are upright and read as a library
rather than an evidence room.

### 5. A second document, because "why" and "what to build" are different files

`MERIDIAN-ASSET-BRIEF.md` is new and holds the have/need table, the three commissions with
footprints and prompt-shape guidance, the pipeline, the costing (≈21–27 jobs, ≈$0.45–0.55) and the
sequencing. `MERIDIAN-VISUAL-IDENTITY.md` stays the _why_ and no longer tries to be both.

The split is the same one `0061` made between `CHRONICLE-CANON.md` and the four documents around it,
and for the same reason: a phase that needs to know what to order should not have to read an
argument about aesthetics to find a footprint.

## Two things recorded because they will be got wrong again

**The plates are vertical and the game is not.** Their strongest quality is mezzanine galleries,
vaults, arches and ceiling height, and a 48px top-down camera shows none of it. What translates is
floor plan, floor pattern and prop density — which makes the **inlaid compass rose** the single
highest-value element in all five images, because a floor is the one large surface this camera shows
in full. Both documents now say this. A room briefed for the plates' elevation will be built as a
disappointment against art that promised something the engine cannot draw.

**The costume plate needs two corrections before anything is ordered.** Colour, materials and kit
are right and are what §3 and §4 were revised against. But the coats are ankle-length and
near-symmetrical, which fails §6 twice over — long coats destroy a walk cycle, and asymmetry is the
entire identification mechanism at 45 pixels of body. And the compass, folding case and map chest
must not become held props: `canonicalCanvas()` **clips rather than resizes**, so an oversized prop
is cut off mid-object across all eight strips rather than accommodated. That clamp is deliberate
(`0047`), and it means a prop that does not fit is a defect delivered eight times.

## What this deliberately does not do

- **No art generated.** §6's standing rule — do not generate until the character direction is
  approved — is unchanged, and the whole point of Phase 7/8 sequencing is that the language is
  settled before the buildings.
- **No `--c-meridian-*` tokens in `global.css`.** They remain proposed. Nothing renders Meridian yet
  and a token with no consumer is dead CSS with a plausible future.
- **No room, no `.tmj`, no palette file, no generator, no `import.meta.glob`.** `meridian-interior`
  is a `candidate`, which is exactly what the entry it replaced was, and building it needs its own
  sign-off.
- **No `character-manifest.js` entry and no `progress.story`.** Both are Phase 8's, per `0061`.
- **No change to Chronicle's shipped art.** The revision made Chronicle's existing look correct
  rather than compromised; acting on that would mean changing nothing, so nothing was changed.

## On revising a one-day-old ADR

Worth stating plainly, because the instinct is to treat a fresh decision as settled and work around
it. `0061` shipped a status ledger dividing Meridian's canon into canonical, provisional and
deferred precisely so that the cost of being wrong would be visible before anything was built on it.
The visual identity was the most provisional thing in it — a description of art that did not exist,
written to be replaced by art. It got replaced the next day, at a cost of two documents.

The ledger did its job. The thing to carry forward is that the entries listed as **canonical** in
`CHRONICLE-CANON.md` §9 have not moved, and this revision did not touch one of them.
