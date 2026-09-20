// @vitest-environment jsdom
//
// This file needs a DOM because it imports `main.js`, which touches `document` at module load.
// The suite's default is `node` (vitest.config.js).

import { describe, it, expect } from "vitest";
import { READINESS_LABELS, readinessLabel } from "../../apps/web/src/main.js";
import { RUBRICS } from "../../api/_lib/rubrics.js";

/**
 * **The readiness verdict is written down twice, and now both copies have a reader.**
 *
 * `api/_lib/rubrics.js` declares the three values the evaluator may return, inside the JSON schema
 * it hands the model. `main.js` declares what each one says to a person. Nothing held them
 * together, and the consequence was not hypothetical: the Teacher Dashboard's Submissions table
 * rendered `sub.readiness` raw, so the Readiness column — the one place a teacher reads a whole
 * class at once — said `needs_fresh_attempt` while the grading screen one click away said "Try a
 * fresh attempt" about the same submission.
 *
 * That defect is guarded in the browser by `tests/e2e/teacher-classroom-with-students.spec.js`.
 * This file guards the other direction: a **fourth** verdict added to the schema, which no e2e
 * fixture would think to use and which would reach a teacher as a raw enum on every screen at once.
 *
 * The schema is read through the `RUBRICS` export rather than by parsing the file, because it is
 * genuinely reachable — each rubric carries its own `outputSchema`, and a new rubric with a new
 * verdict is caught by the same loop.
 */

/** Every `readiness` value any rubric's output schema permits, across all four. */
function readinessValuesInSchema() {
  const values = new Set();
  for (const [taskType, rubric] of Object.entries(RUBRICS)) {
    const enumValues = rubric.outputSchema?.properties?.readiness?.enum;
    expect(
      Array.isArray(enumValues),
      `the ${taskType} rubric's output schema no longer declares a readiness enum — either the ` +
        "field was renamed or the schema moved, and this guard is now asking about nothing"
    ).toBe(true);
    for (const value of enumValues) values.add(value);
  }
  return values;
}

describe("a readiness verdict reaches a teacher in words", () => {
  it("every verdict the evaluator may return has a label", () => {
    const schemaValues = readinessValuesInSchema();
    // Anti-vacuity: if the loop above found nothing, everything below passes for free.
    expect(schemaValues.size).toBeGreaterThan(0);

    for (const value of schemaValues) {
      expect(
        READINESS_LABELS[value],
        `the evaluator can return readiness "${value}" and nothing in main.js says what that means ` +
          "to a teacher, so it would be rendered as the raw enum on the grading screen, the review " +
          "screen, the source reader and the dashboard's Readiness column"
      ).toBeTruthy();
    }
  });

  it("no label is a database string", () => {
    const schemaValues = readinessValuesInSchema();
    expect(schemaValues.size).toBeGreaterThan(0);

    for (const value of schemaValues) {
      const label = readinessLabel(value);
      // The whole defect in one assertion: a person's words do not have underscores in them, and
      // the fall-through in `readinessLabel()` returns the raw value, which does.
      expect(
        label,
        `readiness "${value}" is shown to a teacher as a database string`
      ).not.toContain("_");
      expect(label).not.toBe(value);
    }
  });

  it("labels nothing when there is nothing to label, and passes an unknown value through", () => {
    // The Submissions table renders "—" for a submission with no evaluation yet, which depends on
    // an unset verdict coming back falsy rather than as the string "undefined".
    expect(readinessLabel(undefined)).toBe("");
    expect(readinessLabel(null)).toBe("");
    expect(readinessLabel("")).toBe("");
    // An unlabelled verdict is shown raw rather than swallowed. The test above is what stops this
    // branch being reached for a value the schema actually permits.
    expect(readinessLabel("something_new")).toBe("something_new");
  });
});
