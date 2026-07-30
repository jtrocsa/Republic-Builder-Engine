# 0044 — The cast stands in the world, at the world's scale, at its own walking speed

**Status:** accepted · **Phase 61** · follows
[`0043`](0043-one-cast-one-canvas-four-directions.md), which replaced the art but left the systems
around it tuned for the placeholders it replaced.

## What was wrong

Four separate defects, all visible in one screenshot of Riverbend and one of the Main Hall.

**1. NPCs skated and the player glided.** The player runs on requestAnimationFrame with
elapsed-time scaling at 3.65 tiles/second. NPCs ran on `setInterval` with a fixed displacement per
tick and no time scaling at all — 0.012–0.018 tiles per tick on an 80ms interval, which is
**0.15–0.23 tiles/second, a twentieth of the player's speed**. Meanwhile `--sprite-cycle` was
declared in the keyframe but never set by anything, so every character in the game animated at the
0.72s fallback regardless of how fast it was actually moving:

|           | ground speed      | distance per step                                            |
| --------- | ----------------- | ------------------------------------------------------------ |
| Player    | 3.65 tiles/s      | **1.30 tiles** — a stride longer than the character is tall  |
| Field NPC | 0.15–0.23 tiles/s | **0.05–0.08 tiles** — eleven footfalls a second to cover 3px |

**2. All 21 NPCs walked the same rectangle.** Three hand-written tables, four waypoints each, every
single one a loop roughly 0.9 tiles wide and 0.65 tall. Watching any two characters for ten seconds
gave it away.

**3. The cast was too big for the world it stood in.** Measured out of the shipped tile art:
doorways **22–31px**, one-story cottages **95–103px**, mature trees **~140px**, tiles **48px**. The
cast body rendered at **67px** — over twice the height of every door it walked through, and half
the height of an oak. It was also upscaled 1.48× from its 48×56 source while every tileset around
it rendered 1:1, so it resampled unevenly against perfectly crisp art.

**4. In the Institute, characters were drawn a tile away from where the game thought they were.**
`hubPointStyle()` positioned at `left:(x+0.5)*tile, top:(y+0.51)*tile`, and then `--cast-foot:
33.5px` pushed the feet down another 0.70 tiles. Collision put them at `x`, `y+0.19`. Net: **0.50
tiles right and 1.02 tiles below**. At the east wall a sprite overlapped 35px of masonry that
collision was correctly holding it clear of, and Prof. Park stood on the south wall.

The fourth went unnoticed for a long time because the player was wrong by the same amount. Everyone
looked consistent with each other, and merely wrong about the room.

## Decisions

**One canonical scale: `--cast-h: 56px`, rendered 1:1.** One source pixel, one screen pixel, the
same as every tileset. The body reads at 45px — slightly under one tile, roughly 1.5× a doorway
rather than 2.2×, and about a third of a tree. Nothing is resampled, so a moving sprite does not
shimmer. The narrow-viewport `--cast-h: 63px` override is deleted rather than retuned: a second
size would put the cast back on a fractional scale, and the furniture it stands next to does not
shrink on a small screen either.

**`--cast-foot` is derived from the collision foot box, not tuned by eye.**
`FOOT_ANCHOR = { field: 0.58, hub: 0.19 }` in `sprite-animation.js`, each the centre of that
surface's box, and the CSS scales it by `--tile` rather than hard-coding pixels. The two surfaces
genuinely differ — the field box sits lower on the body than the hub box — and that is worth
recording rather than unifying, because each was validated against its own maps' collision rects.
`hubPointStyle()` becomes `hubCharacterStyle()` and positions at the collision anchor exactly.

**Leg speed is derived from ground speed.** `walkCycleSeconds(tilesPerSecond)` divides a single
`STRIDE_TILES = 1.1` constant by the character's speed, clamped to 0.24–1.0s. The player's cycle
lands at 0.30s and reads as a run; an NPC's at 0.81s and reads as a walk. That contrast is the
point — a settlement should look like people going about their business while the player crosses it
at pace. The alternative, slowing the player to match, was considered and rejected: responsiveness
is worth more than realism on a 56-tile map.

**NPC movement is time-based and ticks at 33ms.** Field NPCs walk at 1.35 tiles/second, hub staff
at 1.15 (indoors, between furniture), each varied a few percent so a street never falls into step.
The old 80ms/120ms intervals were fine when NPCs barely moved; at real speed they visibly stepped
from position to position beside a player interpolating at 60fps.

**Patrol routes become bounded wander.** A post is now a home anchor and a radius, and
`engine/npc-wander.js` picks a random reachable point in that disc, walks there, pauses 0.6–3.2s,
and about a quarter of the time turns to look somewhere new before moving off again. Seeded per NPC
id, so a character wanders the same way across reloads and the unit tests can assert real behaviour
over a simulated minute rather than smoke-testing one step.

The important property is that **a radius cannot strand anyone.** Every step is gated by the
existing `isFieldNpcBlocked`/`isHubNpcBlocked`, so a radius that overlaps a building costs an NPC
some pacing room instead of putting them inside it. Four hand-placed waypoints had to be individually
correct, and a unit test existed solely to catch the ones that were not.

**NPCs get the player's contact shadow.** They had none — the `<span>` in their markup is the label
pill. Half of "these people are standing on the room rather than in it" was the anchor bug; the
other half was that nothing tied them to the floor. The player's own shadow turned out never to have
been visible either: at 15px wide and centred exactly on the foot line, the sprite covered it
completely. The shared `.cast-shadow` is wider than the silhouette and sits a pixel below the sole,
where it actually reads.

## Deliberately not done

**Per-row depth sorting.** Depth is still two bands — the tiled `overlay` layer above sprites,
everything else below — so a character standing north of a table is drawn in front of it. The
grounding fix addresses the reported symptom; sorting touches every map's render path and the
overlay system, and is worth doing on its own evidence rather than folded into this.

## Consequences

`tests/unit/field-map-coordinates.test.js`'s waypoint assertions changed shape: a post now has to be
standable, and at least 30% of its disc (20% in the hall, which is two narrow aisles) has to be open
floor. That second one is the placement check the old test could not make — four waypoints inside a
0.9-tile box told you nothing about whether the NPC had anywhere to go.

Two e2e assertions were tightened rather than loosened, both aliasing bugs the shorter cycle
exposed. `character-directions.spec.js` sampled the frame offset twice 120ms apart; against a 0.30s
cycle a load-stretched gap of ~301ms lands on the same step of `steps(8)`, so it now counts distinct
frames across a window. `field-movement-dialogue.spec.js` compared the camera for exact equality
while recomputing it from a `toFixed(1)` DOM string — the app rounds from the full float, so the two
can legitimately differ by one pixel; it now allows exactly that and nothing more.
