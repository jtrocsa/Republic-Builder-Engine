import { test, expect } from "@playwright/test";
import {
  PROGRESS_KEY,
  briefed,
  seedProgress,
  loadSeededSave,
  reloadIntoSave,
  beginFromTitle,
  walkTo,
  walkToNpc,
  dismissCodexVeil,
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
// **A field baseline frames part of its map, and which part is an accident of that map's spawn.**
// Every shot here is a `page` screenshot at 1366x768, so it captures the top band of the map frame
// and nothing below it, while the camera inside that frame is a pure function of where the seeded
// player is standing. Two consequences worth knowing before reading anything into a diff:
//
//   - **A baseline not moving is not evidence a change did not reach that map.** Phase 90B lit
//     every openable doorway in the game. The railhead's two doors sit inside its visible band and
//     its baselines moved; Ellis Island's sit at row 4 of a 56x36 wharf whose spawn is down at
//     (14, 26.5), so they are below the fold and its baselines did not — despite carrying exactly
//     the same treatment. The absence looked like "Unit 7 has no doors yet" and was not.
//   - **Adding a shot does not extend coverage downward.** If you need to see something low on a
//     map, seed the player near it rather than expecting the existing shot to grow.
//
// Determinism notes (read before adding more screenshots to this file):
// - `page.emulateMedia({ reducedMotion: "reduce" })` is set on every test. main.js's own
//   prefersReducedMotion() checks (the Entrance Hall's doorway cut) key off this, and Playwright's
//   default `animations: "disabled"` on toHaveScreenshot freezes CSS transitions/animations at
//   their end state regardless. The director scenes used to need an explicit mask on top of that
//   for `#directorArchiveClock`, a setInterval-driven elapsed-time readout that CSS freezing could
//   not touch; Phase 90B deleted the clock along with the rest of that screen's decor, so the two
//   director shots are plain screenshots now.
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
  await reloadIntoSave(page);
}

function snap(name, extra = {}) {
  return { animations: "disabled", ...extra, name: `${name}.png` };
}

// The Bank War, in the order that makes each step the cause of the next. Same role as
// EXCHANGE_PLACEMENTS below: the read-only baselines are of a *finished* quest, so they need a real
// answer rather than the authored (deliberately scrambled) one.
const BANK_WAR_FILED = [
  "bank-chartered-1816",
  "jackson-elected-1828",
  "veto-1832",
  "deposits-removed-1833",
  "charter-expires-1836",
  "panic-1837",
];

// Case 1.02's exchange ledger, filed correctly — every source in its own slot. Used for the
// read-only baseline below; the placements are the quest's own correctSlotIds, so a content edit
// that renames a slot fails here rather than quietly baselining a half-empty board.
const EXCHANGE_PLACEMENTS = {
  "case-002-maize-claim": "agriculture-diet",
  "case-002-smallpox-claim": "demographic-catastrophe",
  "case-002-horses-claim": "mobility-warfare",
  "case-002-enslaved-africans-claim": "forced-labor",
};

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

// Case 1.01's interview with all seven accounts taken — `requires.useful: 7`, one from each person
// on the shore. Used by the Codex baselines below, which need a finished Unit 1 mission to file.
const CARIBBEAN_ACCOUNTS = {
  "taino-elder": ["decides"],
  "taino-gardener": ["grows"],
  "taino-fisher": ["trade"],
  "taino-child": ["grows"],
  columbus: ["gold"],
  "spanish-scribe": ["decides"],
  "spanish-sailor": ["trade"],
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
    await beginFromTitle(page);
    await page.getByRole("button", { name: "Student" }).click();
    await page.getByRole("button", { name: "Start New Game" }).click();

    const dialogueBox = page.locator(".director-dialogue-box");
    await expect(dialogueBox).toBeVisible();
    // First frame of the shared director-scene shell (intro-welcome). Reduced motion means the
    // typewriter has already resolved to its full first line — deterministic without a wait.
    await expect(page).toHaveScreenshot(snap("director-welcome-scene"));

    const nameInput = page.locator('input[data-profile="name"]');
    // intro-protocol is the only director screen that renders an extra-content panel, and
    // `completeCurrentIntroStep()` unhides it once that screen's lines finish typing — so the first
    // frame where this is visible is the field protocol, fully drawn.
    //
    // Baselined in Phase 81B, which took the protocol from three cards to four so it states all
    // four clauses of the canon operational rule rather than dropping the last one. The panel is a
    // 380px column with `max-height: calc(100% - 320px)` and `overflow-y: auto`, so a fourth card
    // is a scroll risk rather than an overflow one — which is exactly the kind of thing that is
    // cheap to check by eye once and expensive to keep re-checking by hand.
    const protocolPanel = page.locator(".director-extra-content");
    let sawProtocol = false;
    let sawCodex = false;
    for (let i = 0; i < 40; i += 1) {
      if (await nameInput.isVisible().catch(() => false)) break;
      // The Codex veil covers the dialogue box on briefing 02/02. Baselined on its way past, since
      // it is the one beat of the intro that takes the whole screen.
      if (
        await page
          .locator("#directorCodexVeil")
          .isVisible()
          .catch(() => false)
      ) {
        if (!sawCodex) {
          sawCodex = true;
          await expect(page).toHaveScreenshot(snap("director-codex-reveal"));
        }
        await dismissCodexVeil(page);
        continue;
      }
      if (!(await dialogueBox.isVisible().catch(() => false))) break;
      if (!sawProtocol && (await protocolPanel.isVisible().catch(() => false))) {
        sawProtocol = true;
        await expect(page).toHaveScreenshot(snap("director-protocol-scene"));
      }
      await dialogueBox.click();
      await page.waitForTimeout(30);
    }
    expect(sawProtocol, "the field protocol screen never appeared during the intro").toBe(true);
    expect(sawCodex, "the Codex reveal never appeared during the intro").toBe(true);
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

  // Both warp screens, which as of Phase 88A are the same screen with a different painting on it
  // and since Phase 88B have two beats. Two things make these deterministic, and both matter:
  //
  //   - The reduced motion this file already emulates means main.js does not emit the tunnel canvas
  //     at all, so the one looping thing on the screen is absent rather than merely frozen. If a
  //     canvas ever shows up in one of these baselines, that branch has regressed and the baseline
  //     is a coin toss — do not accept it.
  //   - Waiting for `data-warp-phase="ready"` pins the settled end state: plate full-strength,
  //     anchor rings expired, ring reading "Synced", prompt shown. The screen stops there and waits
  //     for the player, so unlike every earlier version of it there is no moment after this one.
  test("travel transition (Case 1.01)", async ({ page }) => {
    await seedProgress(page, { currentScreen: "travel", activeCaseId: "case-001" });
    await loadSeededSave(page);
    const screen = page.locator('[data-warp="travel"]');
    await expect(screen).toBeVisible();
    await expect(screen).toHaveAttribute("data-warp-phase", "ready", { timeout: 15_000 });
    await expect(page).toHaveScreenshot(snap("travel-transition"));
  });

  test("recall transition", async ({ page }) => {
    await seedProgress(page, { currentScreen: "return-warp", activeCaseId: null });
    await loadSeededSave(page);
    const screen = page.locator('[data-warp="recall"]');
    await expect(screen).toBeVisible();
    await expect(screen).toHaveAttribute("data-warp-phase", "ready", { timeout: 15_000 });
    await expect(page).toHaveScreenshot(snap("recall-transition"));
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
      sourceActivities: briefed("taino-context"),
    });
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-interview"));

    await setScreen(page, {
      currentScreen: "discrepancy",
      activeCaseId: "case-001",
      activeActivitySourceId: "columbus-letter",
      sourceActivities: briefed("columbus-letter"),
    });
    await expect(page.locator(".activity-board--discrepancy")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-discrepancy"));

    await setScreen(page, {
      currentScreen: "assembly",
      activeCaseId: "case-001",
      activeActivitySourceId: "waldseemuller-map",
      sourceActivities: briefed("waldseemuller-map"),
    });
    await expect(page.locator(".activity-board--assembly")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-assembly"));
  });

  // The Mission Instructions screen (Phase 71) — the state every activity opens on the first time,
  // and the only screen in the game built around a character portrait. Two baselines, because the
  // two ends of its giver plate are different layouts: a named person with a line, and a record
  // nobody handed over. mission-instructions.spec.js covers the behaviour.
  test("mission instructions: the hand-off, with and without a giver", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "interview",
      activeCaseId: "case-001",
      activeActivitySourceId: "taino-context",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator(".mission-brief__portrait")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("mission-instructions"));

    await setScreen(page, {
      currentScreen: "assembly",
      activeCaseId: "case-001",
      activeActivitySourceId: "waldseemuller-map",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await expect(page.locator(".mission-brief__mark")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("mission-instructions-unheld"));
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

    // **The Powhatan landing has no baseline of its own, deliberately.** This shot frames the spawn
    // at (26,18) and the landing is upriver at cols 9-20, so the yehakins, the drying rack, the hide
    // stretcher and the corn ground added in Phase 84 are all outside it. Getting the camera there
    // would mean walking fourteen tiles across the settlement with a helper that steers rather than
    // pathfinds, and a flaky screenshot is worth less than no screenshot. What covers that art
    // instead: tile-palettes.test.js proves the sheet is globbed (a missing glob throws in the
    // resolver and renders the whole map as an empty frame), field-map-coordinates.test.js proves
    // the two NPCs' routes still reach their stops around the new collision rects, and this very
    // test proves the map still draws at all with the new tileset in its .tmj. What is NOT covered
    // is the landing's composition, which was checked with scripts/assets/preview-map.js.

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
          briefed: true,
        },
      },
    });
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-interview-riverbend"));

    // The Field Notebook (Phase 72). Baselined on the element rather than the viewport, because it
    // sits below the fold on every activity screen — which is exactly why it shipped without moving
    // a single one of the other baselines, and why it needs one of its own. Eight accounts taken
    // makes it the fullest the panel gets in shipped content.
    //
    // Must be taken before the debrief seed below: filing the closer finishes the mission, and a
    // finished mission renders the debrief instead of the board the notebook lives on.
    await expect(page.locator(".evidence-notebook")).toHaveScreenshot(snap("field-notebook"));

    // The Debrief (Phase 74) — the activity screen's third state, and the only place the
    // historical-fiction bands are drawn. Riverbend's interview is the fullest of the six.
    await setScreen(page, {
      currentScreen: "interview",
      activeCaseId: "case-004",
      activeActivitySourceId: "riverbend-charter",
      sourceActivities: {
        "riverbend-charter": {
          state: { asked: RIVERBEND_ACCOUNTS, logged: RIVERBEND_ACCOUNTS, filed: "by-the-head" },
          completed: false,
          briefed: true,
          debriefed: false,
        },
      },
    });
    await expect(page.locator(".mission-debrief")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("mission-debrief"));
    // The four historical-fiction bands, on the element — they sit below the fold, and their
    // colour coding is the only thing telling documented history apart from Chronicle's own
    // invention at a glance.
    await expect(page.locator(".mission-debrief__record")).toHaveScreenshot(
      snap("mission-debrief-record")
    );

    await setScreen(page, {
      currentScreen: "discrepancy",
      activeCaseId: "case-004",
      activeActivitySourceId: "riverbend-letter",
      caseEvidence: { "case-004": ["riverbend-charter"] },
      sourceActivities: {
        "riverbend-charter": {
          state: { asked: RIVERBEND_ACCOUNTS, logged: RIVERBEND_ACCOUNTS, filed: "by-the-head" },
          completed: true,
          briefed: true,
        },
        ...briefed("riverbend-letter"),
      },
    });
    await expect(page.locator(".activity-board--discrepancy")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-discrepancy-riverbend"));

    await setScreen(page, {
      currentScreen: "trace",
      activeCaseId: "case-004",
      activeActivitySourceId: "riverbend-ledger",
      sourceActivities: briefed("riverbend-ledger"),
    });
    await expect(page.locator(".activity-board--trace")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("activity-trace"));

    // The support axis, open (Phase 76). A leg asks its second question only once the first answer
    // is right, so the control does not exist on the cold board above — and it is the whole of the
    // change, so it needs a shot where it is on screen. On the element, because leg 1's card sits
    // above the fold but its own support group does not once the `why` lands beneath it.
    await setScreen(page, {
      currentScreen: "trace",
      activeCaseId: "case-004",
      activeActivitySourceId: "riverbend-ledger",
      sourceActivities: {
        "riverbend-ledger": {
          state: { ledger: { curing: "labor-cost" }, support: {}, filed: null },
          completed: false,
          briefed: true,
        },
      },
    });
    await expect(page.locator(".activity-leg__support")).toHaveCount(1);
    await expect(page.locator(".activity-leg").first()).toHaveScreenshot(
      snap("activity-trace-leg")
    );

    // The arc close and the anomaly (Phase 77) — the two bands that only exist at the end of a
    // case. Both sit below a debrief that is already long, so both are shot on the element. Seeded
    // with all three Riverbend records filed, which is the only state the arc band renders in.
    await setScreen(page, {
      currentScreen: "trace",
      activeCaseId: "case-004",
      activeActivitySourceId: "riverbend-ledger",
      caseEvidence: { "case-004": ["riverbend-charter"] },
      sourceActivities: {
        "riverbend-charter": {
          state: { asked: RIVERBEND_ACCOUNTS, logged: RIVERBEND_ACCOUNTS, filed: "by-the-head" },
          completed: true,
          briefed: true,
          debriefed: true,
        },
        "riverbend-letter": {
          state: {
            verdicts: {
              "sickness-country": "contradicted",
              "nothing-gotten": "contradicted",
              gruel: "supported",
              limbs: "supported",
              "thirty-two": "cannot-tell",
            },
            gaps: { "sickness-country": "he-was-wrong", "nothing-gotten": "not-one-place" },
            filed: "position",
          },
          completed: true,
          briefed: true,
          debriefed: true,
        },
        "riverbend-ledger": {
          state: {
            ledger: {
              curing: "labor-cost",
              entering: "crown-revenue",
              crossing: "planter-credit",
              returning: "merchant-control",
            },
            support: {
              curing: "not-shown",
              entering: "established",
              crossing: "established",
              returning: "inferred",
            },
            notebook: { kept: ["entering", "crossing", "returning"] },
            filed: "dependence",
          },
          completed: true,
          briefed: true,
          debriefed: false,
        },
      },
    });
    await expect(page.locator(".mission-debrief__arc")).toBeVisible();
    await expect(page.locator(".mission-debrief__arc")).toHaveScreenshot(snap("mission-arc-close"));
    await expect(page.locator(".mission-debrief__anomaly")).toHaveScreenshot(
      snap("mission-anomaly")
    );
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

  // Unit 6 arrived in Phase 85 with no baseline of its own, which left the one map in the game whose
  // whole composition is an argument — paper north of the rails, what the paper is for south of them
  // — as the only field surface nothing was watching. Its two rooms went in with it in Phase 86.
  test("field: the railhead and both of its offices (Unit 6)", async ({ page }) => {
    const seed = {
      currentScreen: "field",
      activeCaseId: "case-016",
      unlocked: ["case-001", "case-016"],
      tutorial: { step: "complete", completed: true, skipped: false },
    };
    await seedProgress(page, seed);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
    await waitForTiledCanvas(page, "railheadTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-railhead"));

    await setScreen(page, { ...seed, currentFieldRoom: "railhead-land-office" });
    await waitForTiledCanvas(page, "railheadLandOfficeTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-railhead-land-office"));

    await setScreen(page, { ...seed, currentFieldRoom: "railhead-telegraph-office" });
    await waitForTiledCanvas(page, "railheadTelegraphOfficeTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-railhead-telegraph-office"));
  });

  // Unit 7's wharf, and the one thing this baseline is actually watching is the iron rail: it is
  // stamped `base`, so its plinth is on `structures` and its ironwork on the overlay, and a
  // solidity change that quietly moved either would look like nothing in the collision tests and
  // like a fence lying flat on the quay here. The two landing stages are the other reason — they
  // are ground-layer decking painted over water, which is a treatment no other map uses.
  //
  // Its two rooms went in in Phase 89D. The hall is the first interior in the game bigger than the
  // viewport on both axes, so its baseline is also the only one that frames a *part* of a room; and
  // its railings are the wharf's own rail tile indoors, which means one solidity change would show
  // up in both shots at once.
  test("field: the immigrant station's wharf and both of its rooms (Unit 7)", async ({ page }) => {
    const seed = {
      currentScreen: "field",
      activeCaseId: "case-019",
      unlocked: ["case-001", "case-019"],
      tutorial: { step: "complete", completed: true, skipped: false },
    };
    await seedProgress(page, seed);
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();
    await waitForTiledCanvas(page, "immigrantPortTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-immigrant-port"));

    await setScreen(page, { ...seed, currentFieldRoom: "immigrant-port-inspection-hall" });
    await waitForTiledCanvas(page, "immigrantPortInspectionHallTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-immigrant-port-inspection-hall"));

    await setScreen(page, { ...seed, currentFieldRoom: "immigrant-port-inquiry-room" });
    await waitForTiledCanvas(page, "immigrantPortInquiryRoomTiledCanvas");
    await page.addStyleTag({ content: "[data-npc] { visibility: hidden !important; }" });
    await expect(page).toHaveScreenshot(snap("field-immigrant-port-inquiry-room"));
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
          briefed: true,
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
    // bar already met by the seed, filing is the one move left.
    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await page.locator('.activity-closer [data-option="questions"]').click();

    // Filing a finished mission now lands on the Debrief rather than on the board with a footer
    // (Phase 74). It carries the same exit: `mission-debriefed` marks the record and opens it,
    // which is what `open-activity-source` used to do from the footer.
    const onward = page.locator('[data-action="mission-debriefed"]');
    await expect(onward).toBeVisible();
    await onward.click();

    await expect(page.locator(".reader-shell")).toBeVisible();
    // The debrief is taller than the viewport, so Playwright scrolls to reach its button and the
    // reader inherits a few pixels of that — the app does not reset scroll between screens. A
    // player clicking a button already in view lands at the top, which is what this baselines.
    await page.evaluate(() => window.scrollTo(0, 0));
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
          briefed: true,
          // Seeded past the Debrief (Phase 74). A finished mission opens on it, and this baseline is
          // of the reader's masthead rather than of the route to it — the debrief has its own.
          debriefed: true,
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
          briefed: true,
          // Seeded past the Debrief, for the same reason as the multiple-choice route above.
          debriefed: true,
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

    // The same board, finished — renderQuest(..., { readOnly: true }), Spine Review P10-4. This
    // screen returned 403 characters of card and no quest at all before Phase 92, so there is no
    // earlier baseline to compare against and this one is the whole record of what the mode looks
    // like: every card placed and none of them faded, the selects greyed, the four bins filled.
    await setScreen(page, {
      currentScreen: "mission",
      selectedUnitId: "unit-01",
      activeCaseId: "case-002",
      completedCases: ["case-002"],
      questResponses: { "case-002-archive-exchange-claims": { placements: EXCHANGE_PLACEMENTS } },
    });
    await expect(page.locator("[data-quest-readonly]")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("mission-exchange-ledger-filed"));

    // The other read-only shape, and the one that changes most: a sequencing record hides its
    // move buttons entirely and numbers the rows instead, because .quest-sequence-list is
    // list-style: none and without the counter the answer would be an unlabelled column.
    await setScreen(page, {
      currentScreen: "mission",
      selectedUnitId: "unit-04",
      activeCaseId: "case-011",
      completedCases: ["case-011"],
      questResponses: { "case-011-mission-bank-war-chronology": { order: BANK_WAR_FILED } },
    });
    await expect(page.locator("[data-quest-readonly]")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("mission-bank-war-filed"));
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

    // The Codex with something in it (Phase 75). Two finished missions in two different units is
    // the smallest save that draws every part of the screen: a unit-grouped filed record, its kept
    // evidence, its tags, and a cross-unit thread. backfillCodex() files them at boot, so the seed
    // only has to say the missions are finished.
    //
    // Both shots are on elements. The masthead's h1 is 3-5.8rem and the two new sections start well
    // below a 1366x768 fold — a viewport shot would baseline the same top of the page the `codex`
    // shot above already covers and none of what changed.
    await setScreen(page, {
      currentScreen: "codex",
      activeCaseId: "case-001",
      unlocked: ["case-001", "case-004"],
      sourceActivities: {
        "taino-context": {
          state: {
            asked: CARIBBEAN_ACCOUNTS,
            logged: CARIBBEAN_ACCOUNTS,
            filed: "questions",
          },
          completed: true,
          briefed: true,
          debriefed: true,
        },
        "riverbend-ledger": {
          state: {
            ledger: {
              curing: "labor-cost",
              entering: "crown-revenue",
              crossing: "planter-credit",
              returning: "merchant-control",
            },
            support: {
              curing: "not-shown",
              entering: "established",
              crossing: "established",
              returning: "inferred",
            },
            notebook: { kept: ["entering", "crossing", "returning"] },
            filed: "dependence",
          },
          completed: true,
          briefed: true,
          debriefed: true,
        },
      },
    });
    await expect(page.locator(".codex-record")).toHaveCount(2);
    await expect(page.locator(".codex-section").nth(1)).toHaveScreenshot(snap("codex-filed"));
    await expect(page.locator(".codex-section").nth(2)).toHaveScreenshot(
      snap("codex-cross-references")
    );

    await setScreen(page, { currentScreen: "reconstruction", activeCaseId: "case-001" });
    await expect(page.locator(".puzzle-shell")).toBeVisible();
    await expect(page).toHaveScreenshot(snap("reconstruction"));
  });
});
