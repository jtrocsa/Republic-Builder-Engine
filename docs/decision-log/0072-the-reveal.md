# 0072 — The reveal

**Phase 88.** Emery Voss tells the player she has been working with the Meridian Institute. It is
the beat `THE-FIELD-LIAISON.md` §4 has been building toward since Phase 78, the last thing Unit 6
was owed, and — as `ARCHITECTURE-QUICKREF.md` §6 put it — a canon decision before it is a task.

This record settles the three questions that entry asked and nothing else. The reveal ladder's
later rungs (Units 7–8's reluctant alliance, Unit 9's alignment) are unchanged and still unwritten,
and `CHRONICLE-CANON.md` §9's deferred list is untouched.

---

## 1. What the player learns, and from whom

From Voss, in her own words, unprompted, once the railhead's three missions are debriefed:

- **The Meridian Institute exists and it came out of Chronicle** — same anchor glass, same table,
  an argument about disclosure that her side lost. `CHRONICLE-CANON.md` §7's shared ancestry, said
  out loud for the first time.
- **The woman in the good coat was theirs.** Unit 6's field line has reported her since Phase 87 as
  a fact Voss could not place; she could place her the whole time.
- **Selected evidence has been going to Meridian for some time, and Voss chose which.** Not instead
  of the Codex — as well as. The distinction matters, because Chronicle's record is never damaged
  by anything she did.
- **Her reason, which is correct.** Chronicle concealed material facts about the Original Drift
  (`CHRONICLE-CANON.md` §5), and she says so. She is not wrong about the thing she is accused over.
- **What it cost, which she raises herself.** "I helped people. I also changed lives I never meant
  to touch." She cannot account for who is holding that appraisal now, and says she has stopped
  assuming.

Both of §5 D's quoted lines are in the scene verbatim and `cutscene.test.js` fails if either is
rewritten. They are the author's own words for the scene's whole argument, and paraphrasing them is
the one edit here that should have to be deliberate.

**Nobody else says anything.** The Director is in the room and does not speak. Voss tells the player
to take it to him if they want, and predicts exactly what he will say — which leaves the
disclosure scene (§5 F) where it belongs, several units away, with its own decision to make.

## 2. Where it lands: Unit 6, in the Institute

`THE-MAP-PROGRAM.md` §5 and `THE-FIELD-LIAISON.md` §4 both put the reveal in **Unit 6**, and both
mean the unit. The operation is at Cottonwood Junction; the conversation is in the Main Hall, on
the visit after the third railhead mission is filed.

That split is the decision, and it was made on the writing rather than on the engineering:

- **What she is confessing to is not something she did on a Kansas street.** It is what she has
  been doing with filed evidence. The room where evidence gets filed is the Institute, the object it
  gets filed on is the Navigation Table, and she says the hardest sentence in the game standing at
  that table with Rowan Hale thirty feet away. On the map it would be a secret told in a field;
  here it is a thing she has decided to stop hiding, in the one place it cannot be walked back.
- **The player has just finished three missions establishing that a lawful procedure produced a
  theft with no thief in it.** Meridian's founding claim — knowing better obliges you to act — lands
  hardest against a case where nobody could act because everyone was following a form.

The engineering agreed, which is worth stating plainly because it would be suspicious if it did
not: the scripted-scene host is the hub's, built on `instituteMovement`, `activeHubNpcRuntime()` and
`activeHubNavGrid()`, and staging this on a field map would have meant a parallel one — with a
second input lock, which is the exact mistake `CUTSCENE-AND-DIALOGUE-CONVENTIONS.md` §4 rule 1
exists to prevent. **Both things being true is the reason this is not a compromise.** Had the scene
been better at the railhead, the right answer would have been to build the field host.

## 3. Cutscene or dialogue change? Both, and neither needed anything new

The quickref asked which. The answer is that the reveal is a scene and the _aftermath_ is dialogue,
and the split falls where you would want it:

| Surface                       | Before                                           | After                                          |
| ----------------------------- | ------------------------------------------------ | ---------------------------------------------- |
| Institute, walking up to Voss | `liaisonLine(trust)`, three bands                | **Scene D**, once — then a fourth line         |
| Cottonwood Junction, her post | the woman in the good coat, reported as a puzzle | `revealedText` — the same story, with the name |
| Units 1–5 field posts         | the trusted helper and the three deniable beats  | **unchanged, deliberately** — see §6           |

Nothing new was added to the command set. `engine/cutscene.js` still has eight commands and no
camera command; Scene D uses six of them and stages itself entirely by moving bodies. It also did
not need an `onDone` — the Entrance Hall's seam is still the only scene that changes host state on
the way out.

**The scene is an interaction, not an arrival.** Nothing fires it. The player walks over to Voss the
way they have walked over to Voss all game, and this time she is wearing something different — which
is §4's "the player finds Voss using Meridian equipment or wearing the insignia", taken literally.
That also fixes the geometry for free: `moveActor` walks to a fixed point, and a scene staged on
arrival would have to guess where the player was standing, because a recall lands them at the
Navigation Table and the chrome button lands them in the foyer.

The cost of an interaction is that it can be walked past, and a beat this size must not be. The
Main Hall's status strip grows one derived span while the reveal is pending — no new save state, and
it stops being true the moment she has said it. It is its own span rather than a replacement for the
status line because the visit it waits on is precisely the visit where a recall has just written
"Field record received" into the notice.

## 4. The coat turns mid-scene

`sheetFor()` is the single place a character key becomes a set of PNGs, so it is the single place
the reveal changes her: `liaison` resolves to `liaison-meridian` once `story.flags.sawMeridianMark`
is set. The hub sprite, both field sprites, the scene painter's per-frame repaint and the portrait
all change together, and nothing else in the game learns she has two costumes. That is exactly the
shape `MERIDIAN-VISUAL-IDENTITY.md` §6 argued for when it chose two sheet keys over a runtime tint.

The flag is set in the **middle** of the scene rather than at the end, so the costume changes on the
next painted frame, in front of the player, on the line where she says it. §4's rule 6 wants the
narrative flag written before control returns; this is well before it, and what that rule protects
against — a reload replaying a scene the player has finished — is already satisfied by the time
they have seen the only part that cannot be un-seen.

The walk is Scene A's walk on purpose. She takes them to the Navigation Table, the same escort to
the same spot with the same highlight she used on their first day, and stands at it to say where
some of what they filed on it has been going. Rhyme rather than repetition.

## 5. How the art was actually made, which is the useful part of this record

`MERIDIAN-VISUAL-IDENTITY.md` §6 held a written prompt for `liaison-meridian` and an instruction:
"design the revealed version first, then cover it up," with a note that this is not literally
executable against a text-to-sprite generator.

**Generating from that prompt produced a different person.** Same size, view, outline, shading,
detail and proportions as the shipped Voss; the result had her hair down, no navy coat, no mark, and
read as a young man in a vest. §6 predicted the failure in exactly those words — "two characters who
happen to share a haircut" — and the fresh-create route cannot avoid it, because the description is
all the model has to hold identity with.

The tool that does the documented thing is **`create_character_state`**, not `create_character`. It
takes the existing character and applies one edit consistently across all eight rotations, so the
face, the bun, the boots and the silhouette are the same pixels and only the coat changes. Colour
was locked to the source palette, which also holds §3's floor on how light Meridian's teal may go.
One call, one edit description naming the four documented deltas, then the ordinary
`walking-8-frames` template and `breathing-idle` — the same animation pipeline every other character
uses.

**So §6's instruction is executable after all, by a route it did not know about.** That is now
recorded in `character-manifest.js` beside the entry, with the abandoned create's id, so nobody
re-runs it.

One build-script change fell out of it. A PixelLab download bundles every _state_ of a character,
and `fetchBulk` took `states[0]`. Both of Voss's manifest entries now name their folder explicitly,
so neither depends on the order the archive happens to list them in — the same reasoning that made
`walkGroup` explicit when characters started carrying two walks.

## 6. Where the test's floor now sits

`field-liaison.test.js` banned `/meridian|insignia/i` from every line Voss had. Phase 88 does not
relax that ban — it completes it:

- **The ban now covers six maps, not five.** Unit 6's _ambient_ field line joined it: the reveal
  lands in that unit but not on that map, and her line out there is still the puzzled one the scene
  is written against.
- **Every scene below the reveal is banned by exclusion, not by an allow-list.** An eighth scene
  authored for Units 7–9 is covered by default and has to be excused deliberately.
- **The reveal is asserted to reveal.** A ban on its own passes a game where the reveal quietly
  stopped revealing, so the scene must name the Institute, carry §5 D's two lines verbatim, and set
  its flag before its last line rather than on the way out.
- **Units 1–5 keep their lines exactly as authored, and there is a test for that too.** Those are
  the reveal ladder's second rung, and §4 is explicit that their design is an innocent reading that
  survives a first pass. Rewriting them the moment the player knows would delete the clue they are
  finally equipped to re-read, which is what replay exists for. Only Unit 6 carries a
  `revealedText`, and `field-liaison.test.js` fails if a second map grows one.

## 7. What it costs on the curriculum side: nothing

Unchanged from `THE-FIELD-LIAISON.md` §5, and worth restating because a beat this size is where the
rule would get quietly renegotiated. The reveal grants no unlock, no badge, no grade, no route, and
no change to any mission, question or rubric. It is one boolean in `progress.story.flags` that
selects which line plays and which PNGs one character draws from. `liaisonTrust` still counts
debriefed missions and still does nothing else.

A player who never talks to Voss again finishes Unit 6 with exactly the same record as one who
watches the scene twice.

## 8. What this phase does not do

- **It does not write Scene C, E, F or G.** They belong to units that do not exist.
- **It does not resolve anything on `CHRONICLE-CANON.md` §9's deferred list** — not Voss's
  biography, not her recruitment, not the Original Drift incident, not her final allegiance. The
  scene is careful to raise the question of who else holds that appraisal and to leave it open.
- **It does not name the Meridian operative.** She stays "the woman in the good coat". Inventing a
  recurring named agent is a content decision with its own consequences and it was not needed here.
- **It does not add a field scripted-scene host.** See §2. When a later unit needs a scene out on a
  map, that is the phase that should build it, against a scene that actually requires it.
- **It does not touch the Codex replay list.** §6 of the conventions document plans a fourth Codex
  section for seen scenes; two authored scenes was not a reason to build it and three is not either.
- **It does not fix Voss's one-tile drift.** `findRoute` snaps a start or goal off an occupied cell,
  and a stationed NPC's own post is occupied, so any scene that walks her home leaves her a tile
  west of `HUB_TARGETS.liaison`. Scene A has done this since Phase 81C. Nothing reads the literal
  for an NPC's proximity — `targetDistance` goes through the runtime body — so it is invisible in
  play, and the fix is a change to routing semantics that wants its own reason.

## 9. Verification

- `tests/unit/cutscene.test.js` — 25 tests. Scene D validates, runs to completion, skips to the
  same world state, names Meridian, carries both quoted lines, sets its flag before the halfway
  point of its `say`s, and leaves Voss where Scene A leaves her.
- `tests/unit/field-liaison.test.js` — 16 tests. The six-map ban, the post-reveal complement, the
  trigger's three fields resolving against real content, the single `revealedText`, and every
  `moveActor` in the scene being routable on the real hub nav grid — a destination she cannot reach is
  not an error at runtime, it is a walk that finishes instantly where it started.
- `tests/e2e/meridian-reveal.spec.js` — 7 tests, new. The gate at three-of-three and its refusal at
  two-of-three, the costume changing mid-scene, skip and watched-to-the-end reaching the same
  teardown, the post-reveal line at the Institute, and the second line plus the mark on the
  railhead.
- `tests/e2e/field-liaison.spec.js` — Cottonwood Junction added to the map roster, which that
  file's own header had claimed since Unit 6's map shipped and had never covered.
- `tests/e2e/dev-warp.spec.js` — the new `?warp=reveal` state, the one warp that also places the
  player, because the scene only opens when you are standing in front of her.
- Looked at in a browser, which is how the costume was actually confirmed: the coat is unmistakably
  different at game scale, and the compass-rose mark reads on the west-facing sprite.
