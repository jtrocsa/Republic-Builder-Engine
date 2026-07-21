import { describe, it, expect } from "vitest";
import { sourcesForCase, sourceById } from "../../apps/web/src/main.js";
import { CASE_001_SOURCES } from "../../apps/web/src/content/unit-01-campaign.js";

// Deliberately uses the real remote-content-selection-repository.js (no
// mocking) — its resolution cache is empty unless loadSelectionsForResolution
// has been called for an active classroom, which nothing in this test does.
// That's the actual guarantee worth pinning: with no classroom/customization
// active (every existing test, every signed-out/local-dev session), Teacher
// Mode's swap resolution must be a no-op, so official content renders
// byte-identical to before this feature existed. Swap-in-progress behavior
// (id-pinning, alternate lookup) is covered directly against
// remote-content-selection-repository.js's resolveSourceSlot/resolveMcqQuestSlot.
describe("sourcesForCase / sourceById (Teacher Mode resolution wiring)", () => {
  it("returns official Case 1.01 sources unchanged when no classroom customization is active", () => {
    expect(sourcesForCase("case-001")).toEqual(CASE_001_SOURCES);
  });

  it("returns the official source by id unchanged when no classroom customization is active", () => {
    const official = CASE_001_SOURCES.find((s) => s.id === "taino-context");
    expect(sourceById("taino-context")).toEqual(official);
  });

  it("returns undefined for an unknown source id, same as before Teacher Mode existed", () => {
    expect(sourceById("not-a-real-source")).toBeUndefined();
  });
});
