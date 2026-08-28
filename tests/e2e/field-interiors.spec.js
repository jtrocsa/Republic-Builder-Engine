import { test, expect } from "@playwright/test";
import {
  seedProgress,
  loadSeededSave,
  reloadIntoSave,
  readProgress,
  walkTo,
} from "./helpers/progress-seed.js";

// The interior walkthrough Phase 1 owed and Phase 4 could not pay.
//
// The field-interior engine shipped dormant, verified by hand against a scaffold room that was then
// removed rather than committed. Phase 4 declared the first two real interiors but still could not
// bank this: UNITS was [UNIT_01, UNIT_02, UNIT_03], so unitForCase() could not resolve unit-04 and
// no seeded save could reach either room. Unit 4's content is what makes the door openable, so this
// is the first commit where the walkthrough is writable at all.
//
// **Each test starts inside the room and walks out**, rather than starting at the map spawn and
// walking in. That is not a shortcut around the hard part — the exit, the return position and the
// re-entry are all exercised. It used to be a limit of the test walker: reaching the printing office
// from the towpath spawn means crossing the canal, which can only be done at the lock eleven tiles
// west or the plank bridge twenty east, and reaching the boardinghouse door means rounding a
// building to its far face, and a walker that slid past obstacles rather than pathing could not make
// either walk. Phase 94 gave it the walls — walkTo() breadth-firsts the game's own collision now, so
// it could. The shape stays anyway, because those two traverses would add half a minute of walking
// to every test in this file and prove nothing the door assertions do not already prove. What was a
// limitation is now a choice. `fieldReturn` is a persisted field, so seeding it puts the player on the doorstep the
// moment they step out, and the outdoor half of the flow is tested from there.
//
// What this covers, and why each one needs a browser:
//
//   entry, exit and return        stepping out must restore the position captured on the way in,
//                                 not the map's spawn — and stepping back in must work from there.
//   the door is proximity-gated   `E` from four tiles down the street must do nothing. A door is an
//                                 interaction competing with people and records at the same
//                                 1.45-tile reach, which is exactly why Josiah Pike had to move
//                                 three tiles east of his own shop.
//   the camera centres            a room narrower than the viewport is centred, not clamped to the
//                                 corner. The clamp formula degenerates to a corner pin, and only a
//                                 real layout can measure the difference.
//   reload mid-room               `currentFieldRoom` and `fieldReturn` are persisted, so a refresh
//                                 inside a building has to come back inside that building. An early
//                                 build put the player outdoors, which is a silent save-shape bug.
//   each room has its own grid    22x14 here, 20x14 there — the whole reason activeFieldGrid()
//                                 exists rather than every surface sharing FIELD_GRID.
//   the record is really in there The point of the room. Both carry a record found nowhere else.
//
// The Recall beacon is deliberately asserted absent indoors: recalling to the Archive from inside a
// building would strand `fieldReturn` in a room the player is no longer standing in.

const BASE_SEED = {
  currentScreen: "field",
  activeCaseId: "case-010",
  unlocked: ["case-001", "case-010"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

/** Reads the two persisted fields the door interaction writes. */
async function roomState(page) {
  const saved = await readProgress(page);
  return { room: saved.currentFieldRoom ?? null, back: saved.fieldReturn ?? null };
}

const playerAt = (page) =>
  page.locator("#caseFieldPlayer").evaluate((el) => ({
    x: Number.parseFloat(el.style.left) / 48,
    y: Number.parseFloat(el.style.top) / 48,
  }));

test.describe("Field interiors", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("the printing office: the record inside, the way out, and the way back in", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    // On Market Street, one tile south of the printing office's doorstep at (32, 8) — verified
    // standable against CANAL_CROSSROADS_FIELD_BLOCKS, and inside the 1.45-tile door reach.
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "canal-print-shop",
      fieldReturn: { x: 32.0, y: 9.0, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#canalPrintShopTiledCanvas")).toBeVisible();

    // Inside: the room's own two people, its own threshold marker, and no Recall beacon.
    await expect(page.locator(".field-door--exit")).toHaveCount(1);
    await expect(page.locator(".recall-beacon")).toHaveCount(0);
    const inside = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((node) => node.dataset.npc).sort()
    );
    expect(inside).toEqual(["canal-journeyman-printer", "canal-printers-devil"]);

    // A room narrower than its frame is centred in it rather than pinned to the top-left corner.
    // 20x14 at 48px is 960x672, so x centres and y — taller than the frame — does not.
    const camX = () =>
      page
        .locator("#caribbeanWorld")
        .evaluate((el) => Number(el.style.transform.match(/-?[\d.]+/g)[0]));
    const viewportWidth = await page
      .locator("#caseFieldMap")
      .evaluate((el) => el.getBoundingClientRect().width);
    // Polled, not read once. The field mounts with `translate(0px, 0px)` and the first
    // `updateFieldPlayer()` writes the real camera a frame later, so a one-shot read between the
    // two returns 0 — a race the suite could not lose while six workers held the page at 4-13fps,
    // and loses at two workers where the page runs at 40+. The centred value can legitimately be
    // near zero (the telegraph office's is 10), so waiting for "non-zero" is not available;
    // polling the assertion is. See decision log `0092` §6.
    await expect
      .poll(camX, { message: "a room narrower than the frame is centred in it" })
      .toBeCloseTo(Math.round((viewportWidth - 960) / 2), 0);

    // A reload inside a room comes back inside that room. `reloadIntoSave()` is not incidental:
    // page.reload() re-runs module scope, resetting `showMainMenu` and re-arming the title, so the
    // app returns to its very first screen exactly as on a cold boot — see save-persistence.spec.js,
    // which documents the same thing. What is being tested is that the *save* resumes the room, and
    // it is the field boot guard's `resetFieldPosition({ keepRoom: true })` that makes it.
    await reloadIntoSave(page);
    await expect(page.locator("#canalPrintShopTiledCanvas")).toBeVisible();
    expect((await roomState(page)).room).toBe("canal-print-shop");

    // The record exists only in here, and it rides on the journeyman rather than the editor — see
    // the note in unit-04-campaign.js about why the job book is a wage-earner's document.
    await expect(page.locator(".npc-source-badge")).toHaveCount(1);
    // And nothing else does. This is the first case whose records span more than one surface, and
    // `sources` is the whole case's list on every surface — so before Phase 66's guard in
    // fieldSourceSignal(), the three records out in the town all rendered here as live ✦ markers
    // stacked on sourcePointPosition()'s (10,10) fallback, in the middle of the room.
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    // The unit checklist is deliberately the other way round: it lists all five wherever you stand,
    // because it is what tells a player there is anything behind a door at all.
    await expect(page.locator(".field-tracker li")).toHaveCount(5);
    expect(
      await walkTo(page, '[data-npc="canal-journeyman-printer"]', "caseFieldPlayer"),
      "the printer is reachable from the doorway"
    ).toBe(true);
    await page.keyboard.press("e");
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("The job work does");
    await expect(bubble.locator('[data-action="start-source-activity"]')).toContainText(
      "Job-work order book"
    );
    // `E` again rather than clicking the bubble's close button: the bubble is a world-positioned
    // layer and the field <main> intercepts the pointer at that spot. Toggling with the same key
    // that opened it is what a player does anyway.
    await page.keyboard.press("e");
    await expect(bubble).toHaveCount(0);

    // Out through the threshold, and back onto the street where the save said they were standing.
    expect(
      await walkTo(page, ".field-door--exit", "caseFieldPlayer"),
      "the way out is reachable from inside"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#canalCrossroadsTiledCanvas")).toBeVisible();
    expect(await roomState(page)).toEqual({ room: null, back: null });
    await expect(page.locator(".recall-beacon")).toHaveCount(1);
    // Both doorsteps are markers on the outdoor map, and this is the seeded return position rather
    // than the map's towpath spawn at (26.5, 20.6).
    await expect(page.locator(".field-door")).toHaveCount(2);
    // Outdoors the same guard runs the other way: the town shows only the one record that has a
    // world marker out here — the Reform Square board — and neither of the two behind doors.
    await expect(page.locator(".source-signal--world")).toHaveCount(1);
    await expect(
      page.locator('.source-signal--world[data-source="canal-reform-notices"]')
    ).toHaveCount(1);
    const outside = await playerAt(page);
    expect(outside.x).toBeCloseTo(32.0, 1);
    expect(outside.y).toBeCloseTo(9.0, 1);

    // And straight back in from the doorstep, which is the entry half of the flow.
    await expect(page.locator('.field-door[data-interior="canal-print-shop"]')).toHaveClass(
      /is-near/
    );
    await page.keyboard.press("e");
    await expect(page.locator("#canalPrintShopTiledCanvas")).toBeVisible();
    expect((await roomState(page)).room).toBe("canal-print-shop");
  });

  test("a door is proximity-gated like anything else on the map", async ({ page }) => {
    test.setTimeout(60_000);
    // Four tiles east along Market Street — outside the 1.45-tile reach, with nothing in between.
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "canal-print-shop",
      fieldReturn: { x: 36.0, y: 9.0, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#canalPrintShopTiledCanvas")).toBeVisible();

    expect(await walkTo(page, ".field-door--exit", "caseFieldPlayer")).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#canalCrossroadsTiledCanvas")).toBeVisible();

    const door = page.locator('.field-door[data-interior="canal-print-shop"]');
    await expect(door).not.toHaveClass(/is-near/);
    await page.keyboard.press("e");
    expect((await roomState(page)).room, "E from out of reach must not open a door").toBe(null);

    // Clicking it from out of range must not teleport-and-interact either — the same rule that
    // governs NPCs and records, and the one several past camera regressions came from breaking.
    await door.click({ force: true });
    expect((await roomState(page)).room, "clicking an out-of-reach door must not enter it").toBe(
      null
    );
    await expect(page.locator("#canalCrossroadsTiledCanvas")).toBeVisible();
  });

  test("the boardinghouse: three people, its own record, and its own grid", async ({ page }) => {
    test.setTimeout(90_000);
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "canal-boarding-house",
      fieldReturn: { x: 24.0, y: 24.6, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#canalBoardingHouseTiledCanvas")).toBeVisible();

    const inside = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((node) => node.dataset.npc).sort()
    );
    expect(inside).toEqual([
      "canal-boardinghouse-keeper",
      "canal-boat-woman",
      "canal-temperance-reformer",
    ]);

    // Each interior declares its own grid: 22x14 here against the print shop's 20x14.
    const worldSize = await page.locator("#caribbeanWorld").evaluate((el) => ({
      width: el.style.width,
      height: el.style.height,
    }));
    expect(worldSize).toEqual({ width: "1056px", height: "672px" });

    expect(
      await walkTo(page, '[data-npc="canal-boardinghouse-keeper"]', "caseFieldPlayer"),
      "the keeper is reachable from the doorway"
    ).toBe(true);
    await page.keyboard.press("e");
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("the beds never cool");
    await expect(bubble.locator('[data-action="start-source-activity"]')).toContainText(
      "Boardinghouse register"
    );
  });
});
