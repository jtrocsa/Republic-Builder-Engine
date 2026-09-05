# 0111 — The field never adopted the escape hatch

**Phase 112 · 2026-09-05 · Accepted**

Two movement defects, and they turn out to be the same sentence: **the field never took something
the hub already had.** `isHubBlocked()` has excused a body the player is already standing inside
since Phase 64, or the overlap is permanent. `updateInstitutePlayer()` has taken a ground speed since
Phase 63, because a scripted walk moves at 2.2 and not 3.65. Neither crossed over.

Fourth phase of the Beta Readiness program — see
[`BETA-READINESS-LEDGER.md`](../playtest/BETA-READINESS-LEDGER.md). Both fixes were proved by
reverting them and watching the new tests go red.

---

## 1. The escape hatch

`isHubBlocked()` does not test the player's next foot box against the staff directly. It calls the
exported, unit-tested `isBlockedByBody(next, here, bodies)`, whose entire content beyond the obvious
is one clause:

```js
bodies.some((body) => rectsOverlap(next, body) && !rectsOverlap(here, body));
```

A body you are **already** standing inside does not block you. Without that, an overlap has no exit:
every candidate step still overlaps, so every direction is refused, including the direction out.

`isFieldBlocked()` ended in a bare `map.npcs.some(...)`. Two ways to reach the state it could not
leave, and they are different in kind.

### The narrow one is three pixels wide and always there

Three foot boxes are in play on a field map and two of them disagree:

| box                 | used for                   | half-width |
| ------------------- | -------------------------- | ---------- |
| `footBoxFor`        | the player                 | ±0.34      |
| `fieldNpcFootBoxAt` | an NPC checking **itself** | ±0.36      |
| `npcFootBox`        | blocking **the player**    | ±0.42      |

An NPC clears itself of the player at |Δx| ≥ 0.70. The player stays blocked until |Δx| ≥ 0.76. In
that **0.06-tile band — about three pixels at 48px/tile** — the NPC has legally stepped somewhere the
player's own collision calls occupied, and until this phase the player's every direction out was
refused. It reads as snagging on thin air beside somebody standing a clear tile away, and the game
has six routed and wandering NPCs per map creating that band as they walk.

The asymmetry itself is not obviously wrong and is **left alone**: an NPC keeping a slightly wider
berth from the player than it strictly needs is defensible, and narrowing `npcFootBox` to match would
change how close a player can stand to everyone in the game — a feel change riding along inside a bug
fix. The hatch makes the band harmless without deciding that question.

### The wide one is a lock, and the game reaches it on its own

`exitFieldInterior()` restores `progress.fieldReturn` **verbatim**. It does not ask whether anybody
has walked there in the meantime, and a stationed NPC posted near a door is a body that never moves
at all. Same for a save restored onto a map whose cast has since been re-posted. The player is put
down inside somebody, and without the hatch there is no way out except a reload.

That is what `field-movement-dialogue.spec.js` now walks: seed the exit at Canal Crossroads' lock
keeper, step outside on top of him, and assert three things — that the overlap is real (measured off
the two elements' own positions, not from the arithmetic), that the game's own predicate reports the
player's cell clear when asked through the dev nav probe, and that some direction out actually moves
them.

## 2. The walk cycle

`fieldHeldVector()` normalises a diagonal by √½, so a clean diagonal covers `FIELD_SPEED` in total
and the legs are right. When one axis is blocked the loop slides along the other — and keeps only
**one** of the two normalised components, so the body travels at **0.707 × 3.65 = 2.58 tiles/s**
while `updateFieldPlayer()` handed `applyCharacterSprite()` the constant 3.65.

That is exactly the skating the ground-speed invariant exists to prevent — "if something moves a
character at a speed that isn't the usual one, it has to say so" — in the one place on this surface
where the speed is not the usual one and nobody had instrumented it.

The fix takes the hub's shape (`updateFieldPlayer(speed = FIELD_SPEED)`) but **measures rather than
special-cases**: the loop records where the player was, and divides the distance actually travelled
by the frame's own elapsed time. A future path that moves the player some other way is covered by
construction rather than by remembering to add a case. The test reads `--sprite-cycle` off the sprite
and asserts 0.301s walking free against 0.426s sliding, which is `walkCycleSeconds()` on both speeds.

## 3. Left alone deliberately

**Facing is written from raw input, before collision.** Walk into a wall and the body turns to face
it without moving — `moved` stays false, so the walk cycle stops and the sprite stands still facing
the obstacle. That is correct and worth keeping: turning to face a door, an object or a person is how
a player aims an interaction, and every proximity control in the game is reachable because of it. Not
a defect; recorded so the next reader does not spend the session I nearly did deciding.

**The three foot boxes stay three.** See §1.

## 4. A suite symptom that probably belongs to this

The full e2e run after this phase was **293 passed, zero failed, zero flaky** — the first completely
clean run in four phases. The three before it each lost or flaked one or two of the same small set:
`character-directions`'s "X is reachable on foot and talks", and `unit-02-activities`'s "puts the
charter's questions to the people standing on the land".

Every one of those walks the player **up to an NPC**, and `walkTo` breadth-firsts over
`isFieldBlocked` itself. Approaching a body is precisely how you enter the 0.06-tile band in §1: the
walker plans a route, the last leg puts it inside a gap its own predicate now calls blocked, and it
stalls out. That is the documented failure mode of these specs, and it has been read as
load-dependent flakiness since Phase 93 — a reading that was right about the diagnosis being hard and
may have been wrong about the cause.

Recorded as a probable cause and not a claim. One clean run is not proof, the machine-speed story is
real and independently attested, and nothing here was changed with the suite in mind. Worth watching
over the next few phases: if the walker flakes stay gone, this was why.

## 5. What this does not cover

`tests/unit/main-collision.test.js` already tests `isBlockedByBody` directly, and has since Phase 64
— the primitive was never the problem. `isFieldBlocked()` is not exported and should not be: it
reads `activeFieldMap()` and `fieldMovement`, so a unit test of it would be a test of module state.
Both fixes are therefore banked in e2e, and both were verified against the real defect by reverting
them.
