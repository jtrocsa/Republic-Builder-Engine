// @vitest-environment jsdom
//
// The bus graph `audio-engine.js` grew in Phase 152, asserted as arithmetic rather than as shape.
//
// Before that phase everything in the game ran through one gain node at 0.045. Splitting it into a
// music bus and an SFX bus is what lets an effect duck the music and lets a player set two levels —
// but it is also four multiplications where there was one, and "the game got quieter" is exactly
// the kind of regression no visual baseline can photograph. So the first test here is an identity:
// at default volumes, a synthesised note's total gain to the destination is still exactly 0.045.

import { describe, it, expect, beforeEach, vi } from "vitest";
import { installFakeAudioContext, gainToDestination } from "./helpers/fake-audio-context.js";

const ENABLED_KEY = "republic-builder.audio.enabled";
const VOLUME_KEY = "republic-builder.audio.volume";

let contexts;

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(ENABLED_KEY, "true");
  vi.resetModules();
  contexts = installFakeAudioContext();
});

async function loadEngine() {
  return import("../../apps/web/src/engine/audio-engine.js");
}

describe("the bus graph preserves the old single master gain", () => {
  it("routes a synthesised note to the destination at exactly 0.045 (the pre-split master)", async () => {
    const { audioNote } = await loadEngine();
    audioNote(440);
    const ctx = contexts[0];
    // The note builds its own envelope gain and connects it to the SFX oscillator bus. Walk from
    // that envelope node, with its own envelope factored out, to the destination.
    const envelope = ctx.gains[ctx.gains.length - 1];
    const busPath = gainToDestination(envelope, ctx) / envelope.gain.value;
    expect(busPath).toBeCloseTo(0.045, 10);
  });

  it("routes the music loop's notes to the destination at the same 0.045 (normal case)", async () => {
    const { updateMusicForScreen } = await loadEngine();
    updateMusicForScreen("richmond");
    const ctx = contexts[0];
    const envelope = ctx.gains[ctx.gains.length - 1];
    const busPath = gainToDestination(envelope, ctx) / envelope.gain.value;
    expect(busPath).toBeCloseTo(0.045, 10);
  });

  it("halving the music volume halves the music path and leaves the SFX path alone (normal case)", async () => {
    const { updateMusicForScreen, audioNote, setMusicVolume } = await loadEngine();
    updateMusicForScreen("richmond");
    const ctx = contexts[0];
    const musicEnvelope = ctx.gains[ctx.gains.length - 1];
    setMusicVolume(0.5);
    expect(gainToDestination(musicEnvelope, ctx) / musicEnvelope.gain.value).toBeCloseTo(
      0.0225,
      10
    );
    audioNote(440);
    const sfxEnvelope = ctx.gains[ctx.gains.length - 1];
    expect(gainToDestination(sfxEnvelope, ctx) / sfxEnvelope.gain.value).toBeCloseTo(0.045, 10);
  });
});

describe("ducking", () => {
  // The two nodes exist so that a slider drag during a duck cannot fight the duck's ramp. If they
  // were one param with two writers, one write would win silently and the music would either never
  // come back up or come back to the wrong level.
  it("writes the duck node and never the volume node (normal case)", async () => {
    const { updateMusicForScreen, playSfx, setMusicVolume } = await loadEngine();
    updateMusicForScreen("richmond");
    const ctx = contexts[0];
    // Pick the music volume node out of the graph by making its level unique — the SFX volume node
    // sits at the same default 0.1 — and hold the reference before the cue fires, so that a duck
    // wrongly pointed at it is still caught after its ramp has settled the value to 1.
    setMusicVolume(0.5);
    const musicVolumeNode = ctx.gains.find((g) => g.gain.value === 0.05);
    expect(musicVolumeNode).toBeDefined();

    playSfx("chrono");

    // Two-sided on purpose: something must duck, and it must not be this node. Asserting only
    // "exactly one node carries a linear ramp" would pass just as happily with the duck pointed at
    // the volume node, which is the bug the two-node split exists to rule out.
    expect(musicVolumeNode.gain.automation.filter((step) => step.kind === "linear")).toHaveLength(
      0
    );
    const linearWriters = ctx.gains.filter((g) =>
      g.gain.automation.some((step) => step.kind === "linear")
    );
    expect(linearWriters).toHaveLength(1);
    expect(linearWriters[0]).not.toBe(musicVolumeNode);
  });

  it("leaves the music untouched for the cues that fire on every press (boundary case)", async () => {
    const { updateMusicForScreen, playSfx } = await loadEngine();
    updateMusicForScreen("richmond");
    const ctx = contexts[0];
    for (const cue of ["secure", "flat", "dialogue", "toggle"]) playSfx(cue);
    const linearWriters = ctx.gains.filter((g) =>
      g.gain.automation.some((step) => step.kind === "linear")
    );
    expect(linearWriters).toHaveLength(0);
  });

  it("settles back to full music after the duck releases (normal case)", async () => {
    const { updateMusicForScreen, playSfx } = await loadEngine();
    updateMusicForScreen("richmond");
    const ctx = contexts[0];
    playSfx("chrono");
    const ducked = ctx.gains.find((g) => g.gain.automation.some((step) => step.kind === "linear"));
    // The fake settles a ramp to its target, so the last scheduled value is the resting one.
    expect(ducked.gain.value).toBe(1);
    const dip = ducked.gain.automation.find((step) => step.kind === "linear");
    expect(dip.value).toBeLessThan(1);
  });
});

describe("volume persistence", () => {
  it("clamps out-of-range values and stores both levels (edge case)", async () => {
    const { setMusicVolume, setSfxVolume, getVolumes } = await loadEngine();
    expect(setMusicVolume(-2)).toBe(0);
    expect(setSfxVolume(7)).toBe(1);
    expect(getVolumes()).toEqual({ music: 0, sfx: 1 });
    expect(JSON.parse(localStorage.getItem(VOLUME_KEY))).toEqual({ music: 0, sfx: 1 });
  });

  it("reads a malformed stored value as full volume rather than throwing (edge case)", async () => {
    localStorage.setItem(VOLUME_KEY, "{not json");
    const { getVolumes } = await loadEngine();
    expect(getVolumes()).toEqual({ music: 1, sfx: 1 });
  });

  it("restores persisted levels on load (normal case)", async () => {
    localStorage.setItem(VOLUME_KEY, JSON.stringify({ music: 0.3, sfx: 0.9 }));
    const { getVolumes } = await loadEngine();
    expect(getVolumes()).toEqual({ music: 0.3, sfx: 0.9 });
  });

  it("does not touch the enabled key, which is read as a bare string (regression)", async () => {
    // Widening `…audio.enabled` into a JSON blob would silently reset every existing browser,
    // because it is compared with === "true".
    const { setMusicVolume } = await loadEngine();
    setMusicVolume(0.5);
    expect(localStorage.getItem(ENABLED_KEY)).toBe("true");
  });
});
