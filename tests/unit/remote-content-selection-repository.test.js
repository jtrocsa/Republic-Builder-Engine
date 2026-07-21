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
  resolveMcqQuestSlot,
  loadSelectionsForResolution,
  clearResolutionCache,
  alternativesForSourceSlot,
  alternativesForMcqSlot,
} from "../../apps/web/src/repositories/remote-content-selection-repository.js";

beforeEach(() => {
  clearResolutionCache();
  fromResult = { data: [], error: null };
});

describe("resolveSourceSlot / resolveMcqQuestSlot", () => {
  it("returns the official source unchanged when no classroom/selection is active", () => {
    const official = { id: "taino-context", title: "Official" };
    expect(resolveSourceSlot(official)).toBe(official);
  });

  it("returns the official quest unchanged when no classroom/selection is active", () => {
    const official = { id: "case-001-mcq-taino-sourcing", prompt: "Official prompt" };
    expect(resolveMcqQuestSlot(official)).toBe(official);
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
          slot_kind: "mcq-quest",
          slot_content_id: "case-001-mcq-taino-sourcing",
          alt_content_id: "case-001-mcq-taino-sourcing-alt-authorship",
        },
      ],
      error: null,
    };
    await loadSelectionsForResolution("classroom-1", "published");

    const official = { id: "case-001-mcq-taino-sourcing", prompt: "Official prompt" };
    const resolved = resolveMcqQuestSlot(official);
    expect(resolved.id).toBe("case-001-mcq-taino-sourcing");
    expect(resolved.prompt).not.toBe("Official prompt");
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

describe("alternativesForSourceSlot / alternativesForMcqSlot", () => {
  it("lists curated alternatives for a known slot", () => {
    expect(alternativesForSourceSlot("taino-context").length).toBeGreaterThan(0);
    expect(alternativesForMcqSlot("case-001-mcq-taino-sourcing").length).toBeGreaterThan(0);
  });

  it("returns an empty list for a slot with no curated alternatives", () => {
    expect(alternativesForSourceSlot("nonexistent-slot")).toEqual([]);
    expect(alternativesForMcqSlot("nonexistent-slot")).toEqual([]);
  });
});
