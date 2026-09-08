# 0127 — One pixel of daylight

**Phase 128 · 2026-09-07 · Accepted**

`0126` §5 routed one thing out of Phase 127 and refused to absorb it: `richmond-interiors.spec.js`'s
counting room fails on `walkTo` reaching the book-keeper, **2 runs in 8**, on the unmodified tree. It
asked for the failure to be **reproduced under load rather than by luck**.

It was — three times, resting at the identical coordinate every time. The cause is arithmetic, not
weather, and it is not in Richmond.

**Then this phase's own verification run failed somewhere else**, and that second failure is the
other half of the same subject: what a caller is entitled to assume when a walk returns true. §5.

---

## 1. Where the body stops, and why

Richmond's counting room is 18×14. The player enters at (9.0, 11.1); Lemuel Cofer keeps his book at
(3.0, 9.0), six tiles west and two north. `walkTo` floods the room's own collision on the nav probe's
half-tile lattice and walks the corners of the route.

Three failing runs, filmed frame by frame from inside the page, all end the same way:

```
   1342  x=  5.596  y= 11.100      west along the entry row, done
   1720  x=  5.596  y= 10.025      north into the row the plan chose
   1800  x=  5.460  y= 10.025      turning west
   1974  x=  5.277  y= 10.025      and stopping
        final=(5.260, 10.025) — three runs, three times, the same number
```

Nothing is drawn at (5.26, 10.03). What is there is **Nathan Purcell**, stationed at (4.5, 10.6), one
and a quarter tiles away. `npcFootBox()` gives a body a blocking rect running `y + 0.2` to `y + 0.92`,
so his top edge is at **y = 10.80**. `footBoxFor()` gives the player one running `y + 0.40` to
`y + 0.78`, so a player standing on the lattice row **y = 10.0** has their feet ending at **10.78**.

**Two hundredths of a tile. One pixel.** That is the whole clearance of the row the route runs along,
and it is enough — at y = 10.0 the walk goes past him freely:

| the row the body is actually on | foot box ends | past Nathan Purcell?   |
| ------------------------------- | ------------- | ---------------------- |
| y = 9.942                       | 10.722        | walks past freely      |
| y = 10.000 — the plan's row     | 10.780        | walks past freely      |
| y = 10.020                      | 10.800        | walks past freely      |
| **y = 10.021**                  | **10.801**    | **blocked, x = 5.260** |
| y = 10.025 — where it landed    | 10.805        | blocked, x = 5.260     |

Five thousandths of a tile of overlap, and the body stops dead at the coordinate all three runs
recorded. The vertical leg into that row is declared arrived by `ARRIVE_TILES`, which is **0.3** —
fifteen times the clearance the row has. Under load a burst covers less ground than its wall-clock
length asks for (the frame clamp in `runFieldMovementLoop()`, which `0092` measured), so the leg
falls **short** of the row instead of landing on it, and ends at 10.025 rather than 10.000.

---

## 2. The escape hatch was there, and six thousandths of a tile disqualified it

Phase 119 built the cure for exactly this and `0118` §4 describes it: a leg that stops making
progress **squares up on the other axis**, which puts the body back on the row the plan cleared.
Phase 121 raised the burst floor to 150ms for the same family of failure. Both exist for this walk
and this walk beat them.

The gate:

```js
const squareUp = stalls % 2 === 1 && Math.abs(wider ? dy : dx) > PROGRESS_TILES;
```

`PROGRESS_TILES` is **0.03**, and its own comment says what it is for: _"What counts as having got
somewhere with a burst … the noise floor the old movement test already used."_ It answers **did that
burst move the body**. It was then asked a second question — **is the body off the row the route was
drawn along** — and the second question got the first one's answer. The cross-axis offset in Richmond
is **0.025**. The noise floor calls that noise, the escape is refused, and the walker presses the same
blocked key until it runs out of stalls, re-plans from the wedge onto the same route, and burns its
whole replan budget: **12.9 seconds against 2.8 for a walk that works.**

CLAUDE.md already carries the invariant this breaks, written for `codexOrigin`: _when one variable
answers two questions, the second question gets the first one's answer._

The fix is a second constant with its own name and its own argument:

```js
const OFF_ROW_TILES = 1 / 48;
```

**One pixel**, because positions are written in pixels and below one there is no difference for the
game to be asked to act on — under it the body _is_ on the row and whatever is blocking it is not the
offset. The decision came out of the loop into an exported `burstAxis(stalls, dx, dy)`, for the
reason in §4.

---

## 3. Richmond is not a special room — eleven people stand on this edge

The obvious alternative was to move Nathan Purcell nine pixels south and be done. A sweep of the
committed geometry says no.

Reconstructing `isFieldBlocked()` from `main.js`'s own exports and measuring, for **every** cell the
nav probe reports free, how far the player can travel on each axis before the game refuses:

| surfaces                     | free cells | cells with under 0.05 tiles on some axis | of which a person |
| ---------------------------- | ---------- | ---------------------------------------- | ----------------- |
| 8 outdoor maps, 10 interiors | 31,706     | 171                                      | **34**            |
| 3 Institute rooms            | 1,098      | 5                                        | **5**             |

The counting room has exactly **two**, and they are **(4.5, 10.0) and (5.0, 10.0)** — the two cells
the failing route walks — each with 0.019 of a tile of daylight below it.

The thirty-four field ones come from **eleven distinct bodies**, and every single one of them is
posted at a `.6` y-offset:

```
railroad-land-agent @31.8,13.6        taino-child @28.5,17.6
settlement-watch-gate @47,20.6        canal-temperance-reformer @7.5,9.6
canal-boardinghouse-keeper @18.5,9.6  richmond-refugee-woman @10.5,4.6
confederate-private @43.5,4.6         suburb-township-clerk @43.5,9.6
suburb-borough-shopkeeper @31.5,26.6  suburb-mortgage-officer @4.5,4.6
richmond-hired-out-man @4.5,10.6
```

That is not a coincidence and it is not a mistake. A body's blocking edge is `anchor + 0.2` and this
game posts people on `.6` offsets because that is how a sprite is lined up with its own feet, so
**anybody standing at y = k.6 leaves one pixel of daylight on the lattice row at y = k.** Ten of the
eleven stand where a route has somewhere else to go. Nathan Purcell stands in the only aisle to the
book-keeper.

**So the world is not what is wrong here**, and it could not be made right if it were: the counting
room's aisle is one tile tall by design — the clerks' table ends at y = 9 and the waiting chairs begin
at y = 10 — which leaves a player 0.62 of a tile of legal ground, already twice as thin as the
walker's own arrival tolerance. Every one of these rooms is drawn that way. The walker has to be able
to get back onto a row it is off, because it can never be relied on to stay on one.

---

## 4. Proving it, and why a green suite is not the proof

**The reproduction.** Three failures in twenty-four runs at four workers, at the same coordinate every
time. Then the _unfixed_ walker was run **forty-two more times** — eighteen at six workers, twenty-four
at four — and did not fail once.

That is not luck; it is the shape of the defect. The walk wedges only when the leg into the row lands
**short of it by more than 0.02 and less than 0.03**. Too fast and the body reaches the row; too slow
and the offset clears the old gate and the escape fires — which is why six workers, the harsher load,
is _safer_ than four. The window is **0.01 of a tile wide**, and one rendered frame moves the body
about 0.061 at 60fps and further under load. **Nothing a test can do steers into a band a sixth the
size of the smallest step available**, so no amount of load summons it, and thirty green runs of the
fix rule nothing out either.

So the fix is not allowed to rest on the suite. `burstAxis()` is exported and pure, and
`tests/unit/walker-square-up.test.js` asks it both incidents' own measured numbers:

| asked                                            | wants      | why                                   |
| ------------------------------------------------ | ---------- | ------------------------------------- |
| `burstAxis(0, -6.0, -0.025)`                     | horizontal | a leg still moving walks its own axis |
| `burstAxis(1, 0.34, -0.25)`                      | vertical   | Phase 119's quarter tile              |
| `burstAxis(1, -1.26, -0.025)`                    | vertical   | **Phase 128's Richmond offset**       |
| `burstAxis(1, -1.26, -0.02)` and `(1, -1.26, 0)` | horizontal | under a pixel, the body is on the row |
| `burstAxis(0..3, -1.26, -0.25)`                  | h, v, h, v | the parity, asked clear of both gates |

**Watched fail:** with `OFF_ROW_TILES` swapped back for `PROGRESS_TILES`, the Richmond row goes red
— `expected 'horizontal' to be 'vertical'` — and green again on restoring it.

**Watched pass, for what it is worth and no more:** thirty runs of the counting room with the fix,
twelve at four workers and eighteen at six, no failures, and the slowest at 3.8s against the 12.9s a
wedge burns.

---

## 5. And the verification run found the next one: a body that walks away

The full suite came back **380 passed, 1 failed** with retries off — a different spec:
`activity-engines.spec.js`, _"a question is asked, then kept, from inside the dialogue bubble"_, on
`.field-speech-bubble` never appearing after the child on the Caribbean beach is clicked.

It was **not** this phase's change, and the tempting proof — running it eighteen times on the
unmodified tree and watching it pass — proves nothing, for §4's reason. So it was measured. Twelve
runs of that walk, reading the distance between the player and the child at arrival and again at the
press:

| run               | at arrival | at the press | result                                          |
| ----------------- | ---------- | ------------ | ----------------------------------------------- |
| ten of the twelve | 0.33–1.44  | 0.61–1.34    | bubble                                          |
| one               | 1.06       | 0.73         | bubble                                          |
| **one in twelve** | **0.99**   | **1.60**     | **"Move closer to interact with Taíno child."** |

**Every walk was correct.** Each one arrived inside the 1.45-tile reach, several of them comfortably
— and the child then moved between 0.00 and 0.62 of a tile before the press landed, because
`taino-child` is one of the game's **fifteen `kind: "wander"` bodies**, wandering a 1.2-tile disc.
`walkTo` promises exactly one thing — the target was in reach **at the frame the game's own
`.is-near` appeared** — and `field-talk` re-asks `isNearFieldNpc()` at the click, which is correct
of the game: a control the player cannot reach must refuse. CLAUDE.md already says the first half of
this (_"`walkTo` only promises to reach its own target"_, from `0119`); the part that was missing is
that **the promise is an instant and not a state.**

Nothing can be done about a body allowed to walk away except close again, so the walk and the press
become one operation that retries: `openFieldNpc()`. Three call sites take it — every place in the
suite that clicks a wandering body, all three of them this child; a stationed body does not need it
and converting those would be churn.

**Proved by A/B on the retry alone**, both arms walking, waiting the same widened window, and
pressing:

| arm                                      | of 24 runs at four workers                               |
| ---------------------------------------- | -------------------------------------------------------- |
| one attempt — the two lines as they were | **2 failed**, both with the game's own refusal on screen |
| four attempts — the helper               | **0 failed**                                             |

---

## 6. What was not done

- **Nobody was moved.** Eleven people stand on this edge and the `.6` posting is what lines a body up
  with its own feet. §3.
- **No constant was tuned.** `ARRIVE_TILES` stays 0.3, `PROGRESS_TILES` stays 0.03, the burst floor
  stays 150ms. The one change is that the gate stopped borrowing a number that answers a different
  question.
- **The clearance sweep was not committed as a test.** It measures the world and the world is not
  wrong; its numbers are in §3 so nobody re-derives them. There is no floor it could assert — the
  game's own designed aisles are thinner than the walker's tolerance, which is §3's point.
- **`richmond-interiors.spec.js` is untouched.** The walk it asks for was always reasonable and
  the walker was what could not do it. The three lines that did change are `activity-engines`'s, and
  they changed because they were asking a body that walks away to hold still. §5.
- **`walkTo`'s own contract is unchanged.** It still returns the moment `.is-near` fires, which is
  right for a caller that only wants to arrive — `richmond-interiors.spec.js` walks to a door with
  it. What §5 adds is a second helper for the caller that wants to arrive **and act**.

---

## 7. Measured and not chased

- **Three lattice cells in the Main Hall have zero clearance** — (14, 5), (14.5, 5) and (15, 5), all
  flush against the body stationed at (14.5, 4.5). A cell the probe calls free that the player cannot
  leave in one direction is not a bug, but it is this same shape one step further along, and the Main
  Hall is where the tutorial tour walks. The Entrance Hall and the Archive Room have none.
- **The walker still only ever squares up toward the waypoint.** If that direction is into a wall the
  leg has nothing else to try and it will re-plan instead. It did not come up here, and inventing the
  other case without a failure to point at would be tuning against an imagined one.
- **Unit 5's outdoor map has 107 knife-edge cells, far more than any other surface** — six of them a
  person, the rest its retaining wall and its bluff, where a rect edge and the player's foot box meet
  at a hundredth of a tile for long runs. Nothing routes through them today.
