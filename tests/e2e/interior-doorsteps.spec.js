import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave, readProgress, walkTo } from "./helpers/progress-seed.js";

/**
 * **Every room in the game can be walked into from outside, and walked back out of.**
 *
 * There are ten field interiors — two apiece on Units 4 through 8 — and until now the outdoor side
 * of eight of those doors was covered by nothing at all. CLAUDE.md's field-interior invariant says
 * so in as many words: _"Only `tests/e2e/suburb-interiors.spec.js` walks to a door from the street;
 * every other interior's doorstep is still unguarded, so check a new one by hand."_ This is that
 * check, banked for all ten rather than two.
 *
 * **Why nothing else covers it.** `field-map-coordinates.test.js` flood-fills each room from its
 * own entry cell, which asks whether the inside is connected and never looks at the outdoor side of
 * the door. The visual-regression shots enter a room by setting `currentFieldRoom` directly, so
 * they never cross a doorstep. `port-interiors.spec.js` and its siblings deliberately start the
 * player *inside* the room — sound reasoning (crossing a whole wharf proves nothing extra) that
 * nonetheless leaves exactly this hole, and Phase 98 fell into it twice on one map: a door row
 * copied by hand from a generator constant instead of read off the generated `*_DOORS` export, and
 * a street tree stamped across a door cell.
 *
 * **Three questions, in the order a player meets them.**
 *
 * 1. _Can I get to the door?_ `walkTo` breadth-first routes through the map's real collision, so a
 *    doorstep covered by furniture or a stationed body fails the walk outright.
 * 2. _Will `E` give me the door?_ This is the one the flood fill cannot ask. Doors sort into
 *    `nearestFieldInteraction()`'s nearest-wins list at the same 1.45-tile reach as a person, so a
 *    body or a record parked beside a doorstep does not block the walk — it silently wins the
 *    keypress, and the door reads as broken. `__chronicleReach()` returns the game's own answer to
 *    "what would `E` open right now", and the failure message names what took it.
 * 3. _Can I get back out?_ A room you can enter but not leave is a soft-lock. The exit door sits at
 *    `room.exit` and competes for reach the same way, against that room's own cast and records.
 *
 * Each test seeds its own page, so `seedProgress` writes once per page and there is no risk of the
 * loop measuring one seed ten times — the failure `0126` is about.
 *
 * **What was watched failing, and what would not fail.** Question 2 is the one that does the work.
 * Stationing Emery Voss on the Land office doorstep (Unit 6) produces
 * _"standing on the Land office doorstep, E would open npc "Emery Voss" at 1.03 tiles instead of
 * the door"_ — the walk still succeeds, the player still arrives, and the keypress silently goes to
 * the person. That is the "half-broken that ships" shape: the door works from some angles and not
 * from the one you naturally approach on.
 *
 * Question 1 could **not** be broken on this map, and that is recorded rather than contrived
 * around. Two attempts: moving the door into the middle of its own building footprint, and posting
 * a body directly on the door cell. Both still passed, because the reach is 1.45 tiles and these
 * doors sit on small buildings on open streets — a 2×2 building's centre is within reach of the
 * street, and a body on the door cell still leaves an approach beside it. So the walk assertion is
 * a real check on a route that does not exist at all, not a sensitive one; it is worth keeping (it
 * is what catches a doorstep genuinely walled off) but it is not what makes this file useful.
 *
 * **One trap for anyone perturbing these maps to test something.** A stationed NPC's position comes
 * from the unit's `*_NPC_BEHAVIOURS` table, not from the `x`/`y` on its entry in the `*_FIELD_NPCS`
 * table — editing the latter moves nobody, and `__chronicleCast()` will happily report the
 * behaviour's coordinate back at you while the source you edited says something else.
 */

const BASE_SEED = {
  currentScreen: "field",
  tutorial: { step: "complete", completed: true, skipped: false },
};

/** The ten interiors, read off `FIELD_MAPS[unit].interiors` and its `door.label`. */
const INTERIORS = [
  { unit: "unit-04", caseId: "case-010", id: "canal-print-shop", label: "Printing office" },
  { unit: "unit-04", caseId: "case-010", id: "canal-boarding-house", label: "Boardinghouse" },
  { unit: "unit-05", caseId: "case-013", id: "richmond-counting-room", label: "Counting room" },
  { unit: "unit-05", caseId: "case-013", id: "richmond-hospital-ward", label: "Chimborazo ward" },
  { unit: "unit-06", caseId: "case-016", id: "railhead-land-office", label: "Land office" },
  {
    unit: "unit-06",
    caseId: "case-016",
    id: "railhead-telegraph-office",
    label: "Telegraph office",
  },
  {
    unit: "unit-07",
    caseId: "case-019",
    id: "immigrant-port-inspection-hall",
    label: "Reception hall",
  },
  {
    unit: "unit-07",
    caseId: "case-019",
    id: "immigrant-port-inquiry-room",
    label: "Board of special inquiry",
  },
  { unit: "unit-08", caseId: "case-022", id: "fairmeadow-model-house", label: "Model house" },
  {
    unit: "unit-08",
    caseId: "case-022",
    id: "fairmeadow-building-and-loan",
    label: "Building & loan association",
  },
];

/** What the game itself says `E` would open from where the player is standing. */
const reachNow = (page) => page.evaluate(() => window.__chronicleReach() ?? null);

const describeReach = (reach) =>
  reach
    ? `${reach.type} "${reach.label}" at ${Number(reach.distance).toFixed(2)} tiles`
    : "nothing at all";

test.describe("Interior doorsteps", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  for (const { unit, caseId, id, label } of INTERIORS) {
    test(`${unit} · ${label}: reachable from outside, and crossable both ways`, async ({
      page,
    }) => {
      test.setTimeout(240_000);
      await seedProgress(page, {
        ...BASE_SEED,
        activeCaseId: caseId,
        unlocked: ["case-001", caseId],
      });
      await loadSeededSave(page);
      await expect(page.locator("#caseFieldPlayer")).toBeVisible();

      const doorSelector = `.field-door[data-interior="${id}"]`;
      await expect(
        page.locator(doorSelector),
        `${unit} draws exactly one door for ${id}`
      ).toHaveCount(1);

      // 1. The doorstep is standable.
      expect(
        await walkTo(page, doorSelector, "caseFieldPlayer"),
        `the walker never reached the ${label} doorstep on ${unit}. It breadth-first routes through ` +
          `the map's real collision, so this fails when the cell in front of the door is covered — ` +
          `by furniture stamped over it, or by a body stationed on it.`
      ).toBe(true);

      // 2. And `E` gives you the door rather than whatever is standing next to it.
      const atDoor = await reachNow(page);
      expect(
        atDoor && `${atDoor.type}:${atDoor.id}`,
        `standing on the ${label} doorstep, E would open ${describeReach(atDoor)} instead of the ` +
          `door. Doors sort into nearestFieldInteraction()'s nearest-wins list at the same reach ` +
          `as a person, so something posted beside this doorstep takes the keypress and the door ` +
          `reads as broken. Post it two and a half tiles clear.`
      ).toBe(`door:${id}`);

      // 3. Crossing it actually puts the player in the room.
      await page.keyboard.press("e");
      await expect
        .poll(async () => (await readProgress(page)).currentFieldRoom ?? null, {
          message: `pressing E on the ${label} doorstep did not open the room`,
          timeout: 10_000,
        })
        .toBe(id);

      // 4. And the way back out is reachable from inside — a room you can enter but not leave is a
      //    soft-lock, and the exit competes for reach against this room's own cast and records.
      expect(
        await walkTo(page, ".field-door--exit", "caseFieldPlayer"),
        `inside the ${label}, the walker never reached the way out`
      ).toBe(true);
      const atExit = await reachNow(page);
      expect(
        atExit && atExit.type,
        `standing at the ${label}'s exit, E would open ${describeReach(atExit)} instead of the way out`
      ).toBe("exit");
      await page.keyboard.press("e");
      await expect
        .poll(async () => (await readProgress(page)).currentFieldRoom ?? null, {
          message: `pressing E at the ${label}'s exit did not put the player back outside`,
          timeout: 10_000,
        })
        .toBeNull();
    });
  }
});
