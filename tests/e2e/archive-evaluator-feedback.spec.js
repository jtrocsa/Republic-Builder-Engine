import { test, expect } from "@playwright/test";
import { seedProgress, loadSeededSave } from "./helpers/progress-seed.js";
import { stubEvaluator } from "./helpers/evaluate-api-stub.js";

/**
 * **The only feedback a student ever reads on their own writing, read in the browser.**
 *
 * Every written response in Chronicle goes to `POST /api/evaluate` and comes back as one blob that
 * `archiveFeedbackMarkup()` renders — on the student's reader, on their Archive Review, and on the
 * teacher's grading screen, which is the same function on purpose so a teacher sees exactly what
 * their student saw. Nothing in the suite had ever produced one: the endpoint does not exist under
 * `npm run dev`, and in production every press costs a real model call. `helpers/evaluate-api-stub.js`
 * is the door, and this is the first look through it.
 *
 * **The evaluator answers in two shapes and only one of them was fit to read.** A HIPP source
 * reading comes back as `elements`, whose enum values are de-underscored before they are printed.
 * Everything else — the Archive Review SAQ, every SAQ and DBQ Archive Challenge, which is to say
 * **every piece of extended writing in the game** — comes back as `rows`, and each row's verdict
 * was printed exactly as the schema writes it for the model: `not_yet`.
 *
 * Under `text-transform: uppercase` a student read **"PART A — NOT_YET"** about their own work.
 * This is `0144`'s defect one line down in the same function: that phase found the teacher's
 * Readiness column printing `needs_fresh_attempt` raw and gave `readinessLabel()` the job of saying
 * it in words — and left the `met` beside it alone, because no fixture in the repository had ever
 * held a rubric row. See decision log `0149`.
 */

/** Three answers, so `saqComplete` is true and the evaluator button is on the screen. */
const SAQ_ANSWERS = {
  0: "Columbus wrote to the Spanish crown that had funded him, so the letter advertises.",
  1: "Maize moved east and raised populations while smallpox moved west and collapsed them.",
  2: "The encomienda tied labor to conquest and set a hierarchy by birth and origin.",
};

const SEED = {
  currentScreen: "review",
  selectedUnitId: "unit-01",
  unlocked: ["case-001", "case-002", "case-003"],
  review: { answers: {}, saq: SAQ_ANSWERS },
  tutorial: { step: "complete", completed: true, skipped: false },
};

function watchForRenderRecovery(page) {
  const recoveries = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("Chronicle render recovery")) {
      recoveries.push(message.text());
    }
  });
  page.on("pageerror", (error) => recoveries.push(`uncaught: ${error.message}`));
  return recoveries;
}

async function askTheEvaluator(page) {
  await page.locator('[data-action="evaluate-saq"]').first().click();
  await expect(page.locator(".archive-feedback")).toBeVisible({ timeout: 20_000 });
}

test.describe("The Archive Evaluator's feedback, as a student reads it", () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test("a rubric row says whether it was met, in words", async ({ page }) => {
    const recoveries = watchForRenderRecovery(page);
    const evaluator = await stubEvaluator(page, { readiness: "ready_to_revise" });

    await seedProgress(page, SEED);
    await loadSeededSave(page);
    await askTheEvaluator(page);

    expect(evaluator.requests.length, "the press did not reach /api/evaluate").toBe(1);
    expect(
      evaluator.requests[0].studentResponse,
      "the request builder dropped a part of the student's answer, so the evaluator graded work " +
        "the student did not submit"
    ).toContain(SAQ_ANSWERS[2]);

    // The headings are `row — met`, both halves of which arrive as database keys. The `met` half is
    // the enum the schema declares for the model: yes | partial | not_yet.
    const headings = await page.$$eval(".archive-feedback-item h3", (nodes) =>
      nodes.map((node) => node.textContent.trim())
    );
    expect(headings.length, "the rows shape rendered nothing at all").toBe(3);
    expect(
      headings.filter((heading) => heading.includes("_")),
      "a student is reading their own rubric in the evaluator's machine words. `not_yet` is not a " +
        "verdict a person says, and it is uppercased on screen, so it reads as a broken value " +
        "rather than as feedback"
    ).toEqual([]);

    // Positively, not only by absence: all three verdicts are on the screen and each says what it
    // means. A fix that blanks the verdict would pass the underscore check above.
    const board = page.locator(".archive-feedback");
    await expect(board, "the met verdict for a row that was met is missing").toContainText("Met");
    await expect(board, "the partial verdict is missing").toContainText("Partial");
    await expect(board, "the unmet verdict is missing").toContainText("Not yet");

    // `readinessLabel()` already did this for the line underneath, in Phase 145. The two now agree.
    await expect(page.locator(".archive-feedback-readiness")).toHaveText("Ready to revise");

    expect(recoveries, `the review screen threw: ${recoveries.join(" | ")}`).toEqual([]);
  });

  test("a rubric row names itself in words too", async ({ page }) => {
    const evaluator = await stubEvaluator(page, { readiness: "on_track" });
    await seedProgress(page, SEED);
    await loadSeededSave(page);
    await askTheEvaluator(page);

    expect(evaluator.requests[0].taskType).toBe("saq");
    const headings = await page.$$eval(".archive-feedback-item h3", (nodes) =>
      nodes.map((node) => node.textContent.trim())
    );
    expect(
      headings.map((heading) => heading.split("—")[0].trim()),
      "an SAQ's three rows are the three parts the student was asked, and the heading is the only " +
        "thing tying a paragraph of feedback to the part it is about"
    ).toEqual(["Part A", "Part B", "Part C"]);
  });

  test("a refusal is a sentence, and the next attempt still works", async ({ page }) => {
    const recoveries = watchForRenderRecovery(page);
    const evaluator = await stubEvaluator(page, {
      fail: { status: 429, error: "The Archive is busy — try again in a moment." },
    });

    await seedProgress(page, SEED);
    await loadSeededSave(page);
    await page.locator('[data-action="evaluate-saq"]').first().click();

    // The only branch a student meets on a bad day, and it had never been rendered either.
    await expect(
      page.locator(".archive-evaluator .feedback.error"),
      "the evaluator failed and said nothing, so the button looks like it did nothing"
    ).toHaveText("The Archive is busy — try again in a moment.");
    await expect(page.locator(".archive-feedback")).toHaveCount(0);

    evaluator.failWith(null);
    await askTheEvaluator(page);
    await expect(
      page.locator(".archive-evaluator .feedback.error"),
      "the refusal from the first attempt is still on screen under the feedback from the second"
    ).toHaveCount(0);

    expect(recoveries, `the review screen threw: ${recoveries.join(" | ")}`).toEqual([]);
  });
});
