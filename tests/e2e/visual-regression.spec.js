import { test, expect } from "@playwright/test";
import {
  PROGRESS_KEY,
  seedProgress,
  loadSeededSave,
  walkTo,
  walkToNpc,
} from "./helpers/progress-seed.js";

// Phase 45A: the visual-regression net that makes the rest of Phase 45 (and the CSS
// consolidation/token work in 45B-45E, plus Phases 47-48's animation/hub-camera work) safe to
// attempt at all — see docs/architecture/UI-DESIGN-SYSTEM.md and the Phase 44 decision to
// explicitly exclude every gameplay CSS family (.field-*, .hub-*, .quest-*, .map-*, .director-*)
// from that pass "because there was no visual-regression coverage to make a restyle safe."
//
// Every screenshot here is a BASELINE, not a behavior assertion — this file has almost no
// `expect(locator)` calls beyond visibility gates, just `expect(page).toHaveScreenshot()`. First
// run creates the baseline PNGs under visual-regression.spec.js-snapshots/ (commit them);
// subsequent runs diff against them. Regenerate deliberately with
// `npx playwright test visual-regression --update-snapshots` after an intentional visual
// change, and review the diff before committing new baselines.
//
// Determinism notes (read before adding more screenshots to this file):
// - `page.emulateMedia({ reducedMotion: "reduce" })` is set on every test. main.js's own
//   prefersReducedMotion() checks (drifting ambient-phrase layer, the Entrance Hall's doorway
//   flicker) key off this, and Playwright's default `animations: "disabled"` on toHaveScreenshot
//   freezes CSS transitions/animations at their end state regardless.
// - `#directorArchiveClock` (main.js:5478) is a live elapsed-time readout on the three director
//   intro scenes, driven by `setInterval`, not CSS — it survives `animations: "disabled"` and
//   must be masked explicitly.
// - Mini-game "playing" states (Storm Navigation, Cargo Sorting) tick via requestAnimationFrame
//   with randomized hazard/card placement, not CSS — deliberately NOT screenshotted here beyond
//   the static mini-game *select* screen. Covering the in-progress states would need either a
//   frozen/seeded RNG or full-stage masking, neither of which exists yet; flagged as a gap, not
//   silently skipped.
// - The Entrance Hall's escort walk (two characters moving on a requestAnimationFrame loop) and
//   the Institute badge-case modal (reached by walking to the Preservation Case, HUB_TARGETS.trophy
//   at (1.7, 1.0) from the default (7, 9) spawn, crossing several HUB_BLOCK_RECTS) are out of this
//   pass's bounded scope — same reason, flagged as follow-up, not silently dropped. The Entrance
//   Hall's *static* state is covered below; hallway-onboarding.spec.js covers the walk behaviourally.
//
// Jumping between screens mid-test: `seedProgress()` (via addInitScript) only ever writes if
// the key is still empty — correct for save-persistence.spec.js's reload-survives-real-writes
// check, but useless for re-pointing the save at a *different* screen mid-test. `setScreen()`
// below writes localStorage directly (page.evaluate, not addInitScript) and re-does the
// Student -> Load Save landing click reload always requires (main.js's `showMainMenu` is a
// runtime-only variable that resets to true on every full navigation — see
// save-persistence.spec.js's own comment on this).
async function setScreen(page, overrides) {
  await page.evaluate(({ key, data }) => window.localStorage.setItem(key, JSON.stringify(data)), {
    key: PROGRESS_KEY,
    data: overrides,
  });
  await page.reload();
  await page.getByRole("button", { name: "Student" }).click();
  await page.getByRole("button", { name: "Load Save" }).click();
}

function snap(name, extra = {}) {
  return { animations: "disabled", ...extra, name: `${name}.png` };
}

// Riverbend's interview with all eight accounts taken — one useful answer from each of the eight
// people, which is what `requires.useful: 8` asks for. Used by two tests below: it is what makes the
// charter's record openable, and what fills the notebook the interview screen is baselined on.
const RIVERBEND_ACCOUNTS = {
  "settlement-minister": ["land"],
  "settlement-burgess": ["voice"],
  "wharf-clerk": ["passage"],
  "indentured-servant": ["owed"],
  "angolan-laborer": ["owed"],
  "settlement-goodwife": ["voice"],
  "powhatan-man": ["land"],
  "powhatan-woman": ["voice"],
};

// Tiled maps (Caribbean field, Archive Room, Riverbend, hallway, Common Cause) draw via
// engine/tiled-map-loader.js's renderTiledMap(), which is async (it awaits image decode before
// the first ctx.drawImage) — its main.js wrapper (e.g. renderCaribbeanTiledMap()) marks
// `canvas.dataset.rendered = "true"` only once that first real draw completes. A screenshot
// taken before that lands on a blank canvas — not a rendering bug, a test-timing race — so wait
// for the flag rather than trusting the canvas element's mere presence in the DOM.
async function waitForTiledCanvas(page, canvasId) {
  await page.waitForFunction(
    (id) => document.getElementById(id)?.dataset.rendered === "true",
    canvasId
  );
}

// 1366x768 (Phase 45E) — the project's own named target hardware ("Chromebook 1366x768 is the
// target case"), not Playwright's arbitrary 1280x720 device default. Phase 45E found and fixed
// a real bug at this exact resolution (the Institute Main Hall and the field's Evidence Channel
// both silently clipped real content past the right edge with no scrollbar); testing at the
// actual target width going forward is what would have caught it originally.
test.use({ viewport: { width: 1366, height: 768 } });

test.describe("Gameplay visual-regression baselines", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("onboarding: director welcome scene + identity screen", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Student" }).click();
    await page.getByRole("button", { name: "Start New Game" }).click();

    const dialogueBox = page.locator(".director-dialogue-box");
    await expect(dialogueBox).toBeVisible();
    // First frame of the shared director-scene shell (intro-welcome). Reduced motion means the
    // typewriter has already resolved to its full first line — deterministic without a wait.
    await expect(page).toHaveScreenshot(
      snap("director-welcome-scene", { mask: [page.locator("#directorArchiveClock")] })
    );

    const nameInput = page.locator('input[data-profile="name"]');
    for (let i = 0; i < 40; i += 1) {
      if (await nameInput.isVisible().catch(() => false)) break;
      if (!(await dialogueBox.isVisible().catch(() => false))) break;
      await dialogueBox.click();
      await page.waitForTimeout(30);
    }
    await expect(nameInput).toBeVisible();
    await expect(page).toHaveScreenshot(snap("identity-screen"));
  });

  test("institute: Main Hall and Archive Room", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "institute",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#instituteMap")).toBeVisible();
    // Hub NPCs patrol on a requestAnimationFrame loop tied to real elapsed time, not CSS — see
    // CLAUDE.md's "NPC movement respects the same collision as the player" invariant. This loop
    // deliberately keeps running regardless of prefers-reduced-motion (only the ambient
    // decorative phrase layer and hallway-walk speed key off that setting), so `.hub-npc`
    // positions/frames are never pixel-stable between two consecutive screenshots.
    // Playwright's `mask` option paints a box over the element's *current* bounding box each
    // screenshot — since the NPC keeps moving, that box lands a few px off between the two
    // stability-check frames and the edges themselves show up as a diff. Hiding via CSS instead
    // removes the element from the render entirely, so there's nothing left to drift.
    //
    // The interaction prompt has to go with them, and for the same reason rather than a new one.
    // Professor Park is a *route* as of Phase 64 — he walks the south aisle between (11.5,9.4) and
    // (18.5,9.4), straight past where this test seeds the player — so "Press E · Professor Julian
    // Park" appears and disappears depending on where in his circuit the screenshot lands. Hiding
    // the sprite does not stop him walking, and this baseline failed on it once in a run where
    // nothing about the hub had changed. What the prompt says when you are next to somebody is
    // asserted properly in hub-movement, boot-onboarding and hallway-onboarding, which put the
    // player in a known place first instead of waiting to see who wanders by.
    await page.addStyleTag({
      content: ".hub-npc, #hubInteractPrompt { visibility: hidden !important; }",
    });
    await expect(page).toHaveScreenshot(snap("institute-main-hall"));

    await setScreen(page, {
      currentScreen: "institute",
      currentHubRoom: "archive",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await expect(page.locator("#archiveRoomMap")).toBeVisible();
    await waitForTiledCanvas(page, "archiveRoomTiledCanvas");
    await expect(page).toHaveScreenshot(snap("institute-archive-room"));

    // The Entrance Hall, seeded at its own spawn with the scene idle — the state the player is in
    // for the second or two before they walk up to the Director. This is the baseline that would
    // catch the room drawing as an empty frame, which is what a tileset sheet missing from
    // resolveHallwayTilesetImage()'s globs produces: createTilesetImageResolver() throws, the
    // canvas never gets its `rendered` flag, and no other assertion in the suite notices.
    await setScreen(page, {
      currentScreen: "institute",
      currentHubRoom: "hallway",
      tutorial: { step: "hallway" },
    });
    await expect(page.locator(".institute-map--hallway")).toBeVisible();
    await waitForTiledCanvas(page, "hallwayTiledCanvas");
    await page.addStyleTag({ content: ".hub-npc { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("institute-entrance-hall"));
  });

  test("archive: Navigation Table and Mini-Games select", async ({ page }) => {
    await seedProgress(page, { currentScreen: "archive" });
    await loadSeededSave(page);
    await expect(page.locator(".atlas-table")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("archive-navigation-table"));

    await setScreen(page, { currentScreen: "mini-games" });
    await expect(page.locator(".mini-game-select")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("mini-games-select"));
  });

  test("travel transition (Case 1.01)", async ({ page }) => {
    await seedProgress(page, { currentScreen: "travel", activeCaseId: "case-001" });
    await loadSeededSave(page);
    await expect(page.locator(".chronotravel-vortex")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("travel-transition"));
  });

  // Phase 68 replaced the three welded activity screens (village-activity, columbus-activity,
  // map-jigsaw) with one host screen and four content-driven engines, so the three baselines this
  // test used to take are now the interview, the audit and the reconstruction.
  test("field: Caribbean, interview, audit, reconstruction", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
    await waitForTiledCanvas(page, "caribbeanTiledCanvas");
    // Same requestAnimationFrame patrol-loop reasoning as institute-main-hall above — field
    // NPCs (`[data-npc]`) are never pixel-stable between two consecutive frames, and masking
    // (vs. hiding) has the same bounding-box-drift problem noted there.
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-caribbean"));

    // Each activity screen resolves its record from progress.activeActivitySourceId, so seeding it
    // alongside the screen id is what opens the right one.
    await setScreen(page, {
      currentScreen: "interview",
      activeCaseId: "case-001",
      activeActivitySourceId: "taino-context",
    });
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-interview"));

    await setScreen(page, {
      currentScreen: "discrepancy",
      activeCaseId: "case-001",
      activeActivitySourceId: "columbus-letter",
    });
    await expect(page.locator(".activity-board--discrepancy")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-discrepancy"));

    await setScreen(page, {
      currentScreen: "assembly",
      activeCaseId: "case-001",
      activeActivitySourceId: "waldseemuller-map",
    });
    await expect(page.locator(".activity-board--assembly")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-assembly"));
  });

  // Banked in Phase 53. The Caribbean was the only field map with a baseline, so the Riverbend and
  // Philadelphia rebuilds — new derived building sheets, terrain drawn in authored blocks, crops
  // moved off the ground layer — had nothing watching them. Every defect that pass fixed (a tree
  // cut down the middle, a barrel sliced at the waist, a square of the wrong ground in the middle
  // of a field) is a pixel difference on exactly these two screens.
  test("field: Riverbend settlement (Unit 2)", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-004",
      unlockedCases: ["case-001", "case-002", "case-003", "case-004"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
    await waitForTiledCanvas(page, "riverbendTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-riverbend"));

    // Riverbend's three missions (Phase 70). Two of the three engines are shared with Case 1.01 and
    // are baselined there already — what these add is the *content's* layout: an eight-row notebook
    // in two panels, a five-claim audit whose record leads with four paragraphs of the letter, and
    // TRACE, whose renderer had shipped for two phases with no content to draw.
    await setScreen(page, {
      currentScreen: "interview",
      activeCaseId: "case-004",
      activeActivitySourceId: "riverbend-charter",
      sourceActivities: {
        "riverbend-charter": {
          state: { asked: RIVERBEND_ACCOUNTS, logged: RIVERBEND_ACCOUNTS, filed: null },
          completed: false,
        },
      },
    });
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-interview-riverbend"));

    await setScreen(page, {
      currentScreen: "discrepancy",
      activeCaseId: "case-004",
      activeActivitySourceId: "riverbend-letter",
      caseEvidence: { "case-004": ["riverbend-charter"] },
      sourceActivities: {
        "riverbend-charter": {
          state: { asked: RIVERBEND_ACCOUNTS, logged: RIVERBEND_ACCOUNTS, filed: "by-the-head" },
          completed: true,
        },
      },
    });
    await expect(page.locator(".activity-board--discrepancy")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-discrepancy-riverbend"));

    await setScreen(page, {
      currentScreen: "trace",
      activeCaseId: "case-004",
      activeActivitySourceId: "riverbend-ledger",
    });
    await expect(page.locator(".activity-board--trace")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-trace"));
  });

  test("field: Philadelphia gathering ground (Unit 3)", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-007",
      unlockedCases: [
        "case-001",
        "case-002",
        "case-003",
        "case-004",
        "case-005",
        "case-006",
        "case-007",
      ],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
    await waitForTiledCanvas(page, "commonCauseTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-common-cause"));
  });

  // Three baselines for Unit 4, because it introduced two things no earlier unit had: a map whose
  // record markers include doorsteps, and interiors. The two rooms are worth a pixel baseline
  // specifically — every other check on them is structural (who is in the room, which grid, does
  // the exit work), and none of it would notice a wall block painted on the wrong layer or a tile
  // whose transparent row draws a hairline through the floor. That defect class is exactly what
  // shipped down the canal bank in Phase 3 and got caught by eye.
  test("field: the Canal Crossroads and both of its rooms (Unit 4)", async ({ page }) => {
    const seed = {
      currentScreen: "field",
      activeCaseId: "case-010",
      unlocked: ["case-001", "case-010"],
      tutorial: { step: "complete", completed: true, skipped: false },
    };
    await seedProgress(page, seed);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
    await waitForTiledCanvas(page, "canalCrossroadsTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-canal-crossroads"));

    // Both interiors, seeded directly — see field-interiors.spec.js for why the rooms are entered
    // by seeding rather than walked into from the towpath. setScreen() replaces the whole save
    // rather than merging into it, so each call carries the full seed.
    await setScreen(page, { ...seed, currentFieldRoom: "canal-print-shop" });
    await waitForTiledCanvas(page, "canalPrintShopTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-canal-print-shop"));

    await setScreen(page, { ...seed, currentFieldRoom: "canal-boarding-house" });
    await waitForTiledCanvas(page, "canalBoardingHouseTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-canal-boarding-house"));
  });

  // Three more for Unit 5, on the same argument. Richmond adds two things Canal Crossroads did not
  // have: a bluff drawn as a solid run of retaining wall, which only a picture will show as a
  // continuous line rather than a dotted one, and a ward 24 tiles wide — the only interior in the
  // game whose floor is wider than the frame it is drawn in, so its baseline is also the only one
  // that proves a horizontally-scrolled room draws to its edges.
  test("field: Richmond and both of its rooms (Unit 5)", async ({ page }) => {
    const seed = {
      currentScreen: "field",
      activeCaseId: "case-013",
      unlocked: ["case-001", "case-013"],
      tutorial: { step: "complete", completed: true, skipped: false },
    };
    await seedProgress(page, seed);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
    await waitForTiledCanvas(page, "richmondTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-richmond"));

    await setScreen(page, { ...seed, currentFieldRoom: "richmond-counting-room" });
    await waitForTiledCanvas(page, "richmondCountingRoomTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-richmond-counting-room"));

    await setScreen(page, { ...seed, currentFieldRoom: "richmond-hospital-ward" });
    await waitForTiledCanvas(page, "richmondHospitalWardTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-richmond-hospital-ward"));
  });

  test("practice check: unanswered and fully-graded states (all 4 quest types)", async ({
    page,
  }) => {
    await seedProgress(page, { currentScreen: "practice-check" });
    await loadSeededSave(page);
    await expect(page.locator(".quest-practice-summary")).toContainText("0/6");
    await expect(page).toHaveScreenshot(snap("practice-check-unanswered"));

    // Same real-graded walkthrough as tests/e2e/practice-check.spec.js, condensed: this file's
    // job is what it looks like once every card is answered, not re-proving the grading logic.
    const mcqAnswers = {
      "case-001-mcq-taino-sourcing": "1",
      "case-001-mcq-columbus-audience": "0",
      "case-001-mcq-waldseemuller-change": "1",
    };
    for (const [questId, answerIndex] of Object.entries(mcqAnswers)) {
      await page
        .locator(`.quest[data-quest-id="${questId}"] input[type="radio"][value="${answerIndex}"]`)
        .check();
    }
    const seqQuest = page.locator('.quest[data-quest-id="case-001-sequencing-columbian-exchange"]');
    const moveUp = (itemId) =>
      seqQuest
        .locator(
          `[data-action="sequence-move"][data-sequence-item="${itemId}"][data-direction="up"]`
        )
        .click();
    await moveUp("taino-society-precontact");
    await moveUp("taino-society-precontact");
    await moveUp("columbus-first-contact-letter");
    await moveUp("columbus-first-contact-letter");
    await moveUp("waldseemuller-map-knowledge");
    await moveUp("waldseemuller-map-knowledge");

    const evidenceQuest = page.locator('.quest[data-quest-id="case-001-evidence-record-sourcing"]');
    await evidenceQuest
      .locator('[data-evidence-select="taino-context"]')
      .selectOption("contextualization");
    await evidenceQuest
      .locator('[data-evidence-select="columbus-letter"]')
      .selectOption("sourcing-situation");
    await evidenceQuest
      .locator('[data-evidence-select="waldseemuller-map"]')
      .selectOption("continuity-and-change");
    const reflection = evidenceQuest.locator(
      '[data-evidence-reflection="case-001-evidence-record-sourcing"]'
    );
    await reflection.fill(
      "Using context, a letter, and a map together builds a stronger argument than any one record alone."
    );
    await reflection.blur();

    const hippQuest = page.locator('.quest[data-quest-id="case-001-hipp-columbus-letter"]');
    await hippQuest
      .locator(
        '[data-hipp-prompt="columbus-audience"] input[data-hipp-option="audience-explained"]'
      )
      .check();
    await hippQuest
      .locator('[data-hipp-prompt="columbus-purpose"] input[data-hipp-option="purpose-explained"]')
      .check();
    await expect(page.locator(".quest-practice-summary")).toContainText("6/6");
    await expect(page).toHaveScreenshot(snap("practice-check-graded"));
  });

  // Split in two in Phase 69. This used to be one walk to the community elder, whose record was
  // gated by an Investigation Challenge and then opened the interview. That gate was removed when
  // the record stopped being a worksheet (decision log 0052), so the only Investigation Challenge
  // left in Case 1.01 is the map's — a world marker on the far west shore rather than a person a
  // few tiles north. Two moderate walks that can run in parallel beat one long serial one.
  test("investigation challenge", async ({ page }) => {
    test.setTimeout(120_000);
    await seedProgress(page, {
      currentScreen: "field",
      tutorial: { step: "complete", completed: true, skipped: false },
      // Nothing but the village is reachable until the village is secured — sourceAvailability().
      caseEvidence: { "case-001": ["taino-context"] },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // investigationScreen() reads the module-local openSourceId, so this screen cannot be jumped
    // to with setScreen() the way the activity screens above can — it has to be walked to. See
    // investigation-challenge.spec.js, which banks the behaviour.
    const table = '.source-signal--world[data-source="waldseemuller-map"]';
    expect(await walkTo(page, table, "caseFieldPlayer", { timeoutMs: 60_000 })).toBe(true);
    await page.locator(table).click();

    await expect(
      page.locator('[data-quest-id="case-001-investigation-sequencing-waldseemuller-naming"]')
    ).toBeVisible();
    await expect(page).toHaveScreenshot(snap("investigation-challenge"));
  });

  test("interview completion and source reader", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      tutorial: { step: "complete", completed: true, skipped: false },
      // The interview's bar is one useful answer from each of the seven people on the island,
      // which is a walk around it rather than three clicks on one screen. It is banked as
      // gameplay in activity-engines.spec.js; here the asking is seeded so this test stays about
      // the two screenshots it takes.
      //
      // Deliberately not the elder: this test walks to her and clicks the record button in her
      // speech bubble, and seeding her as already-asked swaps her ambient line for an answer, a
      // log button and four question chips, making that bubble tall enough to be a flaky click
      // target under parallel workers. Her own account is logged without being "asked", which the
      // reducer would refuse but a seed can simply state.
      sourceActivities: {
        "taino-context": {
          state: {
            asked: {
              "taino-gardener": ["grows"],
              "taino-fisher": ["trade"],
              "taino-child": ["grows"],
              columbus: ["gold"],
              "spanish-scribe": ["decides"],
              "spanish-sailor": ["trade"],
            },
            logged: {
              "taino-elder": ["decides"],
              "taino-gardener": ["grows"],
              "taino-fisher": ["trade"],
              "taino-child": ["grows"],
              columbus: ["gold"],
              "spanish-scribe": ["decides"],
              "spanish-sailor": ["trade"],
            },
            filed: null,
          },
          completed: false,
        },
      },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    // `taino-context` is carried by the community elder (Phase 56), so it is reached through her
    // speech bubble rather than by clicking a card on the grass.
    await walkToNpc(page, "taino-elder");
    await page.locator('[data-npc="taino-elder"]').click();
    await page
      .locator(
        '.field-speech-bubble [data-action="start-source-activity"][data-source="taino-context"]'
      )
      .click();

    // Lands straight on the interview now — there is no gate on this record. With the coverage
    // bar already met by the seed, filing is the one move left before the source reader opens.
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await page.locator('.activity-closer [data-option="questions"]').click();
    const openSourceButton = page.locator('[data-action="open-activity-source"]');
    await expect(openSourceButton).toBeVisible();
    await openSourceButton.click();

    await expect(page.locator(".reader-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("source-reader"));
  });

  // The other reader shape: a record whose activity has already done the reading, so the written
  // "initial reading" is replaced by a short multiple-choice set (Phase 69, decision log 0052).
  // Only waldseemuller-map opts in; the other 23 records in the game keep the textarea and the
  // Archive Evaluator, which the `source-reader` baselines above cover.
  test("source reader: the multiple-choice variant", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "assembly",
      activeCaseId: "case-001",
      activeActivitySourceId: "waldseemuller-map",
      caseEvidence: { "case-001": ["taino-context"] },
      tutorial: { step: "complete", completed: true, skipped: false },
      // A finished reconstruction, so the activity's footer offers the record — which is what
      // sets the module-local openSourceId the reader resolves from. There is no other way into
      // this screen that does not involve a walk to the far west shore.
      sourceActivities: {
        "waldseemuller-map": {
          state: {
            placed: {
              sheet: Object.fromEntries(
                Array.from({ length: 10 }, (_, i) => [`p${i + 1}`, `f${i + 1}`])
              ),
              cartouches: { south: "america", north: "terra-incognita", east: "india" },
            },
            selected: null,
            filed: "knowledge",
          },
          completed: false,
        },
      },
    });
    await loadSeededSave(page);
    await page.locator('[data-action="open-activity-source"]').click();

    await expect(page.locator(".reader-questions")).toBeVisible();
    await expect(page.locator(".quest-mcq")).toHaveCount(2);
    await expect(page.locator("#sourceResponse")).toHaveCount(0);
    await expect(page).toHaveScreenshot(snap("source-reader-questions"));
  });

  test("source reader: a primary source that is laid out as prose", async ({ page }) => {
    // `taino-context` in the test above is the *one* source in the game that genuinely is secondary
    // context, so it is the only one whose masthead looked right before Phase 58. This is a primary
    // source that also carries `visual: "context"` — 8 of the other 12 do — and it was therefore
    // captioned "Secondary context record" and footed "Background evidence, not a Taíno-authored
    // primary source". Its `record` is also one of the longest in the content, so it is the masthead's
    // layout case: a value that has to wrap beside its label.
    //
    // Reached through the record's own activity since Phase 70: the charter opens Riverbend's
    // INTERVIEW, and the reader is what its footer offers once the record is filed. Seeded rather
    // than walked, for the same reason as the multiple-choice variant above — the masthead is what
    // is under test, not the route to it.
    await seedProgress(page, {
      currentScreen: "interview",
      activeCaseId: "case-004",
      unlocked: ["case-001", "case-004"],
      activeActivitySourceId: "riverbend-charter",
      tutorial: { step: "complete", completed: true, skipped: false },
      sourceActivities: {
        "riverbend-charter": {
          state: {
            asked: RIVERBEND_ACCOUNTS,
            logged: RIVERBEND_ACCOUNTS,
            filed: "by-the-head",
          },
          completed: false,
        },
      },
    });
    await loadSeededSave(page);
    await page.locator('[data-action="open-activity-source"]').click();

    await expect(page.locator(".reader-shell")).toBeVisible();
    await expect(page.locator("#sourceResponse")).toBeVisible();
    // The button that opens the record sits at the foot of a long activity page, and a screen
    // change does not reset the document's scroll — so arriving this way lands mid-page with the
    // chrome bar and the back link above the fold. That is pre-existing and shared with the
    // multiple-choice route above; this baseline is of the masthead, so start it where the masthead
    // is rather than re-recording this baseline around a scroll offset.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page).toHaveScreenshot(snap("source-reader-primary-prose"));
  });

  test("a non-map mission, framed as itself", async ({ page }) => {
    // Phase 58's split. All six non-map cases used to route to the Archive Challenges list below,
    // which rendered every case's quest under one heading — so this screen did not exist and there
    // was nothing to baseline. Two cases here, because the point is that they look like different
    // missions: their titles, questions, mechanics and quest types all differ.
    await seedProgress(page, {
      currentScreen: "mission",
      selectedUnitId: "unit-02",
      activeCaseId: "case-005",
    });
    await loadSeededSave(page);
    await expect(page.locator(".mission-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("mission-triangle-ledger"));

    await setScreen(page, {
      currentScreen: "mission",
      selectedUnitId: "unit-03",
      activeCaseId: "case-009",
    });
    await expect(page.locator(".mission-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("mission-appeal-ledger"));

    // Case 1.02, the four-source/four-bin evidence-organizing board, baselined from Phase 59's
    // layout report: the "Place in" select refused to shrink below its longest option and painted
    // over the neighbouring card, and four bins laid out 3 + 1. Both are grid/flex sizing, so a
    // pixel baseline is what actually catches a regression here.
    await setScreen(page, {
      currentScreen: "mission",
      selectedUnitId: "unit-01",
      activeCaseId: "case-002",
    });
    await expect(page.locator(".mission-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("mission-exchange-ledger"));
  });

  test("archive challenges, review, completion, codex, and reconstruction", async ({ page }) => {
    await seedProgress(page, { currentScreen: "archive-challenges", selectedUnitId: "unit-01" });
    await loadSeededSave(page);
    await expect(page.locator(".archive-challenges-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("archive-challenges"));

    await setScreen(page, { currentScreen: "review", selectedUnitId: "unit-01" });
    await expect(page.locator(".review-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("review"));

    await setScreen(page, { currentScreen: "completion", selectedUnitId: "unit-01" });
    await expect(page.locator(".completion-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("completion"));

    await setScreen(page, { currentScreen: "codex", activeCaseId: "case-001" });
    await expect(page.locator(".codex-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("codex"));

    await setScreen(page, { currentScreen: "reconstruction", activeCaseId: "case-001" });
    await expect(page.locator(".puzzle-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("reconstruction"));
  });
});
