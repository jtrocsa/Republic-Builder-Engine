// Scripted scenes, as content.
//
// Each entry is a straight line of commands for `engine/cutscene.js`. The engine holds no subject
// facts and no room knowledge — every coordinate, actor id and line lives here, the same split the
// activity engines make with `content/activities/`.
//
// CUTSCENE-AND-DIALOGUE-CONVENTIONS.md §5 names seven scenes, A through G. Two of them are
// authored — Scene A, and Scene D, the Meridian reveal, shipped in Phase 88 once Unit 6's three
// missions existed to earn it. B, C and E-G belong to the units where they land, and authoring
// them now would be writing dialogue against maps that do not exist.
//
// Two more scenes here are not on that list at all, and both are onboarding: the Entrance Hall
// orientation, which predates the interpreter and moved onto it in Phase 81G, and the Main Hall
// tour, which was four caption panels until Phase 90 and is now a walk. Neither needed a new
// command to say, which is the test §3 sets for anything that wants to be a scene.
//
// ## Two rules that bind everything here
//
// **A scripted beat moves characters, never the screen.** There is no camera command, and the
// camera stays a pure function of player position. Every scene stages itself by walking bodies.
//
// **The reveal ladder is a floor per band, and Scene D is the only place above it.** Voss names
// Meridian in that scene and nowhere earlier: Units 1-2 are the trusted helper and Units 3-5 carry
// the three deniable beats, whose whole design is that an innocent reading stays available on a
// first pass. `tests/unit/field-liaison.test.js` fails if the word reaches any of those five maps,
// and equally if Scene D stops saying it — the ban and the reveal are two halves of one rule.

/** Emery Voss's Main Hall post, from `HUB_TARGETS.liaison`. The scene starts and ends here. */
const LIAISON_POST = { x: 14.5, y: 4.5 };
/**
 * Where Voss comes to meet the player, rather than talking at them from across the room.
 *
 * The north cross-aisle a stride east of where the Director's tour leaves them, so she covers the
 * distance and they end up about a tile apart — conversation range. Deliberately not her post: she
 * used to open Scene A standing on it, which put her five tiles from the player and read as
 * shouting. `findRoute()` snaps this to (12.5, 3.5); it is clear of the Archive Room approach lane
 * at cols 11-12 and seven tiles east of Amani's shelf circuit.
 */
const LIAISON_GREET = { x: 12.6, y: 3.8 };
/**
 * Where Voss stops to show the player the Navigation Table.
 *
 * The south aisle (y 8.06-9.56) directly below the table's rect, which is (17,6)-(20,8). Chosen at
 * the table's east end rather than its west: Professor Park walks a route along the west of that
 * same aisle, and two characters crossing mid-scene reads as a bug even though nothing is broken.
 */
const TABLE_APPROACH = { x: 19.0, y: 9.0 };

/**
 * Scene A — the Field Liaison introduction.
 *
 * §5 A: "Establishes Emery Voss as the practical helper, distinct from the Director's institutional
 * authority. Reinforces the Navigation Table and Field Notebook *without* repeating the tutorial.
 * Competence shown through action, never a biography speech."
 *
 * So Voss does not describe the table — she walks the player to it and points at it, which is the
 * same escort the Director already used to get them out of the Entrance Hall. That reuse is the
 * point: the two characters teach the same way, and the difference the scene is establishing is
 * what each chooses to say once they arrive.
 *
 * The walk back to the post at the end is not decoration. It is what leaves the room in the state
 * every other system expects — `HUB_TARGETS.liaison` is a fixed anchor for the marker, the
 * proximity check and the dialogue, so a Voss left standing at the table would be interactable
 * from a coordinate they are no longer on.
 */
export const LIAISON_INTRO = {
  id: "liaison-intro",
  // Named for the Codex replay list, which lists a scene only once it has been seen.
  title: "Emery Voss",
  summary: "The Field Liaison walks you to the Navigation Table on your first day.",
  commands: [
    // She crosses the room before she says anything. No follower — the player has just been walked
    // around by the Director and this is the beat where somebody comes to them instead.
    { op: "moveActor", actor: "liaison", to: LIAISON_GREET },
    { op: "turnActor", actor: "liaison", facing: "left" },
    { op: "turnActor", actor: "player", facing: "right" },
    {
      op: "say",
      speaker: "liaison",
      line: "You're the new one. Emery Voss — field liaison, which mostly means I reach you before the paperwork does.",
    },
    // Kept through the Phase 90 cut, and it reads better for it: this is the one line that puts the
    // two of them in relation rather than adding to what either has said, which is §5 A's whole
    // brief. Hale's own account is genuinely short now, so "the short one" is a straight
    // description instead of a wink.
    {
      op: "say",
      speaker: "liaison",
      line: "Hale will have given you the Institute's account. It's accurate. It's also the short one.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "Come and look at the table. Quicker than describing it.",
    },
    { op: "moveActor", actor: "liaison", to: TABLE_APPROACH, follower: "player" },
    { op: "turnActor", actor: "liaison", facing: "up" },
    { op: "highlightObject", target: "table" },
    // These three carry the whole of how travel works, and they are the only place it is taught as
    // of Phase 90. The Director's briefing used to explain the table and anchor glass on a screen of
    // its own, and the caption tour explained the table again on the way past it, so the player met
    // canon §2's object-led rule three times before touching anything.
    //
    // Anchor glass and the imprint are named here rather than dropped with that screen: Voss's own
    // Richmond line in Unit 5 uses the term without re-explaining it, per canon §8, so something
    // upstream has to introduce it. Standing at the table is a better place to do that than a
    // briefing slide, which is the argument for the whole rearrangement.
    {
      op: "say",
      speaker: "liaison",
      line: "Every marker on that is something that survived. Anchor glass reads the imprint it kept, and the table opens a passage through it.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "So you don't pick a year. You pick an object, and you arrive where it was.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "Which means you read the provenance before you commit to one. Most of what goes wrong out there starts with a record nobody checked.",
    },
    { op: "highlightObject", target: "table", off: true },
    { op: "turnActor", actor: "liaison", facing: "left" },
    {
      op: "say",
      speaker: "liaison",
      line: "Last thing. If you can't establish something, write down that you couldn't. That's a finding. It is not a failure, whatever the form makes it look like.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "I'll be about. Come and find me when you've filed something.",
    },
    { op: "moveActor", actor: "liaison", to: LIAISON_POST },
    { op: "turnActor", actor: "liaison", facing: "down" },
    { op: "setFlag", flag: "metLiaison", value: true },
    { op: "returnControl" },
  ],
};

/**
 * Where the Director stops, just short of the doors into the Main Hall — `HALLWAY_DOOR_APPROACH`.
 *
 * He stops *at* the approach rather than on the threshold because the scene cuts on his arrival,
 * with the player still a stride behind him. Walking him onto the doors themselves would put a body
 * in the doorway at the exact frame the screen goes black.
 */
const HALLWAY_DOOR_APPROACH = { x: 10.0, y: 2.6 };
/**
 * How long the screen is black before the room swaps under it.
 *
 * The scene owns this number and the host writes it into `--scene-fade-ms`, so `@keyframes
 * doorway-flicker` in global.css has no duration of its own beyond a fallback. It was 900ms and
 * duplicated in the stylesheet; between that hold and the Main Hall's fade-up on the other side,
 * one doorway cost the player nearly a second and a half of black.
 */
const DOORWAY_FLICKER_MS = 420;

/**
 * The Entrance Hall orientation — the player's first minute, and the game's oldest scripted beat.
 *
 * This shipped in Phase 63 welded to the room: a four-phase state machine, its own rAF loop, its own
 * fade timer and its own branch inside the intro typewriter. It says exactly what it always said.
 * What changed in Phase 81G is that it is now a list of commands like every other scene, which is
 * what `CUTSCENE-AND-DIALOGUE-CONVENTIONS.md` §3 asked for and what Phase 81C could not finish.
 *
 * **The blocker was the last beat, and it is not a command.** This scene ends by changing rooms, and
 * no member of the justified eight expresses that — adding a ninth for the one scene that needs it
 * is what §3 forbids. `returnControl` instead hands back to whoever *started* the scene, and the
 * room swap is an `onDone` at the call site in `main.js`. That is the right seam anyway: which room
 * the Institute is in is host state, and a content file has no business naming it.
 *
 * `{{chroniclerName}}` is substituted by the host. It is the one interpolation any scene does, and
 * it is here because the Director greets the player by name in the first line of the game.
 */
export const DIRECTOR_ORIENTATION = {
  id: "director-orientation",
  title: "Director Rowan Hale",
  summary: "The Director meets you in the Entrance Hall and walks you through to the Archive.",
  commands: [
    // Face each other rather than leaving whichever way they were walking.
    { op: "turnActor", actor: "player", facing: "up" },
    { op: "turnActor", actor: "director", facing: "down" },
    // Two beats, down from four. The cut ones were "this hall is the oldest part of the Institute"
    // — atmosphere in the slot before the player has been given anything to do — and a standalone
    // "Walk with me", which is a stage direction the walk itself already gives. The Archive's own
    // description went with them: the tour says it in the next room, standing at the door it is
    // about, which is one place instead of two.
    {
      op: "say",
      speaker: "director",
      line: "{{chroniclerName}}. You found it. Most new Chroniclers stand in the entry a while first.",
    },
    {
      op: "say",
      speaker: "director",
      line: "Through those doors is the Institute Archive. Walk with me.",
    },
    { op: "moveActor", actor: "director", to: HALLWAY_DOOR_APPROACH, follower: "player" },
    { op: "fade", ms: DOORWAY_FLICKER_MS },
    { op: "returnControl" },
  ],
};

/** The Director's post, from `HUB_NPC_BEHAVIOURS.director.at`. The tour starts and ends here. */
const DIRECTOR_POST = { x: 9.6, y: 8.6 };
/**
 * The Preservation Case's aisle, and then the corner, and then the Archive Room door.
 *
 * `findRoute()` snaps these to (4.5, 5.5), (11.5, 5.5) and (11.5, 2.5). Two things decided them:
 *
 * **The trophy stop is a row further south than the plinth's own face.** The obvious cell, (4.5,
 * 4.5), sits on Amani's shelf circuit — the walk passed within 0.2 tiles of her westmost stop, and
 * a scripted escort does not consult collision, so the Director would have gone through her.
 *
 * **The corner is a stop rather than a corner.** Left to itself `findRoute()` cuts the trophy-to-
 * door leg diagonally across the middle of the room and clips Amani's east stop at 0.28. Naming
 * the turn makes it an L — east along row 5.5, then north up column 11.5, which is two tiles clear
 * of her lane at every point and reads as walking the room rather than crossing it.
 *
 * Amani is a `route`, so a scene freezes her at an arbitrary point on that circuit; there is no
 * coordinate that is safe from her by luck. These are safe from all three of her stops.
 */
const TOUR_TROPHY = { x: 4.0, y: 5.2 };
const TOUR_AISLE = { x: 11.5, y: 5.5 };
const TOUR_ARCHIVE_DOOR = { x: 11.5, y: 2.6 };

/**
 * The Main Hall tour — the Director walks the player to the two things in the room that are his.
 *
 * This was four caption panels with the player's movement locked at the foyer spawn: a portrait, a
 * paragraph and a Next button, while a gold highlight pulsed on an object twelve tiles away that
 * nobody approached. It named four things, one of them the Navigation Table, which the opening
 * briefing had already explained and which Voss explains again a minute later standing at it.
 *
 * So it is a scene now, and it names two: the Preservation Case and the Archive Room, both of them
 * Institute business, which is what the Director is for. **The table is not on it** — that belongs
 * to Voss, who teaches it by walking the player to it, and one owner per idea is the whole point of
 * the pass. `highlightObject` drives the same `.is-scene-lit` the old tour's highlight used, so the
 * gold pulse survives; what changed is that the player is standing in front of the object when it
 * lights.
 *
 * He walks home at the end because `kind: "station"` never walks: a Director left at the Archive
 * Room door stays there until a reload snaps him back to his post, and `HUB_TARGETS.director` would
 * be a stale anchor for the marker and the proximity check in the meantime. It is also the right
 * closing image — he goes back to work and leaves the player standing, which is Voss's cue.
 */
export const DIRECTOR_TOUR = {
  id: "director-tour",
  title: "Director Rowan Hale",
  summary: "The Director walks you round the Institute Archive on your first day.",
  commands: [
    { op: "turnActor", actor: "director", facing: "down" },
    { op: "moveActor", actor: "director", to: TOUR_TROPHY, follower: "player" },
    { op: "turnActor", actor: "director", facing: "up" },
    { op: "highlightObject", target: "trophy" },
    {
      op: "say",
      speaker: "director",
      line: "Your Preservation Case. Every investigation you bring back whole earns its place in it.",
    },
    { op: "highlightObject", target: "trophy", off: true },
    // The named turn. Nothing is said on it — it is the L that keeps the walk out of Amani's lane.
    { op: "moveActor", actor: "director", to: TOUR_AISLE, follower: "player" },
    { op: "moveActor", actor: "director", to: TOUR_ARCHIVE_DOOR, follower: "player" },
    { op: "turnActor", actor: "director", facing: "up" },
    { op: "highlightObject", target: "archiveDoor" },
    {
      op: "say",
      speaker: "director",
      line: "And through there, the Archive Room. What you recover gets checked in there, and then it gets kept.",
    },
    { op: "highlightObject", target: "archiveDoor", off: true },
    { op: "moveActor", actor: "director", to: DIRECTOR_POST },
    { op: "turnActor", actor: "director", facing: "down" },
    { op: "setFlag", flag: "sawInstituteTour", value: true },
    { op: "returnControl" },
  ],
};

/**
 * Scene D's trigger, declared here rather than in `main.js`.
 *
 * The engine/content boundary is what decides this: "the reveal lands at the railhead" is an APUSH
 * fact about which unit the story turns on, and `main.js` already carries more case-id literals
 * than it should. The host reads the three fields and knows nothing else — whose interaction opens
 * the scene, which case's missions must be finished first, and which flag closes it.
 *
 * **All of a case's missions, not the case itself.** case-016 has seven records and only three of
 * them are missions; requiring the whole case would put the reveal after four ordinary readings
 * that add nothing to it. The third debrief is the beat — that is the moment the player has all
 * three desks of one transaction and can be told what the fourth desk was doing.
 */
export const MERIDIAN_REVEAL_TRIGGER = {
  target: "liaison",
  afterCase: "case-016",
  flag: "sawMeridianMark",
};

/**
 * Scene D — the Meridian reveal.
 *
 * §5 D: "Voss has been working with Meridian; some early interventions were deliberate. Plain
 * language, no monologue. Betrayal and disagreement carry equal weight." Its two quoted lines are
 * reproduced verbatim below, because they are the scene's whole argument in the author's own words
 * and paraphrasing them would be the one edit nobody could justify.
 *
 * ## Why this is an interaction and not an arrival
 *
 * Nothing fires it. The player walks over to Voss the way they have walked over to Voss all game,
 * and this time she is wearing something different — which is §4's "the player finds Voss using
 * Meridian equipment or wearing the insignia", taken literally. A scene that ambushed them on the
 * stairs would be the same words with the discovery taken out.
 *
 * It also fixes the geometry for free. `moveActor` walks to a fixed point, so a scene staged on
 * arrival would have to guess where the player was standing: the recall lands them at the
 * Navigation Table, the chrome button lands them in the foyer, and Voss would be talking across
 * the room in one of those two cases. An interaction guarantees they are inside her reach.
 *
 * ## Why the Institute and not the railhead
 *
 * The operation is at Cottonwood Junction and the conversation is here, and that is deliberate.
 * What Voss is confessing to is not something she did on a Kansas street — it is what she has been
 * doing with filed evidence, and the room where evidence is filed is this one, with Hale in it. She
 * says the hardest sentence in the game thirty feet from the man it accuses. On the map it would
 * be a secret told in a field; here it is a thing she has decided to stop hiding.
 *
 * The engine agrees, which is worth stating because it would be suspicious if it did not: the
 * scripted-scene host is the hub's, and staging this on a field map would have meant a second one.
 * The scene is better here anyway. Both things being true is the reason it is not a compromise.
 *
 * ## The coat turns mid-scene
 *
 * `setFlag` lands in the middle rather than at the end, and `sheetFor()` resolves `liaison` to
 * `liaison-meridian` the moment it is set — so the costume changes on the next painted frame, in
 * front of the player, on the line where she says it. §4's rule 6 wants the narrative flag written
 * before control returns and this is well before it; what the rule is actually protecting against
 * is a reload replaying a scene the player has finished, and by this point they have not just
 * finished it, they have seen the only part that cannot be un-seen.
 *
 * ## The walk is Scene A's walk, on purpose
 *
 * She takes the player to the Navigation Table, the same escort to the same spot on the same
 * highlight she used on their first day — and stands at it to say where some of what they filed on
 * it has been going. Rhyme rather than repetition: the object she taught them to read provenance at
 * is the object the confession is about, and it costs no new machinery to point at it.
 *
 * The two hardest lines are said facing the table, with her back to the player, before she turns
 * round for the rest. And she walks home alone at the end, leaving them standing where she left
 * them — which is both the right closing image and the thing that keeps `HUB_TARGETS.liaison` an
 * honest anchor for the marker, the proximity check and the ordinary dialogue.
 */
export const MERIDIAN_REVEAL = {
  id: "meridian-reveal",
  title: "The Meridian Institute",
  summary: "Emery Voss answers the question you did not ask her at the railhead.",
  commands: [
    { op: "turnActor", actor: "player", facing: "up" },
    { op: "turnActor", actor: "liaison", facing: "down" },
    {
      op: "say",
      speaker: "liaison",
      line: "Three desks, one transaction. Nobody on that street broke a law and the Kaw still lost the reserve. That is the finding, and it is a hard one to file.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "You asked me about the woman in the good coat. I told you I couldn't decide what she was.",
    },
    { op: "say", speaker: "liaison", line: "That was the only thing I have lied to you about." },
    { op: "playSound", cue: "codex-reveal" },
    { op: "setFlag", flag: "sawMeridianMark", value: true },
    {
      op: "say",
      speaker: "liaison",
      line: "The Meridian Institute. It came out of this building — same glass, same table, an argument about disclosure that our side lost.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "Chronicle taught us how to enter the past. Then it decided that only Chronicle could be trusted with what we found there.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "Come to the table. I would rather show you than argue.",
    },
    { op: "moveActor", actor: "liaison", to: TABLE_APPROACH, follower: "player" },
    { op: "turnActor", actor: "liaison", facing: "up" },
    { op: "highlightObject", target: "table" },
    {
      op: "say",
      speaker: "liaison",
      line: "Some of what we have filed at this table went to them as well. Not instead of the Codex. As well. I chose which.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "I helped people. I also changed lives I never meant to touch.",
    },
    { op: "highlightObject", target: "table", off: true },
    // West, not south. The escort walks in along the row 9 aisle from the west, so the player is
    // left standing on that side of her — the same reason Scene A turns her `left` at this spot.
    { op: "turnActor", actor: "liaison", facing: "left" },
    {
      op: "say",
      speaker: "liaison",
      line: "The figures she gave those headmen were accurate. They were also worth money to somebody, and I have stopped assuming I know who.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "Take it to Hale if you want. He will tell you the Institute has reasons. He will be telling the truth, and he still will not say what they are.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "I am not asking you to agree with me. Keep reading the paperwork. That part I meant every time I said it.",
    },
    // Last words, then the walk — she goes back to her post alone and the player is left standing
    // at the table. Nothing is said over it, which is the point of putting it last.
    { op: "moveActor", actor: "liaison", to: LIAISON_POST },
    { op: "turnActor", actor: "liaison", facing: "down" },
    { op: "returnControl" },
  ],
};

/** Every authored scene, by id. The id is what `progress.story.flags` and the Codex replay key on. */
export const CUTSCENES = {
  [DIRECTOR_ORIENTATION.id]: DIRECTOR_ORIENTATION,
  [DIRECTOR_TOUR.id]: DIRECTOR_TOUR,
  [LIAISON_INTRO.id]: LIAISON_INTRO,
  [MERIDIAN_REVEAL.id]: MERIDIAN_REVEAL,
};
