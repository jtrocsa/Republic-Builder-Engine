import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress, walkTo } from "./helpers/progress-seed.js";

// Richmond's two rooms, banked the way Phase 5 banked Canal Crossroads' two — and for the same
// reason it could not be banked earlier. Phase 8 built the counting room and the Chimborazo ward and
// wired both into FIELD_MAPS["unit-05"].interiors, but UNITS was [UNIT_01..UNIT_04], so
// unitForCase() could not resolve unit-05 and no seeded save could reach either door. Unit 5's
// content is what makes them openable, so this is the first commit where the walkthrough is
// writable at all.
//
// field-interiors.spec.js already proves the *mechanism* — entry, exit, `fieldReturn`, the
// proximity gate, reload-inside-a-room, per-room grids. This file does not repeat all of that. What
// it covers is what is specific to these two rooms:
//
//   the register rule holds in play      Nathan Purcell is enslaved, and the line the player
//                                        actually reads on screen has to be his own account in the
//                                        first person, naming himself. That is the single most
//                                        important authoring constraint on this unit (see the
//                                        headers of unit-05-campaign.js and the two palettes), and
//                                        a constraint nothing checks is a constraint that drifts.
//   six records across three surfaces     Richmond is the first case in the game whose records span
//                                        an outdoor map and *two* interiors. The per-surface guard
//                                        in fieldSourceSignal() has to keep the four outdoor ones
//                                        out of the rooms and the two indoor ones off the street,
//                                        while the unit checklist lists all six from anywhere.
//   the ward is bigger than the frame     24x14 is the only interior in the game that scrolls on
//                                        both axes; the counting room at 18x14 is the narrowest and
//                                        centres. One spec measuring both is what proves
//                                        activeFieldGrid() is really per-surface.
//   a door on a two-door map              both markers render outdoors, and the one four tiles away
//                                        stays shut.
//
// Each test starts inside its room and walks out, for the reason field-interiors.spec.js documents
// at length — reaching either of these doors from the Franklin Street spawn means crossing the bluff
// at one of its two descents, which is a long walk to prove nothing extra. Since Phase 94 the walker
// can make it; this file simply does not have to.

const BASE_SEED = {
  currentScreen: "field",
  activeCaseId: "case-013",
  unlocked: ["case-001", "case-013"],
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

test.describe("Richmond interiors", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("the counting room: two men, one book, and the man who names himself", async ({ page }) => {
    test.setTimeout(90_000);
    // On Lower Street, one tile south of the counting room's doorstep at (33, 22) — verified
    // standable against RICHMOND_FIELD_BLOCKS, and inside the 1.45-tile door reach.
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "richmond-counting-room",
      fieldReturn: { x: 33.0, y: 23.0, facing: "up" },
      // The price board is gated behind the requisition as of Phase 81F, and a locked record draws
      // no world marker — which is correct, and is not what this test is about. Seeding the
      // requisition secured opens the gate so the assertion below still measures the thing it was
      // written to measure: outdoors you see the records with markers of their own and none of the
      // ones behind doors.
      caseEvidence: { "case-013": ["richmond-impressment-order"] },
    });
    await loadSeededSave(page);
    await expect(page.locator("#richmondCountingRoomTiledCanvas")).toBeVisible();

    // Inside: the room's own two people, its own threshold, and no Recall beacon — recalling to the
    // Archive from inside a building would strand `fieldReturn` in a room nobody is standing in.
    await expect(page.locator(".field-door--exit")).toHaveCount(1);
    await expect(page.locator(".recall-beacon")).toHaveCount(0);
    const inside = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((node) => node.dataset.npc).sort()
    );
    expect(inside).toEqual(["richmond-bookkeeper", "richmond-hired-out-man"]);

    // 18x14 at 48px is 864x672 — the narrowest room in the game, and narrower than the frame, so it
    // centres rather than pinning to the corner.
    const worldSize = await page.locator("#caribbeanWorld").evaluate((el) => ({
      width: el.style.width,
      height: el.style.height,
    }));
    expect(worldSize).toEqual({ width: "864px", height: "672px" });
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
      .toBeCloseTo(Math.round((viewportWidth - 864) / 2), 0);

    // One record in here, on the book-keeper, and none of the four out in the city.
    await expect(page.locator(".npc-source-badge")).toHaveCount(1);
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    // The checklist is the other way round on every surface: six, wherever you are standing. It is
    // what tells a player there is anything behind a door at all.
    await expect(page.locator(".field-tracker li")).toHaveCount(6);

    expect(
      await walkTo(page, '[data-npc="richmond-bookkeeper"]', "caseFieldPlayer"),
      "the book-keeper is reachable from the doorway"
    ).toBe(true);
    await page.keyboard.press("e");
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("Twenty-two years I have kept this book");
    await expect(bubble.locator('[data-action="start-source-activity"]')).toContainText(
      "Commission house day book"
    );
    await page.keyboard.press("e");
    await expect(bubble).toHaveCount(0);

    // **The register rule, asserted rather than trusted.** Nathan Purcell is enslaved and standing
    // in a slave trader's outer office, which is the exact place a game gets this wrong by letting
    // the white man across the room explain him. The line a player actually reads has to be his, in
    // the first person, with his own name in it, and it has to say what he intends. If a future
    // rewrite softens that, this fails.
    expect(
      await walkTo(page, '[data-npc="richmond-hired-out-man"]', "caseFieldPlayer"),
      "the man waiting in the outer office is reachable"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("My name is Nathan Purcell");
    await expect(bubble).toContainText("the river runs two ways");
    await page.keyboard.press("e");

    // Out through the threshold, back onto Lower Street where the save said they were standing.
    expect(
      await walkTo(page, ".field-door--exit", "caseFieldPlayer"),
      "the way out is reachable from inside"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#richmondTiledCanvas")).toBeVisible();
    expect(await roomState(page)).toEqual({ room: null, back: null });
    await expect(page.locator(".recall-beacon")).toHaveCount(1);
    await expect(page.locator(".field-door")).toHaveCount(2);
    // Outdoors the guard runs the other way: the city shows only the record with a world marker of
    // its own — the market price board — and neither of the two behind doors.
    await expect(page.locator(".source-signal--world")).toHaveCount(1);
    await expect(
      page.locator('.source-signal--world[data-source="richmond-price-board"]')
    ).toHaveCount(1);
    const outside = await playerAt(page);
    expect(outside.x).toBeCloseTo(33.0, 1);
    expect(outside.y).toBeCloseTo(23.0, 1);

    // And straight back in from the doorstep.
    await expect(page.locator('.field-door[data-interior="richmond-counting-room"]')).toHaveClass(
      /is-near/
    );
    await page.keyboard.press("e");
    await expect(page.locator("#richmondCountingRoomTiledCanvas")).toBeVisible();
    expect((await roomState(page)).room).toBe("richmond-counting-room");
  });

  test("the ward: the register, the two women in the room, and a floor wider than the frame", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    // On Broad Street, one tile south of the ward's doorstep at (40, 8).
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "richmond-hospital-ward",
      fieldReturn: { x: 40.0, y: 9.0, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#richmondHospitalWardTiledCanvas")).toBeVisible();

    const inside = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((node) => node.dataset.npc).sort()
    );
    expect(inside).toEqual(["richmond-hospital-worker", "richmond-ward-nurse"]);

    // 24x14 at 48px is 1152x672 against a field frame of roughly 970x596 at this viewport: the only
    // interior in the game that scrolls on both axes, and the whole point of building it that size.
    // A world wider than its frame is clamped, never given the positive offset a centred room gets.
    const worldSize = await page.locator("#caribbeanWorld").evaluate((el) => ({
      width: el.style.width,
      height: el.style.height,
    }));
    expect(worldSize).toEqual({ width: "1152px", height: "672px" });
    const camX = await page
      .locator("#caribbeanWorld")
      .evaluate((el) => Number(el.style.transform.match(/-?[\d.]+/g)[0]));
    const viewportWidth = await page
      .locator("#caseFieldMap")
      .evaluate((el) => el.getBoundingClientRect().width);
    expect(viewportWidth, "the ward is wider than the frame it is drawn in").toBeLessThan(1152);
    expect(camX, "a world wider than its frame is clamped, not centred").toBeLessThanOrEqual(0);

    await expect(page.locator(".npc-source-badge")).toHaveCount(1);
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    await expect(page.locator(".field-tracker li")).toHaveCount(6);

    expect(
      await walkTo(page, '[data-npc="richmond-hospital-worker"]', "caseFieldPlayer"),
      "the matron is reachable from the foot of the ward"
    ).toBe(true);
    await page.keyboard.press("e");
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("a hundred and fifty buildings on this hill");
    await expect(bubble.locator('[data-action="start-source-activity"]')).toContainText(
      "Ward register page"
    );
  });

  test("a Richmond door is proximity-gated like anything else on the map", async ({ page }) => {
    test.setTimeout(60_000);
    // Four tiles west along Lower Street — outside the 1.45-tile reach, and far enough from Ambrose
    // Kell at (35.5, 22.4) that nothing else is in reach either.
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "richmond-counting-room",
      fieldReturn: { x: 29.0, y: 23.0, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#richmondCountingRoomTiledCanvas")).toBeVisible();

    expect(await walkTo(page, ".field-door--exit", "caseFieldPlayer")).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#richmondTiledCanvas")).toBeVisible();

    const door = page.locator('.field-door[data-interior="richmond-counting-room"]');
    await expect(door).not.toHaveClass(/is-near/);
    await page.keyboard.press("e");
    expect((await roomState(page)).room, "E from out of reach must not open a door").toBe(null);

    // And clicking it from out of range must not teleport-and-interact — the same rule that governs
    // NPCs and records, and the one several past camera regressions came from breaking.
    await door.click({ force: true });
    expect((await roomState(page)).room, "clicking an out-of-reach door must not enter it").toBe(
      null
    );
    await expect(page.locator("#richmondTiledCanvas")).toBeVisible();
  });
});
