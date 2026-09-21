// Audio in a real browser — Phase 152.
//
// **Why this file has to exist at all: audio leaves no pixels.** The change this phase makes is
// that eight field maps which shared two synthesised loops now have eight scenes of their own, and
// not one of the 61 committed visual baselines can photograph that. Without a spec, the whole thing
// is unobservable from outside the unit tests.
//
// **No autoplay flag, and that is deliberate.** `audioEnabled` defaults to `false`, so the game
// constructs no AudioContext until the player presses ♫ — which *is* a user gesture, so the context
// starts `running` legitimately. Nothing here needs `--autoplay-policy=no-user-gesture-required`,
// and so nothing here overrides `launchOptions` and re-launches a second browser for the other 400+
// tests to queue behind. If a later phase ever defaults audio on, that flag belongs in a
// file-scoped `test.use` here, never in the shared `playwright.config.js`.
//
// Every assertion reads `window.__chronicleAudio()`, the fourth DEV probe, which reports the
// engine's own answer rather than recomputing it (`0093`).

import { test, expect } from "@playwright/test";
import {
  seedProgress,
  openSeededSave,
  loadSeededSave,
  reloadIntoSave,
  readProgress,
  walkTo,
} from "./helpers/progress-seed.js";

const FIELD_CASES = [
  ["unit-01 Caribbean", "case-001", "island"],
  ["unit-02 Riverbend", "case-004", "riverbend"],
  ["unit-03 Philadelphia", "case-007", "philadelphia"],
  ["unit-04 Canal Crossroads", "case-010", "canal"],
  ["unit-05 Richmond", "case-013", "richmond"],
  ["unit-06 Railhead", "case-016", "railhead"],
  ["unit-07 Ellis Island", "case-019", "port"],
  ["unit-08 Fairmeadow", "case-022", "fairmeadow"],
];

const seedFor = (caseId, extra = {}) => ({
  currentScreen: "field",
  activeCaseId: caseId,
  selectedCaseId: caseId,
  unlocked: ["case-001", caseId],
  tutorial: { step: "complete", completed: true, skipped: false },
  ...extra,
});

const audioState = (page) => page.evaluate(() => window.__chronicleAudio());

// Idempotent on purpose. `audioEnabled` persists to localStorage, so it survives the `goto()`
// inside `openSeededSave()` — a blind click on the second iteration of a loop would turn it back
// *off*, and every assertion after that would be about a silent game.
async function turnAudioOn(page) {
  if (!(await audioState(page)).enabled) await page.click('[data-action="toggle-audio"]');
  await expect.poll(async () => (await audioState(page)).enabled).toBe(true);
}

test.describe("audio", () => {
  test("a real click starts the audio context", async ({ page }) => {
    await seedProgress(page, seedFor("case-001"));
    await loadSeededSave(page);

    const before = await audioState(page);
    expect(before.enabled).toBe(false);
    expect(before.contextState).toBe("none");

    await turnAudioOn(page);
    // Polled rather than waited on: `resume()` is async and how long it takes is a property of the
    // machine, which is exactly what a verdict must not depend on (`0118`).
    await expect.poll(async () => (await audioState(page)).contextState).toBe("running");
  });

  // The phase's thesis, stated as a test. Before this, seven of these eight read `settlement`.
  test("each of the eight maps plays its own scene", async ({ page }) => {
    test.setTimeout(120_000);
    await seedProgress(page, seedFor("case-001"));
    await loadSeededSave(page);
    await turnAudioOn(page);

    const seen = new Map();
    for (const [label, caseId, expectedScene] of FIELD_CASES) {
      // `openSeededSave`, never `seedProgress`, inside a loop — the latter writes only when the key
      // is still empty, so seven of these eight iterations would silently re-measure Unit 1 and
      // pass. Decision log `0126`.
      await openSeededSave(page, seedFor(caseId));
      await turnAudioOn(page);
      await expect
        .poll(async () => (await audioState(page)).scene, { timeout: 10_000 })
        .toBe(expectedScene);
      seen.set(label, expectedScene);
    }
    expect(new Set(seen.values()).size).toBe(8);
  });

  // The promise the whole phase is built on: with `assets/audio/` empty, every scene still sounds
  // exactly as it did before. If this ever goes red on a machine with no audio files, the fallback
  // table has lost an entry and a map has gone near-silent.
  test("with no audio files committed, the synthesised loop is what plays", async ({ page }) => {
    await seedProgress(page, seedFor("case-013"));
    await loadSeededSave(page);
    await turnAudioOn(page);

    await expect.poll(async () => (await audioState(page)).scene).toBe("richmond");
    const state = await audioState(page);
    expect(state.source).toBe("oscillator");
    expect(state.loop).toBe("settlement");
    expect(state.file).toBeNull();
    expect(state.knownFiles).toEqual([]);
  });

  // `sceneForMusic()` reads the *outdoor* map even while the player is in one of its rooms, so a
  // doorway must not restart the score. The scene name alone would not prove that — it would still
  // match if the track had been torn down and rebuilt — so this reads the generation counter and
  // the voice's own start time, both of which move on a real change and neither of which should.
  test("walking through a door does not restart the track", async ({ page }) => {
    test.setTimeout(120_000);
    await seedProgress(page, seedFor("case-010"));
    await loadSeededSave(page);
    await turnAudioOn(page);

    await expect.poll(async () => (await audioState(page)).scene).toBe("canal");
    const outside = await audioState(page);
    // Not vacuous: something has already changed the scene at least once to get here, so the
    // generation counter is live and an unchanged reading below is a real observation.
    expect(outside.generation).toBeGreaterThan(0);

    // The real door, crossed the way `interior-doorsteps.spec.js` crosses one — walk the map's own
    // collision to the doorstep and press E — rather than by seeding `currentFieldRoom`, which
    // would reload the page and reset the very counter this test reads.
    expect(
      await walkTo(page, '.field-door[data-interior="canal-print-shop"]', "caseFieldPlayer")
    ).toBe(true);
    await page.keyboard.press("e");
    await expect
      .poll(async () => (await readProgress(page)).currentFieldRoom ?? null, { timeout: 10_000 })
      .toBe("canal-print-shop");

    const inside = await audioState(page);
    expect(inside.scene).toBe("canal");
    expect(inside.generation).toBe(outside.generation);
    expect(inside.startedAt).toBe(outside.startedAt);
  });

  // Proves the file branch with nothing committed: a 0.2s silent WAV built in the page, handed to
  // the loader as a `data:` URL. It works because the loader decodes **bytes** and never looks at
  // an extension — which is the same property that makes a real `.ogg` a drop-in.
  test("a file plays when there is one, and falls back when the file is broken", async ({
    page,
  }) => {
    await seedProgress(page, seedFor("case-013"));
    await loadSeededSave(page);
    await turnAudioOn(page);
    await expect.poll(async () => (await audioState(page)).scene).toBe("richmond");

    const wavUrl = await page.evaluate(() => {
      const sampleRate = 8000;
      const frames = sampleRate * 0.2;
      const bytes = new Uint8Array(44 + frames * 2);
      const view = new DataView(bytes.buffer);
      const ascii = (offset, text) => {
        for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
      };
      ascii(0, "RIFF");
      view.setUint32(4, 36 + frames * 2, true);
      ascii(8, "WAVE");
      ascii(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      ascii(36, "data");
      view.setUint32(40, frames * 2, true);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      return `data:audio/wav;base64,${window.btoa(binary)}`;
    });

    await page.evaluate((url) => window.__chronicleAudio.useTrackUrls({ richmond: url }), wavUrl);
    // Off and on again, so the engine leaves the scene and re-enters it, looking the file up.
    await page.click('[data-action="toggle-audio"]');
    await page.click('[data-action="toggle-audio"]');
    await expect
      .poll(async () => (await audioState(page)).source, { timeout: 10_000 })
      .toBe("file");
    expect((await audioState(page)).file).toBe("richmond");

    // Now point the same key at something that is not there. The scene must go back to synthesis
    // rather than to silence, and it must not throw.
    await page.evaluate(() =>
      window.__chronicleAudio.useTrackUrls({ richmond: "/no-such-file.ogg" })
    );
    await page.click('[data-action="toggle-audio"]');
    await page.click('[data-action="toggle-audio"]');
    await expect
      .poll(async () => (await audioState(page)).source, { timeout: 10_000 })
      .toBe("oscillator");
    const fallen = await audioState(page);
    expect(fallen.loop).toBe("settlement");
    expect(fallen.cache.absent).toContain("richmond");
  });

  test("the volume sliders persist, and survive being dragged", async ({ page }) => {
    await seedProgress(page, seedFor("case-001"));
    await loadSeededSave(page);

    // The chooser, not the Student panel behind it — that panel's content is already exactly the
    // height of a 720px viewport, so the sliders live one screen earlier where there is room.
    await page.click('[data-action="open-main-menu"]');
    const music = page.locator('[data-audio-volume="music"]');
    await expect(music).toBeVisible();

    await music.fill("30");
    await music.dispatchEvent("input");
    await expect.poll(async () => (await audioState(page)).volumes.music).toBeCloseTo(0.3, 5);
    // An uncontrolled input: `render()` replaces `#app` wholesale, so a re-render on `input` would
    // destroy the slider mid-drag. A second event must not reset what the first one set.
    await music.dispatchEvent("input");
    await expect(music).toHaveValue("30");

    const stored = await page.evaluate(() =>
      window.localStorage.getItem("republic-builder.audio.volume")
    );
    expect(JSON.parse(stored).music).toBeCloseTo(0.3, 5);

    // `reloadIntoSave`, not a bare `page.reload()` — a reload re-arms the title screen, so a click
    // aimed at the in-game chrome afterwards waits for an element that is not there until the test
    // itself times out.
    await reloadIntoSave(page);
    await expect.poll(async () => (await audioState(page)).volumes.music).toBeCloseTo(0.3, 5);
  });
});
