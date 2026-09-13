import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initialTeacherUiState, initialContentUiState } from "../../apps/web/src/main.js";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MAIN_JS_LINES = readFileSync(path.join(REPO_ROOT, "apps/web/src/main.js"), "utf8").split(
  "\n"
);

/**
 * The defect this file exists for: `teacherUiState` and `contentUiState` were each written in more
 * than one place, as separate hand-typed object literals, and they drifted.
 *
 * The sign-out handler's copy of `teacherUiState` omitted `sourcePoolLoadingUnits`,
 * `sourcesPreviewKeys` and `sourcesFullTextKeys` — all three `Set`s — so signing out and back in
 * within a single page session left five `.has(...)` calls reading `undefined`, three of them on a
 * render path. Its copy of `contentUiState` dropped four real fields and invented two
 * (`slots`, `additionSlots`) that exist nowhere else in the file.
 *
 * **Neither showed up as an error**, because `render()` catches any renderer exception and turns it
 * into the generic "Archive display recovered from a render issue" screen. That catch is a real
 * safety net and is staying, which is exactly why the shape has to be asserted here instead.
 */
describe("one object, one shape", () => {
  // Asserting the key set against a hard-coded list would just restate the factory. What actually
  // failed was a *second producer*, so that is what is forbidden: every whole-object assignment to
  // either name must go through its factory.
  describe("nothing builds these objects except their factory", () => {
    it.each([
      ["teacherUiState", "initialTeacherUiState"],
      ["contentUiState", "initialContentUiState"],
    ])("%s is only ever assigned from %s()", (stateName, factoryName) => {
      // `==` and `===` are comparisons, not assignments, so the character after `=` must not be
      // another `=`. A `let X = ...` declaration is an assignment like any other here.
      const pattern = new RegExp(`\\b${stateName}\\s*=[^=]`);
      const assignments = MAIN_JS_LINES.map((line, i) => ({
        line: line.trim(),
        lineNumber: i + 1,
      })).filter(({ line }) => pattern.test(line));

      expect(
        assignments.length,
        `expected at least the declaration and the sign-out reset to assign ${stateName}`
      ).toBeGreaterThanOrEqual(2);

      for (const { line, lineNumber } of assignments) {
        expect(
          line.includes(`${factoryName}()`),
          `main.js:${lineNumber} assigns ${stateName} without calling ${factoryName}():\n` +
            `    ${line}\n` +
            `A second hand-written literal is how this object's shape drifted. The sign-out copy ` +
            `silently dropped three Sets; every .has() on them then threw inside render(), which ` +
            `swallowed the TypeError into the recovery screen and showed the teacher nothing. ` +
            `Build it from the factory and spread any overrides on top.`
        ).toBe(true);
      }
    });
  });

  // The other way a factory can be wrong: returning a shared object, so sign-out hands back the
  // same Sets the signed-out teacher was using rather than empty ones.
  describe("each call returns independent state", () => {
    it("initialTeacherUiState() does not share its Sets between calls", () => {
      const a = initialTeacherUiState();
      const b = initialTeacherUiState();
      expect(a).not.toBe(b);
      for (const key of [
        "sourcePoolLoadingUnits",
        "sourcesPreviewKeys",
        "sourcesFullTextKeys",
        "gradedEvaluationIds",
      ]) {
        expect(a[key], `${key} is missing from initialTeacherUiState()`).toBeInstanceOf(Set);
        expect(
          a[key],
          `${key} is shared between calls, so signing out hands back the previous teacher's Set ` +
            `instead of an empty one`
        ).not.toBe(b[key]);
      }
    });

    it("initialContentUiState() does not share its object between calls", () => {
      const a = initialContentUiState();
      const b = initialContentUiState();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  // The three Sets are named individually because they are the ones that were dropped, and because
  // a `.has()` on an absent one is the exact crash. The rest of the shape is covered by the
  // single-producer rule above.
  describe("the fields the sign-out copy had dropped", () => {
    it("teacher state carries all three source-pool Sets", () => {
      expect(Object.keys(initialTeacherUiState())).toEqual(
        expect.arrayContaining([
          "sourcePoolLoadingUnits",
          "sourcesPreviewKeys",
          "sourcesFullTextKeys",
        ])
      );
    });

    it("content state carries all four fields, and neither of the two invented ones", () => {
      const state = initialContentUiState();
      expect(Object.keys(state)).toEqual(
        expect.arrayContaining([
          "slot",
          "successMessage",
          "lastActionFailed",
          "draftSavedSincePublish",
        ])
      );
      // `slots` and `additionSlots` were only ever written by the sign-out reset and read by
      // nothing. If they come back, something has copied that literal forward again.
      expect(state).not.toHaveProperty("slots");
      expect(state).not.toHaveProperty("additionSlots");
    });
  });
});
