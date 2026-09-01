# 0099 — The validator stopped at Unit 7

**Phase 100 · 2026-08-31 · Unit 9's content, and three stale lists it walked into**

The first slice of the last unit, and the slice Units 3 through 8 each got first: the content exists,
is validated, and is deliberately not reachable. Opens the build of **Unit 9**, the ninth and last
period of the CED.

Follows `0098`, which completed Unit 8.

---

## 1. The defect came before the unit, and it is the reason this ADR is named after it

Registering a ninth unit means touching `local-content-repository.js`. Reading it first turned up
this line, still there four commits after Unit 8's three activities shipped:

```js
"unit-08": { campaign: unit08Campaign, quests: unit08Quests, activities: {} },
```

`{}` is the placeholder a unit takes while it has content and no map. Unit 8 stopped being that unit
in Phase 97 and shipped `unit-08-activities.js` in Phase 99, and this line was never changed — so
`loadChronicleContent()` returned a unit carrying **three sources with an `activityRoute` and an empty
activity map**, and `npm run validate:content` said `0 errors`.

It said that because `checkActivityRoutes()` — the one check in the repository whose entire job is to
notice exactly this — opened with

```js
["unit01", "unit02", "unit03", "unit04", "unit05", "unit06", "unit07"].forEach(...)
```

That is the shape `CLAUDE.md` names in as many words: **a per-unit table with a sane fallback and no
test is how a whole unit ships broken.** It has now happened in `FIELD_COPY`, in `UNIT_MAP_VIEW`, in
`LIAISON_MAPS`, in `build-field-guide.js`'s four tables, and here — in the file that exists to catch
the others.

**Two more turned up behind it**, both invisible for the same reason:

| list                                 | stopped at | what it stopped checking                                          |
| ------------------------------------ | ---------- | ----------------------------------------------------------------- |
| `checkActivityRoutes()`              | unit07     | that a routed source has an activity, and that the kinds agree    |
| `mission-slates.test.js`'s `SHIPPED` | 7          | that Unit 8's three engines are the three its slate names         |
| `unit-close.test.js`                 | unit-07    | that Unit 8's arc close resolves from whichever mission ends last |

The slate was in fact right and the arc closes did in fact resolve. Nothing in the repository would
have said so if either had been wrong, which is the whole point.

The validator's list is derived now — it walks whatever `loadChronicleContent()` returns, which is
already what the main schema loop below it walks. The two test lists are still written out, because a
guard against a vacuous pass is worth spelling out, and each now has a case that fails when the list
falls behind the directory.

**The fix was proved by reverting the wiring**: three hard errors, one per routed source, then
restored.

## 2. And then it caught its author, in the same hour

`unit-09-campaign.js` was written with `activityRoute: "interview"`, `"assembly"` and `"trace"` on its
three mission records — while its own header said, correctly and at length, that **every
`activityRoute` in a content phase is `null`**, because a route may only name an engine once there is
an activity behind it.

The header was right about the design and the data was wrong, which is `0097` §6 in the other
direction. Before the fix in §1, this would have validated cleanly: unit09 was not on the list either.
After it, the run failed on the next command with three errors naming the three records.

That is the strongest thing that can be said for the change, and it is why it is §1 and §2 of this
document rather than a footnote to it.

## 3. What Is Kept

Period 9 is 1980 to the present — the conservative turn, the end of the Cold War, an economy that
changed under people, immigration, and the beginning of a century whose record is digital. A unit gets
three cases, and this one spends them on the thing the other eight were standing on:

- **case-025, the field case.** A composite state university in an Ohio valley city, October 1998,
  twenty years after the works at the bottom of the hill went cold. Seven records, three of which
  decide who may read the other four.
- **case-026.** The sixteen years between the Republican convention a movement lost and the one it
  won, in the order in which each step made the next possible.
- **case-027.** The end of the Cold War, read as a question about which evidence is on the table.

The unit is not "how history is written". It is one valley, and the thing that happened to it is real
history — deindustrialisation, a community that tried to buy its own mill, a federal refusal — and the
records of it are held by a library, a federal agency and a dissolved corporation's successor on three
different sets of terms.

## 4. The three locks rank, and not in the order anybody expects

`THE-MAP-PROGRAM.md` §5 named the field case's three records in Phase 81D: a FOIA response with
redactions, a deed of gift restricting access, and a digitised scan that differs from its original.
Writing them found something the brief did not have, and it is the unit's finding:

1. **The FOIA response is the weakest lock on the map**, and it is the only one obliged to explain
   itself. The exemption is numbered. Since the 1986 reform the agency must say how much it removed;
   since the Electronic FOIA Amendments of 1996 it must say **which exemption, at the place in the
   record where the deletion was made**. There are thirty days to appeal, and since 1974 a district
   judge may read the withheld pages in chambers.
2. **The deed of gift is the strongest.** Paragraph 3 closes the president's office for 1974–1982
   "at the Donor's sole discretion and without statement of reason". No number, no reason, no appeal,
   no deadline, no forum — and paragraph 5 binds successors and assigns, so the clause outlives the
   company that signed it. Nobody voted on it and nobody broke a rule.
3. **The bad scan beats both**, because nobody decided anything. Page one was reset between editions
   and a paragraph cut for an advertisement; the publisher supplied its own file copy — the final —
   for filming; the bound originals were not retained; the film was scanned bitonal in 1997 and put
   on the web. Four defensible operational choices by four people doing their jobs properly, not one
   of them about the sentence that vanished.

That is Unit 8's finding one period on. Fairmeadow's committee had to state a reason it did not have
to explain; Furnace Bend's archive does not need a committee. **The decisions that hold hardest are the
ones nobody had to sign.**

The seventh record is the one that makes the point without a lock at all: a general records retention
schedule, adopted in 1991, whose Item 4.17 leaves the survival of a community oral-history project to
one archivist's unreviewed selection, and whose Item 4.19 declares electronic mail "a means of
transmission and not a record series". The largest single force deciding what a future historian may
ask is a table, and nobody in the building could tell you who wrote it.

## 5. Composite, and October 1998

Furnace Bend is invented, in the way Riverbend, Canal Crossroads, Cottonwood Junction and Fairmeadow
are and Ellis Island is not. `0094` §2's reason applies more sharply here than it did there: the
interview asks eight people what a stranger is entitled to see, and eight invented people saying that
about a real named university is an accusation against a real address.

The mechanisms are all documented and cited in the records themselves — the nine FOIA exemptions and
the two amendments that shaped the letter; the standard clauses of an American deed of gift down to
the seventy-five-year personnel closure; multiple daily editions, filming from a publisher's file
copy, discarding originals and bitonal scanning; and the real campaign the coalition's proposal
reconstructs, the Ecumenical Coalition of the Mahoning Valley's attempt in 1978–79 to buy and reopen
a closed works with a federal loan guarantee, which was refused.

**The month is load-bearing.** The Electronic FOIA Amendments had just come fully into force — twenty
working days from 1 October 1997, and an exemption named at every deletion. The first large
local-history scanning projects were putting microfilm on the open web. And records officers were
writing schedules that treated electronic mail as not a record. It is the last year in which a student
could reasonably believe the record was a stack of paper in a building.

## 6. Slate C off the table, and two missions that balance a ledger

`THE-MAP-PROGRAM.md` §2 gives this map **slate C — `interview` · `assembly` · `trace`**, read off that
table's own row rather than off a prose summary, per `0081` §5. The three records it lands on are the
deed of gift (INTERVIEW), the FOIA response (ASSEMBLY) and the two states of one newspaper page
(TRACE), and the campaign file says so beside each one. Every `activityRoute` is `null` — see §2.

Two gates are authored ahead of the activities, both motivated rather than decorative. The FOIA
response requires the coalition's own published summary, because the ASSEMBLY asks a player to rebuild
deleted passages and the only honest way to do that is from what the applicant said in public. The
finding aid requires the deed, because the finding aid is the deed's consequence and a student who
reads the consequence first reads Series 7 as an archivist's decision.

The two missions are `sequencing` and `evidence-organizing`. Across Units 1–8 the ledger ran five
`sequencing`, five `evidence-organizing`, three `hipp` and three `mcq`; Unit 8 spent both of its
missions on the thin pair, so this one spends both on the thick pair and closes the nine units at
6/6/3/3. The content wanted them anyway:

- **The conservative turn is the part of Period 9 students most reliably get backwards**, because it
  is taught as a biography — a president was elected and things changed. In order, the causation runs
  the other way, and the frame is a date: the Cow Palace in July 1964 and Detroit in July 1980, sixteen
  years to the month, with a hand-copied donor list, a textbook protest, a proposed IRS rule on
  religious schools and a property-tax proposition in between.
- **The end of the Cold War is the only mission in the game whose subject is the evidence base
  itself.** Every explanation was published before anybody outside the system could check one, and
  then the archives opened. So it does not ask a student to answer the question; it asks what each
  surviving record can and cannot establish, which is this unit's own question put to the largest
  closed archive of the twentieth century in the year it opened.

## 7. Registration cost exactly what Phase 90J predicted

`0094` §5 measured this against Unit 8 and found one exception. Against Unit 9 there is none:

| File                                       | Cost               |
| ------------------------------------------ | ------------------ |
| `content/unit-registry.js`                 | 1 line             |
| `repositories/local-content-repository.js` | 2 imports + 1 line |
| `content/chronotravel-plates.js`           | 4 lines            |
| `content/maps/navigation-table-views.js`   | 1 line             |
| `tests/unit/chronotravel-plates.test.js`   | the queued guard   |

`build-field-guide.js` did not throw this time, because `0094` fixed it: it derives its set from
`FIELD_MAPS` and filters through `UNIT_IDS` for order, so a unit with content and no map is correctly
absent. The guide still reports eight units, twenty-four cases and Periods 1–8.

**The plate queue is now empty.** Units 7, 8 and 9's paintings were commissioned together in Phase 88A
and each collected its four table lines when its unit became real. `chronotravel-plates.test.js`'s
guard against deleting the last unwired file has nothing left to protect, so it was turned around
rather than deleted: it now asserts that the plates directory and the table agree exactly. A future
painting committed ahead of its unit shows up as a decision somebody has to make rather than as a file
a cleanup pass finds.

**Unit 9 takes the `world` Navigation Table view**, reusing Unit 7's. Its cases are the Ohio valley
(41.1N, 81.0W), the Cow Palace (37.7N, 122.5W) and Moscow (55.8N, 37.6E), and no North American
framing reaches 37 degrees east. That is also the right framing for a unit whose last case is the end
of a confrontation that had been organising the whole board.

## 8. What was deliberately not done

- **`main.js` is untouched, and `UNITS` does not name unit-09.** `activeFieldMap()` falls back to
  Unit 1's Caribbean for a unit it has no map for, so registering a field case early does not error —
  it lands the player on the wrong continent. Units 3–5 sat in this state until Phase 81F, Unit 6
  until 87, Unit 7 from 89 to 89C and Unit 8 from 95 to 97.
- **No map, no interiors, no cast, no activities.** Those are the next slices, in that order.
- **Voss gets no line and no `revealedText`.** `THE-FIELD-LIAISON.md` §4 puts Unit 9 at "alignment",
  which is a canon decision of its own and still on `CHRONICLE-CANON.md` §9's provisional list;
  `tests/unit/field-liaison.test.js` fails if a second map grows a reveal.
- **Nothing on `CHRONICLE-CANON.md` §9's deferred list is resolved.** §5 of the map program says it
  outright: Unit 9's records are the setting for the final decision, not the decision.

## 9. Verification

`npm run validate:content` — 0 errors, **169 groups** (157 before). `npm run test` — 2,004 passing
across 75 files, including the four registry-sensitive suites and the three lists repaired in §1.
`npm run lint` — 0 errors, the 5 standing warnings. `format:check` clean; `cspell` clean, with five
proper nouns added to `project-words.txt`. `npm run docs:field-guide` rebuilds and still reports eight
units. `npm run build` clean.

**This phase cannot move a player-visible pixel by construction**, and the bundle says so: `main.js`
does not import Unit 9's content, and `Furnace Bend` appears nowhere in `dist/`. The one thing the
build gains is the plate, because `CHRONOTRAVEL_PLATES` is imported by `main.js` — which is what
Units 7 and 8's registrations did too, and the whole point of having painted it in Phase 88A.
