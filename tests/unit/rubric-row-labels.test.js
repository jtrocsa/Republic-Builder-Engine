// @vitest-environment jsdom
//
// This file needs a DOM because it imports `main.js`, which touches `document` at module load.
// The suite's default is `node` (vitest.config.js).

import { describe, it, expect } from "vitest";
import {
  RUBRIC_ROW_LABELS,
  RUBRIC_MET_LABELS,
  rubricRowLabel,
  rubricMetLabel,
} from "../../apps/web/src/main.js";
import { RUBRICS } from "../../api/_lib/rubrics.js";

/**
 * **The evaluator's payload carries three enums and all three reach a reader.**
 *
 * `readiness-label.test.js` holds the first of them together. This holds the other two, for the
 * same reason and against the same file: `api/_lib/rubrics.js` declares a rubric's rows and the
 * three verdicts a row can carry inside the JSON schema it hands the model, and
 * `archiveFeedbackMarkup()` prints both into one heading — on the student's reader, on their
 * Archive Review, and on the teacher's grading screen.
 *
 * It printed them raw. `not_yet` reached a student about their own writing, uppercased by the
 * stylesheet into **"PART A — NOT_YET"**, and every extended written task in the game answers in
 * this shape — the Archive Review SAQ of all nine units, plus every SAQ and DBQ Archive Challenge.
 * Only the HIPP branch beside it had ever been translated. See decision log `0149`.
 *
 * The schema is read through the `RUBRICS` export rather than by parsing the file, so a **new DBQ
 * row** — the change most likely to happen here, since the DBQ rubric is the one that grows — is
 * caught before it reaches a screen as a column name.
 */

/** Every rubric that answers in the `rows` shape, which is every one except HIPP's. */
function rowRubrics() {
  return Object.entries(RUBRICS).filter(([, rubric]) => rubric.outputSchema?.properties?.rows);
}

function enumFor(taskType, rubric, field) {
  const node = rubric.outputSchema.properties.rows?.items?.properties?.[field];
  expect(
    Array.isArray(node?.enum),
    `the ${taskType} rubric's output schema no longer declares a "${field}" enum — either the ` +
      "field was renamed or the schema moved, and this guard is now asking about nothing"
  ).toBe(true);
  return node.enum;
}

describe("a rubric row is read by a student, not by a model", () => {
  it("has a rows shape to ask about at all", () => {
    expect(
      rowRubrics().map(([taskType]) => taskType),
      "no rubric answers in the rows shape any more, so either the schemas changed shape or this " +
        "guard is pointed at the wrong export"
    ).toEqual(["saq", "leq", "dbq"]);
  });

  it.each(rowRubrics())("%s: every row the schema can return has a name", (taskType, rubric) => {
    for (const row of enumFor(taskType, rubric, "row")) {
      expect(
        RUBRIC_ROW_LABELS[row],
        `the ${taskType} rubric can return the row "${row}" and nothing says what it is called, so ` +
          "a student reads the column name where the name of an AP rubric row belongs"
      ).toBeTruthy();
    }
  });

  it.each(rowRubrics())("%s: every verdict the schema can return is a word", (taskType, rubric) => {
    for (const met of enumFor(taskType, rubric, "met")) {
      const label = rubricMetLabel(met);
      expect(
        RUBRIC_MET_LABELS[met],
        `the ${taskType} rubric can say "${met}" about a row and nothing translates it, so that is ` +
          "what the student is told about their own writing"
      ).toBeTruthy();
      expect(
        label.includes("_"),
        `"${label}" still has an underscore in it, which means it is still the schema's word and ` +
          "not a person's"
      ).toBe(false);
    }
  });

  it("says something for a row and a verdict it has never seen", () => {
    // The fall-through exists for the same reason readinessLabel()'s does: an unlabelled heading is
    // worse than an ugly one. The guards above are what keep it out of reach.
    expect(rubricRowLabel("brand-new-row")).toBe("brand new row");
    expect(rubricMetLabel("maybe")).toBe("maybe");
    expect(rubricRowLabel("")).toBe("");
    expect(rubricMetLabel(undefined)).toBe("");
  });

  it("labels nothing the schemas cannot return", () => {
    const declared = new Set();
    for (const [taskType, rubric] of rowRubrics()) {
      for (const row of enumFor(taskType, rubric, "row")) declared.add(row);
    }
    expect(
      Object.keys(RUBRIC_ROW_LABELS).filter((row) => !declared.has(row)),
      "a label for a row no rubric can return is a row that was removed from the schema and left " +
        "behind here, which reads as though the game still supports it"
    ).toEqual([]);
  });
});
