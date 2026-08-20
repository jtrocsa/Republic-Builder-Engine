// Scripted scenes, as content.
//
// Each entry is a straight line of commands for `engine/cutscene.js`. The engine holds no subject
// facts and no room knowledge — every coordinate, actor id and line lives here, the same split the
// activity engines make with `content/activities/`.
//
// CUTSCENE-AND-DIALOGUE-CONVENTIONS.md §5 names seven scenes, A through G. Three are authored —
// the Entrance Hall orientation, which predates the interpreter and moved onto it in Phase 81G;
// Scene A; and Scene D, the Meridian reveal, shipped in Phase 88 once Unit 6's three missions
// existed to earn it. B, C and E-G belong to the units where they land, and authoring them now
// would be writing dialogue against maps that do not exist.
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
    { op: "turnActor", actor: "liaison", facing: "down" },
    {
      op: "say",
      speaker: "liaison",
      line: "You're the new one. Emery Voss — field liaison, which mostly means I reach you before the paperwork does.",
    },
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
    {
      op: "say",
      speaker: "liaison",
      line: "Every marker on that is something that survived. You don't pick a year — you pick an object, and you arrive where it was.",
    },
    {
      op: "say",
      speaker: "liaison",
      line: "So read the provenance before you commit to one. Most of what goes wrong out there starts with a record nobody checked.",
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
/** Matches `@keyframes doorway-flicker` in global.css. The room swap lands under the held frame. */
const DOORWAY_FLICKER_MS = 900;

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
    {
      op: "say",
      speaker: "director",
      line: "{{chroniclerName}}. You found it. Most new Chroniclers stand in the entry a while first.",
    },
    {
      op: "say",
      speaker: "director",
      line: "This hall is the oldest part of the Institute. Every record we have recovered came back through it.",
    },
    {
      op: "say",
      speaker: "director",
      line: "Through those doors is the Institute Archive — where the work gets checked, and where it gets kept.",
    },
    { op: "say", speaker: "director", line: "Walk with me." },
    { op: "moveActor", actor: "director", to: HALLWAY_DOOR_APPROACH, follower: "player" },
    { op: "fade", ms: DOORWAY_FLICKER_MS },
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
  [LIAISON_INTRO.id]: LIAISON_INTRO,
  [MERIDIAN_REVEAL.id]: MERIDIAN_REVEAL,
};
