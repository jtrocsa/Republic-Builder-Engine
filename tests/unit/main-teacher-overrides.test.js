import { describe, it, expect, beforeEach } from "vitest";
import { resolvedUnitTitle, resolvedUnitCentralQuestion } from "../../apps/web/src/main.js";
import { UNIT_01 } from "../../apps/web/src/content/unit-01-campaign.js";
import { UNIT_02 } from "../../apps/web/src/content/unit-02-campaign.js";
import { setOverride } from "../../apps/web/src/repositories/local-teacher-override-store.js";

beforeEach(() => {
  localStorage.clear();
});

describe("resolvedUnitTitle / resolvedUnitCentralQuestion (main.js wiring)", () => {
  it("renders the official UNIT_01 content when no override is stored", () => {
    expect(resolvedUnitTitle(UNIT_01)).toBe(UNIT_01.title);
    expect(resolvedUnitCentralQuestion(UNIT_01)).toBe(UNIT_01.centralQuestion);
  });

  it("reflects an Author Mode override the moment it's stored, without a page reload", () => {
    setOverride(UNIT_01.id, "title", "Teacher-Edited Title");
    expect(resolvedUnitTitle(UNIT_01)).toBe("Teacher-Edited Title");
    // The sibling field is untouched.
    expect(resolvedUnitCentralQuestion(UNIT_01)).toBe(UNIT_01.centralQuestion);
  });

  it("does not let a UNIT_01 override leak into UNIT_02's rendering", () => {
    setOverride(UNIT_01.id, "title", "Teacher-Edited Unit 1 Title");
    expect(resolvedUnitTitle(UNIT_02)).toBe(UNIT_02.title);
  });
});
