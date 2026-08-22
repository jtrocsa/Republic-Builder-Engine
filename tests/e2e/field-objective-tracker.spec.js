import { test, expect } from "@playwright/test";
import {
  seedProgress,
  loadSeededSave,
  reloadIntoSave,
  readProgress,
} from "./helpers/progress-seed.js";

// The field's Mission Tracker checklist (Phase 57; renamed from "Records to Recover" in Phase 69,
// when it gained the second block that opens the mission you have in flight). Before it, the only
// progress signal in the field was the number on the "Open Codex" button, so "how many records are
// there, which have I got, and where is the next one" was answerable only by walking the whole map.
//
// Three states per row, and the point of each is that it is readable without reading the words:
// gold + pulsing ✦ = go here, struck-through green ✓ = secured, grey · = not yet available.
//
// What the second block *reports* for a given engine is covered in activity-engines.spec.js, beside
// the interview it reports on. Which record it is about is covered here, because that is a question
// about the case rather than about any one engine.

// Case 1.01's interview, closed out and debriefed earlier — the same shape as activity-engines.spec.js's
// FILED, which is what `isActivityComplete` needs before the tracker will consider it finished.
const INTERVIEW_FILED = {
  state: {
    asked: {
      "taino-elder": ["decides"],
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
    filed: "questions",
  },
  completed: true,
  briefed: true,
  debriefed: true,
};
// A discrepancy just opened and not yet worked — defaultDiscrepancyState().
const AUDIT_STARTED = {
  state: { verdicts: {}, gaps: {}, filed: null, notebook: { kept: [] } },
  briefed: true,
};

test.describe("Field objective tracker", () => {
  test("lists every record with its destination, and counts what is secured", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-007",
      unlocked: ["case-001", "case-007"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const tracker = page.locator(".field-tracker");
    await expect(tracker).toBeVisible();
    await expect(tracker.locator(".field-tracker__toggle em")).toHaveText("0/7");
    await expect(tracker.locator(".field-tracker__row")).toHaveCount(7);

    // Rows name *where to go*, not the source's historical title — the thing the player can spot
    // across the map. One of Unit 3's records is carried by a person, so its row is his name.
    await expect(tracker).toContainText("John Dickinson");
    await expect(tracker).toContainText("Statehouse petition table");

    // Pinned to the viewport frame, not inside the translated world div: it must not scroll with the
    // camera. Asserted structurally because a camera-following panel is the exact regression this
    // placement avoids.
    await expect(page.locator("#caribbeanWorld .field-tracker")).toHaveCount(0);
    await expect(page.locator("#caseFieldMap > .field-tracker")).toHaveCount(1);
  });

  test("strikes through a secured record and greys out one that is still locked", async ({
    page,
  }) => {
    // Case 1.01 is the one case with a within-case order: nothing but the village observation is
    // reachable until the village has been observed. That gate lives in the exported
    // sourceAvailability(), which the world markers read too, so the two cannot disagree.
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const rows = page.locator(".field-tracker__row");
    await expect(rows).toHaveCount(3);
    await expect(page.locator(".field-tracker__row.is-available")).toHaveCount(1);
    await expect(page.locator(".field-tracker__row.is-locked")).toHaveCount(2);
    await expect(page.locator(".field-tracker__row.is-locked").first()).toContainText(
      "Not yet available"
    );

    // With the village observed, the other two open and its own row is struck through.
    await page.evaluate(() => {
      const key = "republic-builder.chronicle.unit-01.v2";
      const saved = JSON.parse(window.localStorage.getItem(key));
      saved.caseEvidence = { "case-001": ["taino-context"] };
      window.localStorage.setItem(key, JSON.stringify(saved));
    });
    await reloadIntoSave(page);

    await expect(page.locator(".field-tracker__toggle em")).toHaveText("1/3");
    await expect(page.locator(".field-tracker__row.is-secured")).toHaveCount(1);
    await expect(page.locator(".field-tracker__row.is-locked")).toHaveCount(0);
    await expect(page.locator(".field-tracker__row.is-available")).toHaveCount(2);
  });

  test("a locked record is listed by the tracker and drawn nowhere on the map", async ({
    page,
  }) => {
    // Richmond's price board, and the reason Spine Review Part 6 went looking here at all.
    //
    // `fieldSourceSignal()` returns "" for a locked record, so it has no world marker — which is
    // the honest presentation, and was also the coincidence that hid a real bug for six phases. It
    // made the *click* path unable to reach a locked record (no button to click), which made the
    // gate look enforced. It was not: `E` goes through `nearestFieldInteraction()`, which offers a
    // record whether it has a marker or not, and the only thing standing in the way was a
    // hard-coded `case-001` literal. Six maps declared the gate in content and none applied it.
    //
    // This is that presentation pinned on the map it was wrong on. The refusal itself is a unit
    // test (`field-record-gate.test.js`) rather than a walk: the record has no marker to walk to,
    // and reaching its cell from the Franklin Street spawn means crossing the bluff, which
    // walkTo() steers and shoves at rather than pathfinds.
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-013",
      unlocked: ["case-001", "case-013"],
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);
    await expect(page.locator("#caseFieldPlayer")).toBeVisible();

    await expect(
      page.locator('.source-signal--world[data-source="richmond-price-board"]')
    ).toHaveCount(0);
    await expect(page.locator(".field-tracker__row.is-locked")).toHaveCount(1);
    await expect(page.locator(".field-tracker__row.is-locked")).toContainText("Not yet available");
    // The other five of Richmond's six records are reachable, so this is a gate on one record and
    // not a case that opens shut.
    await expect(page.locator(".field-tracker__row")).toHaveCount(6);
  });

  test("collapses to its header, and the choice survives a reload", async ({ page }) => {
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const body = page.locator(".field-tracker__body");
    await expect(body).toBeVisible();
    await page.locator('[data-action="field-tracker-toggle"]').click();
    await expect(body).toBeHidden();
    expect((await readProgress(page)).settings.trackerCollapsed).toBe(true);

    await reloadIntoSave(page);
    await expect(page.locator(".field-tracker")).toHaveClass(/is-collapsed/);
    await expect(page.locator(".field-tracker__body")).toBeHidden();
  });

  test("moves on to the next mission once one is filed (regression)", async ({ page }) => {
    // The defect that started Part 0. The block read the first record of the case with any activity
    // state at all, so from the first click on the elder onward it named Case 1.01's interview
    // forever — progress line stuck at "✓ Filed", bar at 7/7, and the notebook button reopening a
    // mission the player finished an hour ago whatever they were actually working on.
    //
    // This is the state right after a debrief: `mission-debriefed` nulls activeActivitySourceId, so
    // the panel has to answer without it for the entire walk to the next record.
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      caseEvidence: { "case-001": ["taino-context"] },
      activeActivitySourceId: null,
      sourceActivities: { "taino-context": INTERVIEW_FILED, "columbus-letter": AUDIT_STARTED },
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const tracker = page.locator(".field-tracker");
    // toContainText, not toHaveText: the row carries its state glyph as an aria-hidden <i>.
    await expect(tracker.locator(".field-tracker__row.is-tracked")).toContainText(
      "What Will Be Useful"
    );
    await expect(tracker.locator('[data-action="open-activity-notebook"]')).toHaveAttribute(
      "data-source",
      "columbus-letter"
    );
    // And the interview's own row goes back to naming the person who carried it, which is what the
    // in-flight row was displacing.
    await expect(tracker).toContainText("Taíno community elder");
  });

  test("follows the open record even with an earlier mission unfinished (edge case)", async ({
    page,
  }) => {
    // Missions are not ordered within a case beyond Case 1.01's one gate, so "first unfinished" is a
    // fallback rather than the rule: a player who walks out of the audit with the interview still
    // half-done should come back to the audit.
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-001",
      caseEvidence: { "case-001": ["taino-context"] },
      activeActivitySourceId: "columbus-letter",
      sourceActivities: {
        "taino-context": {
          state: { asked: { "taino-gardener": ["grows"] }, logged: {}, filed: null },
          briefed: true,
        },
        "columbus-letter": AUDIT_STARTED,
      },
      tutorial: { step: "complete", completed: true, skipped: false },
    });
    await loadSeededSave(page);

    const tracker = page.locator(".field-tracker");
    // toContainText, not toHaveText: the row carries its state glyph as an aria-hidden <i>.
    await expect(tracker.locator(".field-tracker__row.is-tracked")).toContainText(
      "What Will Be Useful"
    );
    await expect(tracker.locator('[data-action="open-activity-notebook"]')).toHaveAttribute(
      "data-source",
      "columbus-letter"
    );
  });
});
