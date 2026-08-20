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
import {
  CUTSCENES,
  LIAISON_INTRO,
  MERIDIAN_REVEAL,
  MERIDIAN_REVEAL_TRIGGER,
} from "../../apps/web/src/content/cutscenes.js";

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

describe("the shipped scenes", () => {
  it("every authored scene is structurally valid", () => {
    // The cheap half of authoring safety. Both failures validateScene() catches are silent at
    // runtime — an unknown command never fires, and a missing returnControl strands the player in
    // a locked room — so they have to fail here or they fail in front of a student.
    for (const [id, scene] of Object.entries(CUTSCENES)) {
      expect(validateScene(scene), `${id} is malformed`).toEqual([]);
      expect(scene.id, `${id} is filed under the wrong key`).toBe(id);
    }
  });

  it("every authored scene runs to completion and leaves nothing waiting", () => {
    for (const [id, scene] of Object.entries(CUTSCENES)) {
      const effects = spyEffects();
      const state = createScene(scene);
      const ticks = playToEnd(state, effects);
      expect(state.done, `${id} never finished`).toBe(true);
      expect(state.waiting, `${id} ended mid-hold`).toBeNull();
      expect(ticks, `${id} hit the tick ceiling`).toBeLessThan(500);
    }
  });

  it("every authored scene survives being skipped from its first frame", () => {
    // The scene a player skips is the one they see on a replay, and a half-applied scene is a
    // broken room. Same assertion as the watched run: same flags, same final positions.
    for (const [id, scene] of Object.entries(CUTSCENES)) {
      const watched = spyEffects();
      const watchedState = createScene(scene);
      playToEnd(watchedState, watched);

      const skipped = spyEffects();
      const skippedState = createScene(scene);
      stepScene(skippedState, 16, skipped);
      skipScene(skippedState, skipped);

      expect(skipped.flags, `${id} skipped to different flags`).toEqual(watched.flags);
      expect(skipped.positions, `${id} skipped to different positions`).toEqual(watched.positions);
    }
  });

  /** Every line Voss speaks in one scene. */
  const vossLines = (scene) =>
    scene.commands
      .filter((command) => command.op === "say" && command.speaker === "liaison")
      .map((command) => command.line);

  it("Voss says nothing that breaks the reveal floor in any scene below it", () => {
    // THE-FIELD-LIAISON.md §4. field-liaison.test.js already pins this for the NPC tables; a scene
    // is a second place a line can ship from, and it would not have been covered.
    //
    // Scoped by exclusion rather than by an allow-list of scene ids, so an eighth scene authored
    // for Units 7-9 is banned by default and has to be excused deliberately. The reveal is the one
    // exemption, and the test below is what it costs — an exemption nobody checks is a hole.
    for (const [id, scene] of Object.entries(CUTSCENES)) {
      if (id === MERIDIAN_REVEAL.id) continue;
      for (const line of vossLines(scene)) {
        expect(line, `${id} puts Meridian in a Voss line below the reveal`).not.toMatch(
          /meridian|insignia/i
        );
      }
    }
  });

  // The other half of the same rule, and the half a ban cannot express: a reveal that stops
  // revealing fails nothing. Phase 88 moved the floor, and this is where it now sits.
  describe("Scene D, the reveal", () => {
    const lines = vossLines(MERIDIAN_REVEAL);

    it("names Meridian, which no other scene may", () => {
      expect(lines.filter((line) => /Meridian Institute/.test(line)).length).toBeGreaterThan(0);
    });

    it("carries §5 D's two quoted lines verbatim", () => {
      // CUTSCENE-AND-DIALOGUE-CONVENTIONS.md §5 D quotes both in full. They are the scene's whole
      // argument in the author's own words, so a rewrite of either is the one edit here that
      // should have to be deliberate rather than incidental.
      expect(lines).toContain(
        "Chronicle taught us how to enter the past. Then it decided that only Chronicle could be " +
          "trusted with what we found there."
      );
      expect(lines).toContain("I helped people. I also changed lives I never meant to touch.");
    });

    it("turns the coat before the last line rather than on the way out", () => {
      // `sheetFor()` swaps Voss's sprite the moment this flag is set, so where it sits in the list
      // is where the costume changes on screen. At the end it would be a reveal the player never
      // watches happen; the scene is written so they are looking straight at her.
      const flagAt = MERIDIAN_REVEAL.commands.findIndex(
        (command) => command.op === "setFlag" && command.flag === MERIDIAN_REVEAL_TRIGGER.flag
      );
      const says = MERIDIAN_REVEAL.commands.filter((command) => command.op === "say").length;
      const saysAfter = MERIDIAN_REVEAL.commands
        .slice(flagAt)
        .filter((command) => command.op === "say").length;

      expect(flagAt, "the reveal never sets its flag").toBeGreaterThan(-1);
      expect(saysAfter, "the coat turns after Voss has finished talking").toBeGreaterThan(says / 2);
    });

    it("leaves Voss where the other scene leaves her", () => {
      // Same trap LIAISON_INTRO's own comment names: `HUB_TARGETS.liaison` is a fixed coordinate
      // for the marker, the proximity check and the dialogue, so a Voss left standing where the
      // scene put her would be interactable from somewhere she is not. Checked against the other
      // scene rather than against `HUB_TARGETS` so this file stays off main.js — that the two
      // agree is the property, and field-liaison.test.js pins both to the real post.
      const homeOf = (scene) => {
        const walks = scene.commands.filter(
          (command) => command.op === "moveActor" && command.actor === "liaison"
        );
        return walks[walks.length - 1]?.to;
      };

      expect(homeOf(MERIDIAN_REVEAL), "the reveal never moves her at all").toBeTruthy();
      expect(homeOf(MERIDIAN_REVEAL)).toEqual(homeOf(LIAISON_INTRO));
    });
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
