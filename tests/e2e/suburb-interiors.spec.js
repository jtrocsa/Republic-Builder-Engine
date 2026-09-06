import { test, expect } from "@playwright/test";
import {
  seedProgress,
  loadSeededSave,
  readProgress,
  walkTo,
  holdKey,
} from "./helpers/progress-seed.js";

// Fairmeadow's two rooms, and **this file walks to the doors from outside** — which is the one thing
// the interior specs before it deliberately do not do.
//
// `port-interiors.spec.js` says why they don't: reaching Ellis Island's doors from the barge landing
// means crossing the whole wharf to prove nothing extra, so each of those tests starts inside its
// room and walks out. That reasoning is sound and it left a real hole, which Phase 98 fell into
// twice on one map:
//
//   1. `FIELD_MAPS["unit-08"].interiors["fairmeadow-building-and-loan"].door` was declared at row 25
//      by reading the generator's constants by hand. `FAIRMEADOW_FIELD_DOORS` says 26.
//   2. A street tree was stamped across the model house's door cell. The door still *worked* — a
//      player could reach it side-on from the gap beside it — which is exactly the kind of
//      half-broken that ships.
//
// Neither is visible to anything else in the suite. The visual-regression shots enter a room by
// setting `currentFieldRoom` directly, `field-map-coordinates` flood-fills each room from its own
// entry cell and never looks at the outdoor side of the door, and CLAUDE.md's field-interior
// invariant says in as many words that nothing catches a blocked doorstep and it must be checked by
// hand. This is that check, banked.
//
// What else is specific to these two:
//
//   the only interior with interior walls   The model house has a cross-partition with four
//                                           doorways in it. Three separate passes sealed a room
//                                           behind furniture; the flood fill caught each one. The
//                                           assertion here is the cheap end of the same claim —
//                                           walk from the front door to the card table, which
//                                           crosses the partition.
//   two records nobody is carrying          Both are `anchor: { object }`, the only such pair in
//                                           the game. So each room draws a world marker rather than
//                                           an NPC badge, which is the opposite of every other
//                                           interior in the game.
//   a three-link chain                      deed → appraisal → checklist. The checklist is the
//                                           second cross-surface lock ever shipped and the first
//                                           whose gate is two steps back.

const BASE_SEED = {
  currentScreen: "field",
  activeCaseId: "case-022",
  unlocked: ["case-001", "case-022"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

const playerAt = (page) =>
  page.locator("#caseFieldPlayer").evaluate((el) => ({
    x: Number.parseFloat(el.style.left) / 48,
    y: Number.parseFloat(el.style.top) / 48,
  }));

test.describe("Fairmeadow interiors", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("both doors are reachable from the street they open onto", async ({ page }) => {
    test.setTimeout(180_000);
    await seedProgress(page, BASE_SEED);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // Two doors on this map and only two. The township building is stamped with a door leaf and
    // declares no interior, so it must not offer one.
    await expect(page.locator(".field-door")).toHaveCount(2);

    // **The model house.** Its door cell is (22,6) and the walker has to end up in front of it, not
    // beside it — a whip planted on cols 22-23 left the door reachable only side-on and this is what
    // says so. `walkTo` breadth-first routes through the map's real collision, so if the doorstep is
    // covered the walk fails outright.
    expect(
      await walkTo(page, '.field-door[data-interior="fairmeadow-model-house"]', "caseFieldPlayer"),
      "the model house door is reachable on foot from the drive"
    ).toBe(true);
    // South of the house's ground-contact row, which is row 6 — and it is the **feet** that have to
    // be, not the anchor. `footBoxFor()` puts the top of the foot box 0.40 below a character's
    // anchor, so a player standing correctly on the walk reads y ≈ 5.99 and their feet read 6.40.
    // Asserting the anchor directly made this test flaky by four thousandths of a tile.
    const atHouse = await playerAt(page);
    expect(atHouse.y + 0.4, "and the player's feet are on the walk, south of it").toBeGreaterThan(
      6.0
    );

    await page.keyboard.press("e");
    await expect(page.locator("#fairmeadowModelHouseTiledCanvas")).toBeVisible();
    const inHouse = await readProgress(page);
    expect(inHouse.currentFieldRoom).toBe("fairmeadow-model-house");
    // The way back out is recorded on the doorstep, not on the door cell, or stepping outside puts
    // the player inside the building they just left. Same anchor-versus-feet arithmetic as above:
    // `fieldReturn` stores the anchor, and it is the foot box that has to clear row 6.
    expect(
      inHouse.fieldReturn?.y + 0.4,
      "fieldReturn puts the feet back on the walk"
    ).toBeGreaterThan(6.0);

    // Two people, and neither of them is holding anything — the terms sheet is on the card table, so
    // it draws a world marker instead of an NPC badge. That is true of only one other room.
    await expect(page.locator(".npc-source-badge")).toHaveCount(0);
    await expect(page.locator(".source-signal--world")).toHaveCount(1);
    const cast = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((n) => n.dataset.npc).sort()
    );
    expect(cast).toEqual(["suburb-model-visitor", "suburb-sales-agent"]);

    // The checklist lists all seven wherever you stand, which is what tells a player there is
    // anything behind a door at all.
    await expect(page.locator(".field-tracker li")).toHaveCount(7);
    // No Recall beacon indoors: recalling from inside a building would strand `fieldReturn` in a
    // room nobody is standing in.
    await expect(page.locator(".recall-beacon")).toHaveCount(0);

    // **Across the partition.** The card table is in the public rooms and the player entered through
    // the front door beside them, so this walk is short; what it proves is that the marker is
    // standable-next-to at all, which three furniture layouts in a row were not.
    expect(
      await walkTo(page, ".source-signal--world", "caseFieldPlayer"),
      "the card table can be stood at"
    ).toBe(true);

    // Back out, and the door is where it was.
    expect(await walkTo(page, ".field-door--exit", "caseFieldPlayer")).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#fairmeadowTiledCanvas")).toBeVisible();
    expect((await readProgress(page)).currentFieldRoom ?? null).toBeNull();
  });

  test("the lending office: a counter, and the loose sheet behind it", async ({ page }) => {
    test.setTimeout(180_000);
    // Starts inside, with `fieldReturn` on Broad Street's north walk — the same shape
    // port-interiors.spec.js uses, and for the same reason: the walk from the spawn on the old
    // township road, across the expressway and down through the borough proves nothing this test is
    // about. **The door is still crossed from the street**, at the end: this test steps outside
    // first and walks back in, which is the direction that would have caught the row-25 typo.
    //
    // There is no `fieldSpawn` in the save schema and an earlier draft of this test invented one.
    // The outdoor position always comes from `FIELD_MAPS[unit].spawn`; `fieldReturn` is the only
    // way to put the player anywhere else, and it exists because a door writes it.
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "fairmeadow-building-and-loan",
      fieldReturn: { x: 37.0, y: 26.6, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#fairmeadowBuildingAndLoanTiledCanvas")).toBeVisible();

    // 16x14 at 48px is 768x672 — narrower than the frame and a little taller, so this room centres
    // horizontally and scrolls vertically. The model house next door does neither.
    const worldSize = await page.locator("#caribbeanWorld").evaluate((el) => ({
      width: el.style.width,
      height: el.style.height,
    }));
    expect(worldSize).toEqual({ width: "768px", height: "672px" });

    const cast = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((n) => n.dataset.npc).sort()
    );
    expect(cast).toEqual(["suburb-counter-clerk", "suburb-mortgage-officer"]);
    await expect(page.locator(".npc-source-badge")).toHaveCount(0);

    // **The checklist is locked two steps back.** It carries
    // `requiresSourceId: "suburb-neighborhood-appraisal"`, which is itself gated behind the deed —
    // the only three-link chain in the game — so with nothing secured the desk offers no marker at
    // all, while the tracker still lists it.
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    await expect(page.locator(".field-tracker li")).toHaveCount(7);

    // **The counter is a wall with one way through it.** The gap is at cols 5-8 on the door's own
    // axis, so a player who walks straight in reaches the officers' side; the runs either side of it
    // are solid. Walking to the officer proves the gap is open and the route through it exists.
    expect(
      await walkTo(page, '[data-npc="suburb-mortgage-officer"]', "caseFieldPlayer"),
      "the gap in the counter is walkable"
    ).toBe(true);

    // **The walk ends on the man's reach and the assertion below needs the desk's.**
    //
    // `walkTo` returns the instant `.is-near` lights on the thing it was pointed at, and
    // `nearestFieldInteraction()` sorts every person, record and doorstep into one list by raw
    // distance and takes the first — so where the walk happens to stop is what decides which of the
    // two `e` opens. The officer stands at (4.5, 4.6) with a reach of 1.45; the desk's record sits
    // at (6.0, 4.0) with 1.55. The bisector between them crosses his row at x 5.37 and his reach
    // ends at 5.95, which is a window about **0.6 of a tile wide** — and a burst of the walker
    // carries up to 2.5. Land west of it and `e` opens the officer, `toggleFieldDialogue()` clears
    // `progress.fieldNotice`, and the assertion below reads an empty string. That is exactly the
    // failure this test was seen producing, recorded in decision log `0118` §8 and never routed.
    //
    // So the arrival is stated rather than assumed, the way the model house's is above. Step east —
    // away from him, toward the desk — and **ask the game what `e` will reach** rather than
    // recomputing its answer here, which is the line `0093` drew for the nav probe. The loop is
    // bounded by the state it is looking for and not by a count of milliseconds: Phase 119's rule,
    // and the third time this suite has needed it.
    //
    // East is open floor. The ledgers stop at row 4 and the counter starts at row 6, so rows 4-6 run
    // clear from the officer to his own chair at column 7; and the route in comes through the gap in
    // the counter from the east, so stepping east is stepping away from the body, never into it.
    const reaching = () => page.evaluate(() => window.__chronicleReach()?.id ?? null);
    let reaches = await reaching();
    for (let step = 0; step < 12 && reaches !== "suburb-underwriting-checklist"; step += 1) {
      await holdKey(page, "ArrowRight", 90);
      reaches = await reaching();
    }
    const atDesk = await playerAt(page);
    expect(
      reaches,
      `standing at ${atDesk.x.toFixed(2)},${atDesk.y.toFixed(2)}, e has to reach the checklist rather than the man beside it`
    ).toBe("suburb-underwriting-checklist");

    // And **the chain says so out loud.** Because the checklist is locked, what comes back is the
    // gate's own line naming the appraisal and the man who carries it. A locked record is still an
    // interaction; it draws no marker and it refuses, which is different from not being there.
    // Three phases have now shipped a cross-surface lock and this is the first one whose refusal is
    // asserted.
    await page.keyboard.press("e");
    // `refuseLockedRecord()` merges the source points of every surface in the unit to find the
    // appraisal, which lives out on the map. If that merge ever loses it, the generic fallback
    // ("Another record in this case has to be secured first.") is written instead and fails both of
    // these in exactly the same way as a wrong arrival would. The messages say which to look for.
    await expect(
      page.locator("#fieldNotice"),
      "the refusal names the appraisal; a generic line means refuseLockedRecord() lost the point"
    ).toContainText("Valuation report");
    await expect(
      page.locator("#fieldNotice"),
      "and names who carries it, which comes from the appraisal's anchoring NPC"
    ).toContainText("Howard Renfrew");

    // Out onto Broad Street, and **straight back in through the same door** — the leg that proves
    // the doorstep is standable from the outside and that `door.y` is the row the generator wrote.
    expect(await walkTo(page, ".field-door--exit", "caseFieldPlayer")).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#fairmeadowTiledCanvas")).toBeVisible();

    const door = page.locator('.field-door[data-interior="fairmeadow-building-and-loan"]');
    expect(
      await walkTo(
        page,
        '.field-door[data-interior="fairmeadow-building-and-loan"]',
        "caseFieldPlayer"
      ),
      "the association's door is reachable from Broad Street"
    ).toBe(true);
    await expect(door).toHaveClass(/is-near/);
    await page.keyboard.press("e");
    await expect(page.locator("#fairmeadowBuildingAndLoanTiledCanvas")).toBeVisible();
  });
});
