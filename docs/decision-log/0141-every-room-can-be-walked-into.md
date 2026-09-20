# 0141 — Every room can be walked into

**Phase 142 · 2026-09-20 · Accepted**

Ten field interiors, two apiece on Units 4 through 8. Until now the **outdoor** side of eight of
those ten doors was covered by nothing at all, and CLAUDE.md said so in as many words: _"Only
`tests/e2e/suburb-interiors.spec.js` walks to a door from the street; every other interior's
doorstep is still unguarded, so check a new one by hand."_

That manual check is now automated, for all ten. **No defect was found**, which is the result this
phase exists to establish rather than a reason it should not have run.

---

## 1. The hole, and why nothing else filled it

A blocked doorstep makes a room **unenterable** — the hardest player-facing failure this game can
have short of a soft-lock. Three things look like they cover it and none does:

- **`field-map-coordinates.test.js`** flood-fills each interior from its own entry cell. That asks
  whether the inside is connected. It never looks at the outdoor side of the door.
- **The visual baselines** enter a room by setting `currentFieldRoom` directly, so no screenshot in
  the suite has ever crossed a doorstep.
- **`port-interiors.spec.js` and its siblings** deliberately start the player _inside_ the room.
  The reasoning is sound and recorded — crossing the whole Ellis Island wharf to reach a door
  proves nothing the test is about — and it leaves exactly this hole.

Phase 98 fell into it twice on one map: a door row copied by hand from a generator's constants
instead of read off the generated `*_DOORS` export, and a street tree stamped across a door cell.
`suburb-interiors.spec.js` was written for those two and covers Unit 8 only.

## 2. Three questions, in the order a player meets them

`tests/e2e/interior-doorsteps.spec.js`, one test per interior:

1. **Can I get to the door?** `walkTo` breadth-first routes through the map's real collision, so a
   doorstep with no route to it fails the walk outright.
2. **Will `E` give me the door?** Doors sort into `nearestFieldInteraction()`'s nearest-wins list at
   the same **1.45-tile** reach as a person. A body or a record parked beside a doorstep therefore
   does not block the walk — it silently wins the keypress. `__chronicleReach()` returns the game's
   own answer to "what would `E` open right now", so the spec asks the game rather than restating
   its rule, and the failure message names what took it.
3. **Can I get back out?** A room you can enter but not leave is a soft-lock. The exit competes for
   reach the same way, against that room's own cast and records.

All ten pass, in 60 seconds.

## 3. Which arm does the work, measured by trying to break both

**Question 2 is the load-bearing one.** Stationing Emery Voss on the Land office doorstep (Unit 6)
gives:

```text
standing on the Land office doorstep, E would open npc "Emery Voss" at 1.03 tiles
instead of the door.
```

The walk still succeeds and the player still arrives — the keypress just goes to the person. That
is the "half-broken that ships" shape: the door works from some angles and not from the one the
player naturally approaches on. Note that the comment sitting beside that very behaviour table
already records this hazard happening once before, on this same street: _"That is inside the
1.45-tile interaction reach, so the wrong man answered."_

**Question 1 could not be broken, and that is recorded rather than contrived around.** Two attempts
on the Land office:

| perturbation                                        | result       |
| --------------------------------------------------- | ------------ |
| door moved into the middle of its own 2×2 footprint | still passed |
| a body stationed directly on the door cell          | still passed |

Both fail to break it for the same reason: the reach is 1.45 tiles and these doors sit on small
buildings on open streets, so a 2×2 building's centre is within reach of the street, and a body on
the door cell still leaves an approach beside it. The walk assertion is a real check on a route
that does not exist **at all** — it is worth keeping and it is what would catch a doorstep genuinely
walled off — but it is not sensitive, and it is not what makes this file useful. Saying so here
means nobody has to re-derive it by running the same two experiments again.

This also retires a claim by measurement: Phase 98's street tree left the model house door
"reachable only side-on", and the general worry was that a doorstep could be quietly half-covered.
On these ten, at the position the walker lands on, the door wins every time.

## 4. A trap worth writing down

A stationed NPC's position comes from the unit's **`*_NPC_BEHAVIOURS`** table, not from the `x`/`y`
on its entry in the `*_FIELD_NPCS` table. Editing the latter moves nobody — and `__chronicleCast()`
will report the behaviour's coordinate back at you while the source file you just edited says
something else, which reads exactly like a stale dev server and is not one. Half an hour went into
that before the behaviours table turned up.

## 5. Three sweeps that found nothing, recorded so they are not repeated

All three were run before this phase's spec, looking for more of `0139`/`0140`'s shape — something
authored that silently never takes effect.

- **Every `data-action` in the game, against every handler.** A button whose action no handler
  matches does nothing when pressed: `handleAppClick` preventDefaults, blurs, walks
  `CLICK_HANDLER_GROUPS`, finds no taker and returns. **140 distinct actions emitted, 156 handled,
  and not one emitted action is unhandled.** The sixteen handled-but-not-literally-emitted names all
  resolve through the five interpolated emission sites — the generic `btn()` helper, the main-menu
  table, the auth-tab table, the preview-action helper and the field source signal — every one
  checked by hand.
- **Every element rendered with a `hidden` attribute.** The attribute is only a UA-stylesheet
  `display: none`, and an author rule at _any_ specificity beats a UA rule, so a `display`
  declaration on the element's class defeats it silently. **Seven such elements, and all seven
  already carry an explicit `[hidden]` rule.**

A third sweep — every `var(--x)` in `global.css` against every declaration, in CSS and in JS —
found **no bare undefined custom property**. One curiosity: `--ink-soft` is used once, always with a
fallback, and is declared nowhere, so the fallback is what has always applied. Not a defect, left
alone, noted here.

---

## Verification

`npm run check` clean — 2,397 unit tests across 81 files, ESLint 0 errors and the same 5
pre-existing warnings, cspell, `validate:content` at 169 groups. `npm run build` clean. The 10 new
e2e tests pass in 60s. No `apps/web/src` change in this phase, so no baseline can have moved and
none did.
