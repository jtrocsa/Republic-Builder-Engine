import { test, expect } from "@playwright/test";
import {
  seedProgress,
  loadSeededSave,
  reloadIntoSave,
  readProgress,
  walkTo,
  holdKey,
} from "./helpers/progress-seed.js";

// Ellis Island's two rooms, banked the way Phase 86 banked Cottonwood Junction's and Phase 8 banked
// Richmond's. `field-interiors.spec.js` already proves the mechanism — entry, exit, `fieldReturn`,
// the proximity gate, reload-inside-a-room, per-room grids — and this file does not repeat it. What
// it covers is what is specific to these two:
//
//   a switchback, not a counter          The inspection hall is the first interior with *two*
//                                        barriers across it, and their single gates are at opposite
//                                        ends: a player who walks in has to cross the room east,
//                                        north, west, north to reach the desks. That claim is two
//                                        unstamped pairs of columns wide, and closing either one
//                                        would split the room in three with nothing else noticing.
//   the first room bigger than the frame The hall is 22x18 — 1056x864 against a viewport of about
//                                        970x596 — so it is the first interior whose camera follows
//                                        the player instead of sitting still. The telegraph office's
//                                        spec asserts the centring branch; this asserts the other.
//   a record that is locked by another   The board of special inquiry's minute carries
//                                        `requiresSourceId: "port-ship-manifest-page"`, so the
//                                        clerk who holds it shows no badge and offers no button
//                                        until the manifest has been secured in the hall next door.
//                                        This is the only cross-*surface* lock in the game and
//                                        nothing else in the suite walks it.
//   seven records, three surfaces        Four in the hall, one in the hearing room, two out on the
//                                        wharf — the most lopsided split any case has. The
//                                        per-surface guard in fieldSourceSignal() has to keep each
//                                        set where it belongs while the checklist lists all seven
//                                        from anywhere.
//
// Each test starts inside its room and walks out, for the reason field-interiors.spec.js documents
// at length: walkTo() steers and shoves, it does not pathfind, and reaching either door from the
// spawn on the barge landing means crossing the whole wharf and the rail's one gate.

const BASE_SEED = {
  currentScreen: "field",
  activeCaseId: "case-019",
  unlocked: ["case-001", "case-019"],
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

/** The world transform, which is the camera — a pure function of player position. */
const cameraAt = (page) =>
  page.locator("#caribbeanWorld").evaluate((el) => {
    const [x, y] = el.style.transform.match(/-?[\d.]+/g).map(Number);
    return { x, y };
  });

/**
 * Steers the field player to a bare coordinate, one axis at a time.
 *
 * Same helper and same reason as railhead-interiors.spec.js: walkTo() commits to one axis when the
 * other is blocked, which is enough to get round a building and is not enough to find a gate on the
 * far side of a barrier. It matters more here than anywhere, because this room has two gates and
 * they are at opposite ends. A player does not have that problem, because a player can see the gap.
 */
async function nudgeTo(page, target, key) {
  const axis = key === "ArrowLeft" || key === "ArrowRight" ? "x" : "y";
  const done = (at) =>
    key === "ArrowRight" || key === "ArrowDown" ? at[axis] >= target : at[axis] <= target;
  for (let step = 0; step < 80; step += 1) {
    if (done(await playerAt(page))) return true;
    await holdKey(page, key, 120);
  }
  return done(await playerAt(page));
}

test.describe("Ellis Island interiors", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("the inspection hall: two rails, two gates, and the queue walked in the legs", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    // On the forecourt, one tile south of the reception hall doorstep at (26, 4).
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "immigrant-port-inspection-hall",
      fieldReturn: { x: 26.0, y: 5.0, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#immigrantPortInspectionHallTiledCanvas")).toBeVisible();

    // Inside: the room's own five people, its own threshold, and no Recall beacon — recalling to the
    // Archive from inside a building would strand `fieldReturn` in a room nobody is standing in.
    await expect(page.locator(".field-door--exit")).toHaveCount(1);
    await expect(page.locator(".recall-beacon")).toHaveCount(0);
    const inside = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((node) => node.dataset.npc).sort()
    );
    expect(inside).toEqual([
      "port-exchange-clerk",
      "port-immigrant-inspector",
      "port-interpreter",
      "port-line-surgeon",
      "port-station-matron",
    ]);

    // 22x18 at 48px is 1056x864, and the point of the number is that both are larger than the frame.
    // Every interior before this one fitted on at least one axis; the real registry room was 200
    // feet by 100, and a room you cannot see the end of is the one honest thing a 48px tileset can
    // say about that.
    const worldSize = await page.locator("#caribbeanWorld").evaluate((el) => ({
      width: el.style.width,
      height: el.style.height,
    }));
    expect(worldSize).toEqual({ width: "1056px", height: "864px" });
    const frame = await page.locator("#caseFieldMap").evaluate((el) => el.getBoundingClientRect());
    expect(frame.width, "the hall is wider than the viewport it is drawn in").toBeLessThan(1056);
    expect(frame.height, "and taller than it too").toBeLessThan(864);
    const camOnEntry = await cameraAt(page);

    // Four records in here, all carried by people, so none of them draws a world marker: the star
    // rides on the NPC's own button. None of the other three is visible on this surface.
    await expect(page.locator(".npc-source-badge")).toHaveCount(4);
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    // The checklist is the other way round on every surface: seven, wherever you are standing. It is
    // what tells a player there is anything behind a door at all.
    await expect(page.locator(".field-tracker li")).toHaveCount(7);

    // **The first rail is a wall, and this is the assertion the room exists for.** The player spawns
    // at (11, 15.1) and the southern rail's ground-contact row is 11, so walking straight north from
    // the door has to stop with the feet still south of it. Held rather than tapped, and long enough
    // to cross four rows twice over.
    await holdKey(page, "ArrowUp", 2500);
    const stopped = await playerAt(page);
    expect(stopped.y, "the rail stops a player who walks straight in").toBeGreaterThan(11.4);
    expect(stopped.x, "and does not push them sideways doing it").toBeCloseTo(11.0, 0);

    // The surgeon is at the head of the line, before either rail, and is reachable without going
    // anywhere — because that is the order a person met the building in.
    const bubble = page.locator(".field-speech-bubble");
    expect(
      await walkTo(page, '[data-npc="port-line-surgeon"]', "caseFieldPlayer"),
      "the surgeon is reachable from the doorway"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("Six seconds");
    await expect(bubble.locator('[data-action="start-source-activity"]')).toContainText(
      "Medical inspection card"
    );
    await page.keyboard.press("e");
    await expect(bubble).toHaveCount(0);

    // Now the switchback. East to the first gate at cols 19-20, north through it, west the length of
    // the room to the second gate at cols 1-2, north through that, and only then the desks. If a
    // later edit closes either pair of columns this walk stops dead and the hall becomes three rooms.
    expect(await nudgeTo(page, 19.8, "ArrowRight"), "east to the first gate").toBe(true);
    expect(await nudgeTo(page, 9.5, "ArrowUp"), "north through it, into the second pen").toBe(true);
    expect(await nudgeTo(page, 1.6, "ArrowLeft"), "west the length of the second pen").toBe(true);
    expect(await nudgeTo(page, 5.4, "ArrowUp"), "north through the second gate").toBe(true);
    const behind = await playerAt(page);
    expect(behind.y, "which means ending up north of both rails").toBeLessThan(6.5);

    // And the camera came with them on both axes, which is the branch every other interior misses:
    // a room smaller than the frame is centred at a constant, and this one is not.
    const camAtDesks = await cameraAt(page);
    expect(camAtDesks.x, "a room wider than the frame scrolls horizontally").not.toBeCloseTo(
      camOnEntry.x,
      0
    );
    expect(camAtDesks.y, "and taller than the frame, vertically").not.toBeCloseTo(camOnEntry.y, 0);

    // The matron was passed in the middle pen; the inspector is at the first desk.
    expect(
      await walkTo(page, '[data-npc="port-immigrant-inspector"]', "caseFieldPlayer"),
      "the inspector is reachable once both rails are behind you"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("Twenty-nine questions");
    await expect(bubble.locator('[data-action="start-source-activity"]')).toContainText(
      "Manifest sheet 14"
    );
    await page.keyboard.press("e");
    await expect(bubble).toHaveCount(0);

    // The interpreter works the same line five tiles east — comfortably outside the 1.45-tile reach,
    // so the nearest-wins sort cannot hand a player one when they walked to the other.
    expect(
      await walkTo(page, '[data-npc="port-interpreter"]', "caseFieldPlayer"),
      "the interpreter is a separate walk, not the same one"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("no uniform, no badge");
    await page.keyboard.press("e");

    // Out through the threshold, back onto the forecourt where the save said they were standing —
    // and back down the switchback, because a rail is a wall in both directions.
    expect(await nudgeTo(page, 1.6, "ArrowLeft"), "west to the second gate again").toBe(true);
    expect(await nudgeTo(page, 9.5, "ArrowDown"), "south through it").toBe(true);
    expect(await nudgeTo(page, 19.8, "ArrowRight"), "east to the first gate again").toBe(true);
    expect(await nudgeTo(page, 12.6, "ArrowDown"), "south through it").toBe(true);
    expect(
      await walkTo(page, ".field-door--exit", "caseFieldPlayer"),
      "the way out is reachable from the head of the line"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#immigrantPortTiledCanvas")).toBeVisible();
    expect(await roomState(page)).toEqual({ room: null, back: null });
    await expect(page.locator(".recall-beacon")).toHaveCount(1);
    await expect(page.locator(".field-door")).toHaveCount(2);
    // Outdoors the guard runs the other way: both wharf records are carried by people too, so the
    // map shows two badges and no world markers, and none of the five behind doors appears.
    await expect(page.locator(".npc-source-badge")).toHaveCount(2);
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    const outside = await playerAt(page);
    expect(outside.x).toBeCloseTo(26.0, 1);
    expect(outside.y).toBeCloseTo(5.0, 1);

    // And straight back in from the doorstep. Both door cells were kept clear of the outdoor cast a
    // slice before either room existed, which is the rule that has shipped broken three times.
    await expect(
      page.locator('.field-door[data-interior="immigrant-port-inspection-hall"]')
    ).toHaveClass(/is-near/);
    await expect(
      page.locator('.field-door[data-interior="immigrant-port-inquiry-room"]')
    ).not.toHaveClass(/is-near/);
    await page.keyboard.press("e");
    await expect(page.locator("#immigrantPortInspectionHallTiledCanvas")).toBeVisible();
    expect((await roomState(page)).room).toBe("immigrant-port-inspection-hall");
  });

  test("the board of special inquiry: a table with nobody at it, and a locked minute", async ({
    page,
  }) => {
    test.setTimeout(150_000);
    // On the forecourt, one tile south of the inquiry wing doorstep at (38, 4) — twelve bays east of
    // the main doors, which is far enough that the nearest-wins sort has to pick correctly.
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "immigrant-port-inquiry-room",
      fieldReturn: { x: 38.0, y: 5.0, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#immigrantPortInquiryRoomTiledCanvas")).toBeVisible();

    // Two people, and the three inspectors this room is named for are deliberately not among them:
    // a hearing that fits in a name pill is a hearing a player thinks they have met.
    const inside = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((node) => node.dataset.npc).sort()
    );
    expect(inside).toEqual(["port-board-clerk", "port-detained-woman"]);

    // 16x14 at 48px is 768x672 — narrower than the field frame, so updateFieldPlayer() centres it.
    // The hall next door is bigger than the frame on both axes and this one is not, which is most of
    // what the two rooms have to say to each other.
    const worldSize = await page.locator("#caribbeanWorld").evaluate((el) => ({
      width: el.style.width,
      height: el.style.height,
    }));
    expect(worldSize).toEqual({ width: "768px", height: "672px" });
    const frame = await page
      .locator("#caseFieldMap")
      .evaluate((el) => el.getBoundingClientRect().width);
    expect((await cameraAt(page)).x, "a room narrower than the frame is centred in it").toBeCloseTo(
      Math.round((frame - 768) / 2),
      0
    );

    // **The minute is locked, and this is the only cross-surface lock in the game.** It carries
    // `requiresSourceId: "port-ship-manifest-page"`, which is held by the inspector in the hall next
    // door, so the clerk shows no badge at all until it has been secured — and the checklist still
    // lists all seven, because it is a unit checklist rather than a per-room one.
    await expect(page.locator(".npc-source-badge")).toHaveCount(0);
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    await expect(page.locator(".field-tracker li")).toHaveCount(7);

    const bubble = page.locator(".field-speech-bubble");
    expect(
      await walkTo(page, '[data-npc="port-board-clerk"]', "caseFieldPlayer"),
      "the clerk is reachable from the doorway"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("this minute is the hearing");
    await expect(
      bubble.locator(".field-speech-bubble__record"),
      "and offers nothing to examine while the manifest is still in the other room"
    ).toHaveCount(0);
    await page.keyboard.press("e");
    await expect(bubble).toHaveCount(0);

    // The woman it is being decided about is on the carpet in front of the empty table, six tiles
    // west. She speaks for herself, which is the register rule this unit is under the most pressure
    // from and the reason this room has a second person in it at all.
    expect(
      await walkTo(page, '[data-npc="port-detained-woman"]', "caseFieldPlayer"),
      "she is a separate walk across the room, which is the room"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("likely to become a public charge");
    await expect(bubble).toContainText("the form only takes the two");
    await page.keyboard.press("e");

    // Secure the manifest by hand and the same clerk now carries a visible record. This is the lock
    // opening across two surfaces, which is what the content means by putting the hearing after the
    // sheet it is a hearing about.
    await page.evaluate(() => {
      const key = "republic-builder.chronicle.unit-01.v2";
      const saved = JSON.parse(window.localStorage.getItem(key));
      saved.caseEvidence = {
        ...(saved.caseEvidence || {}),
        "case-019": ["port-ship-manifest-page"],
      };
      window.localStorage.setItem(key, JSON.stringify(saved));
    });
    await reloadIntoSave(page);
    await expect(page.locator("#immigrantPortInquiryRoomTiledCanvas")).toBeVisible();
    await expect(page.locator(".npc-source-badge")).toHaveCount(1);
    expect(
      await walkTo(page, '[data-npc="port-board-clerk"]', "caseFieldPlayer"),
      "back to the clerk with the manifest in hand"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(bubble.locator('[data-action="start-source-activity"]')).toContainText(
      "Minute of a hearing"
    );
    await page.keyboard.press("e");

    // Out, and back in — and the reception hall's door twelve bays west stays shut, because a
    // doorstep answers only for its own building.
    expect(
      await walkTo(page, ".field-door--exit", "caseFieldPlayer"),
      "the way out is reachable from the clerk's side"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#immigrantPortTiledCanvas")).toBeVisible();
    await expect(
      page.locator('.field-door[data-interior="immigrant-port-inquiry-room"]')
    ).toHaveClass(/is-near/);
    await expect(
      page.locator('.field-door[data-interior="immigrant-port-inspection-hall"]')
    ).not.toHaveClass(/is-near/);
    await page.keyboard.press("e");
    expect((await roomState(page)).room).toBe("immigrant-port-inquiry-room");
  });
});
