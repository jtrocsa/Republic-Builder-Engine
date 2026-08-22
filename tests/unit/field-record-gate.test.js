// A locked record must not be openable — on every map, by every route into it.
//
// `sourceAvailability()` has had its own tests since Phase 70 and they all pass. What nothing
// tested was whether anything *enforced* the answer. Spine Review Part 6 found that nothing much
// did: the rule was checked by a `caseId === "case-001" && !hasEvidence("case-001",
// "taino-context")` literal duplicated at the two places a record opens, so six of the seven maps
// declared the gate in content and none of them applied it.
//
// The gap hid behind a coincidence. `fieldSourceSignal()` renders no world marker at all for a
// locked record, so the click path's copy of the literal was unreachable — there is no button to
// click — and that made the whole thing look covered. But `E` goes through
// `nearestFieldInteraction()`, which offers a record whether it has a marker or not. Exactly one
// record outside Unit 1 is both locked and object-anchored rather than carried by a person, and it
// opened: Richmond's price board.
//
// Two halves below, because the bug had two halves. The first is that the content declares the same
// gate uniformly across all seven maps, which is what makes a single enforcement point sufficient.
// The second is that there is a single enforcement point.

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { sourceAvailability } from "../../apps/web/src/main.js";

// Same resolution field-map-coordinates.test.js uses — a bare `new URL(..., import.meta.url)`
// throws on a Windows drive letter under vitest.
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const MAIN = readFileSync(path.join(REPO_ROOT, "apps/web/src/main.js"), "utf8");

/** Stands in for hasEvidence(caseId, sourceId) over a fixed set of secured records. */
const secured = (...ids) => {
  const set = new Set(ids);
  return (_caseId, sourceId) => set.has(sourceId);
};

// Every gate in the game, one row per map. `source-availability.test.js` covers Units 1 and 2 in
// depth — their behaviour under partial evidence, a gate that must never lock its own key, a record
// held before its prerequisite. This is the breadth pass: the same shape, all seven.
const GATES = [
  { map: "Caribbean", caseId: "case-001", locked: "columbus-letter", needs: "taino-context" },
  { map: "Caribbean", caseId: "case-001", locked: "waldseemuller-map", needs: "taino-context" },
  { map: "Riverbend", caseId: "case-004", locked: "riverbend-letter", needs: "riverbend-charter" },
  {
    map: "Canal Crossroads",
    caseId: "case-010",
    locked: "canal-time-book",
    needs: "canal-toll-receipt",
  },
  {
    map: "Richmond",
    caseId: "case-013",
    locked: "richmond-price-board",
    needs: "richmond-impressment-order",
  },
  {
    map: "Cottonwood Junction",
    caseId: "case-016",
    locked: "railhead-survey-field-book",
    needs: "railhead-land-office-receipt",
  },
  {
    map: "Ellis Island",
    caseId: "case-019",
    locked: "port-special-inquiry-minute",
    needs: "port-ship-manifest-page",
  },
];

describe("every map's record gate", () => {
  it.each(GATES)(
    "$map locks $locked until $needs is secured (normal case)",
    ({ caseId, locked, needs }) => {
      expect(sourceAvailability(caseId, locked, secured())).toBe("locked");
      expect(sourceAvailability(caseId, locked, secured(needs))).toBe("available");
    }
  );

  it("gates one record per map, never the record that opens it (edge case)", () => {
    // A gate that locks its own key strands the case with no way in. Six maps declare exactly one
    // gate; the Caribbean declares two, both behind the same village observation.
    for (const { caseId, needs } of GATES) {
      expect(sourceAvailability(caseId, needs, secured())).toBe("available");
    }
  });
});

describe("the field runtime's enforcement of that gate", () => {
  it("names no case id in its record gate (normal case)", () => {
    // Phase 70 replaced `sourceAvailability()`'s own `caseId === "case-001"` branch with the
    // `requiresSourceId` field the record carries, and CLAUDE.md's engine/content rule is that when
    // a second case needs the behaviour a literal hard-codes for the first, it becomes data rather
    // than a second literal. Both enforcement copies were left behind at the time. If this string
    // comes back, so has the bug.
    expect(MAIN).not.toContain('hasEvidence("case-001", "taino-context")');
  });

  it("routes both ways into a record through one refusal (normal case)", () => {
    // A record can be opened from its world marker, from the person carrying it, or with `E`. The
    // click actions and the keydown branch are the two that start a *new* one from the map, and
    // both have to ask. A third entry point is the regression this guards: if this count moves,
    // make the new path consult sourceAvailability() before it opens anything.
    const calls = MAIN.match(/refuseLockedRecord\(/g) || [];
    expect(calls, "one definition plus the two world entry points").toHaveLength(3);
  });

  it("opens a record in exactly one place per outcome (normal case)", () => {
    // The two helpers exist because the three call sites had drifted: `E` on an already-secured
    // record set `activeActivitySourceId`, re-pinning its finished mission as the Mission Tracker's
    // in-flight block, where clicking the same marker does not. Duplication is what let the gate
    // exist on one path and not the other, so the count is the thing worth holding.
    expect(MAIN.match(/function beginFieldRecord\(/g) || []).toHaveLength(1);
    expect(MAIN.match(/function openFieldRecord\(/g) || []).toHaveLength(1);
    // `investigation-continue` is the third and is deliberately not one of these: it resumes a
    // record already opened and already past the gate, rather than starting one from the map.
    const intoActivity = MAIN.match(/currentScreen = sourceEntryScreen\(/g) || [];
    expect(intoActivity, "beginFieldRecord, plus investigation-continue").toHaveLength(2);
  });
});
