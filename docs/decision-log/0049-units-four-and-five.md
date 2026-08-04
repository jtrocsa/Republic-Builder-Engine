# 0049 — Two more periods, and what a record on a map has to be

**Phases 65–67**, the Units 4 and 5 program. Status: accepted. Depends on
`0048-field-interiors.md`; extends `0041-missions-documents-and-choices.md` (missions vs. Archive
Challenges) and `0036-generated-collision-and-derived-object-sheets.md` (the map pipeline).

## Context

Chronicle covered Periods 1–3 of the CED's 9. `POST-MINIMAL-ARCHITECTURE-REASSESSMENT.md` §7 and
decision log `0033` both name expanding into the remaining periods as the standing product priority
ahead of any further architecture work. This program built two of them: **Unit 4, an Erie Canal
boomtown in 1845**, and **Unit 5, Richmond in 1864** — each an outdoor field map, two interiors, a
full campaign file, quests, and two unit-level Archive Challenges.

Two things already in the repository changed what needed building. The two source libraries
(`unit-04-source-library.js`, `unit-05-source-library.js`) were already real and cited. And
twenty-two characters were already generated in the PixelLab account and gitignored, so most of the
cast was an import rather than a spend.

## Decisions

### 1. A map's records are composite documents; the library carries the canon

This is the decision the rest of both units hangs off, and it is a departure from Units 1–3, whose
sources are all real named documents.

Every record on these two maps is a **composite reconstructed from a documentary form**, and every
citation says so in its own first sentence. The reason is what a field record has to do. A
Chronicler walks up to a boat captain and asks to see his papers; the record has to be _that
captain's_ toll receipt, for that cargo, on that boat. The Bank Veto, the Declaration of Sentiments,
the Emancipation Proclamation cannot do that job, because nobody standing on a towpath or on Cary
Street is carrying one.

So the rule these eleven records are written to: **the form is documentary, the figures are real, and
the citation names the scholarship the figures come from rather than implying an archive box.** A
toll receipt's rates track the published Erie toll schedules; a mill time book's bell hours track the
1845 Lowell time table; Tredegar's three classes of hands track Dew's payroll analysis; Chimborazo's
admissions arithmetic tracks the hospital's own returns. A student who checks any number against the
cited work will find it.

The canonical documents are not lost — they are what the missions and the Archive Challenges are
built from, which is the division of labour both units were designed around.

### 2. Each unit is dated to a year, and the year is load-bearing

**Unit 4 is 1845, not "circa 1840."** Three records depend on it. Morse's line opened in May 1844, so
a telegraph survey is contemporary rather than four years premature. The Erie's enlargement
(1836–1862) is under way, which is why the town reads unfinished. And the Second Bank is nine years
dead, so the bank on Market Street is a state-chartered free bank under New York's 1838 Free Banking
Act — which is better content, because it lets an NPC argue about the Bank War's aftermath rather
than gesture at it.

**Unit 5 is 1864.** Richmond does not burn until April 1865, so this is a working city under siege
conditions rather than a ruin. The Deep South market for the slave trade is shut by the blockade and
the loss of the Mississippi, which is why the commission house's week has no sales in it and a great
deal of hiring out. The bread riot is 2 April 1863 — **remembered** by 1864, not staged — so the
market carries a relief committee and a free-market day rather than a crowd. And the Confederate
impressment machinery is at its fullest extent, which is what makes a requisition the district's
central document rather than an auction bill.

### 3. Unit 5's register rule, and where it actually lands

The brief set one constraint above the others: **enslaved and impressed people are named, speak for
themselves, and say what is being done to them and what they intend.** Nobody is scenery. No
Confederate speaker is the map's most sympathetic voice. There is no Confederate battle flag anywhere
on the map, in the art, or in the copy.

Stating that is easy; the decision is about where it has to be enforced, and the answer is in three
places that are not the obvious one.

**In the art.** The counting room has no chains, no auction block and no cell door — it is a
panelled gentleman's office with three plain chairs against the wall, and an office with seating for
people who are not customers says the rest. Every cot in the Chimborazo ward is empty and made up:
no wounded figure, no bandage, no basin, no instrument. The obvious objection is that Chimborazo in
1864 was full and a ward of empty cots is a lie of omission. It would be, if the room said nothing
else — what it says is carried by the two women standing in it and by the register on the matron's
desk, which is where the ward's arithmetic lives. A ledger column is a more honest instrument for
that than a painted casualty, and it is the one a Chronicler came to read.

**In the record forms.** Six of Unit 5's records are administrative papers, and administrative papers
are exactly where a person disappears. Each is written to be read _against its own form_: the
requisition moves people its text never names; the payroll's second and third classes are wages paid
to somebody else; the day book's plainest column bills an owner for a pair of shoes; the ward
register's own matron must write a memorandum to admit four women work there whom the columns cannot
hold; and the dock pass gives Peter Gowrie a first name where he gives himself two. **That last gap
is the design.** A student who notices that the paper says PETER and the man says "My name is Peter
Gowrie" has done the historical thinking without anyone narrating it at them.

**In a test.** Nathan Purcell's line is asserted verbatim in `richmond-interiors.spec.js` — first
person, his own name, his own intent. A constraint that nothing checks is a constraint that drifts,
and this is the one that would be quietest about drifting.

### 4. The four post-war characters belong to a mission, not the map

`usct-soldier`, `freedwoman-teacher`, `freedmens-bureau-agent` and `reconstruction-delegate` were
generated for Unit 5 and cannot stand in Richmond in 1864 without breaking the map's own
historical-state rule. They are not wasted and they are also **not built**: a mission renders no
field sprites, so what they carry is their argument rather than their art. Case-015 sorts six
Reconstruction claims by what each holds freedom to require — land and labour on your own terms, the
ballot and a seat in the government, or a federal guarantee that the law will protect you — and each
document is the kind of claim one of those four people actually made. Their PixelLab ids stay
recorded in `character-manifest.js` so nothing is lost if that changes.

### 5. Mission types are chosen from the content, then checked against the spread

Six of the nine cases across Units 1–3 were evidence-organizing sorts, and the log already recorded
that every non-map mission was starting to feel like the same mission from a different door. Neither
of Unit 4's is one: case-011 is `sequencing` because the Bank War's difficulty is genuinely causal
ordering, and case-012 is `hipp` — the first mission in the game to use that type — because the
Removal Message is a document whose _argument_ is the thing to analyse.

Unit 5 brings evidence-organizing back deliberately, for case-015, because Reconstruction's central
difficulty is that everyone agreed slavery was finished and nobody agreed what replaced it. "Sort
these claims by what each holds freedom to require" is not a genre exercise dressed as history; it is
the actual problem. Case-014 is `sequencing` and is **not** case-011's shape: that chain runs
decision → consequence, one man's choices compounding; the road to disunion runs settlement →
destabilization, where every item is somebody _solving_ the sectional crisis and the reason order
matters is that each solution made the next quarrel unmanageable.

### 6. A sequencing quest must be authored out of order

`renderSequencingQuest()` lays items out in the authored array's order and never shuffles. A quest
whose `items` are written `position: 0,1,2,3,4,5` therefore **opens already solved**, and grades the
student correct for touching nothing.

Unit 1 authors its three scrambled for exactly this reason. The convention was never written down,
and Units 2, 3 and 4 lost it. It is written down here, it is commented on both of Unit 5's
sequencing quests, and two e2e cases assert that a chronology does not ship pre-solved.

**Five quests across Units 2–4 are still affected and are deliberately not fixed here** — that is a
content change to three shipped units, not part of building two new ones.

### 7. `war ruins` is on Richmond's sheet list, and the catalog was wrong about it

`TILE-LIBRARY-CATALOG.md` described the `war ruins` pack as modern concrete-and-graffiti urban decay
and excluded it. That verdict was drawn from a 4-of-27-sheet sample, and sheets 21 and 22 are a
different pack inside the same folder: timber, brick and stone cut-outs on transparency with nothing
datable in them.

The distinction that survives is between _bomb damage_ and _ruins_. 1864 Richmond has the second and
not the first, so eight objects were repacked into `derived/richmond-ruins.png` and used in exactly
three places the record puts them: a house **taken down** for the north-east line's field of fire
with its brick stacked square beside it; the wrecked Confederate States Laboratory on Brown's Island,
across water no route can reach, where the cartridge explosion of March 1863 killed around forty-five
workers, most of them girls and young women; and a churchyard woodpile, which is not a ruin at all
and is the most loaded of the eight — firewood passed $30 a cord that winter against a pre-war $4.

## Consequences

- Chronicle now covers **CED Periods 1–5 of 9**, fifteen cases across five units, on five walkable
  outdoor maps and four interiors — twelve generated `.tmj` maps in the repository.
- The cast is **60 sheets** (54 built + 6 frozen `legacy-*` for Unit 3), from 28 at Phase 64. Most of
  the growth was import rather than generation; the spend went on re-rolls and on the objects below.
- Two commissioned derived sheets close a registered gap and open a new one:
  `derived/civil-war-works.png` (wall tent, gabion, chevaux-de-frise, field gun, abatis, supply
  wagon, hospital cot) closes `military.civilWar.camp` in `canonical-palette.js`;
  `derived/canal-works.png` repacks a lock, a barge and a furnace found in `Steampunk`.
- `validate:content` grew to cover both units; `UNITS` is `[UNIT_01..UNIT_05]`; the Navigation Table
  reuses the existing `north-america` view for both, so neither unit adds map art.

## The working rule this program produced

**The labelled grid tells you where a sprite is; only the render tells you what it is.** Eight
defects across the two map phases were caught this way and none by reading coordinates — a canal
bank painted through with holes, a "flag floor" that was a wall texture, three chairs that each drew
a sliver of their neighbour, and a crossed-timbers obstacle that turned out at 5× to be a fallen
telegraph pole with four snapped wires. `npm run assets:preview-map` and a crop are cheaper than any
of the arguments that preceded them.
