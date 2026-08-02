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

  it("gates nothing that does not ask to be gated (edge case)", () => {
    // Most records are reachable on arrival, and a stray gate would strand a student with no way to
    // make progress. Both records named here are the first thing a player reaches on their map.
    for (const caseId of ["case-004", "case-007"]) {
      expect(sourceAvailability(caseId, "riverbend-charter", secured())).toBe("available");
      expect(sourceAvailability(caseId, "commoncause-henry-speech", secured())).toBe("available");
    }
  });

  // Phase 70 replaced the `caseId === "case-001"` literal above with a `requiresSourceId` field the
  // record itself carries, because Riverbend needed the same gate and a second hard-coded case id
  // would have deepened one of the engine/content-boundary violations CLAUDE.md names. The four
  // cases above are the proof that Case 1.01's behaviour is unchanged by that; these are the second
  // consumer. See decision log 0053.

  it("locks Frethorne's audit until the charter interview is secured (normal case)", () => {
    // The DISCREPANCY on riverbend-letter builds its evidence column out of interviewTokens(), so
    // reaching it first opens an audit with nothing to audit against.
    expect(sourceAvailability("case-004", "riverbend-letter", secured())).toBe("locked");
    expect(sourceAvailability("case-004", "riverbend-letter", secured("riverbend-charter"))).toBe(
      "available"
    );
  });

  it("leaves Riverbend's other two records open from the start (edge case)", () => {
    // Unlike Case 1.01, Riverbend gates only the record that needs the evidence. The ledger's TRACE
    // works cold — a player who walks to the wharf first is not stopped, they simply get less out
    // of its first leg.
    const none = secured();
    expect(sourceAvailability("case-004", "riverbend-charter", none)).toBe("available");
    expect(sourceAvailability("case-004", "riverbend-ledger", none)).toBe("available");
  });

  it("reports a gated record the player already holds as secured (edge case)", () => {
    // Order matters inside the function: the secured check runs before the gate, so a save that
    // somehow holds the letter without the charter still reads as secured rather than locked.
    expect(sourceAvailability("case-004", "riverbend-letter", secured("riverbend-letter"))).toBe(
      "secured"
    );
  });
});
