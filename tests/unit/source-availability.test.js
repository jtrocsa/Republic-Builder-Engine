// The one gate that decides whether a record can be pursued yet.
//
// Why this is worth a test of its own: the rule used to live inline inside `fieldSourceSignal()` as
// an early `return ""`, so it was the world marker's private business. Phase 56 added a second
// reader — the objective tracker, which has to grey out a locked row — and two readers deriving the
// same rule separately is how a checklist ends up disagreeing with the map about what is reachable.
// One function, both readers, and these cases pin its shape.

import { describe, expect, it } from "vitest";

import { sourceAvailability } from "../../apps/web/src/main.js";

/** Stands in for hasEvidence(caseId, sourceId) over a fixed set of secured records. */
const secured = (...ids) => {
  const set = new Set(ids);
  return (_caseId, sourceId) => set.has(sourceId);
};

describe("sourceAvailability", () => {
  it("reports a record the player already holds as secured (normal case)", () => {
    expect(sourceAvailability("case-001", "columbus-letter", secured("columbus-letter"))).toBe(
      "secured"
    );
  });

  it("locks the rest of Case 1.01 until the village has been observed (normal case)", () => {
    const none = secured();
    expect(sourceAvailability("case-001", "columbus-letter", none)).toBe("locked");
    expect(sourceAvailability("case-001", "waldseemuller-map", none)).toBe("locked");
  });

  it("leaves the village observation itself available from the start (edge case)", () => {
    // The gate must never lock its own key. If it did, Case 1.01 would be unenterable.
    expect(sourceAvailability("case-001", "taino-context", secured())).toBe("available");
  });

  it("opens the rest of Case 1.01 once the village is observed (normal case)", () => {
    const done = secured("taino-context");
    expect(sourceAvailability("case-001", "columbus-letter", done)).toBe("available");
    expect(sourceAvailability("case-001", "taino-context", done)).toBe("secured");
  });

  it("gates nothing on any other case (edge case)", () => {
    // Only Case 1.01 has a within-case order. Every other case's records are all reachable on
    // arrival, and a stray gate there would strand a student with no way to make progress.
    for (const caseId of ["case-004", "case-007"]) {
      expect(sourceAvailability(caseId, "riverbend-charter", secured())).toBe("available");
      expect(sourceAvailability(caseId, "commoncause-henry-speech", secured())).toBe("available");
    }
  });
});
