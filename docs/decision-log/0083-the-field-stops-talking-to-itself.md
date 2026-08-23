# 0083 — The field stops talking to itself

**Phase 90E · 2026-08-23 · accepted**

Closes **Spine Review Part 6B**, the field's mission surface
([`part-06-the-field-runtime.md`](../playtest/part-06-the-field-runtime.md)). 6A took the field
_world_ — record entry, the recall controls, the reset. 6B is the other half: the dialogue bubble,
the Evidence Channel, the door markers, and the Practice Check and Reconstruction entries, none of
which had ever been read. Ten findings, four fixed as S2, three fixed in passing, three routed.

---

## 1. The thing that was wrong

**The field's screen and the field's state stopped agreeing with each other, in two places, and
neither of them had a test that could tell.**

`runFieldMovementLoop()` ends a conversation when the player walks off:

```js
if (moved && progress.activeFieldNpc) progress.activeFieldNpc = null;
```

That is half of ending a conversation. The other half is that the bubble the conversation drew has
to leave, and the loop never renders — it runs `updateFieldPlayer()` per frame and nothing else, on
purpose, because rendering per frame would be catastrophic. So the state cleared and **the markup
stayed**: a speech bubble hanging over an NPC the player had walked away from, still carrying its
`Examine …` button, until some unrelated action happened to trigger a render. It also never
`save()`d, so the clear did not reach the store and a reload put the player back mid-sentence.

The second is the field's only status line. `fieldTooFarNotice()` writes "Move closer to interact
with X." and **nothing ever took it back.** It clears on `goToCase()`, on stepping through a door,
and on the reset — all of them arrivals. It does not clear when the player does the thing it asked
for. Measured: a click that missed the canoe worker left his name on the screen through the walk to
the elder, through opening her dialogue, and through every record read afterwards.

Neither is subtle once you look. Both were still there because **nothing in the suite had ever
walked away from anybody.**

### The obvious fix was the wrong one

The first version of this fix made the loop `save()` and `render()`. It is what every other exit
from a conversation does, it passed its own three new cases, and it was wrong.

`render()` rebuilds the screen and repaints the map canvases. Spending that on the frame a player
starts walking is far too much, and the suite said so immediately: **four unrelated specs went red
under parallel workers and green at `--workers=1`** — a walk that used to reach the book-keeper
parked a fraction short, and `E` answered with the other man in the room. Nothing about those tests
had changed. The renders had simply made every walk-away cost a frame budget it did not have.

So the fix is `closeFieldDialogueOnMove()`, which removes the one node and drops `is-talking`, and
that is the convention this file already had: `updateFieldNpcs()` and `updateFieldProximityUi()`
patch the DOM directly for exactly this reason, and say so. The render path stays for the deliberate
exits, where one render is the right price and the frame is not being contended for.

The useful part is that **an e2e suite caught a performance regression as a correctness failure**,
which is the only way a suite ever can. Four specs failing in an area nobody touched is not four
flakes; it is one cause. That is worth remembering the next time a green-in-isolation, red-in-parallel
pattern shows up.

## 2. Why the tests did not have it

This is the part worth keeping.

`field-movement-dialogue.spec.js` is a good spec. It opens a bubble, closes it with the ×, closes it
by clicking away, checks the proximity gate refuses a distant NPC, and checks a click that misses a
control inside the bubble does not destroy it — that last one written from a real playtest report.
Four ways a conversation ends; it covers three.

The fourth is walking away, and it is the one a player uses for essentially every conversation in
the game. It was missing because it is not a _control_. The other three are things you press, and a
spec written around a screen naturally enumerates the things you press.

So the rule this phase adds is not "more coverage". It is:

> **A spec named for a behaviour will cover that behaviour's deliberate forms and miss its
> incidental one.** Walking away is the most incidental thing in the game, and it was the broken one.

Part 5 and 6A both found a keyboard path diverging from a click path, which is a subtle place for a
bug to hide. These two hid somewhere much cheaper, and survived just as long.

## 3. The recall beacon, and the half of it that stays

6A routed its finding 5 here: the beacon acts from anywhere on the map, and `E` never offers it.
Both halves are true and only one of them is a bug.

**Gating the click is a bug fix**, and it is now `isNearRecallBeacon()` at the 1.55 object reach,
scoped in the handler to `.recall-beacon` and never to the bare `field-recall` action — because the
chrome back link carries that action too, has no position in the world, and gating it would strand a
player in a corner. That scoping is the same discrimination CLAUDE.md already records for the
beacon's visual spec.

**Adding it to `E` is not**, and this is a measurement rather than a preference. Three of the seven
maps park a body inside the beacon's reach — Riverbend's wharf clerk at 0.92 tiles, Canal
Crossroads' mule driver at 0.10, Richmond's Voss at 1.68. `nearestFieldInteraction()` is a
nearest-wins sort, so a fourth competitor in it would cost those three maps an NPC, in exchange for
reaching a control that is already one Tab away. **The beacon stays out of the sort.**

A gate the player cannot see reads as a dead button, so the beacon now reports `is-near` like every
other world marker — as a strengthening of the pulse it already has, not a reveal. Its label stays
drawn at all times, which is deliberate and predates this: recall is the one way off the map and is
meant to be the loud thing out there.

## 4. The sweep, and why the bar is the reach

The standing gap neither Part 5 nor 6A closed was **a body parked on an interactable's approach**
across the seven maps. Part 5 asserted it for the Main Hall alone and said outright that sweeping
the field was its own job.

It is now `field-map-coordinates.test.js`'s "keeps every NPC's ground out of an interactable's
reach", measured with `territoryOf()`'s **walked path** rather than its stops. That distinction is
the whole finding: five placements sit under 2.5 tiles, and exactly one is inside a reach —
**Philadelphia's town crier, 1.39 tiles from the Assembly hall notice board against the 1.55 a
player needs to read the Henry broadside off it.** His stops are 1.98 away and say nothing about it.
Mid-stride, walking to the broadside opened the crier. That is the burgess-and-minister bug of Phase
62, and it is the second time the stops have lied about where somebody goes.

**The bar is each target's own reach, not the Main Hall's 2.5.** 2.5 is right for a room whose one
approach is a doorway. It is wrong for a market square, where a notice board is _meant_ to have
people walking past it, and applying it here would have moved four more people to protect a sort
that already works. "Never inside the reach" is the weakest bar that still guarantees the object is
reachable from somewhere, which is the only property a player can feel.

## 5. What got written once instead of twice

`E` and a click carried character-for-character copies of the dialogue toggle. They had **not**
drifted, which is the only difference between this and 6A's finding 4 — the same duplication one
revision earlier. `toggleFieldDialogue()` is the single copy now, and it is also where the notice
gets cleared, which is why the two fixes are one seam rather than three call sites.

That makes three: `nearestInReach()` (Part 5), `openFieldRecord()`/`beginFieldRecord()` (6A), and
this. The rule they are all instances of is already in CLAUDE.md — **when a control exists in two
forms, the state changes live in one function both call** — and it is now cheaper to follow it than
to keep finding out.

## 6. Recorded, not fixed

- **The Practice Check's two progress counts** and **the Evidence Channel's static record list** go
  to Part 9, which owns the checks and the Codex surfaces. 6B owns the entries to them, and both
  entries work.
- **Unit 1's reconstruction lanes are engine literals** while the other six come from content as
  `CASE_0NN_LANES`. The consequence is not cosmetic: `validate:content` passes Unit 1's sources
  through `buildSourcesSchema({})` with no `reconstructionIds`, so it is the one field case whose
  `reconstruction` values nothing checks against its own lanes. Latent — the three values are
  correct today — and its own piece of work.
- **`.caribbean-world` declares its transform transition four times**: 92ms linear at the base rule,
  58ms linear `!important`, then `none !important` twice. The computed value is `none` purely
  because the last `!important` wins, which happens to be right. The comment on `.hub-world` that
  records Phase 90A's removal of exactly this tween asserted the field "does not have one either" —
  true of the outcome, false of three of the four declarations, and now corrected in place.
  Consolidating them is four `!important` layers deep and is not a thing to do on the way past.

## 7. Verification

- `npm run test` — 72 files, **1813** tests (7 new), green.
- `npm run test:e2e` — green, with a new `field-dialogue-lifecycle.spec.js`; all four of its cases
  confirmed **failing** against `b856660` first, and the sweep confirmed failing against the crier's
  own pre-fix route. One existing spec was **updated rather than accommodated**:
  `hub-movement.spec.js`'s recall test clicked the beacon from the spawn, 6.3 tiles away, because
  until now that worked. It walks there first. That test is about where the player lands, and the
  reach it used to depend on is now somebody else's subject.
- `npm run lint`, `prettier --check`, `cspell` — clean.
- **One visual baseline moved**, `practice-check-unanswered`, and it was read: finding 5's
  three-line eyebrow becoming one line, and the paragraph below it reflowing up. The beacon's lit
  state moved none, because the visual specs seed `currentScreen: "field"` directly and leave
  `fieldMovement` at its module default of (28,22) rather than the map's own spawn — so no baseline
  stands where Units 6 and 7 open with their beacon in reach. Recorded so it is not mistaken for
  coverage.
