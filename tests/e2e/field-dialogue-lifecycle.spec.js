import { test, expect } from "@playwright/test";
import {
  seedProgress,
  loadSeededSave,
  holdKey,
  walkTo,
  walkToNpc,
} from "./helpers/progress-seed.js";

// Spine Review Part 6B — the field's mission surface. Three findings, all of them about a control
// that changed state without the screen agreeing, and none reachable from the existing specs:
// field-movement-dialogue.spec.js covers opening a bubble, the close button and click-away, but
// never walks away from one; and nothing in the suite had ever clicked the recall beacon from a
// distance, because until Part 6B there was no distance at which it behaved differently.
//
// All three confirmed failing against b856660 before being kept.

const CARIBBEAN = {
  currentScreen: "field",
  activeCaseId: "case-001",
  tutorial: { step: "complete", completed: true, skipped: false },
};

test.describe("Field mission surface — dialogue, notice, beacon (Part 6B)", () => {
  test("walking away from a speaker closes the bubble, in the DOM and in the save (finding 1)", async ({
    page,
  }) => {
    await seedProgress(page, CARIBBEAN);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    expect(await walkToNpc(page, "taino-elder")).toBe(true);
    await page.locator('[data-npc="taino-elder"]').click();
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    // The record offer is the part that mattered: a stale bubble kept offering it.
    await expect(
      page.locator('.field-speech-bubble [data-action="start-source-activity"]')
    ).toBeVisible();

    await holdKey(page, "ArrowDown", 900);

    // The bubble used to survive this. runFieldMovementLoop() cleared progress.activeFieldNpc and
    // never rendered, so the markup it had produced stayed on screen — visible, and with its
    // "Examine …" button still live — until some unrelated action happened to re-render.
    await expect(bubble).toHaveCount(0);

    // And the clear has to reach the store, or a reload reopens a conversation the player left.
    const saved = await page.evaluate(
      () =>
        JSON.parse(window.localStorage.getItem("republic-builder.chronicle.unit-01.v2"))
          .activeFieldNpc
    );
    expect(saved).toBeFalsy();
  });

  test("an interaction that lands clears the 'move closer' line left by one that missed (finding 2)", async ({
    page,
  }) => {
    await seedProgress(page, CARIBBEAN);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // Miss: the canoe worker is ~13.7 tiles from the spawn. dispatchEvent for the reason
    // field-movement-dialogue.spec.js documents — he is outside the camera's view of the spawn.
    await page.locator('[data-npc="taino-fisher"]').dispatchEvent("click");
    await expect(page.locator("#fieldNotice")).toContainText("Move closer");

    // Land: walk to a different NPC entirely and open her dialogue. The notice named the person
    // the player just failed to reach and outlived the walk, the conversation, and every record
    // read after it — the field's only status line, contradicting the field.
    expect(await walkToNpc(page, "taino-elder")).toBe(true);
    await page.locator('[data-npc="taino-elder"]').click();
    await expect(page.locator(".field-speech-bubble")).toBeVisible();
    await expect(page.locator("#fieldNotice")).toBeHidden();
  });

  test("the recall beacon refuses from across the map and accepts from beside it (finding 3)", async ({
    page,
  }) => {
    await seedProgress(page, CARIBBEAN);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // The Caribbean spawn is 6.3 tiles from its beacon. This used to warp.
    const beacon = page.locator(".recall-beacon");
    await expect(beacon).not.toHaveClass(/is-near/);
    await beacon.dispatchEvent("click");
    await expect(page.locator("#fieldNotice")).toContainText("Move closer");
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // Walking to it lights it and it works — walkTo() steers until the game's own `.is-near`
    // appears, so this is only walkable at all because the beacon reports its reach now. A gate
    // with no visible state would read as a dead button, which is why it got one.
    expect(await walkTo(page, ".recall-beacon", "caseFieldPlayer")).toBe(true);
    await beacon.dispatchEvent("click");
    await expect(page.locator("[data-warp-phase]")).toBeVisible();
  });

  test("the chrome back link is not gated — it has no position in the world (finding 3)", async ({
    page,
  }) => {
    await seedProgress(page, CARIBBEAN);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // The back link carries "field-recall" too, which is why the gate scopes to `.recall-beacon`
    // rather than to the action. Gating the action itself would strand a player in a corner with
    // no way off the map, and this is the assertion that says so.
    await page.locator('.field-intro [data-action="field-recall"]').click();
    await expect(page.locator("[data-warp-phase]")).toBeVisible();
  });
});
