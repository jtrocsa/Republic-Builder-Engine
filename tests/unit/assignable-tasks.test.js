// @vitest-environment jsdom
//
// This file needs a DOM because it imports `main.js`, which touches `document` at module load.
// The suite's default is `node` (vitest.config.js).

import { describe, it, expect } from "vitest";
import {
  assignableTasks,
  assignableTaskFor,
  sourcesForCase,
  unitReviewFor,
  UNITS,
} from "../../apps/web/src/main.js";
import {
  buildHippEvaluationRequest,
  buildSaqEvaluationRequest,
  buildSaqQuestEvaluationRequest,
  buildDbqEvaluationRequest,
} from "../../apps/web/src/engine/evaluator-requests.js";

/**
 * **An assignment names a task, and the task has to be one a student can hand in.**
 *
 * `computeAssignmentReport()` matches a submission on `(task_type, task_id)`, and `task_id` used to
 * be a **free-text box** whose placeholder was an Archive Challenge's *quest id* — a string nothing
 * in the game records. A teacher who followed the example got `0/N submitted` forever, with no
 * error and nothing on the screen to say why. See decision log `0150`.
 *
 * So the list is derived now, and this holds it against the **four request builders that actually
 * decide a task id** rather than against a copy of the rule. `evaluator-requests.js` is where a
 * submission's `taskId` is set; if a builder's convention changes and the picker's does not, the
 * assignment a teacher creates silently stops matching, which is the exact defect again.
 */

const tasksByType = (taskType) => assignableTasks().filter((task) => task.taskType === taskType);

describe("every task a teacher can assign is a task a student can submit", () => {
  it("offers something, with one row per id", () => {
    const tasks = assignableTasks();
    expect(
      tasks.length,
      "the picker is empty, so no assignment can be created at all"
    ).toBeGreaterThan(0);
    const ids = tasks.map((task) => task.taskId);
    expect(
      ids.length - new Set(ids).size,
      "two rows in the picker carry the same task id, so one of them is unreachable and which " +
        "assignment a teacher just created depends on which they happened to click"
    ).toBe(0);
    for (const task of tasks) {
      expect(
        task.label,
        `the task ${task.taskId} has no name a teacher could recognise`
      ).toBeTruthy();
    }
  });

  it("only offers types the evaluator has a rubric for", () => {
    // `ASSIGNABLE_TASK_TYPES`'s own comment: offering a type with no quest behind it "would let a
    // teacher create an assignment no submission could ever match". Same rule, asserted from outside.
    expect([...new Set(assignableTasks().map((task) => task.taskType))].sort()).toEqual([
      "dbq",
      "hipp-sourcing",
      "saq",
    ]);
  });

  it("a unit's Archive Review is offered under the id evaluate-saq records", () => {
    const reviewed = UNITS.filter((unit) => unitReviewFor(unit));
    expect(
      reviewed.length,
      "no unit has an authored Archive Review any more, so this guard is asking about nothing"
    ).toBeGreaterThan(0);
    for (const unit of reviewed) {
      const recorded = buildSaqEvaluationRequest(unit, unitReviewFor(unit), {}, null).taskId;
      expect(
        assignableTaskFor("saq", recorded),
        `a student can submit ${unit.id}'s Archive Review as "${recorded}" and no assignment can ` +
          "be created for it"
      ).toBeTruthy();
    }
  });

  it("an Archive Challenge is offered under the id evaluate-written-quest records", () => {
    const written = UNITS.flatMap((unit) =>
      (unit.archiveChallenges || []).filter(
        (challenge) => challenge.questType === "saq" || challenge.questType === "dbq"
      )
    );
    expect(written.length, "no unit declares a written Archive Challenge").toBeGreaterThan(0);
    for (const challenge of written) {
      // Both builders derive the task id from the quest's id alone, which is the whole of the claim
      // here — the prompts and documents are what the evaluator reads, not what the report matches.
      const quest = { id: challenge.questId, prompts: [], documents: [] };
      const recorded =
        challenge.questType === "dbq"
          ? buildDbqEvaluationRequest(quest, "", null).taskId
          : buildSaqQuestEvaluationRequest(quest, {}, null).taskId;
      expect(
        assignableTaskFor(challenge.questType, recorded),
        `a student can submit "${challenge.questId}" as "${recorded}" and no assignment can be ` +
          "created for it"
      ).toBeTruthy();
    }
  });

  it("a written source reading is offered, and a question-based record is not", () => {
    let written = 0;
    for (const unit of UNITS) {
      for (const kase of unit.cases) {
        for (const source of sourcesForCase(kase.id)) {
          const recorded = buildHippEvaluationRequest(source, "", null).taskId;
          if (source.readerQuestType) {
            // Its reader answers multiple-choice questions and never reaches the evaluator, so it
            // can never be submitted — offering it is an assignment that reads 0 forever.
            expect(
              assignableTaskFor("hipp-sourcing", recorded),
              `"${source.title}" answers questions rather than being written about, so nothing a ` +
                "student does with it is ever recorded — it must not be assignable"
            ).toBeUndefined();
            continue;
          }
          written += 1;
          expect(
            assignableTaskFor("hipp-sourcing", recorded),
            `a student can submit a reading of "${source.title}" as "${recorded}" and no ` +
              "assignment can be created for it"
          ).toBeTruthy();
        }
      }
    }
    expect(written, "no source in the game takes a written reading").toBeGreaterThan(0);
    expect(
      tasksByType("hipp-sourcing").length,
      "the picker offers a source reading that no case in the game contains"
    ).toBe(written);
  });

  it("the id the old free-text field suggested is not a task", () => {
    // The literal placeholder, kept as the regression it is: `unit-03-archive-common-cause-saq` is
    // the quest id, and the id a submission carries is `saq-quest-` in front of it.
    expect(assignableTaskFor("saq", "unit-03-archive-common-cause-saq")).toBeUndefined();
    expect(assignableTaskFor("saq", "saq-quest-unit-03-archive-common-cause-saq")).toBeTruthy();
  });
});
