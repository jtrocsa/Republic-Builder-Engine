# 0121 — Nobody walks on the spot

**Phase 122 · 2026-09-06 · Accepted**

The owner watched the Institute's opening scenes and reported one thing: _"when they stop, they just
keep walking — walking with no movement."_

That is the first defect report from someone watching the game rather than from the repository
checking itself since Phase 109. It turned out to be three separate code paths breaking the same
rule, all of them invisible except during a scripted scene.

The rule is already written down. `CLAUDE.md`: **"Ground speed drives the walk cycle, per body, per
moment."** Every prior phase read that as an instruction about _how fast_ the legs run. Its other
half had never been stated: **a body covering no ground is standing.**

---

## 1. Why a scene is where this shows

A scene is the one time in this game when nothing else repaints the room.

`updateInstituteNpcs()` early-returns on `isHubSceneActive()`. `startHubScene()` calls
`stopHubMovementLoop()`. What is left is `runHubSceneFrame()`, which paints only what the scene is
moving — so during a scene, **the last flag written to a body is the flag that body keeps**, for as
long as the scene runs.

Everywhere else the same staleness is erased within one frame by a loop that keeps running. That is
why this survived a phase of locomotion work (`0044`), a character-sheet standard, and a suite with
three specs that read `is-walking` classes off the DOM.

## 2. An escort left both bodies walking at the destination

`stepEscort()`'s `applyMotion()` sets each body's flag from that frame's own displacement, which is
right. What was wrong is that nothing cleared it at the end, and **the frame an escort finishes is a
frame both bodies moved on**:

- the follower by construction — `done` is the moment it reaches its station, and it reaches it by
  moving;
- the leader too, whenever the two land on the same tick, which is every walk whose follower held
  its gap the whole way.

Simulated against the three authored walks, stepping exactly the way `runHubSceneFrame()` does —
which is to say stopping the instant `done` is true:

| walk                                           | leader at `done` | follower at `done` |
| ---------------------------------------------- | ---------------- | ------------------ |
| tour leg 1 — the post to the Preservation Case | not walking      | **walking**        |
| tour leg 2 — the named turn along the aisle    | **walking**      | **walking**        |
| the Entrance Hall walk to the doors            | not walking      | **walking**        |

The follower is the **player**. So on every scripted walk in the game the player arrived, stopped,
and marched on the spot through the whole of whatever was said next — two long lines at the
Preservation Case, two more at the Archive Room door, eight in Scene A and eleven in Scene D.

Cleared in `stepEscort()` rather than at the call site, because that module is what sets the flags.

**The existing test could not see it.** `escort-walk.test.js` had a case named _"latches both flags
rather than flickering once the walk is over"_, asserting exactly these two flags are false — and it
runs 8000ms past the end before it looks. It was asking what the flags settle to on frames the host
never runs. The same shape as Phase 120's vacuous art predicate: a guard that arranges the one
condition under which the defect cannot appear.

## 3. A scene froze the room's other walkers mid-stride

`paintHubSceneFrame()` iterates **every** body in the active room's runtime and re-applies
`body.walking`. For the bodies the scene is not moving, that flag is whatever they were holding on
the frame the scene took the room — and the Main Hall's two route walkers are mid-stride roughly half
the time, by design (`0044` tuned Dr Soto to near half and half deliberately).

So the Director's tour played out with Professor Park or Dr Soto marching on the spot behind it,
about half the time, for its full length.

Fixed in `startHubScene()`, one line, beside the two that already stop the player for the same
reason — and symmetric with `finishHubScene()`, which has cleared the same flags on the way out since
Phase 90. The teardown half was written; the setup half was not.

## 4. And the hub's wall slide ran the legs 41% fast

Found while reading the first two, and it is the same rule from the other end.

`runFieldMovementLoop()` measures the ground the player actually covered and hands that to
`updateFieldPlayer()`, because a diagonal held against a wall keeps one of its two normalised
components and so travels at 0.707 speed. Its comment says why, and then says this:

> _"updateInstitutePlayer() has taken a speed since Phase 63 for exactly this reason; the field
> passed the constant."_

It does take a speed. The only caller that ever passed one is the scripted-scene runner, at the 2.2
a scene walks at. `runHubMovementLoop()` passed nothing and got the `HUB_SPEED` default, so sliding
along an Institute wall ran the legs at 3.65 while the body moved at 2.58 — a cycle of 0.301s where
0.426 was owed.

**The comment was describing a fix that had been made somewhere else.** Worth recording as its own
finding: this is the second time in three phases that a claim about coverage was true of the sentence
and not of the code (`0119` §2, and `0112` §3's "both hub rooms" when there are three).

## 5. The guards, and each one proved against its own defect

Every check here is a check that had never run, so passing is not evidence. Each was watched go red
with only its own fix reverted:

| guard                                                                       | defect                      | red without the fix                                      |
| --------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------- |
| `escort-walk.test.js` — "stands both bodies still on the frame it finishes" | §2, simultaneous arrival    | `leader.walking` true                                    |
| `escort-walk.test.js` — "a follower that was still closing"                 | §2, the other arrival shape | `follower.moving` true                                   |
| `scene-walk-cycle.spec.js` — the Director's tour                            | §2, in the browser          | **`["player"]` at beat 0** — the owner's report, exactly |
| `scene-walk-cycle.spec.js` — the walkers it froze                           | §3                          | `["julian"]`, standing still with his legs going         |
| `hub-movement.spec.js` — "the wall slide included"                          | §4                          | slid 0.301, identical to walking free                    |

The e2e claim is one the interpreter makes exact rather than approximate: a scene holds on one command
at a time, `say` is `input` and `moveActor` is `signal`, so **while a scene is holding for a line to be
read, nothing in the room is moving.** Any walk cycle on screen in that window is a lie. The continue
indicator is that window — a state to ask the page about, not a duration to wait out, which is the same
reason `hallway-onboarding.spec.js` steps its beats by watching it.

**The frozen-walker guard chooses its frame from inside the page.** Both Main Hall walkers are
mid-stride about half the time, so a test that opened a scene and looked would pass or fail on a coin
toss. Instead it watches for the first frame somebody is actually walking and opens the scene **on that
frame**, from inside `page.evaluate` — the round trip out to the test and back is longer than a stride,
which is the case `CLAUDE.md` says to ask the page about from inside it. It then asserts it caught
somebody, because a run that caught nobody would have asserted nothing.

## 6. What this says about the last four phases

Phases 118–121 were the repository checking itself, and they were worth doing: 120 found a guard that
could not fail, 121 found a map 45% below the fold. But this defect was in front of every player from
the first minute of the game, on the first scene, and **four consecutive audit phases did not find
it** — because every one of them asked a question about geometry, coverage or layout, and none of them
asked whether a thing that had stopped looked stopped.

The standing recommendation since Phase 109 has been that the next work should come from someone
playing the game. It has now paid, on the first report, three defects deep. It still stands.

## 7. The guard was too expensive, and its neighbours paid

The tour guard shipped at **33.9 seconds** in its first form: it walked the Director's tour and then
carried on through the scene it hands off to, ten spoken beats and seven real escort walks. Every one
of those seconds is continuous `requestAnimationFrame` over a canvas.

The full suite came back **323 passed, 2 failed** — `port-interiors` and `activity-engines`, both
walk-heavy field specs, neither touched by anything in this phase. Both passed in isolation.

That is the point at which Phase 121's own lesson applies rather than a retry: **HEAD was run
unmodified first**, and came back 322 passed with nothing failing. So the failures arrived with this
phase, and "not my code" was not an answer.

Reproduced directly — the tour test run against just those two specs on the same two workers:

| run | result                                         |
| --- | ---------------------------------------------- |
| 1   | 16 passed                                      |
| 2   | 1 failed — the inspection hall's walk          |
| 3   | 1 failed — a different test, in the other spec |

A different victim each time, which is what starvation looks like and not what a logic defect looks
like. The mechanism is the one `0120` §7 already recorded: **the suite's walker still reads a slow
frame as a stall**, so the cost of a long, busy test is paid by whatever is walking beside it.

**The guard was sized to its claim rather than the walker being re-tuned.** The escort has exactly two
arrival shapes — a follower still closing when the leader stops, so only its flag is left set; and
both bodies landing on the same tick — and the tour's two beats are one of each. The eight beats after
them exercised the same completion again. Cut to those two, the test is **11.0 seconds**, still goes
red at beat 0 with the fix reverted, and the same three-spec experiment ran **4 for 4 clean**.

**No slider was turned on the walker.** `PROGRESS_TILES`, `maxStalls`, `maxReplans` and the 150ms
burst floor are all untouched. What changed is the size of the new test.

**Recorded and not chased:** 150ms was enough at 322 tests and was not enough with one 34-second rAF
neighbour, so the floor is still a wall-clock budget standing in for a frame count. The rule this repo
keeps invoking — _a test's verdict must not depend on how fast the machine is_ — is not yet satisfied
by the walker, only made less likely to bite. Fixing that means counting frames rather than
milliseconds inside `walkTo`, which is a change to a helper twenty-four tests depend on and does not
belong in a phase about walk cycles.

## 8. What was not done

- **No new content, no new systems.** Three code paths, five guards, one new spec file.
- **The `.field-tracker` contradiction** (`0120` §8) is still recorded and not chased.
- **`applyMotion()` was left alone.** It reports the frame's displacement and is right to; the fix
  belongs at the end of the walk, not in the per-frame report.
- **No sweep for stale-class defects elsewhere.** The field's own loops, `is-talking` and `is-near`
  were read and are clean, because the loops that write them keep running. If another turns up it will
  be for the reason §1 gives, and the place to look is anywhere a loop stops.
