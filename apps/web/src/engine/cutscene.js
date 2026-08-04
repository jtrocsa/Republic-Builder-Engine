// A scripted scene as a list of commands, and a cursor that walks it.
//
// Pure and DOM-free, like escort-walk.js, npc-behaviour.js and geometry.js — this owns the
// sequencing and the caller owns the bodies, the DOM and the typewriter. The properties worth
// testing here are real ones: that a scene ends in the same world state whether it was watched or
// skipped, that every command reached is executed exactly once, and that nothing is left waiting.
//
// ## What this deliberately is not
//
// It is not a dialogue engine and it has no branching. A scene is a straight line. Per
// CUTSCENE-AND-DIALOGUE-CONVENTIONS.md §3, the command set is fixed at the eight commands the
// seven planned scenes actually need, and `focusCamera` is **absent on purpose** — a scripted beat
// moves characters, never the screen, and the camera stays a pure function of player position. If a
// scene cannot be told by moving bodies, that is the moment to discuss adding a command, not before.
//
// The engine also holds no subject facts, the same rule the activity engines follow. A command
// names an actor id and a line of content; it never names a historical fact, a room, or a unit.
//
// ## Why the host supplies the effects
//
// Every command lands somewhere impure — a sprite's transform, a `<div>`'s class, an audio cue, the
// save. Passing an `effects` object in keeps all of that on the caller's side of the line, which is
// what lets this module be unit-tested with a plain object of spies and no browser. It is the same
// split escort-walk.js makes: this file decides *when* the Director starts walking, `main.js`
// decides what walking looks like.

/**
 * The eight commands, and how each one occupies time. This table is the whole state machine.
 *
 * - `instant` — runs and the cursor moves on in the same tick.
 * - `input`   — holds until the player advances. Only `say`, so a line is never missed.
 * - `timer`   — holds for its own `ms`. Only `fade`.
 * - `signal`  — holds until the host reports the motion finished. Only `moveActor`.
 */
export const CUTSCENE_COMMANDS = {
  fade: "timer",
  moveActor: "signal",
  turnActor: "instant",
  say: "input",
  highlightObject: "instant",
  playSound: "instant",
  setFlag: "instant",
  returnControl: "instant",
};

/** Default hold for a `fade` that does not name its own duration. */
export const DEFAULT_FADE_MS = 900;

/**
 * Checks a scene before it can run. Returns a list of human-readable problems; empty means valid.
 *
 * Authoring errors here are silent at runtime — an unknown command would simply never fire, and a
 * scene missing `returnControl` would leave the player locked in a room with nothing happening,
 * which is the single worst failure this system can have. So it is a hard check with a test behind
 * it rather than a comment asking authors to be careful.
 */
export function validateScene(scene) {
  const problems = [];
  if (!scene || typeof scene !== "object") return ["scene is not an object"];
  if (!scene.id) problems.push("scene has no id");
  const commands = Array.isArray(scene.commands) ? scene.commands : null;
  if (!commands) return [...problems, "scene has no commands array"];
  if (!commands.length) problems.push("scene has no commands");

  commands.forEach((command, index) => {
    const at = `${scene.id}[${index}]`;
    if (!command || typeof command !== "object") {
      problems.push(`${at}: not an object`);
      return;
    }
    if (!CUTSCENE_COMMANDS[command.op]) {
      problems.push(`${at}: unknown command "${command.op}"`);
      return;
    }
    if (command.op === "say" && !command.line) problems.push(`${at}: say has no line`);
    if (command.op === "moveActor" && !command.actor)
      problems.push(`${at}: moveActor has no actor`);
    if (command.op === "moveActor" && !command.to) problems.push(`${at}: moveActor has no target`);
    if (command.op === "turnActor" && !command.actor)
      problems.push(`${at}: turnActor has no actor`);
    if (command.op === "setFlag" && !command.flag) problems.push(`${at}: setFlag has no flag`);
  });

  // The teardown rule from §4, made structural. A scene whose last act is not handing control back
  // is a scene that strands the player, and no amount of care at the call site fixes that.
  const last = commands[commands.length - 1];
  if (last && last.op !== "returnControl") {
    problems.push(`${scene.id}: last command must be returnControl, not "${last.op}"`);
  }
  if (commands.filter((command) => command?.op === "returnControl").length > 1) {
    problems.push(`${scene.id}: more than one returnControl`);
  }
  return problems;
}

/** @param {{id: string, commands: object[]}} scene */
export function createScene(scene) {
  return {
    id: scene.id,
    commands: scene.commands,
    // -1 rather than 0: the first command has not been *started* yet, and the difference matters
    // because starting a command is what runs its effect. stepScene() advances into 0 on its first
    // tick, so a scene that is created but never stepped has done nothing.
    index: -1,
    waiting: null,
    elapsed: 0,
    done: false,
    skipped: false,
  };
}

/**
 * Advances the scene. Runs every instant command it passes through in the same tick, so a run of
 * `setFlag`/`turnActor` costs no frames, and stops on the first command that holds.
 *
 * @param {object} state    from createScene(), mutated in place
 * @param {number} dtMs     elapsed since the last call
 * @param {object} effects  one handler per command op, plus `isMoveDone()`
 * @returns {{done: boolean}}
 */
export function stepScene(state, dtMs, effects) {
  if (state.done) return { done: true };

  // Resolve whatever the current command is waiting on before considering the next one.
  if (state.waiting === "timer") {
    state.elapsed += Math.max(0, dtMs);
    if (state.elapsed >= (current(state)?.ms ?? DEFAULT_FADE_MS)) state.waiting = null;
  } else if (state.waiting === "signal") {
    if (effects.isMoveDone?.(current(state))) state.waiting = null;
  }
  if (state.waiting) return { done: false };

  // Not a loop over `commands` — a command can finish and the next one be instant, repeatedly, and
  // this has to run all of them before yielding the frame. Bounded by the command count, so a
  // malformed scene cannot spin.
  while (!state.waiting && !state.done && state.index < state.commands.length - 1) {
    state.index += 1;
    state.elapsed = 0;
    const command = current(state);
    runCommand(command, effects, false);
    const kind = CUTSCENE_COMMANDS[command.op];
    if (kind !== "instant") state.waiting = kind;
    if (command.op === "returnControl") state.done = true;
  }
  return { done: state.done };
}

/**
 * Player input. Releases a `say` and nothing else — a click during a walk or a fade does not skip
 * it, because a scene that jumps whenever the player touches the screen is a scene nobody can read.
 */
export function advanceScene(state) {
  if (state.waiting === "input") state.waiting = null;
}

/**
 * Skip, from anywhere.
 *
 * **This is the same teardown as natural completion, and that is the whole point of it.** §4 records
 * that two teardown paths is exactly how a skipped scene leaves the player frozen, so skipping does
 * not abandon the remaining commands — it *runs* them, in order, in their fast-forward form. A
 * `moveActor` snaps its actor to the destination instead of walking there, a `fade` does not hold,
 * and every `setFlag` still fires. The world ends where the scene would have left it.
 */
export function skipScene(state, effects) {
  if (state.done) return;
  state.skipped = true;
  state.waiting = null;
  while (state.index < state.commands.length - 1) {
    state.index += 1;
    runCommand(current(state), effects, true);
  }
  state.done = true;
}

function current(state) {
  return state.commands[state.index];
}

/**
 * @param {boolean} fast  true when skipping: motion snaps, sound is suppressed, everything that
 *   changes world or save state still runs.
 */
function runCommand(command, effects, fast) {
  switch (command.op) {
    case "moveActor":
      if (fast) effects.snapActor?.(command);
      else effects.moveActor?.(command);
      break;
    case "say":
      // A skipped line is still delivered to the host, which is what lets the Codex replay know the
      // scene was seen in full. The host decides not to type it out.
      effects.say?.(command, fast);
      break;
    case "fade":
      if (!fast) effects.fade?.(command);
      break;
    case "playSound":
      if (!fast) effects.playSound?.(command);
      break;
    case "turnActor":
      effects.turnActor?.(command);
      break;
    case "highlightObject":
      effects.highlightObject?.(command);
      break;
    case "setFlag":
      effects.setFlag?.(command);
      break;
    case "returnControl":
      effects.returnControl?.(command);
      break;
    default:
      break;
  }
}
