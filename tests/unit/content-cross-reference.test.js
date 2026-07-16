import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  runSchema,
  checkUniqueGlobalIds,
  checkChallengeReferences,
} from "../../apps/web/src/content/schemas/cross-reference.js";

describe("runSchema", () => {
  const ItemSchema = z.object({ id: z.string().min(1) });
  const ListSchema = z.array(ItemSchema);

  it("returns no errors for valid data (normal case)", () => {
    const result = runSchema("test-group", ListSchema, [{ id: "a" }]);
    expect(result.errors).toEqual([]);
  });

  it("attaches the offending item's id to the error when derivable (missing required ID)", () => {
    const result = runSchema("test-group", ListSchema, [{ id: "" }]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].group).toBe("test-group");
    expect(result.errors[0].path).toBe("0.id");
  });
});

describe("checkUniqueGlobalIds", () => {
  it("finds no errors when every id across every group is unique (normal case)", () => {
    const errors = checkUniqueGlobalIds("test", [
      { source: "fileA", items: [{ id: "case-001" }] },
      { source: "fileB", items: [{ id: "case-004" }] },
    ]);
    expect(errors).toEqual([]);
  });

  it("flags an id that appears in two different groups (duplicate ID / missing cross-reference integrity)", () => {
    const errors = checkUniqueGlobalIds("test", [
      { source: "fileA", items: [{ id: "case-001" }] },
      { source: "fileB", items: [{ id: "case-001" }] },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].id).toBe("case-001");
    expect(errors[0].message).toContain("fileA");
  });

  it("also flags a duplicate within a single group's own items (boundary case)", () => {
    // checkUniqueGlobalIds scans one flat id-space across everything it's
    // given; per-array duplicate checks additionally exist inside the
    // relevant Zod schemas (see unit.schema.js) so that error surfaces
    // even when only one content file is validated in isolation.
    const errors = checkUniqueGlobalIds("test", [
      { source: "fileA", items: [{ id: "x" }, { id: "x" }] },
    ]);
    expect(errors).toHaveLength(1);
    expect(errors[0].id).toBe("x");
  });
});

describe("checkChallengeReferences", () => {
  const QUEST_TYPE_KEYS = ["mcq", "evidence-organizing"];
  const QUESTS_BY_TYPE = {
    mcq: new Set(["mcq-1"]),
    "evidence-organizing": new Set(["evorg-1"]),
  };

  it("finds no errors for a pointer with a known type and a real quest id (normal case)", () => {
    const errors = checkChallengeReferences(
      "test",
      [{ source: "fileA", path: "x", questType: "mcq", questId: "mcq-1" }],
      QUEST_TYPE_KEYS,
      QUESTS_BY_TYPE
    );
    expect(errors).toEqual([]);
  });

  it("finds no errors for an ungated pointer (both questType and questId null, normal case)", () => {
    const errors = checkChallengeReferences(
      "test",
      [{ source: "fileA", path: "x", questType: null, questId: null }],
      QUEST_TYPE_KEYS,
      QUESTS_BY_TYPE
    );
    expect(errors).toEqual([]);
  });

  it("flags an unknown questType (invalid data)", () => {
    const errors = checkChallengeReferences(
      "test",
      [{ source: "fileA", path: "x", questType: "not-a-real-type", questId: "mcq-1" }],
      QUEST_TYPE_KEYS,
      QUESTS_BY_TYPE
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("not-a-real-type");
    expect(errors[0].message).toContain("mcq");
  });

  it("flags a questId that doesn't resolve within its questType's content (dangling reference)", () => {
    const errors = checkChallengeReferences(
      "test",
      [{ source: "fileA", path: "x", questType: "mcq", questId: "mcq-does-not-exist" }],
      QUEST_TYPE_KEYS,
      QUESTS_BY_TYPE
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].id).toBe("mcq-does-not-exist");
  });

  it("flags a questId that exists but under the wrong questType (boundary case)", () => {
    const errors = checkChallengeReferences(
      "test",
      [{ source: "fileA", path: "x", questType: "mcq", questId: "evorg-1" }],
      QUEST_TYPE_KEYS,
      QUESTS_BY_TYPE
    );
    expect(errors).toHaveLength(1);
  });

  it("flags questType set without a matching questId (missing/incomplete pair)", () => {
    const errors = checkChallengeReferences(
      "test",
      [{ source: "fileA", path: "x", questType: "mcq", questId: null }],
      QUEST_TYPE_KEYS,
      QUESTS_BY_TYPE
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain("must both be set together");
  });

  it("flags questId set without a matching questType (missing/incomplete pair)", () => {
    const errors = checkChallengeReferences(
      "test",
      [{ source: "fileA", path: "x", questType: null, questId: "mcq-1" }],
      QUEST_TYPE_KEYS,
      QUESTS_BY_TYPE
    );
    expect(errors).toHaveLength(1);
    expect(errors[0].id).toBe("mcq-1");
  });
});
