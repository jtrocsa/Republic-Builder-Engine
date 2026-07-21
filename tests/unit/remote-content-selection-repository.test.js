import { describe, it, expect, vi, beforeEach } from "vitest";

// Minimal thenable/chainable stand-in for supabase-js's PostgrestFilterBuilder —
// only the methods remote-content-selection-repository.js actually calls.
// No test in this codebase mocks lib/supabase-client.js directly yet (every
// other remote-*-repository.js is untested against a real/mocked backend);
// this file only exercises the pure resolution-cache logic, which is the
// piece with a correctness guarantee worth locking down (official content
// must resolve unchanged by default).
let fromResult = { data: [], error: null };
function makeQueryBuilder() {
  const builder = {
    select: () => builder,
    eq: () => builder,
    then: (resolve, reject) => Promise.resolve(fromResult).then(resolve, reject),
  };
  return builder;
}

vi.mock("../../apps/web/src/lib/supabase-client.js", () => ({
  supabase: { from: vi.fn(() => makeQueryBuilder()) },
}));

import {
  resolveSourceSlot,
  resolveQuestSlot,
  loadSelectionsForResolution,
  clearResolutionCache,
  alternativesForSourceSlot,
  alternativesForQuestSlot,
} from "../../apps/web/src/repositories/remote-content-selection-repository.js";

beforeEach(() => {
  clearResolutionCache();
  fromResult = { data: [], error: null };
});

describe("resolveSourceSlot / resolveQuestSlot", () => {
  it("returns the official source unchanged when no classroom/selection is active", () => {
    const official = { id: "taino-context", title: "Official" };
    expect(resolveSourceSlot(official)).toBe(official);
  });

  it("returns the official quest unchanged when no classroom/selection is active", () => {
    const official = { id: "case-001-mcq-taino-sourcing", prompt: "Official prompt" };
    expect(resolveQuestSlot("mcq", official)).toBe(official);
  });

  it("swaps in the curated source alternate and re-pins the official id once a published selection is loaded", async () => {
    fromResult = {
      data: [
        { slot_kind: "source", slot_content_id: "taino-context", alt_content_id: "taino-context-alt-encyclopedia" },
      ],
      error: null,
    };
    await loadSelectionsForResolution("classroom-1", "published");

    const official = { id: "taino-context", title: "Official" };
    const resolved = resolveSourceSlot(official);
    expect(resolved.id).toBe("taino-context");
    expect(resolved.title).not.toBe("Official");
  });

  it("swaps in the curated MCQ alternate and re-pins the official id", async () => {
    fromResult = {
      data: [
        {
          slot_kind: "mcq",
          slot_content_id: "case-001-mcq-taino-sourcing",
          alt_content_id: "case-001-mcq-taino-sourcing-alt-authorship",
        },
      ],
      error: null,
    };
    await loadSelectionsForResolution("classroom-1", "published");

    const official = { id: "case-001-mcq-taino-sourcing", prompt: "Official prompt" };
    const resolved = resolveQuestSlot("mcq", official);
    expect(resolved.id).toBe("case-001-mcq-taino-sourcing");
    expect(resolved.prompt).not.toBe("Official prompt");
  });

  it("swaps in a curated alternate for a non-mcq quest type (sequencing), scoped by questType", async () => {
    fromResult = {
      data: [
        {
          slot_kind: "sequencing",
          slot_content_id: "case-001-sequencing-columbian-exchange",
          alt_content_id: "case-001-sequencing-columbian-exchange-alt-labor-and-disease",
        },
      ],
      error: null,
    };
    await loadSelectionsForResolution("classroom-1", "published");

    const official = { id: "case-001-sequencing-columbian-exchange", prompt: "Official prompt" };
    expect(resolveQuestSlot("sequencing", official).prompt).not.toBe("Official prompt");
    // A draft/published row for one quest type must never leak into another
    // type's resolution, even if (hypothetically) the same slot id existed
    // in two types' official content.
    expect(resolveQuestSlot("mcq", official)).toBe(official);
  });

  it("clearResolutionCache resets back to official-only resolution", async () => {
    fromResult = {
      data: [{ slot_kind: "source", slot_content_id: "taino-context", alt_content_id: "taino-context-alt-encyclopedia" }],
      error: null,
    };
    await loadSelectionsForResolution("classroom-1", "published");
    clearResolutionCache();

    const official = { id: "taino-context", title: "Official" };
    expect(resolveSourceSlot(official)).toBe(official);
  });
});

describe("alternativesForSourceSlot / alternativesForQuestSlot", () => {
  it("lists curated alternatives for a known slot", () => {
    expect(alternativesForSourceSlot("taino-context").length).toBeGreaterThan(0);
    expect(alternativesForQuestSlot("mcq", "case-001-mcq-taino-sourcing").length).toBeGreaterThan(0);
    expect(alternativesForQuestSlot("sequencing", "case-001-sequencing-columbian-exchange").length).toBeGreaterThan(
      0
    );
    expect(
      alternativesForQuestSlot("evidence-organizing", "case-001-evidence-record-sourcing").length
    ).toBeGreaterThan(0);
    expect(alternativesForQuestSlot("hipp", "case-001-hipp-columbus-letter").length).toBeGreaterThan(0);
  });

  it("returns an empty list for a slot with no curated alternatives", () => {
    expect(alternativesForSourceSlot("nonexistent-slot")).toEqual([]);
    expect(alternativesForQuestSlot("mcq", "nonexistent-slot")).toEqual([]);
  });
});
