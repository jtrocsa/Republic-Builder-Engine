# 0117 — Every one of these was true when it was written

**Phase 118 · 2026-09-06 · Accepted**

The three documents every session loads before it does anything — `CLAUDE.md`, `ARCHITECTURE-QUICKREF.md`
and `INVARIANTS.md` — carry counted claims about the repository. Twelve of them were checked against the
repository this phase. **Twelve were wrong.**

None of them was ever a lie. Every one was measured correctly by whoever wrote it, and then a unit
arrived.

---

## 1. The twelve

| Where                                                     | Said                                                                               | Is                                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| CLAUDE.md, architecture direction                         | "eighteen real, live maps (seven outdoor, eight field interiors, three hub rooms)" | **21 walkable** — 8 outdoor, 10 interiors, 3 hub                         |
| QUICKREF §8                                               | "three real, live maps"                                                            | the same 21                                                              |
| CLAUDE.md, import list                                    | "six `.tmj` raw map imports"                                                       | **22**                                                                   |
| QUICKREF §1                                               | "twenty-one generated `.tmj` maps in the repository"                               | **22** — Unit 9's ground shipped in Phase 102                            |
| CLAUDE.md §1 and QUICKREF §1                              | parity means "a walkable map, **its interiors**, and three missions"               | Units 1–3 have **no interiors**; all ten belong to Units 4–8             |
| INVARIANTS "Activity engine", MISSION-ACTIVITY-CATALOG §7 | "the **fourteen** non-map cases declare no `sources`"                              | 16 of the 24 playable, 18 of the 27 registered                           |
| INVARIANTS "person and furniture", CLAUDE.md              | "the **seven** field maps are swept"                                               | **eight**                                                                |
| INVARIANTS "field interiors"                              | "Five of the **eight** interiors have such objects"                                | five of the **ten** — in a sentence that says "ten" twice on either side |
| INVARIANTS "where and when"                               | "**twenty-two** of the twenty-seven cases carry their own date" (twice)            | **twenty-five** of twenty-seven                                          |
| INVARIANTS "Recall to Archive"                            | "three of the **seven** maps walk a body inside its reach (0.92, 0.10 and 1.68)"   | three of eight, **and not those three** — see §3                         |
| INVARIANTS "Activity engine"                              | "The **five** shipped interviews ask …"                                            | **seven**, and the list named five of them                               |
| QUICKREF §1                                               | main.js is "17,201 lines as of Phase 109"                                          | 17,436                                                                   |

Fifteen sentences, twelve claims, four files.

## 2. They do not rot at random

Eleven of the twelve count something **a new unit adds to**: maps, interiors, cases, missions,
interviews. That is one axis, and it has moved nine times. A phase ships a unit, every sentence in
the repository that counts maps becomes false, and nothing anywhere fails. The unit's own tests all
pass — they are testing the game.

Two of the twelve say plainly how long that takes. `git log -S` dates QUICKREF §8's "three real,
live maps" to the commit that gave the Archive Room its Tiled interior: it has stood unrevised for
**a hundred and four phases**, while the thing it counts grew sevenfold. CLAUDE.md's "eighteen real,
live maps" was written in "Two rooms at the immigrant station" and was exactly right on the day —
seven outdoor maps, eight interiors, three hub rooms, eighteen in all — and Unit 8 falsified two of
those three, and the total, nine phases later.

The twelfth is different and worse. main.js's line count is on the **phase** axis, not the unit
axis; it already has a row in `npm run docs:stats`, and CLAUDE.md already tells the reader in as
many words not to trust a stale figure and to re-measure with `wc -l`. It was 235 lines out anyway.
**A warning is not a reader.** That is the finding that decided §5.

## 3. The one whose number was right

INVARIANTS' "Recall to Archive" entry keeps the recall beacon out of `nearestFieldInteraction()`,
and justifies it by counting the maps that park a body inside the beacon's own 1.55 reach — on those
maps a fourth competitor in a nearest-wins sort would cost an NPC to reach a control already one Tab
away. It said **three of the seven maps (0.92, 0.10 and 1.68 tiles)**.

Re-measured against every behaviour's walked path on all eight maps:

| Map                 | Nearest body        | Tiles    | Inside 1.55 |
| ------------------- | ------------------- | -------- | ----------- |
| Caribbean           | Taíno child         | 7.92     | no          |
| Riverbend           | wharf clerk         | **0.92** | **yes**     |
| Philadelphia        | town crier          | **1.50** | **yes**     |
| Canal Crossroads    | canal mule driver   | **0.10** | **yes**     |
| Richmond            | the Liaison         | 1.68     | no          |
| Cottonwood Junction | railroad land agent | 2.92     | no          |
| Ellis Island        | the Liaison         | 2.92     | no          |
| Fairmeadow          | the Liaison         | 2.04     | no          |

Still three. **A different three.** 1.68 is Richmond's Liaison, and 1.68 is outside a 1.55 reach, so
that reading never belonged in a list of bodies inside it — it is simply the third-smallest number
on a page of measurements. Philadelphia's crier at 1.50 is inside the reach and was never named.

So the count survived the arrival of a unit and every member of it changed underneath. That is the
stale claim hardest to catch, because **nothing about the number looks wrong.** The two claims that
say "seven" announce themselves the moment a reader knows there are eight maps. This one reads
correctly and is false in every particular.

## 4. What replaced them

Corrected where the number is the point. Where the number is a count a unit changes, the **rule**
replaced it:

- "the fourteen non-map cases declare no `sources`" → "a case declares no `sources` unless it walks
  a map, which is **two cases in every three**". The ratio has been true since Unit 1 and will still
  be true at Unit 12. The absolute counts stay beside it, both of them, because there are two honest
  denominators — 24 playable and 27 registered — and picking one silently is how "twenty-two of the
  twenty-seven" came to be a figure that does not add up with the "two" in its own sentence.
- The map counts now say what they are and then point at `npm run docs:stats`, which measures them.

Two of the corrections are not a matter of renumbering, and are worth naming. The **parity** claim said every unit has
"a walkable map, its interiors, and three playable missions" — Units 1–3 have no interiors and never
have. And the "**five** shipped interviews" sentence went to seven, which meant writing the two
questions nobody had added: Unit 1's (what a landing party failed to learn, and what that absence
says about what it came for) and Unit 8's (who is still enforcing a covenant that has been
unenforceable for nine years).

**No code changed and no authored word changed.** Nothing in this phase touches `main.js`,
`global.css`, or any content file.

## 5. The tool, which had the same defect

`scripts/docs-stats.js` exists for exactly this failure. Its own header says so:

> This exists because CLAUDE.md hard-coded these figures in prose and four of them had drifted at
> once … A number written into a sentence has no way to notice the repo moved underneath it. Quote
> the command instead.

It counted `.tmj` files as one flat number, which is the number nobody quotes. What the documents
quote is the **breakdown** — outdoor maps, interiors, hub rooms, cases that walk a map — and six of
this phase's twelve were in that breakdown. So it prints them now, derived from main.js's own
`FIELD_MAPS` literal and its `interiors` blocks rather than from a list here, with the hub rooms
taken by subtraction so a fourth one shows up instead of being absorbed:

```
  walkable surfaces         21
    outdoor field maps       8
    field interiors         10
    Institute hub rooms      3
  .tmj files committed      22 (1 ahead of its unit)
  units registered           9 (8 playable)
  cases registered          27
    walk a map               9
    non-map                 18
```

If those tables change shape it prints `(could not measure)` rather than a wrong number, which is
the only honest failure mode for a tool whose entire job is being right about counts.

And it had the bug it exists to prevent. `lines()` split on `"\n"`, which invents an empty last line
in any file ending in a newline, so it reported main.js one line longer than the `wc -l` that
CLAUDE.md tells the reader to use. **A stats tool that disagrees by one with the command it stands
in for is a stale figure in miniature.** Fixed; main.js now reads 17,436 in both.

## 6. The guard

Only one of the twelve can be tested, and it is the one from §3, because it is a measurement of the
game rather than a description of it. `field-map-coordinates.test.js` now asserts, per map, the
exact set of NPCs whose walked path comes inside the beacon's 1.55 — `[]` on five maps, one named
body on each of the other three — using the same `territoryOf()` walked path the object-reach sweep
beside it already uses, because stops are not where a person is.

It is deliberately **not** a rule the game must obey. A body near the beacon is legal, and that is
the whole reason the beacon stays out of the sort. It is the evidence a written decision rests on,
and it fails when the evidence moves. Its message names the document to update. Flipping one entry
of the table fails it by name and by unit.

The other eleven have no test and should not get a clever one. Prose is not testable and a guard
that parses a sentence would be a worse liability than the sentence. What they get instead is a
command that measures them and documents that point at it.

## 7. What this leaves

Nothing routed is open in either ledger.

One observation is recorded and not acted on, because it is about the shape of a document rather
than its accuracy. `INVARIANTS.md`'s "Activity engine" entry is **2,773 words in a single
paragraph** — 22% of the file, on one line — and two of this phase's twelve were buried in it. A
claim is hard to check when its neighbours are two hundred lines away on the same line.

But length is not the whole story, and the counter-example is in the same file. The "field
interiors" entry is 220 words, and inside those 220 words it says "the ten rooms", then "clean on
all ten", then "five of the **eight** interiors" — three clauses apart, written in one phase, by
one hand. Being short did not save it. Whether that entry should be split is a question for
whoever next has cause to edit it; this phase only fixed what was false.
