import { expect, test } from "@playwright/test";

import { loadSeededSave, seedProgress, walkToNpc } from "./helpers/progress-seed.js";

// Banks the checks that no unit test can make, because they are about what the browser actually
// computes: that pressing a direction selects that direction's strip, that the CSS keyframe really
// steps through the frames, and that letting go leaves the character standing the way it walked.
//
// Before the PixelLab cast landed these could not have passed. `up` resolved to the *south* sprite
// (dimmed 8% by a filter that a later `filter: none !important` had already killed), `left` was the
// east art mirrored, and "animation" was two poses crossfading on a timer.

test.use({ viewport: { width: 1366, height: 768 } });

/** Reads the sprite element's live animation state out of the DOM. */
function spriteState(page, id) {
  return page.locator(`#${id}`).evaluate((el) => ({
    direction: (el.style.getPropertyValue("--sprite-sheet").match(/-(down|up|left|right)\.png/) || [
      null,
      null,
    ])[1],
    columns: el.style.getPropertyValue("--sprite-columns"),
    frameOffset: window.getComputedStyle(el).backgroundPositionX,
    walking: el.classList.contains("is-walking"),
  }));
}

const KEYS = [
  ["ArrowUp", "up"],
  ["ArrowDown", "down"],
  ["ArrowLeft", "left"],
  ["ArrowRight", "right"],
];

for (const [surface, screen, seed, playerId] of [
  [
    "field",
    "field",
    { activeCaseId: "case-001", unlockedCaseIds: ["case-001"] },
    "caseFieldPlayerSprite",
  ],
  ["institute", "institute", { unlockedCaseIds: ["case-001"] }, "institutePlayerSprite"],
]) {
  test(`${surface}: each direction plays its own walk cycle and holds the last facing`, async ({
    page,
  }) => {
    await seedProgress(page, { currentScreen: screen, ...seed });
    await loadSeededSave(page);
    await expect(page.locator(`#${playerId}`)).toBeVisible();

    for (const [key, direction] of KEYS) {
      await page.keyboard.down(key);
      await page.waitForTimeout(160);
      const first = await spriteState(page, playerId);

      // Several samples across roughly one cycle, not two samples a fixed gap apart. Since Phase 61
      // the player's cycle is derived from its speed and runs at 0.30s rather than a flat 0.72s, so
      // a nominal 120ms gap that stretches to ~301ms under parallel-worker load lands on the *same*
      // step of steps(8) and the old two-sample check failed for arithmetic rather than for a
      // stalled animation. Counting distinct frames over a window cannot alias that way.
      const frames = new Set([first.frameOffset]);
      for (let sample = 0; sample < 6; sample += 1) {
        await page.waitForTimeout(55);
        frames.add((await spriteState(page, playerId)).frameOffset);
      }

      await page.keyboard.up(key);
      await page.waitForTimeout(220);
      const stopped = await spriteState(page, playerId);

      expect(first.direction, `${key} selects the ${direction} strip`).toBe(direction);
      expect(first.walking).toBe(true);
      expect(frames.size, `${direction} walk cycle advances through frames`).toBeGreaterThan(1);
      expect(stopped.direction, `stopping keeps facing ${direction}`).toBe(direction);
      expect(stopped.walking).toBe(false);
      // Column 0 of every strip is a standing pose drawn for that direction, so an idle character
      // is never showing an arbitrary mid-stride frame.
      expect(stopped.frameOffset, "idle shows the standing column").toBe("0px");
    }
  });
}

// A missing key would silently fall back to the Director, which is exactly the kind of bug that
// reads as "why is the Taíno gardener wearing a fedora".
// One test per map rather than one loop: seedProgress() deliberately only writes into an empty
// localStorage key, so re-seeding inside a single test would keep the first map's save.
// The Field Liaison is on both authored maps and is pinned here twice. This constant held the
// placeholder sheet Voss borrowed until Phase 80b generated her own — the two lines below are what
// failed until the real art landed, which is exactly what they were for.
const LIAISON_SHEET = "field-liaison-emery-voss";
const SHEETS_BY_CASE = {
  "case-001": {
    liaison: LIAISON_SHEET,
    "taino-elder": "npc-caribbean-woman",
    "taino-gardener": "npc-caribbean-woman",
    "taino-fisher": "npc-caribbean-man",
    "spanish-sailor": "npc-spanish-sailor",
    columbus: "npc-columbus",
    "spanish-scribe": "npc-spanish-scribe",
    "taino-child": "npc-caribbean-child",
  },
  "case-004": {
    liaison: LIAISON_SHEET,
    "settlement-minister": "npc-jamestown-gentleman",
    "indentured-servant": "npc-jamestown-servant",
    "settlement-burgess": "npc-jamestown-gentleman",
    "settlement-goodwife": "npc-jamestown-settler-woman",
    "river-fisher": "npc-jamestown-laborer",
    "wharf-clerk": "npc-jamestown-gentleman",
    "settlement-carpenter": "npc-jamestown-carpenter",
    "powhatan-man": "npc-powhatan-man",
    "powhatan-woman": "npc-powhatan-woman",
    "settlement-smith": "npc-jamestown-blacksmith",
    // Two watch posts share `soldier` and the third is `watchman`. That the map holds two distinct
    // sheets here rather than one posted three times is the assertion worth having.
    "settlement-watch-gate": "npc-jamestown-soldier",
    "settlement-watch-wharf": "npc-jamestown-soldier",
    "settlement-watch-road": "npc-jamestown-watchman",
    "angolan-laborer": "npc-jamestown-african-man",
    "field-servant-south": "npc-jamestown-servant",
  },
  // Unit 3 is deliberately frozen on its placeholder art: no Revolutionary-era characters exist,
  // and inheriting Unit 1's would put Christopher Columbus on a Philadelphia street in 1767.
  "case-007": {
    "john-dickinson": "legacy-scribe",
    "town-crier": "legacy-columbus",
    "militia-recruiter": "legacy-sailor",
    "free-tradesman": "legacy-elder",
    "loyalist-merchant": "legacy-fisher",
    farmwife: "legacy-gardener",
  },
};

for (const [caseId, sheets] of Object.entries(SHEETS_BY_CASE)) {
  test(`${caseId}: every field NPC resolves a real sprite sheet`, async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: caseId,
      unlockedCaseIds: ["case-001", caseId],
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    const actual = await page.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll("[data-npc]")].map((node) => [
          node.dataset.npc,
          (node
            .querySelector(".character-sprite")
            .style.getPropertyValue("--sprite-sheet")
            .match(
              // `field-liaison-` is its own alternative rather than folded into a looser pattern:
              // Voss is the only cast member whose stem starts with neither `npc-` nor a role word,
              // and widening this to `[a-z-]+` would stop it catching a genuinely missing sheet.
              /(npc-[a-z-]+|legacy-[a-z]+|chronicler-[ab]|director-[a-z-]+|field-liaison-[a-z-]+)-(?:down|up|left|right)\.png/
              // A character with an `idleColumns` sheet is drawn from `<stem>-idle-<direction>.png`
              // while it stands, and the greedy stem above captures that suffix. Voss is the first
              // NPC on a *field* map to declare a breathing idle, so this branch had never been
              // reached before Phase 80b — the placeholder they borrowed had no idle sheet, which is
              // why this passed with borrowed art and failed with their own. Strip it here rather
              // than exclude `-idle` in the pattern: which cycle is playing at the sampled frame is
              // a timing question, and the claim under test is whose art it is.
            ) || [null, "MISSING"])[1].replace(/-idle$/, ""),
        ])
      )
    );
    expect(actual, `${caseId} sprite assignments`).toEqual(sheets);
  });
}

// walkToNpc only returns true once the game's own proximity check fires, so these are real pathing
// assertions: the carpenter's barn corner and the Powhatan pair's river landing are walkable to,
// not stranded behind collision or standing inside a building.
//
// One test per NPC, each walking from the spawn. Chaining all three in a single test made the
// carpenter-to-Powhatan leg a 30-tile traverse across the whole settlement, which runs out of the
// walker's step budget — a flake about the test's stamina, not about the map.
//
// Serial, because these are the three most walking-heavy tests in the suite and running them
// alongside each other tripled peak concurrency. The field-movement spec still measures one hold
// in milliseconds rather than in distance, so it covers less ground on a CPU-starved worker and
// starts failing on a load its own comments predicted. Keeping these three in single file costs a
// few seconds and leaves that spec the headroom it was written against.
test.describe.configure({ mode: "serial" });
for (const [id, line] of [
  ["settlement-carpenter", "Every board in that barn"],
  ["powhatan-man", "Tsenacommacah"],
  ["powhatan-woman", "grew in our fields"],
]) {
  test(`${id} is reachable on foot and talks`, async ({ page }) => {
    // The Powhatan landing sits eighteen tiles from the settlement spawn, right across the map,
    // which is more ground than walkToNpc's default budget covers. Longer walk, longer budget — and
    // a test timeout that can accommodate it rather than one that truncates the walk and reports the
    // map as unreachable.
    test.setTimeout(60_000);
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-004",
      unlockedCaseIds: ["case-001", "case-004"],
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    expect(
      await walkToNpc(page, id, { burstMs: 400, timeoutMs: 40_000 }),
      `${id} is reachable`
    ).toBe(true);
    await page.keyboard.press("e");
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText(line);
  });
}
