import { describe, expect, it } from "vitest";
import {
  buildCodexEntry,
  codexByUnit,
  codexCrossReferences,
  codexEntries,
  codexSeeAlso,
  codexStats,
} from "../../apps/web/src/engine/codex-archive.js";

const entry = (overrides = {}) =>
  buildCodexEntry({
    activityId: "a1",
    kind: "interview",
    title: "A Record",
    unitId: "unit-01",
    unitLabel: "Unit 1",
    caseId: "case-001",
    caseLabel: "Case 1.01",
    summary: "It said something.",
    tags: ["Whose account is this"],
    filedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  });

describe("buildCodexEntry", () => {
  it("refuses a descriptor with no activity id, because that is the key", () => {
    expect(buildCodexEntry({ title: "Nameless" })).toBeNull();
    expect(buildCodexEntry()).toBeNull();
  });

  it("normalizes every list field, so a renderer never has to guard", () => {
    const built = buildCodexEntry({ activityId: "a1" });
    expect(built.evidence).toEqual([]);
    expect(built.openQuestions).toEqual([]);
    expect(built.tags).toEqual([]);
    expect(built.seeAlso).toEqual([]);
  });

  it("normalizes missing strings to empty rather than undefined", () => {
    const built = buildCodexEntry({ activityId: "a1" });
    expect(built.caseLabel).toBe("");
    expect(built.missionQuestion).toBe("");
    expect(built.supported).toBe(false);
  });

  it("drops falsy members of a list — an absent openQuestion is not a blank bullet", () => {
    const built = buildCodexEntry({
      activityId: "a1",
      openQuestions: ["one", "", null, "two"],
    });
    expect(built.openQuestions).toEqual(["one", "two"]);
  });

  it("keeps evidence as authored, because the entry is a snapshot not a live view", () => {
    const built = buildCodexEntry({
      activityId: "a1",
      evidence: [{ id: "f1", text: "The child names three crops.", from: "The child" }],
    });
    expect(built.evidence).toEqual([
      { id: "f1", text: "The child names three crops.", from: "The child" },
    ]);
  });
});

describe("codexEntries", () => {
  it("returns filed records oldest first — the archive is a career, not a catalogue", () => {
    const codex = {
      b: entry({ activityId: "b", title: "Second", filedAt: "2026-03-01T00:00:00.000Z" }),
      a: entry({ activityId: "a", title: "First", filedAt: "2026-01-01T00:00:00.000Z" }),
    };
    expect(codexEntries(codex).map((item) => item.title)).toEqual(["First", "Second"]);
  });

  it("breaks a same-timestamp tie on curriculum order, not on title", () => {
    // backfillCodex() files a whole save inside one loop, so every record it writes can carry the
    // same millisecond — a tie is the normal case for a backfilled archive, not an edge one. Title
    // order there is arbitrary and was observed putting a Unit 2 record above a Unit 1 one.
    const stamp = "2026-01-01T00:00:00.000Z";
    const codex = {
      later: entry({
        activityId: "later",
        title: "Antelope",
        unitId: "unit-02",
        caseId: "case-004",
        filedAt: stamp,
      }),
      earlier: entry({
        activityId: "earlier",
        title: "Zebra",
        unitId: "unit-01",
        caseId: "case-001",
        filedAt: stamp,
      }),
    };
    expect(codexEntries(codex).map((item) => item.unitId)).toEqual(["unit-01", "unit-02"]);
  });

  it("falls through to case then activity id when the unit ties too", () => {
    const stamp = "2026-01-01T00:00:00.000Z";
    const codex = {
      b: entry({ activityId: "b", unitId: "unit-01", caseId: "case-001", filedAt: stamp }),
      a: entry({ activityId: "a", unitId: "unit-01", caseId: "case-001", filedAt: stamp }),
    };
    expect(codexEntries(codex).map((item) => item.activityId)).toEqual(["a", "b"]);
  });

  it("still puts a genuinely older record first, whatever unit it came from", () => {
    const codex = {
      unit1later: entry({
        activityId: "unit1later",
        unitId: "unit-01",
        filedAt: "2026-03-01T00:00:00.000Z",
      }),
      unit2earlier: entry({
        activityId: "unit2earlier",
        unitId: "unit-02",
        filedAt: "2026-01-01T00:00:00.000Z",
      }),
    };
    expect(codexEntries(codex).map((item) => item.activityId)).toEqual([
      "unit2earlier",
      "unit1later",
    ]);
  });

  it("survives an empty, absent or malformed codex", () => {
    expect(codexEntries()).toEqual([]);
    expect(codexEntries({})).toEqual([]);
    expect(codexEntries({ junk: null, other: { title: "no id" } })).toEqual([]);
  });
});

describe("codexByUnit", () => {
  it("groups in first-appearance order and carries each unit's label", () => {
    const groups = codexByUnit([
      entry({ activityId: "a", unitId: "unit-01", unitLabel: "Unit 1" }),
      entry({ activityId: "b", unitId: "unit-02", unitLabel: "Unit 2" }),
      entry({ activityId: "c", unitId: "unit-01", unitLabel: "Unit 1" }),
    ]);
    expect(groups.map((group) => group.unitId)).toEqual(["unit-01", "unit-02"]);
    expect(groups[0].entries).toHaveLength(2);
    expect(groups[1].unitLabel).toBe("Unit 2");
  });
});

describe("codexCrossReferences", () => {
  it("ignores a tag only one record carries — that is a label, not a connection", () => {
    const threads = codexCrossReferences([
      entry({ activityId: "a", tags: ["Alone"] }),
      entry({ activityId: "b", tags: ["Also alone"] }),
    ]);
    expect(threads).toEqual([]);
  });

  it("reports a tag two records share", () => {
    const threads = codexCrossReferences([
      entry({ activityId: "a", tags: ["Shared"] }),
      entry({ activityId: "b", tags: ["Shared"] }),
    ]);
    expect(threads).toHaveLength(1);
    expect(threads[0].tag).toBe("Shared");
    expect(threads[0].entries).toHaveLength(2);
  });

  it("marks a thread that spans two units, and only that one", () => {
    const threads = codexCrossReferences([
      entry({ activityId: "a", unitId: "unit-01", tags: ["Across", "Within"] }),
      entry({ activityId: "b", unitId: "unit-01", tags: ["Within"] }),
      entry({ activityId: "c", unitId: "unit-02", tags: ["Across"] }),
    ]);
    expect(threads.find((thread) => thread.tag === "Across").spansUnits).toBe(true);
    expect(threads.find((thread) => thread.tag === "Within").spansUnits).toBe(false);
  });

  it("sorts cross-unit threads first, then by breadth, then alphabetically", () => {
    const threads = codexCrossReferences([
      entry({ activityId: "a", unitId: "unit-01", tags: ["Zulu", "Alpha", "Bravo"] }),
      entry({ activityId: "b", unitId: "unit-01", tags: ["Zulu", "Alpha", "Bravo"] }),
      entry({ activityId: "c", unitId: "unit-01", tags: ["Alpha"] }),
      entry({ activityId: "d", unitId: "unit-02", tags: ["Zulu"] }),
    ]);
    // Zulu spans units; Alpha has three records to Bravo's two; Bravo last.
    expect(threads.map((thread) => thread.tag)).toEqual(["Zulu", "Alpha", "Bravo"]);
  });
});

describe("codexSeeAlso", () => {
  it("resolves only against records the player has actually filed", () => {
    const a = entry({ activityId: "a", seeAlso: ["b", "unfiled"] });
    const b = entry({ activityId: "b", title: "The Other One" });
    expect(codexSeeAlso(a, [a, b]).map((item) => item.title)).toEqual(["The Other One"]);
  });

  it("never points a record at itself", () => {
    const a = entry({ activityId: "a", seeAlso: ["a"] });
    expect(codexSeeAlso(a, [a])).toEqual([]);
  });

  it("returns nothing for a record that declares no pointers", () => {
    expect(codexSeeAlso(entry(), [entry()])).toEqual([]);
    expect(codexSeeAlso(null, [])).toEqual([]);
  });
});

describe("codexStats", () => {
  it("counts records, distinct units, and threads worth naming", () => {
    const stats = codexStats([
      entry({ activityId: "a", unitId: "unit-01", tags: ["Shared", "Solo"] }),
      entry({ activityId: "b", unitId: "unit-02", tags: ["Shared"] }),
    ]);
    expect(stats).toEqual({ records: 2, units: 2, threads: 1 });
  });

  it("is all zeroes for an empty archive", () => {
    expect(codexStats()).toEqual({ records: 0, units: 0, threads: 0 });
  });
});
