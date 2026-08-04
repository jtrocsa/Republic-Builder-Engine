// The scripted-scene interpreter.
//
// CUTSCENE-AND-DIALOGUE-CONVENTIONS.md §4 lists six teardown rules, and records that each of them
// has broken at least once in this codebase. Three of those six are properties of the sequencing
// rather than of the DOM, which means they can be pinned here rather than discovered in a browser:
//
//   1. Skip and natural completion run the SAME teardown. Two paths is how a skipped scene leaves
//      the player frozen, so skipping fast-forwards the remaining commands rather than abandoning
//      them — and the world has to end in the same state either way. That is the headline test.
//   2. The narrative flag is written BEFORE control returns, so a reload cannot replay a scene the
//      player has finished.
//   3. Nothing is left waiting. A scene that ends mid-hold is a locked player.
//
// The other three (the input lock, the "Press E" prompt, and cancelling rAF handles) live on the
// main.js side of the line and are covered by the e2e specs.

import { describe, it, expect } from "vitest";

import {
  CUTSCENE_COMMANDS,
  DEFAULT_FADE_MS,
  validateScene,
  createScene,
  stepScene,
  advanceScene,
  skipScene,
} from "../../apps/web/src/engine/cutscene.js";

/** Records every effect the interpreter asks for, and pretends a walk takes three ticks. */
function spyEffects() {
  const calls = [];
  let moveTicks = 0;
  return {
    calls,
    flags: {},
    positions: {},
    moveActor: (c) => {
      moveTicks = 0;
      calls.push(["moveActor", c.actor]);
    },
    snapActor(c) {
      calls.push(["snapActor", c.actor]);
      this.positions[c.actor] = c.to;
    },
    isMoveDone(c) {
      moveTicks += 1;
      if (moveTicks < 3) return false;
      this.positions[c.actor] = c.to;
      return true;
    },
    say: (c, fast) => calls.push(["say", c.line, fast ? "fast" : "typed"]),
    fade: (c) => calls.push(["fade", c.mode]),
    playSound: (c) => calls.push(["playSound", c.cue]),
    turnActor: (c) => calls.push(["turnActor", c.actor, c.facing]),
    highlightObject: (c) => calls.push(["highlightObject", c.target]),
    setFlag(c) {
      calls.push(["setFlag", c.flag]);
      this.flags[c.flag] = c.value ?? true;
    },
    returnControl: () => calls.push(["returnControl"]),
  };
}

const SCENE = {
  id: "scene-a",
  commands: [
    { op: "say", speaker: "liaison", line: "First." },
    { op: "turnActor", actor: "liaison", facing: "down" },
    { op: "say", speaker: "liaison", line: "Second." },
    { op: "moveActor", actor: "liaison", to: { x: 9, y: 4 }, follower: "player" },
    { op: "highlightObject", target: "table" },
    { op: "say", speaker: "liaison", line: "Third." },
    { op: "fade", mode: "doorway", ms: 400 },
    { op: "setFlag", flag: "metLiaison", value: true },
    { op: "returnControl" },
  ],
};

/** Plays a scene the way the host does: tick, and advance whenever it is waiting on the player. */
function playToEnd(state, effects, { maxTicks = 500 } = {}) {
  let ticks = 0;
  while (!state.done && ticks < maxTicks) {
    stepScene(state, 100, effects);
    advanceScene(state);
    ticks += 1;
  }
  return ticks;
}

describe("cutscene command set", () => {
  it("is exactly the eight commands the seven planned scenes justify", () => {
    // §3 fixes this list, and names `focusCamera` as deliberately absent: a scripted beat moves
    // characters, never the screen. Adding one here without a scene needing it is how a command set
    // becomes half dead code, which is the same finding as Phase 71's unreachable `fallback` lines.
    expect(Object.keys(CUTSCENE_COMMANDS).sort()).toEqual([
      "fade",
      "highlightObject",
      "moveActor",
      "playSound",
      "returnControl",
      "say",
      "setFlag",
      "turnActor",
    ]);
    expect(CUTSCENE_COMMANDS).not.toHaveProperty("focusCamera");
  });
});

describe("validateScene", () => {
  it("passes a well-formed scene", () => {
    expect(validateScene(SCENE)).toEqual([]);
  });

  it("rejects a scene that never hands control back", () => {
    const problems = validateScene({
      id: "no-return",
      commands: [{ op: "say", line: "Only this." }],
    });
    expect(problems.join(" ")).toMatch(/last command must be returnControl/);
  });

  it("rejects a second returnControl", () => {
    const problems = validateScene({
      id: "twice",
      commands: [{ op: "returnControl" }, { op: "returnControl" }],
    });
    expect(problems.join(" ")).toMatch(/more than one returnControl/);
  });

  it("rejects an unknown command", () => {
    const problems = validateScene({
      id: "bad-op",
      commands: [{ op: "focusCamera", to: "table" }, { op: "returnControl" }],
    });
    expect(problems.join(" ")).toMatch(/unknown command "focusCamera"/);
  });

  it("rejects commands missing the fields their effect needs", () => {
    const problems = validateScene({
      id: "thin",
      commands: [
        { op: "say" },
        { op: "moveActor", actor: "liaison" },
        { op: "setFlag" },
        { op: "returnControl" },
      ],
    }).join(" ");
    expect(problems).toMatch(/say has no line/);
    expect(problems).toMatch(/moveActor has no target/);
    expect(problems).toMatch(/setFlag has no flag/);
  });
});

describe("stepScene", () => {
  it("does nothing until it is stepped", () => {
    const effects = spyEffects();
    const state = createScene(SCENE);
    expect(state.index).toBe(-1);
    expect(effects.calls).toEqual([]);
  });

  it("holds on a line until the player advances", () => {
    const effects = spyEffects();
    const state = createScene(SCENE);
    stepScene(state, 16, effects);
    expect(state.waiting).toBe("input");
    expect(effects.calls).toEqual([["say", "First.", "typed"]]);

    // Ticking again changes nothing: a line waits for a person, not for time.
    stepScene(state, 5000, effects);
    expect(effects.calls).toHaveLength(1);

    advanceScene(state);
    stepScene(state, 16, effects);
    // turnActor is instant, so the same tick carries straight through it to the next line.
    expect(effects.calls).toEqual([
      ["say", "First.", "typed"],
      ["turnActor", "liaison", "down"],
      ["say", "Second.", "typed"],
    ]);
  });

  it("holds a walk until the host reports it finished, not on a timer", () => {
    const effects = spyEffects();
    const state = createScene(SCENE);
    stepScene(state, 16, effects);
    advanceScene(state);
    stepScene(state, 16, effects);
    advanceScene(state);
    stepScene(state, 16, effects);
    expect(state.waiting).toBe("signal");

    // A long tick does not shorten a walk — the only thing that ends it is the host saying so.
    stepScene(state, 60000, effects);
    expect(state.waiting).toBe("signal");
    stepScene(state, 16, effects);
    expect(state.waiting).toBe("signal");
    stepScene(state, 16, effects); // the fake walk resolves on its third poll
    expect(effects.positions.liaison).toEqual({ x: 9, y: 4 });
  });

  it("holds a fade for its own duration and defaults when it names none", () => {
    const effects = spyEffects();
    const state = createScene({
      id: "fade-only",
      commands: [{ op: "fade", mode: "doorway" }, { op: "returnControl" }],
    });
    stepScene(state, 16, effects);
    expect(state.waiting).toBe("timer");
    stepScene(state, DEFAULT_FADE_MS - 100, effects);
    expect(state.done).toBe(false);
    stepScene(state, 200, effects);
    expect(state.done).toBe(true);
  });

  it("ends on returnControl with nothing left waiting", () => {
    const effects = spyEffects();
    const state = createScene(SCENE);
    playToEnd(state, effects);
    expect(state.done).toBe(true);
    expect(state.waiting).toBeNull();
    expect(effects.calls.at(-1)).toEqual(["returnControl"]);
  });

  it("writes the narrative flag before control returns", () => {
    // §4 rule 6. If these land the other way round, a reload during the last frame of a scene
    // replays a scene the player has already finished.
    const effects = spyEffects();
    const state = createScene(SCENE);
    playToEnd(state, effects);
    const names = effects.calls.map((call) => call[0]);
    expect(names.indexOf("setFlag")).toBeLessThan(names.indexOf("returnControl"));
  });

  it("runs every command exactly once", () => {
    const effects = spyEffects();
    const state = createScene(SCENE);
    playToEnd(state, effects);
    expect(effects.calls.filter((call) => call[0] === "say")).toHaveLength(3);
    expect(effects.calls.filter((call) => call[0] === "returnControl")).toHaveLength(1);
    expect(effects.calls.filter((call) => call[0] === "setFlag")).toHaveLength(1);
  });
});

describe("skipScene", () => {
  it("leaves the world exactly where watching the scene would have left it", () => {
    // The headline property, and the reason skip fast-forwards rather than abandons. A skipped
    // escort still has to put the Director at the door: the next screen is staged around where the
    // scene left everybody, and half a scene's worth of state is a broken room.
    const watched = spyEffects();
    const watchedState = createScene(SCENE);
    playToEnd(watchedState, watched);

    const skipped = spyEffects();
    const skippedState = createScene(SCENE);
    stepScene(skippedState, 16, skipped); // start it, then bail on the first line
    skipScene(skippedState, skipped);

    expect(skippedState.done).toBe(true);
    expect(skippedState.waiting).toBeNull();
    expect(skipped.flags).toEqual(watched.flags);
    expect(skipped.positions).toEqual(watched.positions);
  });

  it("still delivers every line, and marks them as not typed", () => {
    // The host needs to know the scene was seen in full so the Codex replay can list it; what it
    // does with a `fast` line is skip the typewriter, not drop the line.
    const effects = spyEffects();
    const state = createScene(SCENE);
    skipScene(state, effects);
    const lines = effects.calls.filter((call) => call[0] === "say");
    expect(lines).toHaveLength(3);
    expect(lines.every((call) => call[2] === "fast")).toBe(true);
  });

  it("suppresses sound and fades, because those are the parts being skipped", () => {
    const effects = spyEffects();
    const state = createScene({
      id: "noisy",
      commands: [
        { op: "playSound", cue: "door" },
        { op: "fade", mode: "doorway" },
        { op: "setFlag", flag: "seen" },
        { op: "returnControl" },
      ],
    });
    skipScene(state, effects);
    expect(effects.calls.map((call) => call[0])).toEqual(["setFlag", "returnControl"]);
    expect(effects.flags.seen).toBe(true);
  });

  it("is inert once the scene has already finished", () => {
    const effects = spyEffects();
    const state = createScene(SCENE);
    playToEnd(state, effects);
    const before = effects.calls.length;
    skipScene(state, effects);
    expect(effects.calls).toHaveLength(before);
  });
});
