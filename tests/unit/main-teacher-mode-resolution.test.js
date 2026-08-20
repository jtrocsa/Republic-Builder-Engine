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
// remote-content-selection-repository.js's resolveSourceSlot/resolveQuestSlot.
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

  // The regression this exists for: `sourceById` was a hand-written chain of five
  // `CASE_0NN_SOURCES.find` calls, and Unit 6 was never added to it. From Phase 85 until Phase 87
  // every record on the railhead was unresolvable — and nothing failed loudly, because the field
  // draws its markers and its "Examine →" buttons from `activeFieldMap().sourcePoints`, a different
  // table entirely. All seven looked present; pressing one landed on "Nothing open."
  //
  // Checked through `sourcesForCase` rather than against a list of unit modules, so a seventh unit
  // is covered the moment its array is registered in UNIT_SOURCES — which is the same thing the
  // implementation now reads.
  it.each(["case-001", "case-004", "case-007", "case-010", "case-013", "case-016"])(
    "resolves every one of %s's sources by id",
    (caseId) => {
      const sources = sourcesForCase(caseId);
      expect(sources.length, `${caseId} has no sources`).toBeGreaterThan(0);
      const unresolvable = sources.map((s) => s.id).filter((id) => !sourceById(id));
      expect(unresolvable, `${caseId} has records no screen could open`).toEqual([]);
    }
  );
});
