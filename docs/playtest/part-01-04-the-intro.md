# Parts 1–4 — the intro

Cold boot, the Director and identity, the Entrance Hall, and the Main Hall tour. **Closed
2026-08-22.** Decisions in [`0078`](../decision-log/0078-the-intro-stops-repeating-itself.md).

**Four parts in one file, deliberately.** The protocol runs a part at a time so the owner pass stays
under fifteen minutes, and the walk order exists because each part's script starts from the previous
part's exit state. Here the owner pass arrived first and unprompted, covering all four rows at once —
and every one of its six reports turned out to be about a _seam between_ two of the parts rather than
about anything inside one. Splitting them four ways would have filed "the screen jumps when the
Director starts talking" under Part 3 and its cause under Part 4. Merging is the exception, not a new
default; parts 5 onward run one at a time.

Step 3 ran before steps 1 and 2 for the same reason. The static audit below was written _after_ the
owner report, to find the causes of things already named, which is the inverse of the usual order and
worth noting so the protocol is not quietly rewritten by precedent.

---

## Findings

`O` = from the owner pass. `A` = from the static audit that followed it.

| №   | Src | Sev | Cat       | Finding                                                                                                                                                                                                                                                                                                                                                                                                         | Outcome                                                                                                                                             |
| --- | --- | --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | O   | S2  | `unclear` | The Director speaks **16 beats** before the player controls anything, and the object-led travel rule is taught **three times** — briefing 03, the tour's table caption, and Voss's Scene A — in near-identical words.                                                                                                                                                                                           | Fixed. Briefing 4→2 screens, Entrance Hall 4→2 beats, tour 4→2. Director 16→8. Each idea has one owner.                                             |
| 2   | O   | S2  | `rough`   | The Director-talking screen reads as unfinished — the owner's words were "too much going on and yet feels like a rough draft", wanting better assets, cutscene look and text spacing. Six decorative layers: a ledger scrim, three blurred pillars, a rotating seal, four corner brackets, three fake readouts including a clock counting nothing, and a layer dropping Cinzel phrases at **random positions**. | Fixed in Phase 90B (`0079`). The painted `INSTITUTE_PLATE` replaces the diorama; the phrase layer, seal, readouts and clock are gone.               |
| 3   | O   | S1  | `broken`  | "The screen jumps, and the player 'jumps' to the director."                                                                                                                                                                                                                                                                                                                                                     | Fixed — two causes, both below (7, 8).                                                                                                              |
| 4   | O   | S2  | `rough`   | "Get rid of the double black screen." One doorway, ~885ms of black across two independent overlays with a DOM swap in the middle.                                                                                                                                                                                                                                                                               | Fixed. One cut at 420ms, one fade-up at 320ms.                                                                                                      |
| 5   | O   | S3  | `rough`   | Doorways should read as dynamic entrances, Pokémon-style, with light spilling out.                                                                                                                                                                                                                                                                                                                              | Fixed in Phase 90B (`0079`). Ten doors lit — the six interiors and the Institute's three — deliberately not all 155 door cells.                     |
| 6   | O   | S2  | `unclear` | "Emery Voss is talking to us from across the room", and neither she nor the Director ever leads the player anywhere.                                                                                                                                                                                                                                                                                            | Fixed. Both walk; she crosses before her first line.                                                                                                |
| 7   | A   | S1  | `broken`  | `createEscortWalk()` seeded its trail from the **leader's** position, so the follower's own start was never on it — the first engaged frame assigned the player a point on the Director's path outright, up to a tile sideways. The hub camera is a pure function of player position, so it cut with them.                                                                                                      | Fixed. A lead-in crumb at negative arc length, plus a per-tick speed clamp.                                                                         |
| 8   | A   | S2  | `broken`  | `.hub-world { transition: transform 92ms linear }` — the camera is rewritten every frame, so the tween only restarted, and it turned `render()`'s one-frame camera reset into a visible **281px slide**. `startHubScene()` renders, which is why the room lurched exactly when a scene began.                                                                                                                   | Fixed by deletion. `.hub-player` had the same tween removed in an earlier phase; the world was missed.                                              |
| 9   | A   | S2  | `broken`  | The 30Hz NPC interval ran straight through every scene, fighting the scene's own 60Hz paint: it forced `walking = false` while the scene set it true, and passed the default `HUB_SPEED` where the scene passed `SCENE_WALK_SPEED`, flipping the player's `--sprite-cycle` between 0.301s and 0.5s ~30×/s. This is "their walking feels off".                                                                   | Fixed. The tick stands down while a scene owns the hub.                                                                                             |
| 10  | A   | S2  | `broken`  | `stepEscort()` closed the follower's last `gap` on arrival, so both bodies finished on one point — invisible in the Entrance Hall because the screen is already black, very visible at a lit tour stop.                                                                                                                                                                                                         | Fixed. A follower ends a gap behind; `done` moved with it.                                                                                          |
| 11  | A   | S2  | `broken`  | `snapActor()` moved only the actor a command named, so **a skipped escort stranded the follower**; and it read the stale `hubScene.followsPlayer`, which skip never updates because skip never runs `moveActor`. Latent until a second scene used a follower.                                                                                                                                                   | Fixed. Both. Skip and watch now leave the player in the same place — which moved a `meridian-reveal` assertion that had been passing on the defect. |
| 12  | A   | S3  | `hollow`  | `?warp=intro` had **zero** test coverage — the one dev warp no spec named, and the entry point this programme's own play scripts open on.                                                                                                                                                                                                                                                                       | Fixed. `tests/e2e/intro-sequence.spec.js`.                                                                                                          |

Two more, noted and not filed as findings because neither is a defect: the fade duration was written
in three places and the host read none of them (now `--scene-fade-ms`, from the scene's own `ms`);
and `CLAUDE.md` still named `HALLWAY_ESCORT_SPEED`, deleted in Phase 81G.

## The near-miss worth recording

Deleting briefing screen 03 nearly orphaned **anchor glass**. Voss's Richmond line in Unit 5 uses the
term without re-explaining it — deliberately, per canon §8 — so that screen was its only
introduction. It was caught by grepping before the delete, and the term moved into her table lines
rather than out of the game.

**Before deleting an intro screen, grep for what it is the only introduction of.** Nothing in the
suite would have caught this: `chronicle-canon.test.js` bans phrasings, it does not check that a term
survives its first use.

## Play script

Twelve steps, opening on `?warp=intro`. Steps 1–4 are the briefing, 5–8 the Entrance Hall, 9–12 the
Main Hall. Now banked as `tests/e2e/intro-sequence.spec.js`, so this is the manual form kept for the
owner rather than the machine.

1. `?warp=intro` → the Director's briefing, screen **01 / 02**. _No title sequence._
2. Click through screen 01 → two lines, then **02 / 02**. _Two briefing screens exist, not four._
3. Click to the end → the identity registry. _The protocol cards fit without scrolling._
4. Name and appearance → **Accept field protocol** → the Entrance Hall.
5. Walk to Director Hale, press E. _Two beats, not four._
6. Release the last beat. _He sets off; you fall in behind him. **Nothing snaps.**_
7. Watch the doorway. _One cut to black, held, then the Main Hall fades up. **One blackout.**_
8. The tour begins on its own. _The bar is empty-but-hidden while he walks._
9. He stops at the Preservation Case. _You are beside him, **not inside him**. The case is lit._
10. Release the beat → he walks you east and north to the Archive Room door. _The door lights._
11. He walks home alone. _Emery Voss crosses the room to you before she says anything._
12. She walks you to the Navigation Table. _She explains it. **Nobody has explained it before.**_

## Routed onward

- **→ Phase 90B**: findings 2 and 5, the two art items. **Both closed the same day** — see
  [`0079`](../decision-log/0079-the-intro-stops-looking-unfinished.md). Nothing from these four
  parts is still open.
- **→ Part 5**: nothing. The tour now leaves the player at the Archive Room door and Voss leaves them
  at the Navigation Table, which is where Part 5's script already starts.
