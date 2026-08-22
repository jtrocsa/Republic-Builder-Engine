# 0075 — Unit 7 exists on paper

**Phase 89**, the first slice of Unit 7 and the first of Periods 7–9 since Unit 6 closed. "The Terms
of Belonging" — Period 7, 1890–1945. Three cases: the immigrant station in New York Harbor on the
busiest day it ever had, the argument over the Philippines, and the removal of 120,000 people from
the West Coast. Plus a unit SAQ and a seven-document DBQ.

This is deliberately the shape Unit 6's Phase 85 used and no more than it: **content registered for
validation, not wired into `main.js`**. The map is unbuilt, so nothing routes to case-019 yet, and
every `activityRoute` is `null`. `docs/architecture/ARCHITECTURE-QUICKREF.md` §6 said to expect Unit
7 to run as several phases the way Unit 6 did; this is the first.

---

## 1. Why the content ships before the map, and what stops it being visible

`activeFieldMap()` falls back to `FIELD_MAPS["unit-01"]` for a unit it has no map for. A field case
registered in `main.js`'s `UNITS` before its map exists therefore does not error — it drops the
player onto the 1493 Caribbean and tells them to follow the shoreline toward the Spanish camp. That
is the same silent-fallback class of defect as the `FIELD_COPY` omission Unit 6 shipped with.

So the registration is split, exactly as `803f22b` split Unit 6's:

- `local-content-repository.js` and `scripts/validate-content.js` **do** get Unit 7, which is what
  puts it under Zod and under the cross-reference checks.
- `main.js` **does not**. `loadChronicleContent()` has no runtime consumer — the validator and two
  unit tests are its only callers — so this phase cannot change a single player-visible pixel, and
  that is a property of the wiring rather than a claim about the diff.

`validate:content` goes from 133 groups to 144.

## 2. The one thing that did become visible, and the test that demanded it

`tests/unit/chronotravel-plates.test.js` failed the moment Unit 7 entered `loadChronicleContent()`,
because it asserts every shipped unit has a plate. That is the test working: Unit 7's plate has been
painted and committed since Phase 88A, held unwired on the rule that the table must not name a unit
id that does not exist, and the note in `chronotravel-plates.js` said in as many words that Unit 7
would collect its line and nothing else. It cost four lines.

The test's fourth case had to change with it — it asserted `unitPlateKeys` does **not** contain
`unit-07`, which was the correct guard right up until it wasn't. It now guards Units 8 and 9, and
the positive assertion for Unit 7 is the first case in the file. The build confirms the split held:
`dist/assets/` emits seven plates plus the Institute's, and neither queued file.

The plate is unreachable until Unit 7 reaches `UNITS`, so wiring it now is a line of debt paid early
rather than a feature.

## 3. What the field case is, and why the place is named

Ellis Island, 17 April 1907 — 11,747 people in fourteen hours, the busiest single day the station
ever had, through a building rated for about five thousand. The density is a fact rather than a
staging choice, which is the argument for the date.

**The place is real and named, unlike Riverbend, Canal Crossroads and Cottonwood Junction.** Those
three are composite towns on real geography because the town is the setting. Here the station _is_
the subject — its stairs, its desks, its side rooms and its forms are the mechanism the unit is
about — and a composite harbour would cost the one thing the map exists for. Units 3 and 5 already
established real-named-place plus composite records; this follows them.

The date does four things beyond the crowd:

- The act of **20 February 1907 was signed and does not take effect until 1 July**, so the head tax
  is still the $2 fixed in 1903 and the manifest is still the 1903 form. The station is operating
  under one statute while requisitioning forms for the next, and its own daily statement says so.
- The medical service is the **Public Health and Marine-Hospital Service**, its name from 1902 to 1912. "Public Health Service" here would be five years early.
- Fiscal 1907 is the only year the station ever passed a million (1,004,756), which is why the
  immigration commission the February act created was already sitting when the numbers arrived.
- The 1907 act's Class B language — a defect "of a nature which may affect the ability of such alien
  to earn a living" — is quoted as the statute the medical record is about to be read under.

## 4. Seven records, and the one that reframes the rest

The composite-document rule from `0049` applies to all seven, and for a second reason here: a real
manifest page and a real board minute name real people whose grandchildren are alive. The forms are
exact; nobody entered on them is anybody.

Three of the seven are the ones `THE-MAP-PROGRAM.md` §5 names, and they are the three the slate will
land on — the **manifest page** (`interview`), the **medical inspection card** (`assembly`) and the
**board of special inquiry minute** (`trace`). The minute carries `requiresSourceId` pointing at the
manifest, because the hearing reads the manifest's own answers back to the person supposed to have
given them; same shape as Riverbend's letter, Canal Crossroads' time book, Richmond's requisition
and Cottonwood Junction's receipt, and it is what decides which mission can be last.

The other four are read rather than played, and one of them is the map's hinge. The **boarding
division's return of cabin passengers** records that first- and second-cabin passengers were
examined aboard ship and landed at the company pier, while steerage went to the island — and it says
in its own note that nothing in the statute distinguishes them, that the difference is "the place
and manner of examination only." The grounds actually used at the station were means, prospects and
a doctor's prediction about earning a living, which are grounds a passenger with money can rarely be
charged under. That is a class filter written into procedure rather than into law, and a student who
finds it has found the whole map.

The remaining three: the Bureau's **circular instructing inspectors how to fill column nine**, which
directs an officer who disagrees with a traveller to enter what "his own observation" indicates and
not the race "merely as claimed"; the **steamship line's circular to its European agents**, which is
where the first inspection of most arrivals actually happened, conducted by a company liable for the
return passage; and the **commissioner's daily statement**, which carries the day's arithmetic and
the distinction between the head tax (federal revenue) and the money exchange, ticket office and
food concession (private franchises on federal property, and the subject of a presidential
investigation five years earlier).

## 5. The register rule meets the case it is worst suited to

Units 5 and 6 established it: people the paperwork does not name are named on the map, speak for
themselves, and say what is being done to them and what they intend.

**At this station the paperwork names everyone.** It has a column for the name, the age, the money
in the pocket, and one for what the Bureau has decided the person is regardless of what they would
say. A record that leaves somebody out can be caught by asking who is missing. A record that
describes somebody completely, in a vocabulary they did not choose and cannot correct, cannot.

So the rule holds but its mechanism inverts. The people on this map are not there to supply what the
forms omit; they are there to supply what the forms get **wrong while filling every column**. That
is harder to see, and it is why §5 assigns this map the interview question it does — _what the
official question fails to ask_, which is the one question the manifest cannot be made to answer
about itself.

## 6. Why the two missions are the types they are

Unit 6 spent its missions on the two thin types (`hipp`, `mcq`) explicitly to clear a type debt.
That is what made this unit's choice free, so both were picked by material:

- **case-020, `evidence-organizing`.** The Philippines argument has four parties — Beveridge, the
  Anti-Imperialist League, Aguinaldo, and the Court — and a student's real difficulty is not
  deciding who was right. It is seeing that the answer that lasted was never in the debate. _Downes
  v. Bidwell_ was a customs case about Puerto Rico, decided three years later, and its holding —
  that a possession can belong to the United States without being part of it for constitutional
  purposes — governed the Philippines and ran for a century. Against the whole prior American
  practice, in which acquired territory moved toward statehood on the Northwest Ordinance model,
  that is the change. Sorting six documents by what each can actually establish is what makes it
  visible. The attribution says out loud that Downes arose from Puerto Rico, because a student who
  came away thinking it was a Philippines case would have learned something false.
- **case-021, `sequencing`.** No document explains the removal. Every step was lawful, several are
  unremarkable alone, and the order is the argument. Executive Order 9066 names no nationality — and
  could not have removed one person without Public Law 503, a month later, which made disobeying an
  exclusion order a crime. The chain opens on _Ozawa_ in 1922, because that is what made "citizen or
  not" a usable phrase twenty years on, and closes on _Korematsu_ and _Ex parte Endo_ decided the
  same day, the day after exclusion had already been rescinded. That last beat is the reversal
  students consistently miss, which is the shape Unit 6's sequence used too.

Both sequencing quests are authored out of array order, per `0049` §6 and
`tests/unit/sequencing-quest-order.test.js`, which now sweeps a seventh unit for free because it
reads through `loadChronicleContent()` rather than a hand-written import list. That is the payoff
for the Phase 81F decision to make it a test rather than a convention.

Progressivism, the First World War and the New Deal are carried by the Archive Challenges rather
than a third case — the same disposal Unit 6 used for industrial labour, and what those are for. The
DBQ's complexity clause is the two 1924 statutes pointing in opposite directions: Johnson-Reed six
weeks before the Indian Citizenship Act, both narrowing and widening belonging through the same kind
of instrument.

## 7. What Phase 89's remaining slices owe

Unchanged from `ARCHITECTURE-QUICKREF.md` §6 and not re-argued here: a cast, a generated `.tmj` map
of the wharf, two interiors (the **inspection hall** and a **board of special inquiry room**), and
three activities on slate A. The two interiors are already the two rooms three of the seven records
are anchored in, which is the same arrangement Unit 6 reached — and the interview will name people
standing indoors, which `0071` §4 already widened the test to allow.

Deferred out of the whole unit, deliberately: the reveal ladder's next rung. `THE-FIELD-LIAISON.md`
§4 puts Units 7–8 at "reluctant alliance," which is Scene E and a canon decision about Meridian
taking private clients — not something to fold into a unit build. Voss gets a post and a line on the
new map when the map exists, exactly as on the other six, and that is all Unit 7 owes her.

## 8. Verification

`validate:content` 0 errors across 144 groups (11 of them new). 1,638 unit tests across 68 files,
all passing — including the plate test that failed first and was meant to. `cspell` clean on every
touched file after twelve words were added (eleven proper nouns and terms to `project-words.txt`;
`Roumanian` to `source-quotations.txt`, because it is a period spelling inside a quoted circular and
must not be "corrected"). Prettier clean on the touched files. `npm run build` clean, and the built
`assets/` confirms seven unit plates plus the Institute's and neither queued file.

`npm run lint` reports **one error that is not this phase's**: `getComputedStyle` is undefined in
`tests/e2e/boot-onboarding.spec.js:100`, inside a `page.evaluate()` callback that runs in the
browser. It arrived with `4a3de9e` ("The letters arrive already lit") and is left where it is rather
than fixed in a content pass — but it is red on `main` today, so it should be somebody's first item.
