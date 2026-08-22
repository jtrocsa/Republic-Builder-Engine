# 0080 — The hub stops contradicting itself

**Phase 90C. Accepted 2026-08-22.**

Spine Review Part 5 — the Archive Room and the Navigation Table. Findings and the play script are in
[`part-05-archive-and-navigation-table.md`](../playtest/part-05-archive-and-navigation-table.md);
this records the five decisions inside the fixes.

The part ran the protocol in its intended order for the first time: **static audit before anything
was played.** Parts 1–4 inverted it because the owner report arrived unprompted, and the ledger's
claim — that a part still produces fixes in a week nobody plays — had never actually been tested.
Twelve findings, seven fixed, none of which needed an owner to notice.

---

## 1. `nearestHubTarget()` did not return the nearest hub target

It was `Array#find` over `HUB_TARGETS`, so it answered with the first entry **in declaration order**
that was inside its own reach. `julian` is declared two entries above `table`, and his route's east
stop was (18.5, 9.4) — 1.4 tiles from the Navigation Table's anchor, inside its 1.65 reach. Standing
at the table's south face and pressing `E` opened the Route Historian.

`nearestFieldInteraction()` has sorted since the day two Powhatan NPCs shared a wander disc — across
NPCs, sources and doors alike. The two sides have therefore disagreed for as long as both have
existed, which is the transferable part: **reading one of them tells you nothing about the other.**

The field code is not merely correct by accident, either — the comment above its door branch spells
out the exact hazard the hub had: doors go in "the same nearest-wins list … rather than the door
always winning because it was checked first." Somebody understood this precisely, on one surface,
and the other never heard about it. It sorts on raw distance across three different reach radii too
(1.45 for people and doors, 1.55 for records), which is the same call made here for the same reason.
This is the hub catching up, and the invariant `CLAUDE.md` already states — _two people must not share
ground; whoever is closest wins_ — turns out to have had a second half nobody wrote down: **a person
and a piece of furniture must not share ground either.** The doorstep-NPC rule is one instance of
that, not the whole of it.

**Two fixes, because the sort alone is not enough.** With a correct sort the player still has to walk
around a body to reach the object, and the prompt still flickers between the two as he passes. So the
stop moved to 16.0 as well — 2.9 tiles clear, in line with the doorstep rule's two and a half — and
his circuit is still 4.5 tiles of the south aisle.

**Why it survived so long is the part worth keeping.** `handleHubClick`'s `hub-interact` branch
passes `target.dataset.target` straight to `interactWithHubTarget()`, so **clicking the marker never
went through the sort and never had the bug**. Only `E` did. A mouse cannot reproduce it, and the
professor is walking, so a keyboard reproduces it perhaps a third of the time. The workaround is
still in the tree: Julian's dialogue carries an "Open Navigation Table →" button, the only NPC
dialogue in the game with a shortcut to another screen. Somebody hit this and routed around it.

**Sorting on raw distance, not on distance-over-reach.** The table's wider radius exists so the whole
south aisle counts as an approach; under a normalised comparison it would also let the table win from
1.20/1.65 against a person the player is standing 1.00/1.10 from. A bigger doorway is not a stronger
claim.

The rule is now `nearestInReach()`, exported and unit-tested, because the bug it guards depends on a
walking NPC being in one place at one moment — an end-to-end test of it would be a coin toss. The
geometry half is a new assertion in `field-map-coordinates.test.js`, confirmed failing against the
old coordinate ("julian comes 1.50 within table's 1.65 reach") before it was kept.

## 2. Two hub rooms, two sets of facts about the same save

The Archive Room resolved its unit from `progress.selectedUnitId`. The Main Hall, one door south,
hard-coded Unit 1 in **eight** places — and one of them printed a number that could not be true:

```js
`${progress.completedCases.length}/3 Unit 1 cases archived.`;
```

`completedCases` is a single global array across all twenty-one cases. The denominator is a literal
three. A student who has finished Units 1 through 6 reads **"18 / 3 Unit 1 cases archived"**, walks
north through the door, and reads the right answer.

One `activeHubUnit()` now serves both rooms. This is the `CLAUDE.md` engine/content rule in its
ordinary form — a case-ID literal in engine code — and the fix is the one that file prescribes: the
second consumer pays for making it data, rather than a second literal being added beside the first.

Two smaller lies went with it. The Preservation Case has rendered **every** unit's badges for a long
time while the marker's label still said "Open Unit 1 preservation case"; and "Reset Unit 1 demo"
wipes `completedCases`, `unlocked`, every response and all case evidence for every unit, which is a
bad thing to mislabel in front of a student in April.

## 3. Closing the Navigation Table moved the player across the room

Its back link ran `home`, which calls `safeInstituteSpawn()` — and that function's **default**
argument is (11.5, 9), the foyer entrance. The table is at (18.5, 8). So the single most repeated
loop in the game, walk to the table and open it and close it, ended seven tiles from where it began,
every time.

`instituteRecallSpawn()` has existed since Phase 58 for exactly this class of complaint and both
field recall paths use it. But this link needed no spawn at all: **it never left the room.** The
`archive-room` action already had those semantics and said so in its own comment — "deliberately does
not touch currentHubRoom/spawn position" — so it was generalised and renamed `hub-return` rather than
a third spawn constant being invented. Two callers, one handler.

## 4. Four names for one room, two of them on screen at once

The Archive Room's south door rendered its marker pill as **"Leave Archive"** and its interact prompt
as **"Press E · Institute Foyer"**, about eighty pixels apart, for the same two tiles. The room it
opens onto was additionally "the Main Hall" (that door's own `role`), "Institute foyer" (the
Navigation Table's back link) and "Institute Archive" (its own `<h1>`) — while the Archive Room's
`<h1>` said "Institute Archive" too, so walking between the two rooms changed the kicker and not the
headline.

The Main Hall's own door already had the answer: it is named for **where it goes**, and its pill and
its prompt agree. Both doors now do. `CLAUDE.md`'s terminology section is what settles which name
wins, and it was already right; the code had drifted from it.

That drift ran the other way too. `CLAUDE.md` listed the seven units under their **cases'** names —
"The Atlantic Crossroads" is case-001, "Common Cause" is case-007's `shortTitle`, and the units are
"The Atlantic World" and "Revolution and Founding". Corrected here, because it is the file every
session reads first and a naming error in it propagates into whatever gets written next.

## 5. The unit switcher was below the fold

Six of the seven Period tabs — the only route to any unit but the selected one — sat off the bottom
of the viewport, and the page grew a **1001px** scroll height against a 720px window to hold them.
Measured in the browser with the old column reconstructed in-page, not estimated:

|        | page scroll height | h1    | tabs off-screen |
| ------ | ------------------ | ----- | --------------- |
| before | 1001px (vh 720)    | 173px | **6 of 7**      |
| after  | 720px, no scroll   | 114px | 0               |

Three changes, and the cheapest recovered the most: **the tab label dropped its `· Locked` suffix**,
which three other things already said — the button is `disabled`, it renders at 0.45 opacity, and the
legend immediately above it spells out "○ Teacher locked". The date range moved into `title` rather
than out of the game. The heading took its own clamp (this is the one screen whose left column has a
job below the fold), and the paragraph lost four lines of interface documentation — the same register
Phase 81B already removed from this object's in-world description.

The short label is read off `unit.period`'s first segment rather than counted from the array index,
which would have quietly hard-coded "unit N is period N" — true for all seven today, and not a fact
that function has any business asserting.

## What this deliberately did not do

- **No restructuring.** The program fixes behaviour, never shape. `nearestHubTarget()` keeps its
  `[id, target]` tuple contract; the tabs stayed in the column they were in.
- **No new content, no new systems**, and no change to collision, reach radii, or the Archive
  Challenge pipeline.
- **The three unreachable "still being cataloged" strings were kept.** All seven units have Archive
  Challenges so none of them can render today, but they are honest fallbacks for a unit authored
  without any, and deleting a fallback because the current content never reaches it is how the next
  unit ships a blank panel.

## Verification

Unit **1770/1770** (nine new: `hub-interaction-priority.test.js`, plus the object-clearance
assertion in `field-map-coordinates.test.js`) · lint 0 errors · `build` clean · 51 targeted e2e
serially, including the whole intro chain, both hub-movement suites and Scene D · full
`visual-regression` green.

New `tests/e2e/archive-navigation.spec.js` — four cases, each named for the finding it came from,
and the first spec in the suite ever to open the Navigation Table screen.

**Two baselines moved and both were opened.** `institute-archive-room`'s diff is exactly four text
runs — the kicker, the headline, the door pill and the prompt — and nothing else in the room. The
Navigation Table's is the whole left column re-flowing. `institute-main-hall` did **not** move, which
is correct: its panel is seeded on Unit 1, where the resolved numbers equal the hard-coded ones, and
the reset button whose label changed sits below the fold at 768.

The update was run across the full spec and `git status` confirmed only those two files changed —
the check that matters, because a test aborts at its first failure and `--update-snapshots` will
happily rewrite baselines whose diffs were never rendered.
