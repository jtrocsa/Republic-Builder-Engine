# Part 6 — the field runtime

The walkable half of the game: seven outdoor maps, eight interiors, and every control on them.
Booked as two sittings because it is much the largest surface on the spine.

**6A — the world. Closed 2026-08-22.** Decisions in
[`0082`](../decision-log/0082-the-field-stops-trusting-one-map.md).
**6B — the mission surface.** Not started.

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
