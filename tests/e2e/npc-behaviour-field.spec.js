// Does the settlement read as people going somewhere?
//
// tests/unit/npc-behaviour.test.js already simulates a minute of each behaviour and asserts the
// duty cycle, so this is not here to re-check the state machine. It is here for the wiring between
// it and the map, which is where Phase 62's two worst defects both were and where no unit test
// could have seen either:
//
//   - The burgess's route ran down the village spine straight through the stationed minister. The
//     unit tests passed (his stops are walkable and 2.9 tiles from the minister's post), the
//     coordinate tests passed (his circuit resolves), and in the browser he spent half his time
//     blocked against a man standing in the road and covered 4 x 0.3 tiles of a 9.5-tile beat.
//   - The Powhatan pair's wander discs overlapped almost entirely, so they swapped places and a
//     player who walked to one was answered by the other.
//
// Both were found by watching Riverbend for a minute and writing down where everyone went. That is
// what this does, in fifteen seconds, so nobody has to do it by hand again.

import { expect, test } from "@playwright/test";

import { loadSeededSave, seedProgress } from "./helpers/progress-seed.js";

const SAMPLE_MS = 500;
const SAMPLES = 30;

/** Where every NPC is, read off the live DOM the tick writes to. */
async function sampleNpcs(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("[data-npc]")].map((node) => ({
      id: node.dataset.npc,
      x: parseFloat(node.style.left) / 48,
      y: parseFloat(node.style.top) / 48,
      walking: node.classList.contains("is-walking-npc"),
    }))
  );
}

test("Riverbend's cast goes about its business", async ({ page }) => {
  test.setTimeout(90_000);
  await seedProgress(page, {
    currentScreen: "field",
    activeCaseId: "case-004",
    unlockedCaseIds: ["case-001", "case-004"],
  });
  await loadSeededSave(page);
  await expect(page.locator("#caseFieldPlayer")).toBeVisible();

  const samples = [];
  for (let i = 0; i < SAMPLES; i += 1) {
    samples.push(await sampleNpcs(page));
    await page.waitForTimeout(SAMPLE_MS);
  }

  // Everyone the settlement is authored to have a post rather than an errand: the minister at the
  // meetinghouse door, the smith at his fire, and the three watch posts. Named here rather than
  // derived, because the point of the test is that the authored intent survived to the screen.
  const STATIONED = [
    // The Field Liaison is Chronicle's, not the settlement's, and waits where the player lands.
    "liaison",
    "settlement-minister",
    "settlement-smith",
    "settlement-watch-gate",
    "settlement-watch-road",
    "settlement-watch-wharf",
  ];

  const ids = samples[0].map((npc) => npc.id);
  expect(ids.length, "Riverbend's whole cast is on the map").toBe(16);

  const trackOf = (id) => samples.map((sample) => sample.find((npc) => npc.id === id));
  const rangeOf = (id) => {
    const track = trackOf(id);
    const xs = track.map((npc) => npc.x);
    const ys = track.map((npc) => npc.y);
    return Math.max(...xs) - Math.min(...xs) + (Math.max(...ys) - Math.min(...ys));
  };

  // Standing still has to mean it: a player told to find the minister at the meetinghouse has to
  // find him at the meetinghouse, and a watch that drifts off its post is not a watch.
  for (const id of STATIONED) {
    expect(rangeOf(id), `${id} holds their post`).toBeLessThan(0.05);
    expect(
      trackOf(id).every((npc) => !npc.walking),
      `${id} never walks`
    ).toBe(true);
  }

  // Everyone else covers real ground inside fifteen seconds. Two tiles is a low bar on purpose —
  // it is not measuring how far they get, it is catching the person who is stuck against
  // something, which is what "4 x 0.3 tiles" looked like.
  const stuck = ids
    .filter((id) => !STATIONED.includes(id))
    .filter((id) => rangeOf(id) < 2)
    .map((id) => `${id} covered ${rangeOf(id).toFixed(1)} tiles`);
  expect(stuck).toEqual([]);

  // And the settlement is in motion rather than posing. Averaged, not per frame: everyone pausing
  // at the same instant occasionally is a coincidence, and only the average says whether the place
  // is inhabited or a diorama. The bar is against the ten who have somewhere to be, not the cast —
  // adding stationary watch posts must not make it easier to pass.
  const mobile = ids.length - STATIONED.length;
  const moving = samples.map((sample) => sample.filter((npc) => npc.walking).length);
  const average = moving.reduce((total, n) => total + n, 0) / moving.length;
  expect(average, `only ${average.toFixed(1)} of ${mobile} in motion on average`).toBeGreaterThan(
    mobile / 2
  );
});
