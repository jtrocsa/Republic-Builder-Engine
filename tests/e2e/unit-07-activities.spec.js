// Ellis Island's three missions (content/activities/unit-07-activities.js).
//
// The host contract is banked on Case 1.01, the arc machinery on Case 2.01 and the indoor-speaker
// case on Case 6.01, so this file covers only what Unit 7 adds:
//
//   1. **The first INTERVIEW with a Field Notebook cap.** Every shipped interview keeps everything
//      it logs; this one gathers eight and keeps three, and its closer names the two findings the
//      conclusion rests on. So the right answer carried on the wrong three files as *unsupported* —
//      a state no interview has ever been able to reach. `requires.useful` and `notebook.capacity`
//      are two different bars and this is the test that says so.
//   2. **A speaker behind the second door.** Unit 6 put two speakers in one interior; this puts one
//      in the *second* room of a two-room map, which is the furthest `fieldNpcById()`'s resolution
//      across `fieldSurfaces()` has been asked to reach.
//   3. **An ASSEMBLY whose distractor is the instrument.** The staircase is printed on the same
//      posted key as the letters and is not a mark — it is what produces every mark. A board that
//      quietly promoted it to a slot would still validate and would still solve.
//   4. **A DISCREPANCY whose evidence column is minted by the interview next door.** The audit's
//      right-hand column is built from `asked:<npc>:<question>` tokens, and the minute's
//      `requiresSourceId` is what guarantees the player has earned them — so the gate that orders
//      the missions is also what stops the audit opening on an empty column. Only one of six lines
//      is contradicted, which is the point: an audit that finds everything false teaches distrust
//      rather than reading.
//   5. **The unit's one anomaly is on the interview**, which is new — the other five sit on a trace
//      or a discrepancy. It has to fire there and nowhere else on this map.
//
// tests/e2e/port-interiors.spec.js is a different file about the two rooms as rooms. This one is
// about what is played in them.
import { expect, test } from "@playwright/test";
import {
  briefed,
  loadSeededSave,
  readProgress,
  seedProgress,
  walkTo,
} from "./helpers/progress-seed.js";

const CASE_019 = {
  activeCaseId: "case-019",
  selectedCaseId: "case-019",
  unlocked: ["case-001", "case-019"],
  tutorial: { step: "complete", completed: true, skipped: false },
};

// Every speaker's one useful answer, logged. `asked` and `logged` are different lists and everything
// downstream counts `logged`, so this is the state of a player who put the right question to all
// eight and wrote every one of them down.
const EIGHT_ACCOUNTS = {
  "port-ships-purser": ["who-spoke"],
  "port-steamship-agent": ["disagree"],
  "port-immigrant-inspector": ["not-yours"],
  "port-interpreter": ["no-line"],
  "port-steerage-woman": ["who-spoke"],
  "port-steerage-man": ["disagree"],
  "port-steerage-elder": ["not-yours"],
  "port-detained-woman": ["no-line"],
};

/** The two findings the closer's correct option names, plus one of the six that it does not. */
const SUPPORTING = [
  "port-ships-purser:who-spoke",
  "port-immigrant-inspector:not-yours",
  "port-interpreter:no-line",
];
/** Three real findings, none of which is either half of the argument. */
const INSUFFICIENT = [
  "port-interpreter:no-line",
  "port-steerage-elder:not-yours",
  "port-detained-woman:no-line",
];

const interviewState = (kept, logged = EIGHT_ACCOUNTS) => ({
  "port-ship-manifest-page": {
    state: {
      asked: logged,
      logged,
      filed: null,
      notebook: { kept },
    },
    completed: false,
    briefed: true,
    debriefed: false,
  },
});

test.describe("INTERVIEW, and the first notebook cap on one", () => {
  test("gathers eight, keeps three, and refuses a conclusion the three cannot carry", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_019,
      currentScreen: "interview",
      activeActivitySourceId: "port-ship-manifest-page",
      sourceActivities: interviewState(INSUFFICIENT),
    });
    await loadSeededSave(page);

    await expect(page.locator(".activity-board--interview")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Column Thirty");
    // Two panels: the people whose work is the form, and the people the form is about. The closer
    // asks about the difference between them, so the grouping is load-bearing rather than layout.
    await expect(page.locator(".interview-group")).toHaveCount(2);

    // Eight accounts gathered — the `requires.useful` bar — against three kept. Two different bars,
    // and this is the pair no other interview has.
    await expect(page.locator(".activity-progress")).toContainText("8");
    await expect(page.locator(".evidence-notebook h3")).toContainText("3 of 3");
    // Full, so the remaining five findings offer a disabled Add button rather than silently evicting.
    await expect(page.locator(".evidence-notebook__full")).toBeVisible();
    await expect(page.locator(".evidence-notebook__keep").first()).toBeDisabled();

    // The right conclusion, carried on three findings that do not establish it. Not a buzzer and not
    // a pass: a third state, which is what `requiresEvidence` exists to produce.
    await page.locator('[data-activity-action="file"][data-option="same-twice"]').click();
    await expect(page.locator(".activity-why.is-unsupported")).toBeVisible();
    await expect(page.locator(".activity-why.is-unsupported")).toContainText(
      "The purser told you where the answers came from"
    );
  });

  test("files once the notebook holds the two halves of the argument", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_019,
      currentScreen: "interview",
      activeActivitySourceId: "port-ship-manifest-page",
      sourceActivities: interviewState(SUPPORTING),
    });
    await loadSeededSave(page);

    // The speaker behind the second door. Nothing else in the suite would notice if a future edit
    // pulled the cast back to the wharf and the inspection hall — the mission would simply have
    // seven people in it and still validate.
    await expect(page.locator(".activity-board--interview")).toContainText("Anna Krajewska");

    // Filing a supported, correct conclusion finishes the mission, so the board is replaced by the
    // debrief rather than showing a verdict line — which is the other half of what the first test
    // proves, since the unsupported file left the player on the board with five findings to go back
    // for.
    await page.locator('[data-activity-action="file"][data-option="same-twice"]').click();
    await expect(page.locator(".mission-debrief")).toBeVisible();
    await expect(page.locator(".mission-brief__body")).toContainText(
      "an answer that is wrong twice passes"
    );
  });
});

test.describe("ASSEMBLY, on a posted key", () => {
  test("sorts five letters into five kinds, and refuses the staircase a slot", async ({ page }) => {
    await seedProgress(page, {
      ...CASE_019,
      currentScreen: "assembly",
      activeActivitySourceId: "port-medical-inspection-card",
      sourceActivities: briefed("port-medical-inspection-card"),
    });
    await loadSeededSave(page);

    await expect(page.locator("h1")).toHaveText("Six Seconds");
    const marks = page.locator(".activity-assembly-board").first();

    // The board's live distractor and the reason the mission exists: the climb is printed on the
    // same posted sheet as the letters, and it is not a finding — it is what produces all of them.
    await marks.locator('[data-activity-fragment="stairs"]').click();
    await marks.locator('[data-activity-slot="body"]').click();
    // The hints ladder, not the misread: a first wrong placement gets a nudge, and the paragraph is
    // kept for the third. That is the Phase 76 ordering rule, and this piece is where it earns its
    // keep — three wrong placements on this board would otherwise arrive as three paragraphs at once.
    await expect(page.locator(".activity-misread").first()).toContainText(
      "This is printed on the same posted sheet as the letters"
    );

    // A wrongly placed piece stays in its slot, and an occupied slot's own verb is `lift` rather
    // than `place` — so the staircase has to come out before the five letters can go in.
    await marks.locator('[data-activity-slot="body"]').click();

    for (const [fragment, slot] of [
      ["ct", "disease"],
      ["x", "sign"],
      ["l", "body"],
      ["pg", "passing"],
      ["s", "age"],
    ]) {
      await marks.locator(`[data-activity-fragment="${fragment}"]`).click();
      await marks.locator(`[data-activity-slot="${slot}"]`).click();
    }
    await expect(marks).toHaveClass(/is-solved/);

    // The second board opens on the first, and asks who the decision belongs to once the letter is
    // on the coat. Two of its five candidates are decisions nobody in this building makes.
    const decides = page.locator(".activity-assembly-board").nth(1);
    await expect(decides).not.toHaveClass(/is-locked/);
    await decides.locator('[data-activity-fragment="treatment"]').click();
    await decides.locator('[data-activity-slot="surgeon"]').click();
    await expect(decides.locator(".activity-misread")).toContainText(
      "Go through the key again and look for treatment"
    );
  });
});

test.describe("DISCREPANCY, on the only copy", () => {
  test("holds the closed session up, and contradicts the line the hearing rests on", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_019,
      currentScreen: "discrepancy",
      activeActivitySourceId: "port-special-inquiry-minute",
      sourceActivities: {
        // The evidence column is minted from the interview's *logged* answers, so the audit is
        // seeded with the interview finished. That is not a convenience: `requiresSourceId` on this
        // record is what makes it the real state of any player who reaches this room.
        ...interviewState(SUPPORTING),
        ...briefed("port-special-inquiry-minute"),
      },
    });
    await loadSeededSave(page);

    await expect(page.locator("h1")).toHaveText("In Answer to a Question");
    const claims = page.locator(".activity-claim");
    await expect(claims).toHaveCount(6);
    // Eight observations, every one of them keyed to a useful answer the interview's `requires`
    // makes unavoidable — so the column is full rather than showing "You did not gather this".
    await expect(page.locator(".activity-observation")).toHaveCount(8);
    await expect(page.locator(".activity-observation.is-missing")).toHaveCount(0);

    // The control. A closed hearing really is the procedure rather than a courtesy, and an audit
    // that found every line false would teach a student to distrust documents instead of read them.
    const separate = claims.nth(4);
    await separate.locator('[data-verdict="supported"]').click();
    await expect(separate).toHaveClass(/is-settled/);
    await expect(separate).toContainText("it is the procedure rather than a courtesy");

    // The line the whole hearing rests on, and the only contradicted one. She is the person on line
    // 11; the answers on line 11 are not hers. It takes two of the eight accounts to say so, and
    // nothing on the board's list of twelve questions would ever have surfaced it.
    const identity = claims.nth(0);
    await identity.locator('[data-verdict="supported"]').click();
    await expect(identity).not.toHaveClass(/is-settled/);
    await identity.locator('[data-verdict="contradicted"]').click();
    await expect(identity).not.toHaveClass(/is-settled/);
    await identity.locator('[data-gap="no-question"]').click();
    await expect(identity).toHaveClass(/is-settled/);
    await expect(identity).toContainText("identity settled authorship");
  });
});

test.describe("the map's one anomaly", () => {
  test("flags a column nobody needs marked, totalled for a year that has not closed", async ({
    page,
  }) => {
    await seedProgress(page, {
      ...CASE_019,
      currentScreen: "interview",
      activeActivitySourceId: "port-ship-manifest-page",
      sourceActivities: {
        "port-ship-manifest-page": {
          state: {
            asked: EIGHT_ACCOUNTS,
            logged: EIGHT_ACCOUNTS,
            filed: "same-twice",
            notebook: { kept: SUPPORTING },
          },
          completed: true,
          briefed: true,
          debriefed: false,
        },
      },
    });
    await loadSeededSave(page);

    const anomaly = page.locator(".mission-debrief__anomaly");
    await expect(anomaly).toBeVisible();
    await expect(anomaly.locator(".mission-debrief__noticed")).toContainText("column seven");
    await expect(anomaly).toContainText("a fiscal year that does not close");
    // Last on the screen: the one thing the mission does not resolve is the note the player leaves
    // on. No arc close above it here — the manifest is named by the minute's `requiresSourceId`, so
    // it can never be the record a player finishes the case with.
    const sections = page.locator(".mission-brief__body > section");
    await expect(sections.last()).toHaveClass(/mission-debrief__anomaly/);
    await expect(page.locator(".mission-debrief__arc")).toHaveCount(0);
  });
});

test.describe("the field path into a mission", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  // The one thing every other test in this file skips past: that a record on the map now routes into
  // an engine rather than into the reader. All seven of Unit 7's sources carried `activityRoute:
  // null` from Phase 89 to Phase 89E and degraded through `sourceActivityRoute()`, so the walk-up
  // path is exactly what changed and nothing else in the suite exercises it for this unit.
  //
  // Dr. Grasso rather than the inspector deliberately: he stands in the south chamber, three tiles
  // from where the door puts a player down, and reaching the registry desks means walking the
  // switchback both rails make. port-interiors.spec.js already walks that, at 180 seconds a test.
  test("walking up to the surgeon opens Mission Instructions, not the reader", async ({ page }) => {
    test.setTimeout(120_000);
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-019",
      selectedCaseId: "case-019",
      unlocked: ["case-001", "case-019"],
      tutorial: { step: "complete", completed: true, skipped: false },
      currentFieldRoom: "immigrant-port-inspection-hall",
      fieldReturn: { x: 26.0, y: 5.0, facing: "up" },
    });
    await loadSeededSave(page);
    await expect(page.locator("#immigrantPortInspectionHallTiledCanvas")).toBeVisible();

    await walkTo(page, '[data-npc="port-line-surgeon"]', "caseFieldPlayer");
    await page.keyboard.press("e");
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();

    // Gold rather than outline: "Examine" is the unplayed-mission button. An `activityRoute` of null
    // renders the same control, so the proof that the route took is the screen it lands on.
    const record = bubble.locator(".field-speech-bubble__record");
    await expect(record).toContainText("Medical inspection card");
    await record.click();

    // Mission Instructions — the activity screen's own first state, gated on the per-record
    // `briefed` flag, opening on the giver's portrait and his words.
    await expect(page.locator(".mission-brief")).toBeVisible();
    await expect(page.locator(".mission-brief")).toContainText("Dr. Aurelio Grasso");
    await expect(page.locator(".mission-brief")).toContainText(
      "I have been trying to get an answer to the second one out of Washington since March"
    );
    // Three steps, and the schema caps them at four.
    await expect(page.locator(".mission-brief__steps li")).toHaveCount(3);

    await page.locator('[data-action="mission-briefed"]').click();
    await expect(page.locator("h1")).toHaveText("Six Seconds");
    await expect(page.locator(".activity-assembly-board")).toHaveCount(2);
  });
});

test.describe("the inline interview, out on the wharf", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  // INTERVIEW is the only engine that implements `renderInline()` — its questions are put to people
  // standing on the map, inside the field dialogue bubble, and `render()` is the notebook you come
  // back to. This interview is the first whose speakers span three surfaces, so this is the check
  // that a question chip resolves for somebody who is nowhere near the record it belongs to.
  test("puts the four questions to the purser, and logging is a second move", async ({ page }) => {
    test.setTimeout(120_000);
    await seedProgress(page, {
      currentScreen: "field",
      activeCaseId: "case-019",
      selectedCaseId: "case-019",
      unlocked: ["case-001", "case-019"],
      tutorial: { step: "complete", completed: true, skipped: false },
      activeActivitySourceId: "port-ship-manifest-page",
      // A live interview, not merely a briefed one: liveFieldInterview() requires an activity state
      // that actually exists, which the game creates when the player opens the record. Until then the
      // cast has nothing to be asked, and that gate is deliberate — Case 1.01's playtest found
      // Columbus still holding out question chips after his record had been closed and secured.
      sourceActivities: interviewState([], {}),
    });
    await loadSeededSave(page);
    await expect(page.locator("#immigrantPortTiledCanvas")).toBeVisible();

    await walkTo(page, '[data-npc="port-ships-purser"]', "caseFieldPlayer");
    await page.keyboard.press("e");
    const bubble = page.locator(".field-speech-bubble");
    await expect(bubble).toBeVisible();
    await expect(bubble.locator("[data-question]")).toHaveCount(4);

    // His one useful answer, and the deflection he gives to a question that is not his.
    await bubble.locator('[data-question="who-spoke"]').click();
    await expect(bubble).toContainText("Ask the man who sold the ticket");

    // Heard and written down are two moves. `asked` and `logged` are different lists, and coverage,
    // the notebook and the closer all count the second one — so an answer walked away from buys
    // nothing, which is the whole reason the log control exists.
    await expect(bubble.locator('[data-activity-action="log"]')).toBeVisible();
    await bubble.locator('[data-activity-action="log"]').click();
    const saved = await readProgress(page);
    expect(
      saved.sourceActivities["port-ship-manifest-page"].state.logged["port-ships-purser"]
    ).toEqual(["who-spoke"]);
  });
});
