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
    expect(() => playQuestSfx("taino-context")).not.toThrow();
    expect(() => updateMusicForScreen("island")).not.toThrow();
  });
});
