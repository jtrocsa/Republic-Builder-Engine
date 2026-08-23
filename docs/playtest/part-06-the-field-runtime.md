# Part 6 — the field runtime

The walkable half of the game: seven outdoor maps, eight interiors, and every control on them.
Booked as two sittings because it is much the largest surface on the spine.

**6A — the world. Closed 2026-08-22.** Decisions in
[`0082`](../decision-log/0082-the-field-stops-trusting-one-map.md).
**6B — the mission surface. Closed 2026-08-23.** Decisions in
[`0083`](../decision-log/0083-the-field-stops-talking-to-itself.md).

Part 5 routed one S3 here (its finding 8, the field's two recall controls) and it is finding 3
below. Everything else came out of a static audit, as Part 5's did — the second part in a row where
reading found more than a play script would have, and the reason the protocol puts reading first.

---

## 6A findings

All `A` (static audit). No owner pass was run.

| №   | Sev | Cat            | Finding                                                                                                                                                                                                                                                                                                 | Outcome                                                             |
| --- | --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | S2  | `broken`       | **A locked record opened.** `nearestFieldInteraction()` never asked `sourceAvailability()`, so `E` offered a record the map deliberately draws nowhere. The only thing standing in the way was a hard-coded `case-001` gate, duplicated at two call sites. Six maps declared the rule; one applied it.  | Fixed. One `refuseLockedRecord()`, both literals gone.              |
| 2   | S2  | `broken`       | **"Reset Case 1.01 demo" wiped all seven units.** Its first statement was `progress = resetProgress()`; the lines after re-seeded a few Case 1.01 fields, which is what made the shape look deliberate. Case 1.01 stays replayable all year, so the student likeliest to press it has the most to lose. | Fixed. It resets one case. Label drops "demo".                      |
| 3   | S2  | `inconsistent` | **Two controls claimed to recall you** (P5-8). The beacon warps, notices, and lands you at the Navigation Table. The back link said "← Recall to Institute" and ran `home`: instant cut, no notice, spawn at the foyer — seven tiles from where the beacon puts you.                                    | Fixed. One action, one name, one arrival.                           |
| 4   | S2  | `broken`       | **`E` and a click on the same record did different things.** On a _secured_ record `E` set `activeActivitySourceId`, re-pinning its finished mission as the Mission Tracker's in-flight block; `open-source` does not. Three copies of the same state changes, drifted.                                 | Fixed. `openFieldRecord` / `beginFieldRecord`, called by all three. |
| 5   | S3  | `inconsistent` | The recall beacon is a world marker that acts from **anywhere on the map** — no proximity gate — and `E` never offers it, because it is not in `nearestFieldInteraction()`. Every other world marker is the opposite on both counts.                                                                    | **→ 6B.** Safe to gate now that chrome carries the same control.    |
| 6   | S3  | `rough`        | The beacon's `aria-label` said "Recall to Archive room" where its visible text said "Recall to Archive". A screen reader and a sighted player heard two names.                                                                                                                                          | Fixed in passing.                                                   |
| 7   | S3  | `inconsistent` | `CURRENT-REPOSITORY-AUDIT.md:181` states `resetCaseOneDemo()` "surgically resets only `case-001`-related fields". It never did. That file's own header is the claim that it was verified against source.                                                                                                | Corrected, dated, in this commit.                                   |
| 8   | S3  | `rough`        | `activeFieldCaseId()` falls back to `"case-001"` — an engine literal naming content. It is a sane default rather than a gate, and nothing reaches it in normal play.                                                                                                                                    | Kept. Noted so the next reader does not re-find it.                 |

## The one worth reading twice

Finding 1 is Part 5's headline again in a different room, and the resemblance is the point.

Both bugs were a **keyboard path diverging from a click path**, and both survived because the click
path was fine. In Part 5 a mouse could not reproduce it because `hub-interact` skips the sort. Here
a mouse could not reproduce it because **there is no button to click**: `fieldSourceSignal()`
returns `""` for a locked record, so the world marker is not drawn at all. That is the honest
presentation — and it is exactly what hid the gap, because it made the click-path copy of the gate
unreachable and therefore made the gate look enforced.

`E` does not go through the marker. It goes through `nearestFieldInteraction()`, which offers a
record whether it is drawn or not. So the enforcement was one literal, `caseId === "case-001" &&
!hasEvidence("case-001", "taino-context")`, and it was the only enforcement in the game.

Phase 70 had already moved the _declaration_ of this rule into content as `requiresSourceId`,
because Riverbend needed the same gate and CLAUDE.md's engine/content rule says the second consumer
pays to make it data. It did — for the marker and the checklist. **Both enforcement copies were
left behind**, and five more maps have declared the rule since without any of them applying it.

Only one record outside Unit 1 is both locked and anchored to an object rather than carried by a
person, and it is the one that opened: **Richmond's price board**. The other five gated records ride
on NPCs, and the dialogue bubble has always checked availability before offering its button.

## What was checked and what was not

The refusal is pinned by unit tests, not by a walk, and that is a real limit rather than a
preference. A locked record **has no marker to walk to**, so `walkTo()` — which steers until the
game's own `.is-near` appears — has nothing to steer at; and reaching the price board's cell from
the Franklin Street spawn means crossing the bluff, which `richmond-interiors.spec.js`'s own header
records as the reason it seeds its way into rooms instead of walking to them.

So: `field-record-gate.test.js` pins the gate on all seven maps and the single enforcement point,
`field-objective-tracker.spec.js` pins the presentation on Richmond in a browser, and
`field-recall.spec.js` pins finding 3 end to end. Both new guards were confirmed failing against
`ef6527c` before being kept.

**Fifteen visual baselines moved** — every field surface, indoors and out — and all fifteen are the
back link's one word. A sixteenth, `mission-debrief-record`, was rewritten by the update and
reverted after comparison: the two images are identical and the bytes differ by 316, which is
encoder noise. It had never been compared before, because its test aborts at the outdoor map above
it.

## 6A play script

Twelve steps, opening on `?warp=field` — the Caribbean, at the shoreline spawn.

1. `?warp=field` → the island, player at the spawn.
2. Read the top-left control. _It says "Recall to Archive", the same as the beacon out on the sand._
3. Read the Mission Tracker. _Three rows; two say "Not yet available"._
4. Walk to the village elder and take the observation. _The two locked rows open, and two ✦ markers
   appear that were not drawn before._
5. Walk back to the cartographer's table and press **E**. _The record opens._
6. Recall from the beacon. _Warp, then the Archive, standing at the Navigation Table._
7. Return to the field and use the **top-left** control instead. _The same warp, the same arrival._
8. Open Case 1.13 (Richmond) and read the tracker. _Six rows, one greyed._
9. Walk the street looking for the greyed one's marker. _There is none — the map does not draw a
   record you cannot take yet._
10. Take the impressment requisition from the War Department clerk, then look again. _The price
    board is now marked._
11. Back on the Caribbean, press "Reset Case 1.01". _Case 1.01 starts over. Your other units, your
    badges and your Codex are all still there._
12. Reopen a record you have already secured, once with a click and once with **E**. _Both open the
    reader; neither re-pins a finished mission in the tracker._

## Routed onward

- **→ 6B**: finding 5, the beacon's missing proximity gate.
- **6B's own subject** — the dialogue bubble, the Evidence Channel panel, the door markers, the
  Practice Check and Reconstruction entries — is unaudited. Nothing below has been read yet.

---

## 6B findings

All `A` (static audit), as 6A's were. No owner pass was run. Four of the ten were confirmed in a
browser before being written down, because those four are things a reader can talk themselves into
and a measurement cannot.

| №   | Sev | Cat            | Finding                                                                                                                                                                                                                                                                                                      | Outcome                                                              |
| --- | --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| 1   | S2  | `broken`       | **Walking away from a conversation left the bubble on screen.** `runFieldMovementLoop()` cleared `progress.activeFieldNpc` on the first moved frame and never rendered, so the bubble it had drawn stayed — visible, still offering its "Examine …" button — for the rest of the visit. Never saved, either. | Fixed - by patching the one node, not by rendering. See ADR 0083 §1. |
| 2   | S2  | `unclear`      | **"Move closer to interact with X." never went away.** Nothing cleared the field's only status line on a _successful_ interaction. Confirmed: the line naming the canoe worker was still on screen after walking to the elder and opening her dialogue — a status line contradicting the game.               | Fixed. The next attempt that lands clears the one that missed.       |
| 3   | S2  | `inconsistent` | **The recall beacon acted from anywhere on the map** (6A's finding 5). Confirmed: a click dispatched at the Caribbean spawn, 6.3 tiles away, went straight to `return-warp`. Every other world marker refuses and says so.                                                                                   | Fixed. Gated at the object reach, and it now shows when it is live.  |
| 4   | S2  | `broken`       | **Philadelphia's town crier walked inside the Henry broadside's reach** — 1.39 tiles against the 1.55 a player needs to read it, so mid-stride the Assembly hall notice board opened the crier. His _stops_ were 1.98 away and said nothing.                                                                 | Fixed. His circuit runs along y=13.5; the sweep below is the guard.  |
| 5   | S3  | `rough`        | The Practice Check's eyebrow read "Case 1.01 — The Landing interaction · **test features**" — a developer's word on a student's screen, and the mission's title where its name belongs.                                                                                                                      | Fixed in passing. "The Atlantic Crossroads · Practice".              |
| 6   | S3  | `inconsistent` | The interior exit said "Step outside" and announced "Step back outside". 6A's finding 6 in a different room.                                                                                                                                                                                                 | Fixed in passing.                                                    |
| 7   | S3  | `inconsistent` | `E` and a click carried character-for-character copies of the dialogue toggle. Not yet drifted — which is the only thing separating it from 6A's finding 4.                                                                                                                                                  | Fixed in passing. One `toggleFieldDialogue()`.                       |
| 8   | S3  | `unclear`      | The Practice Check shows two different progress counts: `N/M practice items complete` over all four sections, then a lone `N/M answered` styled as feedback under the MCQs only.                                                                                                                             | **→ Part 9.** That part owns the checks; 6B owns the entry to them.  |
| 9   | S3  | `rough`        | The Evidence Channel's `channel-progress` line re-lists the records the `.field-intro` paragraph has already enumerated, and never changes as they are secured — while the Mission Tracker two panels left carries a live count and a bar.                                                                   | **→ Part 9**, with the Codex surfaces.                               |
| 10  | S3  | `inconsistent` | Unit 1's reconstruction lanes are engine literals in `RECONSTRUCTION_LANES`; the other six map over a `CASE_0NN_LANES` exported from content. So Unit 1 is the only field case validated with `buildSourcesSchema({})` — the only one whose `reconstruction` values nothing checks.                          | **→ an ADR.** Latent, not live: its three values are correct today.  |

## The one worth reading twice

Findings 1 and 2 are the same shape as 6A's and Part 5's, and it is worth naming the shape a third
time because it has now produced five bugs across three parts.

**A control changed state and the screen was not told.** Part 5: `nearestHubTarget()` answered in
declaration order. 6A: two copies of a gate, one of them never reached. Here: the movement loop wrote
`activeFieldNpc = null` and stopped, and `fieldTooFarNotice()` wrote a line nothing ever took back.
In every case the state was right and the presentation disagreed with it.

What is different this time is **why they survived**. 6A's and Part 5's both hid behind a keyboard
path a mouse never took, which is a subtle place to hide. These two hid behind something much
cheaper: **no test ever walked away.** `field-movement-dialogue.spec.js` opens a bubble, closes it
with the ×, and closes it by clicking away — three of the four ways a conversation ends. The fourth
is the one a player uses constantly, and it was the broken one.

The lesson is not "write more tests". It is that a spec named for a behaviour tends to cover that
behaviour's _deliberate_ forms and miss its incidental one, and walking away from someone is the
most incidental thing in the game.

## The sweep 6A routed here

The standing gap neither Part 5 nor 6A closed was **a body parked on an interactable's approach**,
across seven maps and eight interiors. Part 5 asserted it for the Main Hall only and said openly that
sweeping the field was its own job. This is that sweep, and it is now
`field-map-coordinates.test.js`'s "keeps every NPC's ground out of an interactable's reach".

Measured against each target's own reach — 1.55 for an object-anchored record, 1.45 for a door —
using `territoryOf()`'s **walked path**, not the stops. That distinction found the only failure:

| Map              | Body                  | Target                     | Stops | Walked path |
| ---------------- | --------------------- | -------------------------- | ----- | ----------- |
| Philadelphia     | town crier            | Assembly hall notice board | 1.98  | **1.39**    |
| the Caribbean    | Columbus              | Waldseemüller map          | 1.80  | 1.80        |
| Canal Crossroads | abolitionist lecturer | Reform Square board        | 1.75  | 1.75        |
| Richmond         | shopkeeper            | the price board            | 2.01  | 2.01        |
| the railhead     | town-site promoter    | the Clarion in the window  | 1.80  | 1.80        |

Only the first is inside a reach, and only the walked path shows it — exactly the correction the
burgess forced on the NPC-versus-NPC check in Phase 62. The other four are outside their target's
reach and stay, because **the bar is the reach, not the Main Hall's 2.5.** 2.5 is right for a room
whose one approach is a doorway and wrong for a market square, where a notice board is _meant_ to
have people walking past it. Forbidding that would empty the squares to protect a sort that already
works.

The beacon is deliberately outside all of this. It is gated on the click path now, but it stays out
of `nearestFieldInteraction()`, so `E` still never offers it — and that half is a measurement, not an
oversight. **Three of the seven maps park a body inside the beacon's reach**: Riverbend's wharf clerk
at 0.92 tiles, Canal Crossroads' mule driver at 0.10, Richmond's Voss at 1.68. Adding a fourth
competitor to the nearest-wins sort would cost those three maps an NPC, to reach a control that is
already one Tab away on the chrome back link.

## What was checked and what was not

Findings 1, 2 and 3 are pinned end to end by `field-dialogue-lifecycle.spec.js`, all four of its
cases confirmed failing against `b856660` first. Finding 4 is pinned by the sweep above, confirmed
failing against its own pre-fix route.

**One visual baseline moved** — `practice-check-unanswered`, finding 5's three-line eyebrow becoming
one — and it was read. The beacon's new lit state moved none, and the reason is worth recording so
the next reader does not mistake that for coverage: the visual specs seed `currentScreen: "field"`
directly, which leaves `fieldMovement` at its module default of (28,22) rather than at the map's own
spawn. Units 6 and 7 spawn 1.50 tiles from their beacons and _do_ open with it lit in real play; no
baseline stands anywhere that would show it.

Finding 10 was found by reading `scripts/validate-content.js`, not by a failure, and stays that way.

## 6B play script

Twelve steps, opening on `?warp=field` — the Caribbean, at the shoreline spawn.

1. `?warp=field` → the island, player at the spawn.
2. Click the recall beacon out on the sand, without walking to it. _"Move closer to interact with the
   recall beacon." You are still on the island._
3. Use the top-left control instead. _The warp, and the Archive._
4. Return to the field and walk toward the beacon. _It brightens as you come into reach._
5. Click a person on the far side of the map. _"Move closer to interact with …"._
6. Walk to the village elder and open her dialogue. _The bubble opens — and the "move closer" line
   from step 5 is gone._
7. Walk away from her without closing anything. _The bubble leaves when you do, not later._
8. Reload the page. _You are still in the field, and nobody is mid-sentence._
9. Open the Philadelphia mission and walk to the Assembly hall notice board. _**E** opens the
   broadside, whichever way the crier happens to be walking._
10. Open a mission's Practice Check from the Evidence Channel. _The eyebrow names the mission. No
    screen says "test features"._
11. Step into any interior and read its exit marker. _It says "Step outside", and a screen reader is
    told the same three words._
12. Secure every record and open the Reconstruction Table. _Its lanes are that unit's own._

## Routed onward

- **→ Part 9**: findings 8 and 9 — the Practice Check's two progress counts, and the Evidence
  Channel's static record list.
- **→ an ADR**: finding 10, Unit 1's engine-literal lanes and its unvalidated `reconstruction`
  values.
