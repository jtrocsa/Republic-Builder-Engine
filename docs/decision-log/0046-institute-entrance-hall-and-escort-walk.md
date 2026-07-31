# 0046 — The corridor becomes a room, and "follow me" becomes following

**Status:** accepted · **Phase 63** · follows
[`0045`](0045-npc-behaviour-routes-and-institute-prop-scale.md), which gave NPCs somewhere to be and
a way to get there — the machinery this reuses to walk the Director to a door.

## What was wrong

The beat between Registration and the Main Hall was a five-second cutscene, and it looked like one.

`intro-hallway` was a screen of its own that borrowed `directorSceneMarkup()`'s dialogue bar through
a `stageHtml` escape hatch and dropped a corridor into it. `runHallwayWalk()` then lerped two
`%`-positioned divs from `top: 86%` to `top: 42%` over 5000ms while scaling the tile canvas
`1 → 1.35` as a dolly. The player did not walk; the player floated, on a fixed track, at a speed
unrelated to their own, past art that could not react to them.

The art could not have held up either. `hallway.tmj` was **6×10, two layers, no collision, no blocks
module**: a strip of stone floor with cabinet fronts along both edges. It had no walls — the walls
were `.hallway-viewport::before/::after`, two 18%-wide CSS gradient bands — and no door: the door was
three stacked gradients in `.hallway-door`. Its generator predated `MapBuilder` and hand-rolled its
own layer arrays and `stamp()`. The palette's own header said why none of that mattered: _"This map
is a scripted cutscene — runHallwayWalk() drives the sprite directly, so there is no collision or
interaction data here, only art."_

That was a defensible trade when the corridor was two seconds of transition. It stopped being one
once the question became "what does the player's first minute feel like."

## Decisions

**The corridor becomes the Institute's third hub room.** `currentScreen: "institute"` +
`currentHubRoom: "hallway"`, resolved through the same `activeHubGrid()`/`activeHubBlocks()`/
`activeHubTargets()` switches the Archive Room already goes through. Keeping `intro-hallway` as its
own screen would have meant widening six separate guards — `runHubMovementLoop`,
`updateInstituteNpcs`, the institute keydown branch, `render()`'s institute rAF block,
`sceneForMusic()`, `VALID_SCREENS`. The room costs one `VALID_SCREENS` removal and three
`activeHub*()` branches, and it gets correct music continuity and `chrome()` for free, because it
_is_ the Institute.

`updateInstituteNpcs()` gained `activeHubNpcRuntime()` and **lost** its `currentHubRoom === "archive"`
early return: an empty object iterates zero times, which is what that branch was hand-coding.

**20×18, and both numbers are deliberate.** Width 20 is the Archive Room's width exactly, so the
frame joins the existing `aspect-ratio: 20/12` rule with no new CSS and no exposure to
`updateHubCamera()`'s one rough edge (a world narrower than its frame is pinned flush left, because
the clamp cannot return a positive offset — left alone here as an unrelated fix). Height 18 is six
rows _taller_ than the frame, which is the opposite of the Main Hall's choice and for the opposite
reason: that room is one row short so its pennants are never sliced, and this one is deep so the
camera pans ~280px north across the escort. The entrance recedes, the doors rise into frame. **The
pan is the shot.**

**The layout holds one invariant: cols 8–11, rows 2–15 carry no `solid` and no `base` stamp.** Four
open bands cross an unbroken four-tile spine, and each furnished band stops a tile short of it on
both sides. A sealed pocket is not constructible from that shape — the same argument the Main Hall's
alternating bands make, and the reason the property is checkable by construction rather than by eye.
The spine is also what the escort walks.

**The player walks up to him and presses E.** This is now the first thing in the game the player
controls, so the room doubles as the movement tutorial and the interaction is proximity-gated like
every other one in the game.

**The conversation is in world, and it reuses the intro typewriter rather than the hub dialogue
panel.** `currentIntroLines()` keys its hallway branch off `hallwayScene.phase === "talking"` instead
of a screen name; everything downstream — the typewriter, the continue caret, tap-to-skip-the-typing,
`{{chroniclerName}}` — works unchanged. `.hub-dialogue` was the obvious alternative and was rejected
twice over: it is a full-screen scrim that darkens the room you can see the speaker standing in, and
its `target.dialogue()` returns a single string, so multi-beat advance would have had to be built
anyway. `scenes.hallway` went from one line to four, ending on "Walk with me."

**The director-stage briefing is untouched.** Its reveal rail carries the badge reveals, the evidence
chips and the cinematic Codex reveal with its SFX; those are worth more where they are than the
symmetry of moving every Director line in-world would be worth. The Entrance Hall renders its own
empty `#directorRevealRail` and authors no reveals into it.

**The player follows on a breadcrumb trail** — new pure `engine/escort-walk.js`. The leader walks a
route from `findRoute()`; every advance pushes `{x, y, s}` with cumulative arc length; the follower
samples that trail at `leaderDistance − gap`. **The follower needs no collision test at all**, because
every point it walks is a point the leader already stood on. That is the whole argument for a trail
over routing the follower separately: it cannot clip a corner the leader rounded, and it cannot pick
a different way around an obstacle and arrive beside the person it is supposed to be behind. It also
produces the right look for free — the follower turns each corner a step late.

The follower **is** `instituteMovement`, and the leader **is** `hallwayNpcRuntime.director`. That one
choice is why nothing else needed changing: `updateHubCamera()` is already a pure function of
`instituteMovement`, so the camera pan comes free and CLAUDE.md's camera invariant never comes into
it, and `instituteNpc()`/`updateInstituteNpcs()` keep drawing the Director exactly as they did.

**Not a fourth `kind` in `npc-behaviour.js`.** That module's contract is "a character decides where to
go on its own, indefinitely": three non-terminating kinds, a seeded PRNG, an `isBlocked` gate per
step. An escort is one-shot, deterministic, two-bodied, and it ends. Folding it in would mean
`stepBehaviour()` returning a completion signal meaningless to the other three.

**The screen flickers black twice and holds.** `@keyframes doorway-flicker` with `steps(1, end)` —
the steps are what make each stop a cut rather than a fade, and the base `.scene-fade` rule's 480ms
opacity transition is exactly what the flicker must not do. It ends held black, so `animationend`
fires precisely when the screen is covered and the room swap hangs off that rather than a magic delay
duplicated between the CSS and the JS. Reduced motion collapses it to one cut, where a `setTimeout`
backstop covers the swap because there is no animation to listen for.

The cut fires on `leaderDone`, not `done`: the Director steps through and the pulses start while the
player is still a step behind, which is what it should look like. The escort keeps ticking underneath
so the follower closes up beneath the black.

**Two input locks became one.** `isHubInputLocked()` = the tutorial tour or any non-idle hallway
phase, swapped into the same three sites the tour lock already used. Two overlapping locks checked at
overlapping subsets of three places is how a screen ends up controllable during half of a cutscene.

**A save left in the room replays the scene from the top.** It is fifteen seconds, and replaying it
deletes an entire failure class: resuming mid-conversation into a locked-out player, a Director
halfway to the door and a typewriter that will never fire. Old `intro-hallway` saves migrate above the
`VALID_SCREENS` check, which would otherwise have dropped them into the Main Hall having skipped the
introduction.

## What this removed

`runHallwayWalk()`, `completeHallwayWalk()`, `HALLWAY_WALK_MS`, four `hallwayWalk*` module lets,
`introHallwayScreen()`, its `render()` case and rAF block, the `"intro-hallway"` screen itself, and —
confirmed to have exactly one caller — `directorSceneMarkup()`'s `stageHtml` parameter with its
`usingDefaultStage` gate. In CSS: 108 lines of `.hallway-viewport` / `::before` / `::after` /
`.hallway-scaler` / `.hallway-door` / `.hallway-sprite`, all reachable only from the deleted screen.

## Verification

- `tests/unit/escort-walk.test.js` — 11 assertions on the pure module: the follower holds its gap,
  holds still until the leader is a gap ahead, never leaves the leader's path around a corner, faces
  by its own displacement (so it turns the corner late), covers the same ground however often it is
  ticked, latches both flags, and terminates on an empty route rather than hanging the scene.
- `tests/unit/field-map-coordinates.test.js` — a new Entrance Hall block: grid matches the `.tmj`,
  every rect is in bounds and backed by drawn art, no sealed pocket from the spawn, the Director is
  standable and reachable, and `findRoute()` walks the spine with **`route.length > 0`** — a bare
  not-null check would pass on the empty route that `startHallwayEscort()`'s `|| []` also produces,
  and either would finish the escort on its first frame having moved nobody.
- `tests/e2e/hallway-onboarding.spec.js` — 6 cases: the tile art renders (the only guard against a
  sheet missing from `resolveHallwayTilesetImage()`'s globs, which throws and draws an empty frame —
  the third time that failure mode has come up), E does nothing out of reach, the prompt clears when
  the player walks away, the south wall stops them, the escort locks input while it walks them in,
  and a reload mid-conversation replays from the spawn.
- `tests/e2e/boot-onboarding.spec.js` rewritten — it clicked `[data-next="intro-hallway"]` and waited
  out the 5s float. It now walks to the Director by position (`walkToHubNpc()`, not a timed hold —
  timed holds are this suite's only historical flakes), talks, and asserts arrival in the Main Hall
  with `tutorial.step === "tour-intro"`.
- One new visual baseline, `institute-entrance-hall`. **The other 19 were unchanged**, which is the
  evidence that none of this moved the rooms next door.
- Full `npm run test` (866), `npm run test:e2e` (73), `npm run build`, `npm run validate:content`.

## Deliberately not done

- **`updateHubCamera()`'s off-centre clamp.** A world smaller than its frame is pinned top-left rather
  than centred. Real, two lines, and unrelated — a 20-wide room has the Archive Room's existing ~11px
  of slack and ships the same way today, so fixing it here would only have added two regenerated
  baselines to a change that otherwise touched none.
- **New art.** The room is composed from the five sheets the Main Hall already draws, on purpose: its
  north doors open into that room, and the two have to read as one building.
- **A general cutscene engine.** `docs/tour-plan.md`'s "Explicitly not building" still holds.
  `escort-walk.js` is one pure primitive with one caller, not a scripting layer.
