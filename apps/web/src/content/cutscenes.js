// Scripted scenes, as content.
//
// Each entry is a straight line of commands for `engine/cutscene.js`. The engine holds no subject
// facts and no room knowledge — every coordinate, actor id and line lives here, the same split the
// activity engines make with `content/activities/`.
//
// CUTSCENE-AND-DIALOGUE-CONVENTIONS.md §5 names seven scenes, A through G. Two are authored — the
// Entrance Hall orientation, which predates the interpreter and moved onto it in Phase 81G, and
// Scene A. B-G belong to the units where they land (the reveal is Unit 6, per the approved map
// program) and authoring them now would be writing dialogue against maps that do not exist.
//
// ## Two rules that bind everything here
//
// **A scripted beat moves characters, never the screen.** There is no camera command, and the
// camera stays a pure function of player position. Every scene stages itself by walking bodies.
//
// **Voss is under the Units 1-2 reveal floor.** No Meridian, no insignia, no foreknowledge —
// `tests/unit/field-liaison.test.js` fails on the first two. What Voss is allowed to be here is
// candid about the Institute and interested in the people in the record, which is
// THE-FIELD-LIAISON.md §2's brief and not a hint of §4's ladder.

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

/** Every authored scene, by id. The id is what `progress.story.flags` and the Codex replay key on. */
export const CUTSCENES = {
  [DIRECTOR_ORIENTATION.id]: DIRECTOR_ORIENTATION,
  [LIAISON_INTRO.id]: LIAISON_INTRO,
};
