import { test, expect } from "@playwright/test";
import {
  seedProgress,
  loadSeededSave,
  readProgress,
  walkTo,
  holdKey,
} from "./helpers/progress-seed.js";

// Cottonwood Junction's two rooms, banked the way Phase 8 banked Richmond's and Phase 5 banked
// Canal Crossroads'. `field-interiors.spec.js` already proves the mechanism — entry, exit,
// `fieldReturn`, the proximity gate, reload-inside-a-room, per-room grids — and this file does not
// repeat it. What it covers is what is specific to these two:
//
//   a counter that is really a wall     The land office is the first interior in the game with a
//                                       barrier across the middle of it, and the whole design of the
//                                       room is that a player who walks in is stopped by it and has
//                                       to go round to the clerks' gate at the east end. That claim
//                                       is one unstamped pair of columns wide, and nothing else in
//                                       the suite would notice if a later edit closed it.
//   two doorsteps that used to be shut  Elias Fenn and Rufus Ply stood on their own thresholds until
//                                       Phase 86 — 0.4 and 0.5 tiles from the door cells their own
//                                       buildings put there — and a door competes for the same
//                                       1.45-tile reach a person does, so both rooms were
//                                       unreachable from every approach. Neither marker being
//                                       occluded again is worth a test.
//   seven records, three surfaces       This is the largest record set in the game and the second
//                                       case to spread one across an outdoor map and two interiors.
//                                       The per-surface guard in fieldSourceSignal() has to keep the
//                                       five outdoor ones out of the rooms and the two indoor ones
//                                       off the street, while the checklist lists all seven from
//                                       anywhere.
//
// Each test starts inside its room and walks out, for the reason field-interiors.spec.js documents
// at length — reaching either door from the spawn on the street apron means crossing the grade and
// the length of Front Street, which is a long walk to prove nothing extra. Since Phase 94 the walker
// can make it; this file simply does not have to, and the coordinates it used to steer through the
// two counter gates are gone with it.

const BASE_SEED = {
  currentScreen: "field",
  activeCaseId: "case-016",
  unlocked: ["case-001", "case-016"],
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

test.describe("Cottonwood Junction interiors", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("the land office: a counter with one gate in it, and the receipt behind it", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    // On Front Street, one tile south of the land office doorstep at (19, 12).
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "railhead-land-office",
      fieldReturn: { x: 19.0, y: 13.0, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#railheadLandOfficeTiledCanvas")).toBeVisible();

    // Inside: the room's own two people, its own threshold, and no Recall beacon — recalling to the
    // Archive from inside a building would strand `fieldReturn` in a room nobody is standing in.
    await expect(page.locator(".field-door--exit")).toHaveCount(1);
    await expect(page.locator(".recall-beacon")).toHaveCount(0);
    const inside = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((node) => node.dataset.npc).sort()
    );
    expect(inside).toEqual(["land-buyer-agent", "land-office-register"]);

    // 18x14 at 48px is 864x672 — the same size as Richmond's counting room, and a leased ground-floor
    // office on a two-year-old street was not a large room.
    const worldSize = await page.locator("#caribbeanWorld").evaluate((el) => ({
      width: el.style.width,
      height: el.style.height,
    }));
    expect(worldSize).toEqual({ width: "864px", height: "672px" });

    // One record in here, on the register, and none of the five out in the town.
    await expect(page.locator(".npc-source-badge")).toHaveCount(1);
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    // The checklist is the other way round on every surface: seven, wherever you are standing. It is
    // what tells a player there is anything behind a door at all.
    await expect(page.locator(".field-tracker li")).toHaveCount(7);

    // **The counter is a wall, and this is the assertion the room exists for.** The player spawns at
    // (9, 11.1) and the counter's ground-contact row is 7, so walking straight north from the door
    // has to stop with the feet still south of it. Held rather than tapped, and long enough to cross
    // four rows twice over.
    await holdKey(page, "ArrowUp", 2500);
    const stopped = await playerAt(page);
    expect(stopped.y, "the counter stops a player who walks straight in").toBeGreaterThan(7.5);
    expect(stopped.x, "and does not push them sideways doing it").toBeCloseTo(9.0, 0);

    // The man on the public side of it is reachable without going anywhere. He is the first thing
    // the room says, which is why he stands square in the walk from the door to the counter.
    expect(
      await walkTo(page, '[data-npc="land-buyer-agent"]', "caseFieldPlayer"),
      "the buyer is reachable from the doorway"
    ).toBe(true);
    const bubble = page.locator(".field-speech-bubble");
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("Eleven quarters this week");
    await expect(bubble).toContainText("eleven tracts on eleven separate slips");
    await page.keyboard.press("e");
    await expect(bubble).toHaveCount(0);

    // And the register is reachable only by going round. The gate at cols 11-12 is the one join
    // between the two halves of this room, and this walk is what asserts it: since Phase 94 walkTo()
    // breadth-firsts the room's real collision, so it finds the gap by itself and returns false if a
    // later edit closes it. The three hand-measured coordinates this used to steer through said the
    // same thing and had to be re-measured every time the counter moved.
    expect(
      await walkTo(page, '[data-npc="land-office-register"]', "caseFieldPlayer"),
      "the register is reachable once the counter is behind you"
    ).toBe(true);
    const behind = await playerAt(page);
    expect(behind.y, "which means ending up north of the counter").toBeLessThan(7.0);
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("I have never once been asked to decide anything");
    await expect(bubble.locator('[data-action="start-source-activity"]')).toContainText(
      "Receiver's receipt"
    );
    await page.keyboard.press("e");

    // Out through the threshold, back onto Front Street where the save said they were standing —
    // and back through the same gate, because a counter is a wall in both directions.
    expect(
      await walkTo(page, ".field-door--exit", "caseFieldPlayer"),
      "the way out is reachable from the public side"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#railheadTiledCanvas")).toBeVisible();
    expect(await roomState(page)).toEqual({ room: null, back: null });
    await expect(page.locator(".recall-beacon")).toHaveCount(1);
    await expect(page.locator(".field-door")).toHaveCount(2);
    // Outdoors the guard runs the other way: the town shows only the record with a world marker of
    // its own — the Clarion pasted in the newspaper's window — and neither of the two behind doors.
    await expect(page.locator(".source-signal--world")).toHaveCount(1);
    await expect(
      page.locator('.source-signal--world[data-source="railhead-town-paper"]')
    ).toHaveCount(1);
    const outside = await playerAt(page);
    expect(outside.x).toBeCloseTo(19.0, 1);
    expect(outside.y).toBeCloseTo(13.0, 1);

    // And straight back in from the doorstep — which is the whole of what was broken before this
    // phase, because the register was standing on this cell.
    await expect(page.locator('.field-door[data-interior="railhead-land-office"]')).toHaveClass(
      /is-near/
    );
    await page.keyboard.press("e");
    await expect(page.locator("#railheadLandOfficeTiledCanvas")).toBeVisible();
    expect((await roomState(page)).room).toBe("railhead-land-office");
  });

  test("the telegraph office: the smallest room in the game, and the price in it", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    // On Front Street, one tile south of the telegraph office doorstep at (23, 12) — four tiles east
    // of the land office's, which is close enough that the nearest-wins sort has to pick correctly.
    await seedProgress(page, {
      ...BASE_SEED,
      currentFieldRoom: "railhead-telegraph-office",
      fieldReturn: { x: 23.0, y: 13.0, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#railheadTelegraphOfficeTiledCanvas")).toBeVisible();

    const inside = await page.evaluate(() =>
      [...document.querySelectorAll("[data-npc]")].map((node) => node.dataset.npc).sort()
    );
    expect(inside).toEqual(["stock-commission-man", "telegraph-operator"]);

    // 16x14 at 48px is 768x672 — the smallest interior in the game, narrower than the field frame,
    // so updateFieldPlayer() centres it rather than pinning it to a corner.
    const worldSize = await page.locator("#caribbeanWorld").evaluate((el) => ({
      width: el.style.width,
      height: el.style.height,
    }));
    expect(worldSize).toEqual({ width: "768px", height: "672px" });
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
      .toBeCloseTo(Math.round((viewportWidth - 768) / 2), 0);

    await expect(page.locator(".npc-source-badge")).toHaveCount(1);
    await expect(page.locator(".source-signal--world")).toHaveCount(0);
    await expect(page.locator(".field-tracker li")).toHaveCount(7);

    // The commission man is on the public side, at the message window. He is the other half of the
    // drover standing in the pens on the far side of the line: the same cattle, valued twice, and
    // the number gets here by wire before the herd is counted.
    const bubble = page.locator(".field-speech-bubble");
    expect(
      await walkTo(page, '[data-npc="stock-commission-man"]', "caseFieldPlayer"),
      "the commission man is reachable from the doorway"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("I buy on the morning quotation");
    await expect(bubble).toContainText("before he had his herd counted");
    await page.keyboard.press("e");
    await expect(bubble).toHaveCount(0);

    // The operator is behind the rail, reachable through the gate east of the message window —
    // which this room puts one step from its own door, where the land office puts it at the far end.
    // The two rooms are not doing the same thing to the people in them and the gate is where that
    // is said.
    expect(
      await walkTo(page, '[data-npc="telegraph-operator"]', "caseFieldPlayer"),
      "the operator is reachable once the rail is behind you"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(bubble).toBeVisible();
    await expect(bubble).toContainText("once on the ground and once on the wire");
    await expect(bubble.locator('[data-action="start-source-activity"]')).toContainText(
      "Messages sent, 4 June"
    );
    await page.keyboard.press("e");

    // Out, and back in — and the door four tiles west stays shut, because a doorstep answers only
    // for its own building.
    expect(
      await walkTo(page, ".field-door--exit", "caseFieldPlayer"),
      "the way out is reachable from the public side"
    ).toBe(true);
    await page.keyboard.press("e");
    await expect(page.locator("#railheadTiledCanvas")).toBeVisible();
    await expect(
      page.locator('.field-door[data-interior="railhead-telegraph-office"]')
    ).toHaveClass(/is-near/);
    await expect(page.locator('.field-door[data-interior="railhead-land-office"]')).not.toHaveClass(
      /is-near/
    );
    await page.keyboard.press("e");
    expect((await roomState(page)).room).toBe("railhead-telegraph-office");
  });
});
