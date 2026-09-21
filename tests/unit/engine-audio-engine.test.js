// @vitest-environment jsdom
//
// This file needs a DOM. The suite's default is `node` (vitest.config.js) because most of these
// files do not, and standing up jsdom for all of them cost more than the tests took to run.

import { describe, it, expect, beforeEach, vi } from "vitest";

// audio-engine.js reads its `audioEnabled` flag from localStorage once, at module-load
// time (not per-call, unlike chronicle-progress-store.js) — so tests that need a specific
// initial state must reset the module registry and re-import, not just clear localStorage.
// jsdom has no real AudioContext, so this file deliberately only covers the paths that
// never construct one: the enabled/disabled flag itself, the "turn audio off" transition
// (skips ensureAudio), and the early-return guards the sound functions take when disabled.
const STORAGE_KEY = "republic-builder.audio.enabled";

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe("isAudioEnabled", () => {
  it("is false when nothing is persisted (normal case)", async () => {
    const { isAudioEnabled } = await import("../../apps/web/src/engine/audio-engine.js");
    expect(isAudioEnabled()).toBe(false);
  });

  it("reflects a persisted 'true' flag on load (normal case)", async () => {
    localStorage.setItem(STORAGE_KEY, "true");
    const { isAudioEnabled } = await import("../../apps/web/src/engine/audio-engine.js");
    expect(isAudioEnabled()).toBe(true);
  });
});

describe("toggleAudio", () => {
  it("turns audio off, and persists it, without touching AudioContext (normal case)", async () => {
    localStorage.setItem(STORAGE_KEY, "true");
    const { isAudioEnabled, toggleAudio } =
      await import("../../apps/web/src/engine/audio-engine.js");
    expect(isAudioEnabled()).toBe(true);
    expect(() => toggleAudio("quiet")).not.toThrow();
    expect(isAudioEnabled()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("false");
  });
});

describe("stopMusic", () => {
  it("clears an empty timer list without error (boundary case)", async () => {
    const { stopMusic } = await import("../../apps/web/src/engine/audio-engine.js");
    expect(() => stopMusic()).not.toThrow();
  });
});

describe("sound functions while audio is disabled", () => {
  it("no-op instead of throwing (edge case, no AudioContext available in jsdom)", async () => {
    const { audioNote, audioNoise, playSfx, playQuestSfx, updateMusicForScreen } =
      await import("../../apps/web/src/engine/audio-engine.js");
    expect(() => audioNote(440)).not.toThrow();
    expect(() => audioNoise()).not.toThrow();
    expect(() => playSfx("chrono")).not.toThrow();
    expect(() => playSfx("codex-reveal")).not.toThrow();
    expect(() => playQuestSfx("taino-context")).not.toThrow();
    expect(() => updateMusicForScreen("island")).not.toThrow();
  });
});

/**
 * **The single most important thing in Phase 152, and the one nothing else could catch.**
 *
 * Giving each field map its own `musicScene` is the point of that phase — but `scheduleLoop`
 * resolves an unknown scene to `quiet`, a single 261.63 Hz note every six seconds. So the rename on
 * its own would have taken Units 2–8 from the seven-note settlement hymn to near-silence, making
 * seven of the eight maps *worse* on a change whose premise is that nothing regresses for a player
 * with no audio files. No visual baseline can photograph sound, so this is the only guard there is.
 *
 * It asserts the frequencies actually scheduled, not the contents of the `TRACKS` table — reading
 * the table back would only restate it.
 */
describe("with no audio files on disk, every scene still plays the loop it played before", () => {
  const MAP_SCENES = [
    ["island", "island"],
    ["riverbend", "settlement"],
    ["philadelphia", "settlement"],
    ["canal", "settlement"],
    ["richmond", "settlement"],
    ["railhead", "settlement"],
    ["port", "settlement"],
    ["fairmeadow", "settlement"],
  ];

  it.each(MAP_SCENES)("%s plays the %s sequence (normal case)", async (scene, sequenceKey) => {
    localStorage.setItem(STORAGE_KEY, "true");
    const { installFakeAudioContext } = await import("./helpers/fake-audio-context.js");
    const contexts = installFakeAudioContext();
    const { updateMusicForScreen, MUSIC_SEQUENCES, setTrackUrls } =
      await import("../../apps/web/src/engine/audio-engine.js");
    setTrackUrls({});
    updateMusicForScreen(scene);
    const played = contexts[0].oscillators.map((osc) => osc.frequency.value);
    const expected = MUSIC_SEQUENCES[sequenceKey].notes;
    expect(played.slice(0, expected.length)).toEqual(expected);
  });

  it("the eight map scenes are eight distinct keys (regression — they were two)", async () => {
    const { TRACKS } = await import("../../apps/web/src/engine/audio-engine.js");
    const keys = MAP_SCENES.map(([scene]) => scene);
    expect(new Set(keys).size).toBe(8);
    for (const key of keys) expect(TRACKS[key]).toBeDefined();
  });
});

describe("a scene change while a track is still downloading", () => {
  // The generation counter. A load that resolves after the player has walked somewhere else must
  // not start the track they left — which presents as the wrong map's music arriving a second or
  // two after the screen changed.
  it("does not start the stale track when its buffer finally arrives (edge case)", async () => {
    localStorage.setItem(STORAGE_KEY, "true");
    const { installFakeAudioContext } = await import("./helpers/fake-audio-context.js");
    installFakeAudioContext();
    let releaseFetch;
    globalThis.fetch = () =>
      new Promise((resolve) => {
        releaseFetch = () =>
          resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
      });

    const { updateMusicForScreen, setTrackUrls, audioDebugState } =
      await import("../../apps/web/src/engine/audio-engine.js");
    setTrackUrls({ richmond: "/audio/richmond.ogg" });

    updateMusicForScreen("richmond");
    expect(audioDebugState().source).toBe("oscillator");

    // The player leaves before the download lands.
    updateMusicForScreen("island");
    releaseFetch();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const state = audioDebugState();
    expect(state.scene).toBe("island");
    expect(state.file).toBeNull();
  });
});
